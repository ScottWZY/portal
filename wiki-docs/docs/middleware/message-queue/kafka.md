---
title: Kafka 核心
outline: [2,3]
---

# Apache Kafka

> 最新版本：Kafka 4.0（2025年3月），默认启用 KRaft 模式，彻底移除 ZooKeeper 依赖。

---

## 知识图谱

### 入门级：基础概念

#### Kafka 是什么？

Apache Kafka 是一个**分布式流式数据平台**，它同时扮演三重角色：

1. **消息队列（Message Queue）**：提供分布式的发布-订阅模型，解耦系统间的数据传递。
2. **流处理平台（Stream Processing Platform）**：通过 Kafka Streams / KSQL 对实时数据进行转换、聚合、过滤等操作。
3. **分布式存储系统（Distributed Storage）**：持久化存储消息数据，支持回放和历史数据查询。

Kafka 最初由 LinkedIn 开发，后贡献给 Apache 基金会，现已成为流式数据处理的事实标准。

#### 核心组件

| 组件 | 说明 |
|------|------|
| **Producer（生产者）** | 向 Kafka Topic 发送消息的客户端应用。负责将消息路由到正确的分区。 |
| **Broker（代理节点）** | Kafka 集群中的一个服务节点，负责存储和管理消息。一个集群由多个 Broker 组成。 |
| **Consumer（消费者）** | 从 Kafka Topic 拉取（Pull）消息的客户端应用。 |
| **Consumer Group（消费者组）** | 一组消费者的逻辑集合，组内消费者共同消费一个 Topic，每个分区仅由一个消费者消费。 |
| **Topic（主题）** | 消息的逻辑分类，类似数据库中的"表"。一个 Topic 可包含多个分区。 |
| **Partition（分区）** | Topic 的物理分片，每个分区是一个**有序、不可变**的消息队列。分区是实现并行和扩展的基础。 |
| **Offset（偏移量）** | 消息在分区内的唯一序号，单调递增，消费者通过它来追踪消费进度。 |
| **Replica（副本）** | 每个分区可有多个副本（Leader + Follower），实现数据冗余和高可用。 |

#### 典型应用场景

```
+------------------------------------------------------------------+
|                        典型应用场景                                |
+------------------------------------------------------------------+
|  1. 日志收集          |  将各服务的应用日志统一汇聚到 Kafka，       |
|                       |  再由下游（ES / HDFS）消费分析。           |
+------------------------------------------------------------------+
|  2. 消息系统          |  系统间异步解耦通信，削峰填谷，             |
|                       |  替代传统 MQ（RabbitMQ、ActiveMQ 等）。     |
+------------------------------------------------------------------+
|  3. 流计算            |  与 Flink/Spark Streaming 联动，             |
|                       |  实现实时 ETL、实时数仓建设。                |
+------------------------------------------------------------------+
|  4. 事件溯源（Event   |  将系统的每次状态变更记录为事件，            |
|     Sourcing）        |  支持审计回溯和 CQRS 架构。                  |
+------------------------------------------------------------------+
|  5. CDC（Change Data  |  捕获数据库变更事件（如 Debezium + Kafka）， |
|     Capture）         |  实现数据同步、缓存失效等场景。              |
+------------------------------------------------------------------+
```

---

### 进阶级：原理机制

#### 分区机制与消息路由

Kafka Topic 在物理上被切分为若干个 Partition，每个 Partition 是一个有序的、不可变的消息序列。消息在分区内由自增的 Offset 唯一标识。

**生产者如何决定消息发送到哪个分区？**

- **指定 key**：`hash(key) % partition_count`，相同 key 的消息总是路由到同一分区（保证局部有序）。
- **未指定 key**：Kafka 默认使用**轮询（Round-Robin）**方式（Kafka 2.4+ 默认使用黏性分区 Sticky Partition），将消息均匀分发到各分区。
- **自定义 Partitioner**：实现 `Partitioner` 接口，按业务规则自行路由。

#### 副本机制（Replication）

每个 Partition 可以有 N 个副本（由 `replication.factor` 决定），其中有一个 Leader 和多个 Follower：

- **Leader**：负责处理所有客户端的读写请求。
- **Follower**：被动地从 Leader 拉取数据，保持同步。
- **ISR（In-Sync Replicas）**：与 Leader 保持同步的副本集合，是数据可靠性的核心保障。

::: warning 脏选举风险
当 ISR 中所有副本都宕机时，可通过设置 `unclean.leader.election.enable=true`，强行选择非 ISR 副本作为 Leader。代价是可能丢失数据，但对可用性要求高的场景可能会启用。
:::

#### 消费者组与重平衡

Kafka 采用**拉取模型（Pull Model）**，消费者主动从 Broker 拉取消息。Consumer Group 是 Kafka 实现消息广播和单播的核心机制：

- 同一个 Consumer Group 中的消费者**共享**消费 Topic 的 Partition，每个 Partition 同时只能被 Group 中的一个消费者消费。
- 不同 Consumer Group 之间完全独立，各自维护自己的消费进度。

当消费者加入/退出或分区变化时，触发**重平衡（Rebalance）**，重新分配分区所有权。

#### 偏移量管理

Kafka 将消费者组的消费偏移量（Offset）存储在内部 Topic `__consumer_offsets` 中。消费者提交 Offset 的方式有两种：

| 提交方式 | 说明 |
|----------|------|
| **自动提交**（`enable.auto.commit=true`） | 按固定间隔自动提交，配置简单但可能产生重复消费或丢失。 |
| **手动提交**（同步 commitSync / 异步 commitAsync） | 开发者精确控制提交时机，提供更好的可靠性。 |

#### 存储机制

Kafka 将每个 Partition 的数据存储在磁盘上，由若干个 LogSegment 组成：

```
Partition 目录结构:
  my-topic-0/
    ├── 00000000000000000000.log           # 消息数据文件
    ├── 00000000000000000000.index          # 稀疏偏移量索引
    ├── 00000000000000000000.timeindex      # 时间戳索引
    └── 00000000000000123734.log            # 下一个 Segment
```

