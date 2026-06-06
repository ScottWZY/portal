# Java 高级部分（java-advanced）完善计划

## 摘要

在现有 VitePress 知识库基础上，按面试导向文档风格，分五个阶段、17 个任务，完成 Java 高级部分剩余全部文档的编写，预计总篇幅约 7850 行。

---

## 当前状态分析

### 已完成内容
| 文件 | 状态 | 篇幅 |
|------|------|------|
| `java-advanced/index.md` | ✅ 已完成 | 模块总览 |
| `jvm/index.md` | ✅ 已完成 | JVM 概览 |
| `jvm/memory-model.md` | ✅ 已完成 | ~450 行 |
| `jvm/gc.md` | ✅ 已完成 | ~500 行 |
| `concurrency/index.md` | ✅ 已完成 | ~687 行 |

### 文档风格（所有新文档必须遵循）
- 面试导向：开头「面试重点速览」表格，结尾面试问答汇总
- 图表：Mermaid 流程图、对比表格
- 代码示例：简洁可运行的 Java 代码
- 提示容器：`::: tip` / `::: warning` / `::: danger`
- 篇幅：每篇 400-700 行

### 待创建的子目录
- `java-advanced/collections/`
- `java-advanced/io-nio/`
- `java-advanced/design-patterns/`

---

## 任务清单

### 📌 第一阶段：JVM 剩余部分（🔥 最高优先级）

#### 任务 1.1：`jvm/classloader.md` - 类加载机制
- 类加载生命周期（加载→验证→准备→解析→初始化）
- 类加载器分类（Bootstrap / Extension / Application / 自定义）
- ⭐ 双亲委派模型原理与破坏场景（SPI/JDBC、Tomcat、OSGi）
- 自定义类加载器与热加载
- 预计：500-600 行

#### 任务 1.2：`jvm/tuning.md` - JVM 性能调优
- JVM 参数分类与速查
- GC 日志解读（格式、字段含义、分析案例）
- 监控工具：jps/jstat/jmap/jstack/jvisualvm/MAT/Arthas
- ⭐ OOM 排查实战（heap space / Metaspace / StackOverflow）
- 调优实战（收集器选择、参数配置、案例分析）
- 预计：600-700 行

---

### 📌 第二阶段：并发编程（🔥 最高优先级）

#### 任务 2.1：`concurrency/threadpool.md` - 线程池
- ⭐ ThreadPoolExecutor 七大参数详解
- 线程池工作流程（Mermaid 流程图）
- 四种拒绝策略对比
- 五种线程池创建方式对比（为什么不推荐 Executors？）
- 线程池配置准则（CPU 密集 vs IO 密集）
- ForkJoinPool 与 CompletableFuture
- 预计：550-650 行

#### 任务 2.2：`concurrency/locks.md` - 锁机制
- ⭐ AQS 原理（CLH 队列 + state + CAS）
- ReentrantLock 源码分析（公平锁 vs 非公平锁）
- synchronized 锁升级深入（Mark Word 变化、偏向锁撤销）
- 读写锁 ReentrantReadWriteLock（读读不互斥、锁降级）
- StampedLock 乐观读
- Lock vs synchronized 对比
- 预计：600-700 行

#### 任务 2.3：`concurrency/juc.md` - JUC 工具类
- CountDownLatch（等待其他线程完成）
- CyclicBarrier（互相等待到齐）
- Semaphore（限流控制）
- Exchanger（线程间交换数据）
- Phaser（多阶段同步）
- LockSupport（park/unpark）
- 预计：400-500 行

#### 任务 2.4：`concurrency/practice.md` - 并发编程实战
- 死锁排查（四个条件、jstack 定位、避免方法）
- 生产者消费者模型（wait/notify、Condition、BlockingQueue 三种实现）
- ⭐ ThreadLocal（原理、弱引用、内存泄漏、使用场景）
- 并发设计模式（线程封闭、乐观锁 vs 悲观锁）
- 预计：500-600 行

---

### 📌 第三阶段：集合框架（🟠 中高优先级）

#### 任务 3.1：`collections/index.md` - 集合概览
- 整体架构图（Mermaid）
- Collection vs Collections 区别
- fail-fast vs fail-safe 机制
- 集合选型对比表
- 预计：200-300 行

#### 任务 3.2：`collections/hashmap.md` - HashMap 源码分析
- 底层结构：数组 + 链表 + 红黑树
- 哈希函数与索引定位（为什么长度是 2 的幂？）
- ⭐ JDK 1.7 vs 1.8 区别（头插法→尾插法、链表→红黑树）
- 扩容机制（扩容因子 0.75 原因、高低位拆分）
- 红黑树转换（阈值 8 和 6 的原因）
- ⭐ 1.7 并发扩容死循环分析（画图说明）
- put 方法完整流程
- 预计：600-700 行

