# 系统调优

## ⭐ 面试重点速览

| 考点 | 频率 | 难度 | 考察方式 |
|------|------|------|----------|
| sysctl.conf 内核参数调优 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 常见参数含义，生产环境推荐值 |
| 文件描述符限制（ulimit/limits.conf） | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | 怎么看、怎么改、永久生效 |
| TCP 参数优化（backlog/tw_reuse/buffer） | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 大并发场景参数调优 |
| 内核参数调优最佳实践 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | open_file 场景经验 |
| 内存相关参数（swappiness/overcommit） | ⭐⭐⭐⭐ | ⭐⭐⭐ | swap 使用策略 |

---

## 一、内核参数调优体系

### 1.1 sysctl 三种修改方式

```bash
# 方式一：临时修改（重启失效）
sysctl -w net.core.somaxconn=1024

# 方式二：永久修改（写入配置文件）
echo "net.core.somaxconn=1024" >> /etc/sysctl.conf
sysctl -p    # 立即生效

# 方式三：/etc/sysctl.d/ 分文件管理（推荐）
cat > /etc/sysctl.d/99-custom.conf << EOF
net.core.somaxconn=1024
net.core.netdev_max_backlog=5000
EOF
sysctl --system   # 加载所有配置
```

```bash
# 查看所有参数
sysctl -a                     # 列出所有内核参数
sysctl -a | grep tcp         # 过滤 TCP 相关
sysctl net.ipv4.tcp_keepalive_time  # 查看单个参数
```

::: tip 推荐做法
生产环境建议使用 `/etc/sysctl.d/99-custom.conf` 单独文件管理自定义参数，避免直接修改 `/etc/sysctl.conf`。这样便于版本管理（Git）和跨服务器同步。
:::

---

## 二、文件描述符限制

### 2.1 查看当前限制

```bash
# 查看当前 shell 会话的软限制和硬限制
$ ulimit -n
1024

$ ulimit -Hn    # 硬限制
4096
$ ulimit -Sn    # 软限制
1024

# 查看进程当前使用的文件描述符数量
$ ls /proc/1234/fd | wc -l
2456

# 查看进程的限制
$ cat /proc/1234/limits
Limit                     Soft Limit           Hard Limit           Units
Max open files            1024                 4096                 files
```

### 2.2 永久修改文件描述符限制

```bash
# /etc/security/limits.conf
# 格式：<domain> <type> <item> <value>
*       soft    nofile  65536    # 所有用户软限制
*       hard    nofile  65536    # 所有用户硬限制
root    soft    nofile  65536
root    hard    nofile  65536

# 注意：nofile 修改后需要重新登录才生效
# 检查：ulimit -n

# systemd 服务额外配置（很重要！）
# /etc/systemd/system/myapp.service 中添加：
# LimitNOFILE=65536
# 或在 /etc/systemd/system.conf 中全局设置：
# DefaultLimitNOFILE=65536
```

::: danger 常见陷阱
`/etc/security/limits.conf` 只对 PAM 认证的登录会话生效。systemd 管理的服务不走 PAM，需要在 service 文件或 `/etc/systemd/system.conf` 中单独设置 `LimitNOFILE`。很多同学改了 limits.conf 后发现服务没生效就是这个原因。
:::

### 2.3 系统级文件描述符限制

```bash
# 系统级最大文件描述符数
$ cat /proc/sys/fs/file-max
9223372036854775807

# 当前已分配的文件描述符数量
$ cat /proc/sys/fs/file-nr
3840    0       9223372036854775807
# 格式：已分配 未使用 最大值

# 永久设置
sysctl -w fs.file-max=2097152
echo "fs.file-max=2097152" >> /etc/sysctl.d/99-custom.conf
```

---

## 三、TCP 参数优化

### 3.1 核心参数速查

