# React 19 新特性

## ⭐ 面试重点速览

| 知识模块 | 重点内容 | 面试频率 |
|----------|----------|----------|
| Actions API | formAction 替代手动管理 loading/error、useActionState、useFormStatus | 极高 |
| 新 Hooks | useOptimistic 乐观更新、useActionState、useFormStatus | 极高 |
| Server Components | RSC 稳定、Server vs Client Components、'use server'/'use client' | 极高 |
| React Compiler | React Forget 自动 memo、编译时优化 | 高 |
| 其他改进 | ref 作为 prop、Document Metadata、资源预加载 | 中 |

---

## Actions API

### 核心概念

React 19 引入了 **Actions** 概念，将表单提交、数据变更等异步操作标准化。传统方式需要手动管理 `loading`、`error`、`pending` 等状态，Actions 将这些状态管理内建到 React 中。

```jsx
// React 18 方式 —— 手动管理状态
function OldForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await submitForm(new FormData(e.target));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" />
      <button disabled={loading}>
        {loading ? '提交中...' : '提交'}
      </button>
      {error && <p className="error">{error}</p>}
    </form>
  );
}
```

```jsx
// React 19 方式 —— 使用 formAction
function NewForm() {
  // action 函数接收 FormData，自动处理 pending/error
  const submitAction = async (formData) => {
    'use server'; // 标记为 Server Action
    const email = formData.get('email');
    await saveToDatabase(email);
  };

  return (
    <form action={submitAction}>
      <input name="email" />
      <SubmitButton />
    </form>
  );
}
```

::: tip Actions API 解决了什么问题？
1. **消除样板代码**：不再需要手动管理 loading/error/pending 状态
2. **渐进增强**：表单在 JS 禁用时仍可正常工作（原生 form 提交）
3. **与 Suspense 集成**：pending 状态自动触发最近的 Suspense fallback
4. **乐观更新**：通过 useOptimistic 在提交前就更新 UI
:::

---

## 新 Hooks

### useActionState —— 获取 Action 状态

```jsx
import { useActionState } from 'react';

function EditProfileForm() {
  // useActionState 返回 [state, dispatch, isPending]
  // state 包含 action 的返回值和错误信息
  const [state, updateProfile, isPending] = useActionState(
    async (prevState, formData) => {
      const name = formData.get('name');
      const email = formData.get('email');

      try {
        const result = await updateUserProfile({ name, email });
        return { success: true, message: '保存成功', data: result };
      } catch (error) {
        return { success: false, message: error.message };
      }
    },
    { success: null, message: '' } // 初始状态
  );

  return (
    <form action={updateProfile}>
      <input name="name" defaultValue="Alice" />
      <input name="email" defaultValue="alice@example.com" />

      <button type="submit" disabled={isPending}>
        {isPending ? '保存中...' : '保存'}
      </button>

      {state.message && (
        <p className={state.success ? 'success' : 'error'}>
          {state.message}
        </p>
      )}
    </form>
  );
}
```

### useFormStatus —— 表单 Pending 状态

```jsx
import { useFormStatus } from 'react-dom';

// 必须放在 <form> 子组件中使用
function SubmitButton() {
  const { pending, data, method, action } = useFormStatus();

  return (
    <button type="submit" disabled={pending}>
      {pending ? '提交中...' : '提交'}
    </button>
  );
}

// 使用方式
function App() {
  return (
    <form action={handleSubmit}>
      <input name="title" />
      {/* SubmitButton 在 form 内部，可以读取 form 状态 */}
      <SubmitButton />
    </form>
  );
}
```

::: tip useFormStatus 的设计巧思
`useFormStatus` 必须放在 `<form>` 的子组件中使用，而不是直接在 form 所在的组件中。这是因为 form 所在的组件在提交时不会重渲染，只有子组件需要感知 pending 状态。这种设计避免了不必要的渲染。
:::

### useOptimistic —— 乐观更新

