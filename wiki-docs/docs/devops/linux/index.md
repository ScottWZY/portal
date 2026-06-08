# Linux 学习路径与工具生态

## ⭐ 面试重点速览

| 考点 | 频率 | 难度 | 考察方式 |
|------|------|------|----------|
| 文件系统层次结构（FHS） | ⭐⭐⭐⭐ | ⭐⭐ | 各目录用途，跨发行版差异 |
| 常用工具分类与选择 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | 场景题：给你一个排障场景，你用哪些工具/命令 |
| 包管理差异（apt/yum） | ⭐⭐⭐ | ⭐⭐ | 生产环境常用操作 |
| Linux 内核版本与发行版关系 | ⭐⭐⭐ | ⭐⭐ | 主流发行版选型建议 |
| Linux 学习路径规划 | ⭐⭐⭐ | ⭐⭐ | 开放性问题，考察知识体系完整性 |

---

## 一、文件系统层次结构（FHS）

Filesystem Hierarchy Standard 定义了 Linux 目录结构的标准。面试中常问"某某文件放在哪个目录"，本质是考察你对系统运行的理解。

```
/               # 根目录，一切文件的起点
├── /bin        # 基本用户命令（ls、cp、cat 等），软链接到 /usr/bin
├── /sbin       # 系统管理命令（fdisk、mkfs、iptables），软链接到 /usr/sbin
├── /boot       # 内核镜像 vmlinuz、initramfs、grub 配置
├── /dev        # 设备文件（sda、tty、null、random）
├── /etc        # 系统级配置文件（ssh、nginx、sysctl.conf）
├── /home       # 普通用户家目录
├── /root       # root 用户家目录
├── /lib        # 共享库和内核模块，软链接到 /usr/lib
├── /media      # 可移动介质挂载点（U盘、CD-ROM）
├── /mnt        # 临时手动挂载点
├── /opt        # 第三方软件安装目录（如 /opt/jdk、/opt/nginx）
├── /proc       # 虚拟文件系统，内核和进程信息（cpuinfo、meminfo、PID目录）
├── /sys        # 虚拟文件系统，设备、驱动、内核参数（比 /proc 更结构化）
├── /run        # 系统启动以来的运行时数据（tmpfs），PID文件、socket文件
├── /srv        # 服务数据目录（如 /srv/www）
├── /tmp        # 临时文件，重启可能被清理（通常为 tmpfs）
├── /usr        # 用户级程序和数据（Unix System Resources）
│   ├── /usr/bin
│   ├── /usr/sbin
│   ├── /usr/lib
│   ├── /usr/local  # 本地编译安装的软件
│   └── /usr/share  # 架构无关数据（文档、man page）
└── /var        # 可变数据（日志、缓存、邮件队列、数据库文件）
    ├── /var/log     # 日志文件（messages、syslog、nginx/）
    └── /var/lib     # 应用程序状态数据（mysql、docker）
```

::: tip 排障要点
- `/proc` 和 `/sys` 是排障黄金信息来源。比如 `/proc/PID/fd` 可以看到进程打开的文件描述符，`/proc/sys/` 可以动态修改内核参数。
- `/var/log` 下日志满了导致磁盘满，是生产环境最常见的故障之一。
:::

::: danger 常见陷阱
不要随意删除 `/tmp` 下的文件如果它是某个进程正在使用的 socket 文件。`/tmp` 下可能有 systemd 的私有 tmp 目录（`/tmp/systemd-private-*`）。
:::

---

## 二、常用工具分类

按排障场景组织工具远比按字母表记忆有效。以下是高级工程师常用的分类体系：

### 2.1 CPU 与进程分析

| 工具 | 用途 | 场景 |
|------|------|------|
| `top` / `htop` | 实时进程监控 | 快速定位 CPU 占用高的进程 |
| `ps` | 进程快照 | 查看特定进程详情 |
| `pidstat` | 进程级 CPU 统计 | 精细化分析，支持历史数据 |
| `mpstat` | CPU 各核心统计 | 判断是否单核瓶颈 |
| `strace` | 跟踪系统调用 | 分析进程卡在哪个系统调用 |
| `perf` | 性能采样 | 火焰图分析、热点函数定位 |

### 2.2 内存分析

| 工具 | 用途 | 场景 |
|------|------|------|
| `free` | 内存概览 | 快速看 used/free/buffer/cache |
| `vmstat` | 虚拟内存统计 | 整体内存和 swap 活动 |
| `pmap` | 进程内存映射 | 查看进程详细内存分布 |
| `smem` | 物理内存统计 | 更准确的 PSS/USS 统计 |
| `/proc/PID/smaps` | 内存段详情 | 排查内存泄漏 |

### 2.3 磁盘与 IO

| 工具 | 用途 | 场景 |
|------|------|------|
| `df` / `du` | 磁盘空间/目录大小 | 磁盘满了先查什么 |
| `iostat` | IO 统计 | 磁盘性能瓶颈 |
| `iotop` | 进程级 IO 监控 | 哪个进程在疯狂读写 |
| `lsof` | 列出打开的文件 | 文件被谁占用、端口被谁监听 |
| `fdisk` / `lsblk` | 磁盘分区 | 磁盘扩容前准备 |

### 2.4 网络排障

| 工具 | 用途 | 场景 |
|------|------|------|
| `ss` | Socket 统计（替代 netstat） | 查看监听端口、连接状态 |
| `tcpdump` | 抓包分析 | 网络不通、响应慢 |
| `curl` / `wget` | HTTP 请求测试 | 接口联通性验证 |
| `iptables` / `nftables` | 防火墙规则 | 排查防火墙拦截 |
| `mtr` | 路由追踪+丢包率 | 网络质量分析 |

