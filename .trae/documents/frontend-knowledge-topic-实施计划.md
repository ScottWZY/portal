# 前端知识专题 — 实施计划

> **创建日期：** 2026-06-07  
> **目标：** 将 `frontend/` 模块从 1 个概览文件扩展为完整的前端高级知识体系  
> **关联模块：** docs/frontend/、docs/guide/、docs/.vitepress/config.js

---

## 一、需求概述

### 1.1 背景

当前 `frontend/` 模块仅有 1 个 `index.md`（约 96 行），定位为"后端开发者的前端补充"，内容停留在概念级描述，无子模块文档。而项目其他模块（如 `java-advanced/` 24 文件、`ai-application/` 48 文件）均已完成深度建设。前端模块是明显的薄弱环节。

### 1.2 用户需求

在 AI 快速发展的背景下，全栈能力成为开发岗的必备要求。需要构建一个系统化的前端知识专题，覆盖：

| 序号 | 需求维度 | 具体要求 |
|------|----------|----------|
| 1 | 基础核心 | HTML、CSS、JavaScript、TypeScript |
| 2 | 工程化 | 工程化知识、工程化思维、SEO 领域知识 |
| 3 | 流行框架 | Vue 及周边配套框架 |
| 4 | Vue 基础 | Vue 基础知识体系 |
| 5 | 优化能力 | 前端优化能力、SEO 能力 |
| 6 | 面试题 | 前端经典高频知识、面试题 |

### 1.3 成功标准

- [x] `frontend/` 目录下新增 7 个子目录 + 1 个嵌套子目录，共约 45 个 `.md` 文件
- [x] 每个文件采用与现有模块一致的格式（面试重点速览表格、mermaid 图表、代码示例）
- [x] 更新 `config.js` 侧边栏配置，移除旧的 Vue 3 占位条目，替换为完整的新分组
- [x] 更新 `frontend/index.md`，从"后端补充"定位升级为"高级前端面试准备"
- [x] 更新 `guide/roadmap.md` 前端知识域图谱，体现新增的子模块
- [x] 更新 `guide/index.md` 学习导航表，反映前端模块的新定位
- [x] 在顶部导航栏中增加"前端"入口（如尚未添加）

---

## 二、当前状态分析

### 2.1 现有文件

| 文件 | 路径 | 状态 |
|------|------|------|
| 前端概览 | `wiki-docs/docs/frontend/index.md` | 存在，96 行，定位为后端补充 |
| 侧边栏配置 | `wiki-docs/docs/.vitepress/config.js` L451-463 | 仅有 1 个 Vue 3 分组（4 个占位链接，文件不存在） |
| 知识图谱 | `wiki-docs/docs/guide/roadmap.md` L120-131 | 前端域仅 3 个节点（Vue3/React/前端工程化） |
| 学习导航 | `wiki-docs/docs/guide/index.md` L28 | 前端标注为"Vue 3 核心（辅助）" |

### 2.2 现有模块参考

参考 `java-advanced/`（5 子目录、24 文件）和 `ai-application/`（12 子目录、48 文件）的规模和格式，前端模块规划为 **8 个子目录、约 45 个文件**，规模适中。

---

## 三、实施计划

### 阶段一：目录结构搭建

**目的：** 创建所有必要的目录和空的 `index.md` 占位文件，确保后续内容填充有明确的目标。

**操作：**
1. 创建以下目录结构（在 `wiki-docs/docs/frontend/` 下）：

```
fundamentals/          # 前端基础
vue-ecosystem/         # Vue 3 生态
react-ecosystem/       # React 生态
engineering/           # 前端工程化
engineering/build-tools/  # 构建工具（嵌套子目录）
browser/               # 浏览器原理
performance/           # 性能优化与 SEO
security/              # 前端安全
interview/             # 面试高频考点
```

2. 为每个目录创建 `index.md` 占位文件（后续阶段填充内容）

**输出：** 9 个目录 + 9 个 `index.md` 占位文件

---

### 阶段二：前端基础模块（fundamentals/）

**目的：** 构建 HTML/CSS/JS/TS 核心知识文档，覆盖用户需求第 1 点。

**文件清单：**