```bash
# === 连接队列相关 ===
net.core.somaxconn = 65535              # 全连接队列（ESTABLISHED）最大长度
net.core.netdev_max_backlog = 65535     # 网卡接收队列最大长度
net.ipv4.tcp_max_syn_backlog = 65535    # 半连接队列（SYN_RECV）最大长度

# === TIME_WAIT 优化 ===
net.ipv4.tcp_tw_reuse = 1               # 允许复用 TIME_WAIT 的 socket（客户端侧）
net.ipv4.tcp_fin_timeout = 30           # FIN_WAIT_2 超时时间（默认 60s）
net.ipv4.tcp_timestamps = 1             # 启用时间戳（tw_reuse 依赖此选项）

# === Keep-Alive 优化 ===
net.ipv4.tcp_keepalive_time = 600       # 空闲 N 秒后开始探测（默认 7200s = 2h）
net.ipv4.tcp_keepalive_intvl = 30       # 探测间隔（默认 75s）
net.ipv4.tcp_keepalive_probes = 3       # 探测次数（默认 9 次）

# === 缓冲区优化 ===
net.core.rmem_default = 262144           # 默认接收缓冲区
net.core.wmem_default = 262144           # 默认发送缓冲区
net.core.rmem_max = 16777216             # 最大接收缓冲区（16MB）
net.core.wmem_max = 16777216             # 最大发送缓冲区（16MB）
net.ipv4.tcp_rmem = 4096 87380 16777216  # 读缓冲 min/default/max
net.ipv4.tcp_wmem = 4096 65536 16777216  # 写缓冲 min/default/max

# === 快速回收与重用 ===
net.ipv4.tcp_syncookies = 1             # 开启 SYN Cookie（防 SYN Flood）
net.ipv4.tcp_slow_start_after_idle = 0  # 空闲后不重置拥塞窗口
net.ipv4.tcp_fastopen = 3               # 开启 TFO（客户端 + 服务端）
```

### 3.2 应用场景分析

```bash
# 场景一：高并发 HTTP 反向代理（Nginx/HAProxy）
# 重点：连接队列、TIME_WAIT、缓冲区
net.core.somaxconn = 65535
net.ipv4.tcp_max_syn_backlog = 65535
net.ipv4.tcp_tw_reuse = 1
net.ipv4.tcp_fin_timeout = 15
net.ipv4.ip_local_port_range = 1024 65535

# 场景二：数据库服务器（MySQL/PostgreSQL）
# 重点：大缓冲区、Keep-Alive
net.core.rmem_max = 16777216
net.core.wmem_max = 16777216
net.ipv4.tcp_keepalive_time = 120
net.ipv4.tcp_keepalive_intvl = 10
net.ipv4.tcp_keepalive_probes = 3

# 场景三：消息队列（Kafka/RocketMQ）
# 重点：大缓冲区、禁用慢启动
net.core.rmem_max = 33554432
net.core.wmem_max = 33554432
net.ipv4.tcp_slow_start_after_idle = 0
```

### 3.3 连接队列详解

```bash
# 连接队列分为半连接队列和全连接队列
# 半连接队列（SYN Queue）：存储 SYN_RECV 状态的连接
# 全连接队列（Accept Queue）：存储 ESTABLISHED 但未被 accept() 的连接

# 查看全连接队列是否溢出
$ netstat -s | grep "LISTEN"
    12345 times the listen queue of a socket overflowed  # 溢出次数
$ ss -lnt | grep :80
State  Recv-Q Send-Q Local Address:Port
LISTEN 0      128    *:80
# Recv-Q 是当前全连接队列已使用的长度
# Send-Q 是全连接队列最大长度（min(backlog, somaxconn)）
# 如果 Recv-Q 接近 Send-Q，说明 backlog 不够
```

::: warning 连接队列溢出
`Recv-Q` 持续接近 `Send-Q` 说明全连接队列满了，新连接被丢弃（客户端收到 SYN-ACK 后发 ACK 被 RST）。排查：增大 `net.core.somaxconn`，同时增大应用层 backlog 参数（Nginx `listen 80 backlog=65535`）。
:::