#### 任务 3.3：`collections/concurrenthashmap.md` - ConcurrentHashMap
- JDK 1.7 分段锁（Segment + HashEntry）
- ⭐ JDK 1.8 改进（synchronized + CAS + Node）
- size 计算（1.7 分段累加 vs 1.8 baseCount + CounterCells）
- put 流程分析
- 与 HashMap、Hashtable 对比
- 预计：500-600 行

#### 任务 3.4：`collections/list.md` - ArrayList vs LinkedList
- ArrayList 底层数组 + 扩容机制（1.5 倍）
- LinkedList 底层双向链表
- 对比分析（随机访问、插入删除、空间占用）
- fail-fast 机制原理（modCount）
- Vector 为什么被淘汰
- 预计：400-500 行

---

### 📌 第四阶段：IO/NIO（🟡 中等优先级）

#### 任务 4.1：`io-nio/index.md` - IO 模型概览
- BIO/NIO/AIO 三种模型对比
- 操作系统五种 IO 模型
- select/poll/epoll 区别
- 预计：300-400 行

#### 任务 4.2：`io-nio/nio.md` - NIO 核心
- 三大组件：Buffer、Channel、Selector
- Buffer 四个属性（capacity/position/limit/mark）
- ⭐ Selector 多路复用原理
- ⭐ 零拷贝（传统 vs mmap vs sendFile，DMA 优化）
- 预计：500-600 行

#### 任务 4.3：`io-nio/netty.md` - Netty 入门
- ⭐ Reactor 模式（单线程/多线程/主从）
- Netty 架构（Bootstrap/EventLoopGroup/Pipeline）
- Pipeline 责任链处理
- 粘包拆包问题与解决方案
- Netty 零拷贝优化
- 预计：500-600 行

---

### 📌 第五阶段：设计模式（🟡 中等优先级）

#### 任务 5.1：`design-patterns/index.md` - 设计模式概览
- 三大分类与 23 种模式索引
- SOLID 原则简述
- 面试高频模式提示
- 预计：200-300 行

#### 任务 5.2：`design-patterns/creational.md` - 创建型模式
- ⭐ 单例模式五种写法（饿汉/懒汉/DCL/静态内部类/枚举）
- DCL 为什么需要 volatile？
- 序列化与反射破坏单例
- 工厂模式（简单工厂/工厂方法/抽象工厂）
- 建造者模式（Builder 链式调用）
- 原型模式（浅克隆 vs 深克隆）
- 预计：450-550 行

#### 任务 5.3：`design-patterns/structural.md` - 结构型模式
- ⭐ 代理模式（JDK 动态代理 vs CGLIB、Spring AOP 选择逻辑）
- 装饰器模式（IO 类应用、与代理模式区别）
- 适配器模式（类适配器 vs 对象适配器）
- 预计：400-500 行

#### 任务 5.4：`design-patterns/behavioral.md` - 行为型模式
- ⭐ 观察者模式（Spring ApplicationListener）
- ⭐ 策略模式（避免大量 if-else）
- ⭐ 模板方法模式（Spring JDBC 应用）
- ⭐ 责任链模式（Servlet Filter、Spring Security）
- 预计：500-600 行

---

## 推进顺序

```
第一阶段（JVM 剩余：2 个任务）
    ↓
第二阶段（并发剩余：4 个任务）
    ↓
第三阶段（集合框架：4 个任务）
    ↓
第四阶段（IO/NIO：3 个任务）
    ↓
第五阶段（设计模式：4 个任务）
```

**依赖说明**：JVM 和并发是面试最高频考点，优先完成。后续阶段相互独立，可灵活调整顺序。

---

## 汇总统计

| 阶段 | 模块 | 优先级 | 任务数 | 预计行数 |
|------|------|--------|--------|----------|
| 一 | JVM 剩余 | 🔴 最高 | 2 | ~1100 |
| 二 | 并发剩余 | 🔴 最高 | 4 | ~2200 |
| 三 | 集合框架 | 🟠 中高 | 4 | ~1700 |
| 四 | IO/NIO | 🟡 中等 | 3 | ~1300 |
| 五 | 设计模式 | 🟡 中等 | 4 | ~1550 |
| **合计** | | | **17** | **~7850** |

---

## 假设与决策

1. **文档风格**：沿用现有文档的面试导向风格（速览表格 + 章节 + 代码示例 + 面试问答）
2. **篇幅控制**：每篇 400-700 行，重点内容不超过 800 行
3. **VitePress 配置**：侧边栏已配置好所有链接，不需要修改 config.js
4. **子目录**：需要创建 `collections/`、`io-nio/`、`design-patterns/` 三个子目录
5. **推进方式**：按阶段逐步推进，每完成一个阶段用户确认后继续下一阶段

---

## 验证步骤

1. 每完成一个文档，检查 VitePress 侧边栏链接是否正确
2. 确保 Mermaid 图表语法正确，能在 VitePress 中正常渲染
3. 确保代码示例语法正确（Java 代码块使用 `java` 标记）
4. 确保所有容器（tip/warning/danger）语法正确
5. 完成后运行 `npx vitepress dev docs` 验证页面显示效果