| 文件 | 核心内容 | 面试频率 |
|------|----------|----------|
| `fundamentals/index.md` | 前端基础概览、学习路径 | - |
| `fundamentals/html-css.md` | 语义化标签、Flexbox/Grid 布局、BFC、盒模型、响应式设计、CSS 新特性（Container Queries、`:has()`） | 高 |
| `fundamentals/javascript-core.md` | 原型链与继承、闭包、this 指向、作用域链、深浅拷贝 | **极高** |
| `fundamentals/es6-plus.md` | let/const、箭头函数、解构、模块化（ESM vs CJS）、Promise/async-await、Optional Chaining | **极高** |
| `fundamentals/typescript.md` | 类型系统（interface vs type）、泛型、工具类型（Partial/Pick/Omit）、枚举、TS 5.5+ 新特性 | **极高** |

**格式规范：** 每个文件开头包含 `## ⭐ 面试重点速览` 表格，正文使用 `---` 分隔章节，关键概念配合代码示例。

---

### 阶段三：Vue 3 生态模块（vue-ecosystem/）

**目的：** 覆盖用户需求第 3、4 点（Vue 及周边框架、Vue 基础知识）。

**文件清单：**

| 文件 | 核心内容 | 面试频率 |
|------|----------|----------|
| `vue-ecosystem/index.md` | Vue 3 生态全景、版本演进 | - |
| `vue-ecosystem/reactivity.md` | Vue2 Object.defineProperty vs Vue3 Proxy、依赖收集（track/trigger）、effectScope | **极高** |
| `vue-ecosystem/composition-api.md` | setup/reactive/ref/computed/watch、生命周期、自定义 Hook、与 Options API 对比 | **极高** |
| `vue-ecosystem/pinia.md` | Pinia vs Vuex、模块化设计、状态持久化、DevTools | 高 |
| `vue-ecosystem/vue-router.md` | 动态路由、导航守卫、路由懒加载、hash vs history | 高 |
| `vue-ecosystem/vapor-mode.md` | Vapor Mode 设计理念、无虚拟 DOM、编译优化、性能对比 | 中高 |
| `vue-ecosystem/nuxt.md` | Nuxt 3/4、SSR vs SSG、自动导入、全栈开发 | 中 |

---

### 阶段四：React 生态模块（react-ecosystem/）

**目的：** 作为 Vue 的对比参考，覆盖 React 核心概念和最新发展（React 19）。

**文件清单：**

| 文件 | 核心内容 | 面试频率 |
|------|----------|----------|
| `react-ecosystem/index.md` | React 演进、与 Vue 设计哲学对比 | - |
| `react-ecosystem/hooks.md` | useState/useEffect/useMemo/useCallback/useRef、自定义 Hooks、依赖陷阱 | **极高** |
| `react-ecosystem/concurrent-rendering.md` | Fiber 架构、时间分片、优先级调度、useTransition/useDeferredValue | **极高** |
| `react-ecosystem/react-19-features.md` | Actions API、RSC 稳定版、useFormStatus/useOptimistic/useActionState、编译器自动 memo | **极高** |
| `react-ecosystem/state-management.md` | Context API vs Redux vs Zustand vs Jotai、不可变数据与 Immer | 高 |
| `react-ecosystem/nextjs.md` | Next.js 15 App Router、RSC vs Client Components、SSG/SSR/ISR、Turbopack | 高 |

---

### 阶段五：前端工程化模块（engineering/）

**目的：** 覆盖用户需求第 2 点（工程化知识、工程化思维）。

**文件清单：**

| 文件 | 核心内容 | 面试频率 |
|------|----------|----------|
| `engineering/index.md` | 工程化定义、全链路体系 | - |
| `engineering/package-manager.md` | npm/yarn/pnpm 对比、hoisting 原理、lockfile、Monorepo（pnpm workspace + Turborepo） | 高 |
| `engineering/build-tools/index.md` | Vite 6 vs Turbopack vs Rspack 全方位对比 | 高 |
| `engineering/build-tools/vite6.md` | Vite 双引擎架构、ESM 按需编译、Rolldown Rust 引擎、模块联邦、插件机制 | **极高** |
| `engineering/build-tools/turbopack.md` | Rust 增量计算、函数级缓存、Next.js 集成 | 中高 |
| `engineering/build-tools/rspack.md` | Webpack 兼容、Rust 核心、5-10 倍提速、迁移成本 | 中高 |
| `engineering/code-standards.md` | ESLint 原理、Prettier、Husky + lint-staged、commitlint | 高 |
| `engineering/micro-frontends.md` | 微前端架构、qiankun、single-spa、模块联邦（Module Federation） | 中 |
| `engineering/ci-cd.md` | 前端 CI/CD 流程、GitHub Actions、自动化检查→构建→部署 | 中 |

---

### 阶段六：浏览器原理模块（browser/）

**目的：** 深入理解前端运行环境，支撑性能优化和安全防护。