- **LogSegment**：文件名以该段第一条消息的 Offset 命名。
- **稀疏索引**：`.index` 文件并非为每条消息建立索引，而是稀疏地记录 Offset 到 .log 文件物理位置的映射，节省内存。
- **清理策略**：
  - `delete`（默认）：按时间或大小删除老段。
  - `compact`：保留每条 key 的最新值用于日志压缩。
  - `compact,delete`：同时支持两种策略。

#### Kafka 高吞吐的秘密

| 维度 | 技术原理 | 详细说明 |
|------|---------|---------|
| **顺序 I/O** | 追加写入 | Kafka 将消息顺序追加到日志文件末尾，避免了磁盘磁头随机寻道的开销，使得机械硬盘也能达到接近顺序 I/O 的峰值性能。 |
| **零拷贝（Zero-Copy）** | `sendfile` 系统调用 | Consumer 拉取数据时，数据直接通过 DMA 从磁盘到网卡，跳过用户态多次拷贝。传统路径需4次拷贝/4次上下文切换，sendfile 降至2次/2次。 |
| **Page Cache** | 操作系统级缓存 | Kafka 依赖 OS 的 Page Cache 而非 JVM 堆缓存消息。热点数据常驻内存，冷数据刷回磁盘，避免 GC 压力，且利用 OS 自身的预读和写回机制。 |
| **批量与压缩** | Producer 端批量发送 | Producer 将多条消息聚合成一个批次发送，减少网络 RTT。配合 Gzip / Snappy / LZ4 / Zstd 压缩，进一步减少网络带宽占用和磁盘存储。 |
| **分区并行** | 多分区并发读写 | Partition 是 Kafka 并行度的最小单位。一个 Topic 可创建多个 Partition，生产者和消费者可并行操作不同分区，实现水平扩展。 |

---

### 经典高频级：核心难点

#### ISR 机制详解

ISR（In-Sync Replicas）是 Kafka 数据可靠性设计的核心。与常见的"同步复制"或"异步复制"不同，Kafka 采用了一种**动态伸缩的准同步复制**方案：

- **判定标准**：Follower 副本落后 Leader 的时间或消息量超过阈值（`replica.lag.time.max.ms`，默认 30s），则被踢出 ISR。落后赶超后重新加入 ISR。
- **设计优势**：
  - 相比"同步复制"：避免了因一个慢节点拖慢整个集群吞吐。
  - 相比"异步复制"：提供了可预期的数据一致性保障。
- **min.insync.replicas**：指定 ISR 中最小副本数。当 ISR 数量不足时，Producer 会收到 `NotEnoughReplicas` 异常，保证数据写入足够的副本后才确认。

#### 水位线机制

Kafka 通过水位线（Watermark）来追踪同步进度和保障数据一致性：

```
术语定义：
┌──────────────────────────────────────────────────────┐
│  LEO（Log End Offset）                                │
│  每个副本下一条待写入消息的 Offset，标记日志尾部        │
├──────────────────────────────────────────────────────┤
│  HW（High Watermark）                                 │
│  已被 ISR 中所有副本确认的最小 LEO，消费者只能          │
│  消费到 HW 之前的消息                                  │
├──────────────────────────────────────────────────────┤
│  Leader Epoch                                         │
│  每次 Leader 变更都会递增，用于解决 Leader 切换         │
│  后可能出现的日志截断冲突                              │
└──────────────────────────────────────────────────────┘

HW 推进流程（简单模型）：
Leader:  [ M1 ] [ M2 ] [ M3 ] [     ]   LEO=4, HW=2
                         ↑
                       当前 ISR 均确认到 M2
```

**Leader Epoch 的引入**解决了旧版仅依靠 HW 判断导致的"日志截断不一致"问题。当 Leader 切换时，Follower 根据新的 Leader Epoch 判断哪些消息是真正需要截断的（而非盲目截断到原 Leader 的 HW），避免了潜在的数据丢失或数据不一致。

#### 幂等性与 Exactly-Once 语义

Kafka 从三个层级定义了消息传递语义：

| 语义级别 | 含义 | 实现要点 |
|---------|------|---------|
| **At-Most-Once**（至多一次） | 消息可能丢失，但绝不重复 | `enable.auto.commit=true`，先提交再处理；或 Producer 不重试 |
| **At-Least-Once**（至少一次） | 消息绝不丢失，但可能重复 | `enable.auto.commit=false`，先处理后提交；或 Producer 配置重试 |
| **Exactly-Once**（精确一次） | 消息既不丢失也不重复 | 幂等生产者 + 事务 API |

**幂等生产者（Idempotent Producer）**：
- 设置 `enable.idempotence=true`，Kafka 为每个 Producer 分配 PID（Producer ID），并在每条消息上携带自增的 Sequence Number。
- Broker 端记录 `<PID, TopicPartition, SeqNum>` 三元组，如果检测到重复 SeqNum 则忽略。
- 范围限制：仅保证单分区内的幂等，跨分区需要事务。

**事务（Transactions）**：
- 通过 `initTransactions()` / `beginTransaction()` / `commitTransaction()` / `abortTransaction()` API 实现跨分区、跨 Topic 的原子写入。
- 原理：通过事务协调器（Transaction Coordinator）维护事务状态，内部 Topic `__transaction_state` 持久化事务日志。
- Consumer 端通过 `isolation.level=read_committed` 只读取已提交的事务消息。

#### KRaft 共识机制

从 Kafka 3.3（2022年）开始，KRaft（Kafka Raft Metadata Mode）作为 ZooKeeper 替代方案进入生产可用状态。Kafka 4.0 默认启用 KRaft，彻底移除 ZooKeeper 依赖。