---

## 四、内存相关参数

### 4.1 swappiness

```bash
# swappiness 控制内核将内存页换出到 swap 的倾向
# 范围：0 - 100，默认 60
# 0：尽量不用 swap（除非内存严重不足）
# 100：积极使用 swap
$ cat /proc/sys/vm/swappiness
60

# 对于数据库服务器，建议设为 1-10
sysctl -w vm.swappiness=10
echo "vm.swappiness=10" >> /etc/sysctl.d/99-custom.conf
```

### 4.2 overcommit

```bash
# 控制内存过度分配策略
# 0：启发式过度分配（默认）
# 1：总是允许过度分配（允许 malloc 超过物理内存 + swap）
# 2：禁止过度分配（超过 swap + 物理内存 * overcommit_ratio 就拒绝）
$ cat /proc/sys/vm/overcommit_memory
0

# 对于 Java 应用，建议设为 1（避免 mmap 失败）
sysctl -w vm.overcommit_memory=1
echo "vm.overcommit_memory=1" >> /etc/sysctl.d/99-custom.conf
```

### 4.3 dirty page 参数

```bash
# 脏页（dirty page）是内存中已修改但尚未写入磁盘的页面
# 这些参数控制内核何时开始回写脏页

vm.dirty_background_ratio = 5     # 脏页达到 5% 时后台回写
vm.dirty_ratio = 10               # 脏页达到 10% 时阻塞所有写入
vm.dirty_expire_centisecs = 3000  # 脏页超过 30 秒后强制回写
vm.dirty_writeback_centisecs = 500 # 回写线程每 5 秒检查一次
```

---

## 五、完整调优清单

### 5.1 生产环境推荐配置

```bash
# /etc/sysctl.d/99-production.conf
# ===== 文件系统 =====
fs.file-max = 2097152
fs.inotify.max_user_watches = 524288  # 防止 IDE/Jenkins inotify 不够

# ===== 网络 =====
net.core.somaxconn = 65535
net.core.netdev_max_backlog = 65535
net.ipv4.tcp_max_syn_backlog = 65535
net.ipv4.tcp_tw_reuse = 1
net.ipv4.tcp_fin_timeout = 15
net.ipv4.ip_local_port_range = 1024 65535
net.ipv4.tcp_syncookies = 1
net.ipv4.tcp_slow_start_after_idle = 0
net.core.rmem_max = 16777216
net.core.wmem_max = 16777216

# ===== 内存 =====
vm.swappiness = 10
vm.overcommit_memory = 1
vm.dirty_background_ratio = 5
vm.dirty_ratio = 10

# ===== 内核 =====
kernel.pid_max = 65536
kernel.threads-max = 65536
```

### 5.2 调优前后对比（验证方法）

```bash
# 调优前基线
sysctl -a > /tmp/sysctl_before.txt

# 执行调优
sysctl --system

# 调优后对比
diff /tmp/sysctl_before.txt <(sysctl -a)

# 验证连接队列
ss -lnt | awk '{print $1, $2, $3, $4}'

# 验证 TIME_WAIT 数量
ss -tan state time-wait | wc -l
```

---

## 六、与相关模块的交叉引用

| 知识点 | 相关模块 |
|--------|----------|
| TCP 协议栈、TIME_WAIT 状态机 | [计算机网络 - TCP](../../computer-network/transport/tcp.md) |
| 虚拟内存、页回写机制 | [操作系统 - 内存管理](../../operating-system/memory/index.md) |
| 文件描述符、VFS 层 | [操作系统 - 文件系统](../../operating-system/filesystem/index.md) |
| 网络排障实战 | [Linux - 网络排障](./network-troubleshooting.md) |
| 性能分析方法论 | [Linux - 性能分析](./performance-analysis.md) |

---

## 七、高频面试题