**文件清单：**

| 文件 | 核心内容 | 面试频率 |
|------|----------|----------|
| `browser/index.md` | 浏览器多进程架构、渲染进程主线程 | - |
| `browser/rendering.md` | DOM→CSSOM→Render Tree→Layout→Paint、重绘/重排/回流、合成层、GPU 加速 | **极高** |
| `browser/event-loop.md` | 宏任务/微任务、执行顺序、与 Node.js Event Loop 区别 | **极高** |
| `browser/http-cache.md` | 强缓存（Cache-Control/Expires）、协商缓存（ETag/Last-Modified）、缓存策略 | **极高** |
| `browser/wasm-webgpu.md` | WebAssembly 概念、WASI 1.0、WebGPU 调用 GPU 算力、AI/可视化场景 | 中 |

---

### 阶段七：性能优化与 SEO 模块（performance/）

**目的：** 覆盖用户需求第 5 点（前端优化能力、SEO 能力）。

**文件清单：**

| 文件 | 核心内容 | 面试频率 |
|------|----------|----------|
| `performance/index.md` | 性能优化维度、指标体系 | - |
| `performance/core-web-vitals.md` | Google 核心网页指标、LCP（最大内容绘制）、CLS（累积布局偏移）、INP（交互响应，已替换 FID） | **极高** |
| `performance/optimization-strategies.md` | 加载/运行时/构建/传输 四大维度全景 | **极高** |
| `performance/loading-optimization.md` | 图片懒加载、代码分割 Tree Shaking、路由懒加载、CDN、gzip/Brotli 压缩、资源预加载 | 高 |
| `performance/runtime-optimization.md` | 虚拟列表实现、防抖节流、事件委托、内存泄漏避免、DOM 操作优化 | **极高** |
| `performance/seo.md` | SEO 基础、meta 标签、sitemap、SSR/SSG 对 SEO 的优势、搜索引擎抓取原理 | 高 |

---

### 阶段八：前端安全模块（security/）

**目的：** 覆盖前端安全高频考点（XSS、CSRF 等）。

**文件清单：**

| 文件 | 核心内容 |
|------|----------|
| `security/index.md` | 前端安全全景、攻击类型 |
| `security/xss.md` | 存储型/反射型/DOM 型 XSS、防御方案（CSP/过滤/转义） |
| `security/csrf.md` | CSRF 攻击原理、Token 防御、SameSite Cookie |
| `security/csp.md` | 内容安全策略配置、指令详解 |
| `security/common-attacks.md` | 点击劫持、iframe 安全、SQL 注入（前端层面） |

---

### 阶段九：面试高频考点模块（interview/）

**目的：** 覆盖用户需求第 6 点（前端经典高频知识、面试题）。

**文件清单：**

| 文件 | 核心内容 |
|------|----------|
| `interview/index.md` | 考察重点、刷题策略 |
| `interview/js-handwritten.md` | 防抖节流、深拷贝、Promise.all/Promise.race、bind/call/apply、数组去重/扁平化、柯里化、JSON.stringify |
| `interview/vue-questions.md` | Proxy vs defineProperty、v-for key 原理、keep-alive 原理、Vue3 性能优化 |
| `interview/react-questions.md` | Fiber 原理、Hooks 规则、React 19 编译器优化 |
| `interview/algorithm.md` | 翻转链表、二叉树遍历、最长不重复子串、三数之和、LRU 缓存、股票买卖 |
| `interview/system-design.md` | 图片懒加载组件、无限滚动列表、路由系统、状态管理库 |
| `interview/hot-qa.md` | 2025-2026 最新热点问答汇总 |

---

### 阶段十：更新 frontend/index.md 首页

**目的：** 将现有概览页从"后端开发者补充"定位升级为"高级前端面试准备"，与新增子模块链接。

**变更要点：**
- 修改 `::: tip 定位` 块：从"面向后端开发者"改为"面向高级前端工程师面试准备"
- 新增知识图谱 mermaid mindmap（覆盖所有 8 个子模块）
- 新增"核心模块"表格（每个子模块一行，含子页面链接）
- 新增精选面试题（4-5 道高频题，带详细答案）
- 更新学习建议（三阶段：基础→框架→工程化+原理）
- 保留原有的推荐资源，更新为最新资源

---

### 阶段十一：更新配置和关联文件

**目的：** 确保导航、侧边栏、知识图谱均反映新增内容。

#### 11.1 更新 `config.js` 侧边栏

