# 2025-2026 热点问答

## ⭐ 面试重点速览

| 热点话题 | 所属领域 | 核心价值 | 面试频率 | 掌握难度 |
|----------|----------|----------|----------|----------|
| Vue Vapor Mode | Vue 生态 | 无虚拟 DOM 的编译策略、极致性能 | 高 | 中等 |
| React 19 Actions | React 生态 | 简化异步操作、乐观更新 | 高 | 中等 |
| INP（替代 FID） | 性能指标 | 衡量页面交互响应性 | 高 | 简单 |
| Vite 6 + Rolldown | 工程化 | Rust 构建工具、性能飞跃 | 中高 | 中等 |
| React Server Components | React 生态 | 零 JS 组件、减小 Bundle | 极高 | 困难 |
| TypeScript 7 重构 | TypeScript | 原生 TS 编译器、性能提升 | 中 | 简单 |

---

## 一、Vue Vapor Mode 是什么？解决了什么问题？

### 核心答案

Vapor Mode 是 Vue 团队正在开发的一种**无虚拟 DOM 的编译策略**。它通过静态编译将模板直接编译为高效的 DOM 操作指令，跳过虚拟 DOM 的创建和 Diff 过程，实现极致性能。

### 设计理念

```
传统 Vue 渲染流程：
  模板 → 编译 → 虚拟 DOM → Diff → 真实 DOM 操作

Vapor Mode 渲染流程：
  模板 → 编译 → 直接 DOM 操作指令（跳过虚拟 DOM）
```

### 核心特点

| 特性 | 说明 |
|------|------|
| 无虚拟 DOM | 编译时直接生成 DOM 操作代码，跳过运行时 VNode 创建和 Diff |
| 极致性能 | 内存占用更低，初始渲染和更新速度更快 |
| 按需引入 | 仅对性能敏感组件启用 Vapor Mode，与现有组件兼容 |
| 编译时优化 | 在编译阶段分析模板，生成最优的 DOM 更新路径 |
| 与 Composition API 兼容 | 仍然可以使用 `ref`、`computed`、`watch` 等 API |

### 解决的问题

1. **虚拟 DOM 的额外开销**：虚拟 DOM 需要创建 JavaScript 对象、递归 Diff，这些对某些场景（如大量静态内容）是不必要的开销
2. **内存占用**：虚拟 DOM 树占用额外内存，对移动端和低端设备不友好
3. **对标 Solid.js**：Solid.js 已经证明了无虚拟 DOM 方案的可行性，Vapor Mode 是 Vue 的响应

::: tip 当前状态
Vapor Mode 目前仍在开发中，预计在 Vue 3.x 系列中以可选特性形式发布。它不会替代现有的虚拟 DOM 模式，而是作为一种编译优化选项，开发者可以选择性地对性能敏感组件启用。
:::

---

## 二、React 19 Actions API 是什么？与之前有什么区别？

### 核心答案

React 19 的 Actions API 是一套用于处理**异步数据变更**（如表单提交、数据更新）的 API，核心包括 `useActionState` 和 `useFormStatus`。它简化了异步操作中的 pending 状态、错误处理和乐观更新。

### 对比：React 18 vs React 19

```jsx
// ===== React 18：手动管理异步状态 =====
function Form() {
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)

  async function handleSubmit(formData) {
    setIsPending(true)
    setError(null)
    try {
      const result = await saveData(formData)
      setData(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="title" />
      <button type="submit" disabled={isPending}>
        {isPending ? '提交中...' : '提交'}
      </button>
      {error && <p className="error">{error}</p>}
    </form>
  )
}

// ===== React 19：使用 Actions API 简化 =====
import { useActionState, useFormStatus } from 'react'

// 异步 action 函数
async function submitAction(prevState, formData) {
  try {
    const result = await saveData(Object.fromEntries(formData))
    return { data: result, error: null }
  } catch (err) {
    return { data: null, error: err.message }
  }
}

function Form() {
  // useActionState 自动管理 pending 状态和返回值
  const [state, formAction, isPending] = useActionState(submitAction, {
    data: null,
    error: null
  })

  return (
    <form action={formAction}>
      <input name="title" />
      <SubmitButton />
      {state.error && <p className="error">{state.error}</p>}
    </form>
  )
}

// 可以在子组件中获取表单状态
function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending}>
      {pending ? '提交中...' : '提交'}
    </button>
  )
}
```

### 核心优势

| 对比维度 | React 18 | React 19 Actions |
|----------|----------|------------------|
| pending 状态 | 手动 `useState` + `try/finally` | 自动管理（`useActionState` 返回 `isPending`） |
| 错误处理 | 手动 `try/catch` + `setState` | 在 action 中返回错误状态即可 |
| 乐观更新 | 需要手动实现（复杂） | 内置 `useOptimistic` 支持 |
| 表单状态 | 需要通过 props 向下传递 | `useFormStatus` 在任何子组件中获取 |
| 代码量 | 每个表单需要 ~20 行样板代码 | 减少 50% 以上的样板代码 |

---

## 三、INP 是什么？为什么替代 FID？

