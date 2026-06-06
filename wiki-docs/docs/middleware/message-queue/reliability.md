---
title: 消息可靠性专题
outline: [2,3]
---

# 消息可靠性专题

> 消息可靠性是消息队列在生产环境中最重要的关注点之一。本专题从消息不丢失、幂等消费、消息堆积和事务消息四个维度，综合对比 Kafka 和 RocketMQ 的可靠性保障方案。

---

## 一、消息不丢失的三端保证

消息丢失可能发生在 Producer、Broker、Consumer 三个环节中的任何一个。以下分别从 Kafka 和 RocketMQ 两个系统，完整阐述三端的消息可靠性配置。

### 1.1 Kafka 三端保证

#### Producer 端

消息丢失场景：网络抖动导致发送失败，Producer 不重试；或 `acks=0/1` 时 Leader 宕机。

**解决方案**：

```java
Properties props = new Properties();

// 1. 确认策略：all/-1，必须所有 ISR 副本确认
props.put("acks", "all");

// 2. 开启重试
props.put("retries", 3);  // 或 Integer.MAX_VALUE

// 3. 幂等性：防止重试导致消息重复（同时保证单分区有序）
props.put("enable.idempotence", "true");

// 4. 控制并发请求数（幂等开启时自动设为5，避免乱序）
props.put("max.in.flight.requests.per.connection", 5);
```

**关键机制**：`acks=all` + 重试 + 幂等性 = 生产者端"不丢失且不重复"。

#### Broker 端

消息丢失场景：Leader 宕机时副本未同步；或 `unclean.leader.election.enable=true` 导致脏选举。

**解决方案**：

```properties
# broker.properties

# 1. 副本因子至少为 3（1 Leader + 2 Follower）
default.replication.factor=3

# 2. 最小 ISR 副本数至少为 2（含 Leader）
min.insync.replicas=2

# 3. 禁止脏选举
unclean.leader.election.enable=false

# 4. 日志刷新策略（通常依赖副本同步，而非 fsync 刷盘）
log.flush.interval.messages=10000
log.flush.interval.ms=1000
```

::: warning 注意
Kafka 默认不依赖 `fsync` 来保证数据不丢失，而是依赖**多副本同步**机制。`fsync` 太频繁会严重降低吞吐。
:::

#### Consumer 端

消息丢失场景：自动提交 Offset + 消息处理失败（如业务异常、进程 Crash），Offset 已提交但消息未处理完。

**解决方案**：

```java
// 1. 关闭自动提交
props.put("enable.auto.commit", "false");

// 2. 采用"先处理后提交"模式
while (true) {
    ConsumerRecords<String, String> records = consumer.poll(Duration.ofMillis(100));
    for (ConsumerRecord<String, String> record : records) {
        process(record);  // 业务逻辑处理
    }
    consumer.commitSync();  // 处理成功后再提交
}
```

::: warning 注意
"先处理后提交"保证消息不丢失，但可能导致**重复消费**（处理成功后、提交前崩溃）。消除重复需要业务实现幂等。
:::

#### Kafka 三端联动配置对照表

| 端 | 核心参数 | 推荐值 | 目的 |
|----|---------|--------|------|
| Producer | `acks` | `all` / `-1` | 等待 ISR 全部确认 |
| Producer | `enable.idempotence` | `true` | 防重复 + 有序 |
| Producer | `retries` | `Integer.MAX_VALUE` | 无限重试（由 `delivery.timeout.ms` 兜底） |
| Broker | `replication.factor` | `3` | 三副本冗余 |
| Broker | `min.insync.replicas` | `2` | ISR 最小同步数 |
| Broker | `unclean.leader.election.enable` | `false` | 禁止脏选举 |
| Consumer | `enable.auto.commit` | `false` | 手动控制提交 |
| Consumer | `isolation.level` | `read_committed` | 只读已提交（配合事务） |

---

### 1.2 RocketMQ 三端保证

#### Producer 端

RocketMQ 的 Producer 端可靠性保障在两个层面：

**1. 发送可靠性**