```
Kafka 4.0 KRaft 架构示意：

    +----------+     +----------+     +----------+
    |  Broker  |     |  Broker  |     |  Broker  |
    | +------+ |     | +------+ |     | +------+ |
    | | Quorum| |     | | Quorum| |     | | Quorum| |
    | |Control| |<--->| |Control| |<--->| |Control| |
    | +------+ |     | +------+ |     | +------+ |
    +----------+     +----------+     +----------+
         |                |                |
    [元数据存储与共识基于 Raft 协议，内嵌于每个 Broker 自身]

    关键组件：
    - Controller Quorum（控制器仲裁组）：由奇数个节点（3/5）组成 Raft 组，
      负责元数据管理、Leader 选举。替代原 ZooKeeper 和单 Controller 节点。
    - Active Controller：Raft 组的 Leader，负责集群元数据的读写。
    - 元数据日志（Metadata Log）：Raft 日志即 Kafka 自身的 Topic（@metadata），
      存储在 Broker 本地，无需维护独立存储。
```

#### 性能调优核心参数

| 位置 | 参数 | 推荐值 | 说明 |
|------|------|--------|------|
| Producer | `batch.size` | 16KB ~ 512KB | 增大批次，减少网络请求 |
| Producer | `linger.ms` | 5~100ms | 积累更多消息在同一批次中 |
| Producer | `compression.type` | `lz4` / `zstd` | LZ4 低延迟高吞吐；Zstd 高压缩比 |
| Producer | `max.in.flight.requests.per.connection` | 5（幂等时默认为5） | 控制并发请求数 |
| Producer | `acks` | `all`（可靠性场景）/ `1`（吞吐优先） | 确认策略 |
| Broker | `num.network.threads` | CPU 核数 | 网络处理线程数 |
| Broker | `num.io.threads` | CPU 核数 * 2 | I/O 处理线程数 |
| Broker | `num.partitions` | 根据吞吐需求 | 分区数决定并行度 |
| Consumer | `fetch.min.bytes` | 1KB ~ 1MB | 等待足够数据后再返回，减少请求 |
| Consumer | `fetch.max.wait.ms` | 500ms | 配合 fetch.min.bytes 的上限等待时间 |
| OS | 文件系统 | XFS / ext4 | 推荐 XFS，大量文件操作更优 |

---

## 核心原理深度解析

### 分区分配策略详解

当 Consumer Group 发生重平衡时，Kafka 需要将 Topic 的各个 Partition 分配给 Group 内的 Consumer。不同版本的 Kafka 提供不同的分配策略：

| 策略 | 推出版本 | 核心思想 | 优点 | 缺点 |
|------|---------|---------|------|------|
| **RangeAssignor** | 很早 | 按 Topic 维度分配，每个 Topic 的分区按号段划分给 Consumer | 逻辑简单 | 可能导致数据倾斜（当 Topic 数多于 Consumer 数时，排在前的 Consumer 分配到更多分区） |
| **RoundRobinAssignor** | 很早 | 将所有 Topic-Partition 排序后，轮流分配给 Consumer | 分配均匀 | 重平衡时分区迁移量大，"惊群效应"明显 |
| **StickyAssignor** | 0.11 | 在均衡分配的基础上，尽量保留原有分配结果 | 分配均匀 + 减少分区迁移 | 首次分配计算稍复杂 |
| **CooperativeStickyAssignor** | 2.4 | 增量协作式重平衡，Consumer 不清空全部分区再重新分配 | 重平衡期间不暂停消费，可用性最高 | 需 Consumer 端支持，实现复杂 |

**分配示例**（Topic: T1 有 3 个分区 P0/P1/P2，T2 有 3 个分区 P0/P1/P2，Consumer Group 有 2 个 Consumer C1/C2）：

```
RangeAssignor 结果:
  C1: T1.P0, T1.P1, T2.P0, T2.P1  (4个)    ← 倾斜！C1 比 C2 多了一倍
  C2: T1.P2, T2.P2                  (2个)

RoundRobin / StickyAssignor 结果:
  C1: T1.P0, T1.P2, T2.P1          (3个)    ← 均匀
  C2: T1.P1, T2.P0, T2.P2          (3个)
```

::: tip 核心价值
**CooperativeStickyAssignor** 在传统重平衡（Eager Rebalance）中，所有 Consumer 先释放全部分区，然后重新分配——这期间**整个 Group 暂停消费**。增量协作式重平衡允许 Consumer 在保留部分分区的同时，逐步调整分配，实现了**重平衡期间的持续消费**。
:::

---

### 副本同步全链路追踪（以 acks=all 为例）

以下完整追踪一条消息从 Producer 到 Consumer 可见的全过程：

```
步骤1：Producer 发送消息
┌──────────────┐
│   Producer   │  调用 send()，消息进入 RecordAccumulator 缓冲区
│ acks=all     │  batch.size + linger.ms 触发批次发送
└──────┬───────┘
       │ 网络发送（携带 PID + SeqNum + Epoch）
       ▼
步骤2：Leader Broker 接收
┌──────────────────────────────────────────┐
│   Leader Broker                          │
│   - 校验序列号（幂等去重）                 │
│   - 将消息追加到本地 LogSegment           │
│   - Leader LEO +1                        │
│   - Leader HW 暂不推进（等待 Follower）    │
│   - 检查 ISR 列表：需要收到多少个确认？    │
│     min.insync.replicas 指定最小数量      │
└──────────────────────────────────────────┘
       │ FetchRequest（Follower 拉取）
       ▼
步骤3：Follower 副本同步
┌──────────────────────────────────────────┐
│   Follower Broker                        │
│   - 从 Leader 拉取消息，追加到本地日志     │
│   - 更新 LEO                            │
│   - 在下一次 FetchRequest 中将自己的      │
│     LEO 告知 Leader                      │
└──────────────────────────────────────────┘
       │
       ▼
步骤4：Leader 确认与 HW 推进
┌──────────────────────────────────────────┐
│   Leader Broker                          │
│   - 收到 ISR 中所有 Follower 的确认       │
│   - 将 HW 推进到所有 ISR 副本的最小 LEO   │
│   - 返回 ACK 给 Producer                 │
└──────────────────────────────────────────┘
       │
       ▼
步骤5：Producer 收到 ACK
┌──────────────┐
│   Producer   │  收到成功响应，更新本地 Offset 记录
│              │  若有异常（超时/NotEnoughReplicas），触发重试
└──────────────┘
       │
       ▼
步骤6：Consumer 消费
┌──────────────────────────────────────────┐
│   Consumer                               │
│   - 只能消费 HW 之前的消息                │
│   - 这样确保 Consumer 读到的数据都是       │
│     已被 ISR 副本确认的（安全数据）         │
└──────────────────────────────────────────┘
```

