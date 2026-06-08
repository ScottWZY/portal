# 网络与服务器知识体系 — 完整补充计划

> 创建日期：2026-06-08
> 项目：面试准备 Wiki / wiki-docs
> 目标：基于现有覆盖，补充网络和服务器相关专题，完善知识面的全面性

---

## 一、任务概述

### 1.1 背景

当前面试准备 Wiki 已覆盖：
- 算法与数据结构
- Java 高级特性
- Spring 生态
- 数据库（关系型、NoSQL、搜索引擎、国产数据库）
- 中间件（消息队列、注册中心、RPC）
- 高并发架构
- AI 应用（RAG、Agent）
- 前端知识体系
- 工程算法专题

**现状**：
- 计算机网络：完全缺失，仅有零散知识点
- 操作系统：完全缺失
- Linux/服务器运维：仅有规划，未展开
- 安全知识：分散在三个模块，缺少统一体系
- 部分重要模块（测试、软件工程）尚未覆盖

### 1.2 目标

补充网络和服务器相关知识专题，并从知识面全面性角度梳理完整的缺失模块清单，最终形成可执行的实施计划。

### 1.3 约束条件

- 遵循现有 Wiki 格式规范（每个页面开头有「⭐ 面试重点速览」表格）
- 每个页面末尾包含 ≥5 道高频面试题 + 标准答案
- 与现有模块交叉引用，避免内容重复
- 所有文件操作均在项目路径 `wiki-docs/docs/` 内
- 严格遵循 SDLC 流程约束，保存在正确文档目录

---

## 二、当前覆盖情况分析

| 知识领域 | 当前状态 | 缺失程度 | 面试权重 |
|----------|----------|----------|----------|
| 计算机网络 | 完全缺失 | 100% | 极高（三大必考之一） |
| 操作系统原理 | 完全缺失 | 100% | 高 |
| Linux/服务器运维 | 仅有规划未展开 | 95% | 高 |
| 安全（通用知识） | 分散在三处，缺少体系 | 80% | 高 |
| 软件测试 | 完全缺失 | 100% | 中高 |
| 软件工程与编码规范 | 缺失设计原则/重构/CR | 90% | 中高 |
| 微服务方法论 | 仅有技术实现，缺少方法论 | 70% | 高 |
| 云原生（Docker/K8s） | 仅有规划未展开 | 90% | 中 |
| 大数据基础 | 完全缺失 | 100% | 中（场景相关） |
| 技术管理 | 完全缺失 | 100% | 低（P7+） |

---

## 三、完整补充计划（按优先级）

### 🔴 P0 — 面试高频必考，必须优先补充

#### P0-1：计算机网络 / computer-network（新建独立模块）

**路径**：`wiki-docs/docs/computer-network/`

**模块说明**：计算机网络是后端面试"三大基础"之一（Java基础、数据库、计算机网络），目前完全缺失。必须独立成模块系统化覆盖。

**与现有模块关系**：
- 与 `java-advanced/io-nio/` 互补：IO 模型、零拷贝、Netty 交叉引用
- 与 `frontend/browser/` 互补：HTTP 缓存、HTTP 版本对比、CORS 交叉引用
- 与 `high-concurrency/security/` 互补：DDoS/TLS 已经在网络安全覆盖，本模块侧重协议原理
- 与 `high-concurrency/architecture-scaling/` 互补：负载均衡 L4 vs L7 交叉引用

**页面规划**（共 12 页）：

