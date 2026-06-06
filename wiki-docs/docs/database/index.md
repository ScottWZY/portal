# 数据库

## 模块概述

数据库模块是后端开发者的必修课，覆盖 MySQL 原理与优化、Redis 数据结构与缓存策略，以及 Elasticsearch 搜索引擎。数据库知识的考察贯穿面试全程——从基础 SQL 能力到架构设计题，几乎每轮都会涉及。

::: tip 学习目标
从 CRUD 工程师进阶为能分析慢查询、设计高性能表结构、解决缓存一致性问题的专业开发者。
:::

::: info 关注层次
应用层（SQL 优化 / 缓存设计） → 架构层（主从复制 / 分库分表） → 原理层（索引结构 / 存储引擎）
:::

## 核心知识点

### MySQL

| 子模块 | 核心内容 |
|--------|----------|
| 架构与存储引擎 | Server 层与存储引擎层分离架构、InnoDB vs MyISAM 对比、InnoDB 内存结构 |
| 索引原理 | B+Tree 数据结构、聚簇索引 vs 非聚簇索引、覆盖索引、索引下推、前缀索引 |
| 索引优化 | 最左前缀法则、索引失效场景 10 例、EXPLAIN 执行计划解读（type/rows/Extra） |
| SQL 优化 | 慢查询定位（slow_query_log）、Profile 分析、Join 优化（NLJ/BNL/MRR/BKA） |
| 事务与锁 | MVCC 原理（undo log + ReadView）、当前读 vs 快照读、行锁/间隙锁/临键锁 |
| 日志系统 | redo log（崩溃恢复）、undo log（事务回滚/MVCC）、binlog（主从复制/数据恢复） |
| 主从复制 | 异步/半同步/组复制对比、并行复制、GTID、读写分离中间件 |
| 分库分表 | 垂直拆分 vs 水平拆分、ShardingSphere 实战、分片键选择、跨分片查询方案 |

### Redis

| 子模块 | 核心内容 |
|--------|----------|
| 数据结构 | String/Hash/List/Set/ZSet 底层编码（SDS/ziplist/listpack/skiplist等） |
| 高级数据类型 | Bitmap（签到）、HyperLogLog（UV 统计）、GEO（LBS）、Stream（消息队列） |
| 持久化 | RDB（bgsave fork）vs AOF（fsync 策略）、混合持久化 |
| 缓存策略 | 缓存穿透/击穿/雪崩解决方案、淘汰策略（LRU/LFU/TTL）、过期删除策略 |
| 集群方案 | 主从 + Sentinel、Redis Cluster（16384 槽位、MOVED/ASK 重定向）、Codis |
| 分布式锁 | SET NX EX + Lua 解锁、Redisson RedLock、看门狗续期机制 |
| 缓存一致性 | Cache Aside 模式、延迟双删、Canal + MQ 异步更新 |

### Elasticsearch

| 子模块 | 核心内容 |
|--------|----------|
| 基础概念 | 索引/类型/文档/映射、倒排索引、分词器（IK Analyzer） |
| 查询 DSL | Bool Query（must/filter/should/must_not）、聚合查询（Bucket/Metrics/Pipeline） |
| 集群架构 | 分片与副本、Master 选举、脑裂问题、写入与查询流程 |
| 性能优化 | 批量写入、查询缓存、Scroll/Scroll-After 深分页 |

## 面试重点

::: warning 高频考点
1. **MySQL 索引优化**：给出慢 SQL，分析 EXPLAIN 结果，给出优化方案
2. **事务隔离级别**：每个级别解决的问题（脏读/不可重复读/幻读），MVCC 如何实现 RC 和 RR
3. **缓存三兄弟**：穿透/击穿/雪崩各自的场景和解决方案，布隆过滤器原理
4. **分布式锁**：Redis 实现分布式锁的演进过程（单机 → RedLock → Redisson），生产环境注意事项
5. **redo log 与 binlog 区别**：两阶段提交为什么需要？崩溃恢复流程是怎样的？
6. **分库分表后如何查询**：跨库 Join 解决方案、全局唯一 ID 生成方案（雪花算法）
:::

::: danger 容易翻车的点
- 索引只背最左前缀法则，换个查询场景就无法分析
- Redis 五大数据结构会用但不知道底层编码，被问 ZSet 为什么用跳表答不上来
- MVCC 和锁的关系混淆，不理解快照读为什么不需要加锁
- 分布式锁只停留在 SET NX EX，不知道 Redisson 的续期机制
:::

## 学习建议

### 阶段一：MySQL 原理与优化（3 周）
1. 搭建测试环境，用存储过程造百万级数据，实际执行 EXPLAIN 分析
2. 画出 B+Tree 的页结构，手动演示插入和查找过程
3. 用两个 Session 复现各种锁场景（间隙锁在 RR 下的表现）
4. 阅读 InnoDB 关键源码（Buffer Pool、B+Tree 索引）

### 阶段二：Redis 深度掌握（2 周）
5. 手动用 Redis 实现延迟队列、排行榜、分布式 Session
6. 搭建 Redis Cluster 环境，演练节点扩容和数据迁移
7. 阅读 skiplist 源码，理解跳表的插入与查找算法

### 阶段三：Elasticsearch 入门（1 周）
8. 搭建 ES 集群，用 Logstash 同步 MySQL 数据，实现搜索功能
9. 使用 Kibana 进行查询调试与分析

### 阶段四：综合实战（1 周）
10. 设计一个高并发秒杀场景的数据库与缓存方案，画出时序图

::: details 推荐书单
- 《高性能 MySQL（第4版）》—— Silvia Botros
- 《MySQL 技术内幕：InnoDB 存储引擎（第2版）》—— 姜承尧
- 《Redis 设计与实现》—— 黄健宏
- 《Redis 开发与运维》—— 付磊
- 《Elasticsearch 权威指南》
:::