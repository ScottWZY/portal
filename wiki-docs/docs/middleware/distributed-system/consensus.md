---
title: 一致性协议
outline: [2,3]
---

# 一致性协议

> 共识（Consensus）是分布式系统最核心的问题：**一组节点如何就某个共同的值或决策达成一致**，即使部分节点可能出现故障。

## Paxos 算法

Paxos 由 Leslie Lamport 于 1990 年提出，是共识算法领域的奠基之作。由于其正确性证明和工程实现的复杂度，Lamport 在 2001 年发表了简化的描述性论文 *Paxos Made Simple*。

### Basic Paxos 三角色模型

```
         ┌──────────┐
         │ Proposer │ 提案者：发起提案（proposal），推动共识过程
         └────┬─────┘
              │
    ┌─────────┼─────────┐
    │         │         │
    ▼         ▼         ▼
┌───────┐ ┌───────┐ ┌─────────┐
│Acceptor│ │Acceptor│ │Acceptor │ 接受者：对提案进行投票表决
└───────┘ └───────┘ └─────────┘
    ▲         ▲         ▲
    │         │         │
    └─────────┼─────────┘
              │
         ┌────┴─────┐
         │ Learner  │ 学习者：学习最终被选定的值
         └──────────┘
```

一个物理节点通常同时扮演多个角色。

### 两阶段流程

**阶段一：Prepare（准备阶段）**

```
Proposer                                Acceptors
   │                                        │
   │ ─── Prepare(n) ────────────────────►   │  n = 提案编号（全局唯一且递增）
   │                                        │
   │ ◄── Promise(n', v') ───────────────    │  返回：已接受的最高编号 n' 及对应值 v'
   │                                        │  同时承诺：不再接受编号 < n 的提案
```

1. Proposer 选择一个全局唯一且递增的提案编号 n，向 **多数派** Acceptors 发送 Prepare(n) 请求。
2. Acceptor 收到 Prepare(n) 后：
   - 如果 n 大于它见过的**最大编号**，则承诺不再接受任何编号小于 n 的提案，并返回已经 Accepted 的最大编号的值（如果有的话）。
   - 否则拒绝。

**阶段二：Accept（接受阶段）**

```
Proposer                                Acceptors
   │                                        │
   │ ─── Accept(n, v) ─────────────────►    │
   │                                        │
   │ ◄── Accepted(n, v) ────────────────    │
```

1. Proposer 收到**多数派** Promises 后：
   - 如果所有 Promise 中都没有附带已接受的值，Proposer 可以自由选择值 v；
   - 否则，必须选择具有**最高编号**的那个值作为 v（保证安全性的关键）。
2. 向多数派 Acceptors 发送 Accept(n, v)。
3. Acceptor 收到 Accept(n, v) 后：如果 n 不小于它承诺过的最小编号，则接受该值。
4. 一旦多数派接受，该值被确定（Chosen）。

```
Basic Paxos 完整流程示意：

Time ──────────────────────────────────────────────────────────►

Proposer:     ─── Prepare(5) ────►      ─── Accept(5, "X") ────►
                    │                              │
Acceptor1:    ◄── Promise(ok)      ◄── Accepted(ok)
Acceptor2:    ◄── Promise(ok)      ◄── Accepted(ok)
Acceptor3:    ◄── Promise(ok)      ◄── Accepted(ok)
                    │                              │
              多数派 Promise              多数派 Accept → 值 "X" 确定
```

### Multi-Paxos 优化

Basic Paxos 每确定一个值需要两轮 RPC，效率低。Multi-Paxos 的核心优化：

1. **选举一个稳定的 Leader**：Leader 兼任唯一的 Proposer，避免多 Proposer 之间的 Prepare 冲突（活锁问题）；
2. **跳过 Prepare 阶段**：Leader 任期内的第一个提案仍需两阶段，后续提案直接进入 Accept 阶段（只需一轮 RPC）；
3. **流水线化**：可以同时推进多个实例（instance），每个 instance 确定日志中的一个位置。

