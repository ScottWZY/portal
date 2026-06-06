# 中间件

## 模块概述

中间件是分布式系统的骨架，负责消息传递、服务治理、数据同步等关键职责。掌握主流中间件的使用和原理，是区分初级与高级工程师的重要分水岭。本模块已全面覆盖 **Kafka / RocketMQ / ZooKeeper / Nacos / Dubbo** 五大核心中间件，包含完整的三级知识图谱（入门→进阶→经典高频）、核心原理深度解析和经典高频面试题。

::: tip 核心思路
消息队列的重点是**可靠性保证**（不丢消息）和**高性能设计**（零拷贝/顺序写）；注册中心的重点是**CAP 取舍**和**健康检查**；RPC 框架的重点是**服务调用全链路**和**SPI 扩展机制**。
:::

::: info 内容特色
- 每个中间件包含 **6 个核心原理深度解析要点**
- 每个中间件附带 **6 道经典高频面试题**（含完整深入答案）
- 分布式理论基础章节覆盖 CAP / BASE / Paxos / Raft / ZAB 等核心理论
- 基于 2025-2026 年最新版本（Kafka 4.0 KRaft / RocketMQ 5.5.0 / ZooKeeper 3.9.4 / Nacos 3.2.x / Dubbo 3.x）
:::

## 知识域导航

### 分布式理论基础

| 文档 | 核心内容 |
|------|----------|
| [分布式理论](distributed-system/) | 分布式系统定义、核心挑战、知识域总览 |
| [CAP 与 BASE](distributed-system/cap-base) | CAP 定理深度解析、BASE 理论、分布式一致性模型 |
| [一致性协议](distributed-system/consensus) | Paxos / Raft / ZAB / 2PC-3PC / Gossip 协议 |
| [分布式事务](distributed-system/transaction) | 2PC / 3PC / TCC / Saga / Seata 方案对比 |
| [分布式 ID](distributed-system/id-generator) | UUID / 雪花算法 / 数据库号段 / Redis 方案 |

### 消息队列

| 文档 | 核心内容 |
|------|----------|
| [MQ 概览](message-queue/) | 消息队列核心概念、Kafka vs RocketMQ vs RabbitMQ 选型对比 |
| [Kafka 核心](message-queue/kafka) | 分区机制、ISR、水位线、幂等性、Exactly-Once、KRaft 共识 |
| [RocketMQ 核心](message-queue/rocketmq) | 事务消息、顺序消息、CommitLog 存储、DLedger 高可用 |
| [消息可靠性](message-queue/reliability) | 消息不丢失三端保证、幂等消费、消息堆积处理、事务消息对比 |

### 分布式协调与服务治理

| 文档 | 核心内容 |
|------|----------|
| [ZooKeeper 核心](distributed-system/zookeeper) | ZAB 协议、分布式锁、Watcher 机制、Session 管理 |
| [Nacos 核心](distributed-system/nacos) | Distro 协议、AP/CP 双模、配置动态刷新、健康检查 |
| [Dubbo 核心](distributed-system/dubbo) | SPI 机制、Triple 协议、服务调用全链路、线程模型 |

## 面试重点

::: warning 高频考点
1. **消息不丢失**：Kafka / RocketMQ 在 Producer / Broker / Consumer 三个环节如何保证可靠性？
2. **消息重复消费**：什么情况下会重复？如何做幂等？（数据库唯一键 + Redis + 业务状态机）
3. **消息积压**：积压原因分析、紧急处理方案（临时扩容 Consumer）、长期治理策略
4. **RocketMQ 事务消息**：半消息 → 执行本地事务 → 发送确认/回查的完整流程
5. **Kafka ISR 机制**：为什么设计 ISR 而不是简单的同步/异步复制？
6. **Kafka Exactly-Once**：幂等生产者 + 事务 API 的双维度实现原理
7. **Nacos AP vs CP**：Distro 协议 vs Raft 协议，临时实例 vs 持久实例的选型
8. **ZooKeeper 分布式锁**：临时顺序节点 + Watch 前驱 vs Redis Redlock 对比
9. **Dubbo 调用全链路**：从 Consumer 到 Provider 的 16 步完整路径
10. **Raft 安全性**：选举限制、提交限制、日志匹配性质三点保证
11. **CAP 定理**：为什么不能同时满足三者？CP vs AP 的工程取舍
12. **脑裂**：为什么集群推荐奇数节点？Quorum 机制如何避免脑裂？
:::

::: danger 容易翻车的点
- 只会用不会排查问题：消息丢了不知道从哪个环节查
- 把 Kafka 和 RocketMQ 的适用场景搞混，说不出选型依据
- 分布式事务一上来就说 Seata，不考虑业务场景是否适合
- 对 Nacos 中 CP/AP 的理解停留在概念，说不出具体协议（Distro / Raft）
- ZooKeeper 的分布式锁只会说"临时节点"，不知道羊群效应和顺序节点方案
- Dubbo 只知道用注解，不知道 Filter 链和 SPI 扩展机制
:::

## 学习建议

### 阶段一：分布式理论奠基（1 周）
1. 通读 [分布式理论](distributed-system/) → [CAP 与 BASE](distributed-system/cap-base) → [一致性协议](distributed-system/consensus)
2. 理解 CAP 定理的本质选择和 BASE 理论的设计哲学
3. 掌握 Raft 协议的三大子问题和安全性保证

### 阶段二：分布式协调（1 周）
4. 学习 [ZooKeeper 核心](distributed-system/zookeeper)，理解 ZAB 协议和分布式锁实现
5. 学习 [Nacos 核心](distributed-system/nacos)，对比 AP/CP 双模式的实际应用

### 阶段三：消息队列核心（2 周）
6. 学习 [Kafka 核心](message-queue/kafka)，搭建集群环境，对比吞吐和延迟
7. 学习 [RocketMQ 核心](message-queue/rocketmq)，跑通全部消息类型
8. 阅读 [消息可靠性](message-queue/reliability)，模拟消息丢失/重复/积压场景

### 阶段四：RPC 框架（1 周）
9. 学习 [Dubbo 核心](distributed-system/dubbo)，理解 SPI 机制和 Triple 协议
10. 搭建 Dubbo + Nacos 的微服务 Demo，追踪完整调用链路

::: details 推荐书单
- 《RocketMQ 实战与原理解析》—— 杨开元
- 《Apache Kafka 实战》—— 胡夕
- 《深入理解 Kafka：核心设计与实践原理》—— 朱忠华
- 《从 Paxos 到 ZooKeeper：分布式一致性原理与实践》—— 倪超
- 《Nacos 架构与原理》—— Nacos 官方文档
- 《Apache Dubbo 官方文档》
- 《In Search of an Understandable Consensus Algorithm》（Raft 论文）
:::