### 2.5 综合排障

| 工具 | 用途 | 场景 |
|------|------|------|
| `dmesg` | 内核日志 | OOM killer、硬件错误 |
| `journalctl` | systemd 日志 | 服务启动失败原因 |
| `sar` | 系统活动报告 | 回溯历史性能数据 |
| `bcc` / `bpftrace` | 动态追踪 | 复杂问题深入分析 |

---

## 三、学习路径建议

### 阶段一：基础操作（1-2 周）
- 文件和目录操作：`ls`、`cd`、`cp`、`mv`、`rm`、`find`
- 文件查看和编辑：`cat`、`less`、`tail`、`vim`、`grep`
- 权限管理：`chmod`、`chown`、`sudo`
- 管道与重定向：`|`、`>`、`>>`、`<`

### 阶段二：系统管理（2-3 周）
- 进程管理：`ps`、`top`、`kill`、`systemctl`
- 磁盘管理：`df`、`du`、`mount`、`fdisk`
- 网络配置：`ip`、`ss`、`ping`、`curl`
- 用户和组：`useradd`、`usermod`、`groupadd`

### 阶段三：Shell 编程（1-2 周）
- 变量、条件判断、循环
- 函数、参数传递
- awk/sed 文本处理
- 编写自动化运维脚本

### 阶段四：性能与排障（持续）
- 性能分析工具链：`perf`、`bcc`、`strace`
- 内核参数调优：`sysctl`、`/proc/sys/`
- 日志分析：`journalctl`、`/var/log`
- 网络排障：`tcpdump`、`ss`、`iptables`

::: tip 实战建议
不要只看不练。建议在本地虚拟机或云服务器上搭建一个完整的 LAMP/LNMP 环境，然后故意制造故障（如改错配置、填满磁盘、耗尽内存），用工具链去排查和修复。
:::

---

## 四、与相关模块的交叉引用

| 知识点 | 相关模块 |
|--------|----------|
| 进程调度、上下文切换 | [操作系统 - 进程与线程](../../operating-system/process-thread/index.md) |
| 内存管理、虚拟内存 | [操作系统 - 内存管理](../../operating-system/memory/index.md) |
| 文件系统、inode、VFS | [操作系统 - 文件系统](../../operating-system/filesystem/index.md) |
| IO 模型、select/epoll | [操作系统 - IO模型](../../operating-system/io/index.md) |
| TCP 状态、三次握手 | [计算机网络 - 传输层](../../computer-network/transport/tcp.md) |
| HTTP 协议、抓包分析 | [计算机网络 - 应用层](../../computer-network/application/http.md) |

---

## 五、高频面试题

### Q1：/proc 和 /sys 的区别是什么？
**答案：** `/proc` 是早期 Linux 的伪文件系统，最初设计为进程信息接口，后来混杂了内核参数（`/proc/sys/`）。`/sys` 是 2.6 内核引入的 sysfs，结构更清晰，专门用于导出设备、驱动、总线等内核对象信息。Linux 社区推荐新的内核接口使用 `/sys`，`/proc` 保留向后兼容。例如 CPU 信息：`/proc/cpuinfo` vs `/sys/devices/system/cpu/`。

### Q2：Linux 上如何查看一个进程打开了哪些文件？
**答案：** 使用 `lsof -p PID` 或 `ls -la /proc/PID/fd/`。后者更轻量，直接查看文件描述符目录下的软链接。`lsof` 功能更强大，可以按端口（`lsof -i :80`）、用户（`lsof -u root`）、文件（`lsof /var/log/messages`）过滤。

### Q3：/tmp 目录满了怎么办？能直接删吗？
**答案：** 不能盲目删除。首先用 `du -sh /tmp/*` 找出大文件。然后检查是否有进程在使用这些文件（`lsof /tmp/xxx`）。如果有进程持有文件句柄，删除文件只是删除了目录项，inode 和数据块不会被释放，磁盘空间不会恢复。正确的做法是截断文件（`> /tmp/largefile`）或找到并重启对应进程。

### Q4：如何查看 Linux 系统已运行了多久？
**答案：** `uptime` 命令，输出示例：`14:32:08 up 365 days, 4:15, 3 users, load average: 0.52, 0.38, 0.31`。它还显示当前时间、登录用户数和系统负载。`/proc/uptime` 文件包含两个数字：系统运行秒数和空闲秒数。

### Q5：Linux 发行版之间切换需要注意什么？
**答案：** 主要差异：包管理器（apt vs yum/dnf vs apk）、服务管理（systemd 是主流，但 Alpine 用 openrc）、默认配置路径（如 Nginx 配置在 /etc/nginx 基本一致，但日志路径可能不同）、SELinux（CentOS/RHEL 默认开启）vs AppArmor（Ubuntu 默认开启）、内核版本差异导致某些 bcc/eBPF 工具不可用。建议团队统一发行版，减少运维负担。

### Q6：如何快速学习一个新的 Linux 命令？
**答案：** 四步法：（1）`man command` 或 `command --help` 看概述和常用选项；（2）`tldr command`（需要安装 tldr 工具）看常见用例；（3）实际运行并观察输出；（4）阅读 `info command` 获取更深入的解释（如果 man page 不够详细）。不要试图记住所有参数，记住核心用法，复杂参数用 man 查即可。