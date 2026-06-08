# 磁盘与 IO

## ⭐ 面试重点速览

| 考点 | 频率 | 难度 | 考察方式 |
|------|------|------|----------|
| df/du 磁盘空间排查 | ⭐⭐⭐⭐⭐ | ⭐⭐ | 磁盘满了如何排查，df 和 du 结果不一致的原因 |
| iostat 输出解读 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | await/svctm/util 含义，IO 瓶颈判断 |
| lsof 实战 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | 文件被谁占用，端口被谁监听，已删除文件空间不释放 |
| 磁盘挂载与 fstab | ⭐⭐⭐ | ⭐⭐⭐ | 挂载参数、启动失败处理 |
| inode 耗尽排查 | ⭐⭐⭐⭐ | ⭐⭐⭐ | 小文件过多导致磁盘有空间但写不进去 |

---

## 一、磁盘空间排查

### 1.1 df —— 文件系统级别查看

```bash
$ df -h
Filesystem      Size  Used Avail Use% Mounted on
/dev/sda1        50G   45G  2.5G  95% /
/dev/sdb1       200G  120G   70G  64% /data
tmpfs           7.8G     0  7.8G   0% /dev/shm

$ df -i          # 查看 inode 使用情况
Filesystem      Inodes  IUsed  IFree IUse% Mounted on
/dev/sda1      3276800 2950000 326800   91% /
```

::: tip 关键参数
- `-h`：人类可读格式（K/M/G）
- `-i`：查看 inode 使用率（**磁盘空间够但写不进去时必查**）
- `-T`：显示文件系统类型
- `-x tmpfs`：排除 tmpfs 等伪文件系统
:::

### 1.2 du —— 目录级别查看

```bash
# 常用组合
du -sh /var/log/*              # 每个子目录/文件的大小汇总
du -h --max-depth=1 /          # 只看一级子目录
du -ah /tmp | sort -rh | head -10  # 找出最大的 10 个文件

# 实战：磁盘满了，快速定位大目录
$ du -sh /* 2>/dev/null | sort -rh | head -5
120G    /data
45G     /var
12G     /usr
5.2G    /opt
2.1G    /home
```

### 1.3 df 和 du 不一致的经典案例

```bash
# 场景：df 显示磁盘使用 95%，但 du 统计只有 80%
$ df -h /
Filesystem      Size  Used Avail Use% Mounted on
/dev/sda1        50G   47G  1.5G  97% /
$ du -sh / 2>/dev/null
40G     /

# 原因：已删除但被进程持有的文件
# 排查方法：
$ lsof | grep deleted
java    1234  app  5w  REG  8,1  8589934592  65538 /var/log/app.log (deleted)
# 上面这个文件已被删除，但 Java 进程仍然持有文件描述符，磁盘空间不会释放
```

::: danger 根因与解决
当进程持有已删除文件的句柄时，文件在目录中不可见（`ls` 看不到），但 inode 和数据块不会被释放。解决方法：
1. 截断文件：`> /proc/1234/fd/5`（将文件描述符 5 截断为 0 字节）
2. 重启进程：`systemctl restart app`
3. 发送信号：某些应用支持 `kill -HUP` 重新打开日志文件
:::

---

## 二、IO 性能分析

### 2.1 iostat —— IO 统计

```bash
# 安装：apt install sysstat / yum install sysstat
$ iostat -x 1 3
avg-cpu:  %user   %nice %system %iowait  %steal   %idle
           2.34    0.00    1.56   35.20    0.00   60.90

Device   r/s     w/s    rkB/s    wkB/s  await  r_await w_await  svctm  %util
sda      45.00  120.00  2048.00  8192.00  25.30   8.20   35.40   5.20  85.80
sdb      2.00   15.00   128.00  1024.00   3.50   2.10    4.10   1.20   2.04
```

**关键指标解读：**

| 指标 | 含义 | 告警阈值 |
|------|------|----------|
| `r/s` / `w/s` | 每秒读/写请求数 | — |
| `rkB/s` / `wkB/s` | 每秒读/写数据量（KB） | 接近磁盘带宽上限 |
| `await` | 平均 IO 响应时间（ms） | **> 10ms 需关注，> 30ms 严重** |
| `r_await` / `w_await` | 读/写各自的响应时间 | 分离读写，精准定位 |
| `svctm` | 平均服务时间（ms） | 不可靠，新内核已废弃 |
| `%util` | 磁盘繁忙度 | **> 80% 需关注，接近 100% 瓶颈** |

