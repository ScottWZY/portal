# 高并发架构（high-concurrency）Wiki 补充内容计划

> 创建日期：2026-06-06
> 状态：待确认

---

## 一、审查结论

对现有 11 个页面进行三份材料交叉审查（`index.md` 核心知识点表、`plan.md` 第9-10周、`roadmap.md` 高并发知识域），结果如下：

| 审查维度 | 知识项总数 | 已覆盖 | 未覆盖 | 当前覆盖率 |
|----------|-----------|--------|--------|-----------|
| index.md 核心知识点表 | 27 | 13 | 14 | **48%** |
| plan.md 第9-10周 | 13 | 6 | 7 | **46%** |
| roadmap.md 高并发知识域 | 4 | 3 | 1 | **75%** |

**总结**：设计模式和经典场景设计已较完整，但**分布式核心理论**和**架构分层与扩展**两大板块大面积缺失。

---

## 二、缺失知识点清单（按优先级排序）

### 🔴 P0 — 面试绝对高频，必须补

| 知识点 | 缺失原因 | 面试出现概率 |
|--------|---------|------------|
| 分布式锁（Redis/ZK/Etcd） | 仅表格列出，无独立文档 | 95% |
| 分布式 ID（雪花算法 + Leaf 号段） | 短链接文档提及但未深入，无雪花详解 | 90% |
| 分布式事务（2PC/3PC/TCC/Saga/AT） | 仅在流程图中提到概念 | 90% |
| CAP/BASE 理论深入 | 仅框架提及，无 PACELC 扩展 | 85% |
| 一致性协议（Paxos/Raft） | 仅在流程图提到 | 80% |

### 🟡 P1 — 高频考点，重要补充

| 知识点 | 缺失原因 |
|--------|---------|
| 负载均衡策略与算法 | 轮询/加权/一致性哈希/最小连接无对比文档 |
| 服务发现与注册（CAP 角度） | Eureka/Nacos/Consul 无 CAP 对比分析 |
| 文件上传（分片上传 + 秒传） | 仅表格列出，无独立文档 |

### 🟢 P2 — 进阶考点，锦上添花

| 知识点 | 缺失原因 |
|--------|---------|
| 多活架构与容灾 | 同城双活/两地三中心无讲解 |
| 动静分离 + 读写分离 | 仅表格列出，无实战文档 |
| 链路追踪 | 服务雪崩提到，OpenTelemetry 无文档 |

---

## 三、新增内容规划（共 12 个页面）

### 新增模块 A：分布式理论（distributed-theory/）—— 6 页

#### A1. distributed-theory/index.md — 分布式理论总览
| 项目 | 内容 |
|------|------|
| **内容** | CAP/BASE/一致性协议/事务/ID/锁的全景图、依赖关系、学习路径 |
| **面试题** | 5 道（CAP为什么不能同时满足、BASE核心思想、强一致vs最终一致选型、分布式理论学习路径、不同中间件的CAP分布） |
| **字数** | ~2000 |

#### A2. distributed-theory/cap-base.md — CAP 定理与 BASE 理论
| 项目 | 内容 |
|------|------|
| **内容** | CAP 严格证明（网络分区下的取舍）、PACELC 定理扩展、BASE 三个维度详解、不同中间件 CAP 选择（Eureka AP / ZK CP / Nacos AP+CP / Redis Cluster） |
| **面试题** | 6 道（CAP证明思路、为什么不能同时满足CP+AP、PACELC解释、Nacos为什么能切换、BASE中软状态实例、最终一致性实现手段） |
| **字数** | ~3000 |

#### A3. distributed-theory/consensus-protocol.md — 一致性协议
| 项目 | 内容 |
|------|------|
| **内容** | 2PC 两阶段详解（协调者单点、同步阻塞）、3PC 改进（CanCommit/PreCommit/DoCommit）、Paxos 核心推导（Basic Paxos 两阶段）、Raft 详解（Leader 选举 + 日志复制 + 安全性）、Multi-Paxos vs Raft 对比 |
| **面试题** | 6 道（2PC同步阻塞问题、3PC真的解决了吗、Paxos两阶段核心、Raft选举过程、Raft日志复制流程、Paxos vs Raft对比） |
| **字数** | ~3500 |

#### A4. distributed-theory/distributed-transaction.md — 分布式事务
| 项目 | 内容 |
|------|------|
| **内容** | 2PC/3PC（XA事务）实现、TCC 三阶段详解（Try预留/Confirm提交/Cancel回滚）+ 空回滚/悬挂问题、Saga 长事务 + 补偿模式、AT 模式（Seata 一阶段+二阶段回滚）、可靠消息最终一致性（本地消息表 + MQ）、各方案对比选型表 |
| **面试题** | 6 道（TCC空回滚/悬挂怎么解决、Saga补偿设计、AT vs TCC区别、Seata AT原理、可靠消息最终一致性流程、分布式事务选型标准） |
| **字数** | ~4000 |

