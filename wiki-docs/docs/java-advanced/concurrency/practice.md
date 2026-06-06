# 并发编程实战

## ⭐ 面试重点速览

| 知识模块 | 重点内容 | 面试频率 |
|----------|----------|----------|
| 死锁排查 | 四个必要条件、jstack 检测、避免方法 | 极高 |
| 生产者消费者 | wait/notify、Condition、BlockingQueue 三种实现 | 极高 |
| ThreadLocal | 原理、内存泄漏、使用场景 | 极高 |
| 并发模式 | 线程封闭、不变性、乐观锁 vs 悲观锁 | 中高 |

---

## ⭐ 一、死锁排查与解决

### 1.1 死锁四个必要条件

| 条件 | 说明 |
|------|------|
| **互斥** | 资源只能被一个线程占用 |
| **持有并等待** | 线程已持有资源 A，还要等待资源 B，同时不释放资源 A |
| **不可抢占** | 其他线程不能强行抢走已占有的资源 |
| **循环等待** | 线程 1 等线程 2 的资源，线程 2 等线程 1 的资源 |

### 1.2 死锁代码示例

```java
/**
 * ⭐ 经典死锁场景：两个线程互相等待对方释放锁
 */
public class DeadLockDemo {
    private static final Object lockA = new Object();
    private static final Object lockB = new Object();

    public static void main(String[] args) {
        // 线程 1：先获取 lockA，再获取 lockB
        new Thread(() -> {
            synchronized (lockA) {
                System.out.println("线程 1：持有 lockA");
                try { Thread.sleep(100); } catch (InterruptedException e) {}
                synchronized (lockB) {
                    System.out.println("线程 1：获取 lockB");
                }
            }
        }, "Thread-1").start();

        // 线程 2：先获取 lockB，再获取 lockA
        new Thread(() -> {
            synchronized (lockB) {
                System.out.println("线程 2：持有 lockB");
                try { Thread.sleep(100); } catch (InterruptedException e) {}
                synchronized (lockA) {
                    System.out.println("线程 2：获取 lockA");
                }
            }
        }, "Thread-2").start();

        // 两个线程互相等待，形成死锁，程序永远不会结束
    }
}
```

### 1.3 ⭐ 死锁排查

**方法一：jstack**

```bash
# 1. 获取进程 PID
jps -l

# 2. 查看线程堆栈（jstack 会自动检测死锁）
jstack <pid>

# 输出会包含死锁检测结果：
# Found one Java-level deadlock:
# =============================
# "Thread-2":
#   waiting to lock monitor ... (Object@0x...)
#   which is held by "Thread-1"
# "Thread-1":
#   waiting to lock monitor ... (Object@0x...)
#   which is held by "Thread-2"
```

**方法二：Arthas**

```bash
# 一键检测死锁
thread -b
```

### 1.4 避免死锁的方法

破坏四个必要条件之一：

| 方法 | 破坏的条件 | 具体做法 |
|------|-----------|----------|
| **按顺序获取锁** | 循环等待 | 所有线程以相同顺序获取多把锁 |
| **限时等待** | 持有并等待 | 用 `tryLock(timeout)` 替代 `lock()` |
| **一次性获取所有锁** | 持有并等待 | 获取不到就全部释放重试 |
| **减少锁粒度** | 互斥 | 用乐观锁、无锁结构替代 |

```java
// 方案一：按相同顺序获取锁（最实用）
// 线程 1 和线程 2 都先取 lockA 再取 lockB，就不会死锁

// 方案二：tryLock 超时
ReentrantLock lockA = new ReentrantLock();
ReentrantLock lockB = new ReentrantLock();
while (true) {
    if (lockA.tryLock(1, TimeUnit.SECONDS)) {
        try {
            if (lockB.tryLock(1, TimeUnit.SECONDS)) {
                try {
                    // 两把锁都获取到，执行业务
                    break;
                } finally {
                    lockB.unlock();
                }
            }
        } finally {
            lockA.unlock();
        }
    }
    // 没拿到全部锁，随机等待后重试
    Thread.sleep((long) (Math.random() * 100));
}
```

---

## ⭐ 二、生产者消费者模型

### 2.1 方式一：wait/notify

