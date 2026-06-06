# 数据库知识范畴完善计划

创建日期：2026-06-06

---

## 一、任务概述

完善 VitePress Wiki 项目中 **数据库模块（database/）** 的知识范畴，覆盖六大数据库板块，每个板块需要包含：知识图谱、基础到进阶学习路线、经典应用场景与完整解决方案、高频面试题（≥5题/小节）、数据库选型思路和规则。

**六大板块：**

| 板块 | 类型 | 状态 |
|------|------|------|
| MySQL | 关系型数据库 | 已有部分内容，需扩充 |
| Oracle | 关系型数据库 | 全新构建 |
| 国产数据库 | 关系型/分布式 | 全新构建 |
| Redis | 缓存数据库 | 已有部分内容，需扩充 |
| Elasticsearch | 搜索引擎 | 全新构建 |
| MongoDB | 文档数据库 | 全新构建 |

---

## 二、当前状态分析

### 2.1 现有文件

```
wiki-docs/docs/database/
├── index.md                    # 数据库总览（已有，需更新）
├── mysql/
│   ├── index.md                # MySQL 核心原理（已有）
│   └── index-optimization.md   # 索引优化（已有）
└── redis/
    └── index.md                # Redis 核心原理（已有）
```

### 2.2 现有 Sidebar 配置

config.js 中 `/database/` 侧边栏目前只有 MySQL 和 Redis 两个分组，各6个子项。

### 2.3 VitePress 配置

- 已集成 mermaid 插件，支持知识图谱图表
- 支持 cleanUrls，引用时省略 `.md` 后缀
- 中文界面，支持 tip/warning/danger/info/details 容器

---

## 三、目标文件结构

```
wiki-docs/docs/database/
├── index.md                           # 更新：数据库总览（覆盖六大板块）
├── mysql/                             # MySQL 板块（扩充）
│   ├── index.md                       # 已有：MySQL 核心原理
│   ├── index-optimization.md          # 已有：索引优化
│   ├── sql-optimization.md            # 新增：SQL 优化
│   ├── transaction-locking.md         # 新增：事务与锁
│   ├── logging-system.md              # 新增：日志系统
│   ├── sharding.md                    # 新增：分库分表
│   ├── replication.md                 # 新增：主从复制
│   └── selection.md                   # 新增：MySQL 选型指南
├── oracle/                            # 新增：Oracle 板块
│   ├── index.md                       # Oracle 核心架构
│   ├── storage.md                     # 存储结构与表空间
│   ├── transaction.md                 # 事务与锁机制
│   ├── optimizer.md                   # 优化器与执行计划
│   ├── backup-recovery.md             # 备份恢复
│   ├── performance.md                 # 性能调优
│   └── selection.md                   # Oracle 选型指南
├── domestic/                          # 新增：国产数据库板块
│   ├── index.md                       # 国产数据库概览
│   ├── oceanbase.md                   # OceanBase
│   ├── tidb.md                        # TiDB
│   ├── opengauss.md                   # openGauss
│   ├── dameng.md                      # 达梦 DM8
│   └── selection.md                   # 国产数据库选型对比
├── redis/                             # Redis 板块（扩充）
│   ├── index.md                       # 已有：Redis 核心原理
│   ├── data-structure.md              # 新增：高级数据结构
│   ├── persistence.md                 # 新增：持久化机制
│   ├── distributed-lock.md            # 新增：分布式锁
│   ├── cache-strategy.md              # 新增：缓存策略
│   ├── cluster.md                     # 新增：集群方案
│   └── selection.md                   # 新增：Redis 选型指南
├── elasticsearch/                     # 新增：Elasticsearch 板块
│   ├── index.md                       # ES 核心概念与架构
│   ├── inverted-index.md              # 倒排索引与分词
│   ├── dsl-query.md                   # 查询与聚合
│   ├── cluster.md                     # 集群架构
│   ├── performance.md                 # 性能优化
│   └── selection.md                   # ES 选型指南
└── mongodb/                           # 新增：MongoDB 板块
    ├── index.md                       # MongoDB 核心概念
    ├── data-model.md                  # 文档模型设计
    ├── query-index.md                 # 查询与索引
    ├── replication-sharding.md        # 副本集与分片
    ├── transaction.md                 # 事务支持
    └── selection.md                   # MongoDB 选型指南
```

**新增文件总计：30 个**（含更新的 index.md）

---

## 四、内容规范