```
Multi-Paxos 简化后的流程：

Leader 选举成功后：
Instance 1:  Prepare(1.1) → Accept(1.1, v1)
Instance 2:  Accept(1.2, v2)    ← 跳过 Prepare！
Instance 3:  Accept(1.3, v3)    ← 跳过 Prepare！
...
Instance N:  Accept(1.N, vN)
```

### 工程难点

| 难点 | 说明 |
|------|------|
| **活锁 (Livelock)** | 多个 Proposer 同时发起 Prepare，互相抢占导致无限循环。解决：随机退避 + Leader 选举。 |
| **日志空洞** | Multi-Paxos 中可能有些 instance 未确定（no-op 填充或等待）。 |
| **成员变更** | 如何安全地变更集群节点列表。解决：联合共识（Joint Consensus）。 |
| **实现复杂度** | Lamport 的论文只给出了算法的核心，工程化细节（磁盘持久化、快照、日志压缩）需自行填补。 |

---

## Raft 算法

Raft 由 Diego Ongaro 和 John Ousterhout 于 2014 年提出，设计目标就是**可理解性**（Understandability）。它将共识问题分解为三个相对独立的子问题。

### 子问题一：Leader Election（领导者选举）

每个节点处于三种角色之一：

```
        启动时
          │
          ▼
    ┌──────────┐   超时，开始选举     ┌──────────┐
    │ Follower │ ───────────────────► │Candidate │
    └──────────┘                      └──────────┘
          ▲                                │
          │   发现更高 Term 的 Leader        │ 赢得多数票
          │                                ▼
          │                         ┌──────────┐
          └─────────────────────────│  Leader  │
                发现更高 Term        └──────────┘
```

Term（任期）是 Raft 中的逻辑时钟，全局单调递增。每次选举 Term + 1。

选举流程（RequestVote RPC）：

```
              ┌──────────────────────────────────────────┐
              │  Follower 的 election timeout 触发        │
              │            ↓                              │
              │  term++, 转为 Candidate, 给自己投票        │
              │            ↓                              │
              │  向所有节点发送 RequestVote RPC            │
              │            ↓                              │
              │  ┌─────────────────────────────┐          │
              │  │  收到多数票 → 成为 Leader      │          │
              │  │  收到更高 term → 退回 Follower  │          │
              │  │  超时无结果 → term++, 重选     │          │
              │  └─────────────────────────────┘          │
              └──────────────────────────────────────────┘
```

随机选举超时（150-300ms）是避免分裂投票（Split Vote）的关键机制。

### 子问题二：Log Replication（日志复制）

Leader 接收客户端请求，将日志条目复制到所有 Follower：

```
Client                    Leader                    Followers
  │                         │                          │
  │ ── SET x=5 ────────►    │                          │
  │                         │ 将 {term:3, cmd:"x=5"}   │
  │                         │ 追加到本地日志             │
  │                         │                          │
  │                         │ ── AppendEntries ──────►  │
  │                         │    (prevLogIndex=2,       │
  │                         │     prevLogTerm=2,        │
  │                         │     entries=[{3,"x=5"}],  │
  │                         │     leaderCommit=0)       │
  │                         │                          │
  │                         │ ◄── 成功响应 ───────────   │
  │                         │                          │
  │                         │ 收到多数派响应后：          │
  │                         │ commitIndex 推进           │
  │ ◄── 确认 ────────────── │                          │
```

Leader 的 commitIndex 推进后，下一次 AppendEntries 会携带 leaderCommit，通知 Follower 可以提交。

**日志一致性检查**：AppendEntries RPC 包含 `prevLogIndex` 和 `prevLogTerm`，Follower 检查自己在该位置的日志是否匹配。不匹配则拒绝，Leader 回退 `nextIndex` 重试，直到找到匹配点。

### 子问题三：Safety（安全性）

Raft 的安全性由以下机制保证：

1. **选举限制**：Candidate 的日志必须至少和多数派节点一样新（lastLogTerm 更大，或 lastLogIndex 更大），否则无法当选。这保证了不会选出日志落后的 Leader。

2. **只追加不覆盖**：Leader 永远不会覆盖或删除自己的日志条目，只通过 AppendEntries 强制 Follower 与自己一致。

