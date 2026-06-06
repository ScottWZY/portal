# 锁机制

## ⭐ 面试重点速览

| 知识模块 | 重点内容 | 面试频率 |
|----------|----------|----------|
| AQS 原理 | CLH 队列 + state + CAS | 极高 |
| ReentrantLock | 可重入、公平锁 vs 非公平锁 | 极高 |
| synchronized 锁升级 | Mark Word 变化、偏向锁撤销 | 极高 |
| 读写锁 | 读写分离、锁降级 | 高 |
| StampedLock | 乐观读、三种访问模式 | 中 |
| Lock vs synchronized | 功能差异、性能对比 | 极高 |

---

## ⭐ 一、AQS 原理（AbstractQueuedSynchronizer）

### 1.1 核心思想

AQS 是 JUC 中最核心的类，`ReentrantLock`、`CountDownLatch`、`Semaphore` 等工具类的底层实现都依赖它。

::: tip AQS 的核心三要素
1. **state**：一个 `volatile int` 类型的同步状态，通过 CAS 操作修改
2. **CLH 队列**：一个 FIFO 的等待队列，存放等待获取锁的线程
3. **CAS**：无锁操作修改 state，避免重量级锁
:::

```
AQS 架构：

    state（volatile int）
          │
    ┌─────┴─────┐
    │  CAS 修改  │
    └─────┬─────┘
          │
    ┌─────┴──────────────────────────┐
    │         CLH 队列                │
    │  head → Node → Node → ... → tail│
    │  持锁线程  等待线程               │
    └────────────────────────────────┘
```

### 1.2 AQS 的两种模式

| 模式 | 说明 | 实现类 |
|------|------|--------|
| **独占锁** | 同一时刻只有一个线程能获取锁 | `ReentrantLock` |
| **共享锁** | 同一时刻多个线程能同时获取锁 | `CountDownLatch`、`Semaphore`、`ReentrantReadWriteLock` 的读锁 |

### 1.3 state 的含义

```java
// ReentrantLock 中 state 的含义
// state = 0：锁未被占用
// state = 1：锁被占用（重入 1 次）
// state = n：锁被重入 n 次

// Semaphore 中 state 的含义
// state = n：还有 n 个许可证可用
// state = 0：没有许可证，需要等待
```

### 1.4 Node 节点等待状态

```java
static final class Node {
    static final int CANCELLED =  1;  // 线程已取消等待
    static final int SIGNAL    = -1;  // 后继节点需要唤醒
    static final int CONDITION = -2;  // 线程在 Condition 上等待
    static final int PROPAGATE = -3;  // 共享模式下唤醒需要传播
    // ...
}
```

### 1.5 获取锁的核心流程

```java
/**
 * AQS 独占锁获取流程（简化）
 */
public final void acquire(int arg) {
    // 1. 尝试获取锁（tryAcquire 由子类实现）
    if (!tryAcquire(arg)) {
        // 2. 获取失败，入队
        Node node = addWaiter(Node.EXCLUSIVE);
        // 3. 进入等待，直到获取锁或被中断
        if (acquireQueued(node, arg)) {
            selfInterrupt();
        }
    }
}
```

---

## ⭐ 二、ReentrantLock 源码分析

### 2.1 可重入特性

ReentrantLock 支持**可重入**：同一个线程可以多次获取同一把锁，通过 `state` 累加实现。

```java
public class ReentrantDemo {
    private static ReentrantLock lock = new ReentrantLock();

    public static void main(String[] args) {
        lock.lock();
        try {
            System.out.println("第一次获取锁");
            lock.lock();  // 可重入，state 变为 2
            try {
                System.out.println("重入获取锁");
            } finally {
                lock.unlock();  // state 变为 1
            }
        } finally {
            lock.unlock();  // state 变为 0，释放锁
        }
    }
}
```

### 2.2 ⭐ 公平锁 vs 非公平锁

| 维度 | 公平锁 | 非公平锁 |
|------|--------|----------|
| 获取顺序 | 按请求顺序获取，先到先得 | 不保证顺序，可能出现插队 |
| 性能 | 需要维护队列，吞吐量较低 | 吞吐量较高，减少线程切换 |
| 线程饥饿 | 不会 | 可能发生 |
| 实现 | 直接入队等待 | 先尝试 CAS 抢锁，抢不到再入队 |