### 4.1 每个文件统一结构

```markdown
# 标题

## 概述
- 模块定位与学习目标

---

## 一、知识图谱
```mermaid
graph TD
  ...
```

## 二、基础到进阶学习路线
- 阶段一：基础入门
- 阶段二：原理深入
- 阶段三：实战优化

---

## 三、核心知识详解
（分小节展开关键知识点）

---

## 四、经典应用场景与解决方案
- 场景：问题背景 → 完整方案 → 代码/配置示例

---

## 五、高频面试题（≥5题）
### Q1: 问题
::: details 答案
完整答案解析
:::

---

## 六、选型指南
- 适用场景 / 不适用场景 / 对比 / 配置建议

---

## 相关文档
- 内部链接引用
```

### 4.2 写作风格要求

- 中文内容，技术术语保留英文
- 使用 VitePress 容器：`::: tip`、`::: warning`、`::: danger`、`::: info`、`::: details`
- 面试题答案使用 `::: details` 折叠
- 知识图谱使用 mermaid 图表
- 代码使用语言标注的代码块
- 内部链接使用相对路径，省略 `.md` 后缀

---

## 五、更新后的 Sidebar 配置

```javascript
'/database/': [
  { text: '数据库', link: '/database/' },
  {
    text: 'MySQL',
    collapsed: false,
    items: [
      { text: 'MySQL 核心', link: '/database/mysql/' },
      { text: '索引优化', link: '/database/mysql/index-optimization' },
      { text: 'SQL 优化', link: '/database/mysql/sql-optimization' },
      { text: '事务与锁', link: '/database/mysql/transaction-locking' },
      { text: '日志系统', link: '/database/mysql/logging-system' },
      { text: '分库分表', link: '/database/mysql/sharding' },
      { text: '主从复制', link: '/database/mysql/replication' },
      { text: '选型指南', link: '/database/mysql/selection' },
    ]
  },
  {
    text: 'Oracle',
    collapsed: false,
    items: [
      { text: 'Oracle 核心架构', link: '/database/oracle/' },
      { text: '存储结构', link: '/database/oracle/storage' },
      { text: '事务与锁', link: '/database/oracle/transaction' },
      { text: '优化器与执行计划', link: '/database/oracle/optimizer' },
      { text: '备份恢复', link: '/database/oracle/backup-recovery' },
      { text: '性能调优', link: '/database/oracle/performance' },
      { text: '选型指南', link: '/database/oracle/selection' },
    ]
  },
  {
    text: '国产数据库',
    collapsed: false,
    items: [
      { text: '概览', link: '/database/domestic/' },
      { text: 'OceanBase', link: '/database/domestic/oceanbase' },
      { text: 'TiDB', link: '/database/domestic/tidb' },
      { text: 'openGauss', link: '/database/domestic/opengauss' },
      { text: '达梦 DM8', link: '/database/domestic/dameng' },
      { text: '选型对比', link: '/database/domestic/selection' },
    ]
  },
  {
    text: 'Redis',
    collapsed: false,
    items: [
      { text: 'Redis 核心', link: '/database/redis/' },
      { text: '数据结构', link: '/database/redis/data-structure' },
      { text: '持久化', link: '/database/redis/persistence' },
      { text: '分布式锁', link: '/database/redis/distributed-lock' },
      { text: '缓存策略', link: '/database/redis/cache-strategy' },
      { text: '集群方案', link: '/database/redis/cluster' },
      { text: '选型指南', link: '/database/redis/selection' },
    ]
  },
  {
    text: 'Elasticsearch',
    collapsed: false,
    items: [
      { text: 'ES 核心架构', link: '/database/elasticsearch/' },
      { text: '倒排索引与分词', link: '/database/elasticsearch/inverted-index' },
      { text: '查询与聚合', link: '/database/elasticsearch/dsl-query' },
      { text: '集群架构', link: '/database/elasticsearch/cluster' },
      { text: '性能优化', link: '/database/elasticsearch/performance' },
      { text: '选型指南', link: '/database/elasticsearch/selection' },
    ]
  },
  {
    text: 'MongoDB',
    collapsed: false,
    items: [
      { text: 'MongoDB 核心', link: '/database/mongodb/' },
      { text: '文档模型设计', link: '/database/mongodb/data-model' },
      { text: '查询与索引', link: '/database/mongodb/query-index' },
      { text: '副本集与分片', link: '/database/mongodb/replication-sharding' },
      { text: '事务支持', link: '/database/mongodb/transaction' },
      { text: '选型指南', link: '/database/mongodb/selection' },
    ]
  },
],
```

