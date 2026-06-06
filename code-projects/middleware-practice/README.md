# 中间件实践

> 创建日期：2026-06-06

---

## 模块概览

本模块聚焦三大主流中间件的深度实践：Redis（缓存与分布式协调）、Kafka（消息队列与事件驱动）、ShardingSphere（分库分表）。中间件是分布式系统的基石，也是高级工程师必须精通的内容。

---

## 一、redis-practice —— 分布式锁、缓存穿透/击穿/雪崩解决方案

### 技术栈

| 类别 | 技术 |
|------|------|
| 语言 | Java 17 |
| 框架 | Spring Boot 3.x + Spring Data Redis |
| 缓存 | Redis 7.x（单机 / 哨兵 / 集群） |
| 连接池 | Lettuce |
| 序列化 | Jackson2JsonRedisSerializer |
| 分布式锁 | Redisson |
| 压测工具 | JMeter |

### 学习目标

- 深刻理解缓存穿透、缓存击穿、缓存雪崩的产生原因和解决方案
- 掌握基于 Redis 的分布式锁实现（Redisson 看门狗机制、红锁算法）
- 能结合实际业务设计合理的缓存策略（Cache Aside、Read/Write Through、Write Behind）
- 掌握 Redis 的数据结构应用场景（Bitmap 签到、HyperLogLog UV 统计、GEO 附近的人）
- 理解 Redis 集群模式（主从、哨兵、Cluster）的架构和故障转移原理
- 掌握缓存与数据库的双写一致性方案（先更新 DB 再删缓存、延迟双删、订阅 binlog）

### 核心实验清单

| 编号 | 实验名称 | 说明 |
|------|----------|------|
| RED-01 | 缓存穿透 | 布隆过滤器实现、空值缓存 |
| RED-02 | 缓存击穿 | 互斥锁方案、逻辑过期方案 |
| RED-03 | 缓存雪崩 | 多级缓存、随机 TTL、熔断降级 |
| RED-04 | 分布式锁基础 | SET NX EX 原子操作、Lua 脚本释放锁 |
| RED-05 | Redisson 分布式锁 | 看门狗自动续期、可重入锁、读写锁 |
| RED-06 | 缓存一致性 | 四种双写一致性方案的对比实现 |
| RED-07 | Bitmap 实战 | 用户签到连续天数统计 |
| RED-08 | HyperLogLog | 亿级 UV 去重统计 |
| RED-09 | GEO 实战 | 附近商户搜索排序 |
| RED-10 | 延迟队列 | 基于 ZSet 实现可靠延迟任务 |

### 对应 Wiki 模块

- Redis 核心数据结构与应用
- 缓存穿透 / 击穿 / 雪崩
- 分布式锁
- 缓存一致性
- Redis 集群与高可用
- Redis 性能优化

### 预计耗时

**30 ~ 40 小时**

---

## 二、kafka-practice —— 消息可靠性、顺序消息、幂等消费

### 技术栈

| 类别 | 技术 |
|------|------|
| 语言 | Java 17 |
| 框架 | Spring Boot 3.x + Spring Kafka |
| 消息队列 | Kafka 3.x |
| 序列化 | JSON / Avro |
| 监控 | Kafka Manager / Kafka Eagle |
| 容器化 | Docker Compose（Kafka + Zookeeper） |

### 学习目标

- 理解 Kafka 的核心架构：Topic、Partition、Broker、Consumer Group、Controller
- 掌握消息可靠性的三个维度：生产端 ACK 机制、Broker 端副本同步（ISR）、消费端手动提交
- 理解 Kafka 的顺序消息实现原理及使用场景
- 掌握消费端的幂等处理方案（数据库唯一键、Redis 去重、业务状态机）
- 能配置合理的消费者参数（max.poll.records、fetch.min.bytes、session.timeout.ms）
- 理解 Kafka 的零拷贝（Zero Copy）与顺序写盘的高性能原理
- 掌握死信队列（DLT）的配置与重试策略

### 核心实验清单

| 编号 | 实验名称 | 说明 |
|------|----------|------|
| KAF-01 | 消息可靠性 | acks=all、min.insync.replicas、手动提交验证 |
| KAF-02 | 顺序消息 | 单 Partition 顺序生产与消费 |
| KAF-03 | 幂等消费 | 三种幂等方案实现与对比 |
| KAF-04 | 死信队列 | 消费失败重试 + DLT 兜底 |
| KAF-05 | 批量消费 | 批量拉取、批量处理的性能对比 |
| KAF-06 | 事务消息 | Kafka 事务 API 实现 exactly-once |
| KAF-07 | 流式处理 | Kafka Streams 实时数据聚合计算 |
| KAF-08 | 监控与运维 | 消费者 Lag 监控、分区重分配 |

### 对应 Wiki 模块

- Kafka 核心架构
- 消息可靠性保障
- 顺序消息与幂等性
- Kafka 性能优化
- Kafka Streams

### 预计耗时

**30 ~ 35 小时**

---

## 三、sharding-sphere-demo —— 分库分表实战

### 技术栈

| 类别 | 技术 |
|------|------|
| 语言 | Java 17 |
| 框架 | Spring Boot 3.x + MyBatis-Plus |
| 分库分表 | ShardingSphere-JDBC 5.x |
| 数据库 | MySQL 8.0（多实例） |
| 数据源 | HikariCP |
| 分布式 ID | 雪花算法（Snowflake） |

### 学习目标

- 理解分库分表的核心概念：垂直拆分 vs 水平拆分、分片键、分片算法
- 掌握 ShardingSphere-JDBC 的配置方式（YAML / Java API / 注解）
- 能根据业务场景选择合适的分片策略（标准分片、复合分片、Hint 分片、广播表、绑定表）
- 理解分库分表后的跨库查询问题及解决方案（全局表、绑定表、强制路由）
- 掌握分布式主键生成策略（Snowflake、UUID、数据库号段模式）
- 理解读写分离的实现与主从延迟的处理方案

### 分片策略实战

| 编号 | 实验名称 | 说明 |
|------|----------|------|
| SHD-01 | 垂直分库 | 按业务模块拆分数据库 |
| SHD-02 | 水平分表 | 单库内按 ID 取模分表 |
| SHD-03 | 水平分库分表 | 多库多表，每个库内再分表 |
| SHD-04 | 绑定表 | 关联查询优化 |
| SHD-05 | 广播表 | 全局配置表的广播写入 |
| SHD-06 | 读写分离 | 一主多从配置，读写分离验证 |
| SHD-07 | 分布式 ID | Snowflake 算法整合 |
| SHD-08 | 数据脱敏 | ShardingSphere 内置数据脱敏 |
| SHD-09 | 分片键选择 | 不同分片键对查询性能的影响分析 |

### 对应 Wiki 模块

- 分库分表理论基础
- ShardingSphere 核心概念
- 分片策略与算法
- 读写分离
- 分布式主键

### 预计耗时

**25 ~ 30 小时**