| 子目录 | 文件名 | 核心内容 | 预估字数 | 面试题数 |
|--------|--------|----------|----------|----------|
| fundamentals/ | `index.md` | OSI 七层 vs TCP/IP 四层、各层协议与设备、学习路径 | ~2000 | 5 |
| fundamentals/ | `tcp.md` | TCP 三次握手/四次挥手、状态转换图、TIME_WAIT 为什么要等 2MSL、KeepAlive | ~3000 | 6 |
| fundamentals/ | `tcp-congestion.md` | 流量控制、拥塞控制（慢启动/拥塞避免/快重传/快恢复）、BBR 算法简介 | ~3000 | 6 |
| fundamentals/ | `udp.md` | UDP 特点、与 TCP 对比、应用场景、QUIC 协议简介 | ~2000 | 5 |
| application/ | `index.md` | 应用层协议总览 | ~1000 | - |
| application/ | `http.md` | HTTP 0.9/1.0/1.1/2/3 演进、队头阻塞、多路复用、头部压缩、缓存控制 | ~3500 | 6 |
| application/ | `https-tls.md` | HTTPS 完整握手流程、证书链、CA 体系、双向认证、TLS 1.2 vs 1.3 优化 | ~3500 | 6 |
| application/ | `dns.md` | DNS 递归查询过程、本地缓存/DNS 服务器、DNS 负载均衡、HTTPDNS、污染/劫持 | ~2500 | 6 |
| application/ | `websocket.md` | WebSocket 握手、帧结构、长连接保活、与 HTTP 对比、心跳 | ~2000 | 5 |
| programming/ | `socket.md` | Socket 编程模型、TCP/UDP Socket 示例、拆包粘包原因与解决 | ~2500 | 5 |
| programming/ | `io-models.md` | 阻塞/非阻塞、IO 多路复用（select/poll/epoll）、水平/边缘触发、Reactor/Proactor | ~3000 | 6 |
| optimization/ | `cdn.md` | CDN 工作原理、回源流程、缓存策略、预热、防盗链 | ~2000 | 5 |

**侧边栏配置**：
```js
'/computer-network/': [
  {
    text: '网络基础',
    collapsed: false,
    items: [
      { text: '网络基础总览', link: '/computer-network/fundamentals/' },
      { text: 'TCP 协议', link: '/computer-network/fundamentals/tcp' },
      { text: 'TCP 拥塞控制', link: '/computer-network/fundamentals/tcp-congestion' },
      { text: 'UDP 协议', link: '/computer-network/fundamentals/udp' },
    ],
  },
  {
    text: '应用层协议',
    collapsed: false,
    items: [
      { text: '应用层总览', link: '/computer-network/application/' },
      { text: 'HTTP 协议', link: '/computer-network/application/http' },
      { text: 'HTTPS 与 TLS', link: '/computer-network/application/https-tls' },
      { text: 'DNS 解析', link: '/computer-network/application/dns' },
      { text: 'WebSocket', link: '/computer-network/application/websocket' },
    ],
  },
  {
    text: '网络编程',
    collapsed: false,
    items: [
      { text: 'Socket 编程', link: '/computer-network/programming/socket' },
      { text: 'IO 模型', link: '/computer-network/programming/io-models' },
    ],
  },
  {
    text: '网络优化',
    collapsed: false,
    items: [
      { text: 'CDN 加速', link: '/computer-network/optimization/cdn' },
    ],
  },
],
```

---

#### P0-2：操作系统 / operating-system（新建独立模块）

**路径**：`wiki-docs/docs/operating-system/`

**模块说明**：操作系统是理解并发、IO、内存管理的底层基础。面试中进程线程区别、内存管理、IO 模型等都是高频考点。

**与现有模块关系**：
- 与 `java-advanced/jvm/` 互补：JVM 内存模型 vs OS 虚拟内存
- 与 `java-advanced/concurrency/` 互补：Java 线程映射到 OS 线程
- 与 `java-advanced/io-nio/` 互补：Java NIO 底层依赖 OS IO 多路复用
- 与 `computer-network/programming/` 互补：网络 IO 模型依赖 OS 支持

**页面规划**（共 8 页）：

| 子目录 | 文件名 | 核心内容 | 预估字数 | 面试题数 |
|--------|--------|----------|----------|----------|
| process-thread/ | `index.md` | 进程 vs 线程、上下文切换、用户态 vs 内核态、并发 vs 并行 | ~2000 | 5 |
| process-thread/ | `ipc.md` | 进程间通信：管道/消息队列/共享内存/信号量/Socket、对比 | ~2500 | 6 |
| process-thread/ | `sync.md` | 同步互斥：互斥锁/自旋锁/读写锁/条件变量、死锁四个条件与预防/避免/检测/解除 | ~3000 | 6 |
| memory/ | `index.md` | 虚拟内存、分页/分段、页表、TLB、缺页中断、交换空间 | ~3000 | 6 |
| memory/ | `allocation.md` | 内存分配算法：首次适应/最佳适应/伙伴系统、slab 分配器 | ~2000 | 5 |
| filesystem/ | `index.md` | 文件系统原理、inode、硬链接/软链接、VFS 虚拟文件系统 | ~2000 | 5 |
| io/ | `index.md` | IO 模型、零拷贝（sendfile/mmap）、直接IO vs 缓存IO | ~2500 | 6 |
| scheduling/ | `index.md` | 进程调度算法、CFS 完全公平调度、CPU 亲和性 | ~2000 | 5 |

