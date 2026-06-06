# 高并发架构（high-concurrency）第三次补充内容计划

> 创建日期：2026-06-06
> 状态：已完成

---

## 一、审查结论

经过两轮补充（第一轮 9 页 + 第二轮 12 页），当前高并发模块已有 **23 页**，覆盖了设计模式、分布式理论、架构扩展和系统设计四大板块。但对照行业标准高并发知识体系（共 11 个维度），仍有以下缺口：

| 维度 | 覆盖情况 | 缺口说明 |
|------|----------|----------|
| 性能测试与容量规划 | ❌ 缺失 | 仅有容量估算公式，无 JMH/JMeter/全链路压测方法论 |
| 监控告警体系 | ⚠️ 薄弱 | 链路追踪已覆盖，但指标体系、Prometheus+Grafana、告警规则缺失 |
| 大厂案例 | ⚠️ 薄弱 | 仅秒杀案例，缺少 12306、双十一等经典案例 |
| 高并发安全 | ❌ 缺失 | DDoS 防护、WAF、HTTPS/TLS 优化完全空白 |
| 数据库连接池优化 | ❌ 缺失 | HikariCP/Druid 参数调优没有独立文档 |
| 排行榜系统 | ❌ 缺失 | index.md 已列出但未实现 |
| 消息推送系统 | ❌ 缺失 | index.md 已列出但未实现 |

---

## 二、新增内容规划（共 10 个页面）

### 新增模块 A：性能测试与容量规划（performance-testing/）—— 3 页

#### A1. performance-testing/index.md — 性能测试总览

| 项目 | 内容 |
|------|------|
| **核心内容** | 性能测试金字塔（微基准→单元→集成→全链路）、测试指标体系（QPS/TPS、RT、成功率、资源利用率）、JMH vs JMeter vs 全链路压测的定位与分工 |
| **面试题** | 5 道（性能测试金字塔各层关注什么、压测QPS是怎么定义的、怎么区分性能瓶颈在应用还是数据库、如何设计压测场景、压测数据如何分析） |
| **字数** | ~2000 |

#### A2. performance-testing/jmh-benchmark.md — JMH 微基准测试

| 项目 | 内容 |
|------|------|
| **核心内容** | JMH 核心注解（@Benchmark/@Warmup/@Measurement/@Fork/@State）、四种 Mode（Throughput/AverageTime/SampleTime/SingleShotTime）、JVM 预热与 JIT 编译对基准测试的影响、常见陷阱（死代码消除 DCE、常量折叠、循环展开）、实战：对比 StringBuilder vs StringBuffer 性能、对比不同锁实现（synchronized vs ReentrantLock vs LongAdder） |
| **面试题** | 6 道（JMH为什么需要预热、@Fork的作用是什么、@State的Scope有几种、DCE是什么怎么避免、JMH的Mode有几种各适合什么场景、为什么生产环境不能直接用JMH结果） |
| **字数** | ~3000 |

#### A3. performance-testing/full-link-testing.md — 全链路压测与容量规划

| 项目 | 内容 |
|------|------|
| **核心内容** | 全链路压测的挑战（数据隔离、流量染色、依赖方配合）、JMeter 基础使用（Thread Group/Sampler/Listener/后置处理器）、压测方案设计（单接口→混合场景→全链路）、流量回放（TCPCopy/Nginx 流量录制）、影子表/影子库（数据隔离方案）、压测隔离（逻辑隔离 vs 物理隔离 vs 染色路由）、容量规划四步法（量级预估→瓶颈识别→扩容方案→验证复盘）、性能拐点分析 |
| **面试题** | 6 道（全链路压测核心挑战是什么、影子表怎么设计、流量染色怎么实现、压测数据怎么隔离才能不影响线上、怎么判断系统瓶颈在哪里、容量规划四步法） |
| **字数** | ~3500 |

---

### 新增模块 B：监控告警体系（monitoring-alerting/）—— 3 页

#### B1. monitoring-alerting/index.md — 监控告警总览

