---
title: RocketMQ 核心
outline: [2,3]
---

# Apache RocketMQ

> **最新版本**：RocketMQ 5.5.0
> **关键特性**：LiteTopic、gRPC 协议、POP 消费模式

---

## 知识图谱

### 入门级：基础概念

#### RocketMQ 是什么

Apache RocketMQ 是一个**低延迟、高可靠、万亿级容量**的分布式消息中间件，由阿里巴巴于2012年开源，2017年成为 Apache 顶级项目。其设计初衷是处理阿里巴巴双十一等极端流量场景下的消息需求，经过多年大规模生产验证，已被金融、电商、物流等行业的数千家企业广泛采用。

RocketMQ 的核心特点包括：

- **高吞吐低延迟**：单机吞吐量可达数十万 TPS，延迟控制在毫秒级。
- **金融级可靠性**：支持同步双写、异步刷盘，保证消息零丢失。
- **丰富的消息类型**：支持普通消息、顺序消息、延迟消息、事务消息、批量消息等多种类型。
- **弹性伸缩**：支持动态扩缩容，NameServer 无状态设计使集群管理极为轻量。

#### 核心组件表

| 组件 | 角色 | 核心职责 |
|------|------|----------|
| **NameServer** | 注册中心 | 管理 Broker 的路由信息，供 Producer/Consumer 查询；无状态、对等部署，每个节点独立运行 |
| **Broker** | 消息存储与转发引擎 | 接收 Producer 发送的消息，持久化存储，并将消息推送给 Consumer 或等待 Consumer 拉取 |
| **Producer** | 消息生产者 | 向 Broker 发送消息，支持同步/异步/单向发送三种方式 |
| **Consumer** | 消息消费者 | 从 Broker 拉取（Pull）或接收推送（Push）消息，进行业务处理 |

#### 消息模型

RocketMQ 的消息模型由以下四个核心概念构成：

```
  ┌────────────────────────────────────────────────────┐
  │                      Topic                          │
  │   ┌─────────┐  ┌─────────┐  ┌─────────┐          │
  │   │MessageQueue│  │MessageQueue│  │MessageQueue│      │
  │   │  (Q0)    │  │  (Q1)    │  │  (Q2)    │      │
  │   │ ┌─────┐  │  │ ┌─────┐  │  │ ┌─────┐  │      │
  │   │ │ Msg │  │  │ │ Msg │  │  │ │ Msg │  │      │
  │   │ │ Msg │  │  │ │ Msg │  │  │ │ Msg │  │      │
  │   │ │ Msg │  │  │ │ Msg │  │  │ │ Msg │  │      │
  │   │ └─────┘  │  │ └─────┘  │  │ └─────┘  │      │
  │   └─────────┘  └─────────┘  └─────────┘          │
  └────────────────────────────────────────────────────┘
```

| 概念 | 说明 | 类比 |
|------|------|------|
| **Topic** | 消息的逻辑分类，类似"频道"概念，生产者将消息发送到指定 Topic | 邮件主题 |
| **Tag** | Topic 下的二级分类，用于更精细的消息过滤，一条消息只能有一个 Tag | 邮件标签 |
| **MessageQueue** | Topic 的物理分区，每个 Topic 可包含多个 MessageQueue，分布在不同的 Broker 上 | 邮件收件箱的分区 |
| **Message** | 最小的数据传输单元，包含 Topic、Tag、Key、Body、Properties 等属性 | 单封邮件 |

#### 四种基本消息类型表

| 消息类型 | 说明 | 典型场景 | 可靠性保证 |
|----------|------|----------|------------|
| **普通消息** | 最基本的消息类型，Producer 发送后不关心 Consumer 是否收到 | 日志收集、用户行为埋点 | At Most Once / At Least Once |
| **顺序消息** | 保证同一 MessageQueue 内的消息严格按发送顺序被消费 | 订单状态变更、数据库 Binlog 同步 | 分区有序 |
| **延迟消息** | 发送后延迟指定时间才能被消费（18个预设级别 + 5.x 支持任意时间） | 超时订单取消、定时提醒 | 定时精度秒级 |
| **事务消息** | 保证本地事务与消息发送的原子性，实现分布式事务最终一致性 | 电商下单扣库存、跨行转账 | 两阶段提交 + 回查 |

#### RocketMQ 与 Kafka 的对比表

| 对比维度 | RocketMQ | Kafka |
|----------|----------|-------|
| **定位** | 金融级业务消息中间件 | 分布式流处理平台 |
| **NameServer vs ZooKeeper** | NameServer 无状态、对等、简单 | 依赖 ZooKeeper/KRaft 进行元数据管理 |
| **消息类型** | 普通/顺序/延迟/事务/批量 | 仅支持普通消息（事务/幂等需额外配置） |
| **延迟消息** | 内置支持，开箱即用 | 无原生支持，需自行实现（如时间轮调度） |
| **事务消息** | 原生两阶段事务支持 | Kafka Transactions（0.11+ 支持），模型不同 |
| **存储设计** | 全局 CommitLog + ConsumeQueue 索引 | Partition 级别的分段日志（Segment） |
| **消费者模型** | Pull/POP（5.x 新增） | Pull 为主 |
| **批量消息** | 支持（需满足体积限制 ~4MB） | 原生支持 |
| **流式计算** | 需要配合其他组件（如 Flink） | Kafka Streams 原生支持 |
| **适用场景** | 在线业务消息、分布式事务、金融场景 | 大数据管道、流处理、日志聚合 |

#### 典型应用场景

1. **异步解耦**：将长耗时、非核心流程异步化，提高系统吞吐和响应速度。例如用户注册后异步发送欢迎邮件和初始化账户。
2. **削峰填谷**：在大促期间将瞬时高峰流量暂存到消息队列中，后端按自身处理能力匀速消费，保护下游系统。
3. **分布式事务**：通过事务消息 + 本地事务表实现跨服务的最终一致性，典型场景如电商下单时扣减库存和创建订单。
4. **数据同步**：基于顺序消息实现 MySQL Binlog 到 Elasticsearch、HBase 等异构存储的实时同步。
5. **日志收集**：将分布式系统各节点的日志统一采集到消息队列，再由下游系统进行存储和分析。

---

### 进阶级：原理机制

#### NameServer 设计理念

NameServer 是 RocketMQ 架构中最具特色的设计之一，其核心设计理念可概括为三点：

**1. 无状态性**

NameServer 节点之间**不通信、不同步、不选举**。每个节点独立维护一套完整的路由表，路由信息由 Broker 主动上报。这意味着 NameServer 节点的增删不会影响集群功能，运维极其简单。

```
  ┌──────────┐     ┌──────────┐     ┌──────────┐
  │NameServer│     │NameServer│     │NameServer│
  │  Node1   │     │  Node2   │     │  Node3   │
  │ (独立)    │     │ (独立)    │     │ (独立)    │
  └─────┬────┘     └────┬─────┘     └────┬─────┘
        │               │               │
        │  心跳上报       │ 心跳上报        │ 心跳上报
        └───────────────┼───────────────┘
                        │
              ┌─────────┴─────────┐
              │     Broker 集群    │
              │  (Master + Slave) │
              └───────────────────┘
```

**2. 最终一致性**