| 发送方式 | 说明 | 可靠性 |
|----------|------|--------|
| **同步发送 (Sync)** | 发送后等待 Broker 确认，返回 SendResult 才继续 | 高，可感知发送结果 |
| **异步发送 (Async)** | 发送后立即返回，通过回调函数处理结果 | 中，需在回调中处理失败 |
| **单向发送 (Oneway)** | 发送后不关心结果，直接返回 | 低，不推荐可靠性场景 |

```java
// 同步发送 + 重试（推荐）
producer.setRetryTimesWhenSendFailed(3);  // 同步发送失败重试次数
producer.setRetryTimesWhenSendAsyncFailed(3);  // 异步发送失败重试次数
SendResult result = producer.send(msg);  // 同步发送，阻塞等待结果
```

**2. 刷盘策略**

| 刷盘策略 | 可靠性 | 性能 | 适用场景 |
|----------|--------|------|----------|
| **同步刷盘 (SYNC_FLUSH)** | 极高，断电不丢消息 | TPS ~数千 | 金融支付、交易订单 |
| **异步刷盘 (ASYNC_FLUSH)** | 中等，断电可能丢失最近 500ms 数据 | TPS 可达数万甚至十万+ | 日志收集、用户行为埋点 |

#### Broker 端

**1. 主从复制模式**

| 模式 | 配置 | 可靠性 | 说明 |
|------|------|--------|------|
| **异步复制 (ASYNC_MASTER)** | `brokerRole=ASYNC_MASTER` | 中，Master 宕机可能丢消息 | 默认模式，性能最高 |
| **同步双写 (SYNC_MASTER)** | `brokerRole=SYNC_MASTER` | 高，Slave 确认后才返回 ACK | 性能略低于异步复制 |

**2. DLedger 高可用**

RocketMQ 5.x 推荐使用 DLedger 模式替代传统主从模式：

```
DLedger Broker Group (3节点)：
┌──────────────┐     日志复制     ┌──────────────┐
│   Node-0     │◄───────────────►│   Node-1     │
│  (Leader)    │                  │  (Follower)  │
└──────┬───────┘                  └──────┬───────┘
       │         ┌──────────────┐        │
       └─────────┤   Node-2     │────────┘
                 │  (Follower)  │
                 └──────────────┘
```

- 基于 Raft 协议变体，自动故障转移
- 超过半数节点确认写入后才返回成功
- 任意单点故障时数据不丢失

#### Consumer 端

| 消费模式 | 说明 | 可靠性 |
|----------|------|--------|
| **集群消费 (CLUSTERING)** | 消费位点存储在 Broker 端，支持故障转移 | 高 |
| **广播消费 (BROADCASTING)** | 消费位点存储在 Consumer 本地 | 中，Consumer 宕机进度丢失 |

**重试与死信机制**：

```java
// 消费重试配置
consumer.setMaxReconsumeTimes(16);  // 最大重试次数，默认 16 次

// 超过最大重试次数后，消息进入死信队列
// 死信 Topic 命名规则：%DLQ%ConsumerGroupName
```

---

### 1.3 Kafka vs RocketMQ 可靠性对比总表

| 维度 | Kafka | RocketMQ |
|------|-------|----------|
| **Producer 可靠性** | acks=all + 幂等 + 重试 | 同步发送 + 重试 + 同步刷盘 |
| **Broker 副本机制** | ISR 动态同步副本集合 | 主从复制（SYNC_MASTER / ASYNC_MASTER） |
| **Broker 高可用** | KRaft（4.0 默认）/ ZooKeeper（旧版） | DLedger（基于 Raft）/ Controller 模式 |
| **Consumer 可靠性** | 关闭自动提交，手动同步提交 | 集群消费（Broker 端存储位点） |
| **消息重试** | 业务层自己实现重试逻辑 | 内置重试机制（默认 16 次） + 死信队列 |
| **刷盘策略** | 依赖 Page Cache + 副本同步，不依赖 fsync | 同步刷盘 / 异步刷盘可选 |
| **极端可靠性等级** | 高（多副本 + ISR） | 极高（同步刷盘 + 同步双写 + DLedger） |