| 项目 | 内容 |
|------|------|
| **核心内容** | 可观测性三大支柱（Metrics/Logs/Traces）、监控体系分层（基础设施→中间件→应用→业务）、监控数据流（采集→存储→计算→展示→告警）、四大黄金指标（延迟/流量/错误/饱和度）、RED 方法论（Rate/Errors/Duration）、USE 方法论（Utilization/Saturation/Errors） |
| **面试题** | 5 道（可观测性三大支柱的关系、四大黄金指标是什么、RED和USE分别适用什么场景、监控体系分层怎么设计、Metrics/Logs/Traces什么时候用哪个） |
| **字数** | ~2000 |

#### B2. monitoring-alerting/metrics-prometheus.md — 指标采集与可视化

| 项目 | 内容 |
|------|------|
| **核心内容** | Prometheus 架构（Pull 模型、TSDB 存储、PromQL）、Metrics 类型（Counter/Gauge/Histogram/Summary）、Java 应用指标暴露（Micrometer + Spring Boot Actuator）、JVM 关键指标（堆内存/GC/线程/类加载）、Grafana 可视化（Dashboard/JVM 监控面板/QPS 趋势图）、Exporter 生态（Node Exporter/MySQL Exporter/Redis Exporter）、埋点最佳实践（RED 指标自动埋点 + 业务指标手动埋点） |
| **面试题** | 6 道（Prometheus为什么用Pull而不是Push、Counter和Gauge的区别、Histogram的bucket怎么选、Spring Boot Actuator暴露了哪些指标、PromQL怎么计算QPS和P99延迟、Grafana怎么设计告警Dashboard） |
| **字数** | ~3500 |

#### B3. monitoring-alerting/alerting-design.md — 告警体系设计

| 项目 | 内容 |
|------|------|
| **核心内容** | 告警分级（P0 紧急/P1 严重/P2 警告/P3 通知）、告警规则设计（阈值设置/持续时间/静默期）、告警降噪（告警聚合/告警抑制/告警静默）、告警路由（不同级别→不同通知渠道）、Prometheus AlertManager（分组/抑制/静默）、告警响应流程（SOP：发现→确认→处理→复盘）、On-Call 轮值、告警误报与漏报的平衡 |
| **面试题** | 6 道（告警怎么分级、告警降噪怎么做、AlertManager分组和抑制的区别、怎么避免告警风暴、告警误报和漏报怎么平衡、SOP流程包含哪些环节） |
| **字数** | ~3000 |

---

### 新增模块 C：高并发安全（security/）—— 1 页

#### C1. security/network-security.md — 高并发场景下的网络安全

| 项目 | 内容 |
|------|------|
| **核心内容** | DDoS 攻击类型（SYN Flood/UDP Flood/HTTP Flood/DNS 反射放大）、DDoS 防护架构（流量清洗/黑洞路由/Anycast 分散）、WAF 原理（规则引擎/语义分析/机器学习）、CC 攻击与限流区别（应用层 vs 网络层）、HTTPS/TLS 优化（TLS 1.3 握手简化/Session 复用/OCSP Stapling）、证书管理（自动续期/证书链优化）、API 安全（签名校验/Anti-Replay/参数校验） |
| **面试题** | 6 道（SYN Flood攻击原理和防护、DDoS流量清洗怎么做、WAF和限流有什么区别、TLS 1.3相比1.2有什么优化、Session复用怎么减少握手开销、API安全怎么防重放攻击） |
| **字数** | ~3000 |

---

### 新增模块 D：大厂案例（real-cases/）—— 3 页

#### D1. real-cases/index.md — 大厂案例总览

| 项目 | 内容 |
|------|------|
| **核心内容** | 为什么大厂案例重要（面试考察架构思维、学习最佳实践）、案例学习方法论（需求→约束→方案→演进→复盘）、本模块案例概览（12306 票务/双十一/秒杀/其他） |
| **面试题** | 5 道（大厂案例面试怎么回答、如何从案例中提炼通用方法论、架构演进的驱动力是什么、如何判断一个方案是否适合自己公司、大厂方案直接照搬有哪些坑） |
| **字数** | ~2000 |

#### D2. real-cases/12306-architecture.md — 12306 票务系统架构