#### A5. distributed-theory/distributed-id.md — 分布式 ID 生成器
| 项目 | 内容 |
|------|------|
| **内容** | UUID 方案及问题（无序、索引不友好）、数据库自增（单点瓶颈）、Redis 自增、雪花算法 64bit 详细拆解（41位时间戳+10位机器ID+12位序列号）、时钟回拨的5种解决方案（等待/拒绝/备用ID/扩展位/切换方案）、Leaf 号段模式原理（号段预取、双Buffer）、Leaf-snowflake 优化 |
| **面试题** | 6 道（雪花算法64位拆解、时钟回拨5种方案、号段模式原理、Leaf为什么比雪花更可靠、UUID为什么不推荐、QPS估算+选型） |
| **字数** | ~3500 |

#### A6. distributed-theory/distributed-lock.md — 分布式锁
| 项目 | 内容 |
|------|------|
| **内容** | Redis 实现演进：SETNX → SET NX PX（原子）→ Lua 解锁（原子判断+删除）、锁续期看门狗（WatchDog）、RedLock 算法详解 + Martin Kleppmann 争议 + 实际建议、Redisson 源码级分析（加锁Lua + 看门狗续期）、Zookeeper 临时顺序节点 + Watcher、Etcd Lease + 事务、三种方案对比（性能/可靠性/一致性） |
| **面试题** | 6 道（SETNX为什么不行/SET NX PX优势、解锁为什么用Lua、看门狗机制、RedLock争议、Redisson vs 自己封装、Redis/ZK/Etcd选型） |
| **字数** | ~4000 |

### 新增模块 B：架构扩展（architecture-scaling/）—— 5 页

#### B1. architecture-scaling/index.md — 架构分层与扩展总览
| 项目 | 内容 |
|------|------|
| **内容** | 分层架构全景图、垂直扩展 vs 水平扩展决策树、无状态服务弹性伸缩、各层瓶颈与解决思路 |
| **面试题** | 5 道（垂直vs水平扩展选型、无状态为什么能水平扩展、分层架构设计理由、单点瓶颈怎么定位、什么时候该读写分离） |
| **字数** | ~2000 |

#### B2. architecture-scaling/load-balancing.md — 负载均衡策略与算法
| 项目 | 内容 |
|------|------|
| **内容** | 四层 vs 七层负载均衡对比、轮询/加权轮询/随机/最小连接/IP哈希/一致性哈希 6 种算法详解 + 代码示例、Nginx upstream 配置、Ribbon LoadBalancer 原理、一致性哈希在分布式缓存中的应用（减少节点变动时的缓存穿透）、健康检查与故障摘除 |
| **面试题** | 6 道（6种算法对比+适用场景、一致性哈希为什么能减少缓存穿透、虚拟节点解决什么问题、Nginx ip_hash vs hash、加权轮询如何实现平滑加权、最少连接算法如何计算） |
| **字数** | ~3500 |

#### B3. architecture-scaling/service-discovery.md — 服务发现与注册（CAP 视角）
| 项目 | 内容 |
|------|------|
| **内容** | 服务发现核心问题（注册/发现/健康检查）、客户端发现 vs 服务端发现、Eureka AP 设计（自我保护机制、90秒剔除）、Zookeeper CP 问题（Leader 选举期间不可用）、Nacos 切换 AP/CP（临时实例 vs 持久实例）、Consul 对比、健康检查机制对比（心跳 vs 主动探测） |
| **面试题** | 6 道（Eureka自我保护机制、ZK做注册中心的CP问题、Nacos何时选AP何时选CP、客户端vs服务端发现、健康检查心跳vs探测、选型标准） |
| **字数** | ~3500 |

#### B4. architecture-scaling/static-dynamic-separation.md — 动静分离 + 读写分离
| 项目 | 内容 |
|------|------|
| **内容** | 动静分离架构（CDN+OSS+动态服务拆分）、静态化方案（页面静态化/前后端分离）、读写分离架构（主从复制 + 路由）、主从延迟问题及方案（强制读主/延迟阈值/Pt-heartbeat监控）、ShardingSphere 读写分离配置示例、分库分表 + 读写分离组合使用 |
| **面试题** | 6 道（动静分离怎么分、主从延迟怎么处理、强制读主场景、ShardingSphere怎么配读写分离、分库分表+读写分离怎么组合、什么时候不适合读写分离） |
| **字数** | ~3000 |