Broker 与 NameServer 之间的路由信息同步采用**心跳 + 定期拉取**的模式，而非强一致性协议。Broker 每 30 秒向所有 NameServer 上报一次心跳，NameServer 如果 120 秒内未收到某 Broker 的心跳，则将其从路由表中移除。这种设计避免了复杂的共识协议，但引入了短暂的路由信息不一致窗口。

**3. 对等架构**

所有 NameServer 节点同等地位，无主次之分。Producer 和 Consumer 启动时会随机连接一个 NameServer（或轮询获取），如果连接失败则切换到下一个。客户端定期从 NameServer 拉取最新的路由信息并缓存在本地，因此即使所有 NameServer 暂时不可用，只要本地缓存有效，消息的发送和消费仍可正常进行。

#### Broker 存储架构

RocketMQ 的存储设计是其高性能和高可靠性的基础，采用**全局 CommitLog + ConsumeQueue + IndexFile** 三层结构。

```
Broker 存储目录结构：
/store
├── commitlog/                    # 全局 CommitLog（所有 Topic 的消息都写到这里）
│   ├── 00000000000000000000      # 1GB 大小的 CommitLog 文件
│   ├── 00000000001073741824
│   └── 00000000002047483648
├── consumequeue/                 # ConsumeQueue 索引
│   ├── TopicA/Queue0/
│   │   ├── 00000000000000000000  # ConsumeQueue 文件（每个 5.72MB，30万条）
│   │   └── 00000000000000300000
│   ├── TopicA/Queue1/
│   ├── TopicB/Queue0/
│   └── ...
├── index/                        # IndexFile 哈希索引（支持 Key 查询）
│   └── 20260606xxxxxxx
├── config/                       # Broker 配置持久化文件
│   ├── consumerOffset.json       # 消费位点
│   ├── delayOffset.json          # 延迟消息位点
│   ├── subscriptionGroup.json    # 订阅组
│   └── topics.json               # Topic 配置
├── abort                         # 是否存在判断 Broker 上次是否正常关闭
└── checkpoint                    # 存储最后 CommitLog/ConsumeQueue/IndexFile 刷盘点
```

**CommitLog 文件**：所有 Topic 的所有 MessageQueue 的消息都写入同一个 CommitLog 文件，物理上顺序追加写，充分利用磁盘顺序 IO 的高性能。每个文件固定 1GB，写满后创建新文件。

**ConsumeQueue 文件**：每个 Topic 的每个 MessageQueue 对应一个 ConsumeQueue，其中存储的并非消息体本身，而是指向 CommitLog 的索引项。每个索引项固定 20 字节（8 字节物理偏移量 + 4 字节消息大小 + 8 字节消息 Tag Hash Code）。

**IndexFile 文件**：基于哈希的索引文件，支持按 Message Key 快速查询消息。每条索引记录为固定大小，存储 Key 的 Hash 值与消息在 CommitLog 中的物理偏移量之间的映射。

#### 消息刷盘机制

RocketMQ 提供两种刷盘策略，在可靠性和性能之间做出权衡：

| 刷盘策略 | 写入流程 | 可靠性 | 性能 | 适用场景 |
|----------|----------|--------|------|----------|
| **同步刷盘 (SYNC_FLUSH)** | 消息写入 Page Cache 后立即调用 `fsync()`，确认磁盘写入成功后才返回 ACK 给 Producer | 极高，断电不丢消息 | 较低，TPS ~数千 | 金融支付、交易订单 |
| **异步刷盘 (ASYNC_FLUSH)** | 消息写入 Page Cache 后立即返回 ACK，由后台线程定期（默认 500ms）执行 `fsync()` | 中等，断电可能丢失最近 500ms 的数据 | 高，TPS 可达数万甚至十万+ | 日志收集、用户行为埋点 |

同步刷盘流程图：

```
Producer                    Broker                    Disk
   │                          │                        │
   │  发送消息                  │                        │
   │─────────────────────────>│                        │
   │                          │  写入 Page Cache       │
   │                          │──────────────────────>│
   │                          │                        │
   │                          │  调用 fsync()          │
   │                          │──────────────────────>│
   │                          │                        │
   │                          │  fsync 完成确认        │
   │                          │<──────────────────────│
   │                          │                        │
   │  返回 ACK（刷盘成功）       │                        │
   │<─────────────────────────│                        │
```

#### 消费模式

| 属性 | 集群消费 (CLUSTERING) | 广播消费 (BROADCASTING) |
|------|----------------------|------------------------|
| **消息分发** | 同一 Consumer Group 中，一条消息只会被一个 Consumer 消费 | 同一 Consumer Group 中，一条消息会被所有 Consumer 消费 |
| **消费进度** | 消费位点存储在 Broker 端 | 消费位点存储在 Consumer 本地 |
| **适用场景** | 分布式任务分配、订单处理 | 缓存刷新、配置热更新 |
| **水平扩展** | 支持，增加 Consumer 提升消费能力 | 不支持，增加 Consumer 导致重复消费 |

#### 延迟消息（18个延迟级别）

RocketMQ 4.x 提供 18 个预设的延迟级别，消息指定延迟级别后，会被暂存在内部延迟 Topic（`SCHEDULE_TOPIC_XXXX`），到时后投递到目标 Topic。

| Level | 延迟时间 | Level | 延迟时间 | Level | 延迟时间 |
|-------|---------|-------|---------|-------|---------|
| 1 | 1s | 7 | 3m | 13 | 9m |
| 2 | 5s | 8 | 4m | 14 | 10m |
| 3 | 10s | 9 | 5m | 15 | 20m |
| 4 | 30s | 10 | 6m | 16 | 30m |
| 5 | 1m | 11 | 7m | 17 | 1h |
| 6 | 2m | 12 | 8m | 18 | 2h |

::: tip RocketMQ 5.x 改进
5.0 版本引入了**基于时间轮的延迟消息**，支持任意精度的延迟时间，不再受限于 18 个预设级别。时间轮算法使用"环形数组 + 链表"结构，将延迟消息按到期时间分布到不同槽位，定时扫描到期槽位进行投递。
:::

---

### 经典高频级：核心难点

#### 事务消息完整流程

事务消息是 RocketMQ 最核心的高级特性之一，采用**两阶段提交 + 事务回查**机制，保证本地事务执行与消息发送的原子性。核心思路：先发半消息（对消费者不可见），执行本地事务，根据结果提交或回滚半消息，如果无法获取结果则通过回查兜底。

#### 顺序消息实现原理

顺序消息分为**全局顺序**和**分区顺序**。全局顺序通过将 Topic 的 MessageQueue 数设为 1 实现，所有消息都被发送到同一 Queue，消费者也只有一个线程消费。分区顺序通过 MessageQueueSelector 将同一业务标识（如订单号）的消息路由到同一 Queue，消费者对每个 Queue 加分布式锁串行消费。

#### RocketMQ 5.x 新特性