```java
/**
 * ⭐ 生产者消费者 —— wait/notify 实现
 */
public class ProducerConsumerWait {
    private static final int MAX_SIZE = 10;
    private static final LinkedList<Integer> queue = new LinkedList<>();
    private static final Object lock = new Object();

    // 生产者
    static class Producer implements Runnable {
        @Override
        public void run() {
            synchronized (lock) {
                while (queue.size() >= MAX_SIZE) {
                    try {
                        lock.wait();  // 队列满了，等待
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }
                }
                int value = (int) (Math.random() * 100);
                queue.add(value);
                System.out.println("生产：" + value + "，队列大小：" + queue.size());
                lock.notifyAll();  // 唤醒消费者
            }
        }
    }

    // 消费者
    static class Consumer implements Runnable {
        @Override
        public void run() {
            synchronized (lock) {
                while (queue.isEmpty()) {
                    try {
                        lock.wait();  // 队列空了，等待
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }
                }
                int value = queue.removeFirst();
                System.out.println("消费：" + value + "，队列大小：" + queue.size());
                lock.notifyAll();  // 唤醒生产者
            }
        }
    }
}
```

::: warning 为什么用 while 而不是 if？
必须用 `while` 循环而不是 `if` 判断条件，防止**虚假唤醒**（线程在没有 notify 的情况下被唤醒）。
```java
// ❌ 错误：if 只会判断一次，虚假唤醒后直接执行不安全的代码
if (queue.isEmpty()) {
    lock.wait();
}

// ✅ 正确：while 在被唤醒后重新检查条件
while (queue.isEmpty()) {
    lock.wait();
}
```
:::

### 2.2 方式二：ReentrantLock + Condition

```java
/**
 * ⭐ 生产者消费者 —— ReentrantLock + Condition 实现
 */
public class ProducerConsumerCondition {
    private static final int MAX_SIZE = 10;
    private static final LinkedList<Integer> queue = new LinkedList<>();
    private static final ReentrantLock lock = new ReentrantLock();
    private static final Condition notFull = lock.newCondition();
    private static final Condition notEmpty = lock.newCondition();

    static class Producer implements Runnable {
        @Override
        public void run() {
            lock.lock();
            try {
                while (queue.size() >= MAX_SIZE) {
                    notFull.await();  // 等待 notFull 条件
                }
                int value = (int) (Math.random() * 100);
                queue.add(value);
                System.out.println("生产：" + value);
                notEmpty.signalAll();  // 通知消费者队列不空了
            } catch (InterruptedException e) {
                e.printStackTrace();
            } finally {
                lock.unlock();
            }
        }
    }

    static class Consumer implements Runnable {
        @Override
        public void run() {
            lock.lock();
            try {
                while (queue.isEmpty()) {
                    notEmpty.await();  // 等待 notEmpty 条件
                }
                int value = queue.removeFirst();
                System.out.println("消费：" + value);
                notFull.signalAll();  // 通知生产者队列不满了
            } catch (InterruptedException e) {
                e.printStackTrace();
            } finally {
                lock.unlock();
            }
        }
    }
}
```

### 2.3 方式三：BlockingQueue（最推荐）

```java
/**
 * ⭐ 生产者消费者 —— BlockingQueue 实现（最简单高效）
 */
public class ProducerConsumerBlockingQueue {
    private static final BlockingQueue<Integer> queue = new LinkedBlockingQueue<>(10);

    static class Producer implements Runnable {
        @Override
        public void run() {
            try {
                int value = (int) (Math.random() * 100);
                queue.put(value);  // 队列满了会自动阻塞
                System.out.println("生产：" + value);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }

    static class Consumer implements Runnable {
        @Override
        public void run() {
            try {
                int value = queue.take();  // 队列空了会自动阻塞
                System.out.println("消费：" + value);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }
}
```

::: tip 三种实现对比
| 实现方式 | 复杂度 | 灵活性 | 适用场景 |
|----------|--------|--------|----------|
| wait/notify | 高 | 低 | 基础理解 |
| Condition | 中 | 高（多个条件） | 需要精确唤醒 |
| BlockingQueue | 低 | 中 | ⭐ 生产环境推荐 |
:::

---

## ⭐ 三、ThreadLocal

### 3.1 原理

ThreadLocal 为每个线程提供**独立的变量副本**，线程之间互不影响。