- **位置：** `wiki-docs/docs/.vitepress/config.js` L451-463
- **操作：** 替换现有的 `/frontend/` 侧边栏配置为 8 个分组的新结构
- **注意：** 移除旧 Vue 3 分组的 4 个占位链接（原文件不存在）

#### 11.2 更新 `config.js` 顶部导航

- **位置：** `config.js` L616-627 的 `nav` 数组
- **操作：** 确认 `{ text: '前端', link: '/frontend/' }` 已存在；如不存在则添加

#### 11.3 更新 `guide/roadmap.md` 知识图谱

- **位置：** L120-131 的前端知识域
- **操作：** 扩展 mermaid mindmap 节点，从 3 个节点（Vue3/React/前端工程化）扩展为 8 个节点（基础/框架/工程化/浏览器/性能/安全/面试）

#### 11.4 更新 `guide/index.md` 学习导航

- **位置：** L28 的前端行
- **操作：** 将"Vue 3 核心（辅助）"改为"前端高级（全栈必备）"，预计时长从"穿插"改为"2-3 周"

---

## 四、文件清单汇总

| 子模块 | 目录 | 文件数 |
|--------|------|--------|
| 前端基础 | `fundamentals/` | 5 |
| Vue 3 生态 | `vue-ecosystem/` | 7 |
| React 生态 | `react-ecosystem/` | 6 |
| 前端工程化 | `engineering/`（含 `build-tools/`） | 9（含 4 个构建工具子文件） |
| 浏览器原理 | `browser/` | 5 |
| 性能优化与 SEO | `performance/` | 6 |
| 前端安全 | `security/` | 5 |
| 面试高频考点 | `interview/` | 7 |
| **合计** | **8 个一级目录 + 1 个嵌套目录** | **50 个文件** |

> 注：含 `frontend/index.md` 更新 = 50 个文件需创建/更新，另有 4 个关联文件需修改。

---

## 五、内容规范

每个文档文件遵循以下格式模板（对齐现有 `java-advanced/` 和 `ai-application/` 的文档风格）：

```markdown
# 文档标题

## ⭐ 面试重点速览

| 知识模块 | 重点内容 | 面试频率 |
|----------|----------|----------|
| 模块A | 内容描述 | 高/极高 |
| 模块B | 内容描述 | 高/极高 |

---

## 一、章节标题

正文内容...

### 1.1 子章节

正文内容，包含代码示例：

```语言
代码块
```

---

## 二、章节标题

::: tip 提示
提示内容
:::

::: warning 注意
注意事项
:::

::: danger 容易翻车的点
易错点列表
:::

---

## 总结

- 关键点 1
- 关键点 2
```

**关键要求：**
- 每个文件开头必须有 `## ⭐ 面试重点速览` 表格
- 使用 `---` 分隔大章节
- 使用 mermaid 图表辅助理解复杂概念
- 使用 `::: tip` / `::: warning` / `::: danger` 提示块
- 代码示例注明语言类型
- 面试题类文件包含"基础版实现"和"加分版实现"对比

---

## 六、假设与决策

| 决策 | 理由 |
|------|------|
| 保留 React 模块（6 文件） | 与 Vue 形成对比学习，面试中常被问及框架差异；React 19 是大厂常见技术栈 |
| 新增"浏览器原理"独立模块 | 浏览器原理是性能优化和安全防护的基础，面试中高频出现 |
| 新增"前端安全"独立模块 | XSS/CSRF 是前端面试必考题，单独成模块更清晰 |
| 新增"面试高频考点"独立模块 | 集中管理手写题、框架题、算法题、系统设计题，方便求职者快速查阅 |
| 构建工具使用嵌套子目录 `build-tools/` | Vite/Turbopack/Rspack 三个工具各有独立文件，嵌套目录避免 engineering/ 过于扁平 |
| 更新后定位从"后端补充"升级为"高级前端面试" | 用户明确要求全栈能力，前端模块需要达到与其他模块同等的深度 |

---

## 七、验证步骤

1. **目录完整性验证：** 确认 `frontend/` 下所有 9 个目录和 50 个文件均已创建
2. **侧边栏链接验证：** 启动 VitePress 开发服务器，确认所有侧边栏链接可点击且不 404
3. **导航栏验证：** 确认顶部导航栏"前端"入口存在且可跳转
4. **格式一致性验证：** 抽查 3-5 个文件，确认格式与 `java-advanced/`、`ai-application/` 一致
5. **知识图谱验证：** 确认 `guide/roadmap.md` 中前端域 mermaid 图表正确渲染
6. **搜索功能验证：** 确认新增内容可被本地搜索索引