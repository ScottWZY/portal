# 中间件

## 模块概述

中间件是分布式系统的骨架，负责消息传递、服务治理、数据同步等关键职责。掌握主流中间件的使用和原理，是区分初级与高级工程师的重要分水岭。本模块聚焦 RocketMQ/Kafka 消息队列、Nacos 注册配置中心、Sentinel 流控熔断以及 XXL-JOB 定时任务。

::: tip 核心思路
消息队列的重点是**可靠性保证**（不丢消息）和**高性能设计**（零拷贝/顺序写）；注册中心的重点是**CAP 取舍**和**健康检查**。
:::

::: info 技术选型
阿里系技术栈：RocketMQ / Nacos / Sentinel / Seata / XXL-JOB，兼顾 Kafka 作为大数据场景的消息总线。
:::

## 核心知识点

### 消息队列

#### RocketMQ

| 子模块 | 核心内容 |
|--------|----------|
| 架构设计 | NameServer（无状态路由）、Broker（主从同步）、Producer/Consumer 分组 |
| 消息模型 | Topic / Queue / Tag 层级、顺序消息、延迟消息、事务消息 |
| 存储设计 | CommitLog 顺序写、ConsumeQueue 索引、零拷贝（mmap + sendfile） |
| 高可用 | DLedger 基于 Raft 的主从切换、同步/异步刷盘对比 |
| 消息可靠性 | 同步/异步发送、重试机制、死信队列、消费 Ack |

#### Kafka

| 子模块 | 核心内容 |
|--------|----------|
| 架构设计 | Broker / Controller / Coordinator 角色、ZooKeeper vs KRaft |
| 分区机制 | Partition 与 Consumer Group 的分配、Rebalance 触发条件与问题 |
| 存储设计 | 分段日志、稀疏索引（二分查找）、页缓存 + 零拷贝 |
| 高吞吐 | 批量发送、压缩算法（GZIP/Snappy/LZ4/ZSTD）、顺序读写 |
| 可靠性 | ISR 机制、acks 配置、幂等生产、EOS 精确一次语义 |
| RocketMQ vs Kafka | 延迟消息支持、事务消息、适用场景、吞吐 vs 功能对比 |

### 注册与配置中心

| 子模块 | 核心内容 |
|--------|----------|
| Nacos 架构 | AP（Distro）vs CP（Raft）模式切换、注册表结构、健康检查 |
| 注册中心对比 | Nacos vs Eureka（AP）vs Zookeeper（CP）vs Consul，CAP 模型取舍 |
| 配置管理 | Nacos 长轮询与动态刷新原理、Spring Cloud 集成 |
| 服务发现 | 客户端负载均衡（Ribbon/LoadBalancer）、权重路由 |

### 流量治理与调度

| 子模块 | 核心内容 |
|--------|----------|
| Sentinel | 资源调用链、Slot Chain 责任链、滑动窗口统计、流控/熔断/热点 |
| Hystrix 对比 | 线程池隔离 vs 信号量隔离、Sentinel 的优势（控制台/动态规则） |
| XXL-JOB | 调度中心 vs 执行器、路由策略、分片广播、失败重试与告警 |

### 分布式事务

| 子模块 | 核心内容 |
|--------|----------|
| Seata AT | 两阶段提交、undo_log 回滚日志、全局锁 |
| Seata TCC | Try-Confirm-Cancel（资源预留/确认/释放）、空回滚与悬挂 |
| 事务消息 | RocketMQ 半消息机制实现最终一致性 |

## 面试重点

::: warning 高频考点
1. **消息不丢失**：RocketMQ/Kafka 在生产者/Broker/消费者三个环节如何保证可靠性？
2. **消息重复消费**：什么情况下会重复？如何做幂等？（数据库唯一键 + Redis + 业务状态机）
3. **消息积压**：积压原因分析、紧急处理方案（临时扩容 Consumer）、长期治理策略
4. **RocketMQ 事务消息**：半消息 → 执行本地事务 → 发送确认/回查的完整流程
5. **Nacos AP vs CP**：为什么注册中心选 AP？配置中心选 CP？Distro 协议如何实现 AP？
6. **Sentinel 与 Hystrix 对比**：滑动窗口 vs 滑动桶、控制台可视化、规则动态下发
7. **分布式事务选型**：Seata AT / TCC / Saga / 可靠消息最终一致性的适用场景
:::

::: danger 容易翻车的点
- 只会用不会排查问题：消息丢了不知道从哪个环节查
- 把 Kafka 和 RocketMQ 的适用场景搞混，说不出选型依据
- 分布式事务一上来就说 Seata，不考虑业务场景是否适合
- 对 Nacos 中 CP/AP 的理解停留在概念，说不出具体协议
:::

## 学习建议

### 阶段一：消息队列核心（2 周）
1. 搭建 RocketMQ 单机和集群环境，用官方示例跑通全部消息类型
2. 搭建 Kafka 环境，对比两者的吞吐和延迟差异
3. 模拟消息丢失、重复消费、消息积压场景，完整走一遍排查和修复流程
4. 阅读 RocketMQ CommitLog 存储层源码

### 阶段二：注册配置中心（1 周）
5. 搭建 Nacos 集群，测试 AP/CP 模式切换，验证服务发现的时效性
6. 阅读 Nacos 长轮询机制和 Distro 协议源码

### 阶段三：流量治理（1 周）
7. 搭建 Sentinel 控制台，配置流控/熔断/热点规则，进行压测验证
8. 集成 XXL-JOB，实现分片广播任务

### 阶段四：综合实战（1 周）
9. 设计一个下单 → 扣库存 → 发消息 → 扣款的全链路方案，覆盖消息可靠性和分布式事务

::: details 推荐书单
- 《RocketMQ 实战与原理解析》—— 杨开元
- 《Apache Kafka 实战》—— 胡夕
- 《深入理解 Kafka：核心设计与实践原理》—— 朱忠华
- 《Nacos 架构与原理》—— Nacos 官方文档
- 《Sentinel 官方文档》
:::