3. **提交前序条目**：Leader 只能提交**当前任期**的日志（通过提交当前任期的条目，隐式提交所有前序条目）。这避免了 Figure 8 问题——前任 Leader 的已复制但未提交的条目不被错误地认为是已提交的。

### Raft 在实际产品中的应用表

| 产品 | 使用方式 | 说明 |
|------|----------|------|
| **etcd** | 原生实现 | Kubernetes 的配置存储，完全基于 Raft |
| **TiKV** | 原生实现 | TiDB 的底层 KV 存储，每个 Region 使用 Raft |
| **Consul** | 原生实现（修改版） | 服务发现与配置管理 |
| **Nacos** | 基于 JRaft (SOFAJRaft) | CP 模式下的配置中心 |
| **RocketMQ** | 基于 DLedger (Raft 变体) | DLedger 模式下的 CommitLog 复制 |
| **CockroachDB** | 原生实现 | 每个 Range 使用 Raft 的 MultiRaft |

### Raft vs Paxos 对比表

| 维度 | Paxos (Multi-Paxos) | Raft |
|------|---------------------|------|
| **可理解性** | 较低，理论抽象层次高 | 较高，设计了明确的分解和约束 |
| **Leader 选举** | 无内置机制，需额外实现 | 内置 RequestVote RPC |
| **日志复制** | 允许多个 Proposer 并发提案 | 只有 Leader 可以追加日志 |
| **成员变更** | 联合共识（Joint Consensus） | 单节点变更（Single-Server Change） |
| **安全性** | 证明完备但复杂 | 通过五项约束清晰保证 |
| **实现难度** | 较高，切面多、细节多 | 相对较低，边界清晰 |
| **性能** | 理论上支持乱序提交（更优） | 强制顺序提交（实现简单） |
| **成熟度** | 历史悠久，理论完备 | 论文详细，参考实现多 |

---

## ZAB 协议

ZAB（ZooKeeper Atomic Broadcast）是 ZooKeeper 内部使用的原子广播协议，与 Raft 类似但不完全相同。

### 四个模式详解

```
   ┌──────────────────────────────────────────────────────┐
   │                     ZAB 协议状态机                      │
   │                                                        │
   │  ┌──────────┐    ┌──────────┐                          │
   │  │ 选举模式  │───►│ 发现模式  │   Leader 候选节点选出     │
   │  │ Election │    │Discovery │   最新 epoch              │
   │  └──────────┘    └──────────┘                          │
   │       ▲                │                               │
   │       │                ▼                               │
   │       │         ┌──────────┐                          │
   │       │         │ 同步模式  │   Follower 与 Leader      │
   │       │         │   Sync   │   同步历史事务              │
   │       │         └──────────┘                          │
   │       │                │                               │
   │       │                ▼                               │
   │       │         ┌──────────┐                          │
   │       │         │ 广播模式  │   正常服务，原子广播       │
   │       │         │Broadcast │                          │
   │       │         └──────────┘                          │
   │       │                │                               │
   │       │    Leader 崩溃 / 失去多数派                     │
   │       └────────────────┘                               │
   └──────────────────────────────────────────────────────┘
```

| 模式 | 说明 |
|------|------|
| **选举模式 (Election)** | 节点之间通过投票选出一个 Leader。与 Raft 不同，ZAB 的选举不仅看 Term，还看事务 ID（zxid）。zxid 高的节点更可能当选，保证当选的 Leader 拥有最完整的事务日志。 |
| **发现模式 (Discovery)** | 新 Leader 确定当前 epoch（朝代编号），并收集所有 Follower 的最新已接受事务。这一步确保 Leader 知道所有 Committed 的事务。 |
| **同步模式 (Sync)** | Leader 将自己有而 Follower 缺失的事务发送给 Follower。所有 Follower 与 Leader 的日志对齐后，集群才进入广播模式。这与 Raft 的"Leader 不回溯提交旧任期条目"不同——ZAB 允许 Leader 在同步阶段补全并提交前朝的未提交事务。 |
| **广播模式 (Broadcast)** | 正常工作状态。Leader 以两阶段提交风格推进事务（Propose → Ack → Commit），但这是流水线化的——不需要等前一个事务完成就能开始下一个。 |