```jsx
import { useOptimistic } from 'react';

function TodoList({ initialTodos }) {
  const [todos, setTodos] = useState(initialTodos);

  // optimisticTodos 会在 action 执行期间立即反映期望的结果
  const [optimisticTodos, addOptimisticTodo] = useOptimistic(
    todos,
    // reducer：当 addOptimisticTodo 被调用时，乐观地将新 todo 加入列表
    (currentTodos, newTodo) => [...currentTodos, { ...newTodo, sending: true }]
  );

  const addTodo = async (formData) => {
    const title = formData.get('title');
    const tempTodo = { id: Date.now(), title, sending: true };

    // 乐观更新 —— 立即反映在 UI 中
    addOptimisticTodo(tempTodo);

    try {
      const savedTodo = await saveTodoToServer(title);
      // 服务器返回后，替换临时数据
      setTodos(prev => prev.map(t =>
        t.id === tempTodo.id ? savedTodo : t
      ));
    } catch (error) {
      // 失败时回滚 —— 从列表中移除临时项
      setTodos(prev => prev.filter(t => t.id !== tempTodo.id));
      showError('添加失败，请重试');
    }
  };

  return (
    <div>
      <form action={addTodo}>
        <input name="title" placeholder="添加待办..." />
        <SubmitButton />
      </form>

      <ul>
        {optimisticTodos.map(todo => (
          <li key={todo.id} style={{ opacity: todo.sending ? 0.5 : 1 }}>
            {todo.title}
            {todo.sending && ' (发送中...)'}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

::: warning 乐观更新的注意事项
1. 乐观更新假设操作大概率成功，但必须实现**失败回滚**逻辑
2. 临时数据的 ID 生成策略需要与服务器 ID 兼容
3. 并发操作时需要考虑操作的顺序一致性
4. 不适合金融交易等对数据一致性要求极高的场景
:::

---

## React Server Components（RSC）

### Server Components vs Client Components

| 维度 | Server Components | Client Components |
|------|-------------------|-------------------|
| 运行位置 | 仅在服务端 | 服务端 + 浏览器 |
| 文件标记 | 默认（无需标记） | `'use client'` 指令 |
| 交互能力 | 无（不能使用 useState/useEffect/onClick） | 有（完整交互能力） |
| 访问能力 | 直接访问数据库、文件系统、后端 API | 不能直接访问服务端资源 |
| Bundle 大小 | 0 KB（代码不发送到客户端） | 完整代码发送到客户端 |
| 数据获取 | 直接 async/await（无额外请求） | 通过 fetch 请求 |
| 渲染次数 | 只在服务端渲染一次 | 服务端预渲染 + 客户端水合 |

```jsx
// ===== Server Component（默认） =====
// 可以直接访问数据库，代码不发送到客户端
async function BlogPosts() {
  // 直接在组件中 await 数据库查询
  const posts = await db.post.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  return (
    <ul>
      {posts.map(post => (
        <li key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.excerpt}</p>
        </li>
      ))}
    </ul>
  );
}

// ===== Client Component（需要 'use client'） =====
'use client';

import { useState } from 'react';

function LikeButton({ postId, initialLikes }) {
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(false);

  const handleLike = async () => {
    setLiked(true);
    setLikes(prev => prev + 1);

    await fetch(`/api/posts/${postId}/like`, { method: 'POST' });
  };

  return (
    <button onClick={handleLike} className={liked ? 'liked' : ''}>
      ❤️ {likes}
    </button>
  );
}
```

### 'use server' 指令 —— Server Actions

```jsx
// ===== Server Action —— 在服务端执行的函数 =====
'use server';

async function createPost(formData: FormData) {
  const title = formData.get('title');
  const content = formData.get('content');

  // 直接操作数据库，无需 API 路由
  const post = await db.post.create({
    data: { title, content, authorId: getCurrentUser().id },
  });

  // 触发缓存重新验证
  revalidatePath('/posts');

  return post;
}

// ===== 在 Client Component 中调用 Server Action =====
'use client';

import { createPost } from './actions';

function CreatePostForm() {
  return (
    <form action={createPost}>
      <input name="title" required />
      <textarea name="content" required />
      <SubmitButton />
    </form>
  );
}
```

::: danger 面试追问：RSC 与 SSR 的区别
这是一个经典陷阱问题。**SSR 和 RSC 是不同层面的概念**：

- **SSR（Server-Side Rendering）**：在服务端将组件渲染为 HTML 字符串发送给客户端，客户端再进行水合（Hydration）。SSR 只影响**首屏**。
- **RSC（React Server Components）**：组件在服务端运行，输出的是**特殊序列化格式**（非 HTML），客户端将其与 Client Components 合并。RSC 影响**整个应用生命周期**。

RSC 的优势在于：
1. 组件代码不发送到客户端，减少 bundle 大小
2. 可以直接访问后端资源，无需 API 层
3. 避免了客户端的水合开销
:::

---

## React Compiler（React Forget）

### 自动 Memoization

React Compiler（代号 React Forget）是 React 19 推出的编译时优化工具，能**自动为组件和 Hooks 添加 memoization**。

```jsx
// 开发者写的代码（无需手动 useMemo/useCallback）
function SearchResults({ query, items }) {
  const filtered = items.filter(item =>
    item.title.toLowerCase().includes(query.toLowerCase())
  );

  const handleClick = (id) => {
    console.log('clicked', id);
  };

  return (
    <ul>
      {filtered.map(item => (
        <li key={item.id} onClick={() => handleClick(item.id)}>
          {item.title}
        </li>
      ))}
    </ul>
  );
}
```

```jsx
// React Compiler 编译后自动生成的等效代码（概念性）
function SearchResults({ query, items }) {
  const filtered = useMemo(
    () => items.filter(item =>
      item.title.toLowerCase().includes(query.toLowerCase())
    ),
    [query, items]
  );

  const handleClick = useCallback(
    (id) => { console.log('clicked', id); },
    []
  );

  return (
    <ul>
      {filtered.map(item => (
        <li key={item.id} onClick={() => handleClick(item.id)}>
          {item.title}
        </li>
      ))}
    </ul>
  );
}
```

::: tip React Compiler 的"React 法则"
React Compiler 基于 React 的核心法则工作：
1. 组件必须是**纯函数**（给定相同的 props/state，输出相同的 JSX）
2. 副作用必须通过 `useEffect` / `useLayoutEffect` 声明
3. 不能修改 props 和 state（不可变性）

如果代码遵守这些规则，Compiler 就能安全地自动优化。如果违反规则，Compiler 会跳过该组件并给出警告。
:::

### React Compiler 与手动优化对比

| 对比维度 | 手动 useMemo/useCallback | React Compiler |
|----------|--------------------------|----------------|
| 正确性 | 容易遗漏或过度使用 | 编译器自动判断，正确性高 |
| 粒度 | 粗粒度（开发者手动指定） | 细粒度（编译器精确分析依赖） |
| 维护成本 | 高（重构时需更新依赖数组） | 零（编译器自动处理） |
| 包体积 | 增加运行时代码 | 仅在编译时，不增加运行时 |
| 开发体验 | 需要记忆优化规则 | 写代码即可，编译器负责优化 |

---

## 其他重要改进

### ref 作为 prop

React 19 中，`ref` 可以直接作为 prop 传递，不再需要 `forwardRef`：

```jsx
// React 18 —— 需要 forwardRef
const MyInput = React.forwardRef((props, ref) => {
  return <input ref={ref} {...props} />;
});