::: info 关键时间点
- 消息被 Leader 追加到本地后，立即对"未提交的"消费者可见——取决于 `isolation.level`（`read_uncommitted` 可见，`read_committed` 不可见）。
- Producer 收到 ACK 的时间 = Leader 写入时间 + ISR 中最慢副本的同步延迟 + 网络 RTT。
:::

---

### 控制器（Controller）机制

Controller 是 Kafka 集群的大脑，负责管理分区和副本的状态变化。

**主要职责**：

```
Controller 职责全景：
┌──────────────────────────────────────────────────────┐
│  1. 分区 Leader 选举                                 │
│     - 某个 Broker 宕机时，Controller 为受影响的       │
│       分区从 ISR 中选择新 Leader                      │
├──────────────────────────────────────────────────────┤
│  2. 分区分配                                         │
│     - 新 Topic 创建时，Controller 为各分区分配副本      │
│       节点并选出 Leader                              │
├──────────────────────────────────────────────────────┤
│  3. ISR 变更管理与广播                                │
│     - 监控 ISR 变化，将最新元数据广播到所有 Broker     │
├──────────────────────────────────────────────────────┤
│  4. 副本状态管理                                      │
│     - 监听 Broker 上下线，触发分区重分配              │
└──────────────────────────────────────────────────────┘
```

**Controller 选举**：
- ZooKeeper 模式：抢注 `/controller` 临时节点，先到者成为 Controller。通过 ZK Watch 实现 Failover。
- KRaft 模式：Controller Quorum 通过 Raft 协议选举 Active Controller，由 Raft Leader 承担 Controller 职责。

::: info Controller 故障影响
在 ZK 模式下，Controller 切换期间，集群无法处理分区 Leader 选举和新 Topic 创建，但已有的读写不受影响。KRaft 模式下，Controller 切换由 Raft 自动完成，恢复更快。
:::

---

### 零拷贝原理

Kafka Consumer 消费消息时，Broker 需要将磁盘上的消息数据发送到网络。零拷贝（Zero-Copy）通过 `sendfile` 系统调用，绕过了多次不必要的数据拷贝。

**传统路径（4次拷贝 + 4次上下文切换）**：

```
用户态                       内核态
┌─────────┐              ┌──────────────┐
│ Kafka   │  ① read()    │              │
│         │──────────────│ 磁盘 → 内核   │  DMA Copy ①
│         │              │   缓冲区       │
│         │  ② 拷贝      │              │
│         │◄─────────────│ 内核 → 用户    │  CPU Copy ②
│ 用户缓冲 │              │              │
│         │              │              │
│         │  ③ write()   │              │
│         │──────────────│ 用户 → Socket │  CPU Copy ③
│         │              │              │
│         │              │ Socket → 网卡  │  DMA Copy ④
└─────────┘              └──────────────┘
      共 4 次拷贝（2 次 DMA + 2 次 CPU），4 次上下文切换
```

**零拷贝路径（sendfile）— 2次拷贝 + 2次上下文切换**：

```
用户态                       内核态
┌─────────┐              ┌──────────────┐
│ Kafka   │  ① sendfile()│              │
│         │──────────────│ 磁盘 → 内核   │  DMA Copy ①
│         │              │   缓冲区       │
│         │  无需拷贝     │              │
│         │    到用户态   │      ───     │
│         │              │ 内核 → Socket │  DMA Copy ②
│         │              │  (直接内存区域引用)
│         │              │ Socket → 网卡  │
└─────────┘              └──────────────┘
      共 2 次拷贝（全部 DMA），2 次上下文切换
```

::: tip 更进一步
`sendfile` 的 DMA Copy ② 在部分支持 scatter-gather 操作的硬件上，实际上是直接内存区域（DMA）将文件页面的引用传递给网卡，避免了"内核缓冲区 → Socket 缓冲区"的物理拷贝，进一步优化到近乎 1 次拷贝。
:::

---

### 日志压缩（Log Compaction）

日志压缩是 Kafka 提供的一种特殊的日志清理策略，策略名为 `compact`。它**不是按时间或大小删除消息**，而是保留每条 key 的最新值。

**工作原理**：

```
压缩前（offset: key => value）：
[0: A=>x] [1: B=>y] [2: A=>z] [3: C=>w] [4: B=>q]

压缩后：
[2: A=>z] [3: C=>w] [4: B=>q]
       ↑              ↑
    key=A 最新值    key=B 最新值    key=C 的值未更新，保留
    （x 被 z 覆盖）   （y 被 q 覆盖）

    ① 保留每条 key 的最新值
    ② 消息顺序不变
    ③ 没有最新值的 key 也被保留（说明该 key 仍活跃）
```

**机制细节**：

- 压缩由 Cleaner 线程池异步执行，不影响正常读写。
- LogSegment 被分为"脏"（dirty）和"干净"（clean）两部分。Cleaner 遍历脏段，保留每条 key 最新值后拷贝为干净段。
- **使用场景**：存储状态快照（如用户配置表）、CDC 事件（以主键为 key）、Kafka Streams 状态存储。
- **与删除策略的区别**：delete 策略是时间/空间维度的清理；compact 策略是 key 维度的去重，适合有主键的场景。

---

### 消费者重平衡优化

#### 重平衡触发条件

