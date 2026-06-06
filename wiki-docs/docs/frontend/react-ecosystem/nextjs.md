# Next.js App Router

## ⭐ 面试重点速览

| 知识模块 | 重点内容 | 面试频率 |
|----------|----------|----------|
| App Router | 与 Pages Router 对比、文件约定（layout/page/loading/error）、路由分组 | 极高 |
| Server Components | 默认服务端组件、'use client' 边界、Server Actions | 极高 |
| 渲染策略 | SSG（generateStaticParams）、SSR（dynamic）、ISR（revalidate） | 极高 |
| 数据获取 | fetch 扩展（cache/revalidate）、Server Actions、数据流模式 | 高 |
| Next.js 15 | Turbopack 默认、React 19 集成、async Request API | 中 |

---

## Next.js 15 新特性

| 特性 | 说明 |
|------|------|
| **Turbopack 默认** | 开发模式默认使用 Turbopack，构建速度提升 5-10 倍 |
| **React 19 集成** | 内置 React 19，支持 Actions API、RSC 稳定版 |
| **async Request API** | `cookies()`、`headers()`、`params`、`searchParams` 变为异步 |
| **TypeScript 配置** | `next.config.ts` 支持，更好的类型推断 |
| **ESLint 9** | 升级到 ESLint 9，支持 flat config |
| **after() API** | 响应发送后执行的非阻塞任务（日志、分析等） |

---

## App Router vs Pages Router

### 架构对比

```
Pages Router（旧）                    App Router（新）
─────────────────────                ─────────────────────
pages/                               app/
├── _app.tsx         (全局布局)        ├── layout.tsx      (根布局)
├── _document.tsx    (HTML 结构)       ├── page.tsx        (首页)
├── index.tsx        (首页)            ├── loading.tsx     (加载状态)
├── about.tsx        (关于页)          ├── error.tsx       (错误边界)
├── blog/                             ├── not-found.tsx   (404)
│   ├── index.tsx                     ├── blog/
│   └── [slug].tsx                    │   ├── layout.tsx
├── api/                              │   ├── page.tsx
│   └── hello.ts                      │   ├── loading.tsx
                                      │   ├── error.tsx
                                      │   └── [slug]/
                                      │       └── page.tsx
                                      └── api/
                                          └── hello/
                                              └── route.ts
```

### 核心差异

| 维度 | Pages Router | App Router |
|------|-------------|------------|
| 组件默认类型 | Client Components | **Server Components** |
| 布局系统 | 手动实现（_app + per-page） | 内置嵌套 Layout（layout.tsx） |
| 数据获取 | `getServerSideProps` / `getStaticProps` | 组件内直接 async/await |
| 加载状态 | 手动实现 | 内置 loading.tsx（自动 Suspense） |
| 错误处理 | 手动 try-catch | 内置 error.tsx（Error Boundary） |
| 路由分组 | 不支持 | 支持 (group) 路由分组 |
| 并行路由 | 不支持 | 支持 @parallel 并行路由 |
| 拦截路由 | 不支持 | 支持 (.) 拦截路由 |

### 文件约定一览

| 文件 | 作用 | 说明 |
|------|------|------|
| `layout.tsx` | 共享布局 | 导航时保持状态，不会重新挂载 |
| `page.tsx` | 页面内容 | 路由对应的唯一 UI |
| `loading.tsx` | 加载状态 | 自动包裹在 Suspense 中 |
| `error.tsx` | 错误边界 | 必须是 Client Component |
| `not-found.tsx` | 404 页面 | 由 `notFound()` 函数触发 |
| `route.ts` | API 路由 | 替代 Pages Router 的 api/ 目录 |
| `template.tsx` | 模板 | 与 layout 类似，但导航时重新挂载 |