| 特性 | 说明 | 价值 |
|------|------|------|
| **gRPC 协议支持** | 新增 gRPC 通信协议，提供多语言 SDK 标准化的通信方式 | 统一通信协议，降低多语言 SDK 维护成本 |
| **Proxy 组件** | 独立的无状态代理层，负责协议转换、鉴权、限流 | 简化客户端逻辑，实现真正的轻量级客户端 |
| **POP 消费模式** | 引入 Pop 消费（类似 Kafka 的消费者模型），支持单个消费者拉取单条消息 | 解决 Push 模式下消息堆积时客户端 OOM 问题；支持更灵活的消费模式 |
| **LiteTopic** | 轻量级 Topic，不创建完整的 Topic 基础设施 | 降低海量 Topic 场景下的资源开销，适用于 IoT、多租户 SaaS 平台 |
| **分层存储** | 支持冷热数据分层，冷数据自动迁移至低成本存储（如 OSS、HDFS） | 降低长期存储成本，实现消息的无限期保留 |
| **Controller 模式** | 基于 Controller（基于 Raft）的自主选主，替代传统的依赖外部组件选主 | 简化高可用架构，支持自动主备切换 |

#### 消息堆积解决方案

消息堆积是生产环境中常见的故障场景，需要从**紧急止损、中期扩容、长期优化**三个层次制定应对策略。

---

## 核心原理深度解析

### 事务消息完整流程

事务消息是 RocketMQ 区别于其他消息中间件（如 Kafka）的核心竞争力之一。它解决了**本地事务执行与消息发送的原子性**问题，是实现分布式事务最终一致性的重要手段。

#### 流程图（ASCII 时序图）

```
Producer                          RocketMQ Broker                    Local DB
   │                                    │                               │
   │  ① 发送半消息(HALF)                  │                               │
   │  (消息对Consumer不可见)              │                               │
   │───────────────────────────────────>│                               │
   │                                    │                               │
   │  ② 返回半消息成功                    │                               │
   │<───────────────────────────────────│                               │
   │                                    │                               │
   │  ③ 执行本地事务                      │                               │
   │───────────────────────────────────────────────────────────────────>│
   │                                    │                               │
   │  ④ 本地事务结果                      │                               │
   │<───────────────────────────────────────────────────────────────────│
   │                                    │                               │
   │  ⑤ 根据结果 提交(COMMIT) / 回滚(ROLLBACK)                          │
   │───────────────────────────────────>│                               │
   │                                    │                               │
   │              ┌─────────────────────┴─────────────────────┐         │
   │              │  COMMIT: 消息对 Consumer 可见，正常投递      │         │
   │              │  ROLLBACK: 删除半消息                      │         │
   │              │  UNKNOWN: 进入回查流程                     │         │
   │              └─────────────────────┬─────────────────────┘         │
   │                                    │                               │
   │  如果⑤超时或返回UNKNOWN，触发回查:    │                               │
   │                                    │                               │
   │  ⑥ Broker主动回调 Producer 的 checkLocalTransaction()             │
   │<───────────────────────────────────│                               │
   │                                    │                               │
   │  ⑦ Producer查询本地事务状态          │                               │
   │───────────────────────────────────────────────────────────────────>│
   │  ⑧ 返回本地事务最终状态              │                               │
   │<───────────────────────────────────────────────────────────────────│
   │                                    │                               │
   │  ⑨ Producer返回 COMMIT / ROLLBACK    │                               │
   │───────────────────────────────────>│                               │
   │                                    │                               │
   │  ⑩ Broker最终确认处理                │                               │
   │                                    │                               │
```

#### 详细步骤拆解

**第1-2步：发送半消息（Half Message）**

Producer 向 Broker 发送一条"半消息"，这条消息被写入 Topic 为 `RMQ_SYS_TRANS_HALF_TOPIC` 的特殊队列中，对普通消费者不可见。Broker 存储半消息后返回成功响应。此时消息并未真正投递。

核心源码逻辑（`TransactionalMessageBridge.putHalfMessage()`）：

```java
// 半消息被写入 RMQ_SYS_TRANS_HALF_TOPIC 这个内部 Topic
// 对应的 ConsumeQueue 不会被消费者的 Rebalance 感知
MessageExt msgExt = this.parseHalfMessageInner(message);
return this.storage.putMessage(msgExt);
```

**第3-4步：执行本地事务**

Producer 收到半消息发送成功的回调后，执行 `LocalTransactionExecuter.executeLocalTransactionBranch()` 方法中的本地事务逻辑（如更新数据库状态、扣减库存等）。

**第5步：提交事务状态**

根据本地事务的执行结果，Producer 向 Broker 发送 Commit、Rollback 或 Unknown：

- **COMMIT_MESSAGE**：本地事务执行成功，Broker 将半消息恢复为普通消息，投递到目标 Topic 供消费者消费。
- **ROLLBACK_MESSAGE**：本地事务执行失败，Broker 删除半消息。
- **UNKNOWN**：无法确定本地事务状态（通常是超时），Broker 启动回查机制。

**第6-10步：事务回查（Check）**

当 Producer 因网络超时、进程崩溃等原因无法及时回传事务状态时，Broker 会定期扫描 `RMQ_SYS_TRANS_HALF_TOPIC` 中状态为 UNKNOWN 的半消息，通过回调 `TransactionListener.checkLocalTransaction()` 方法来回查本地事务的最终执行结果。默认回查规则：

- 首次回查间隔：60 秒
- 最大回查次数：15 次
- 超过最大次数后，消息将被丢弃

---

### 顺序消息实现原理

RocketMQ 的顺序消息保证同一 MessageQueue 中的消息严格按发送顺序被消费。实现分为发送端和消费端两个层面。

#### 全局顺序 vs 分区顺序

```
  全局顺序：                     分区顺序：
  Topic (1个Queue)              Topic (3个Queue)
  ┌──────────────────┐         ┌──────────┬──────────┬──────────┐
  │ A1→A2→A3→B1→B2→B3│         │  Queue0  │  Queue1  │  Queue2  │
  └──────────────────┘         │ A1→A2→A3 │ B1→B2→B3 │ C1→C2→C3 │
  性能: 低（单队列串行）           └──────────┴──────────┴──────────┘
  严格全局有序                   性能: 高（多队列并行）
                                同一分区内有序，跨分区无序
```

**全局顺序**：将 Topic 的读写队列数都设为 1，所有消息在单一队列中严格排序。缺点是严重限制吞吐量，适用于对全局顺序有刚性需求的场景，如数据库主备同步。

**分区顺序**：将同一业务实体（如订单 ID）的消息路由到同一 MessageQueue，保证了同一订单的消息有序，不同订单之间可以并行消费，兼顾顺序性和吞吐量。

#### 发送端：MessageQueueSelector

Producer 在发送消息时，通过 `MessageQueueSelector` 接口指定消息的路由策略：

```java
// MessageQueueSelector 接口定义
public interface MessageQueueSelector {
    MessageQueue select(
        final List<MessageQueue> mqs,  // 可用的 MessageQueue 列表
        final Message msg,             // 待发送的消息
        final Object arg               // 用于选择的关键参数（如订单ID）
    );
}

// 典型的分区顺序实现
SendResult sendResult = producer.send(msg, new MessageQueueSelector() {
    @Override
    public MessageQueue select(List<MessageQueue> mqs, Message msg, Object arg) {
        Long orderId = (Long) arg;
        // 通过取模运算将同一订单的消息路由到固定队列
        long index = orderId % mqs.size();
        return mqs.get((int) index);
    }
}, orderId);
```