---

## 二、幂等消费方案

在 At-Least-Once 语义下，消息可能被重复消费。幂等消费是指**无论消息被消费多少次，最终业务结果与消费一次完全相同**。

### 2.1 为什么需要幂等

```
消息重复的典型场景：
┌──────────────────────────────────────────────────┐
│ 1. Producer 重试：网络超时，Producer 重发同一消息   │
│ 2. Consumer 重平衡：Rebalance 后重复消费部分消息    │
│ 3. Consumer 手动提交失败：处理成功但提交 Offset 失败 │
│ 4. 刷盘/复制延迟：Broker 切换导致的重复投递         │
└──────────────────────────────────────────────────┘
```

### 2.2 通用幂等方案

#### 方案一：数据库唯一键

**原理**：在业务数据库中利用唯一约束来防止重复处理。

```sql
-- 订单表添加消息唯一标识字段
ALTER TABLE orders ADD COLUMN msg_id VARCHAR(64) UNIQUE;

-- 消费时先尝试插入，利用唯一键冲突自动去重
INSERT INTO orders (order_id, amount, msg_id) VALUES (?, ?, ?);
-- 如果 msg_id 重复，INSERT 失败，捕获 DuplicateKeyException 跳过
```

**优点**：实现简单，数据库天然保证原子性。  
**缺点**：增加数据库写入压力；对非关系型数据库需要额外设计。

#### 方案二：Redis 去重

**原理**：利用 Redis 的 SETNX 原子操作，在消费前设置消息唯一标识。

```java
public void consume(MessageExt msg) {
    String msgId = msg.getMsgId();
    String redisKey = "msg:consumed:" + msgId;

    // SETNX: 设置成功返回 true（首次消费），否则返回 false（重复消费）
    Boolean isFirstConsume = redisTemplate.opsForValue()
        .setIfAbsent(redisKey, "1", 24, TimeUnit.HOURS);

    if (Boolean.TRUE.equals(isFirstConsume)) {
        // 首次消费，执行业务逻辑
        processBusiness(msg);
    } else {
        // 重复消费，直接跳过
        log.info("重复消息，跳过: msgId={}", msgId);
    }
}
```

**优点**：高性能，不侵入业务数据库。  
**缺点**：需要额外维护 Redis；Redis 和业务操作不在同一事务中，存在不一致窗口。

#### 方案三：业务状态机

**原理**：在业务数据中维护状态字段，通过状态流转来保证幂等。

```java
// 订单状态流转：PENDING → PAID → SHIPPED → COMPLETED
public void processPayment(String orderId, BigDecimal amount) {
    // 使用 CAS 更新，仅当状态为 PENDING 时才更新为 PAID
    int updated = jdbcTemplate.update(
        "UPDATE orders SET status = 'PAID', amount = ? " +
        "WHERE order_id = ? AND status = 'PENDING'",
        amount, orderId
    );
    if (updated == 0) {
        // 状态已经不是 PENDING，说明已被处理过，跳过
        return;
    }
    // 后续业务逻辑...
}
```

**优点**：业务语义清晰，天然支持幂等。  
**缺点**：需要业务配合设计状态机；不适用于所有场景。

#### 方案四：版本号 / 乐观锁

**原理**：在数据表中维护版本号，每次更新时检查版本号是否匹配。

```sql
-- 带版本号的更新
UPDATE inventory SET quantity = quantity - ?, version = version + 1
WHERE product_id = ? AND version = ?;
-- 如果 version 不匹配（已被其他操作更新），affected rows = 0
```

### 2.3 Kafka 幂等 vs RocketMQ 幂等

| 维度 | Kafka 幂等生产者 | RocketMQ 幂等消费 |
|------|-----------------|------------------|
| **实现位置** | Producer 端内置 | Consumer 端业务实现 |
| **机制** | PID + SeqNum，Broker 端去重 | 依赖业务层实现（唯一键/Redis/状态机） |
| **范围** | 单分区、单会话内 | 无限制，取决于业务方案 |
| **配置** | `enable.idempotence=true` | 无需额外配置，业务自行实现 |
| **局限性** | Producer 重启后 PID 变化，跨分区需事务 | 需要业务方自行设计幂等逻辑 |