::: warning 注意
`%util` 对于 SSD 和 RAID 有误导性。SSD 可以并行处理 IO，`%util` 可能接近 100% 但实际并未饱和。更可靠的指标是 `await` 和 IOPS 对比设备规格。
:::

### 2.2 iotop —— 进程级 IO 监控

```bash
$ iotop -o          # 只显示有 IO 活动的进程
Total DISK READ:      45.23 M/s | Total DISK WRITE:     120.56 M/s
  PID  PRIO  USER     DISK READ  DISK WRITE  SWAPIN      IO    COMMAND
 2341 be/4  app        30.12 M/s   85.34 M/s  0.00%  75.23%  java -jar app.jar
 5678 be/4  mysql      12.56 M/s   30.12 M/s  0.00%  20.15%  mysqld
```

### 2.3 lsof —— 列出打开的文件

```bash
# 常用场景
lsof -i :80                         # 查看 80 端口被谁占用
lsof -i TCP:80                      # 同上，指定协议
lsof -p 1234                        # 查看进程 1234 打开的所有文件
lsof -u app                         # 查看 app 用户打开的文件
lsof /var/log/messages              # 查看哪些进程正在使用该文件
lsof +D /var/log                    # 查看目录下所有被打开的文件
lsof | grep deleted                 # 找出已删除但仍被占用的文件

# 实战：端口冲突排查
$ lsof -i :8080
COMMAND   PID USER   FD   TYPE DEVICE SIZE/OFF NODE NAME
java    12345  app  345u  IPv6 123456      0t0  TCP *:8080 (LISTEN)
```

---

## 三、磁盘挂载与 fstab

### 3.1 临时挂载与永久挂载

```bash
# 临时挂载
mount /dev/sdb1 /data
mount -o noatime,nodiratime /dev/sdb1 /data    # 优化参数

# 卸载
umount /data
umount -l /data     # 懒卸载（lazy），等没有进程使用后卸载
umount -f /data     # 强制卸载（NFS 场景）

# 查看挂载信息
mount | column -t
findmnt             # 树状显示挂载关系
lsblk               # 块设备信息
```

### 3.2 /etc/fstab 配置

```bash
# /etc/fstab 格式：
# <设备>  <挂载点>  <文件系统类型>  <挂载参数>  <dump>  <fsck顺序>
UUID=a1b2c3d4  /data  ext4  defaults,noatime  0  2
/dev/sdb1      /data  ext4  defaults,noatime  0  2
```

**常用挂载参数：**

| 参数 | 作用 |
|------|------|
| `defaults` | rw, suid, dev, exec, auto, nouser, async |
| `noatime` | 不更新文件访问时间，减少 IO（推荐用于高 IO 场景） |
| `nodiratime` | 不更新目录访问时间 |
| `noexec` | 禁止执行该分区上的二进制文件（安全加固） |
| `nosuid` | 禁止 suid 位生效（安全加固） |
| `nofail` | 该设备挂载失败不影响启动（**强烈建议添加**） |

::: danger 生产教训
添加 `nofail` 参数！如果 fstab 中配置了非必需的数据盘但不加 `nofail`，磁盘故障时系统会进入 emergency mode，无法正常启动。添加 `nofail` 后，挂载失败只是跳过，不影响系统启动。
:::

---

## 四、inode 耗尽排查

```bash
# 场景：df -h 显示有空间，但 touch 文件报错 "No space left on device"
$ df -i
Filesystem      Inodes  IUsed  IFree IUse% Mounted on
/dev/sda1      3276800 3276800      0  100% /

# 排查哪个目录大量小文件
$ for i in /*; do echo "$(find "$i" -type f 2>/dev/null | wc -l) $i"; done | sort -rn | head -5
# 或
$ find /var -xdev -type f | cut -d "/" -f 4 | sort | uniq -c | sort -rn

# 常见原因
# 1. 邮件队列堆积（/var/spool/postfix/maildrop/）
# 2. 会话文件（/tmp 或 PHP session 文件）
# 3. 日志轮转失败导致小文件堆积
# 4. crontab 产生大量临时文件
```