```jsx
// ===== layout.tsx —— 根布局（必须包含 html 和 body） =====
export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}

// ===== loading.tsx —— 页面加载时自动显示 =====
export default function Loading() {
  return <div className="skeleton">加载中...</div>;
}

// ===== error.tsx —— 必须是 'use client' =====
'use client';

export default function Error({ error, reset }) {
  return (
    <div>
      <h2>出错了：{error.message}</h2>
      <button onClick={() => reset()}>重试</button>
    </div>
  );
}
```

---

## Server Components vs Client Components

### 默认行为

在 App Router 中，**所有组件默认都是 Server Components**。这意味着：

- 组件在服务端渲染，输出发送到客户端
- 可以直接使用 `async/await` 获取数据
- 不能使用 `useState`、`useEffect`、事件处理等客户端 API
- 组件代码不会发送到客户端，bundle 为 0

```jsx
// ===== Server Component（默认）—— 直接获取数据 =====
async function BlogPage() {
  // 直接在组件中 await，无需 useEffect + fetch
  const posts = await fetch('https://api.example.com/posts', {
    next: { revalidate: 3600 }, // ISR：每小时重新验证
  }).then(res => res.json());

  return (
    <ul>
      {posts.map(post => (
        <li key={post.id}>
          <h2>{post.title}</h2>
          {/* Client Component 可以嵌套在 Server Component 中 */}
          <LikeButton postId={post.id} initialLikes={post.likes} />
        </li>
      ))}
    </ul>
  );
}
```

### 'use client' 边界

```jsx
// ===== Client Component =====
'use client';

import { useState } from 'react';

function LikeButton({ postId, initialLikes }) {
  const [likes, setLikes] = useState(initialLikes);

  return (
    <button
      onClick={async () => {
        setLikes(l => l + 1);
        // 调用 Server Action 持久化
        await likePost(postId);
      }}
    >
      ❤️ {likes}
    </button>
  );
}
```

::: tip 'use client' 边界的关键规则
1. `'use client'` 标记的文件及其所有导入的模块都会成为客户端代码
2. Server Component 可以导入 Client Component，反之不行
3. Client Component 不能直接导入 Server Component（但可以通过 props 的 children 传递）
4. 尽可能把 Client Component 推到叶子节点，减少客户端 bundle
:::

---

## 渲染策略

### 三种渲染模式对比

| 策略 | 触发方式 | 渲染时机 | 适用场景 |
|------|----------|----------|----------|
| **SSG** 静态生成 | `generateStaticParams` + 无动态函数 | 构建时 | 博客文章、文档、产品页 |
| **SSR** 服务端渲染 | `cookies()` / `headers()` / `noStore()` | 每次请求 | 个性化内容、实时数据 |
| **ISR** 增量静态再生 | `fetch({ next: { revalidate: N } })` | 定时后台更新 | 变化不频繁的列表页 |

### SSG —— 静态站点生成

```jsx
// 1. 静态页面（无动态数据）
export default function AboutPage() {
  return <h1>关于我们</h1>; // 构建时生成 HTML，永不过期
}

// 2. 动态路由 + 静态生成
export async function generateStaticParams() {
  const posts = await fetch('https://api.example.com/posts').then(r => r.json());

  // 返回所有可能的 slug，构建时生成所有页面
  return posts.map(post => ({
    slug: post.slug,
  }));
}

export default async function PostPage({ params }) {
  const post = await fetch(`https://api.example.com/posts/${params.slug}`)
    .then(r => r.json());

  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </article>
  );
}
```

### SSR —— 动态渲染

```jsx
import { cookies, headers } from 'next/headers';