| 触发条件 | 说明 |
|---------|------|
| **Consumer 加入** | 新 Consumer 加入 Consumer Group |
| **Consumer 离开** | 主动离组（`close()`）或超时（`session.timeout.ms`） |
| **Consumer 心跳丢失** | Consumer 超过 `session.timeout.ms`（默认 45s）未发心跳 |
| **Consumer 处理超时** | 单次 `poll()` 调用处理间隔超过 `max.poll.interval.ms`（默认 5min） |
| **Topic 分区数变化** | 运维操作增加了 Topic 的分区数量 |
| **订阅 Topic 变化** | Consumer 使用了正则表达式订阅，新的匹配 Topic 出现 |

#### 优化策略

| 策略 | 配置/做法 | 效果 |
|------|----------|------|
| **合理设置心跳超时** | `session.timeout.ms=30s`（不小于 broker 端 `group.min.session.timeout.ms`） | 避免网络抖动导致误判离组 |
| **合理设置 Poll 间隔** | `max.poll.interval.ms=10min`（根据业务处理耗时调整） | 避免处理慢被踢出 |
| **使用增量协作式重平衡** | `partition.assignment.strategy=[org.apache.kafka.clients.consumer.CooperativeStickyAssignor]` | 重平衡期间不停消费 |
| **减少不必要的重平衡** | 固定 Consumer 数量、避免频繁重启 | 降低 Full GC 对消费的影响 |
| **调整心跳线程间隔** | `heartbeat.interval.ms=3s`（约为 session.timeout.ms 的 1/10） | 保证心跳及时到达 |
| **使用 Static Membership** | `group.instance.id=固定ID` | Consumer 重启后仍能保留原分区分配，避免重平衡 |
| **分区数预规划** | 提前创建足够分区，避免后期动态增加 | 避免扩容分区引发重平衡 |

::: tip Static Membership 原理
给每个 Consumer 分配一个固定的 `group.instance.id`，Broker 记录此 ID 与分区分配的映射。当 Consumer 重启时（在 `session.timeout.ms` 内重新加入），Broker 识别出同一 ID，直接恢复其原有分区分配，完全跳过重平衡。
:::

---

## 经典高频面试题

### Q1: Kafka 如何保证消息不丢失？请从 Producer、Broker、Consumer 三端完整论述。

Kafka 保证消息不丢失需要从三个端协同配置，任何一端的疏漏都可能导致消息丢失。

#### 一、Producer 端

消息丢失场景：网络抖动导致发送失败，Producer 不重试；或 `acks=0/1` 时 Leader 宕机。

**解决方案**：

```java
// 关键配置（Java 示例）
Properties props = new Properties();

// 1. 确认策略：all/-1，必须所有 ISR 副本确认
props.put("acks", "all");

// 2. 开启重试（Kafka 3.0+ 默认重试次数为 Integer.MAX_VALUE）
props.put("retries", 3);  // 或更高

// 3. 幂等性：防止重试导致消息重复（同时保证单分区有序）
props.put("enable.idempotence", "true");

// 4. 控制并发请求数（幂等开启时自动设为5，避免乱序）
props.put("max.in.flight.requests.per.connection", 5);
```

**关键机制**：`acks=all` + 重试 + 幂等性 = 生产者端"不丢失且不重复"。

#### 二、Broker 端

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

#### 三、Consumer 端

消息丢失场景：自动提交 Offset + 消息处理失败（如业务异常、进程 Crash），Offset 已提交但消息未处理完。

**解决方案**：

```java
// 消费者关键配置
// 1. 关闭自动提交
props.put("enable.auto.commit", "false");

// 2. 采用"先处理后提交"模式
while (true) {
    ConsumerRecords<String, String> records = consumer.poll(Duration.ofMillis(100));
    for (ConsumerRecord<String, String> record : records) {
        // a. 处理业务逻辑（写入 DB、发送 API 等）
        process(record);
    }
    // b. 处理成功后再手动提交（同步提交）
    consumer.commitSync();
    // 或异步提交 + 异常回调
    consumer.commitAsync((offsets, exception) -> {
        if (exception != null) {
            log.error("提交失败", exception);
        }
    });
}
```

::: warning 注意
"先处理后提交"保证消息不丢失，但可能导致**重复消费**（处理成功后、提交前崩溃）。消除重复需要业务实现幂等（唯一键去重、版本号判断等）。
:::

#### 三端联动配置对照表

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

### Q2: Kafka 的 ISR 机制是什么？为什么要设计 ISR？

#### ISR 定义

ISR（In-Sync Replicas）是 Kafka 的副本同步机制中的核心概念，指的是与 Leader 副本保持"同步"的 Follower 副本集合。只有 ISR 中的副本才有资格被选举为新 Leader。

**判定标准**：Follower 在 `replica.lag.time.max.ms`（默认 30 秒）内向 Leader 发送过 Fetch 请求，即被视为在 ISR 中。Kafka 0.9 版本开始，从"按落后消息数量判定"改为"按时间判定"，更合理——因为生产者有波峰波谷，按消息数容易误判。

#### 三种复制方案对比

| 复制方案 | 运作方式 | 优点 | 缺点 | 典型代表 |
|---------|---------|------|------|---------|
| **同步复制** | 所有副本写入成功后才返回 ACK | 强一致性，数据零丢失风险 | 吞吐量低，任意一个副本故障导致写入阻塞 | 传统关系型数据库主从 |
| **异步复制** | Leader 写入成功即返回 ACK，Follower 异步追上 | 高吞吐，延迟低 | Leader 宕机可能丢数据，数据一致性弱 | MySQL 异步复制 |
| **ISR 机制** | Leader 等待 ISR 中副本确认（动态成员），非 ISR 不阻塞 | 平衡一致性与可用性，吞吐与可靠性兼顾 | 参数调优有门槛；极端场景可能降级 | **Kafka** |

#### ISR 的设计哲学

ISR 解决了同步复制和异步复制的"两难困境"：