---

## 五、与相关模块的交叉引用

| 知识点 | 相关模块 |
|--------|----------|
| 文件系统原理（inode、VFS） | [操作系统 - 文件系统](../../operating-system/filesystem/index.md) |
| IO 模型（阻塞/非阻塞/异步） | [操作系统 - IO模型](../../operating-system/io/index.md) |
| 页缓存与回写机制 | [操作系统 - 内存管理](../../operating-system/memory/index.md) |

---

## 六、高频面试题

### Q1：df 和 du 显示磁盘使用量不一致，可能的原因是什么？
**答案：** 最常见原因是已删除但被进程持有的文件（`lsof | grep deleted`）。文件被删除（unlink）后，目录项消失，但如果有进程持有文件描述符，inode 和数据块不会被释放，df 会计入使用量而 du 统计不到。其他原因包括：隐藏文件（`du` 默认不统计 `.` 开头的文件）、挂载点覆盖（某目录被其他分区挂载，`du` 统计的是挂载后的内容）、大稀疏文件（`du` 统计实际占用，`df` 统计逻辑大小）。

### Q2：iostat 中 await 和 svctm 的区别？为什么 svctm 被废弃？
**答案：** `await` 是 IO 请求从发出到完成的总时间（排队 + 服务），`svctm` 是纯服务时间（不包含排队）。`svctm` 被废弃的原因是：现代存储（SSD、RAID、SAN）的 IO 路径复杂，内核无法准确计算纯服务时间，`svctm` 的数值经常不可靠甚至小于理论最小值。评价 IO 性能应该关注 `await`（响应时间）和 `r/s` + `w/s`（IOPS）而不是 `svctm`。

### Q3：inode 耗尽是什么场景？如何排查和解决？
**答案：** 文件系统创建时固定了 inode 数量，每个文件/目录/软链接占用一个 inode。当大量小文件（如邮件队列、session 文件、缓存碎片）耗尽 inode 时，即使磁盘有剩余空间也无法创建新文件。排查：`df -i` 查看 inode 使用率，然后 `find` 统计各目录的文件数量。解决：删除不需要的小文件，或者重新格式化文件系统时增加 inode 数量（`mkfs.ext4 -N 数量` 或 `-i 8192` 每 8KB 一个 inode）。根本方案：优化应用避免产生大量小文件。

### Q4：磁盘 IO 高，如何快速定位是哪个进程导致的？
**答案：** 三步法：（1）`iostat -x 1` 确认磁盘 IO 瓶颈（await 高、%util 高）；（2）`iotop -o` 实时查看哪个进程在大量读写，注意 DISK READ/WRITE 列；（3）如果是数据库，用 `pidstat -d 1` 查看进程的 IO 统计（kB_rd/s、kB_wr/s）。深入分析：`strace -p PID -e trace=read,write -c` 统计系统调用分布，`lsof -p PID` 查看打开的文件列表。

### Q5：fstab 中 `nofail` 参数的作用？没有它会怎样？
**答案：** `nofail` 告诉 systemd 该设备挂载失败不阻止系统启动。如果 fstab 中配置了非根文件系统的数据盘但不加 `nofail`，且该磁盘故障或不存在，系统会卡在启动阶段，进入 emergency mode，需要手动干预。这在生产环境中是灾难性的——一块非关键数据盘坏了导致整个服务器无法启动。**所有非根文件系统的挂载项都应该加 `nofail`。**

### Q6：`/proc/PID/fd/` 目录下的文件描述符指向已删除文件（deleted），如何释放空间？
**答案：** 三种方法：（1）清空文件内容：`> /proc/PID/fd/N` 或 `truncate -s 0 /proc/PID/fd/N`，将文件截断为 0 字节，磁盘空间立即释放但进程不受影响；（2）重启进程：`systemctl restart service`，最彻底但会影响服务；（3）如果进程支持日志重载信号：`kill -HUP PID`，某些应用（如 Nginx）会重新打开日志文件。推荐方法 1 作为紧急处理，方法 2 作为根治手段。