#### B5. architecture-scaling/multi-active-tracing.md — 多活架构与链路追踪
| 项目 | 内容 |
|------|------|
| **内容** | 同城双活/两地三中心/异地多活概念对比、多活核心挑战（数据同步冲突解决/用户路由/故障切换）、GSLB 全局流量调度、链路追踪原理（TraceId + SpanId + 传播）、OpenTelemetry 标准、Jaeger/Zipkin/SkyWalking 对比 |
| **面试题** | 6 道（同城双活vs两地三中心区别、多活数据冲突怎么解决、GSLB如何做到就近接入、链路追踪核心原理TraceId/SpanId、OpenTelemetry是什么、SkyWalking vs Jaeger选型） |
| **字数** | ~3500 |

### 新增模块 C：系统设计补充（system-design/）—— 1 页

#### C1. system-design/file-upload.md — 文件上传系统
| 项目 | 内容 |
|------|------|
| **内容** | 分片上传原理（前端分片 + 后端合并）、秒传机制（MD5/SHA256 哈希 + 预校验）、OSS 直传架构（签名/STS Token/分片上传）、断点续传（已传分片记录）、大文件上传优化（并发分片 + 进度条）、CDN 加速 + 图片处理 |
| **面试题** | 6 道（分片上传前端怎么实现、秒传MD5为什么不能只用文件名、OSS直传签名怎么防篡改、断点续传怎么记录已传分片、大文件并发上传怎么控制、秒传安全性怎么保证） |
| **字数** | ~3000 |

---

## 四、侧边栏配置变更

需在 `wiki-docs/docs/.vitepress/config.js` 的 `'/high-concurrency/'` 侧边栏中新增两个分组：

```js
'/high-concurrency/': [
    // ... 现有配置保持不变 ...
    {
      text: '分布式理论',
      collapsed: false,
      items: [
        { text: '分布式理论总览', link: '/high-concurrency/distributed-theory/' },
        { text: 'CAP 与 BASE', link: '/high-concurrency/distributed-theory/cap-base' },
        { text: '一致性协议', link: '/high-concurrency/distributed-theory/consensus-protocol' },
        { text: '分布式事务', link: '/high-concurrency/distributed-theory/distributed-transaction' },
        { text: '分布式 ID', link: '/high-concurrency/distributed-theory/distributed-id' },
        { text: '分布式锁', link: '/high-concurrency/distributed-theory/distributed-lock' },
      ]
    },
    {
      text: '架构分层与扩展',
      collapsed: false,
      items: [
        { text: '架构扩展总览', link: '/high-concurrency/architecture-scaling/' },
        { text: '负载均衡', link: '/high-concurrency/architecture-scaling/load-balancing' },
        { text: '服务发现与注册', link: '/high-concurrency/architecture-scaling/service-discovery' },
        { text: '动静分离与读写分离', link: '/high-concurrency/architecture-scaling/static-dynamic-separation' },
        { text: '多活架构与链路追踪', link: '/high-concurrency/architecture-scaling/multi-active-tracing' },
      ]
    },
    {
      text: '系统设计',
      collapsed: false,
      items: [
        // ... 现有配置保持不变 ...
        { text: '文件上传系统', link: '/high-concurrency/system-design/file-upload' },
      ]
    },
],
```

---

## 五、执行顺序

```
A1 (总览) → A2 (CAP/BASE) → A3 (一致性协议) → A4 (分布式事务) → A5 (分布式ID) → A6 (分布式锁)
B1 (总览) → B2 (负载均衡) → B3 (服务发现) → B4 (动静读写分离) → B5 (多活+链路追踪)
C1 (文件上传)
```

A 组和 B 组可以独立并行推进，C1 随时可做。建议按 A1→A6→B1→B5→C1 的顺序，分布式理论优先。

---

## 六、验收标准

- [ ] 12 个页面全部创建，路径正确
- [ ] 每个页面末尾包含 ≥5 道面试题 + 正确答案
- [ ] 侧边栏配置新增两个分组 + 一个链接
- [ ] 本地 `npx vitepress dev docs` 可正常渲染
- [ ] 补充后覆盖率从 48% 提升到 ≥90%

---

## 七、总结

| 维度 | 现有 | 新增 | 完成后 |
|------|------|------|--------|
| 页面数 | 11 | 12 | 23 |
| 面试题数 | ~53 | ~70 | ~123 |
| 模块数 | 2 | 2 | 4 |
| 覆盖率 | 48% | +42% | ≥90% |
| 总新增字数 | — | ~37000 | — |