---

## 三、消息堆积处理

消息堆积是指消费者处理速度跟不上生产者发送速度，导致消息在 Broker 端不断积压。

### 3.1 堆积原因分析

```
消息堆积的常见原因：
┌──────────────────────────────────────────────────┐
│ 1. 消费逻辑过重：慢 SQL、同步 RPC 调用、密集计算  │
│ 2. Consumer 实例不足：实例数远小于 Queue/Partition 数│
│ 3. 上游流量突发：大促、秒杀等瞬时流量激增         │
│ 4. 消费阻塞：单条消息处理失败导致整个 Queue 挂起   │
│ 5. 硬件瓶颈：CPU/内存/磁盘 IO 达到上限            │
│ 6. 毒消息：某条消息反复消费失败，阻塞后续消息     │
└──────────────────────────────────────────────────┘
```

### 3.2 分层处理策略

#### 第一层：紧急止损（L1-P0，5-10 分钟）

| 措施 | Kafka 操作 | RocketMQ 操作 | 预期效果 |
|------|-----------|---------------|----------|
| **增加 Consumer 实例** | 水平扩展 Consumer，<= Partition 数 | 水平扩展 Consumer，<= MessageQueue 数 | 消费能力线性提升 |
| **临时降级处理** | 跳过非关键消费逻辑，仅执行核心流程 | 同左 | 消费速度提升 2-5 倍 |
| **增加消费线程** | 调整 `max.poll.records` + 多线程处理 | 调整 `consumeThreadMin` / `consumeThreadMax` | 充分利用 CPU |
| **跳过积压消息** | `kafka-consumer-groups --reset-offsets --to-latest` | `mqadmin resetOffsetByTime` | 即刻消除堆积（丢失积压消息） |

#### 第二层：中期扩容（L2-P1，1-2 小时）

| 措施 | Kafka 操作 | RocketMQ 操作 |
|------|-----------|---------------|
| **增加分区/队列** | `kafka-topics --alter --partitions N` | `mqadmin updateTopic -r N -w N` |
| **消息迁移** | 创建新 Topic，临时 Consumer 消费积压后切换 | 同左 |
| **优化消费逻辑** | 批量写库、异步化、连接池复用 | 同左 |
| **升级硬件** | SSD 替换 HDD、增加内存 | 同左 |

#### 第三层：长期优化（L3-P2，持续）

| 措施 | 说明 |
|------|------|
| **生产者流控** | 实现背压机制，根据 Broker 流控信号动态调整发送速率 |
| **异步化改造** | 将同步处理链路改为异步 + 回调模式 |
| **容量规划与压测** | 定期全链路压测，确保 30%+ 冗余处理能力 |
| **监控告警** | 消息堆积量分级告警 + Grafana 大盘 |
| **死信队列** | 配置死信队列，避免"毒消息"反复重试 |

### 3.3 紧急场景处理流程

```
消息堆积告警触发：
         │
         ▼
  ┌─────────────────┐
  │ 1. 确认堆积原因    │
  │  (消费慢/生产暴涨) │
  └────────┬────────┘
           │
           ▼
  ┌─────────────────┐
  │ 2. 增加 Consumer  │
  │  实例（<=Queue数） │
  └────────┬────────┘
           │
           ▼
     ┌─────┴─────┐
     │堆积是否缓解？ │
  ┌──┤            ├──┐
  │  └─────┬─────┘  │
  │ YES    │   NO   │
  │        │        │
  ▼        │        ▼
结束       │  ┌─────────────────────┐
           │  │ 3. 临时跳过非关键逻辑   │
           │  │    加大消费线程数       │
           │  └─────────┬───────────┘
           │            │
           │       ┌────┴────┐
           │       │ 是否缓解？ │
           │       └────┬────┘
           │      YES   │   NO
           │       │    │    │
           │       ▼    │    ▼
           │      结束   │  4. 消息转移方案
           │            │     (新建Topic迁移)
           │            │
           └────────────┘
```

