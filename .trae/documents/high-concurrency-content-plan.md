# 高并发架构（high-concurrency）Wiki 内容编写计划

> 创建日期：2026-06-06
> 状态：已完成

---

## 一、任务概述

### 目标
为 VitePress 面试准备 Wiki 项目的高并发（high-concurrency）模块，补充当前缺失的 9 个页面，每个页面末尾包含 **不少于 5 道经典高频面试题 + 正确答案**。

### 背景
当前 `high-concurrency/` 模块已有：
- ✅ `index.md` — 模块概览（已完成）
- ✅ `system-design/index.md` — 系统设计方法论（已完成）
- ❌ 其余 9 个页面均缺失，需创建

### 约束条件
- 使用 VitePress 兼容的 Markdown 格式（支持 mermaid 图表）
- 每个页面字数约 2000–4000 字
- 内容面向高级工程师面试，需有深度和实战性
- 所有内容使用中文编写
- 文件仅操作项目路径内的文件（`d:\traeData\trae-solo\trae_prepare\wiki-docs\docs\high-concurrency\`）

---

## 二、子任务清单

### 子任务 1：设计模式总览
| 项目 | 内容 |
|------|------|
| **文件** | `wiki-docs/docs/high-concurrency/design-patterns/index.md` |
| **内容** | 高并发设计模式全景图（限流、熔断、缓存、异步），四种模式核心问题对比表，学习路径建议 |
| **面试题** | 5 道（限流/降级/熔断区别、为什么需要设计模式、空间换时间/时间换空间、舱壁隔离、Fail-Fast vs Fail-Safe） |
| **预估字数** | ~2000 字 |

### 子任务 2：限流算法
| 项目 | 内容 |
|------|------|
| **文件** | `wiki-docs/docs/high-concurrency/design-patterns/rate-limiter.md` |
| **内容** | 四种限流算法（固定窗口、滑动窗口、漏桶、令牌桶）对比、Guava RateLimiter/Sentinel/Redis+Lua 实现、限流层级设计 |
| **面试题** | 6 道（四种算法对比、分布式限流 Redis+Lua 原子性、滑动窗口优化、Sentinel vs Guava 选型、令牌桶预热、限流被拒业务处理） |
| **预估字数** | ~3500 字 |

### 子任务 3：降级与熔断
| 项目 | 内容 |
|------|------|
| **文件** | `wiki-docs/docs/high-concurrency/design-patterns/circuit-breaker.md` |
| **内容** | 熔断器三态状态机、Hystrix/Resilience4j/Sentinel 框架对比、舱壁隔离（线程池 vs 信号量）、降级策略 |
| **面试题** | 6 道（三态状态流转、降级 vs 熔断区别、Hystrix 替代方案、舱壁隔离选型、半开状态必要性、为什么优先降级非核心功能） |
| **预估字数** | ~3500 字 |

### 子任务 4：缓存策略
| 项目 | 内容 |
|------|------|
| **文件** | `wiki-docs/docs/high-concurrency/design-patterns/caching.md` |
| **内容** | 多级缓存架构、四种缓存更新模式（Cache Aside/Read Through/Write Through/Write Behind）对比、缓存一致性（先删缓存还是先更DB、延迟双删、Canal）、穿透/击穿/雪崩解决方案、热点Key处理、缓存预热 |
| **面试题** | 6 道（四种模式选型、先更DB还是先删缓存、穿透/击穿/雪崩区别、热点Key发现与解决、缓存雪崩预防、为什么 Cache Aside 删除而不是更新缓存） |
| **预估字数** | ~4000 字 |

### 子任务 5：异步处理
| 项目 | 内容 |
|------|------|
| **文件** | `wiki-docs/docs/high-concurrency/design-patterns/async.md` |
| **内容** | MQ削峰原理与设计、CompletableFuture 异步编排（allOf/anyOf/thenCombine）、响应式编程（背压）、请求合并 |
| **面试题** | 6 道（MQ削峰原理、allOf vs anyOf 区别、thenApply vs thenAccept、异步一定比同步快吗、背压原理、请求合并优缺点） |
| **预估字数** | ~3000 字 |

### 子任务 6：秒杀系统
| 项目 | 内容 |
|------|------|
| **文件** | `wiki-docs/docs/high-concurrency/system-design/seckill.md` |
| **内容** | 需求分析（QPS估算）、架构演进（单体→缓存→Redis+MQ）、库存预热、Redis+Lua 原子扣减、MQ 异步下单、多层限流防刷、完整架构图 |
| **面试题** | 6 道（超卖原因与防止、库存预热必要性、Lua 脚本原子性、异步下单优劣、分层限流思路、热点 Key 分片） |
| **预估字数** | ~3500 字 |

### 子任务 7：短链接系统
| 项目 | 内容 |
|------|------|
| **文件** | `wiki-docs/docs/high-concurrency/system-design/short-url.md` |
| **内容** | 需求分析（容量估算）、发号器方案（Snowflake/号段模式）、Base62 编码、布隆过滤器防穿透、301 vs 302 重定向选择、分库分表设计、缓存设计 |
| **面试题** | 6 道（发号器 vs 哈希、Base62 vs Base64、布隆过滤器作用、301 vs 302 选型、哈希分片 vs 范围分片、防爬虫） |
| **预估字数** | ~3000 字 |

### 子任务 8：IM 系统
| 项目 | 内容 |
|------|------|
| **文件** | `wiki-docs/docs/high-concurrency/system-design/im.md` |
| **内容** | WebSocket 长连接与心跳保活、消息可靠投递（三次握手+ACK）、已读未读设计、群聊扩散（写扩散 vs 读扩散）、多端同步、在线用户路由 |
| **面试题** | 6 道（WebSocket vs 轮询、心跳机制设计、消息不丢方案、写扩散 vs 读扩散、已读未读设计、百万连接扩展） |
| **预估字数** | ~3500 字 |

### 子任务 9：Feed 流系统
| 项目 | 内容 |
|------|------|
| **文件** | `wiki-docs/docs/high-concurrency/system-design/feed.md` |
| **内容** | 拉模式/推模式/推拉结合三种方案对比、关注关系存储（Redis Set）、Timeline vs 热度排序、游标分页方案、推拉结合实战架构 |
| **面试题** | 6 道（三种模式区别、Timeline 概念、游标分页 vs offset、时间戳相同处理、大V推模式问题、实时性保证） |
| **预估字数** | ~3000 字 |

---

## 三、执行顺序

按依赖关系排列，共 9 个子任务：

```
1. design-patterns/index.md      → 总览先行
2. design-patterns/rate-limiter.md
3. design-patterns/circuit-breaker.md
4. design-patterns/caching.md
5. design-patterns/async.md
6. system-design/seckill.md
7. system-design/short-url.md
8. system-design/im.md
9. system-design/feed.md
```

每个子任务独立，完成一个即可验证，无需等待全部完成。

---

## 四、格式规范

### 页面结构模板
```markdown
# 标题