::: warning 注意
关键点：`arg` 参数通常传入业务 ID（如 `orderId`），通过 `orderId % mqs.size()` 的取模运算，确保同一业务 ID 的所有消息被路由到同一个 MessageQueue。当 MessageQueue 数量发生变化时（扩缩容），原有消息的路由可能发生偏移，这也是 RocketMQ 顺序消息场景下不建议动态变更 Queue 数量的原因。
:::

#### 消费端：分布式锁 + 串行消费

消费端保证顺序的核心机制包括：

1. **单线程消费**：每个 MessageQueue 在同一个 Consumer Group 中只有一个消费线程，保证队列内的消息串行消费。

2. **分布式锁**（集群模式下）：多个 Consumer 竞争同一个 MessageQueue 的消费权，通过 Broker 端的锁机制确保同一时刻只有一个 Consumer 消费该 Queue。

3. **批量拉取 + 串行处理**：

```java
// 顺序消费Listener
consumer.registerMessageListener(new MessageListenerOrderly() {
    @Override
    public ConsumeOrderlyStatus consumeMessage(
            List<MessageExt> msgs, ConsumeOrderlyContext context) {
        for (MessageExt msg : msgs) {
            // 按顺序逐条处理
            processOrderly(msg);
        }
        return ConsumeOrderlyStatus.SUCCESS;
    }
});
```

4. **重试机制**：顺序消费失败时，当前消息会暂停消费（挂起），等待 Broker 端重试，期间该 Queue 的其他消息不会被消费，这也是保证顺序的必要代价。

```
Consumer 端顺序消费流程：
┌────────────────────────────────────────────────────┐
│  从 Broker 拉取一批消息                              │
│         │                                          │
│         ▼                                          │
│  获取该 MessageQueue 的分布式锁                      │
│         │                                          │
│    ┌────▼────┐                                     │
│    │ 锁定成功？ │── NO ──> 等待重试                    │
│    └────┬────┘                                     │
│         │ YES                                      │
│         ▼                                          │
│  逐条串行处理消息                                    │
│         │                                          │
│    ┌────▼────┐                                     │
│    │ 处理成功？ │── NO ──> SUSPEND_CURRENT_QUEUE_A_MOMENT│
│    └────┬────┘     (挂起当前队列，稍后重试)           │
│         │ YES                                      │
│         ▼                                          │
│  提交消费位点，释放分布式锁                           │
└────────────────────────────────────────────────────┘
```

---

### CommitLog 存储设计

#### 为什么使用全局 CommitLog

RocketMQ 选择全局 CommitLog 而非 Kafka 的 Partition 级日志设计，是基于以下考量：

1. **最大化磁盘顺序 IO**：将所有消息写入同一个 CommitLog 文件，确保写入始终是顺序追加，最大化磁盘利用率。

2. **简化数据管理**：全局 CommitLog 意味着只需要管理少量大文件，避免了海量小文件带来的元数据开销和文件句柄耗尽问题。Kafka 在多 Topic、多 Partition 场景下会面临"文件数爆炸"的问题。

3. **Topic 级别的轻量化**：由于消息体只存一份（CommitLog），创建和删除 Topic 的成本很低。ConsumeQueue 只是索引文件，删除 Topic 时只需要删除对应的 ConsumeQueue 即可，不需要移动 CommitLog。

#### ConsumeQueue 索引结构详解

ConsumeQueue 是 RocketMQ 设计的点睛之笔。它解决了一个核心矛盾：**物理上全局顺序写，逻辑上需要按 Topic 和 Queue 维度消费**。

```
CommitLog 物理存储（全局顺序追加）：

Offset:  0         1024      2048      3072      4096      5120
        ┌─────────┬─────────┬─────────┬─────────┬─────────┬─────────┐
        │TopicA-Q0│TopicB-Q0│TopicA-Q1│TopicA-Q0│TopicC-Q0│TopicB-Q0│ ...
        │  Msg1   │  Msg1   │  Msg1   │  Msg2   │  Msg1   │  Msg2   │
        └─────────┴─────────┴─────────┴─────────┴─────────┴─────────┘

对应的 ConsumeQueue 逻辑索引：

TopicA/Queue0/consumequeue:
┌──────────────────────────────────────────────┐
│ [Offset=0,    Size=1024, TagHash=0xABCD]     │ ──> 指向 Msg1
│ [Offset=3072, Size=1024, TagHash=0xABCE]     │ ──> 指向 Msg2
└──────────────────────────────────────────────┘

TopicA/Queue1/consumequeue:
┌──────────────────────────────────────────────┐
│ [Offset=2048, Size=1024, TagHash=0xABCF]     │ ──> 指向 Msg1
└──────────────────────────────────────────────┘
```

每个 ConsumeQueue 条目（20 字节）的结构：

```
┌────────────────┬──────────────┬──────────────────┐
│  CommitLog     │   消息体大小   │   Tag HashCode   │
│  Offset (8B)   │   Size (4B)  │   Tag Hash (8B)  │
└────────────────┴──────────────┴──────────────────┘
```

消费者根据消费位点定位到 ConsumeQueue 的某个条目，读取其中的 CommitLog Offset，然后通过 `mmap` 映射的 CommitLog 文件零拷贝读取消息内容。

#### 读写分离与零拷贝

RocketMQ 的消息写入和读取采用不同的机制：

- **写入路径**：Producer -> Broker 网络层 -> 堆外内存 -> `mmap` 写入 CommitLog（Page Cache）-> 异步/同步刷盘。
- **读取路径**：Consumer <- Broker 网络层 <- `mmap` 从 CommitLog 读取 <- 通过 ConsumeQueue 定位 <- 消费位点。

读取路径中，Broker 通过 `MappedByteBuffer` 和 `FileRegion` 实现**零拷贝传输**：消息数据直接从 Page Cache 通过 DMA 传输到网卡，不经过 CPU 拷贝。

```
传统四次拷贝路径：
磁盘 -> 内核缓冲区 -> 用户态缓冲区 -> Socket 缓冲区 -> 网卡
      (DMA)      (CPU拷贝)       (CPU拷贝)     (DMA)

RocketMQ 零拷贝路径：
磁盘 -> 内核缓冲区(PageCache) ──(DMA)──> 网卡
      (DMA)               (sendfile/splice)
```

---

### DLedger 高可用

DLedger 是 RocketMQ 为替代传统 Master-Slave 架构而引入的基于 Raft 协议变体的高可用方案。传统架构中，主从切换依赖外部组件（如 Controller 或人工干预），存在切换延迟和脑裂风险。DLedger 将选主逻辑内置到 Broker 进程中，实现了自动故障转移。

#### 架构模式

DLedger 模式下，一个 Broker Group 由 N 个节点（通常 3 或 5 个）组成，每个节点既是 Raft 状态机的一个参与者，又同时承担着 Broker 的角色。

```
DLedger Broker Group (3节点)：

┌──────────────┐     日志复制     ┌──────────────┐
│   Node-0     │◄───────────────►│   Node-1     │
│  (Leader)    │                  │  (Follower)  │
│ 提供读写服务   │                  │ 同步复制      │
└──────┬───────┘                  └──────┬───────┘
       │         ┌──────────────┐        │
       └─────────┤   Node-2     │────────┘
                 │  (Follower)  │
                 │ 同步复制      │
                 └──────────────┘
```