---

#### P0-3：Linux/服务器运维 / devops/linux（扩展现有 devops 模块）

**路径**：`wiki-docs/docs/devops/linux/`

**模块说明**：Linux 是后端工程师日常工作环境，面试中常用命令、性能分析、线上排障都是高频考点。devops/index.md 已有规划但未展开。

**页面规划**（共 7 页）：

| 文件名 | 核心内容 | 预估字数 | 面试题数 |
|--------|----------|----------|----------|
| `index.md` | Linux 学习路径、常用工具生态 | ~1000 | - |
| `common-commands.md` | 文本处理三剑客（grep/sed/awk）、find/xargs、管道与重定向、常用快捷键 | ~2500 | 5 |
| `process-management.md` | ps/top/htop、进程状态、kill 信号、nohup & systemd 服务管理 | ~2000 | 5 |
| `disk-io.md` | df/du/iostat/iotop/lsof、磁盘挂载、fstab、inode 耗尽排查 | ~2000 | 5 |
| `network-troubleshooting.md` | netstat/ss/tcpdump/curl/wget/iptables、网络排障流程 | ~2500 | 6 |
| `performance-analysis.md` | CPU（pidstat/mpstat）、内存（free/vmstat）、综合工具（perf/bcc/ebpf）、top 输出各项含义 | ~3000 | 6 |
| `system-tuning.md` | 内核参数调优（sysctl.conf）、文件描述符限制、TCP 参数优化（backlog/tw_reuse） | ~2500 | 5 |

---

#### P0-4：安全 / security（新建独立模块，整合现有内容）

**路径**：`wiki-docs/docs/security/`

**模块说明**：安全知识目前分散在：
- `spring-ecosystem/spring-security/` — 仅框架实现
- `high-concurrency/security/` — 仅网络层 DDoS/TLS
- `frontend/security/` — 仅前端 XSS/CSRF

缺少**通用安全知识体系**，需要新建独立模块作为总入口，补充加密基础、认证授权、OWASP 等内容，通过交叉引用链接到现有模块。

**页面规划**（共 8 页）：

| 子目录 | 文件名 | 核心内容 | 预估字数 | 面试题数 |
|--------|--------|----------|----------|----------|
| fundamentals/ | `index.md` | 安全三要素（CIA）、纵深防御、最小权限原则、知识体系 | ~1500 | 5 |
| fundamentals/ | `cryptography.md` | 对称加密（AES/ChaCha20）、非对称加密（RSA/ECC）、哈希（SHA-2/BCrypt）、数字签名、证书 | ~3000 | 6 |
| fundamentals/ | `auth.md` | 认证 vs 授权、Session-Cookie、JWT 结构/签名/刷新、OAuth2.0 四种模式、SSO 单点登录 | ~3500 | 6 |
| fundamentals/ | `mtls.md` | 双向认证、证书固定、应用场景 | ~1500 | 5 |
| web/ | `owasp-top10.md` | OWASP Top 10：注入/XSS/CSRF/SSRF/文件上传/反序列化，每种攻击原理+防御 | ~3000 | 6 |
| web/ | `secure-coding.md` | 输入校验、输出编码、参数化查询、最小权限、安全配置、敏感数据保护 | ~2500 | 5 |
| web/ | `api-security.md` | API 签名（HMAC）、防重放（Timestamp+Nonce）、频率限制、敏感数据脱敏 | ~2000 | 5 |
| architecture/ | `zero-trust.md` | 零信任架构、Never trust always verify、服务间认证（mTLS/JWT） | ~2000 | 5 |