| 项目 | 内容 |
|------|------|
| **核心内容** | 12306 业务特点（高并发抢票/强一致性/复杂库存模型）、核心挑战（热点车次/区间库存扣减/余票查询）、架构演进（从集中式到分布式）、分票仓设计（按车次/按区间/按座位分片）、库存模型（区间库存/GTS 分布式事务）、分流策略（按车次分库/队列缓冲/验证码削峰）、CDN 静态化（车次/票价/时刻表静态化）、查询优化（缓存预热/本地缓存/定时刷新）、12306 给我们的启示（业务复杂度决定架构复杂度） |
| **面试题** | 6 道（12306为什么这么难做、分票仓怎么设计、区间库存扣减怎么保证一致性、CDN静态化解决了什么问题、验证码真的是为了防刷吗、从12306你学到了什么架构思想） |
| **字数** | ~3500 |

#### D3. real-cases/double-11-evolution.md — 双十一架构演进

| 项目 | 内容 |
|------|------|
| **核心内容** | 双十一业务特点（瞬时峰值/全链路压测/大促保障）、架构演进历程（2010 单体→2012 服务化→2015 容器化→2018 云原生→2020 异地多活）、全链路压测体系（流量录制/影子表/数据隔离/压测报告）、大促保障体系（预案管理/降级开关/限流阈值/扩容方案）、单元化架构（LDC 逻辑数据中心/用户路由/数据分区）、大促过后复盘（技术债务/架构优化/容量规划）、对中小公司的启示（量力而行/渐进式演进） |
| **面试题** | 6 道（双十一架构演进的几个关键阶段、全链路压测核心挑战和解决方案、单元化架构是什么为什么需要、大促保障预案怎么设计、大促降级开关怎么设计才能快速生效、双十一对中小公司有什么启示） |
| **字数** | ~3500 |

---

### 现有模块扩展：系统设计（system-design/）—— 2 页

#### E1. system-design/leaderboard.md — 排行榜系统设计

| 项目 | 内容 |
|------|------|
| **核心内容** | 排行榜场景分类（实时榜/小时榜/日榜/总榜）、Redis ZSet 实现（ZADD/ZINCRBY/ZREVRANGE）、分段排行榜（多级缓存 + 定时归档到 MySQL）、Top-N 问题优化（堆排序/小顶堆/Loser Tree）、海量用户排名（近似排名 + 分段桶）、热度算法（Wilson 置信区间/Hacker News 算法/Reddit 算法）、游戏排行榜（分区榜 + 全区榜 + 赛季重置） |
| **面试题** | 6 道（Redis ZSet底层数据结构是什么、排行榜怎么做到实时更新、分段排行榜怎么设计、海量用户排名怎么近似计算、热度算法怎么设计、赛季重置怎么实现） |
| **字数** | ~3000 |

#### E2. system-design/push-notification.md — 消息推送系统设计

| 项目 | 内容 |
|------|------|
| **核心内容** | 推送系统架构（长连接网关 + 路由层 + 推送层）、WebSocket 长连接管理（连接注册/心跳保活/断线重连）、连接路由表（用户→节点映射/一致性哈希分配）、消息投递流程（设备注册→消息路由→推送→ACK）、大规模推送挑战（百万连接单机瓶颈/C10K 问题）、分层推送策略（全量推送/标签推送/个性化推送）、消息可靠性（ACK 机制/失败重试/离线消息存储）、推送通道选择（WebSocket 长连接 vs APNs/FCM 厂商通道 vs 短信备选） |
| **面试题** | 6 道（WebSocket长连接怎么管理、百万连接单机怎么优化、连接路由表怎么设计、消息推送怎么保证可靠性、离线消息怎么处理、推送通道怎么选型） |
| **字数** | ~3000 |

---

### 现有模块扩展：数据库优化（architecture-scaling/）—— 1 页

#### F1. architecture-scaling/connection-pool-optimization.md — 数据库连接池优化