```java
// 公平锁 vs 非公平锁的 tryAcquire 区别

// 非公平锁：先 CAS 抢一下
final boolean nonfairTryAcquire(int acquires) {
    final Thread current = Thread.currentThread();
    int c = getState();
    if (c == 0) {
        if (compareAndSetState(0, acquires)) { // CAS 直接抢
            setExclusiveOwnerThread(current);
            return true;
        }
    }
    // ... 重入判断
}

// 公平锁：先检查队列中是否有人在排
protected final boolean tryAcquire(int acquires) {
    final Thread current = Thread.currentThread();
    int c = getState();
    if (c == 0) {
        if (!hasQueuedPredecessors() && // 检查队列中是否有人排队
            compareAndSetState(0, acquires)) {
            setExclusiveOwnerThread(current);
            return true;
        }
    }
    // ... 重入判断
}
```

::: tip 默认非公平锁
`ReentrantLock` 默认是非公平锁。非公平锁性能更好，因为减少了线程切换次数。但如果业务需要严格按顺序执行，选择公平锁。
:::

### 2.3 ReentrantLock 使用模板

```java
ReentrantLock lock = new ReentrantLock();
lock.lock();
try {
    // 临界区代码
} finally {
    lock.unlock();  // ⚠️ 必须在 finally 中释放锁！
}
```

---

## ⭐ 三、synchronized 锁升级深入

### 3.1 锁升级全景

从 JDK 6 开始，`synchronized` 引入了**锁升级**机制，避免权重级锁的直接开销。

```
无锁 ──▶ 偏向锁 ──▶ 轻量级锁 ──▶ 重量级锁
  │         │            │
  │  只有一个线程         │
  │  反复获取锁           │
  │                      │
  │              多个线程 CAS 竞争
  │              没有实际阻塞
  │                      │
  │              自旋超过阈值
  │              或竞争激烈
  │                      │
  └──────────────────────┘
```

### 3.2 Mark Word 变化

对象头中的 Mark Word 在不同锁状态下结构不同（64 位 JVM）：

| 锁状态 | 标志位 | Mark Word 存储内容 |
|--------|--------|-------------------|
| 无锁 | 01 | 哈希码 + 分代年龄 |
| 偏向锁 | 01 | 线程 ID + Epoch + 分代年龄 |
| 轻量级锁 | 00 | 指向栈帧中 Lock Record 的指针 |
| 重量级锁 | 10 | 指向 Monitor 的指针 |
| GC 标记 | 11 | 空 |

### 3.3 偏向锁

**原理**：当锁被同一个线程反复获取时，在对象头中记录该线程 ID，下次获取时只需要检查线程 ID 是否匹配，无需 CAS 操作。

**偏向锁撤销**：当另一个线程尝试获取该偏向锁时，偏向锁会被撤销。撤销需要在**安全点**进行，会 STW。

```java
// 偏向锁延迟（JVM 启动时默认有 4s 延迟）
// -XX:BiasedLockingStartupDelay=0  // 取消延迟，立即启用偏向锁
```

::: warning JDK 15+ 偏向锁被废弃
JDK 15 默认禁用偏向锁（`-XX:-UseBiasedLocking`），JDK 21 完全移除偏向锁实现。原因是现代应用多用线程池，偏向锁的撤销开销往往大于收益。
:::

### 3.4 轻量级锁

**原理**：当另一个线程尝试获取已被偏向的锁时，偏向锁升级为轻量级锁。轻量级锁通过 **CAS + 自旋**获取锁。

```
轻量级锁获取过程：
  1. 在线程栈帧中创建 Lock Record
  2. 将对象头的 Mark Word 复制到 Lock Record
  3. CAS 尝试将对象头 Mark Word 替换为指向 Lock Record 的指针
  4. CAS 成功 → 获取轻量级锁成功
  5. CAS 失败 → 自旋重试
```

### 3.5 重量级锁

当自旋次数超过阈值（默认 10 次）或自旋线程超过 CPU 核数一半，轻量级锁膨胀为**重量级锁**。

重量级锁依赖操作系统的 `mutex`，涉及**用户态和内核态的切换**，开销大。