### ZAB 与 Raft 的异同对比表

| 维度 | ZAB | Raft |
|------|-----|------|
| **日志结构** | 基于 FIFO 队列的事务日志 | 基于索引的有序日志 |
| **Leader 选举依据** | zxid（事务 ID）最大者优先 | Term 较新 + 日志较完整者优先 |
| **旧任期日志处理** | Leader 在同步阶段可以提交前任 Leader 的未完成事务 | Leader 只能提交当前任期的条目（间接提交前序） |
| **提交策略** | Follower 收到 Commit 消息后提交 | Leader 通过 commitIndex 推进告知 Follower |
| **成员变更** | 静态配置，需重启 | 动态单节点变更 |
| **设计哲学** | 面向主备模式的快速恢复 | 面向通用共识的简单性 |
| **应用场景** | ZooKeeper | etcd、Consul、TiKV 等 |

---

## 其他协议

### 2PC / 3PC 对比

**两阶段提交 (2PC, Two-Phase Commit)** 和 **三阶段提交 (3PC, Three-Phase Commit)** 是实现分布式事务的经典协议。

2PC 流程：

```
Coordinator (协调者)                    Participants (参与者)
      │                                       │
      │ ──────── Prepare (询问) ──────────►   │  阶段一：投票
      │                                       │
      │ ◄─────── Vote (Yes/No) ──────────     │
      │                                       │
      │ ─── 收集所有投票，决定 Commit/Abort ──  │
      │                                       │
      │ ──────── Commit/Abort (执行) ─────►    │  阶段二：执行
      │                                       │
      │ ◄─────── Ack ────────────────────     │
```

3PC 在 2PC 的基础上增加了一个**预提交 (PreCommit)** 阶段，并引入超时机制，旨在避免协调者单点故障导致的阻塞。

| 维度 | 2PC | 3PC |
|------|-----|-----|
| **阶段数** | 2 | 3 |
| **阻塞性质** | 协调者故障时参与者阻塞 | 通过超时机制，参与者可自主决定 |
| **一致性保证** | 强一致 | 强一致 |
| **性能** | 较低（两轮 RTT） | 更低（三轮 RTT） |
| **网络分区处理** | 不能处理，会阻塞 | 部分缓解，但不能完全解决 |
| **实际应用** | XA 事务、部分分布式数据库 | 较少使用（网络分区的根本问题未解决） |

::: warning 2PC 的核心缺陷

```
正常情况：                   协调者故障后：
┌─────┐  Prepare / Vote    ┌─────┐  ???????????
│  C  │ ◄──────────────►   │  X  │             ← 协调者宕机
└─────┘                    └─────┘
   │                           │
   │                           │ 参与者已投 Yes，但不
   │                           │ 知道最终是 Commit 还是 Abort
   ▼                           ▼
┌─────────┐               ┌─────────┐
│Participant│             │Participant│ ← 持有锁，永久阻塞！
└─────────┘               └─────────┘
```
:::

### Gossip 协议

Gossip（流言）协议是一种去中心化的信息传播协议，灵感来源于人类社会中流言的传播方式。

**工作机制**：

```
每个节点定期随机选择几个其他节点，交换自己所知的信息。

Round 1:    ●                   ← 1 个节点知道新信息
Round 2:    ● ● ●               ← 感染 3 个节点
Round 3:    ● ● ● ● ● ● ●       ← 感染 7 个节点
Round 4:    ● ● ● ● ● ● ● ● ● ● ● ← 感染几乎所有节点
...
Round O(log N): 全集群收敛

收敛时间：O(log N)，其中 N 为集群大小
```

**三种传播模式**：

| 模式 | 机制 | 特点 |
|------|------|------|
| **Push** | 节点主动将自身状态推送给对端 | 适合新信息快速扩散 |
| **Pull** | 节点主动从对端拉取状态更新 | 适合修复过期数据 |
| **Push-Pull** | 双向交换全量状态信息 | 收敛最快，Cassandra 使用此模式 |