// React 19 —— ref 直接作为 prop
function MyInput({ ref, ...props }) {
  return <input ref={ref} {...props} />;
}

// 使用方式完全相同
function App() {
  const inputRef = useRef(null);
  return <MyInput ref={inputRef} />;
}
```

### Document Metadata 内置支持

```jsx
// React 19 —— 在任何组件中直接使用 <title> <meta> <link>
function BlogPost({ post }) {
  return (
    <article>
      <title>{post.title} - My Blog</title>
      <meta name="description" content={post.excerpt} />
      <meta property="og:title" content={post.title} />
      <link rel="canonical" href={`https://myblog.com/posts/${post.slug}`} />

      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </article>
  );
}

// 不再需要 react-helmet 等第三方库
```

### 资源预加载 API

```jsx
import { prefetchDNS, preconnect, preload, preinit } from 'react-dom';

function App() {
  return (
    <>
      {/* 预解析 DNS */}
      <link rel="dns-prefetch" href="https://api.example.com" />

      {/* 预连接（DNS + TCP + TLS） */}
      <link rel="preconnect" href="https://cdn.example.com" />

      {/* 预加载关键资源 */}
      <link rel="preload" as="image" href="/hero-banner.webp" />

      {/* 也可以在 useEffect 中使用 */}
    </>
  );
}
```

---

## ⭐ 面试高频问题汇总

### Q1：Actions API 解决了什么核心问题？

Actions API 解决了 React 中**异步操作状态管理**的碎片化问题。传统方式下，每个表单都需要手动管理 `loading`、`error`、`pending` 状态，代码重复且容易遗漏。Actions 将异步操作的状态管理内建到 React 中，通过 `useActionState`、`useFormStatus`、`useOptimistic` 提供声明式的状态管理，与 Suspense 和 ErrorBoundary 无缝集成。

### Q2：RSC 与 CSR 的核心区别是什么？

- **CSR（Client-Side Rendering）**：组件在浏览器中运行，数据通过 API 请求获取。所有代码都被发送到客户端。
- **RSC（React Server Components）**：组件在服务端运行，可以直接访问数据库和文件系统。组件代码不发送到客户端，输出的是特殊序列化格式。

RSC 不是替代 CSR，而是与 Client Components 配合使用。Server Components 负责数据获取和静态内容，Client Components 负责交互。这种"混合渲染"模式兼顾了性能和交互。

### Q3：React Compiler 会完全替代 useMemo 和 useCallback 吗？

在启用了 React Compiler 的项目中，开发者确实不需要手动写 `useMemo` 和 `useCallback`。但 Compiler 是**编译时优化**，不会移除已有的手动优化代码，两者可以共存。对于尚未启用 Compiler 的项目，手动优化仍然必要。长远来看，React 团队的目标是让 Compiler 成为默认选项，让开发者专注于业务逻辑而非性能优化细节。

---

## 面试追问环节

**Q：React 19 的 useOptimistic 和手动乐观更新有什么区别？**

手动乐观更新需要开发者自己管理：
- 临时数据的存储和清除
- 失败时的回滚逻辑
- 与服务器数据的同步

`useOptimistic` 将这些逻辑标准化：
- 通过 reducer 模式管理乐观状态
- 与 Server Actions 集成，自动在 action 完成后更新
- 失败时自动回滚到实际状态

**Q：Server Components 中为什么不能使用 useState？**

Server Components 只在服务端运行一次，没有"重渲染"的概念。状态（state）的本质是"在多次渲染之间保持的值"，既然 Server Components 不重渲染，状态也就没有意义。如果需要交互状态，应该使用 Client Components。

**Q：'use server' 和 'use client' 可以同时使用吗？**

不能。一个文件要么是 Server Component（默认），要么是 Client Component（`'use client'`），要么是 Server Actions（`'use server'`）。但 Client Component 可以导入 Server Actions 并在事件处理中调用它们。这种模式实现了"客户端交互 + 服务端执行"的混合架构。