1. **容忍慢副本**：个别 Follower 因 GC、网络抖动变慢时，自动踢出 ISR，不阻塞整个集群的写入。
2. **动态恢复**：慢副本恢复后自动加回 ISR，无需人工干预。
3. **灵活的一致性等级**：通过 `min.insync.replicas` 与 `acks` 的组合，Producer 可以灵活地在"吞吐"与"可靠性"之间取舍。

```
ISR 动态伸缩示意：

时间线：
  t0: ISR = [Leader, F1, F2, F3]      # 全部同步
  t1: F3 网络延迟 > 30s               # F3 被踢出 ISR
      ISR = [Leader, F1, F2]          # 写入不受影响
  t2: F3 恢复，迅速追上               # F3 重新加入 ISR
      ISR = [Leader, F1, F2, F3]      # 恢复全量副本
```

---

### Q3: Kafka 如何实现 Exactly-Once 语义？

Kafka 的 Exactly-Once 分为两个维度：**幂等生产者**（单分区、单会话内）和**事务 API**（跨分区、跨 Topic、读写结合）。

#### 三层语义定义

| 语义 | 定义 | 典型场景 | Kafka 实现 |
|------|------|---------|-----------|
| **At-Most-Once** | 消息可能丢失，但绝不重复 | 监控指标采集（可容忍少量丢失） | `acks=0`；Consumer 先提交后处理 |
| **At-Least-Once** | 消息绝不丢失，但可能重复 | 支付通知（可容忍重复，业务幂等兜底） | `acks=all` + 重试；Consumer 先处理后提交 |
| **Exactly-Once** | 消息既不丢失也不重复 | 金融交易、计费系统 | 幂等生产者 + 事务 + `read_committed` |

#### 维度一：幂等生产者（Idempotent Producer）

**配置**：`enable.idempotence=true`

**原理**：

```
每个 Producer 被分配唯一的 PID（Producer ID），每条消息携带：
  <PID, TopicPartition, SequenceNumber>

Broker 端维护每分区最近 5 个 SeqNum 的缓存：
  - 如果收到的 SeqNum 比缓存中的最大值大且连续 → 正常写入
  - 如果收到的 SeqNum 比缓存中的小 → 判断为重复，丢弃但返回成功
  - 如果收到的 SeqNum 跳跃 → 抛出 OutOfOrderSequenceException

流程示意：
  Producer 发送: PID=1001, TopicPartition=topic-0, SeqNum=5
  Broker 检查缓存: 已收到 SeqNum=1,2,3,4 → SeqNum=5 合法
  Broker 返回: 成功
  ---
  Producer 因为超时重试: PID=1001, TopicPartition=topic-0, SeqNum=5
  Broker 检查缓存: SeqNum=5 已收到 → 重复，丢弃但返回成功
```

**限制**：
- 仅能保证**单分区内**的幂等。
- 仅保证**单会话**内的幂等（Producer 重启后 PID 变化）。

#### 维度二：事务 API

**核心 API**：

```java
// 1. 初始化事务
producer.initTransactions();

// 2. 开启事务
producer.beginTransaction();

// 3. 发送消息并绑定到事务
producer.send(new ProducerRecord<>("topic-A", "key", "value"));
producer.send(new ProducerRecord<>("topic-B", "key", "value"));

// 4. 消费-转换-生产模式（Consume-Transform-Produce）
// 在同一个事务中将消费的 Offset 和生产消息原子提交
producer.sendOffsetsToTransaction(consumerOffsets, "consumer-group-id");

// 5. 提交事务（或中止：producer.abortTransaction()）
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
     │◄──────────────────────│ 分配 Producer Epoch  │
     │                       │                      │
     │  beginTransaction()   │                      │
     │──────────────────────►│                      │
     │                       │                      │
     │  send(topic-A, msg)   │                      │
     │──────────────────────────────────────────────►│ 消息标记为"未提交"
     │  send(topic-B, msg)   │                      │
     │──────────────────────────────────────────────►│ 消息标记为"未提交"
     │                       │                      │
     │  commitTransaction()  │                      │
     │──────────────────────►│ 写入 PREPARE_COMMIT   │
     │                       │─────────────────────►│ 通知各分区
     │                       │ 写入 PREPARE_COMMIT   │
     │                       │─────────────────────►│
     │                       │ 写入 COMMITTED        │
     │                       │─────────────────────►│ 提交完成
     │◄──────────────────────│                      │
```

**Consumer 端配合**：设置 `isolation.level=read_committed`，Consumer 仅读取已提交的事务消息，未提交或已中止的事务消息对 Consumer 不可见。

---

### Q4: Kafka 4.0 的 KRaft 模式和旧版 ZooKeeper 模式有什么区别？

#### 背景

Kafka 传统架构依赖 ZooKeeper 管理元数据。这带来了运维复杂度（需维护两套分布式系统）、ZooKeeper 的性能瓶颈以及一致性模型的不匹配等问题。从 Kafka 3.3 开始，KRaft（Kafka Raft）成为生产就绪的替代方案，Kafka 4.0 默认启用 KRaft 并彻底移除 ZooKeeper 依赖。

#### 架构对比

**ZooKeeper 模式架构**：

```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  ZooKeeper   │  │  ZooKeeper   │  │  ZooKeeper   │    ← 独立集群
│   Node 1     │  │   Node 2     │  │   Node 3     │
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                 │                 │
       └─────────┬───────┴─────────┬───────┘
                 │ ZK 选举 + 元数据读取  │
       ┌─────────┴─────────────────────────────────┐
       │                                            │
  ┌────▼──────┐  ┌──────────────┐  ┌──────────────┐
  │Controller │  │   Broker 2   │  │   Broker 3   │    ← Kafka 集群
  │(Broker 1) │  │              │  │              │
  └───────────┘  └──────────────┘  └──────────────┘
```

**KRaft 模式架构**：