**实际应用场景**：

| 系统 | 用途 |
|------|------|
| **Cassandra** | 集群成员发现、数据副本修复 |
| **Consul** | Serf 组件使用 Gossip 做成员管理和故障检测 |
| **Dynamo (AWS)** | 成员管理与故障检测 |
| **Redis Cluster** | 节点间通过 Gossip 协议交换集群拓扑信息（PING/PONG 消息） |
| **Bitcoin / Ethereum** | P2P 网络中传播交易和区块 |

---

## 经典高频面试题

### Q3: Raft 协议如何保证安全性？请详细说明三点安全保证。

**答案：**

Raft 协议的安全性（Safety）保证了以下核心属性：**一旦某条日志条目被提交（committed），那么未来任何时候，所有后续的 Leader 都必须拥有这条日志条目。** 换句话说，已提交的条目永远不会丢失。

Raft 通过三条核心规则来保证这一点：

**安全保证一：Leader 日志完整性约束（Election Restriction）**

这是 Raft 最重要的安全保证。在选举阶段，Candidate 发送 RequestVote RPC 时会携带自己的日志信息（`lastLogIndex` 和 `lastLogTerm`）。Follower 收到投票请求后，会比较 Candidate 和自己的日志谁更"新"：

```
Follower 投票判断逻辑（伪代码）：

def shouldVote(candidate):
    if candidate.lastLogTerm > self.lastLogTerm:
        return YES   # 任期更大 → 更新 → 投票
    elif candidate.lastLogTerm == self.lastLogTerm and \
         candidate.lastLogIndex >= self.lastLogIndex:
        return YES   # 任期相同，索引更大或相等 → 投票
    else:
        return NO    # 日志不如我 → 拒绝
```

这个约束确保了：

- 任何当选的 Leader **一定包含了所有已提交的日志条目**；
- 因为一条日志要被提交就必须复制到多数派节点，而 Candidate 要当选也必须获得多数派投票，这两个多数派必然有交集；
- 交集处的节点同时"提交了日志"和"投票给了 Candidate"，且 Candidate 的日志不比该节点旧，所以 Candidate 一定包含该已提交日志。

```
多数派交集证明示意图：

  提交日志的多数派:  [S1]  [S2]  [S3  ]
  投票的多数派:      [S2]  [S3  ]  [S4]  [S5]

  交集 = {S2, S3}
  → S2 和 S3 既提交了日志又投票给 Candidate
  → Candidate 的日志 >= S2/S3 → Candidate 包含已提交日志
```

**安全保证二：Leader 只追加、不覆盖（Leader Append-Only）**

Leader 永远不会删除或覆盖自己的日志条目。当 Leader 通过 AppendEntries RPC 向 Follower 同步日志时：

- Leader 携带 `prevLogIndex` 和 `prevLogTerm` 告诉 Follower："假设我这之前的日志和你一致"；
- Follower 检查该位置是否匹配：匹配则接受新条目，不匹配则拒绝；
- Leader 被拒绝后，会将 `nextIndex` 减 1，继续尝试，直到找到第一个匹配的位置；
- 找到匹配点之后，Leader 会用**自己的日志覆盖** Follower 在匹配点之后的不一致日志。

关键约束：**Leader 只强制 Follower 与自己的日志一致，但 Leader 自己的已提交日志绝不被覆盖。**

**安全保证三：只提交当前任期的日志（Commitment Rule from Current Term）**

这是 Raft 论文中处理 Figure 8 问题的关键规则。Leader 只在当前任期的日志被多数派复制时，才推进 commitIndex。推进当前任期的 commitIndex 会**顺带提交所有前序未提交的日志**——但这些前序日志不会被单独提交，而是通过"当前任期提交"来间接保证。

这种方式确保了：即使发生了 Figure 8 的场景，前任的日志也不会被错误地当作"已提交"然后被覆盖。

**安全保证汇总**：

