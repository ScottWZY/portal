# 操作系统

> 操作系统是理解并发、IO、内存管理的底层基础。本模块面向面试，覆盖进程线程、内存管理、文件系统与 IO、进程调度等核心知识点。

## ⭐ 面试重点速览

| 考察点 | 重要程度 | 面试频率 | 掌握目标 |
|--------|----------|----------|----------|
| 进程与线程的区别 | ⭐⭐⭐ | 极高 | 能从资源、调度、通信角度区分 |
| 虚拟内存与分页 | ⭐⭐⭐ | 高 | 理解页表、TLB、缺页中断 |
| 死锁条件与预防 | ⭐⭐⭐ | 极高 | 能分析死锁四个条件，给出解决方案 |
| IO 多路复用 | ⭐⭐⭐ | 极高 | 理解 epoll 原理、水平/边缘触发 |
| 零拷贝 | ⭐⭐ | 高 | sendfile vs mmap 原理与区别 |

## 模块导航

- [进程与线程](./process-thread/) — 进程 vs 线程、上下文切换、用户态/内核态
- [进程间通信](./process-thread/ipc) — 管道/消息队列/共享内存/信号量/Socket
- [同步与互斥](./process-thread/sync) — 互斥锁/自旋锁/读写锁、死锁
- [虚拟内存](./memory/) — 分页/分段、页表、TLB、缺页中断
- [内存分配](./memory/allocation) — 首次适应/最佳适应/伙伴系统、slab
- [文件系统](./filesystem/) — inode、硬链接/软链接、VFS
- [IO 模型](./io/) — 阻塞/非阻塞、零拷贝 sendfile/mmap
- [进程调度](./scheduling/) — CFS 调度、CPU 亲和性

## 与现有模块的关系

- [Java JVM](../java-advanced/jvm/)：JVM 内存模型 vs OS 虚拟内存
- [Java 并发](../java-advanced/concurrency/)：Java 线程映射到 OS 线程
- [Java IO/NIO](../java-advanced/io-nio/)：Java NIO 底层依赖 OS IO 多路复用
- [计算机网络 IO 模型](../computer-network/programming/io-models)：网络编程视角的 IO 模型