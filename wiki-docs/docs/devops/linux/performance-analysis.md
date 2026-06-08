# 性能分析

## ⭐ 面试重点速览

| 考点 | 频率 | 难度 | 考察方式 |
|------|------|------|----------|
| top 输出详解（load average/us/sy/wa） | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | 各字段含义，指标异常判断 |
| CPU 瓶颈分析（pidstat/mpstat） | ⭐⭐⭐⭐ | ⭐⭐⭐ | 用户态/内核态 CPU 高分别怎么排查 |
| 内存分析（free/buffer/cache/swap） | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | buffer 和 cache 区别，available 含义 |
| perf 性能分析（火焰图） | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 采样原理，如何定位热点函数 |
| 综合排查流程（CPU 高 -> 内存高 -> IO 高） | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 给你一个现象，完整排查思路 |

---

## 一、系统负载理解

### 1.1 load average 深入解读

```bash
$ uptime
14:32:08 up 100 days, 4:15, 3 users, load average: 0.52, 0.38, 0.31
```

| 时间窗口 | 含义 |
|----------|------|
| 1 分钟 | 最近 1 分钟平均负载 |
| 5 分钟 | 最近 5 分钟平均负载 |
| 15 分钟 | 最近 15 分钟平均负载 |

**负载含义：** load average 表示处于 **R（运行中）** 和 **D（不可中断睡眠）** 状态的进程平均数。不是 CPU 使用率！

```
负载 < CPU 核心数：正常，有足够 CPU 资源
负载 ≈ CPU 核心数：CPU 饱和
负载 > CPU 核心数：CPU 过载，有进程在排队等待
```

```bash
# 查看 CPU 核心数
$ nproc
8
$ cat /proc/cpuinfo | grep processor | wc -l
8
```

::: warning 常见误区
负载高不等于 CPU 使用率高。如果负载高但 CPU 使用率低（idle 高），说明瓶颈在 IO——大量进程在 D 状态等磁盘。如果负载高且 CPU 使用率也高，才是 CPU 瓶颈。
:::

---

## 二、CPU 性能分析

### 2.1 top 中 CPU 行详解

```bash
%Cpu(s): 12.5 us, 3.2 sy, 0.0 ni, 80.1 id, 4.0 wa, 0.0 hi, 0.2 si, 0.0 st
```

| 指标 | 含义 | 高值含义 |
|------|------|-----------|
| `us` (user) | 用户态 CPU 占用 | 应用代码计算密集 |
| `sy` (system) | 内核态 CPU 占用 | 系统调用过多、上下文切换频繁 |
| `ni` (nice) | 低优先级用户态 CPU | 后台任务 |
| `id` (idle) | 空闲 | 无负载 |
| `wa` (iowait) | IO 等待 | **磁盘瓶颈** |
| `hi` (hardware irq) | 硬中断 | 硬件中断处理 |
| `si` (software irq) | 软中断 | 网络收发包处理 |
| `st` (steal) | 被 hypervisor 偷走 | 虚拟机资源超卖 |

```bash
# 场景判断
# us 高 + sy 低 → 应用计算密集，考虑代码优化
# us 高 + sy 也高 → 系统调用过多，检查是否有不必要的系统调用
# sy 高 + us 低 → 内核态操作频繁（如大量网络小包、频繁 fork）
# wa 高 → 磁盘 IO 瓶颈
# si 高 → 网络收发包压力大（软中断集中处理）
# st 高 → 虚拟机资源被宿主机超卖，需要迁移或升配
```

### 2.2 pidstat —— 进程级 CPU 统计

```bash
# 安装：apt install sysstat / yum install sysstat
# 每秒输出一次，共 3 次
$ pidstat 1 3
Linux 5.15.0 (server01)  06/08/2024  _x86_64_  (8 CPU)

02:00:01 PM   UID       PID    %usr %system  %guest   %wait    %CPU   CPU  Command
02:00:02 PM  1000      2341   45.50    5.00    0.00    0.00   50.50     2  java
02:00:02 PM  1000      5678   12.00    3.00    0.00    0.00   15.00     0  mysqld
02:00:02 PM     0        12    0.00    0.99    0.00    0.00    0.99     1  ksoftirqd/1
```

