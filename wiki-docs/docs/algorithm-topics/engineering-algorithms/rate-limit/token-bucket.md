# 令牌桶 (Token Bucket) 限流算法
> 创建日期：2026-06-08
> 难度：⭐⭐
> 前置知识：限流基本概念、时间窗口、QPS/TPS
> 关联模块：Guava RateLimiter、Spring Cloud Gateway、Nginx 限流

## ⭐ 面试重点速览

| 考察点 | 重要程度 | 考察频率 | 掌握目标 |
|--------|---------|---------|---------|
| 令牌桶核心原理 | 极高 | 极高 | 能画出令牌生成和消费的时序图 |
| 突发流量处理能力 | 高 | 高 | 能解释为什么令牌桶允许突发 |
| Guava RateLimiter 源码 | 高 | 高 | 能说出 SmoothBursty 的核心逻辑 |
| 与漏桶的区别 | 高 | 高 | 能至少说出3点关键差异 |
| SmoothWarmingUp 预热机制 | 中 | 中 | 能解释预热曲线的含义 |
| 令牌桶参数计算 | 中 | 中 | 能根据业务场景计算桶容量和产生速率 |

---

## 一、应用场景 🎯

| 场景 | 说明 |
|------|------|
| **API 网关限流** | Spring Cloud Gateway 的 RequestRateLimiter 基于令牌桶实现 |
| **Guava RateLimiter** | Java 最流行的本地限流工具，核心就是令牌桶算法 |
| **Nginx 限流** | `limit_req` 指令的 burst 参数允许令牌桶风格的突发处理 |
| **秒杀接口限流** | 允许一定程度的流量突发，但总体控制速率 |
| **消息发送速率控制** | 控制下游消费者处理能力，允许短时积压后平滑处理 |
| **API 配额管理** | 按用户、按接口分配令牌桶，控制资源使用 |

---

## 二、核心原理 🔬

### 2.1 设计思路

令牌桶（Token Bucket）由两部分组成：

```
┌─────────────────────────────────────────┐
│              令牌桶 (Bucket)             │
│  容量：capacity 个令牌                   │
│                                          │
│  [Token][Token][Token][Token]...[Token]  │
│       ↑ 以固定速率 r (tokens/s) 放入     │
└─────────────────────────────────────────┘
                    │
                    ▼ 请求到达时取走一个令牌
               ┌─────────┐
               │ 请求处理  │
               └─────────┘
```

**核心逻辑**：
- 令牌以**固定速率 r** 匀速放入桶中
- 桶有**最大容量 capacity**，满后多余的令牌被丢弃
- 每次请求需要**消耗 1 个令牌**（或多 Token 按权重）
- 有令牌则放行，无令牌则拒绝或排队等待

### 2.2 突发流量处理

令牌桶的一个关键优势是**允许突发流量**：

```
平稳期（流量 < r）：桶中不断积累令牌（最多 capacity 个）
突发到达时：一次性消耗桶中所有累积的令牌
突发持续时长 = capacity / r
```

例如：速率 r=10/s，桶容量=50 → 最多可累积 50 个令牌，支持瞬间 50 个请求的突发，之后恢复 10/s 的匀速。

### 2.3 Mermaid 流程图

```mermaid
flowchart TD
    subgraph 令牌生成（后台线程或惰性计算）
        A["每个时间间隔 1/r 秒"] --> B["桶是否已满?"]
        B -- 是 --> C["丢弃多余令牌"]
        B -- 否 --> D["放入1个令牌"]
    end

    subgraph 请求到达
        E["请求到达"] --> F{"当前桶中令牌 >= 所需令牌?"}
        F -- 是 --> G["从桶中取走令牌"]
        G --> H["放行请求"]
        F -- 否 --> I{"是否允许等待?"}
        I -- 是 --> J["计算需要等待的时间"]
        J --> K["等待令牌生成后取走放行"]
        I -- 否 --> L["拒绝请求（限流）"]
    end
```

### 2.4 Guava RateLimiter 源码核心逻辑

Guava 的 `SmoothRateLimiter` 使用**惰性计算**而非后台线程来生成令牌：

```java
// Guava RateLimiter 核心思想（简化）
// storedPermits: 当前存储的令牌数
// nextFreeTicketMicros: 下一次可获取令牌的时间点

// 存储令牌上限: maxPermits = capacity
// 稳定速率: stableIntervalMicros = 1s / qps

double acquire(int permits) {
    // 1. 计算需要等待的时间
    long waitMicros = reserve(permits);
    // 2. 阻塞等待
    sleepMicros(waitMicros);
    // 3. 返回等待了多久
    return waitMicros / 1e6;
}

long reserve(int permits) {
    synchronized (mutex) {
        // 惰性生成令牌：根据流逝的时间，计算应补充的令牌数
        resync(now);
        // 计算需要预支的未来时间
        long waitMicros = reserveAndGetWaitTime(permits, now);
        return waitMicros;
    }
}
```

