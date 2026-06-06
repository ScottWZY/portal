# JUC 工具类

## ⭐ 面试重点速览

| 知识模块 | 重点内容 | 面试频率 |
|----------|----------|----------|
| CountDownLatch | 等待其他线程完成，一次性使用 | 极高 |
| CyclicBarrier | 互相等待到齐，可重复使用 | 极高 |
| Semaphore | 控制并发访问数，限流 | 极高 |
| CountDownLatch vs CyclicBarrier | 区别对比 | 极高 |
| Exchanger | 两个线程交换数据 | 中 |
| LockSupport | park/unpark 原理 | 高 |

---

## ⭐ 一、CountDownLatch（倒计时门闩）

### 1.1 原理

CountDownLatch 是一个**一次性**的同步工具。通过一个计数器控制，当计数器减到 0 时，所有等待的线程被唤醒。

::: tip 核心概念
- `new CountDownLatch(n)`：初始化计数器为 n
- `countDown()`：计数器减 1
- `await()`：阻塞当前线程，直到计数器为 0
- **一次性使用**：计数器不能重置
:::

### 1.2 使用场景

**一个线程等待多个线程完成**（如：主线程等待所有子任务完成后继续）。

```java
/**
 * ⭐ 场景：主线程等待所有子任务完成
 */
public class CountDownLatchDemo {
    public static void main(String[] args) throws InterruptedException {
        int taskCount = 5;
        CountDownLatch latch = new CountDownLatch(taskCount);

        // 启动 5 个工作线程
        for (int i = 0; i < taskCount; i++) {
            final int taskId = i;
            new Thread(() -> {
                try {
                    System.out.println("任务 " + taskId + " 开始执行");
                    Thread.sleep((long) (Math.random() * 2000)); // 模拟耗时
                    System.out.println("任务 " + taskId + " 执行完成");
                } catch (InterruptedException e) {
                    e.printStackTrace();
                } finally {
                    // ⭐ 每个任务完成后 countDown
                    latch.countDown();
                }
            }).start();
        }

        // ⭐ 主线程等待所有任务完成
        latch.await();
        System.out.println("所有任务完成，主线程继续执行");
    }
}
```

### 1.3 与 join 的区别

| 维度 | join() | CountDownLatch |
|------|--------|----------------|
| 粒度 | 等待具体线程结束 | 等待计数器归零 |
| 灵活性 | 只能等线程结束，不能等线程执行到某个阶段 | 可以在任意位置 `countDown()` |
| 复用 | 不可复用 | 不可复用（一次性） |

---

## ⭐ 二、CyclicBarrier（循环屏障）

### 2.1 原理

CyclicBarrier 让一组线程**互相等待**，直到所有线程都到达屏障点，然后一起继续执行。

::: tip 核心概念
- `new CyclicBarrier(n)`：等待 n 个线程到达
- `new CyclicBarrier(n, Runnable)`：所有线程到达后，先执行指定 Runnable
- `await()`：当前线程到达屏障点，等待其他线程
- **可重复使用**：所有线程释放后，屏障自动重置
:::

### 2.2 使用场景

**多个线程互相等待到齐后再一起继续**（如：团队集合、多阶段计算）。

```java
/**
 * ⭐ 场景：5 个运动员站到起跑线，等所有人到齐后一起出发
 */
public class CyclicBarrierDemo {
    public static void main(String[] args) {
        int runnerCount = 5;
        CyclicBarrier barrier = new CyclicBarrier(runnerCount, () -> {
            // 所有线程到达屏障后执行（由最后一个到达的线程执行）
            System.out.println("所有运动员准备就绪！比赛开始！");
        });

        for (int i = 0; i < runnerCount; i++) {
            final int runnerId = i;
            new Thread(() -> {
                try {
                    System.out.println("运动员 " + runnerId + " 已到达起跑线");
                    // ⭐ 等待其他运动员
                    barrier.await();
                    // 所有人到齐后，一起开始
                    System.out.println("运动员 " + runnerId + " 出发！");
                    Thread.sleep((long) (Math.random() * 3000));
                    System.out.println("运动员 " + runnerId + " 到达终点");
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }).start();
        }
    }
}
```

### 2.3 断裂恢复

如果某个线程在等待时被中断或超时，CyclicBarrier 会**断裂**（Broken）。

```java
// 超时等待
try {
    barrier.await(2, TimeUnit.SECONDS);  // 最多等 2 秒
} catch (TimeoutException e) {
    System.out.println("等待超时，屏障断裂");
}

// 检查屏障状态
if (barrier.isBroken()) {
    // 屏障已断裂
}
```

---

## ⭐ 三、CountDownLatch vs CyclicBarrier