创建日期：YYYY-MM-DD

## 问题背景
...

## 核心原理（含 mermaid 图、对比表格）
...

## 代码示例 / 框架实践
...

## 经典高频面试题

### Q1：题目
**参考答案：**
...

### Q2：题目
**参考答案：**
...
（至少 5 题）
```

### VitePress 容器语法
- `::: tip` / `::: warning` / `::: danger` / `::: info` / `::: details`

### 要求
- 每个页面末尾至少 5 道面试题 + 正确答案
- 关键流程使用 mermaid 图表
- 包含方案对比表格
- 包含关键代码示例（Java 伪代码 / 核心片段）

---

## 五、验收标准

- [ ] 9 个页面全部创建完成，路径正确
- [ ] 每个页面末尾包含 ≥5 道面试题并给出正确答案
- [ ] 本地 `npx vitepress dev` 可正常渲染，链接正确
- [ ] 内容深度：不仅讲概念，还讲原理、选型、优缺点、坑点
- [ ] 所有文件均在项目路径内（`wiki-docs/docs/high-concurrency/`）

---

## 六、总结

| 维度 | 数据 |
|------|------|
| 子任务数 | 9 个 |
| 总字数 | ~26000 字 |
| 面试题总数 | ≥50 道 |
| 涉及框架 | Sentinel、Resilience4j、Guava、Redis、Kafka、WebSocket、Redisson |
| 预计效果 | 完整覆盖高并发面试全部核心考点 |