// 使用 cookies() 或 headers() 会自动标记为动态渲染
export default async function DashboardPage() {
  const cookieStore = await cookies(); // Next.js 15: async
  const token = cookieStore.get('token')?.value;

  const user = await fetch('https://api.example.com/me', {
    headers: { Authorization: `Bearer ${token}` },
  }).then(r => r.json());

  return (
    <div>
      <h1>欢迎回来，{user.name}</h1>
      <p>当前时间：{new Date().toLocaleString()}</p>
    </div>
  );
}
```

### ISR —— 增量静态再生

```jsx
// 方式 1：基于时间的 ISR
export default async function BlogListPage() {
  const posts = await fetch('https://api.example.com/posts', {
    next: { revalidate: 3600 }, // 每小时在后台重新生成
  }).then(r => r.json());

  return (
    <ul>
      {posts.map(post => (
        <li key={post.id}>
          <a href={`/blog/${post.slug}`}>{post.title}</a>
        </li>
      ))}
    </ul>
  );
}

// 方式 2：按需重新验证（On-Demand Revalidation）
import { revalidatePath, revalidateTag } from 'next/cache';

// 在 Server Action 或 API Route 中调用
export async function updatePost(formData) {
  'use server';
  await savePost(formData);

  // 重新验证特定路径
  revalidatePath('/blog');

  // 或重新验证带标签的缓存
  revalidateTag('posts');
}
```

### 渲染策略决策树

```
需要实时数据？
  ├── 是 → 是否每个用户不同？
  │         ├── 是 → SSR（动态渲染）
  │         └── 否 → ISR（定期重新验证）
  └── 否 → 能否在构建时确定？
            ├── 是 → SSG（静态生成）
            └── 否 → SSG + generateStaticParams（预生成已知路径）
```

---

## 数据获取

### fetch 扩展

Next.js 扩展了原生 `fetch` API，增加了缓存和重新验证能力：

```jsx
// 1. 默认缓存 —— 等同于 force-cache
const data = await fetch('https://api.example.com/data');

// 2. 不缓存 —— 每次请求都重新获取
const data = await fetch('https://api.example.com/data', {
  cache: 'no-store',
});

// 3. ISR —— 定时重新验证
const data = await fetch('https://api.example.com/data', {
  next: { revalidate: 60 }, // 60 秒后重新验证
});

// 4. 标签缓存 —— 按需重新验证
const data = await fetch('https://api.example.com/data', {
  next: { tags: ['posts'] }, // 通过 revalidateTag('posts') 触发重新验证
});
```

### Server Actions

```jsx
// ===== 定义 Server Action =====
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createPost(formData: FormData) {
  const title = formData.get('title');
  const content = formData.get('content');

  // 直接在服务端操作数据库
  await db.post.create({ data: { title, content } });

  // 重新验证缓存
  revalidatePath('/posts');

  // 重定向到文章列表
  redirect('/posts');
}

// ===== 在 Client Component 中使用 =====
'use client';

import { createPost } from './actions';

function CreatePostForm() {
  return (
    <form action={createPost}>
      <input name="title" required />
      <textarea name="content" required />
      <button type="submit">发布</button>
    </form>
  );
}
```

### 数据流模式

```
┌─────────────────────────────────────────────────┐
│                   Server Component               │
│                                                 │
│  const data = await fetch(...)  ← 直接获取数据    │
│                                                 │
│  ┌─────────────────────┐  ┌──────────────────┐  │
│  │  Client Component    │  │  Client Component │  │
│  │  (通过 props 传递)   │  │  (仅在客户端运行)  │  │
│  │                     │  │                  │  │
│  │  <SearchBar         │  │  <LikeButton     │  │
│  │    initialData={d}  │  │    postId={id}   │  │
│  │  />                 │  │  />              │  │
│  └─────────────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────┘
```

::: warning 避免的模式
不要将 Server Component 作为 Client Component 的导入。以下模式会导致问题：

```jsx
// ❌ 错误 —— Client Component 不能导入 Server Component
'use client';
import ServerOnlyComponent from './ServerOnlyComponent'; // 会变成客户端代码

// ✅ 正确 —— 通过 children 或 props 传递
// server/page.tsx
export default function Page() {
  return (
    <ClientWrapper>
      <ServerOnlyComponent /> {/* 作为 children 传递，保持服务端渲染 */}
    </ClientWrapper>
  );
}