### 2.5 SmoothWarmingUp 预热机制

`SmoothWarmingUp` 是 Guava RateLimiter 的一个变种，解决**冷启动**问题：

```
令牌生成速率随存储令牌数动态变化：

        速率
         ↑
  stable │___________________
         │                /
         │              /
         │            /
         │          /
         │        /
     cold│______/
         │
         └─────────────────→ 存储令牌数
         0    threshold    max

- 冷状态（令牌多）：令牌生成速率低，防止冷系统被突发打垮
- 热状态（令牌少）：令牌以全速率生成
```

预热期 = 冷状态 → 热状态的过渡时间，通常与系统初始化、缓存预热等配合。

---

## 三、趣味解说 🎭

> **水龙头滴水——匀速滴水到桶里，请求来的时候从桶里取水**

想象你厨房的洗菜池：水龙头以固定速度滴水（比如每秒 10 滴），水滴落在桶里。

- **正常用水**：你每分钟只舀几勺水，水龙头一直匀速滴水，桶里水越来越多（积累令牌）。
- **突然来了一堆客人（突发流量）**：你一口气舀了 50 勺水做菜。桶里之前存的水直接顶住了这波需求！
- **客人源源不断**：桶里的储备水用完后，你只能等水龙头一滴一滴地滴（10滴/秒），超出部分只能让客人等着（排队）或拒绝。

这个水桶就是**令牌桶**，水龙头滴水速度就是**限流速率 r**，水桶容量就是**最大累积令牌数 capacity**。

令牌桶的精妙之处在于它天然支持**突发宽容**——平时访问量小的时候你可以"攒人品"（积累令牌），关键时刻就能"爆一波"（突发流量）。只要总速率控制住了，系统就不会被压垮。

但水桶也不能无限大（capacity 有限），否则你攒了一年的人品，一秒全放出去，下游数据库直接被你打爆——所以 capacity 要合理设置。

---

## 四、代码实现 💻

### 4.1 基础令牌桶实现 (Java)

```java
import java.util.concurrent.atomic.AtomicLong;
import java.util.concurrent.locks.ReentrantLock;

/**
 * 令牌桶限流器 —— 惰性计算版本
 * 核心思想：每次请求时先补充令牌（根据时间差计算），再判断是否够用
 */
public class TokenBucket {
    private final long capacity;           // 桶容量（最大令牌数）
    private final double rate;             // 令牌产生速率（个/秒）
    private double currentTokens;          // 当前令牌数
    private long lastRefillTimestamp;      // 上次补充令牌的时间戳（纳秒）
    private final ReentrantLock lock = new ReentrantLock();

    /**
     * @param capacity 桶容量（允许的最大突发请求数）
     * @param rate     令牌生成速率（每秒生成多少个令牌）
     */
    public TokenBucket(long capacity, double rate) {
        this.capacity = capacity;
        this.rate = rate;
        this.currentTokens = capacity;     // 初始时桶是满的（冷启动友好）
        this.lastRefillTimestamp = System.nanoTime();
    }

    /**
     * 尝试获取 permits 个令牌
     * @param permits 需要的令牌数
     * @return true=获取成功, false=被限流
     */
    public boolean tryAcquire(int permits) {
        lock.lock();
        try {
            refill(); // 先补充令牌
            if (currentTokens >= permits) {
                currentTokens -= permits;
                return true;  // 放行
            }
            return false;     // 令牌不足，限流
        } finally {
            lock.unlock();
        }
    }

    /**
     * 阻塞获取令牌（等待直到有足够令牌）
     * @return 等待的秒数，0表示立即获取
     */
    public double acquire(int permits) throws InterruptedException {
        long waitNanos = reserve(permits);
        if (waitNanos > 0) {
            long waitMillis = waitNanos / 1_000_000;
            int waitNanosRemainder = (int) (waitNanos % 1_000_000);
            Thread.sleep(waitMillis, waitNanosRemainder);
        }
        return waitNanos / 1e9;
    }

    /** 计算需要等待的时间并预扣令牌 */
    private long reserve(int permits) {
        lock.lock();
        try {
            refill();
            double deficit = permits - currentTokens;
            long waitNanos = 0;
            if (deficit > 0) {
                // 需要等待足够令牌生成的时间
                waitNanos = (long) (deficit / rate * 1_000_000_000L);
                // 预支未来令牌（透支，减少当前令牌到负数）
                currentTokens -= permits;
            } else {
                currentTokens -= permits;
            }
            return waitNanos;
        } finally {
            lock.unlock();
        }
    }

    /** 根据时间流逝补充令牌（惰性计算核心） */
    private void refill() {
        long now = System.nanoTime();
        long elapsedNanos = now - lastRefillTimestamp;

        if (elapsedNanos > 0) {
            // 计算这段时间应产生的令牌数 = 速率 * 时间
            double newTokens = (elapsedNanos / 1_000_000_000.0) * rate;
            currentTokens = Math.min(capacity, currentTokens + newTokens);
            lastRefillTimestamp = now;
        }
    }

    // ========== 测试 ==========
    public static void main(String[] args) throws InterruptedException {
        // 容量=5, 速率=2个/秒
        TokenBucket bucket = new TokenBucket(5, 2.0);

        // 第1秒：桶满5个，瞬间拿走5个（测试突发）
        for (int i = 0; i < 5; i++) {
            System.out.println("请求" + (i + 1) + " " +
                (bucket.tryAcquire(1) ? "通过" : "被限流"));
        }
        // 第6个请求：令牌不足，应该被限流
        System.out.println("请求6 " +
            (bucket.tryAcquire(1) ? "通过" : "被限流"));

        // 等待1秒后，应产生2个令牌
        Thread.sleep(1000);
        System.out.println("等待1s后请求 " +
            (bucket.tryAcquire(1) ? "通过" : "被限流"));
        System.out.println("紧随其后的请求 " +
            (bucket.tryAcquire(1) ? "通过" : "被限流"));
    }
}
```

