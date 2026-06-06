# Java 核心代码示例

> 创建日期：2026-06-06

---

## 模块概览

本模块包含 Java 开发中最核心的三块内功修炼内容：JVM 底层、并发编程、设计模式。这三个方向是 Java 面试的必考领域，也是区分初中高级工程师的关键。

---

## 一、jvm-demo —— JVM 参数调优与问题排查

### 技术栈

| 类别 | 技术 |
|------|------|
| 语言 | Java 17 |
| 构建工具 | Maven |
| JDK 工具 | jps、jstat、jmap、jstack、jinfo、jhat |
| 可视化工具 | JConsole、VisualVM、Arthas |
| GC 日志分析 | GCViewer、GCEasy |

### 学习目标

- 掌握 JVM 内存模型（堆、栈、方法区、直接内存）的运行时状态
- 理解类加载机制（双亲委派模型、自定义类加载器）
- 熟悉常用 GC 算法与回收器（Serial、Parallel、CMS、G1、ZGC）的适用场景
- 能通过 JVM 参数进行 GC 调优（-Xms、-Xmx、-Xmn、-XX:+UseG1GC 等）
- 模拟 OOM（堆溢出、栈溢出、元空间溢出、直接内存溢出）并分析 dump 文件
- 掌握 CPU 飙高、死锁、内存泄漏的排查套路

### 核心实验清单

| 编号 | 实验名称 | 说明 |
|------|----------|------|
| JVM-01 | 堆内存溢出模拟 | 不断创建对象直至 OOM，使用 MAT 分析堆转储 |
| JVM-02 | 栈内存溢出模拟 | 递归调用导致 StackOverflowError |
| JVM-03 | 元空间溢出模拟 | 动态生成大量类填满 Metaspace |
| JVM-04 | 直接内存溢出模拟 | 使用 ByteBuffer.allocateDirect 耗尽直接内存 |
| JVM-05 | GC 日志解析 | 不同 GC 回收器的日志格式对比分析 |
| JVM-06 | 死锁排查实战 | 模拟死锁，使用 jstack + Arthas 定位 |
| JVM-07 | CPU 飙高排查 | 模拟死循环，使用 top + jstack 定位热点线程 |
| JVM-08 | 类加载机制 | 自定义类加载器，验证双亲委派与打破机制 |

### 对应 Wiki 模块

- JVM 内存模型与垃圾回收
- 类加载机制
- JVM 调优实战
- 线上问题排查

### 预计耗时

**40 ~ 50 小时**

---

## 二、concurrency-demo —— Java 并发编程

### 技术栈

| 类别 | 技术 |
|------|------|
| 语言 | Java 17 |
| 构建工具 | Maven |
| 并发基础 | Thread、Runnable、Callable、Future |
| 锁机制 | synchronized、ReentrantLock、ReadWriteLock、StampedLock |
| 原子操作 | AtomicInteger、AtomicReference、LongAdder、CAS 原理 |
| 同步器 | AQS、CountDownLatch、CyclicBarrier、Semaphore、Phaser |
| 线程池 | ThreadPoolExecutor、ScheduledThreadPool、ForkJoinPool |
| 并发集合 | ConcurrentHashMap、CopyOnWriteArrayList、BlockingQueue |
| 异步编程 | CompletableFuture |

### 学习目标

- 理解 Java 内存模型（JMM）中的可见性、有序性、原子性
- 掌握 synchronized 锁升级过程（偏向锁 -> 轻量级锁 -> 重量级锁）
- 理解 AQS（AbstractQueuedSynchronizer）的核心设计与实现原理
- 能根据业务场景合理设计线程池参数（核心线程数、队列类型、拒绝策略）
- 掌握 CAS 无锁编程及其 ABA 问题的解决方案
- 熟练使用 JUC 并发工具类解决实际并发问题
- 理解 CompletableFuture 的链式调用与组合编排

### 核心实验清单