### 核心答案

**INP（Interaction to Next Paint）** 是 Google 在 2024 年 3 月正式替代 FID 的新 Core Web Vitals 指标。它衡量页面**整个生命周期中所有交互的响应延迟**，而 FID 只衡量**首次交互延迟**。

### 为什么替代 FID？

| 对比维度 | FID（First Input Delay） | INP（Interaction to Next Paint） |
|----------|--------------------------|----------------------------------|
| 衡量范围 | 仅首次交互 | 整个生命周期中所有交互 |
| 时间范围 | 只衡量输入延迟（事件被阻塞等待执行的时间） | 衡量完整交互延迟（从用户输入到下一帧绘制） |
| 反映问题 | 反映主线程阻塞导致的输入延迟 | 全面反映交互响应性（包括事件处理、渲染更新时间） |
| 代表性 | 仅反映 1 次交互，不够全面 | 取所有交互的 98% 分位数，更有代表性 |

### INP 的构成

```
用户点击 → ... → 浏览器绘制下一帧
  ├── 输入延迟（Input Delay）── 事件回调排队等待的时间
  ├── 处理时间（Processing Time）── 事件处理函数执行的时间
  └── 呈现延迟（Presentation Delay）── 渲染更新到屏幕的时间
```

### 优化 INP 的策略

| 优化方向 | 具体措施 |
|----------|----------|
| 减少输入延迟 | 拆分长任务（使用 `scheduler.yield` 或 `setTimeout`）、代码分割、懒加载 |
| 减少处理时间 | 减少事件处理中的计算量、使用 Web Worker 处理复杂计算 |
| 减少呈现延迟 | 减少 DOM 大小、避免强制同步布局（layout thrashing）、使用 CSS containment |
| 框架层面 | React 的 Concurrent Mode、Vue 的异步更新策略天然有助于降低 INP |

::: warning 性能优化关注点转移
INP 替代 FID 意味着性能优化的关注点从"首屏加载"向"交互体验"倾斜。面试中如果能提到 INP，并说明其与 FID 的区别，能显著展示你对前端性能的深入理解。
:::

---

## 四、Vite 6 Rolldown 相比 esbuild 有什么优势？

### 核心答案

**Rolldown** 是 Vite 团队（VoidZero）使用 Rust 开发的 **JavaScript/TypeScript 打包工具**，旨在替代 esbuild + Rollup 的组合，在 Vite 6 中作为生产构建的默认选项。

### 为什么需要 Rolldown？

```
Vite 5 及之前：
  开发环境：esbuild（预构建依赖，极快）
  生产构建：Rollup（打包，功能完备但较慢）
  → 两套工具，行为不一致，开发与生产可能存在差异

Vite 6 + Rolldown：
  开发环境：esbuild（预构建依赖）
  生产构建：Rolldown（兼容 Rollup 生态，Rust 原生性能）
  → 统一工具链，行为一致，性能大幅提升
```

### Rolldown vs esbuild vs Rollup

| 对比维度 | esbuild | Rollup | Rolldown |
|----------|---------|--------|----------|
| 语言 | Go | JavaScript | Rust |
| 打包速度 | 极快（Go 原生） | 较慢（JS 单线程） | 极快（Rust 原生，接近 esbuild） |
| Tree Shaking | 基础 | 强大（ESM 静态分析） | 强大（继承 Rollup 能力） |
| 插件生态 | 有限（Go 插件系统） | 丰富（大量社区插件） | 兼容 Rollup 插件 |
| 代码分割 | 有限 | 支持 | 支持 |
| 产物质量 | 一般 | 优秀 | 优秀 |
| 与 Vite 集成 | 开发环境预构建 | 生产构建 | 生产构建（Vite 6） |

::: tip 核心优势总结
Rolldown = esbuild 的速度 + Rollup 的生态兼容性 = 最优的生产构建方案
:::

---

## 五、RSC（React Server Components）的原理和优势？

### 核心答案

**React Server Components（RSC）** 是一种在服务端运行、不会发送 JavaScript 到客户端的 React 组件。它们可以在服务端直接访问数据库、文件系统等后端资源，生成的 UI 以特殊格式发送到客户端，无需客户端 JS 即可渲染。

### 工作原理

```
┌─────────────────────────────────────────────┐
│ 服务端（Server）                              │
│                                              │
│  ServerComponent（零 JS）                     │
│  ├─ 直接查询数据库                            │
│  ├─ 直接读取文件系统                          │
│  └─ 渲染为 RSC Payload（序列化后的 UI 描述）    │
│                                              │
│  ────────────── RSC Payload ───────────────→ │
│                                              │
│ 客户端（Client）                              │
│  ├─ 接收 RSC Payload                          │
│  ├─ 与 Client Component 合并                 │
│  └─ 渲染为完整 UI                             │
│                                              │
│  ClientComponent（带 JS）                     │
│  ├─ 'use client' 指令                        │
│  ├─ 交互逻辑（onClick、useState 等）          │
│  └─ JavaScript 发送到客户端                   │
└─────────────────────────────────────────────┘
```

### 核心优势