---

## 六、实施步骤

### 步骤一：创建目录结构
- 创建 `oracle/`、`domestic/`、`elasticsearch/`、`mongodb/` 四个新目录
- 路径：`wiki-docs/docs/database/`

### 步骤二：更新 Sidebar 配置
- 修改 `wiki-docs/docs/.vitepress/config.js` 中 `/database/` 侧边栏
- 新增 Oracle、国产数据库、Elasticsearch、MongoDB 分组

### 步骤三：更新总览页
- 更新 `wiki-docs/docs/database/index.md`，覆盖六大板块

### 步骤四：MySQL 扩充（6个新文件）
依次创建：sql-optimization.md → transaction-locking.md → logging-system.md → sharding.md → replication.md → selection.md

### 步骤五：Oracle 新建（7个文件）
依次创建：index.md → storage.md → transaction.md → optimizer.md → backup-recovery.md → performance.md → selection.md

### 步骤六：国产数据库新建（6个文件）
依次创建：index.md → oceanbase.md → tidb.md → opengauss.md → dameng.md → selection.md

### 步骤七：Redis 扩充（6个新文件）
依次创建：data-structure.md → persistence.md → distributed-lock.md → cache-strategy.md → cluster.md → selection.md

### 步骤八：Elasticsearch 新建（6个文件）
依次创建：index.md → inverted-index.md → dsl-query.md → cluster.md → performance.md → selection.md

### 步骤九：MongoDB 新建（6个文件）
依次创建：index.md → data-model.md → query-index.md → replication-sharding.md → transaction.md → selection.md

### 步骤十：链接校验
- 检查所有内部链接相对路径
- 验证各板块之间的交叉引用
- 本地启动开发服务器验证导航

---

## 七、各文件内容要点

### 7.1 MySQL 扩充

| 文件 | 核心知识 | 面试题方向 |
|------|----------|------------|
| sql-optimization.md | 慢查询定位、Profile分析、Join算法（NLJ/BNL/BKA/MRR）、深分页优化 | 深分页优化、子查询 vs JOIN、大表数据清理 |
| transaction-locking.md | ACID、隔离级别、MVCC原理、行锁/间隙锁/临键锁/意向锁、死锁排查 | MVCC实现、RR与幻读、间隙锁、死锁排查 |
| logging-system.md | redo log / undo log / binlog、两阶段提交、崩溃恢复、binlog三种格式 | redo vs binlog、两阶段提交、数据恢复 |
| sharding.md | 垂直/水平拆分、分片键选择、跨分片查询、全局ID、ShardingSphere | 分片键选择、全局ID方案、跨分片分页 |
| replication.md | 主从复制原理、异步/半同步/组复制、GTID、并行复制、读写分离 | 复制原理、主从延迟、读写分离一致性 |
| selection.md | MySQL适用场景、版本选择、与Oracle/国产数据库对比 | 选型决策 |

### 7.2 Oracle 新建

| 文件 | 核心知识 | 面试题方向 |
|------|----------|------------|
| index.md | 实例 vs 数据库、SGA/PGA、后台进程、与MySQL架构对比 | Oracle vs MySQL、SGA组成、LGWR触发 |
| storage.md | 表空间/段/区/块、分区表、ASSM | 表空间管理、分区策略 |
| transaction.md | 隔离级别、TM/TX锁、ITL、回滚段 | 锁机制、回滚段原理 |
| optimizer.md | CBO优化器、执行计划、统计信息、绑定变量 | 执行计划解读、绑定变量窥探 |
| backup-recovery.md | RMAN、expdp/impdp、闪回技术 | RMAN增量备份、闪回查询 |
| performance.md | AWR报告、等待事件、热块竞争、并行执行 | AWR分析、等待事件排查 |
| selection.md | 适用场景、授权成本、云平台选择 | 选型决策 |

### 7.3 国产数据库新建

| 文件 | 核心知识 | 面试题方向 |
|------|----------|------------|
| index.md | 国产数据库发展、分类、信创背景 | 国产替代趋势、分类 |
| oceanbase.md | 一体化分布式架构、LSMTree、HTAP | 架构特点、适用场景 |
| tidb.md | PD+TiKV+TiDB、Raft、计算存储分离、HTAP | 架构优势、与MySQL兼容性 |
| opengauss.md | 基于PG演进、内存优化、AI特性 | 与PG差异、内存优化 |
| dameng.md | DM8架构、Oracle兼容、信创适配 | 迁移方案、兼容性 |
| selection.md | 对比表格、选型决策树、迁移注意事项 | 选型决策 |