```
┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐
│  Broker 1             │  │  Broker 2             │  │  Broker 3             │
│  ┌──────────────────┐│  │  ┌──────────────────┐│  │  ┌──────────────────┐│
│  │ Controller Quorum││  │  │ Controller Quorum││  │  │ Controller Quorum││
│  │ (Raft 组成员)     ││  │  │ (Raft 组成员)     ││  │  │ (Raft 组成员)     ││
│  └──────────────────┘│  │  └──────────────────┘│  │  └──────────────────┘│
│  ┌──────────────────┐│  │  ┌──────────────────┐│  │  ┌──────────────────┐│
│  │ 数据分区          ││  │  │ 数据分区          ││  │  │ 数据分区          ││
│  └──────────────────┘│  │  └──────────────────┘│  │  └──────────────────┘│
└──────────────────────┘  └──────────────────────┘  └──────────────────────┘
         │                         │                         │
         └────────Raft 共识─────────┴────────Raft 共识────────┘
              (元数据日志以 @metadata Topic 形式存储)
```

#### 核心差异对比表

| 对比维度 | ZooKeeper 模式 | KRaft 模式（Kafka 4.0） |
|---------|---------------|------------------------|
| **外部依赖** | 需要独立部署 ZooKeeper 集群（通常 3~5 节点） | 零外部依赖，元数据管理内嵌 |
| **元数据存储** | ZooKeeper 存储（`/brokers`, `/topics`, `/consumers` 等 znode） | 内嵌 Raft 日志，即以 Kafka Topic（`@metadata`）形式存储 |
| **一致性协议** | ZooKeeper 使用 ZAB 协议；Controller 通过 ZK Watch 通信 | Raft 协议，元数据变更是 Raft 日志条目 |
| **Controller 选举** | 通过 ZooKeeper `/controller` 临时节点争抢 | Raft Leader 选举，由 Controller Quorum 内部完成 |
| **元数据传播** | Controller 从 ZK 读取后，通过 RPC 推送给各 Broker | 元数据作为 Raft 日志在 Quorum 节点间自动复制，Broker 从 Active Controller 订阅 |
| **故障恢复时间** | Controller 故障后需重新选举，读写元数据还要依赖 ZK，恢复较慢（秒~分钟级） | Raft 选举通常在数百毫秒内完成 |
| **分区数上限** | ZooKeeper 单节点元数据存储量是瓶颈，通常建议 < 20 万分区 | 显著提升（实测百万级分区），因为元数据以 Partition 级别存储和传输 |
| **部署复杂度** | 需同时监控维护 Kafka 和 ZooKeeper 两套系统 | 单一系统，运维大幅简化 |
| **滚动升级** | 4.0 不再支持 ZK 模式，需先迁移到 KRaft | 原生支持，无迁移问题 |

#### KRaft 的核心优势总结

1. **运维简化**：不需要管理 ZooKeeper 集群，减少故障面。
2. **性能提升**：Controller 切换更快，元数据传播更高效，支持更大的集群规模。
3. **安全性**：元数据安全可沿用 Kafka 的安全机制（ACL、SSL、SASL），不再需要为 ZK 单独配置安全策略。
4. **架构统一**：元数据和数据使用相同的基础设施和运维工具，降低心智负担。

---

### Q5: 消费者组重平衡是如何触发的？如何优化？

#### 重平衡的触发条件（完整列表）

| 触发条件 | 触发机制 | 相关参数 | 默认值 |
|---------|---------|---------|--------|
| **新 Consumer 加入** | Consumer 向 GroupCoordinator 发送 JoinGroup 请求 | — | — |
| **Consumer 主动离开** | 调用 `consumer.close()` 发送 LeaveGroup 请求 | — | — |
| **Consumer 心跳丢失** | Coordinator 在 `session.timeout.ms` 内未收到心跳 | `session.timeout.ms` | 45s |
| **Consumer 处理超时** | 单次 `poll()` 间隔超过阈值，Consumer 被踢出 | `max.poll.interval.ms` | 300s（5min） |
| **分区数变化** | 管理员通过 CLI/API 增加了 Topic 的分区数 | — | — |
| **订阅的 Topic 变化** | 使用正则订阅时，新增匹配 Topic 也触发 | — | — |

#### 重平衡过程的三个阶段

```
阶段一：FindCoordinator
  Consumer → 任意 Broker → 找到 GroupCoordinator
  依据: hash(groupId) % __consumer_offsets 的分区数 → 确定 Coordinator 所在的 Broker

阶段二：JoinGroup
  Consumer → Coordinator: JoinGroupRequest(订阅信息、分配策略)
  Coordinator 收集所有 Consumer 的请求后，选举一个 Group Leader（第一个加入的 Consumer）
  Coordinator → Group Leader: 返回所有 Consumer 的订阅信息
  Coordinator → 其他 Consumer: 返回空分配（等待 SyncGroup）

阶段三：SyncGroup
  Group Leader 根据分配策略计算出分区分配方案
  Group Leader → Coordinator: SyncGroupRequest(分配方案)
  Coordinator 将分配方案下发给所有 Consumer
  各 Consumer 根据分配方案开始消费指定分区
```

**Eager（传统）vs Cooperative（增量协作）重平衡**：

- **Eager Rebalance**：Consumer 在 JoinGroup 阶段释放所有分区所有权，然后重新分配。整个 Group 在重平衡期间**暂停消费**。
- **Cooperative Rebalance**：Consumer 在 SyncGroup 阶段逐步调整分配，只释放需要移交的分区，其余分区**继续消费**。

#### 优化策略表