**侧边栏配置**：
```js
'/security/': [
  {
    text: '安全基础',
    collapsed: false,
    items: [
      { text: '安全基础总览', link: '/security/fundamentals/' },
      { text: '密码学基础', link: '/security/fundamentals/cryptography' },
      { text: '认证与授权', link: '/security/fundamentals/auth' },
      { text: '双向认证', link: '/security/fundamentals/mtls' },
    ],
  },
  {
    text: 'Web 安全',
    collapsed: false,
    items: [
      { text: 'OWASP Top 10', link: '/security/web/owasp-top10' },
      { text: '安全编码', link: '/security/web/secure-coding' },
      { text: 'API 安全', link: '/security/web/api-security' },
    ],
  },
  {
    text: '架构安全',
    collapsed: false,
    items: [
      { text: '零信任架构', link: '/security/architecture/zero-trust' },
    ],
  },
],
```

---

### 🟡 P1 — 重要考点，进阶补充

#### P1-1：软件测试 / software-testing（新建独立模块）

**路径**：`wiki-docs/docs/software-testing/`

**模块说明**：测试能力是高级工程师工程素养的体现，面试中常问单元测试策略、Mock、TDD 等。

**页面规划**（共 5 页）：

| 文件名 | 核心内容 | 预估字数 | 面试题数 |
|--------|----------|----------|----------|
| `index.md` | 测试金字塔、测试策略、测试覆盖率、质量保障 | ~2000 | 5 |
| `unit-testing.md` | JUnit 5、Mockito、PowerMock、测试替身（Stub/Mock/Fake/Spy）、F.I.R.S.T 原则 | ~3000 | 6 |
| `integration-testing.md` | Spring Boot Test、TestContainers、数据库测试策略 | ~2500 | 5 |
| `tdd.md` | TDD 红-绿-重构循环、BDD 简介、TDD 优缺点 | ~2000 | 5 |
| `contract-testing.md` | 消费者驱动契约测试（Pact）、API 兼容性验证 | ~2000 | 5 |

---

#### P1-2：软件工程 / software-engineering（新建独立模块）

**路径**：`wiki-docs/docs/software-engineering/`

**模块说明**：编码规范、设计原则、重构、Code Review 是高级工程师基本素养，面试中常通过项目深挖考察。

**页面规划**（共 5 页）：

| 文件名 | 核心内容 | 预估字数 | 面试题数 |
|--------|----------|----------|----------|
| `index.md` | 软件工程全貌、质量属性（可维护/可扩展/可测试） | ~1500 | 5 |
| `design-principles.md` | SOLID 五大原则、DRY/KISS/YAGNI、高内聚低耦合 | ~3000 | 6 |
| `code-quality.md` | 代码坏味道、重构手法、Clean Code 实践 | ~2500 | 5 |
| `code-review.md` | Code Review 最佳实践、审查清单、文化建立 | ~2000 | 5 |
| `agile.md` | 敏捷开发、Scrum/Kanban、用户故事、持续改进 | ~1500 | 5 |

---

#### P1-3：微服务架构方法论 / spring-ecosystem/microservice-methodology（扩展 Spring 生态）

**路径**：`wiki-docs/docs/spring-ecosystem/microservice-methodology/`

**模块说明**：目前 Spring Cloud 只有技术实现，缺少**独立的方法论视角**：服务拆分、DDD、API 设计、治理等。放在 spring-ecosystem 下与 Spring Cloud 技术实现形成互补。

**页面规划**（共 5 页）：

| 文件名 | 核心内容 | 预估字数 | 面试题数 |
|--------|----------|----------|----------|
| `index.md` | 微服务架构全景、优缺点、适用场景、演进历程 | ~2000 | 5 |
| `service-split.md` | 服务拆分原则、DDD 限界上下文、拆分维度、服务粒度 | ~3000 | 6 |
| `api-design.md` | RESTful 设计规范、API 版本管理、向后兼容、错误码设计 | ~2500 | 6 |
| `governance.md` | 服务治理（注册发现/配置管理/流量管理）、服务网格简介 | ~2000 | 5 |
| `observability.md` | 微服务可观测性、日志聚合/分布式追踪/指标监控 | ~2000 | 5 |

---

### 🟢 P2 — 锦上添花，按需补充