#### 与标准 Raft 的差异

DLedger 在 Raft 基础上做了以下关键适配：

- **CommitLog 即 WAL**：直接复用 RocketMQ 的 CommitLog 作为 Raft 的 Write-Ahead Log，避免引入额外的日志存储。
- **推送式复制**：Leader 主动将 CommitLog 条目推送给 Follower，而非让 Follower 拉取，减少复制延迟。
- **轻量级选举**：去除了 Raft 中的 PreVote 阶段，简化选举流程。这是因为 RocketMQ 集群规模通常不大（3-5 节点），并发选举概率低。

#### 同步流程

```
Producer          Leader               Follower-1          Follower-2
   │                │                      │                   │
   │  发送消息        │                      │                   │
   │───────────────>│                      │                   │
   │                │  写入本地 CommitLog     │                   │
   │                │────────┐              │                   │
   │                │<───────┘              │                   │
   │                │                      │                   │
   │                │  Push 消息到 Follower   │                   │
   │                │─────────────────────>│                   │
   │                │───────────────────────────────────────>│
   │                │                      │                   │
   │                │               写入本地 CommitLog    写入本地 CommitLog
   │                │                      │────────┐       │────────┐
   │                │                      │<───────┘       │<───────┘
   │                │                      │                   │
   │                │  ACK (written)        │                   │
   │                │<─────────────────────│                   │
   │                │  ACK (written)        │                   │
   │                │<───────────────────────────────────────│
   │                │                      │                   │
   │                │  超过半数 ACK，提交消息 │                   │
   │  返回发送成功    │                      │                   │
   │<───────────────│                      │                   │
```

只有在超过半数节点（包括 Leader）确认写入后，消息才被视为已提交，并向 Producer 返回成功。这保证了在任意单点故障时数据不丢失。

---

### 消息过滤机制

RocketMQ 提供两种消息过滤方式：表达式过滤（Tag / SQL92）和类过滤。

| 过滤方式 | 执行位置 | 性能 | 灵活性 | 适用场景 |
|----------|----------|------|--------|----------|
| **Tag 过滤** | Broker 端 | 高（基于 ConsumeQueue 的 Tag Hash 快速筛选） | 中（一个消息只能一个 Tag） | 按类型/分类订阅消息 |
| **SQL92 过滤** | Broker 端 | 中（需要解析消息 Properties） | 高（支持复杂条件表达式） | 按消息属性多条件组合过滤 |
| **布隆过滤器（5.x）** | Broker 端 | 高（内存内概率判断） | 高（支持任意 Key 判断） | 大量 Tag/Key 的快速过滤 |
| **类过滤（4.x）** | Consumer 端 | 低（需从 Broker 拉取后本地过滤） | 最高（自定义 Java 代码） | 复杂的业务过滤逻辑 |

#### Tag 过滤原理

```sql
-- 消费者订阅时指定 Tag
consumer.subscribe("OrderTopic", "PAID || SHIPPED");
```

Broker 在 ConsumeQueue 中存储了每条消息的 Tag HashCode，过滤时先对比 Tag HashCode，快速排除不匹配的消息。但由于 HashCode 可能存在碰撞，Broker 还会从 CommitLog 中读取完整 Tag 进行精确比对。

#### 布隆过滤器（5.x 新增）

在 RocketMQ 5.x 中，引入了布隆过滤器来加速消息过滤。布隆过滤器是一种空间效率极高的概率性数据结构，用于判断一个元素是否可能存在于某个集合中。

```
布隆过滤器结构：
┌───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───┐
│ 0 │ 1 │ 0 │ 0 │ 1 │ 1 │ 0 │ 0 │ 1 │ 0 │ 0 │ 1 │ ...  (bit数组)
└───┴───┴───┴───┴───┴───┴───┴───┴───┴───┴───┴───┘

Hash1("PAID")   = 1   ──> 位 bit[1]   = 1
Hash2("PAID")   = 4   ──> 位 bit[4]   = 1
Hash3("PAID")   = 8   ──> 位 bit[8]   = 1

查询时：计算 Hash("PAID")，检查 bit[1], bit[4], bit[8] 是否都为 1
- 都为 1：消息 "可能" 匹配 Tag（需要进一步精确校验）
- 有 0：消息 "一定不" 匹配 Tag（直接跳过，无需读取 CommitLog）
```

::: info 注意
布隆过滤器存在假阳性（False Positive），即可能误判一个不匹配的 Tag 为匹配，但这不影响消息消费的正确性（后续还会做精确校验），只影响过滤效率的上限。
:::

---

### 消息堆积解决方案

消息堆积是指消费者处理速度跟不上生产者发送速度，导致消息在 Broker 端不断积压的情况。以下按紧急程度分层给出处理策略：

#### 三层处理策略表

| 层级 | 优先级 | 策略 | 具体措施 | 效果 | 代价/风险 |
|------|--------|------|----------|------|-----------|
| **紧急 (L1)** | P0 | 立即扩容消费者 | 增加 Consumer 实例数量（但不超过 MessageQueue 数量） | 立竿见影，处理能力线性提升 | 受限于 Queue 数量 |
| **紧急 (L1)** | P0 | 临时提升消费速度 | 跳过非关键逻辑、增加消费线程、降低日志级别 | 快速减轻积压 | 可能丢失部分业务逻辑处理 |
| **中期 (L2)** | P1 | 增加 MessageQueue | 在线动态增加 Topic 的 Queue 数量 | 允许进一步横向扩展 Consumer | 对顺序消息有影响 |
| **中期 (L2)** | P1 | 优化消费逻辑 | 批量处理、异步化非关键流程、优化数据库查询 | 从根本上提升消费吞吐 | 需要代码改动和测试 |
| **中期 (L2)** | P1 | 消息转移 | 创建新 Topic，将积压消息转移到新队列由临时消费者处理 | 快速清空积压 | 操作复杂，可能影响数据一致性 |
| **长期 (L3)** | P2 | 异步化改造 | 将同步处理链路改造为异步 + 回调模式 | 系统性提升吞吐 | 架构变更，周期长 |
| **长期 (L3)** | P2 | 系统扩容 | 升级硬件（SSD、网络带宽）、增加 Broker 节点 | 整体提升集群能力 | 成本高 |
| **长期 (L3)** | P2 | 流控机制 | 在 Producer 端引入限流和背压机制 | 从源头上防止堆积 | 可能影响上游业务 |

#### 紧急场景处理流程

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

#### 预防性措施

1. **监控告警**：设置消息堆积量的阈值告警（如积压超过 10 万条触发告警），结合 Grafana + Prometheus 构建可视化监控大盘。
2. **生产者流控**：在 Producer 端实现背压机制，当 Broker 返回流控错误时自动降低发送速率。
3. **容量规划**：定期进行压测，确保系统在峰值流量下有足够的消费能力冗余（建议 30% 以上）。
4. **死信队列**：配置死信队列，将消费失败超过最大重试次数的消息转入死信队列，避免阻塞正常消息的处理。

---

## 经典高频面试题

### Q1: RocketMQ 的事务消息是如何实现的？与 Kafka 事务有何不同？