### 3.4 预防性措施

1. **监控告警**：设置消息堆积量的阈值告警（如积压超过 10 万条触发告警），结合 Grafana + Prometheus 构建可视化监控大盘。
2. **生产者流控**：在 Producer 端实现背压机制，当 Broker 返回流控错误时自动降低发送速率。

```java
// Producer 端流控示例（伪代码）
if (sendMessageQueue.size() > MAX_IN_FLIGHT) {
    Thread.sleep(backoffTime);
    backoffTime = Math.min(backoffTime * 2, MAX_BACKOFF);
}
```

3. **容量规划**：定期进行压测，确保系统在峰值流量下有足够的消费能力冗余（建议 30% 以上）。
4. **死信队列**：配置死信队列，将消费失败超过最大重试次数的消息转入死信队列，避免阻塞正常消息的处理。

### 3.5 排查思路

消息堆积时，建议按以下顺序排查：

1. **确认堆积范围**：是单个 Topic 堆积还是全局堆积？单个 Consumer Group 还是多个？
2. **检查消费逻辑**：消费代码中是否有慢 SQL？是否有同步阻塞 RPC 调用？
3. **检查系统资源**：Consumer 机器的 CPU、内存、网络 IO 是否达到瓶颈？
4. **检查 Broker 状态**：Broker 的磁盘 IO、Page Cache 命中率是否正常？
5. **检查消息生产速率**：是否上游业务突发流量导致生产速率异常升高？

---

## 四、事务消息对比

事务消息是分布式事务最终一致性的核心实现手段。Kafka 和 RocketMQ 提供了两种不同的事务消息模型。

### 4.1 RocketMQ 事务消息

采用**两阶段提交 + 事务回查**机制：

```
Producer                          RocketMQ Broker                    Local DB
   │                                    │                               │
   │  ① 发送半消息(HALF)                  │                               │
   │  (消息对Consumer不可见)              │                               │
   │───────────────────────────────────>│                               │
   │  ② 返回半消息成功                    │                               │
   │<───────────────────────────────────│                               │
   │  ③ 执行本地事务                      │                               │
   │───────────────────────────────────────────────────────────────────>│
   │  ④ 本地事务结果                      │                               │
   │  ⑤ 根据结果 COMMIT / ROLLBACK        │                               │
   │───────────────────────────────────>│                               │
   │                                    │                               │
   │  如果⑤超时或返回UNKNOWN，触发回查:    │                               │
   │  ⑥ Broker主动回调 checkLocalTransaction()                         │
   │  ⑦ Producer查询本地事务状态 → ⑨ 返回 COMMIT / ROLLBACK             │
```

**核心实现**：

```java
TransactionMQProducer producer = new TransactionMQProducer("tx_producer_group");
producer.setTransactionListener(new TransactionListener() {
    @Override
    public LocalTransactionState executeLocalTransaction(Message msg, Object arg) {
        try {
            localTxService.execute(arg);  // 执行本地事务
            return LocalTransactionState.COMMIT_MESSAGE;
        } catch (Exception e) {
            return LocalTransactionState.ROLLBACK_MESSAGE;
        }
    }

    @Override
    public LocalTransactionState checkLocalTransaction(MessageExt msg) {
        String txId = msg.getTransactionId();
        boolean txStatus = localTxService.checkStatus(txId);  // 回查本地事务状态
        return txStatus ? LocalTransactionState.COMMIT_MESSAGE
                        : LocalTransactionState.ROLLBACK_MESSAGE;
    }
});
```

**关键参数**：

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `transactionCheckInterval` | 60000ms | 事务消息回查间隔 |
| `transactionCheckMax` | 15 | 事务消息最大回查次数 |
| 首次回查间隔 | 60s | 半消息发送后首次回查间隔 |

### 4.2 Kafka 事务

采用**事务协调器（Transaction Coordinator）+ 幂等生产者**模型：

