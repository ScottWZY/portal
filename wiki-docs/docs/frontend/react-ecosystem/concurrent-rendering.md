# 并发渲染（Concurrent Rendering）

## ⭐ 面试重点速览

| 知识模块 | 重点内容 | 面试频率 |
|----------|----------|----------|
| Fiber 架构 | 可中断渲染、链表结构、双缓存机制、WorkLoop | 极高 |
| 时间分片 | Scheduler、requestIdleCallback polyfill、Lane 优先级模型 | 极高 |
| useTransition | 标记非紧急更新、startTransition、isPending | 高 |
| useDeferredValue | 延迟值、与 useTransition 的区别 | 高 |
| Suspense | 数据获取、代码分割、fallback 机制、嵌套 Suspense | 高 |

---

## Fiber 架构

### 为什么需要 Fiber？

在 React 15 及之前，React 使用 **Stack Reconciler（栈调和器）**。它基于递归调用栈，**同步且不可中断**：

```
Stack Reconciler 的问题：
┌──────────────────────────────────────────────┐
│  setState → 递归遍历组件树 → Diff → 提交 DOM  │
│                                              │
│  整个过程一气呵成，无法中断                    │
│  如果组件树有 1000 个节点，用户点击按钮要等     │
│  所有节点 diff 完成才能响应                    │
└──────────────────────────────────────────────┘
```

::: danger Stack Reconciler 的致命缺陷
当组件树很大时，一次 setState 可能导致主线程被阻塞数百毫秒。在此期间：
- 用户点击按钮无响应 
- 输入框输入卡顿
- 动画掉帧

浏览器每 16.6ms（60fps）需要一帧来渲染，而 Stack Reconciler 的递归渲染可能占用 100-500ms，导致多帧被跳过。
:::

### Fiber 是什么？

Fiber 并非一个新的概念，而是 React 内部对**工作单元**的重新抽象。每个 Fiber 节点对应一个 React 元素，形成一个**可中断的链表结构**。

```typescript
// Fiber 节点的简化结构
interface FiberNode {
  // ===== 结构信息（链表） =====
  tag: WorkTag;              // 节点类型：FunctionComponent / ClassComponent / HostComponent 等
  key: string | null;        // 用于 Diff 的 key
  elementType: any;          // 原始组件类型
  type: any;                 // 实际渲染类型

  // 链表关系 —— 构成了"Fiber 树"
  return: Fiber | null;      // 父节点（处理完当前节点后返回）
  child: Fiber | null;       // 第一个子节点
  sibling: Fiber | null;     // 下一个兄弟节点

  // ===== 状态信息 =====
  pendingProps: any;         // 待处理的 props
  memoizedProps: any;        // 已生效的 props
  memoizedState: any;        // 已生效的 state（Hooks 链表头）
  updateQueue: any;          // 更新队列

  // ===== 副作用信息 =====
  flags: Flags;              // 副作用标记：Placement / Update / Deletion
  subtreeFlags: Flags;       // 子树副作用标记
  deletions: Fiber[] | null; // 需要删除的子节点

  // ===== 调度信息 =====
  lanes: Lanes;              // 当前 Fiber 的更新优先级
  childLanes: Lanes;         // 子树中待处理的优先级

  // ===== 双缓存 =====
  alternate: Fiber | null;   // 指向另一棵 Fiber 树中的对应节点
}
```

### Fiber 树的双链表结构

```
Fiber 树通过 child / sibling / return 三个指针构成链表：

              App (root)
               |
             child
               v
             Header ──sibling──> Main ──sibling──> Footer
               |                  |
             child              child
               v                  v
            Logo ──sibling──>   Content ──sibling──> Sidebar
                                    |
                                  child
                                    v
                                  Item1 ──sibling──> Item2

遍历顺序（深度优先）：
App → Header → Logo → Main → Content → Item1 → Item2 → Sidebar → Footer
```

### 双缓存机制（Double Buffering）

React 同时维护两棵 Fiber 树：

| 树 | 用途 | 对应 DOM |
|------|------|----------|
| **current** | 当前屏幕上显示的内容 | 旧 DOM |
| **workInProgress** | 正在内存中构建的新树 | 新 DOM |

```
更新流程：
1. current 树作为基准，创建 workInProgress 树
2. 在 workInProgress 树上进行 Diff 和标记
3. 提交阶段：workInProgress 变为 current，DOM 更新到屏幕
4. 旧的 current 树被回收，等待下次复用

current ──────────alternate──────────> workInProgress
   ^                                      |
   |                                      |
   +────── 提交后身份互换 ←───────────────+
```