### 7.4 Redis 扩充

| 文件 | 核心知识 | 面试题方向 |
|------|----------|------------|
| data-structure.md | SDS/quicklist/skiplist底层、Bitmap/HyperLogLog/GEO/Stream | SDS优势、跳表 vs 红黑树、Stream vs List |
| persistence.md | RDB(bgsave fork)、AOF(三种策略)、混合持久化、AOF重写 | RDB vs AOF、fork影响、混合持久化 |
| distributed-lock.md | SET NX EX、Lua解锁、RedLock、Redisson看门狗 | 锁实现演进、RedLock争议、看门狗机制 |
| cache-strategy.md | 穿透/击穿/雪崩、布隆过滤器、LRU/LFU、Cache-Aside、延迟双删 | 穿透方案、击穿 vs 雪崩、延迟双删原理 |
| cluster.md | 主从复制、Sentinel、Cluster(16384槽)、MOVED/ASK、Codis | 槽位机制、故障转移、集群扩容 |
| selection.md | 适用场景、版本选择、集群模式选择 | 选型决策 |

### 7.5 Elasticsearch 新建

| 文件 | 核心知识 | 面试题方向 |
|------|----------|------------|
| index.md | 索引/文档/分片、倒排索引、集群角色、Lucene | 搜索快的原因、集群角色 |
| inverted-index.md | 倒排索引结构、分词器、段合并、FST | 倒排索引原理、IK分词器 |
| dsl-query.md | Query vs Filter、Bool Query、聚合、深分页(Scroll/Scroll-After) | Filter vs Query、深分页方案 |
| cluster.md | 分片策略、写入/查询流程、Master选举、脑裂 | 写入流程、脑裂解决 |
| performance.md | 批量写入、查询缓存、冷热分离、慢查询 | 写入优化、冷热分离 |
| selection.md | 适用场景、ES vs Solr、集群规划 | 选型决策 |

### 7.6 MongoDB 新建

| 文件 | 核心知识 | 面试题方向 |
|------|----------|------------|
| index.md | 文档模型 vs 关系模型、BSON、架构、适用场景 | 文档模型优势、BSON |
| data-model.md | 内嵌 vs 引用、反范式、ObjectId | 文档设计、内嵌 vs 引用 |
| query-index.md | 查询语法、索引类型、WiredTiger、覆盖查询 | 索引类型、优化策略 |
| replication-sharding.md | 副本集(Raft)、分片集群、分片键选择 | 选举机制、分片键设计 |
| transaction.md | 多文档事务(4.0+)、分布式事务(4.2+)、与MySQL对比 | 事务支持程度、使用限制 |
| selection.md | 适用场景、MongoDB vs MySQL、云托管 | 选型决策 |

---

## 八、假设与决策

1. **内容深度**：面向高级工程师面试准备，侧重原理理解和实战场景，不追求 API 文档式全覆盖
2. **国产数据库范围**：选择 OceanBase、TiDB、openGauss、达梦 DM8 四个最具代表性的产品
3. **mermaid 图表**：每个板块入口文件使用完整知识图谱，专题文件使用局部关系图
4. **面试题质量**：优先选择高频、经典、有区分度的题目，答案注重原理深度
5. **选型指南**：每个板块独立 selection.md，板块间通过交叉引用建立关联
6. **文件命名**：遵循 kebab-case 规范
7. **链接格式**：内部链接省略 `.md` 后缀，使用相对路径

---

## 九、验证清单

- [ ] 所有 30 个文件创建完成
- [ ] 每个文件包含知识图谱（mermaid）
- [ ] 每个文件包含基础到进阶学习路线
- [ ] 每个文件包含至少 1 个经典应用场景及完整方案
- [ ] 每个文件包含至少 5 道面试题及完整答案
- [ ] 每个板块的 selection.md 包含选型思路和规则
- [ ] config.js sidebar 配置更新正确
- [ ] database/index.md 总览更新覆盖六大板块
- [ ] 所有内部链接可正常跳转
- [ ] mermaid 图表渲染正常
- [ ] 本地开发服务器导航和搜索正常