这是面试最高频的对比题之一：

| 维度 | CountDownLatch | CyclicBarrier |
|------|----------------|---------------|
| **等待方向** | 一个（或几个）线程等待其他线程 | 一组线程互相等待 |
| **计数器** | 只能减（countDown），不能重置 | 所有线程到达后自动重置，可复用 |
| **可复用性** | 一次性，用完即废 | 可重复使用，支持多阶段 |
| **回调** | 无 | 支持 barrierAction（所有线程到达时执行） |
| **比喻** | 倒计时牌：从 n 开始倒数，到 0 开门 | 团建集合：人到齐了才出发 |
| **底层实现** | AQS 共享模式 | ReentrantLock + Condition |

::: tip 记忆口诀
- **CountDownLatch**：一个线程等大家 → "倒计时"
- **CyclicBarrier**：大家互相等 → "循环屏障"
:::

---

## ⭐ 四、Semaphore（信号量）

### 4.1 原理

Semaphore 控制**同时访问某个资源的线程数**。通过许可证（permit）管理，`acquire()` 获取许可，`release()` 释放许可。

::: tip 核心概念
- `new Semaphore(n)`：初始有 n 个许可证
- `acquire()`：获取一个许可证，没有则阻塞
- `release()`：释放一个许可证
- `tryAcquire()`：尝试获取，不阻塞
:::

### 4.2 使用场景

**限流**：控制数据库连接数、接口并发访问数。

```java
/**
 * ⭐ 场景：停车场只有 3 个车位，5 辆车要停
 */
public class SemaphoreDemo {
    public static void main(String[] args) {
        // 只有 3 个许可证（3 个车位）
        Semaphore semaphore = new Semaphore(3);

        for (int i = 0; i < 5; i++) {
            final int carId = i;
            new Thread(() -> {
                try {
                    // ⭐ 获取许可证（占车位）
                    semaphore.acquire();
                    System.out.println("车辆 " + carId + " 进入停车场");
                    Thread.sleep((long) (Math.random() * 5000)); // 停车
                    System.out.println("车辆 " + carId + " 离开停车场");
                } catch (InterruptedException e) {
                    e.printStackTrace();
                } finally {
                    // ⭐ 释放许可证（腾车位）
                    semaphore.release();
                }
            }).start();
        }
    }
}
```

### 4.3 公平模式

```java
// 公平模式：按等待顺序获取许可
Semaphore fairSemaphore = new Semaphore(3, true);
```

---

## 五、Exchanger（交换器）

### 5.1 原理

Exchanger 用于**两个线程之间交换数据**。两个线程分别调用 `exchange()` 方法，同时到达交换点时交换数据。

```java
/**
 * ⭐ 场景：两个线程交换数据
 */
public class ExchangerDemo {
    public static void main(String[] args) {
        Exchanger<String> exchanger = new Exchanger<>();

        // 线程 A
        new Thread(() -> {
            String data = "数据 A";
            try {
                System.out.println("线程 A 准备交换：" + data);
                Thread.sleep(1000); // 模拟处理
                String received = exchanger.exchange(data);
                System.out.println("线程 A 收到：" + received);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }).start();

        // 线程 B
        new Thread(() -> {
            String data = "数据 B";
            try {
                System.out.println("线程 B 准备交换：" + data);
                String received = exchanger.exchange(data);
                System.out.println("线程 B 收到：" + received);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }).start();
    }
}
// 输出：
// 线程 A 准备交换：数据 A
// 线程 B 准备交换：数据 B
// 线程 A 收到：数据 B
// 线程 B 收到：数据 A
```

---

## 六、Phaser（阶段器）

Phaser 是 CountDownLatch 和 CyclicBarrier 的增强版，JDK 7 引入，支持**动态注册**和**多阶段同步**。

```java
public class PhaserDemo {
    public static void main(String[] args) {
        Phaser phaser = new Phaser(1);  // 注册主线程

        for (int i = 0; i < 3; i++) {
            phaser.register();  // 动态注册
            final int phase = i;
            new Thread(() -> {
                System.out.println("阶段 1 - 线程 " + phase);
                phaser.arriveAndAwaitAdvance();  // 到达并等待

                System.out.println("阶段 2 - 线程 " + phase);
                phaser.arriveAndAwaitAdvance();

                System.out.println("阶段 3 - 线程 " + phase);
                phaser.arriveAndDeregister();  // 到达并注销
            }).start();
        }

        // 主线程注销自己，等待所有阶段完成
        phaser.arriveAndDeregister();
    }
}
```

---

## ⭐ 七、LockSupport

### 7.1 原理

LockSupport 是 JUC 中**最基础**的线程阻塞工具，`park()` 阻塞线程，`unpark()` 唤醒线程。