#### P2-1：云原生 / devops（扩展现有 devops 模块）

**路径**：`wiki-docs/docs/devops/`

**页面规划**（新增 5 页）：

| 文件名 | 核心内容 | 预估字数 | 面试题数 |
|--------|----------|----------|----------|
| `docker-core.md` | Docker 核心原理、Dockerfile 最佳实践、多阶段构建、镜像优化 | ~2500 | 6 |
| `docker-network.md` | Docker 网络模型（bridge/host/overlay）、容器互联 | ~1500 | 5 |
| `k8s-core.md` | Pod/Deployment/Service/Ingress 核心概念、kube-proxy 原理 | ~3000 | 6 |
| `k8s-advanced.md` | HPA/StatefulSet/ConfigMap/Secret/PV-PVC | ~2500 | 5 |
| `cicd-pipeline.md` | GitHub Actions/Jenkins Pipeline、Harbor 镜像仓库、流水线设计 | ~2500 | 5 |

---

#### P2-2：大数据基础 / big-data（新建独立模块）

**路径**：`wiki-docs/docs/big-data/`

**适用场景**：面向大数据岗位、数据量大的业务场景面试。非通用后端必考。

**页面规划**（共 4 页）：

| 文件名 | 核心内容 | 预估字数 | 面试题数 |
|--------|----------|----------|----------|
| `index.md` | 大数据生态总览、OLTP vs OLAP | ~1500 | 5 |
| `hadoop-ecosystem.md` | HDFS/MapReduce/YARN 核心原理 | ~2000 | 5 |
| `spark-core.md` | RDD/DataFrame/Dataset、Spark 架构、宽依赖窄依赖、Shuffle | ~2500 | 6 |
| `flink-core.md` | 流处理概念、Event Time/Watermark/Checkpoint、窗口 | ~2500 | 5 |

---

#### P2-3：技术管理 / tech-management（新建独立模块）

**路径**：`wiki-docs/docs/tech-management/`

**适用场景**：面向 P7+/技术专家/管理岗面试。

**页面规划**（共 3 页）：

| 文件名 | 核心内容 | 预估字数 | 面试题数 |
|--------|----------|----------|----------|
| `index.md` | 技术管理者的角色认知、核心职责 | ~1000 | 5 |
| `technical-design.md` | 技术方案设计、技术选型、架构评审、技术文档写作 | ~2000 | 5 |
| `team-management.md` | 技术规划、技术债管理、新人培养、跨团队协作 | ~2000 | 5 |

---

## 四、执行顺序

按优先级分批次推进：

```
第一批（P0，必须先做）：
  P0-1: computer-network (12页)
    fundamentals/index → tcp → tcp-congestion → udp
    application/index → http → https-tls → dns → websocket
    programming/socket → io-models
    optimization/cdn

  P0-2: operating-system (8页)
    process-thread/index → ipc → sync
    memory/index → allocation
    filesystem → io → scheduling

  P0-3: devops/linux (7页)
    index → common-commands → process-management → disk-io → network-troubleshooting → performance-analysis → system-tuning

  P0-4: security (8页)
    fundamentals/index → cryptography → auth → mtls
    web/owasp-top10 → secure-coding → api-security
    architecture/zero-trust

第二批（P1，P0 完成后）：
  P1-1: software-testing (5页)
  P1-2: software-engineering (5页)
  P1-3: spring-ecosystem/microservice-methodology (5页)

第三批（P2，按需推进）：
  P2-1: devops 云原生扩展 (5页)
  P2-2: big-data (4页)
  P2-3: tech-management (3页)
```

同一批次内可以并行推进多个子任务。

---

## 五、需要修改的现有文件

| 文件 | 修改内容 |
|------|----------|
| `wiki-docs/docs/.vitepress/config.js` | 新增 `/computer-network/`、`/operating-system/`、`/security/`、`/software-testing/`、`/software-engineering/`、`/big-data/`、`/tech-management/` 侧边栏配置；扩展 `/devops/` 侧边栏新增 linux 和云原生页面；扩展 `/spring-ecosystem/` 新增 microservice-methodology |
| `wiki-docs/docs/guide/roadmap.md` | 知识图谱 mermaid 新增上述模块节点 |
| `wiki-docs/docs/guide/index.md` | 学习导航表格新增上述模块，更新预计学习时间 |
| `wiki-docs/index.md` | 首页导航确认包含新模块入口 |