::: tip 为什么需要双缓存？
双缓存保证在渲染过程中，屏幕上始终显示完整、一致的 UI。如果只有一棵树，用户在"渲染到一半"时看到的就是一个不完整的中间状态。双缓存让新树完全构建好之后再一次性提交，避免了中间状态暴露。
:::

### WorkLoop 工作循环

```jsx
// 核心概念（简化版）—— Fiber 的工作循环
function workLoop(deadline) {
  let shouldYield = false;

  // 只要还有工作单元且不需要让出主线程
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    // 检查是否还有剩余时间
    shouldYield = deadline.timeRemaining() < 1;
  }

  if (!nextUnitOfWork) {
    // 所有工作完成，进入提交阶段
    commitRoot();
  }

  // 无论是否完成，都注册下一帧的回调
  requestIdleCallback(workLoop);
}

// 处理单个 Fiber 节点
function performUnitOfWork(fiber) {
  // 1. 开始工作：根据 fiber.tag 执行对应处理
  //    - FunctionComponent → 调用函数，执行 Hooks
  //    - ClassComponent → 实例化，调用 render
  //    - HostComponent → 创建/更新 DOM 元素
  beginWork(fiber);

  // 2. 深度优先遍历：优先处理子节点
  if (fiber.child) {
    return fiber.child; // 有子节点，继续向下
  }

  let nextFiber = fiber;
  while (nextFiber) {
    completeWork(nextFiber); // 完成当前节点工作

    if (nextFiber.sibling) {
      return nextFiber.sibling; // 有兄弟节点，处理兄弟
    }
    nextFiber = nextFiber.return; // 回到父节点
  }

  return null; // 所有节点处理完成
}
```

---

## 时间分片（Time Slicing）

### Scheduler 调度器

React 18 将调度逻辑从 Reconciler 中独立出来，成为 **Scheduler** 包。Scheduler 的核心职责是**任务优先级排序**和**时间分片**。

```typescript
// Scheduler 的核心概念
interface Task {
  id: number;
  callback: () => void;       // 要执行的任务
  priorityLevel: PriorityLevel; // 优先级
  startTime: number;           // 任务开始时间
  expirationTime: number;      // 任务过期时间（超时后必须执行）
  sortIndex: number;           // 排序依据
}
```

### requestIdleCallback 与 Scheduler 的实现

浏览器的 `requestIdleCallback` 提供了在空闲时间执行任务的 API，但兼容性差且不稳定。React 的 Scheduler 自己实现了一个更可靠的版本：

```typescript
// Scheduler 的时间分片实现（简化）
const frameInterval = 5; // 默认每帧 5ms 用于 React 渲染

// 使用 MessageChannel 实现宏任务调度（比 setTimeout 精度更高）
const channel = new MessageChannel();
const port = channel.port2;

channel.port1.onmessage = () => {
  // 在宏任务中执行工作循环
  const currentTime = performance.now();
  const frameDeadline = currentTime + frameInterval;

  let shouldYield = false;
  while (currentTask && !shouldYield) {
    // 执行任务
    const continuation = currentTask.callback();
    if (typeof continuation === 'function') {
      currentTask.callback = continuation; // 任务未完成，保存进度
    } else {
      currentTask = nextTask(); // 任务完成，取下一个
    }

    // 检查是否需要让出主线程
    shouldYield = performance.now() >= frameDeadline;
  }

  if (currentTask) {
    port.postMessage(null); // 还有任务，注册下一帧
  }
};

// 为什么不用 setTimeout？
// setTimeout(fn, 0) 实际最小延迟是 4ms，精度不够
// MessageChannel 可以实现真正的 0ms 延迟
```

### Lane 优先级模型

React 18 使用 **Lane 模型**（车道模型）替代了 React 17 的 ExpirationTime 模型：

```
Lane 模型 —— 用 31 位二进制表示优先级

位数（从右到左）:
31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16 15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
                                                                              ^ ^ ^
                                                                              | | |
SyncLane (同步)  ────────────────────────────────────────────────────────────────┘ | |
InputContinuousLane (连续输入) ────────────────────────────────────────────────────┘ |
DefaultLane (默认)  ─────────────────────────────────────────────────────────────────┘
TransitionLane (过渡) ───────────────────────────────────────────── 更高位
IdleLane (空闲)   ───────────────────────────────────────────────── 最高位
```