```java
public class LockSupportDemo {
    public static void main(String[] args) throws InterruptedException {
        Thread t = new Thread(() -> {
            System.out.println("线程开始等待");
            LockSupport.park();  // 阻塞当前线程
            System.out.println("线程被唤醒");
        });
        t.start();

        Thread.sleep(2000);
        LockSupport.unpark(t);  // 唤醒指定线程
    }
}
```

### 7.2 LockSupport vs wait/notify

| 维度 | wait/notify | LockSupport.park/unpark |
|------|-------------|------------------------|
| 使用条件 | 必须在 synchronized 块中 | 任意位置 |
| 唤醒顺序 | notify 不能指定线程 | unpark 可以指定线程 |
| 先 unpark 后 park | 不能（先 notify 后 wait 会永久等待） | 可以（先 unpark 后 park 不会被阻塞） |
| 异常 | 可能 InterruptedException | 不会抛（但可响应中断） |

::: tip LockSupport 底层
LockSupport 底层使用 `Unsafe` 类的 `park` 和 `unpark` 方法，直接调用操作系统原语，非常高效。
:::

---

## ⭐ 面试高频问题

### Q1：CountDownLatch 和 CyclicBarrier 的区别？

| 维度 | CountDownLatch | CyclicBarrier |
|------|---------------|---------------|
| 等待方向 | 一个线程等大家 | 大家互相等 |
| 可复用 | 不可复用 | 可复用 |
| 回调 | 无 | 支持 barrierAction |

### Q2：CountDownLatch 的实现原理是什么？

CountDownLatch 基于 AQS 共享模式实现：
- 初始化时 `state = count`
- `countDown()` 执行 `state--`（CAS 操作）
- `await()` 等待 `state == 0`，所有等待线程被唤醒
- `state == 0` 后，`await()` 直接返回

### Q3：Semaphore 和 CountDownLatch 的异同？

- 相同点：都基于 AQS 共享模式
- 不同点：Semaphore 的计数器可以 `acquire` 也可以用 `release` 增加，CountDownLatch 只能减

### Q4：LockSupport 的 park/unpark 和 wait/notify 有什么区别？

- `wait/notify` 必须在 synchronized 中，`park/unpark` 不需要
- `unpark` 可以先于 `park` 调用，`notify` 可以先于 `wait` 调用会丢失信号
- `unpark` 可以指定具体线程，`notify` 只能随机唤醒一个

### Q5：Semaphore 的原理和应用场景？和线程池限流有什么区别？

**Semaphore 原理**：基于 AQS 共享模式，内部维护一个许可证计数器（state）。

```java
// 核心逻辑
acquire()：如果 state > 0，CAS 将 state--，成功返回；否则阻塞等待
release()：CAS 将 state++，并唤醒等待队列中的线程
```

**典型应用场景**：
| 场景 | 示例 |
|------|------|
| **数据库连接池** | 限制同时连接数（如最多 20 个连接） |
| **接口限流** | 限制同时调用某个接口的并发线程数 |
| **停车场** | 固定车位，满车等待 |
| **流量控制** | 控制同时进行中的任务数 |

**与线程池限流的区别**：
- Semaphore 控制的是**同时执行的线程数**（并发度），不控制执行速率
- 线程池的 `maximumPoolSize` 控制的是**可创建的线程数上限**
- 如果要控制 QPS（每秒请求数），应该用 Guava RateLimiter 或 Sentinel，而不是 Semaphore

---

## 面试追问环节

**Q：CyclicBarrier 的屏障断裂（Broken）是什么？**

当某个线程在等待时被中断、超时，或者调用了 `reset()` 方法，CyclicBarrier 会进入 Broken 状态。处于 Broken 状态的屏障，所有等待线程会抛出 `BrokenBarrierException`。

**Q：多个线程同时 countDown() 有线程安全问题吗？**

没有。`countDown()` 内部使用 CAS 操作保证线程安全，且 AQS 的共享模式保证了并发释放的正确性。

**Q：Semaphore 可以实现限流，那和令牌桶限流有什么区别？**

- Semaphore 是 Java 层面的线程同步，控制的是**并发线程数**
- 令牌桶（如 Guava RateLimiter）是流量控制，控制的是**请求速率（QPS）**
- 如果要做 QPS 限流，建议用 RateLimiter 而不是 Semaphore

**Q：Phaser 比 CyclicBarrier 强在哪里？**

- 支持**动态注册/注销**参与者（CyclicBarrier 需要预先指定数量）
- 支持**多阶段**同步，但不需要每阶段都指定数量
- 支持**分层**（父子 Phaser）
- 更加灵活，但使用也更复杂