---

## 四、读写锁 ReentrantReadWriteLock

### 4.1 读写锁规则

| 场景 | 是否互斥 |
|------|----------|
| 读 + 读 | ✅ 不互斥（可以并发读） |
| 读 + 写 | ❌ 互斥 |
| 写 + 写 | ❌ 互斥 |

::: tip 适用场景
**读多写少**的场景，比如缓存、配置中心等。读写锁可以让读操作并发执行，大幅提升吞吐量。
:::

### 4.2 使用示例

```java
public class ReadWriteLockDemo {
    private final ReadWriteLock rwLock = new ReentrantReadWriteLock();
    private final Map<String, String> cache = new HashMap<>();
    private volatile boolean cacheValid = false;

    // 读操作 —— 使用读锁，读读不互斥
    public String get(String key) {
        rwLock.readLock().lock();
        try {
            // 多个读线程可以同时进入
            return cache.get(key);
        } finally {
            rwLock.readLock().unlock();
        }
    }

    // 写操作 —— 使用写锁，读写互斥，写写互斥
    public void put(String key, String value) {
        rwLock.writeLock().lock();
        try {
            // 只有一个写线程能进入，同时排除所有读线程
            cache.put(key, value);
        } finally {
            rwLock.writeLock().unlock();
        }
    }
}
```

### 4.3 ⭐ 锁降级

锁降级：获取写锁后，再获取读锁，然后释放写锁的过程。**写锁降级为读锁**。

```java
// 锁降级示例
rwLock.writeLock().lock();
try {
    // 修改数据
    cache.put("key", "newValue");
    // 先获取读锁再释放写锁
    rwLock.readLock().lock();
} finally {
    rwLock.writeLock().unlock();  // 释放写锁
}
// 现在持有读锁
try {
    // 读取数据
    return cache.get("key");
} finally {
    rwLock.readLock().unlock();
}
```

::: danger 为什么不支持锁升级？
读写锁不支持锁升级（读锁升级为写锁）。原因是读锁允许并发持有，如果多个线程同时想从读锁升级到写锁，会造成死锁。
:::

---

## 五、StampedLock

StampedLock 是 JDK 8 引入的读写锁优化，提供三种访问模式：

| 模式 | 方法 | 特点 |
|------|------|------|
| 读锁 | `readLock()` | 悲观读锁，与写锁互斥 |
| 写锁 | `writeLock()` | 独占写锁，与读锁和写锁互斥 |
| 乐观读 | `tryOptimisticRead()` | 不阻塞写锁，需要验证 stamp 是否变化 |

```java
/**
 * ⭐ StampedLock 乐观读示例
 */
public class StampedLockDemo {
    private final StampedLock sl = new StampedLock();
    private int x, y;

    // 乐观读 —— 不阻塞写操作，性能最高
    public double distanceFromOrigin() {
        long stamp = sl.tryOptimisticRead();  // 获取乐观读戳记
        int currentX = x, currentY = y;
        if (!sl.validate(stamp)) {  // 验证戳记是否有效
            // 乐观读期间数据被修改，升级为悲观读锁
            stamp = sl.readLock();
            try {
                currentX = x;
                currentY = y;
            } finally {
                sl.unlockRead(stamp);
            }
        }
        return Math.sqrt(currentX * currentX + currentY * currentY);
    }

    // 写操作
    public void move(int deltaX, int deltaY) {
        long stamp = sl.writeLock();
        try {
            x += deltaX;
            y += deltaY;
        } finally {
            sl.unlockWrite(stamp);
        }
    }
}
```

::: tip 乐观读的优势
- 乐观读不阻塞写操作，适合读写比例极高的场景
- 通过 stamp 验证数据是否被修改，如果被修改则回退到悲观读
:::

---

## ⭐ 六、Lock vs synchronized 对比