| 优化策略 | 具体做法 | 解决的问题 |
|---------|---------|-----------|
| **合理设置 session.timeout.ms** | 不宜过小，建议 30s 以上；也不宜过大，否则故障检测慢 | 避免因网络抖动/GC 抖动导致误踢 |
| **合理设置 max.poll.interval.ms** | 根据单批消息的最大处理时间设置（如 10min） | 避免因处理耗时长被踢出 |
| **heartbeat.interval.ms** | 设为 session.timeout.ms 的 1/3 ~ 1/10 | 保证心跳及时送达，减少误判 |
| **使用 CooperativeStickyAssignor** | `partition.assignment.strategy=CooperativeStickyAssignor` | 重平衡期间持续消费，降低延迟抖动 |
| **启用 Static Membership** | 配置 `group.instance.id` | Consumer 重启后恢复原分区分配，完全避免重平衡 |
| **减少 Consumer 数量波动** | 避免频繁扩缩容；使用固定部署拓扑 | 稳定性优先 |
| **预创建足够分区** | 规划好未来扩容的分区需求，提前创建 | 避免后期动态增加分区触发重平衡 |
| **统一 max.poll.records** | 适当减小单次拉取量（如 500 条） | 控制单轮处理时间，避免超时 |

---

### Q6: Kafka 为什么能实现百万级吞吐量？

Kafka 的百万级吞吐量（单 Broker 写入可达数百 MB/s）来自其多个层面的精心设计，以下从五个维度深入解析。

#### 维度一：顺序 I/O + 追加写入

传统认知中"磁盘慢"是基于随机 I/O 的假设。实际上，现代磁盘的顺序读写速度和随机读写速度差异极大：

```
磁盘性能对照（典型 SSD）：
  随机写入（4K） : ~50 MB/s
  顺序写入（1M） : ~500 MB/s  ← 差距 10 倍
  顺序读取       : ~500 MB/s - 3 GB/s

Kafka 的设计：
  - 所有消息以追加方式写入 Partition 日志
  - 无更新、无删除（仅追加）
  - 最大化利用磁盘的顺序 I/O 带宽
```

因为不需要磁盘寻道，即便是机械硬盘也能达到接近理论极限的吞吐。

#### 维度二：零拷贝（Zero-Copy）

传统数据从磁盘到网络需经过 **4 次拷贝 + 4 次上下文切换**。Kafka 利用 Linux 的 `sendfile` 系统调用（详见零拷贝原理），将拷贝次数降低为 **2 次 DMA 拷贝**（在 scatter-gather DMA 支持下可降至约 1 次），大幅减少 CPU 开销和内存带宽消耗。

对于大吞吐量场景（Consumer 批量拉取多 MB 数据），零拷贝的收益尤为明显，CPU 利用率可降低 50% 以上。

#### 维度三：Page Cache 的深度利用

Kafka 不将消息缓存到 JVM 堆，而是直接依赖操作系统的 Page Cache：

```
优点：
  1. 避免 GC 压力：消息数据不进入 JVM 堆，不受 GC 影响
  2. 自动管理：OS 自动将热数据保留在 Page Cache，冷数据刷回磁盘
  3. 预读优化：OS 内置预读机制，Consumer 顺序消费时命中率极高
  4. 写回优化：OS 批量刷盘，减少磁盘 I/O 次数
  5. 跳过 JVM 用户态：数据从磁盘 → Page Cache → 网络，全程在内核态流转
```

**关键指标**：当消息数据能被 Page Cache 充分缓存时，Consumer 的消费几乎完全是内存操作，延迟可低至亚毫秒级。

#### 维度四：批量处理 + 压缩

Kafka 在多个层面做了批量聚合：

```
生产者端：
  - RecordAccumulator 缓冲区按分区聚合消息
  - batch.size（建议 16KB~512KB）+ linger.ms 控制批次大小
  - 一个批次作为一个网络请求，大幅减少 RTT 开销
  - 配合压缩（LZ4 / Zstd），网络带宽节省 50%~80%

Broker 端：
  - 消息按批次写入日志，磁盘 I/O 单位是批次而非单条
  - 向 Consumer 发送数据时也按批次传输

消费者端：
  - fetch.min.bytes + fetch.max.wait.ms 控制拉取批次大小
  - 一次拉取可获取多条消息
```

```
压缩算法对比：
┌──────────┬──────────┬──────────┬──────────┐
│  算法    │ 压缩比   │  速度    │ 适用场景  │
├──────────┼──────────┼──────────┼──────────┤
│  Gzip    │   高     │   慢     │ 带宽敏感  │
│  Snappy  │   中     │   快     │ 均衡     │
│  LZ4     │   中     │  最快    │ 低延迟   │
│  Zstd    │  很高    │   快     │ 高压缩比  │
└──────────┴──────────┴──────────┴──────────┘
```

#### 维度五：分区并行 + 水平扩展

Kafka 的并发模型以 Partition 为最小并行单元：

```
并行能力 = Partition 数量 × Broker 数量

水平扩展：
  - 增加 Broker：分区自动重新分布
  - 增加 Partition：创建新分区，无需停服
  - Producer 端：多线程并行写入不同分区
  - Consumer 端：Consumer Group 内多消费者并行消费不同分区

无锁设计：
  - 每个 Partition 的文件由单线程顺序写入，无需加锁
  - 不同 Partition 之间完全独立，无竞争
  - Broker 内部仅需要极少的元数据锁
```

#### 五维度协同效应总结

```
          顺序 I/O + 追加写入  (物理基础)
                  │
                  ▼
          Page Cache 缓存层   (OS 加速)
          ┌───────┴───────┐
          ▼               ▼
    零拷贝 sendfile      批量压缩
    (网络传输)          (带宽节省)
          └───────┬───────┘
                  ▼
          分区并行 + 无锁
          (水平扩展引擎)
                  │
                  ▼
         ===== 百万级吞吐 =====
```

这五个维度形成了从物理磁盘到网络传输的完整加速链路，每一层都在发挥关键作用，协同达成 Kafka 的标志性性能指标。

---

> **本章小结**：Kafka 作为分布式流数据平台，其核心竞争力在于精心设计的存储模型（顺序 I/O + Page Cache）、高效的网络传输（零拷贝 + 批量压缩）、灵活的一致性机制（ISR + 水位线 + 事务），以及持续演进的架构（KRaft 去 ZooKeeper）。掌握这些核心原理，有助于在实际工作中进行合理的架构选型、性能调优和故障排除。