```java
// 1. 初始化事务
producer.initTransactions();

// 2. 开启事务
producer.beginTransaction();

// 3. 发送消息
producer.send(new ProducerRecord<>("topic-A", "key", "value"));
producer.send(new ProducerRecord<>("topic-B", "key", "value"));

// 4. 消费-转换-生产模式（Consume-Transform-Produce）
producer.sendOffsetsToTransaction(consumerOffsets, "consumer-group-id");

// 5. 提交事务
producer.commitTransaction();
```

**事务协调流程**：

```
┌──────────┐      ┌─────────────────────┐      ┌──────────┐
│ Producer │      │ Transaction          │      │  Broker  │
│          │      │ Coordinator          │      │ (各分区)  │
└────┬─────┘      └──────────┬──────────┘      └────┬─────┘
     │  initTransactions()   │                      │
     │──────────────────────►│ 分配 Transactional ID │
     │  beginTransaction()   │                      │
     │──────────────────────►│                      │
     │  send(topic-A, msg)   │                      │
     │──────────────────────────────────────────────►│ 消息标记为"未提交"
     │  commitTransaction()  │                      │
     │──────────────────────►│ 写入 PREPARE_COMMIT   │
     │                       │─────────────────────►│ 通知各分区
     │                       │ 写入 COMMITTED        │
     │                       │─────────────────────►│ 提交完成
```

**Consumer 端配合**：设置 `isolation.level=read_committed`，仅读取已提交的事务消息。

### 4.3 事务消息核心对比

| 对比维度 | RocketMQ 事务消息 | Kafka 事务 |
|----------|-------------------|------------|
| **事务模型** | 两阶段提交 + 回查 | 事务协调器模式 |
| **核心场景** | 分布式事务最终一致性（如订单+库存） | Exactly-Once 语义（如流计算中的精确一次处理） |
| **半消息机制** | 有（`RMQ_SYS_TRANS_HALF_TOPIC`） | 无（通过事务 Marker 标记消息可见性） |
| **参与者** | Producer + Broker（回查） | Producer + Transaction Coordinator + Consumer（隔离级别） |
| **回查机制** | Broker 主动回调 Producer | Producer 超时后自动 abort |
| **消费隔离** | 半消息对消费者完全不可见 | 支持 read_committed / read_uncommitted 隔离级别 |
| **性能开销** | 中等（额外一次半消息写入和回查机制） | 较高（需要写入 __transaction_state 和多个 Marker） |
| **实现复杂度** | 较低，业务方只需实现两个接口 | 较高，需要理解事务协调器和幂等机制 |
| **多分区/多 Topic 原子性** | 原生支持（半消息机制天然支持多 Topic） | 支持（事务 API 跨分区、跨 Topic） |
| **回滚能力** | 支持（ROLLBACK_MESSAGE 删除半消息） | 支持（abortTransaction 标记消息丢弃） |

### 4.4 选型建议

| 场景 | 推荐方案 | 原因 |
|------|----------|------|
| **电商下单扣库存** | RocketMQ 事务消息 | 天然支持分布式事务最终一致性，业务方实现简单 |
| **跨行转账** | RocketMQ 事务消息 | 金融级可靠性，同步刷盘 + 同步双写 |
| **流计算 Exactly-Once** | Kafka 事务 | 原生支持 Consume-Transform-Produce 模式 |
| **多 Topic 原子写入** | Kafka 事务 / RocketMQ 事务消息 | 两者都支持，Kafka 事务 API 更统一 |
| **简单异步解耦** | 无需事务 | 普通消息 + 业务幂等即可 |

---

> **总结**：消息可靠性是一个系统工程，需要从 Producer、Broker、Consumer 三端协同保障。Kafka 和 RocketMQ 在可靠性设计上各有侧重——Kafka 依赖 ISR 多副本同步和 Page Cache 实现高性能下的可靠性，RocketMQ 则通过同步刷盘、同步双写和 DLedger 提供金融级的可靠性保障。在实际生产环境中，应根据业务场景选择合适的中件间，并在 Consumer 端实现幂等消费作为最后一道防线。