#### RocketMQ 事务消息实现

RocketMQ 事务消息采用**两阶段提交 + 事务回查**机制（详细流程见上文），核心步骤：

1. Producer 发送半消息到 `RMQ_SYS_TRANS_HALF_TOPIC`，对消费者不可见。
2. Producer 执行本地事务逻辑。
3. Producer 根据本地事务结果，通知 Broker Commit 或 Rollback。
4. Broker 对于 UNKNOWN 状态的消息，定期回查 Producer 的 `checkLocalTransaction()` 接口。

```java
// RocketMQ 事务消息发送示例
TransactionMQProducer producer = new TransactionMQProducer("tx_producer_group");
producer.setTransactionListener(new TransactionListener() {
    @Override
    public LocalTransactionState executeLocalTransaction(Message msg, Object arg) {
        // 执行本地事务
        try {
            // 扣减库存、更新订单状态等
            localTxService.execute(arg);
            return LocalTransactionState.COMMIT_MESSAGE;
        } catch (Exception e) {
            return LocalTransactionState.ROLLBACK_MESSAGE;
        }
    }

    @Override
    public LocalTransactionState checkLocalTransaction(MessageExt msg) {
        // 回查本地事务状态
        String txId = msg.getTransactionId();
        boolean txStatus = localTxService.checkStatus(txId);
        return txStatus ? LocalTransactionState.COMMIT_MESSAGE
                        : LocalTransactionState.ROLLBACK_MESSAGE;
    }
});
```

#### Kafka 事务实现

Kafka 的事务机制从 0.11.0 版本开始引入，采用**事务协调器（Transaction Coordinator）+ 幂等性生产者**模型：

1. Producer 向 Transaction Coordinator 申请一个 Transaction ID。
2. Producer 标记事务开始，发送消息时携带事务信息。
3. Producer 发送 `commitTransaction` 或 `abortTransaction` 请求。
4. Transaction Coordinator 写入 `__transaction_state` 内部 Topic 记录事务结果，通知各 Partition 标记事务消息为可见或丢弃。

#### 核心对比

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

::: tip 关键差异总结
RocketMQ 事务消息的核心目的是**保证本地事务与消息发送的原子性**，解决分布式事务场景下的数据一致性问题；Kafka 事务的核心目的是**保证消息生产和消费的 Exactly-Once 语义**，解决流处理场景下的重复计算问题。两者的设计目标和使用场景有本质区别。
:::

---

### Q2: RocketMQ 如何保证消息顺序？

RocketMQ 通过**发送端路由 + 消费端串行**双机制来实现消息顺序保证。

#### 发送端机制

通过 `MessageQueueSelector` 接口，基于业务 ID（如订单号 `orderId`）进行取模路由，确保同一业务 ID 的消息始终被发送到同一个 MessageQueue：

```java
// 核心路由逻辑：orderId % queueSize
long index = orderId % mqs.size();
MessageQueue selectedQueue = mqs.get((int) index);
```

发送端还需注意：

- 使用**同步发送**而非异步发送，避免多发时的乱序。
- 发送失败时采用**重试机制**，但必须重试到同一个 MessageQueue（RocketMQ 默认行为）。

#### 消费端机制

1. **加锁串行消费**：对每个 MessageQueue 加分布式锁，同一时刻只有一个 Consumer 实例消费该 Queue。
2. **单线程消费**：每个 Queue 由一个消费线程串行处理，`MessageListenerOrderly` 内部使用线程池，但同一 Queue 的消息不会被并发处理。
3. **失败挂起**：如果某条消息消费失败，当前 Queue 的消费会被挂起（`SUSPEND_CURRENT_QUEUE_A_MOMENT`），等待重试，期间不会跳过该消息消费下一条。

#### 局限性

1. **分区有序而非全局有序**：默认模式下，只能保证同一 MessageQueue 内有序，跨 Queue 的消息顺序无法保证。
2. **宕机场景**：如果 Broker 宕机，正在消费的 Queue 会被重新分配，极端情况下可能丢失顺序性。
3. **扩容影响**：增加 MessageQueue 数量会打乱原有的 `orderId % queueSize` 的映射关系，影响顺序性。
4. **性能折损**：串行消费限制了单个 Queue 的吞吐量，需要合理规划 Queue 数量以平衡吞吐和顺序。

---

### Q3: RocketMQ 的存储架构是怎样的？为什么使用 CommitLog + ConsumeQueue？

#### 存储架构概述

RocketMQ 采用**全局 CommitLog + ConsumeQueue 索引 + IndexFile** 的三层存储架构。

```
        ┌──────────────────────────────────┐
        │           Topic A                │
        │  Queue0    Queue1    Queue2      │
        └────┬─────────┬─────────┬─────────┘
             │         │         │
             │  ConsumeQueue（索引层，仅存储偏移量）
             │         │         │
             └─────────┼─────────┘
                       │
                       ▼
        ┌──────────────────────────────────┐
        │        CommitLog（数据层）          │
        │  所有 Topic 的消息顺序写入同一文件   │
        └──────────────────────────────────┘
```

#### 为什么使用 CommitLog + ConsumeQueue

**1. 最大化磁盘顺序 IO 性能**

全局 CommitLog 将所有消息顺序追加到单个日志文件，充分利用了磁盘的顺序写入性能。

**2. 简化存储管理**

全局 CommitLog 意味着只需要管理有限数量的大文件（单个文件 1GB）。避免了 Kafka 那种多 Partition 多 Segment 文件带来的海量小文件管理问题。

**3. Topic 轻量化**

由于消息体只存储一份在 CommitLog 中，而 ConsumeQueue 只是轻量级的索引文件（每条记录仅 20 字节），创建和删除 Topic 的成本极低。对于需要频繁创建临时 Topic 的场景（如请求-响应模式），这一设计优势明显。

**4. 读写分离**

写入只涉及 CommitLog（顺序写），读取通过 ConsumeQueue 定位后从 CommitLog 读取（随机读）。两者互不干扰，可独立优化。

#### 与 Kafka 存储对比

| 维度 | RocketMQ | Kafka |
|------|----------|-------|
| **存储单元** | 全局 CommitLog（所有 Topic 共享） | 每个 Partition 独立的日志段 |
| **索引结构** | ConsumeQueue（按 Topic-Queue 维度独立索引） | Partition 内的偏移量索引 + 时间索引 |
| **写入方式** | 全局顺序追加写 | 每个 Partition 独立顺序追加写 |
| **Topic 开销** | 极低（仅创建 ConsumeQueue 目录和索引文件） | 较高（每个 Partition 创建独立的日志目录和 Segment 文件） |
| **文件数量** | 少（CommitLog 文件数 = CommitLog 总大小 / 1GB） | 多（Partition 数 x 每个 Partition 的 Segment 数） |
| **消费定位** | 通过 ConsumeQueue 的物理偏移量定位 | 通过 Partition 的逻辑偏移量定位 |
| **海量 Topic** | 友好，支持数以万计的 Topic | 不友好，Partition 文件数爆炸 |
| **顺序读写** | 写入：纯顺序；读取：通过索引随机读 | 写入：每个 Partition 顺序；读取：每个 Partition 顺序 |

---