| 维度 | synchronized | Lock（ReentrantLock） |
|------|-------------|----------------------|
| 实现层面 | JVM 关键字，底层由 C++ 实现 | JDK API，纯 Java 实现 |
| 锁释放 | 自动释放（代码块结束/异常退出） | 必须手动 unlock（finally 中） |
| 可中断 | 不可中断，要么获取锁要么阻塞 | 可中断（`lockInterruptibly()`） |
| 公平锁 | 非公平 | 可选公平/非公平 |
| 尝试获取锁 | 不支持 | 支持 `tryLock()`，可设置超时 |
| 条件变量 | 单一 `wait/notify` | 多个 `Condition`，更精细 |
| 性能 | JDK 6+ 优化后接近 | 略高（更灵活） |
| 适用场景 | 简单同步，代码块小 | 需要灵活控制，复杂场景 |

---

## ⭐ 面试高频问题

### Q1：AQS 的原理是什么？

AQS 核心三要素：
1. **state**：volatile int，代表同步状态，CAS 修改
2. **CLH 队列**：FIFO 等待队列，存放竞争锁失败的线程
3. **模板方法**：`tryAcquire`/`tryRelease` 由子类实现，`acquire`/`release` 提供模板

### Q2：ReentrantLock 的可重入是怎么实现的？

通过 `state` 累加：每次获取锁 state +1，释放锁 state -1。state 为 0 时完全释放锁。同时判断持有锁的线程是否等于当前线程。

### Q3：公平锁和非公平锁的区别？

- 公平锁：按请求顺序获取锁，先到先得，需要检查队列中是否有等待者
- 非公平锁：先 CAS 抢锁，抢不到再入队，吞吐量更高但可能饥饿

### Q4：synchronized 的锁升级过程？

无锁 → 偏向锁 → 轻量级锁（CAS + 自旋）→ 重量级锁（OS mutex）

每个阶段都是为了减少锁竞争带来的开销，让锁在低竞争场景下保持高性能。

### Q5：synchronized 和 ReentrantLock 的性能对比？JDK 版本演进带来了什么变化？

| JDK 版本 | synchronized | ReentrantLock | 结论 |
|----------|-------------|---------------|------|
| JDK 5 | 重量级锁（OS mutex），性能差 | ReentrantLock 刚推出，性能优势明显 | Lock 完胜 |
| JDK 6 | 引入锁升级（偏向/轻量级/自旋），性能大幅提升 | 维持原有优势 | 差距缩小 |
| JDK 7~8 | 持续优化（锁消除、锁粗化） | 维持 | 基本持平 |
| JDK 15+ | 移除偏向锁，简化实现 | 维持 | 各有优势 |

**当前建议**：
- 在低竞争场景下，两者性能几乎无差异
- `synchronized` 代码更简洁，JVM 自动优化，**优先使用**
- 需要 `tryLock`、可中断锁、公平锁、多 Condition 时用 `ReentrantLock`

**JDK 15+ 移除偏向锁的原因**：偏向锁的维护和撤销成本在现代应用中（线程池复用线程）往往大于收益，反而拖累性能。

---

## 面试追问环节

**Q：为什么说 "synchronized 是重量级锁" 已经过时了？**

JDK 6 之前，synchronized 直接使用 OS mutex，涉及用户态/内核态切换，确实是重量级锁。但 JDK 6 引入了偏向锁、轻量级锁、自旋优化后，synchronized 在低竞争场景下性能已经和 ReentrantLock 非常接近。JDK 15+ 更是通过移除偏向锁进一步简化了实现。

**Q：什么时候用 synchronized，什么时候用 ReentrantLock？**

- 简单同步场景，用 `synchronized`（自动释放锁，不担心忘记 unlock）
- 需要支持超时、可中断、公平锁、多个 Condition 等高级功能时，用 `ReentrantLock`
- 默认优先用 `synchronized`，不够用再换 `ReentrantLock`

**Q：ReentrantReadWriteLock 的锁降级是什么？为什么需要锁降级？**

锁降级：持有写锁 → 获取读锁 → 释放写锁（现在持有读锁）。

场景：先修改数据，然后需要立即读取数据。在释放写锁之前获取读锁，可以保证在释放写锁后、读取数据之前，不会有其他写线程修改数据，保证数据一致性。

**Q：StampedLock 和 ReentrantReadWriteLock 的区别？**

- `ReentrantReadWriteLock`：可重入、读写互斥
- `StampedLock`：不可重入、增加乐观读模式，性能更高，但使用更复杂
- 如果读多写少且对性能要求高，可以考虑 StampedLock