| 规则 | 防护目标 | 机制 |
|------|----------|------|
| Election Restriction | 防止丢失已提交日志的节点成为 Leader | Candidate 日志必须至少和多数派一样新 |
| Leader Append-Only | 防止 Leader 侧的日志被破坏 | Leader 永远不修改已有条目 |
| Commit Current Term | 防止前任未提交日志被错误提交后又被覆盖 | 只通过提交当前任期条目间接提交前序 |

---

### Q4: 请对比 Paxos 和 Raft 的异同。

**答案：**

**相同点（底层原理一致）**：

1. **都是多数派协议**：任何决策都需要获得多数派（Majority / Quorum）节点的响应，容忍少数节点故障（`2F + 1` 个节点容忍 `F` 个故障）；
2. **都基于 Leader 机制**：Multi-Paxos 和 Raft 在实际工程中都选举一个稳定的 Leader 来推进日志；
3. **日志结构一致**：都是有序的日志条目序列，通过复制日志实现状态机复制；
4. **安全性保证一致**：都保证已提交的日志不会被覆盖，Leader 都拥有最完整的日志；
5. **成员变更都需要特殊处理**：都面临从旧配置过渡到新配置时的安全性问题。

**不同点（设计哲学和实现路径差异）**：

| 对比维度 | Paxos (Multi-Paxos) | Raft |
|----------|---------------------|------|
| **理论完整性** | Lamport 给出了严格的 TLA+ 形式化证明，但论文主要描述 Basic Paxos，Multi-Paxos 细节留白较多 | Ongaro 的博士论文详尽描述了所有细节，包含 66 页的 TLA+ 规约，便于工程实现 |
| **问题分解** | 没有清晰的问题分解，所有机制交织在一起 | 明确分解为 Leader Election、Log Replication、Safety 三个独立子问题 |
| **Leader 选举** | 无内置机制，Multi-Paxos 的 Leader 选举需要额外协议或外部协调 | 内置 RequestVote RPC，有超时、随机退避、Term 递增等完整机制 |
| **日志提交方向** | 日志可以向"后"提交（允许乱序完成），理论上并发度更高 | 严格按索引顺序提交，简单但可能限制部分并发 |
| **日志不一致修复** | Leader 将 Follower 的日志逐一覆盖为自己的日志（单向修复） | Leader 回溯找到匹配点后，从匹配点开始覆盖（双向修复） |
| **成员变更** | 联合共识（Joint Consensus）：过渡期同时允许新旧两套配置 | 单节点变更（Single-Server Change）：每次只增删一个节点 |
| **快照机制** | 无内置定义 | 明确定义了 InstallSnapshot RPC 来传输快照 |
| **实现生态** | Google Chubby、Tencent PhxPaxos、Alibaba X-Paxos（各自实现差异大） | etcd、Consul、TiKV、CockroachDB（参考实现标准统一） |

::: tip 通俗类比

如果把共识算法比作法律体系：

- **Paxos** 像**判例法**：规则分散在多个判例（论文）中，核心原则明确（两阶段 + 多数派），但边界情况和实施细则需要各家自行解释和实现。
- **Raft** 像**成文法**：所有规则都被明确写在"法条"（论文 + TLA+）中，每个操作的输入输出都有精确约定，谁实现都应该一致。
:::

**选型建议**：

- 如果需要**理论深度和极致性能**（如数据库存储层），Paxos 的灵活性更有优势；
- 如果需要**工程确定性和可维护性**（如配置中心、服务发现），Raft 的简洁性更合适；
- 当前行业趋势是 Raft 在**应用层基础设施**中占据主流，而 Paxos 在**存储层**仍有广泛使用。

---

### Q5: 什么是脑裂（Split-Brain）？如何避免？

**答案：**

**定义**：

脑裂（Split-Brain）是指在一个集群中，由于网络分区（Network Partition）导致集群分裂为两个或多个互不通信的子集群，每个子集群都认为自己才是"合法"的集群，并分别选举出自己的 Master / Leader，开始独立接受外部请求，最终导致数据出现**不可合并的分叉（fork）**。