---

## 六、遵循的格式规范

沿用现有 Wiki 统一模板：

```markdown
# 页面标题

## ⭐ 面试重点速览

| 考察点 | 重要程度 | 面试频率 | 掌握目标 |
|--------|----------|----------|----------|
| xxx | ⭐⭐⭐ | 极高 | 理解原理，能口述完整流程 |

---

## 一、问题背景

...

## 二、核心原理

（含 mermaid 流程图、对比表格）

---

## 三、xxx

...

## 经典高频面试题

### Q1：xxx
**参考答案：**
...

（至少 5 题）
```

**关键要求：**
- 每个页面开头必须有「⭐ 面试重点速览」表格
- 使用 `---` 分隔大章节
- 关键流程使用 mermaid 图表
- 使用 VitePress 提示块 (`::: tip` / `::: warning` / `::: danger`)
- 代码示例注明语言类型
- 与现有模块交叉引用，避免重复内容

---

## 七、验收标准

- [ ] 所有规划页面全部创建，目录结构正确
- [ ] 每个页面末尾包含 ≥5 道高频面试题 + 完整标准答案
- [ ] 侧边栏配置更新完成，所有链接可正常跳转
- [ ] `guide/roadmap.md` 和 `guide/index.md` 更新完成
- [ ] 本地 `npx vitepress dev docs` 可正常渲染
- [ ] 与现有模块交叉引用正确，无内容重复
- [ ] 所有文件都在项目路径内，符合开发约束

---

## 八、总结

### 8.1 新增模块统计

| 优先级 | 模块名称 | 新增页面数 |
|--------|----------|------------|
| P0 | 计算机网络 | 12 |
| P0 | 操作系统 | 8 |
| P0 | Linux/服务器运维（devops 扩展） | 7 |
| P0 | 安全 | 8 |
| P1 | 软件测试 | 5 |
| P1 | 软件工程 | 5 |
| P1 | 微服务方法论（Spring 扩展） | 5 |
| P2 | 云原生（devops 扩展） | 5 |
| P2 | 大数据基础 | 4 |
| P2 | 技术管理 | 3 |
| **总计** | **10 个模块（7 新建 + 3 扩展）** | **62 页** |

### 8.2 知识体系完整度

完成本次补充后，面试准备 Wiki 的知识领域覆盖：

| 知识领域 | 覆盖情况 |
|----------|----------|
| 学习导航与计划 | ✅ 完整 |
| Java 高级特性 | ✅ 完整 |
| Spring 生态 | ✅ 完整 |
| 数据库全品类 | ✅ 完整 |
| 中间件 | ✅ 完整 |
| 高并发架构 | ✅ 完整 |
| AI 应用开发 | ✅ 完整 |
| 算法专题（含工程算法） | ✅ 完整 |
| 前端高级 | ✅ 完整 |
| **计算机网络** | ⏳ 待补充 |
| **操作系统** | ⏳ 待补充 |
| **Linux/服务器运维** | ⏳ 待补充 |
| **安全体系** | ⏳ 待补充 |
| **软件测试** | ⏳ 待补充 |
| **软件工程** | ⏳ 待补充 |
| **微服务方法论** | ⏳ 待补充 |
| DevOps/云原生 | ⏳ 待扩展 |
| 大数据基础 | ⏳ 可选补充 |
| 技术管理 | ⏳ 可选补充 |

**覆盖度提升**：从约 65% → 约 95%（核心基础知识全覆盖）

### 8.3 优先级建议

- **如果时间有限，只做 P0 即可**：计算机网络、操作系统、Linux、安全 这四个模块覆盖了面试中 80% 的基础知识盲区，是及格线必须过的坎
- P1 是高级工程师加分项，能拉开与普通候选人的差距
- P2 是进阶内容，根据目标岗位选择性补充

---

## 九、需求文档（保存到 docs/requirements）

根据开发约束，本计划对应的需求文档将保存在：
`docs/requirements/network-server-knowledge-complete-plan-20260608.md`