| 编号 | 实验名称 | 说明 |
|------|----------|------|
| CON-01 | 可见性问题演示 | volatile 关键字的作用验证 |
| CON-02 | 锁升级过程 | 打印对象头观察锁状态变化 |
| CON-03 | AQS 源码剖析 | 基于 AQS 实现自定义同步器 |
| CON-04 | 线程池实战 | 不同参数组合下的线程池行为验证 |
| CON-05 | CAS 与 ABA | AtomicStampedReference 解决 ABA 问题 |
| CON-06 | ConcurrentHashMap | 源码级理解分段锁与 CAS 写入 |
| CON-07 | CompletableFuture | 异步编排、异常处理、超时控制 |
| CON-08 | ForkJoinPool | 分治任务：并行计算大数组求和 |
| CON-09 | 生产者-消费者 | 三种实现方式对比（wait/notify、Lock/Condition、BlockingQueue） |

### 对应 Wiki 模块

- Java 内存模型（JMM）
- 锁与同步机制
- 线程池原理与实战
- JUC 并发工具类
- 异步编程

### 预计耗时

**50 ~ 60 小时**

---

## 三、design-patterns —— 23 种设计模式 Java 实现

### 技术栈

| 类别 | 技术 |
|------|------|
| 语言 | Java 17 |
| 构建工具 | Maven |
| 测试框架 | JUnit 5 |

### 学习目标

- 掌握 23 种 GoF 设计模式的类图结构和代码实现
- 理解每种模式的适用场景、优缺点和典型应用
- 能在 Spring 源码、JDK 源码中找到设计模式的实际案例
- 区分相似模式之间的差异（如：策略 vs 状态、装饰器 vs 代理）
- 遵循六大设计原则（SOLID + 迪米特法则）

### 模式清单

#### 创建型模式（5 种）

| 模式 | JDK/Spring 中的案例 |
|------|---------------------|
| 单例模式（Singleton） | Spring Bean 默认单例、Runtime 类 |
| 工厂方法（Factory Method） | Calendar.getInstance() |
| 抽象工厂（Abstract Factory） | javax.sql.DataSource |
| 建造者模式（Builder） | StringBuilder、Lombok @Builder |
| 原型模式（Prototype） | Object.clone()、Spring Bean scope="prototype" |

#### 结构型模式（7 种）

| 模式 | JDK/Spring 中的案例 |
|------|---------------------|
| 适配器模式（Adapter） | Spring HandlerAdapter、InputStreamReader |
| 桥接模式（Bridge） | JDBC Driver |
| 组合模式（Composite） | Spring CompositeCacheManager |
| 装饰器模式（Decorator） | Java IO 流体系（BufferedInputStream） |
| 外观模式（Facade） | SLF4J 日志门面 |
| 享元模式（Flyweight） | Integer 缓存池（-128 ~ 127） |
| 代理模式（Proxy） | Spring AOP、MyBatis Mapper 代理 |

#### 行为型模式（11 种）

| 模式 | JDK/Spring 中的案例 |
|------|---------------------|
| 责任链模式（Chain of Responsibility） | Servlet Filter 链、Spring Interceptor |
| 命令模式（Command） | Runnable 接口 |
| 解释器模式（Interpreter） | Spring EL 表达式 |
| 迭代器模式（Iterator） | java.util.Iterator |
| 中介者模式（Mediator） | Spring MVC DispatcherServlet |
| 备忘录模式（Memento） | 事务回滚、Undo 操作 |
| 观察者模式（Observer） | Spring ApplicationEvent、RxJava |
| 状态模式（State） | 订单状态流转 |
| 策略模式（Strategy） | Comparator 接口、Spring Resource |
| 模板方法（Template Method） | Spring JdbcTemplate、AbstractApplicationContext |
| 访问者模式（Visitor） | ASM 字节码操作 |

### 对应 Wiki 模块

- 设计模式概述与六大原则
- 创建型模式详解
- 结构型模式详解
- 行为型模式详解
- 设计模式在框架中的应用

### 预计耗时

**35 ~ 45 小时**