### Q4: NameServer 为什么设计成无状态对等架构？相比 ZooKeeper 有什么优劣？

#### 设计原因

RocketMQ 选择 NameServer 无状态对等架构，主要是基于阿里巴巴大规模生产环境的实际需求：

**1. 极致简化运维**

- **节点无差异**：所有 NameServer 节点完全相同，无主从之分，无选举过程。新增或删除节点只需修改客户端配置，无需数据迁移。
- **独立运行**：节点间不通信、不同步、不选举。任何节点的故障或重启不影响其他节点。
- **天然可线性扩容**：NameServer 是无状态的，增加节点即可提升整体可用性，无上限。

**2. 避免分布式一致性问题**

- CAP 理论中，NameServer 选择了 AP（可用性 + 分区容错性），放弃了 C（强一致性），改用最终一致性模型。
- 路由信息由 Broker 定期心跳上报，即便个别 NameServer 的路由信息短暂不一致，也不会导致消息丢失，最多引起短暂的消息发送失败（客户端自动切换）。

**3. 降低系统复杂度**

- 去除了 Leader 选举、数据同步、分布式锁等复杂机制，代码量大幅减少，Bug 概率降低。
- 对于消息中间件而言，路由服务的核心需求是"可用"和"基本准确"，NameServer 的最终一致性模型完全满足这一需求。

#### 与 ZooKeeper 的对比

| 对比维度 | NameServer | ZooKeeper（作为注册中心） |
|----------|------------|--------------------------|
| **架构模型** | 无状态、对等节点 | 有状态、Leader-Follower |
| **一致性协议** | 无（最终一致性） | ZAB 协议（强一致性） |
| **数据来源** | Broker 主动心跳上报 | 客户端向 ZK 写入临时节点 |
| **部署复杂度** | 极低，独立进程，零配置即可启动 | 中等，需要配置集群、数据目录等 |
| **运维复杂度** | 极低，节点故障直接重启即可 | 中等，需要注意 Leader 选举、数据同步 |
| **性能** | 极高（纯内存 + 无一致性开销） | 中等（写操作需要通过 Leader） |
| **可用性** | 高（任一部分节点可用即可） | 高（需要过半节点存活） |
| **路由更新延迟** | Broker 心跳间隔（30s） + NameServer 超时（120s） | 实时（临时节点 + Watcher） |
| **可靠性** | 路由信息可能短暂不一致 | 路由信息强一致 |
| **适用场景** | 对路由信息实时性要求不极端的高吞吐消息系统 | 对一致性要求严格的分布式协调场景 |

#### 优劣势分析

**NameServer 的优势**：

1. 运维极其简单，甚至可以在同一台机器上启动多个实例来提升可用性。
2. 性能极高，无一致性开销，纯内存读取。
3. 天然支持水平扩展，无理论节点上限。
4. 启动快，故障恢复快（秒级）。

**NameServer 的劣势**：

1. 路由信息存在延迟（最长可达 Broker 心跳间隔 + 超时时间），可能在 Broker 宕机后仍有短暂的无效路由。
2. 不支持 Watcher 机制，客户端需要定期轮询拉取路由信息。
3. 不提供分布式协调能力（如分布式锁、配置管理等），这些功能需要借助其他组件完成。

::: tip 总结
NameServer 的设计哲学是"够用就好"，它放弃了强一致性和部分实时性，换取了极致的运维简便性和性能。对于 RocketMQ 这种高吞吐消息系统而言，这是一个非常务实的设计选择。而 ZooKeeper 提供了更强的数据一致性和更丰富的协调原语，但代价是更高的复杂度和运维成本。
:::

---

### Q5: RocketMQ 消息堆积了怎么处理？

消息堆积是生产环境中最常见的故障场景之一，需要分层、有序地进行处理。

#### 第一层：紧急止损（L1-P0）

**目标**：在 5-10 分钟内快速缓解堆积，防止系统进一步恶化。

| 措施 | 操作方式 | 预期效果 |
|------|----------|----------|
| **增加 Consumer 实例** | 水平扩展 Consumer，实例数 <= MessageQueue 数量 | 消费能力线性提升 |
| **临时降级处理** | 跳过非关键业务逻辑（如日志、通知），仅执行核心流程 | 消费速度提升 2-5 倍 |
| **增加消费线程** | 调整 `consumeThreadMin` / `consumeThreadMax` 参数 | 充分利用 CPU 资源 |
| **修改消费位点** | 紧急情况下跳过积压消息（重置 offset 到最新） | 即刻消除堆积（会丢失积压消息） |

```java
// 配置消费线程数
consumer.setConsumeThreadMin(20);  // 最小消费线程数
consumer.setConsumeThreadMax(64);  // 最大消费线程数
```

#### 第二层：中期扩容（L2-P1）

**目标**：在 1-2 小时内从根本上提升消费能力。

| 措施 | 操作方式 | 注意事项 |
|------|----------|----------|
| **增加 MessageQueue** | 在线动态调整 Topic 的读写队列数 | 对顺序消息有影响；新增 Queue 后需增加 Consumer 实例 |
| **消息迁移方案** | 新建临时 Topic，将积压消息转移到新 Topic 由专用 Consumer 群组消费 | 操作复杂，需要编写迁移脚本 |
| **优化消费逻辑** | 批量消费、异步写库、连接池复用、减少 RPC 调用 | 需要开发、测试、上线，周期较长 |
| **升级硬件** | SSD 替换 HDD、增加 Broker 内存、升级网络带宽 | 需要运维配合，成本较高 |

```bash
# 动态增加 Topic 的 MessageQueue 数量（RocketMQ CLI）
mqadmin updateTopic -n namesrv:9876 -t OrderTopic -r 16 -w 16
# -r: 读队列数  -w: 写队列数
```

#### 第三层：长期优化（L3-P2）

**目标**：从根本上预防消息堆积的发生。

| 措施 | 说明 |
|------|------|
| **生产者流控** | 在 Producer 端实现背压机制，根据 Broker 返回的流控信号动态调整发送速率 |
| **异步化改造** | 将同步处理链路改为异步 + 回调模式，消除阻塞等待 |
| **容量规划与压测** | 定期进行全链路压测，确保系统在峰值流量下有 30%+ 的冗余处理能力 |
| **监控告警体系** | 建立消息堆积量的分级告警（警告/严重/紧急），结合 Grafana 大盘实时监控 |
| **死信队列机制** | 合理配置消费重试次数和死信队列，避免"毒消息"反复重试导致堆积 |

```java
// Producer 端流控示例（伪代码）
if (sendMessageQueue.size() > MAX_IN_FLIGHT) {
    // 本地队列积压，暂停发送，触发背压
    Thread.sleep(backoffTime);
    backoffTime = Math.min(backoffTime * 2, MAX_BACKOFF);
}
```

#### 排查思路

消息堆积时，建议按以下顺序排查：

1. **确认堆积范围**：是单个 Topic 堆积还是全局堆积？单个 Consumer Group 还是多个？
2. **检查消费逻辑**：消费代码中是否有慢 SQL？是否有同步阻塞 RPC 调用？
3. **检查系统资源**：Consumer 机器的 CPU、内存、网络 IO 是否达到瓶颈？
4. **检查 Broker 状态**：Broker 的磁盘 IO、Page Cache 命中率是否正常？
5. **检查消息生产速率**：是否上游业务突发流量导致生产速率异常升高？