### 4.2 Guava RateLimiter 风格实现 (SmoothBursty)

```java
import java.util.concurrent.TimeUnit;

/**
 * 模拟 Guava RateLimiter 的 SmoothBursty 实现
 * 支持突发流量的稳定速率限流器
 */
public class SmoothBurstyRateLimiter {
    private final double stableIntervalMicros; // 生成每个令牌的间隔（微秒）
    private final double maxPermits;           // 最大存储令牌数（桶容量）
    private double storedPermits;              // 当前存储令牌数
    private long nextFreeTicketMicros;         // 下次请求可获得令牌的时间点

    /**
     * @param permitsPerSecond 每秒生成的令牌数 (QPS)
     */
    public SmoothBurstyRateLimiter(double permitsPerSecond) {
        this.stableIntervalMicros = 1_000_000.0 / permitsPerSecond;
        // 最大令牌数 = 一秒所产生的令牌数（Guava 默认）
        this.maxPermits = permitsPerSecond;
        this.storedPermits = 0;
        this.nextFreeTicketMicros = 0;
    }

    public double acquire() {
        return acquire(1);
    }

    public double acquire(int permits) {
        long waitMicros = reserve(permits);
        sleepMicrosUninterruptibly(waitMicros);
        return waitMicros / 1_000_000.0; // 返回等待的秒数
    }

    public boolean tryAcquire(long timeout, TimeUnit unit) {
        long timeoutMicros = unit.toMicros(timeout);
        long waitMicros = reserve(1);
        if (waitMicros > timeoutMicros) {
            return false; // 等待超时
        }
        sleepMicrosUninterruptibly(waitMicros);
        return true;
    }

    /** 预留令牌并返回需要等待的时间 */
    private synchronized long reserve(int permits) {
        long nowMicros = readMicros();

        // 1. 惰性补充令牌
        resync(nowMicros);

        // 2. 计算等待时间
        long waitMicros;
        double deficit = permits - storedPermits;
        if (deficit > 0) {
            // 令牌不足 → 需要等待未来令牌生成
            waitMicros = (long) (deficit * stableIntervalMicros);
            // 预支未来的令牌：设置下次可用时间 = 当前时间 + 等待时间
            nextFreeTicketMicros += (long) (permits * stableIntervalMicros);
        } else {
            // 令牌充足 → 立即获取，无需等待
            waitMicros = 0;
        }

        // 3. 扣减令牌（可能为负，表示预支）
        storedPermits -= permits;

        return waitMicros;
    }

    /** 根据时间流逝补充令牌 */
    private void resync(long nowMicros) {
        if (nowMicros > nextFreeTicketMicros) {
            // 计算应补充的令牌数
            long elapsedMicros = nowMicros - nextFreeTicketMicros;
            double newPermits = elapsedMicros / stableIntervalMicros;
            storedPermits = Math.min(maxPermits, storedPermits + newPermits);
            nextFreeTicketMicros = nowMicros;
        }
    }

    private long readMicros() {
        return TimeUnit.NANOSECONDS.toMicros(System.nanoTime());
    }

    private void sleepMicrosUninterruptibly(long micros) {
        if (micros <= 0) return;
        try {
            TimeUnit.MICROSECONDS.sleep(micros);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    // ========== 测试 ==========
    public static void main(String[] args) {
        SmoothBurstyRateLimiter limiter = new SmoothBurstyRateLimiter(2.0); // 2 QPS

        // 初始无令牌，第一个请求需等待0.5s
        System.out.printf("1st acquire wait: %.3fs\n", limiter.acquire());
        System.out.printf("2nd acquire wait: %.3fs\n", limiter.acquire());

        // 等待1秒积累令牌
        sleepSeconds(1);

        // 突发：一秒内积累2个令牌，可以连续2个不等待
        System.out.printf("After 1s sleep, acquire wait: %.3fs\n", limiter.acquire());
        System.out.printf("Immediately next acquire wait: %.3fs\n", limiter.acquire());
        System.out.printf("3rd acquire wait: %.3fs\n", limiter.acquire());
    }

    private static void sleepSeconds(double seconds) {
        try {
            Thread.sleep((long) (seconds * 1000));
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}
```