| 列 | 含义 |
|----|------|
| `%usr` | 用户态 CPU 占用 |
| `%system` | 内核态 CPU 占用 |
| `%guest` | 虚拟 CPU 占用（虚拟机场景） |
| `%wait` | 等待 CPU 的时间（**高说明存在 CPU 竞争**） |
| `%CPU` | 总 CPU 占用 |

### 2.3 mpstat —— 各 CPU 核心统计

```bash
$ mpstat -P ALL 1 3
# 查看每个核心的负载分布
# 如果某个核心 100% 而其他核心空闲 → 单线程瓶颈
# 如果所有核心都高 → 真正的 CPU 密集型

# 实战：判断 CPU 是否均衡
$ mpstat -P ALL 1 | grep -v Average
# 如果 irq 和 soft 集中在某个 core → 中断亲和性需要调整
```

---

## 三、内存性能分析

### 3.1 free —— 内存概览

```bash
$ free -h
              total        used        free      shared  buff/cache   available
Mem:           15Gi       8.7Gi       1.2Gi       234Mi       5.5Gi       6.0Gi
Swap:         4.0Gi       205Mi       3.8Gi
```

**关键字段解读：**

| 字段 | 含义 |
|------|------|
| `total` | 物理内存总量 |
| `used` | 已使用内存（包括 buffer/cache） |
| `free` | 完全未使用的内存 |
| `shared` | 共享内存（tmpfs 等） |
| `buff/cache` | 缓冲区 + 页缓存（可回收用于进程） |
| `available` | **实际可用内存估算值**（包含可回收的 buffer/cache） |

::: tip 核心概念
**不要只看 `free` 列！** Linux 会积极使用空闲内存作为页缓存（page cache），所以 `free` 小不等于内存不够。判断内存是否够用的标准是 `available` 和 swap 使用情况。如果 `available` 很低且 swap 持续增长，才是真正的内存不足。
:::

### 3.2 buffer 和 cache 的区别

```bash
# 查看 buffer/cache 详情
$ cat /proc/meminfo | grep -E "^(Buffers|Cached|SwapCached|Dirty|Writeback)"
Buffers:       123456 kB   # 块设备缓冲（文件系统元数据、inode、目录项）
Cached:       5123456 kB   # 页缓存（文件内容缓存）
SwapCached:    123456 kB   # 被换出到 swap 又在内存中缓存了
Dirty:           1024 kB   # 脏页，等待写回磁盘
Writeback:          0 kB   # 正在写回磁盘的页
```

- **buffer**：块设备缓冲，存储文件系统元数据（inode、superblock）
- **cache**：页缓存，存储文件内容，加速文件读写
- **脏页（Dirty）**：被修改但尚未写入磁盘的页缓存

### 3.3 vmstat —— 虚拟内存综合统计

```bash
$ vmstat 1 5
procs -----------memory---------- ---swap-- -----io---- -system-- ------cpu-----
 r  b   swpd   free   buff  cache   si   so    bi    bo   in   cs us sy id wa st
 2  1 205824 1234567 123456 5123456  0    1    12    45  500 1200 12  3 80  4  0
 1  1 205824 1234000 123456 5123500  0    0    50   120  450 1100 10  5 70 15  0
```

| 指标 | 含义 | 异常阈值 |
|------|------|-----------|
| `r` | 运行队列长度（等待 CPU 的进程数） | > CPU 核数 |
| `b` | 不可中断睡眠（D 状态）进程数 | > 0 持续 |
| `si` | 从 swap 读入（KB/s） | > 0 则内存不足 |
| `so` | 写入 swap（KB/s） | > 0 则内存不足 |
| `bi` | 从块设备读入（KB/s） | 看磁盘带宽 |
| `bo` | 写入块设备（KB/s） | 看磁盘带宽 |
| `in` | 每秒中断数 | 异常高 = 网络压力大 |
| `cs` | 每秒上下文切换 | > 10000 需关注 |