| 优先级 | Lane 名称 | 触发场景 | 超时时间 |
|--------|-----------|----------|----------|
| 最高 | SyncLane | 同步任务（如 `flushSync`） | 立即 |
| 高 | InputContinuousLane | 用户连续输入 | ~100ms |
| 中 | DefaultLane | 普通 setState | ~5000ms |
| 低 | TransitionLane | useTransition / startTransition | 无超时 |
| 最低 | IdleLane | 空闲时执行 | 无超时 |

::: tip Lane 模型的优势
二进制位运算使得优先级判断极其高效：
- 用 `&` 判断是否包含某优先级
- 用 `|` 合并多个优先级
- 一个任务可以同时属于多个 Lane（多条车道）

ExpirationTime 模型只能表示一个时间点，无法表达"高优先级 + 低优先级"的复合场景。
:::

---

## useTransition 与 useDeferredValue

### useTransition —— 标记非紧急更新

```jsx
import { useState, useTransition } from 'react';

function SearchPage() {
  const [query, setQuery] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleChange = (e) => {
    // 紧急更新：立即更新输入框的值
    setQuery(e.target.value);

    // 非紧急更新：搜索结果可以延迟
    startTransition(() => {
      // 这里的状态更新是低优先级的
      // 如果用户继续输入，这个更新会被中断并放弃
      setSearchResults(filterData(e.target.value));
    });
  };

  return (
    <div>
      <input
        value={query}
        onChange={handleChange}
        placeholder="搜索..."
      />
      {/* isPending 为 true 时显示加载状态 */}
      {isPending && <Spinner />}
      <SearchResults />
    </div>
  );
}
```

### useDeferredValue —— 延迟值

```jsx
import { useState, useDeferredValue, useMemo } from 'react';

function SearchPage() {
  const [query, setQuery] = useState('');
  // deferredQuery 的更新会在浏览器空闲时进行
  const deferredQuery = useDeferredValue(query);

  // 紧急更新：输入框值
  // 延迟更新：基于 deferredQuery 的搜索结果
  const results = useMemo(
    () => filterData(deferredQuery),
    [deferredQuery]
  );

  return (
    <div>
      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        style={{ opacity: query !== deferredQuery ? 0.5 : 1 }}
      />
      <SearchResults data={results} />
    </div>
  );
}
```

### useTransition vs useDeferredValue

| 对比维度 | useTransition | useDeferredValue |
|----------|---------------|------------------|
| 控制方式 | 主动控制哪些更新是低优先级 | 被动接收一个延迟版本的值 |
| 适用场景 | 更新逻辑在组件内部，可包裹在 startTransition 中 | 值来自父组件 props 或外部 Hook |
| 加载状态 | 提供 `isPending` 标志 | 通过比较 `value !== deferredValue` 判断 |
| 典型用法 | 用户交互触发的计算密集型更新 | 父组件传来的高频变化值 |

---

## Suspense

### 数据获取

```jsx
import { Suspense } from 'react';

// React 18+ 支持 Suspense 与数据获取框架集成
function ProfilePage() {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <ProfileDetails />
      <Suspense fallback={<PostsSkeleton />}>
        <ProfilePosts />
      </Suspense>
    </Suspense>
  );
}

// 嵌套 Suspense —— 独立控制加载粒度
// ProfileDetails 加载完成前显示 ProfileSkeleton
// ProfilePosts 独立加载，不影响 ProfileDetails 的展示
```

### 代码分割

```jsx
import { lazy, Suspense } from 'react';

// 动态导入组件
const HeavyChart = lazy(() => import('./HeavyChart'));
const AdminPanel = lazy(() => import('./AdminPanel'));

function Dashboard() {
  return (
    <div>
      <Suspense fallback={<div className="skeleton">图表加载中...</div>}>
        <HeavyChart />
      </Suspense>

      <Suspense fallback={null}>
        <AdminPanel />
      </Suspense>
    </div>
  );
}
```

### Suspense 的工作原理

```
Suspense 处理流程：

1. 子组件渲染时"抛出"一个 Promise（throw promise）
2. React 捕获这个 Promise，向上查找最近的 Suspense 边界
3. 显示 fallback 内容
4. Promise resolve 后，React 重新渲染子组件
5. 子组件这次正常渲染，React 替换 fallback 为实际内容

┌─────────────────────────────────────────┐
│  <Suspense fallback={<Spinner />}>      │
│    <LazyComponent />                    │
│  </Suspense>                            │
│                                         │
│  LazyComponent 渲染：                    │
│  → throw promise                        │
│  → React 捕获 → 显示 <Spinner />        │
│  → promise resolve                      │
│  → React 重新渲染 LazyComponent         │
│  → 正常返回 JSX → 替换 <Spinner />      │
└─────────────────────────────────────────┘
```