```
脑裂分叉示意：

         正常状态                        脑裂状态
   ┌─────────────────┐           ┌──────────────┐    ┌──────────────┐
   │  Master (A)      │           │ Master (A)    │    │ Master (C)   │
   │                  │           │               │    │              │
   │  ┌──┐ ┌──┐ ┌──┐ │           │ 写入: x=100   │    │ 写入: x=200  │
   │  │S1│ │S2│ │S3│ │           │               │    │              │
   │  └──┘ └──┘ └──┘ │           │  ┌──┐ ┌──┐    │    │  ┌──┐        │
   └─────────────────┘           │  │S1│ │S2│    │    │  │S3│        │
                                 │  └──┘ └──┘    │    │  └──┘        │
                                 └──────────────┘    └──────────────┘
                                          │                   │
                                       分叉 A             分叉 B
                                   x=100 (两个 Master)  x=200

   网络恢复后：两个 Master 都认为自己是对的 → 数据不可合并 → 灾难
```

**避免脑裂的核心策略**：

**策略一：法定人数（Quorum）**

这是最基础也是最核心的策略。规定任何选举 / 决策都必须在获得**超过半数节点**的同意后才能生效。

```
节点总数 N = 5, 法定人数 = ⌊N/2⌋ + 1 = 3

┌──────────────────┐       ┌──────────┐
│ 分区 A: 3 个节点  │       │ 分区 B: 2 个节点 │
│ 可以选出 Leader   │       │ 无法达到法定人数   │
│ 可以接受写入      │       │ 拒绝所有写入      │
└──────────────────┘       └──────────┘

→ 全集群只有一个分区能正常服务
→ 脑裂被阻止（B 分区无法选出 Leader）
```

这就是为什么 Raft、ZAB 都要求 **`2F + 1` 个节点**才能容忍 `F` 个故障。如果部署了偶数个节点（如 4 个节点），任意分区成 2+2 都会导致**两边都无法达到法定人数**，整个集群不可用。

**策略二：Fencing Token（栅栏令牌）**

法定人数保证了分区后不会出现两个 Leader 同时选举成功。但还存在一个边界场景：旧 Leader 暂时网络隔离但尚未感知到自己已失联，此时它可能仍然认为自己是 Leader 并尝试写入。

Fencing Token 机制在共享存储中维护一个**单调递增的 Token 号**：

```
流程：

1. 新 Leader 当选时，向协调服务获取一个新的 Token（如 token=6）
2. 旧 Leader 持有的 Token 已过期（如 token=5）
3. 每次写入共享存储时，必须携带自己的 Token
4. 共享存储只接受携带最大 Token（或更大）的写入请求

┌──────────────────────────────────────┐
│      ZooKeeper / etcd                │
│      current_fencing_token = 6       │
└──────────┬───────────────────────────┘
           │
      ┌────┴────┐
      │         │
      ▼         ▼
 ┌─────────┐  ┌─────────┐
 │ Old M   │  │ New M   │
 │token=5  │  │token=6  │
 └────┬────┘  └────┬────┘
      │            │
      ▼            ▼
 ┌──────────────────────────────────────┐
 │          共享存储                      │
 │ max_seen_token = 6                   │
 │                                      │
 │ Old M 写入 (token=5) → REJECTED!     │
 │ New M 写入 (token=6) → ACCEPTED      │
 └──────────────────────────────────────┘
```

**策略三：Raft PreVote（预投票）**

PreVote 主要防止**网络分区恢复后的"捣乱式选举"**，虽然不是直接防止脑裂，但能大幅降低不必要的 Leader 切换，减少脑裂发生的窗口期。

核心思想：节点发现心跳超时后，不立即增加 Term 并发起正式选举，而是先发起一轮 PreVote（预投票），询问其他节点"如果我现在发起选举，你们会投票给我吗？"

- 如果节点处于网络隔离状态，它无法联络到多数派节点 → PreVote 失败 → 不会增加 Term → 不会造成集群震荡；
- 网络恢复后，该节点恢复正常心跳接收，不会因为自己的 Term 过高而破坏正常运行的集群。

**策略四：Redis Sentinel 的主观下线 + 客观下线**

Redis Sentinel 采用了一种更细粒度的两阶段决策机制来避免脑裂，通过多个 Sentinel 节点的投票确认，确保只有真正失联的 Master 才会被切换。