---

## 四、综合性能分析工具

### 4.1 perf —— 性能采样（CPU 火焰图）

```bash
# 安装：apt install linux-tools-generic / yum install perf

# 采样进程 CPU 热点（99Hz 采样，持续 30 秒）
perf record -F 99 -p 1234 -g -- sleep 30

# 生成报告
perf report --stdio

# 生成火焰图数据（需要 FlameGraph 脚本）
perf script > out.perf
# 然后用 stackcollapse-perf.pl 和 flamegraph.pl 生成 SVG
```

```bash
# 实战：统计系统调用分布
$ perf stat -p 1234 -- sleep 10
 Performance counter stats for process id '1234':

      15023.45 msec task-clock           # 1.502 CPUs utilized
          1234      context-switches     # 82.133 /sec
            45      cpu-migrations       # 2.996 /sec
             0      page-faults          # 0.000 /sec
     3,456,789      cycles               # 0.230 GHz
     2,345,678      instructions         # 0.68  insn per cycle
       456,789      branches             # 30.402 K/sec
        12,345      branch-misses        # 2.70% of all branches
```

### 4.2 strace —— 系统调用跟踪

```bash
# 跟踪系统调用
strace -p 1234                          # 附加到进程
strace -p 1234 -e trace=read,write      # 只看 read/write
strace -p 1234 -c                       # 统计汇总
strace -p 1234 -f                       # 跟踪子进程
strace -p 1234 -T                       # 显示每个系统调用的耗时

# 实战：程序卡住了，看它卡在哪个系统调用
$ strace -p 1234
# 输出：
# read(5, <unfinished ...>   ← 卡在 read，可能是等 IO
# 或者
# futex(0x7f..., FUTEX_WAIT, ...) ← 卡在锁等待
```

```bash
# 实战：统计系统调用耗时，找出慢操作
$ strace -c -p 1234
% time     seconds  usecs/call     calls    errors syscall
------ ----------- ----------- --------- --------- ----------------
 85.23    2.345678        2345      1000           read
  8.12    0.223456         223      1000           write
  5.45    0.150000          15     10000           poll
```

### 4.3 bcc / bpftrace —— 动态追踪

```bash
# 示例：追踪文件打开（bcc opensnoop）
opensnoop-bpfcc -p 1234

# 示例：追踪磁盘 IO 延迟（bcc biolatency）
biolatency-bpfcc -m   # 以毫秒为单位显示 IO 延迟分布

# 示例：内存泄漏检测（bcc memleak）
memleak-bpfcc -p 1234 --older 10s  # 检测存活超过 10 秒的内存分配

# bpftrace 一行命令：统计进程的 CPU 使用时间
bpftrace -e 'kprobe:finish_task_switch { @[comm] = count(); }'
```

---

## 五、综合排障流程

### 5.1 CPU 高排查流程

```
1. top 确认 CPU 高的进程（按 P 排序）
2. pidstat 确认是用户态还是内核态高
3. 用户态高 → perf top 看热点函数 → 代码优化
4. 内核态高 → strace 看系统调用分布 → 减少不必要的系统调用
5. 检查 /proc/PID/status 中 voluntary_ctxt_switches 和 nonvoluntary_ctxt_switches
```

### 5.2 内存高排查流程

```
1. free -h 确认内存是否真的不够（看 available）
2. top 按 M 排序，找出内存占用最大的进程
3. pmap -x PID 看进程内存分布（堆、栈、代码段、mmap）
4. cat /proc/PID/smaps | grep -E "^(Rss|Pss)" 看详细内存映射
5. 如果是 JVM 进程，用 jstat/jmap 分析堆内存
```

### 5.3 IO 高排查流程

```
1. top 看 wa 指标，确认是 IO 瓶颈
2. iostat -x 1 看磁盘 await 和 %util
3. iotop 定位是哪个进程
4. lsof -p PID 看打开的文件
5. strace -p PID -e trace=read,write 看读写模式
```

---

## 六、与相关模块的交叉引用