// ClientWrapper.tsx
'use client';
export default function ClientWrapper({ children }) {
  return <div className="client-styles">{children}</div>;
}
```
:::

---

## ⭐ 面试高频问题汇总

### Q1：RSC 的原理是什么？与传统 SSR 有何不同？

**RSC 的工作流程**：

1. 服务端渲染 Server Components，输出特殊的 **RSC Payload**（序列化格式，非 HTML）
2. 客户端接收到 Payload 后，将其与 Client Components 的渲染结果合并
3. 后续导航时，客户端只请求新的 RSC Payload，而非完整的 HTML 页面

**与 SSR 的核心区别**：

- SSR 输出 HTML，RSC 输出特殊的序列化格式
- SSR 只在首屏渲染，后续导航是 CSR；RSC 每次导航都可以在服务端执行
- SSR 的组件代码仍会发送到客户端进行水合；RSC 的组件代码永远不会发送到客户端
- RSC 可以组合使用 SSR（首屏 HTML）和 RSC Payload（后续导航）

### Q2：SSG、SSR、ISR 的区别与适用场景？

| 维度 | SSG | SSR | ISR |
|------|-----|-----|-----|
| 构建时间 | 长（预生成所有页面） | 短 | 短（只生成热门页面） |
| 请求延迟 | 最低（静态文件） | 高（每次渲染） | 低（首次后缓存） |
| 数据新鲜度 | 低（构建时快照） | 最高（实时） | 中（定时更新） |
| 服务器负载 | 最低 | 高 | 中 |
| 适用场景 | 博客、文档、营销页 | 仪表盘、个性化页面 | 电商列表、新闻列表 |

**决策流程**：数据是否实时？→ 是 → SSR。数据能否在构建时确定？→ 是 → SSG。数据变化有规律、可接受一定延迟？→ ISR。

### Q3：App Router 与传统 Pages Router 的根本区别是什么？

App Router 的核心范式转变是**以 Server Components 为默认**，带来了以下根本性变化：

1. **数据获取模型**：从 `getServerSideProps` 生命周期函数 → 组件内直接 async/await
2. **布局系统**：从手动嵌套 → 内置嵌套 Layout，支持状态保持
3. **加载/错误处理**：从手动实现 → 内置 loading.tsx（Suspense）和 error.tsx（Error Boundary）
4. **路由系统**：从文件即路由 → 支持路由分组、并行路由、拦截路由
5. **客户端/服务端边界**：从模糊不清 → 显式的 `'use client'` 标记

---

## 面试追问环节

**Q：Next.js 的 fetch 缓存和 React 的 cache() 有什么区别？**

- `fetch` 的缓存是 Next.js 在框架层面实现的，针对 HTTP 请求的缓存，支持 `revalidate` 和 `tags`。
- `cache()` 是 React 的 API，用于缓存函数调用结果（如数据库查询），在单个请求内去重。

```jsx
import { cache } from 'react';

// cache() 在同一个请求中多次调用只执行一次数据库查询
const getUser = cache(async (id: string) => {
  return await db.user.findUnique({ where: { id } });
});

// 多个组件同时调用 getUser('1') 只会触发一次数据库查询
```

**Q：Server Actions 和 API Routes 如何选择？**

- **Server Actions**：用于表单提交、数据变更（POST/PUT/DELETE），与 `<form>` 集成，自动处理 CSRF 保护
- **API Routes**：用于需要暴露给外部系统的 API、需要 GET 请求的数据查询、需要自定义响应格式的场景

**Q：为什么 App Router 中 `cookies()` 和 `headers()` 变成了异步？**

Next.js 15 中，`cookies()` 和 `headers()` 不再缓存请求上下文，而是每次调用时动态读取。这允许更灵活的性能优化（如部分预渲染 PPR），但也意味着必须在 async 函数中使用 `await`。这种变化是 PPR（Partial Prerendering）架构的基础。