---

## 五、优缺点 ⚖️

### 优点

| 优点 | 说明 |
|------|------|
| **允许突发流量** | 桶中累积的令牌可应对瞬时突发，比固定窗口更灵活 |
| **速率平滑** | 长期来看速率严格控制在 r 以内，保护下游系统 |
| **实现简单** | 核心逻辑仅几十行代码 |
| **惰性计算** | 无需后台线程，通过时间差计算令牌补充，线程开销低 |
| **预热支持** | SmoothWarmingUp 变体解决冷系统被突发打垮的问题 |

### 缺点

| 缺点 | 说明 |
|------|------|
| **突发可能打垮下游** | capacity 设置不当会导致瞬间大流量击穿下游 |
| **需要合理调参** | rate 和 capacity 需根据业务实际承载能力设置，过高或过低都有问题 |
| **内存占用** | 每个限流 key（用户/接口）都需要一个桶实例 |
| **分布式限流需额外协调** | 单机令牌桶无法直接用于分布式环境，需借助 Redis + Lua 来扩展 |

---

## 六、面试高频题 📝

**Q1：令牌桶和漏桶的区别是什么？**

答：核心区别 —— 令牌桶**允许突发流量**，漏桶**强制平滑流量**。令牌桶：请求可以瞬间消耗桶中所有累积的令牌（突发），后续按固定速率；漏桶：无论请求到达多快，都以固定速率从桶底流出（完全平滑）。令牌桶更适合需要弹性处理短时高峰的场景，漏桶更适合需要强制整流到固定速率的场景。

**Q2：令牌桶的 capacity 怎么设置？**

答：capacity = 预估的最大突发请求数。一般设置为 `rate * N`，N 通常取 1~3。例如 QPS=100，capacity 设为 200，即最多允许 2 秒的突发量。也要考虑下游系统的瞬时承载能力。

**Q3：Guava RateLimiter 是怎么实现令牌补充的？**

答：采用**惰性计算**。不维护后台线程，而是在每次 acquire 时根据 `now - nextFreeTicketMicros` 的时间差计算应补充的令牌数。这样线程开销最小，效率最高。

**Q4：SmoothWarmingUp 预热是什么原理？**

答：水平轴表示存储令牌数，垂直轴表示令牌生成速率。令牌多（冷状态）时生成速率低，令牌少（热状态）时生成速率高。当系统长时间空闲后（桶满、冷状态），前几个请求会以较慢速率放行，逐步加速到全速率。用于保护冷启动的系统。

**Q5：如何实现分布式令牌桶？**

答：使用 Redis + Lua 脚本原子化操作：在 Lua 中完成令牌补充计算、扣减和返回值，保证多实例间的限流一致性。每个时间窗口开始时通过 Redis 的 key 过期来刷新桶。

---

## 七、常见误区 ❌

| 误区 | 纠正 |
|------|------|
| "令牌桶和漏桶没有区别" | 令牌桶允许突发（只要桶里有货），漏桶强制平滑。这是面试中最常被问到的区别。 |
| "Guava RateLimiter 有后台线程" | Guava 使用惰性计算方式，没有后台线程，所有令牌补充在 acquire 时计算。 |
| "令牌桶的容量越大越好" | capacity 太大会导致积累过多令牌后瞬间释放巨量请求打垮下游。应根据下游承载能力和业务需求合理设置。 |
| "令牌桶能保证完全平滑" | 令牌桶保证的是**长期平均速率**平滑，短期允许突发。要完全平滑应使用漏桶。 |
| "tryAcquire 就是非阻塞的" | tryAcquire(0, TimeUnit.SECONDS) 才是真正的非阻塞。tryAcquire(timeout) 可能阻塞等待。 |
| "一个 RateLimiter 可以用于所有接口" | 不同接口的承载能力不同，应该为关键接口各自创建独立的 RateLimiter。 |