```java
// ⭐ ThreadLocal 原理示意（简化）
public class ThreadLocal<T> {
    // 每个线程都从自己的 Thread 对象中获取 ThreadLocalMap
    public T get() {
        Thread t = Thread.currentThread();
        ThreadLocalMap map = getMap(t);  // 获取当前线程的 ThreadLocalMap
        if (map != null) {
            ThreadLocalMap.Entry e = map.getEntry(this);
            if (e != null)
                return (T) e.value;
        }
        return setInitialValue();
    }
    // ThreadLocalMap 存在每个 Thread 对象中
    ThreadLocalMap getMap(Thread t) {
        return t.threadLocals;
    }
}
```

```
每个线程的 Thread 对象中都有一个 ThreadLocalMap

Thread-1:  ThreadLocalMap { ThreadLocal_A -> value1, ThreadLocal_B -> value2 }
Thread-2:  ThreadLocalMap { ThreadLocal_A -> value3, ThreadLocal_B -> value4 }
```

### 3.2 ⭐ 内存泄漏问题

::: danger 为什么会内存泄漏？

ThreadLocalMap 中的 Entry 继承了 **WeakReference**，key（ThreadLocal 对象）是弱引用，value 是强引用。

```
Entry extends WeakReference<ThreadLocal<?>>
    key (弱引用) → ThreadLocal 对象
    value (强引用) → 实际存储的值
```

当 ThreadLocal 对象没有外部强引用时，GC 会回收它。但 Entry 中的 **value 仍然有强引用**，导致 value 无法被回收！

更糟糕的是：线程池中的线程不会销毁，`Thread.threadLocals` 会一直存在，导致内存泄漏。
:::

```java
/**
 * ⭐ 正确的 ThreadLocal 使用方式
 */
public class ThreadLocalBestPractice {
    // 1. 声明为 static，避免重复创建
    // 2. 必须是 private static final
    private static final ThreadLocal<SimpleDateFormat> DATE_FORMAT =
        ThreadLocal.withInitial(() -> new SimpleDateFormat("yyyy-MM-dd HH:mm:ss"));

    public static String format(Date date) {
        return DATE_FORMAT.get().format(date);
    }

    // ⭐ 3. 使用完毕后调用 remove() 清除！（线程池环境中尤其重要）
    public static void cleanUp() {
        DATE_FORMAT.remove();
    }
}
```

::: tip 避免内存泄漏的最佳实践
1. **必须**：使用完毕后调用 `remove()` 清除
2. 使用 `private static final` 修饰，保证 ThreadLocal 本身不会被 GC
3. 在线程池中，在 finally 块中执行 `remove()`
:::

### 3.3 使用场景

| 场景 | 说明 | 示例 |
|------|------|------|
| **线程上下文传递** | 不需要传参，随时获取 | 当前用户信息、请求 ID、TraceId |
| **线程安全工具** | 避免加锁，每个线程一个实例 | SimpleDateFormat、Random、数据库连接 |
| **避免参数传递** | 上一层方法不依赖，只在最底层使用 | 事务上下文 |

### 3.4 InheritableThreadLocal

可以让**子线程继承父线程**的 ThreadLocal 值：

```java
public class InheritableThreadLocalDemo {
    private static final InheritableThreadLocal<String> context = new InheritableThreadLocal<>();

    public static void main(String[] args) {
        context.set("主线程数据");

        new Thread(() -> {
            // ⭐ 子线程可以获取父线程设置的值
            System.out.println(context.get());  // "主线程数据"

            // ⚠️ 注意：线程池环境下，如果子线程被复用，可能拿到旧数据
        }).start();
    }
}
```

---

## 四、并发设计模式

### 4.1 线程封闭

**将数据限制在单个线程内**，天生线程安全。

```java
// 方式一：栈封闭 —— 局部变量天然线程安全
public void safeMethod() {
    int local = 0;  // 每个线程有自己的栈，互不影响
    local++;
}

// 方式二：ThreadLocal —— 线程级全局变量
private static final ThreadLocal<Connection> connHolder = new ThreadLocal<>();
```

### 4.2 不变性（Immutable）

对象创建后状态不可变，天然线程安全。

```java
/**
 * ⭐ 不可变对象 —— 线程安全
 */
public final class ImmutablePoint {  // final 防止继承
    private final int x;             // final 防止修改
    private final int y;

    public ImmutablePoint(int x, int y) {
        this.x = x;
        this.y = y;
    }

    // 只提供 getter，不提供 setter
    public int getX() { return x; }
    public int getY() { return y; }
}
```

Java 中不可变对象的例子：`String`、`Integer`、`BigDecimal` 等包装类。

### 4.3 乐观锁 vs 悲观锁