| 项目 | 内容 |
|------|------|
| **核心内容** | 连接池核心参数（maximumPoolSize/minimumIdle/connectionTimeout/idleTimeout/maxLifetime）、HikariCP 为什么快（FastList/ConcurrentBag/Javassist 字节码优化）、连接池调优公式（poolSize = Tn × (Cm - 1) + 1）、Druid 监控能力（SQL 监控/慢SQL记录/防火墙）、连接泄漏排查（activeCount 持续增长/leakDetectionThreshold）、常见问题（连接不够用/连接超时/空闲连接回收）、连接池 vs 连接复用（PgBouncer/ProxySQL） |
| **面试题** | 6 道（HikariCP为什么这么快、连接池大小怎么计算、连接泄漏怎么排查、Druid和HikariCP怎么选、连接超时和连接池满的区别、连接池为什么要做空闲回收） |
| **字数** | ~3000 |

---

## 三、侧边栏配置变更

需在 `wiki-docs/docs/.vitepress/config.js` 的 `'/high-concurrency/'` 侧边栏中新增三个分组 + 两个链接：

```js
'/high-concurrency/': [
    // ... 现有配置保持不变 ...
    {
      text: '性能测试与容量规划',
      collapsed: false,
      items: [
        { text: '性能测试总览', link: '/high-concurrency/performance-testing/' },
        { text: 'JMH 微基准测试', link: '/high-concurrency/performance-testing/jmh-benchmark' },
        { text: '全链路压测', link: '/high-concurrency/performance-testing/full-link-testing' },
      ]
    },
    {
      text: '监控告警体系',
      collapsed: false,
      items: [
        { text: '监控告警总览', link: '/high-concurrency/monitoring-alerting/' },
        { text: '指标采集与 Prometheus', link: '/high-concurrency/monitoring-alerting/metrics-prometheus' },
        { text: '告警体系设计', link: '/high-concurrency/monitoring-alerting/alerting-design' },
      ]
    },
    {
      text: '高并发安全',
      collapsed: false,
      items: [
        { text: '网络安全', link: '/high-concurrency/security/network-security' },
      ]
    },
    {
      text: '大厂案例',
      collapsed: false,
      items: [
        { text: '大厂案例总览', link: '/high-concurrency/real-cases/' },
        { text: '12306 票务系统', link: '/high-concurrency/real-cases/12306-architecture' },
        { text: '双十一架构演进', link: '/high-concurrency/real-cases/double-11-evolution' },
      ]
    },
    {
      text: '架构分层与扩展',
      collapsed: false,
      items: [
        // ... 现有 5 项保持不变 ...
        { text: '数据库连接池优化', link: '/high-concurrency/architecture-scaling/connection-pool-optimization' },
      ]
    },
    {
      text: '系统设计',
      collapsed: false,
      items: [
        // ... 现有 6 项保持不变 ...
        { text: '排行榜系统', link: '/high-concurrency/system-design/leaderboard' },
        { text: '消息推送系统', link: '/high-concurrency/system-design/push-notification' },
      ]
    },
],
```

---

## 四、执行顺序

```
A1 (总览) → A2 (JMH) → A3 (全链路压测)
B1 (总览) → B2 (Prometheus) → B3 (告警设计)
C1 (网络安全)
D1 (总览) → D2 (12306) → D3 (双十一)
E1 (排行榜) + E2 (消息推送)
F1 (连接池优化)
```

A/B/C/D 四组可独立并行推进，E 组和 F 组随时可做。建议按 A → B → C → D → E → F 的顺序，从基础设施到上层应用逐步推进。

---

## 五、验收标准

- [ ] 10 个页面全部创建，目录结构正确
- [ ] 每个页面末尾包含 ≥5 道面试题 + 正确答案
- [ ] 侧边栏配置新增 3 个分组，扩展 2 个现有分组
- [ ] 本地 `npx vitepress dev docs` 可正常渲染
- [ ] 所有页面内容与现有页面无重复、无冲突

---

## 六、总结

| 维度 | 现有 | 本次新增 | 完成后 |
|------|------|----------|--------|
| 页面数 | 23 | 10 | 33 |
| 面试题数 | ~123 | ~58 | ~181 |
| 模块数 | 4 | 4 新模块 | 8 |
| 新增字数 | — | ~29,000 | — |
| 知识维度覆盖 | 6/11 | +4/11 | 10/11 |

> **说明**：第 11 个维度（消息队列深入）已在 `middleware/message-queue/` 模块完整覆盖，无需在高并发模块重复。