---

### Q6: RocketMQ 5.x 相比 4.x 有哪些重要变化？

RocketMQ 5.x 是自 RocketMQ 4.x 发布以来最大的一次版本升级，在架构、协议、能力三个层面进行了全面革新。

#### 核心变化总览表

| 变化点 | 4.x | 5.x | 价值 |
|--------|-----|-----|------|
| **通信协议** | Remoting 协议（Java 原生） | 新增 gRPC + Remoting 双协议 | 多语言 SDK 标准化，跨语言互通 |
| **架构组件** | NameServer + Broker + Client | 新增 Proxy 无状态代理层 | 协议转换、安全鉴权、限流统一处理 |
| **消费模式** | Push / Pull | 新增 POP（Pop Consumption） | 解决 Push 模式堆积 OOM 问题 |
| **Topic 模型** | 传统 Topic（完整基础设施） | 新增 LiteTopic（轻量 Topic） | 海量 Topic 场景（IoT、多租户）降低成本 |
| **存储能力** | 本地存储 | 新增分层存储（Tiered Storage） | 冷数据低成本存储，无限期消息保留 |
| **高可用** | 依赖外部 Controller / 手动切换 | 内置 Controller（基于 Raft） | 自动故障转移，简化高可用架构 |
| **延迟消息** | 18 个预设延迟级别 | 任意精度延迟（时间轮） | 更灵活的定时消息支持 |
| **可观测性** | 基础指标 | OpenTelemetry 集成 + 完善 Metrics | 更好的监控和追踪能力 |

#### 1. gRPC 协议支持

**背景**：RocketMQ 4.x 使用的 Remoting 协议是基于 Netty 的 Java 原生协议，导致非 Java 语言的 SDK 需要独立实现序列化和协议编解码，维护成本极高。

**5.x 方案**：引入 gRPC 作为标准通信协议，利用其内置的 Protobuf 序列化、HTTP/2 多路复用、流式传输等能力，实现跨语言统一通信。

```
4.x 架构:
Client(Java) ──Remoting──> Broker
Client(Go)   ──自定义协议──> Broker   (各自维护)
Client(C++)  ──自定义协议──> Broker

5.x 架构:
Client(Java) ──gRPC/Remoting──> Proxy ──Remoting──> Broker
Client(Go)   ──gRPC─────────> Proxy ──Remoting──> Broker
Client(C++)  ──gRPC─────────> Proxy ──Remoting──> Broker
```

#### 2. Proxy 无状态代理层

Proxy 是 5.x 架构中最关键的新增组件，它是一个独立的、无状态的代理层，负责：

- **协议转换**：将 gRPC 请求转换为 Broker 的 Remoting 协议。
- **安全鉴权**：统一的认证和授权层，支持 ACL、OAuth2 等。
- **流量控制**：连接管理、限流、熔断等。
- **命名空间隔离**：实现多租户的资源隔离。

Proxy 组件使得客户端可以做到真正的轻量化（"Thin Client"），所有复杂的逻辑下沉到 Proxy 层。

#### 3. POP 消费模式

**背景**：4.x 的 Push 模式下，Broker 主动将消息推送给 Consumer，当消息堆积时，大量消息堆积在 Consumer 的本地缓存队列中，容易导致 Consumer OOM。

**5.x 方案**：POP 模式类似于 Kafka 的消费模型，Consumer 主动向 Broker 发请求"Pop"一条或一批消息。这种模式下：

- 消息不会在 Consumer 端堆积，OOM 风险消除。
- 支持单个消费者灵活控制拉取速率。
- 通过 `invisibleTime` 机制实现消息的确认和重试。

```
Push 模式问题:
Broker ──push──> Consumer 本地队列(堆积，OOM) ──> 业务处理

POP 模式方案:
Broker <──pop request── Consumer (消息在Broker端，Consumer无堆积)
Broker ──pop response─> Consumer ──> 业务处理 ──> ACK/NAK
```

#### 4. 分层存储

RocketMQ 5.x 引入了分层存储（Tiered Storage），将消息分为热、温、冷三层：

```
热数据（Hot）  ──> 本地 SSD/内存    ──> 最近 N 小时的消息，快速读写
温数据（Warm） ──> 本地 HDD        ──> N 小时 ~ N 天的消息，降速访问
冷数据（Cold） ──> 远程对象存储     ──> N 天以上的消息，低成本归档
              (OSS/S3/HDFS/MinIO)
```

冷数据自动迁移至低成本的对象存储，消息理论上可以无限期保留。消费者拉取历史消息时，Broker 从远程存储中透明地获取数据并返回。

#### 5.x 升级建议

| 场景 | 建议 |
|------|------|
| **全新项目** | 直接采用 5.x 全套架构（Proxy + gRPC + POP） |
| **4.x 存量系统** | 渐进式升级：先接入 Proxy（兼容 4.x Remoting 协议），再逐步迁移到 gRPC 和 POP |
| **海量 Topic 场景** | 重点关注 LiteTopic 和分层存储能力 |
| **多语言环境** | 重点利用 gRPC 协议 + Proxy 获得统一多语言 SDK 体验 |

---

## 附录：RocketMQ 关键配置参数速查表

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `flushDiskType` | ASYNC_FLUSH | 刷盘类型：SYNC_FLUSH / ASYNC_FLUSH |
| `flushIntervalCommitLog` | 500ms | 异步刷盘间隔 |
| `brokerRole` | ASYNC_MASTER | Broker 角色：ASYNC_MASTER / SYNC_MASTER / SLAVE |
| `namesrvAddr` | - | NameServer 地址列表，分号分隔 |
| `mapedFileSizeCommitLog` | 1GB | 单个 CommitLog 文件大小 |
| `mapedFileSizeConsumeQueue` | 300000 * 20B | 单个 ConsumeQueue 文件大小（约 5.72MB） |
| `consumeThreadMin` | 20 | 最小消费线程数 |
| `consumeThreadMax` | 64 | 最大消费线程数 |
| `maxReconsumeTimes` | 16 | 最大重试消费次数 |
| `sendMessageTimeout` | 3000ms | 发送消息超时时间 |
| `heartbeatBrokerInterval` | 30000ms | 心跳上报间隔 |
| `deleteWhen` | 04 | 每天凌晨 4 点执行过期文件删除 |
| `fileReservedTime` | 72 (小时) | 文件保留时长 |
| `transactionCheckInterval` | 60000ms | 事务消息回查间隔 |
| `transactionCheckMax` | 15 | 事务消息最大回查次数 |
| `autoCreateTopicEnable` | true | 是否自动创建 Topic（生产环境建议关闭） |
| `maxMessageSize` | 4194304 (4MB) | 单条消息最大体积 |
| `sendLatencyFaultEnable` | false | 是否启用延迟故障容错（建议开启） |

---

> **参考资源**
> - RocketMQ 官方文档：https://rocketmq.apache.org/docs/
> - GitHub 仓库：https://github.com/apache/rocketmq
> - RocketMQ 5.x 迁移指南：https://rocketmq.apache.org/docs/migration-4-5x/