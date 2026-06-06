# Java 高级

## 模块概述

Java 高级模块覆盖后端开发的核心基础能力，从 JVM 底层原理到并发编程、集合框架、IO 模型以及设计模式，是面试中考察深度和广度最集中的领域。本模块旨在帮助开发者从"会用"进阶到"精通"，建立对 Java 技术栈的系统性认知。

::: tip 适用人群
具备 1-3 年 Java 开发经验，正在准备中大厂面试的开发者。
:::

::: info 模块定位
深入原理层面，强调源码解读、场景分析和性能调优。
:::

## 核心知识点

### JVM 虚拟机

| 子模块 | 核心内容 |
|--------|----------|
| 内存模型 | 堆、栈、方法区、元空间结构；对象创建与内存分配策略 |
| 垃圾回收 | GC 算法（标记-清除、标记-整理、复制、分代）；CMS / G1 / ZGC 原理与调优 |
| 类加载 | 双亲委派机制、打破双亲委派（Tomcat/SPI）、自定义类加载器 |
| 性能调优 | JVM 参数配置、内存泄漏排查、MAT / Arthas / jstack 实战 |

### 并发编程

| 子模块 | 核心内容 |
|--------|----------|
| 基础理论 | 线程生命周期、上下文切换、死锁的条件与排查 |
| JUC 核心 | AQS 原理、ReentrantLock / synchronized 底层对比、CountDownLatch / CyclicBarrier / Semaphore |
| 线程池 | ThreadPoolExecutor 参数详解、拒绝策略、ForkJoinPool、CompletableFuture |
| 并发容器 | ConcurrentHashMap 源码分段锁演进、CopyOnWriteArrayList、BlockingQueue |
| 原子类 | CAS 原理、ABA 问题、LongAdder 分段思想 |

### 集合框架

| 子模块 | 核心内容 |
|--------|----------|
| List | ArrayList vs LinkedList 底层差异、扩容机制、fail-fast 原理 |
| Map | HashMap 1.7 vs 1.8 红黑树演进、扩容死循环分析、LinkedHashMap LRU 实现 |
| Set | HashSet / TreeSet 底层依赖、Comparable vs Comparator |

### IO 与网络

| 子模块 | 核心内容 |
|--------|----------|
| BIO/NIO/AIO | 阻塞与非阻塞模型对比、Buffer / Channel / Selector 三件套 |
| Netty | Reactor 模型、Pipeline 责任链、零拷贝、粘包拆包解决方案 |
| 序列化 | JDK 序列化缺陷、Protobuf / Kryo / Hessian 对比 |

### 设计模式

| 子模块 | 核心内容 |
|--------|----------|
| 创建型 | 单例（双重校验/DCL/枚举）、工厂/抽象工厂、建造者 |
| 结构型 | 代理（JDK 动态代理 vs CGLIB）、装饰器、适配器（Spring MVC 中的体现） |
| 行为型 | 观察者、策略、模板方法（Spring 中大量使用）、责任链 |
| 应用 | Spring/MyBatis 源码中的设计模式实例 |

## 面试重点

::: warning 高频考点
1. **HashMap 源码**：为什么容量是 2 的幂？红黑树转换阈值为什么是 8 和 6？1.7 扩容死循环是怎么发生的？
2. **AQS 原理**：如何用 state + CLH 队列实现独占/共享锁？
3. **JVM 调优实战**：OOM 怎么排查？CPU 100% 怎么定位？Full GC 频繁如何优化？
4. **线程池核心参数**：最大线程数和核心线程数的区别？优先入队还是优先创建线程？
5. **ConcurrentHashMap**：如何实现线程安全？size 如何计算？1.7 分段锁 vs 1.8 CAS+synchronized？
:::

::: danger 容易翻车的点
- 只背八股文，没有源码阅读经验，被追问细节时露馅
- 对调优参数只会配置，不了解背后的原理
- 并发问题停留在理论，没有实际的线上排查经验
:::

## 学习建议

### 阶段一：理论基础（2 周）
1. 通读《深入理解 Java 虚拟机》前三章，配合 IDEA 运行调试
2. 手写 HashMap 与 ConcurrentHashMap 的核心逻辑（put / get / resize）
3. 用 jstack / jmap / jstat 实际诊断一个模拟的 OOM 场景

### 阶段二：源码深入（3 周）
4. 阅读 AQS / ReentrantLock / ThreadPoolExecutor 源码，画出关键流程图
5. 分析 Netty 中 Reactor 主从模型的代码实现
6. 总结 Spring 源码中使用到的设计模式，每种找一个实例

### 阶段三：实战应用（2 周）
7. 搭建 JMH 基准测试环境，对比不同集合、锁、IO 方式的性能
8. 模拟线上问题场景：死锁、内存泄漏、接口超时，完整走一遍排查流程
9. 阅读阿里 Java 开发手册，逐条理解其背后的原理

::: details 推荐书单
- 《深入理解 Java 虚拟机（第3版）》—— 周志明
- 《Java 并发编程的艺术》—— 方腾飞
- 《Java 并发编程实战》—— Brian Goetz
- 《Effective Java（第3版）》—— Joshua Bloch
- 《Netty 实战》—— Norman Maurer
- 《Head First 设计模式》
:::