| 知识点 | 相关模块 |
|--------|----------|
| 进程调度、上下文切换 | [操作系统 - 调度](../../operating-system/scheduling/index.md) |
| 虚拟内存、页表、TLB | [操作系统 - 内存管理](../../operating-system/memory/index.md) |
| 中断处理、软中断机制 | [计算机网络 - 传输层](../../computer-network/transport/index.md)（网络中断场景） |
| JVM 内存模型与 GC | [JVM - 内存模型](../../java-advanced/jvm/memory-model.md) |
| CPU 缓存一致性、伪共享 | [Java 并发 - JUC](../../java-advanced/concurrency/juc.md) |

---

## 七、高频面试题

### Q1：load average 和 CPU 使用率的区别？负载 5 但 CPU 空闲 90% 是什么情况？
**答案：** load average 是处于 R 状态和 D 状态进程的平均数，CPU 使用率是 CPU 实际工作时间占比。负载高而 CPU 空闲说明大量进程在 D 状态（不可中断睡眠），等待 IO 完成。常见的场景是 NFS 存储故障、磁盘阵列卡故障、或者大量进程同时写入慢速磁盘。没有进程在消耗 CPU 但都在等 IO，所以负载高、CPU 闲。

### Q2：buffer 和 cache 的区别？内存 `free` 值很小，是不是内存不够了？
**答案：** buffer 是块设备缓冲（文件系统元数据），cache 是页缓存（文件内容）。Linux 会积极使用空闲内存作为缓存来提高 IO 性能，所以 `free` 小是正常的。判断内存是否真的不够，关键看 `available` 列（估算可回收内存）和 swap 活动。如果 `available` 足够（比如 20% 以上）且 swap 没有持续增长，内存就是够的。如果 `available` 接近 0 且 swap 在持续使用，才是真正的内存不足。

### Q3：如何用 perf 定位 CPU 热点函数？火焰图怎么看？
**答案：** （1）`perf record -F 99 -p PID -g -- sleep 30` 采样 30 秒；（2）`perf script` 导出数据，用 FlameGraph 工具生成 SVG；（3）火焰图中，X 轴表示采样占比（越宽占比越高），Y 轴表示调用栈深度（越深调用链越长）。顶部的"平顶"就是热点函数，需要优先优化。如果看到大量时间花在 `_raw_spin_lock` 等锁函数上，说明锁竞争严重。

### Q4：`vmstat` 中 `si` 和 `so` 不为 0 代表什么？怎么办？
**答案：** `si`（swap in）和 `so`（swap out）不为 0 说明系统在换入换出内存页面，这是**内存不足的确凿证据**。swap so 偶尔有值可能正常（内存回收），但如果持续且值很大，说明物理内存不够用了。解决方案：增加物理内存、减少应用内存占用（调整 JVM 堆大小、清理缓存）、开启 OOM killer 或 cgroup 限制内存、优化应用的缓存策略。

### Q5：`strace` 和 `perf` 的区别？什么时候用哪个？
**答案：** `strace` 跟踪系统调用，能看到进程和内核的交互（读哪个文件、等什么锁、网络 IO 等），但只能看到系统调用层面，看不到用户态函数调用，且开销较大不适合长时间运行。`perf` 是性能计数器采样，能看到用户态和内核态函数级别的热点，开销小可以长时间运行。排查方向：进程卡住但 CPU 不高 → 用 strace 看卡在哪个系统调用；CPU 高 → 用 perf 采样找热点函数。

### Q6：如何排查 CPU `sy`（内核态）占用过高？
**答案：** 内核态 CPU 高说明系统调用、中断处理或上下文切换频繁。排查步骤：（1）`pidstat 1` 确认哪个进程的 `%system` 高；（2）`strace -c -p PID` 统计系统调用类型和频率，找出调用最多的系统调用；（3）`perf top` 看内核态热点函数（如 `_raw_spin_lock`、`copy_user` 等）；（4）`vmstat 1` 看 `cs`（上下文切换）和 `in`（中断）是否异常高；（5）常见原因：频繁的 `read`/`write` 小数据、大量线程竞争锁、网络小包过多导致软中断（检查 `si` 指标）。