| 优势 | 说明 |
|------|------|
| **零 Bundle Size** | 服务端组件代码不发送到客户端，减少 JS 体积 |
| **直接访问后端** | 可以在组件中直接查询数据库、读取文件，无需 API 层 |
| **自动代码分割** | 只有客户端组件需要下载 JS，服务端组件零 JS 开销 |
| **安全性** | 敏感逻辑（如 API key、数据库查询）永远留在服务端 |
| **性能提升** | 减少客户端 JS 解析和执行时间，改善 TTI 和 FCP |

### 使用示例

```jsx
// ServerComponent.jsx —— 服务端组件（默认就是服务端组件）
// 没有 'use client' 指令 = 默认就是服务端组件
async function ProductList() {
  // 直接在组件中访问数据库！不需要 useEffect + fetch
  const products = await db.query('SELECT * FROM products LIMIT 10')

  return (
    <div>
      <h1>Products</h1>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}

// ClientComponent.jsx —— 客户端组件
'use client' // 标记为客户端组件
import { useState } from 'react'

function ProductCard({ product }) {
  const [liked, setLiked] = useState(false)

  return (
    <div>
      <h2>{product.name}</h2>
      <p>${product.price}</p>
      <button onClick={() => setLiked(!liked)}>
        {liked ? 'Unlike' : 'Like'}
      </button>
    </div>
  )
}
```

::: warning 注意
- 服务端组件**不能使用** `useState`、`useEffect`、`onClick` 等交互相关 API
- 服务端组件**可以导入**客户端组件，但客户端组件不能导入服务端组件
- 服务端组件需要配合支持 RSC 的框架使用（如 Next.js App Router）
:::

---

## 六、TypeScript 7 重构进展和影响？

### 核心答案

TypeScript 7 是 TypeScript 团队正在进行的一项重大重构：**使用 Go 语言重写 TypeScript 编译器（TSC）**。目标是解决当前 TSC（TypeScript 原生编译器）的性能瓶颈，预计将带来 **10 倍以上的编译速度提升**。

### 为什么需要重构？

| 问题 | 说明 |
|------|------|
| 编译速度慢 | 当前 TSC 使用 JavaScript 编写，单线程，大型项目编译可能需要数分钟 |
| 内存占用高 | JS 引擎的 GC 和 V8 的 JIT 开销导致大项目内存占用高 |
| 编辑器体验 | 类型检查延迟影响 IDE 智能提示体验 |
| 跟不上项目规模 | 随着 monorepo 和巨型项目普及，JS 版 TSC 成为瓶颈 |

### 重构方案

```
TypeScript 7 = 类型检查器（Go 原生） + 旧版 TSC 兼容层

当前架构：
  TypeScript 源码 → TSC（JS）→ JS 输出 + 类型检查

TypeScript 7 架构：
  TypeScript 源码 → TypeScript 7 编译器（Go）→ JS 输出 + 类型检查
                      ↓
                  速度提升 10x+
                  内存占用降低 50%+
```

### 影响和意义

| 影响 | 说明 |
|------|------|
| **编译速度飞跃** | 大型项目从分钟级降至秒级 |
| **编辑器体验提升** | 类型检查延迟大幅降低，VS Code 智能提示更流畅 |
| **CI/CD 加速** | 类型检查不再成为 CI 管道的瓶颈 |
| **对开发者透明** | 保持 API 兼容性，现有项目无需修改代码即可获得性能提升 |
| **生态催化** | 更快的工具链可能会催生更多 TS 原生工具 |

::: tip 当前状态（2025-2026）
TypeScript 7 的 Go 原生编译器目前仍在开发中。Anders Hejlsberg（TypeScript 创始人）在 2025 年的多个技术大会上分享了进展。这不是一个"抛弃 TypeScript"的计划，而是**编译器基础设施的现代化升级**，对开发者完全透明。
:::

---

## 面试追问环节

**Q：Vapor Mode 和 Solid.js 的响应式方案有什么区别？**

Vapor Mode 借鉴了 Solid.js 的无虚拟 DOM 理念，但底层实现不同。Solid.js 的响应式基于细粒度订阅（Signal），而 Vapor Mode 基于 Vue 的响应式系统（ref/reactive + effect）。Vapor Mode 的优势在于与 Vue 生态的兼容性，现有 Vue 组件可以无缝迁移。

**Q：RSC 和 SSR 有什么本质区别？**

SSR 是在服务端将组件渲染为 HTML 字符串发送到客户端，组件代码仍然要发送到客户端用于 hydration。RSC 是组件代码永远不留到客户端，客户端只接收渲染结果（RSC Payload）。RSC 是"零 JS"组件，而 SSR 组件在客户端仍然需要 JS 来交互。

**Q：INP 和 FID 的数值差异有多大？**

FID 通常只衡量 1 次交互（首次），且只衡量输入延迟部分。INP 衡量所有交互的完整延迟（输入延迟 + 处理时间 + 呈现延迟），取 98% 分位数。因此同一页面的 INP 通常比 FID 高得多。这也是为什么很多"FID 优秀"的页面在 INP 指标下表现不佳。