### Q1：文件描述符限制怎么改？改了 `/etc/security/limits.conf` 为什么没生效？
**答案：** 修改 `/etc/security/limits.conf` 添加 `* soft nofile 65536` 和 `* hard nofile 65536`，然后**重新登录**（PAM 认证才会生效）。但如果 systemd 管理的服务没生效，是因为 systemd 不走 PAM，需要在 service 文件的 `[Service]` 段加 `LimitNOFILE=65536`，或在 `/etc/systemd/system.conf` 设置 `DefaultLimitNOFILE=65536`。验证：`cat /proc/PID/limits` 查看进程的实际限制。

### Q2：`net.core.somaxconn` 和 `net.ipv4.tcp_max_syn_backlog` 的区别？
**答案：** `tcp_max_syn_backlog` 是**半连接队列**（SYN Queue）最大长度，存储收到 SYN 但还没完成三次握手的连接（SYN_RECV 状态）。`somaxconn` 是**全连接队列**（Accept Queue）最大长度，存储已完成三次握手但还没被 `accept()` 取走的连接（ESTABLISHED 状态）。全连接队列的实际大小 = `min(backlog, somaxconn)`，其中 backlog 是应用层 `listen()` 传入的参数。

### Q3：`tcp_tw_reuse` 和 `tcp_tw_recycle` 的区别？`tcp_tw_recycle` 为什么被移除了？
**答案：** `tcp_tw_reuse` 允许客户端侧新连接复用 TIME_WAIT 状态的 socket（仅当时间戳判断安全时），不影响服务端。`tcp_tw_recycle` 对客户端和服务端都生效，通过时间戳快速回收 TIME_WAIT socket，但在 NAT 环境下，不同客户端可能共享 IP，时间戳可能不是递增的，导致正常连接被 RST 拒绝。Linux 4.12 内核已移除 `tcp_tw_recycle`。生产环境只推荐使用 `tcp_tw_reuse`。

### Q4：`vm.swappiness` 设为 0 和 10 有什么区别？数据库服务器应该设多少？
**答案：** `swappiness=0` 表示内核只在内存严重不足时才使用 swap，但不是完全不使用。`swappiness=10` 表示减少 swap 使用倾向，比 60（默认）更保守。对于数据库服务器（MySQL/PostgreSQL/MongoDB），建议设为 1-10，因为数据库依赖内存缓存来保证性能，换出到 swap 会导致查询延迟剧烈增加。设为 0 在极端情况下可能导致 OOM 而不是 swap（因为内核完全拒绝换出），反而不安全。

### Q5：如何判断全连接队列是否溢出？溢出后怎么处理？
**答案：** 查看溢出次数：`netstat -s | grep "overflowed"` 或 `cat /proc/net/netstat | grep ListenOverflows`。实时监控队列长度：`ss -lnt` 看 `Recv-Q` 和 `Send-Q`。如果 `Recv-Q` 持续接近 `Send-Q`，说明队列快满了。处理：增加 `net.core.somaxconn` 和应用的 backlog 参数（如 Nginx `listen 80 backlog=65535`），同时检查应用是否及时 `accept()` 连接（应用层处理慢也会导致队列堆积）。

### Q6：生产环境如何做内核参数调优？你的调优经验是什么？
**答案：** 调优流程：（1）明确应用场景和瓶颈——高并发 Web 关注连接队列和 TIME_WAIT，数据库关注内存和 IO，消息队列关注缓冲区；（2）建立基线——`sysctl -a` 保存当前配置，压测获取性能指标（QPS、延迟、错误率）；（3）参考行业最佳实践和官方文档给出初始值，逐项修改，每次只改一个参数，压测验证效果；（4）重点关注：文件描述符限制、连接队列大小、TIME_WAIT 优化、TCP 缓冲区、swappiness。实际案例：一个 Nginx 反向代理服务在并发 5000 时就大量 502，排查发现 `somaxconn=128`，调大到 65535 后并发到 20000 才出问题。另一个案例：Java 应用启动时报 `Too many open files`，`ulimit -n` 是 1024，加到 65536 后解决。