| 维度 | 悲观锁 | 乐观锁 |
|------|--------|--------|
| 思想 | 认为别人会改，先加锁保护 | 认为别人不会改，提交时检查 |
| 实现 | `synchronized`、`ReentrantLock` | CAS（`AtomicInteger` 等）、版本号 |
| 适用场景 | 写多读少、竞争激烈 | 读多写少、冲突少 |
| 开销 | 上下文切换大 | 冲突多时空转自旋开销大 |

```java
// 悲观锁 —— synchronized
synchronized (lock) {
    count++;
}

// 乐观锁 —— CAS
AtomicInteger atomicCount = new AtomicInteger(0);
atomicCount.incrementAndGet();  // 线程安全的 i++
```

---

## ⭐ 面试高频问题

### Q1：如何排查和避免死锁？

- 排查：`jstack <pid>` 或 Arthas `thread -b`
- 避免：按顺序获取锁、`tryLock` 超时、减少锁粒度

### Q2：生产者消费者模型有哪些实现方式？

1. `wait/notify`：基础方式，需要手动同步
2. `ReentrantLock + Condition`：更灵活，支持多个条件
3. `BlockingQueue`：最推荐，简单高效

### Q3：ThreadLocal 的内存泄漏是怎么回事？如何避免？

ThreadLocalMap 的 Entry 的 key 是弱引用，当 ThreadLocal 对象被 GC 后，key 变成 null，但 value 仍然强引用存在，导致内存泄漏。

**避免方法**：使用完毕后必须调用 `remove()`。

### Q4：ArrayList 和 HashMap 可以在多线程中使用吗？

- `ArrayList` 和 `HashMap` 都是**线程不安全**的
- 如需要并发集合，使用 `CopyOnWriteArrayList` 或 `Collections.synchronizedList()`
- 如需要并发 Map，使用 `ConcurrentHashMap`

### Q5：什么是 CAS？ABA 问题是什么？怎么解决？

**CAS（Compare And Swap）** 是一条 CPU 原子指令，作用是比较并交换。Java 中通过 `Unsafe.compareAndSwapXXX` 来实现。

```java
// CAS 伪代码
boolean CAS(V, Expected, NewValue) {
    if (V == Expected) {
        V = NewValue;
        return true;
    }
    return false;
}
```

**ABA 问题**：线程 1 将值从 A 改为 B 又改回 A，线程 2 进行 CAS 操作时发现值还是 A，认为没有被修改，但实际上已经被修改过。

```
时间线：
1. 线程1 读取值 A，准备改为 C
2. 线程2 将 A 改为 B
3. 线程2 将 B 改回 A
4. 线程1 执行 CAS：发现值还是 A → 交换成功！
   （但实际上这期间 A 已经被修改过两次）
```

**解决方案**：使用版本号或时间戳。

```java
// AtomicStampedReference：添加版本号解决 ABA 问题
AtomicStampedReference<Integer> ref = new AtomicStampedReference<>(100, 0);
int stamp = ref.getStamp();
ref.compareAndSet(100, 200, stamp, stamp + 1);  // 带版本号比较

// AtomicMarkableReference：简化版，只标记是否被修改过
```

在实际场景中，ABA 问题是否需要解决取决于具体业务。如计数器自增等场景 ABA 不影响结果，但链表操作等需要版本号。

---

## 面试追问环节

**Q：为什么 ThreadLocal 的 key 要设计成弱引用？**

如果 key 是强引用，只要 ThreadLocal 对象存在，Entry 就无法被回收。实际上业务代码的 ThreadLocal 对象可能会被重新赋值或被 GC，使用弱引用可以让 ThreadLocal 被回收后 Entry 自动被清理。

**Q：ThreadLocal 的 set() 源码流程是怎样的？**

1. 获取当前线程的 `ThreadLocalMap`
2. 将当前 ThreadLocal 对象作为 key，值为 value 存入 Map
3. 如果 Map 不存在，创建一个新的

**Q：在什么场景使用乐观锁，什么场景使用悲观锁？**

- 读多写少，冲突概率低 → 乐观锁（如库存扣减、状态机更新）
- 写多读少，竞争激烈 → 悲观锁（如同一个账户频繁转账）

**Q：多线程中实现单例要注意什么？**

必须使用 `volatile` + 双重检查锁定（DCL），或者使用静态内部类/枚举。注意 `volatile` 防止指令重排序导致拿到半初始化的对象。