::: warning Suspense 的边界
Suspense 并非全局性的——只有最近的 Suspense 父组件会显示 fallback。如果组件树中有多个 Suspense，React 会按需激活最近的 fallback。这种"瀑布式"加载可以精确控制页面的加载体验。
:::

---

## ⭐ 面试高频问题汇总

### Q1：Fiber 解决了什么问题？如何解决的？

**解决的核心问题**：同步渲染导致的主线程长时间阻塞。

**解决方案**：
1. **可中断**：将渲染任务拆分为小的 Fiber 工作单元，每完成一个单元检查是否需要让出主线程
2. **优先级调度**：通过 Lane 模型为不同类型的更新分配优先级，高优先级任务可以打断低优先级任务
3. **双缓存**：在 workInProgress 树上完成所有计算，一次性提交到屏幕，避免中间状态
4. **时间分片**：每 5ms 检查一次是否需要让出主线程，确保浏览器有时间处理用户输入和渲染

### Q2：时间分片的原理是什么？

时间分片的核心是 **协作式调度（Cooperative Scheduling）**：

1. React 将渲染任务拆分为多个小的工作单元（Fiber 节点）
2. 每处理完一个工作单元，检查当前时间是否超过分配的 5ms 时间片
3. 如果还在时间片内，继续处理下一个工作单元
4. 如果超过了，通过 MessageChannel 注册一个宏任务，在下一个事件循环中继续
5. 浏览器利用空闲时间执行用户交互和渲染

```
时间片执行流程：

Frame 1 (16.6ms):        Frame 2:                 Frame 3:
┌──────┬───────────┐    ┌──────┬───────────┐     ┌──────┬───────────┐
│React │ 浏览器工作 │    │React │ 浏览器工作 │     │React │ 浏览器工作 │
│ 5ms  │ 11.6ms    │    │ 5ms  │ 11.6ms    │     │ 5ms  │ 11.6ms    │
└──────┴───────────┘    └──────┴───────────┘     └──────┴───────────┘
   ↑                        ↑                       ↑
   处理 Fiber 节点          处理下一批 Fiber 节点    处理再下一批
```

### Q3：useTransition 和 debounce 有什么区别？

- **debounce**：固定延迟，无论浏览器是否忙碌，都等待相同时间。结果是"延迟后生效"，用户始终看到旧的 UI。
- **useTransition**：智能延迟，React 在浏览器空闲时立即执行更新。结果是"尽快更新"，只有在浏览器繁忙时才延迟。

useTransition 的优势在于：当浏览器空闲时，更新可以立即生效，而不需要等待固定延迟；当浏览器繁忙时，更新会等待，不会阻塞用户交互。

---

## 面试追问环节

**Q：React 的"并发"和 JavaScript 的"并发"是同一个概念吗？**

不是。JavaScript 是单线程的，React 的"并发"是指**渲染任务的可中断和优先级调度**，并非真正的多线程并发。React 通过时间分片在单线程上模拟并发效果——在多个任务之间快速切换，让高优先级任务先执行。这与操作系统的分时调度类似，但所有代码仍在同一个主线程中执行。

**Q：Lane 模型和 ExpirationTime 模型的核心区别是什么？**

- **ExpirationTime**：每个更新有一个过期时间，数值越小优先级越高。但它是线性的，无法表达"一个更新同时属于多个优先级"。
- **Lane**：使用二进制位，一个更新可以同时占用多个 Lane（如既是 DefaultLane 又是 TransitionLane）。这使得 React 可以更精确地表达更新之间的关系（如"这个更新是 Suspense 相关的，但也是用户触发的"）。

**Q：在什么情况下应该避免使用 useTransition？**

1. 状态更新本身很简单，不需要延迟时（过度使用反而增加复杂度）
2. 需要在更新后立即读取 DOM 的场景（如获取焦点、测量元素尺寸）
3. 在 useEffect 或生命周期中，React 不允许使用 startTransition
4. 非 React 状态更新（如直接操作 DOM 或第三方库的状态）

**Q：Suspense 和 ErrorBoundary 有什么区别？**

两者都是 React 的"边界"组件，但处理的对象不同：
- **Suspense**：捕获子组件抛出的 **Promise**（加载状态），显示 fallback 等待加载完成
- **ErrorBoundary**：捕获子组件抛出的 **Error**（错误状态），显示降级 UI

两者可以配合使用，提供完整的加载/错误/正常状态覆盖。