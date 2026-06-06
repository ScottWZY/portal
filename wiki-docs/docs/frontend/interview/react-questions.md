# React 高频面试题

## ⭐ 面试重点速览

| 面试题 | 核心考点 | 面试频率 | 难度 |
|--------|----------|----------|------|
| React Fiber | 架构升级、可中断渲染、时间切片、优先级调度 | 极高 | 困难 |
| Hooks 规则 | 链表存储、顺序依赖、为什么不能在条件中使用 | 极高 | 中等 |
| useEffect vs useLayoutEffect | 执行时机、同步/异步、DOM 操作选择 | 高频 | 中等 |
| React 19 编译器 | React Compiler（自动 memo）、RSC、Actions | 高频 | 中等 |
| memo/useMemo/useCallback | 性能优化、引用稳定性、使用场景 | 高频 | 中等 |
| setState 同步/异步 | 合成事件、批量更新、React 18 自动批处理 | 高频 | 中等 |
| 受控 vs 非受控组件 | 表单管理、数据源、ref vs state | 高频 | 简单 |

---

## Q1：React Fiber 是什么？解决了什么问题？

### 核心答案

React Fiber 是 React 16 引入的**新的协调引擎**（reconciler），它重新实现了 React 的核心算法，目标是实现**增量渲染**——将渲染工作分割成多个小任务，可中断、可恢复，解决了之前 Stack Reconciler 不可中断导致的**主线程长时间阻塞**问题。

### 解决的问题

**旧架构（Stack Reconciler）的问题：**

```
用户输入 → 主线程被 React 渲染占用 → 用户感到卡顿
[======= React 同步渲染（不可中断）=======]
                                          ↑ 用户输入被延迟处理
```

**Fiber 架构的解决方案：**

```
[React 渲染块1] → [用户输入处理] → [React 渲染块2] → [React 渲染块3]
                ↑ 可随时中断，让出主线程给高优先级任务
```

### Fiber 的核心机制

#### 1. Fiber 节点（Fiber Node）

每个 React 元素对应一个 Fiber 节点，Fiber 节点是一个 JavaScript 对象：

```js
// Fiber 节点的核心数据结构（简化版）
class FiberNode {
  tag: WorkTag;          // 节点类型（FunctionComponent/ClassComponent/HostComponent 等）
  key: string | null;    // 节点的 key
  type: any;             // 组件类型（函数组件是函数本身，原生元素是标签名如 'div'）

  // Fiber 树结构（链表）
  return: Fiber | null;  // 父节点
  child: Fiber | null;   // 第一个子节点
  sibling: Fiber | null; // 下一个兄弟节点

  // 工作相关
  pendingProps: any;     // 新的 props
  memoizedProps: any;    // 上一次渲染的 props
  memoizedState: any;    // 上一次渲染的 state
  updateQueue: any;      // 更新队列
  effectTag: number;     // 副作用标记（插入/更新/删除）
  nextEffect: Fiber | null; // 副作用链

  // 调度相关
  lanes: Lanes;          // 优先级
  childLanes: Lanes;     // 子树优先级
  alternate: Fiber | null; // current 和 workInProgress 互指
}
```

#### 2. 双缓冲（Double Buffering）

React 维护两棵 Fiber 树：

- **current 树**：当前屏幕上显示的 Fiber 树
- **workInProgress 树**：正在构建的 Fiber 树

两棵树通过 `alternate` 属性互相指向，构建完成后直接**切换指针**（而非整树替换），性能高效。

#### 3. 时间切片（Time Slicing）

```js
// 简化版时间切片机制
function workLoop(deadline) {
  // shouldYield() 检查是否还有剩余时间（默认 5ms）
  while (workInProgress && !shouldYield()) {
    // 执行一个工作单元
    performUnitOfWork(workInProgress)
  }

  if (workInProgress) {
    // 时间不够了，让出主线程，下次继续
    requestIdleCallback(workLoop)
  }
}

// requestIdleCallback 的 polyfill（React 实际使用 Scheduler 包）
// Scheduler 基于 MessageChannel 实现，比 requestIdleCallback 更可靠
```

#### 4. 优先级调度（Lane 模型）

```js
// React 使用 Lane（车道）模型表示优先级
const Lanes = {
  NoLane: 0b0000000000000000000000000000000,
  SyncLane: 0b0000000000000000000000000000001,          // 同步优先级（最高）
  InputContinuousLane: 0b0000000000000000000000000000100, // 连续输入
  DefaultLane: 0b0000000000000000000000000010000,         // 默认
  IdleLane: 0b0100000000000000000000000000000,            // 空闲（最低）
}

// 不同更新的优先级：
// - 用户输入（点击、输入）→ InputContinuousLane（高优先级）
// - 数据请求返回 → DefaultLane（普通优先级）
// - 离屏内容 → IdleLane（低优先级）
```

::: tip Fiber 核心价值
Fiber 不仅仅是一个性能优化，它使得 React 可以：
1. **中断渲染**，让出主线程给浏览器处理用户交互
2. **恢复渲染**，从中断处继续
3. **优先级调度**，高优先级更新可以打断低优先级更新
4. **并发模式**（Concurrent Mode）的基础
:::

---

## Q2：Hooks 为什么不能在条件语句中使用？

### 核心答案

React Hooks 在 Fiber 节点上以**链表形式**存储，Hooks 的调用顺序决定了它们在链表中的位置。如果在条件语句中使用 Hooks，会导致调用顺序改变，链表结构错乱，状态与正确的 Hook 不匹配，引发不可预期的 bug。

### 原理：链表存储

```js
// Fiber 节点上的 Hooks 存储结构（简化版）
function FiberNode() {
  this.memoizedState = null; // Hooks 链表的头节点
}

// Hook 的数据结构
function Hook() {
  this.memoizedState = null;  // 当前 Hook 的状态值
  this.baseState = null;      // 基础状态
  this.queue = null;          // 更新队列
  this.next = null;           // 指向下一个 Hook（链表）
}

// 每个 Hook 在链表中的位置是固定的，由调用顺序决定
// 组件渲染时，React 按顺序遍历 Hook 链表
```

### 问题演示

```jsx
// ❌ 错误：在条件中使用 Hook
function Component({ condition }) {
  const [name, setName] = useState('')  // Hook 0

  if (condition) {
    const [age, setAge] = useState(0)   // 问题：Hook 1 可能不存在！
  }

  const [email, setEmail] = useState('') // Hook 2 或 Hook 1？

  // 第一次渲染（condition = true）：
  // 链表：[name(0)] → [age(1)] → [email(2)]
  //
  // 第二次渲染（condition = false）：
  // 链表：[name(0)] → [email(1)]  ← email 拿到了 age 的状态！
  // 状态错乱！
}
```

### 正确做法

```jsx
// ✅ 正确：始终在顶层调用 Hook
function Component({ condition }) {
  const [name, setName] = useState('')
  // 将条件逻辑放在 Hook 内部
  const [age, setAge] = useState(0)
  const [email, setEmail] = useState('')

  // 在渲染逻辑中使用条件
  if (condition) {
    return <div>{name} - {age}</div>
  }
  return <div>{name} - {email}</div>
}
```

::: danger Hooks 使用规则
1. **只在顶层调用**：不要在循环、条件或嵌套函数中调用 Hook
2. **只在 React 函数中调用**：在函数组件或自定义 Hook 中调用，不要在普通 JS 函数中调用
3. 这些规则可以通过 ESLint 插件 `eslint-plugin-react-hooks` 自动检测
:::

---

## Q3：useEffect 和 useLayoutEffect 的区别？执行时机？

### 核心答案

| 特性 | useEffect | useLayoutEffect |
|------|-----------|-----------------|
| 执行时机 | **渲染完成后**异步执行（不阻塞浏览器绘制） | **DOM 更新后、浏览器绘制前**同步执行（阻塞绘制） |
| 对用户的影响 | 用户先看到渲染结果，再执行副作用 | 在用户看到渲染结果之前执行副作用 |
| 使用场景 | 数据请求、订阅、日志、定时器 | 读取 DOM 布局、同步修改 DOM 避免闪烁 |
| SSR | 不会在服务端执行 | 在服务端会触发警告 |

### 执行时序图

```
React 渲染阶段：
  → 调用组件函数
  → 计算新的虚拟 DOM
  → 提交到真实 DOM（commit 阶段）

DOM 更新完成：
  ├─ useLayoutEffect 执行（同步，阻塞绘制）
  │   └─ 此时 DOM 已更新，但浏览器还未绘制
  │
  ├─ 浏览器绘制（paint）← 用户看到新内容
  │
  └─ useEffect 执行（异步，不阻塞绘制）
```

### 代码示例

```jsx
// useLayoutEffect 典型场景：避免闪烁
function Tooltip() {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const tooltipRef = useRef(null)

  // ❌ 使用 useEffect：用户会先看到闪烁（先显示在错误位置，再跳到正确位置）
  // useEffect(() => {
  //   const rect = tooltipRef.current.getBoundingClientRect()
  //   setPosition({ x: rect.x, y: rect.y - 10 })
  // }, [])

  // ✅ 使用 useLayoutEffect：在绘制前调整位置，用户看不到闪烁
  useLayoutEffect(() => {
    const rect = tooltipRef.current.getBoundingClientRect()
    // 在浏览器绘制前同步调整位置
    setPosition({ x: rect.x, y: rect.y - 10 })
  }, [])

  return <div ref={tooltipRef} style={{ left: position.x, top: position.y }} />
}
```

::: tip 选择建议
**默认使用 `useEffect`**，只有在确实需要读取 DOM 布局信息并同步修改 DOM 时才使用 `useLayoutEffect`。过度使用 `useLayoutEffect` 会阻塞浏览器绘制，影响性能。
:::

---

## Q4：React 19 编译器自动优化解决了什么问题？

### 核心答案

React 19 引入了 **React Compiler**（React 编译器），在构建时对组件代码进行自动优化。它的核心价值是**让开发者不再需要手动使用 `useMemo`、`useCallback`、`React.memo`**，编译器会自动分析代码依赖并注入缓存逻辑。

### 解决的问题

**问题一：手动记忆化（Memoization）的心智负担**

```jsx
// React 18 及之前：开发者需要手动添加记忆化
function TodoList({ todos, filter }) {
  // 需要手动 useMemo 避免不必要的重新计算
  const filteredTodos = useMemo(
    () => todos.filter(t => t.status === filter),
    [todos, filter]
  )

  // 需要手动 useCallback 避免子组件不必要的重渲染
  const handleDelete = useCallback((id) => {
    onDelete(id)
  }, [onDelete])

  // 需要手动 React.memo 包裹子组件
  return <ExpensiveList items={filteredTodos} onDelete={handleDelete} />
}

// React 19 + Compiler：编译器自动处理
function TodoList({ todos, filter }) {
  // 编译器自动分析依赖，注入缓存逻辑
  const filteredTodos = todos.filter(t => t.status === filter)
  const handleDelete = (id) => onDelete(id)

  return <ExpensiveList items={filteredTodos} onDelete={handleDelete} />
}
```

**问题二：重复渲染（Re-rendering）**

编译器通过静态分析，自动识别那些值在组件重新渲染时没有变化，并跳过与之相关的子组件渲染。

**问题三：记忆化规则复杂**

开发者需要理解"引用相等性"、"依赖数组"等概念，且容易遗漏依赖导致过期闭包问题。编译器自动处理这些，消除人为错误。

### 编译器工作原理

React Compiler 使用**静态分析**技术，在构建时分析组件代码，识别可缓存的值和函数：

1. 分析每个变量和函数的依赖关系
2. 识别哪些值在依赖不变时可以复用
3. 自动注入 `useMemo`/`useCallback` 等效代码
4. 遵循 React 的规则（Rules of React），并严格检查代码是否符合规则

::: warning 注意
React Compiler 目前仍在 Beta 阶段，但代表了 React 未来的发展方向。它的目标是让 React 应用**默认就是高性能的**，降低开发者进行性能优化的门槛。
:::

---

## Q5：React.memo / useMemo / useCallback 的关系和使用场景？

### 对比表格

| 特性 | React.memo | useMemo | useCallback |
|------|------------|---------|-------------|
| 类型 | 高阶组件（HOC） | Hook | Hook |
| 作用对象 | 整个组件 | 任意值 | 函数 |
| 返回值 | 组件 | 缓存的计算结果值 | 缓存的函数引用 |
| 对比方式 | 浅比较 props | 比较依赖数组 | 比较依赖数组 |
| 使用场景 | 避免纯组件不必要的重渲染 | 缓存昂贵的计算结果 | 缓存传给子组件的回调函数 |

### 使用场景

```jsx
// 1. React.memo —— 包裹组件，props 不变时跳过渲染
const ExpensiveChild = React.memo(function ExpensiveChild({ data, onDelete }) {
  console.log('ExpensiveChild rendered')
  return <div>{data.map(item => <Item key={item.id} item={item} />)}</div>
})

// 2. useMemo —— 缓存计算结果
function ProductList({ products, category }) {
  // 只有 products 或 category 变化时才重新过滤
  const filteredProducts = useMemo(
    () => products.filter(p => p.category === category),
    [products, category]
  )

  // 缓存复杂对象，避免每次渲染创建新引用
  const config = useMemo(
    () => ({
      pageSize: 20,
      sortBy: 'price',
      filter: category
    }),
    [category]
  )

  return <List data={filteredProducts} config={config} />
}

// 3. useCallback —— 缓存函数引用
function Parent() {
  const [count, setCount] = useState(0)

  // 没有 useCallback：每次渲染都创建新函数 → 子组件 memo 失效
  // const handleDelete = (id) => { ... }

  // 有 useCallback：函数引用稳定 → 子组件 memo 有效
  const handleDelete = useCallback((id) => {
    setItems(prev => prev.filter(item => item.id !== id))
  }, []) // 空依赖表示不依赖任何外部变量

  return <ExpensiveChild onDelete={handleDelete} />
}
```

::: warning 不要滥用
- 不是所有组件都需要 `React.memo`：如果 props 频繁变化，memo 反而增加了比较开销
- 不是所有计算都需要 `useMemo`：简单计算（如 `a + b`）的开销远小于 memo 比较
- 不是所有函数都需要 `useCallback`：只在传递给经过 memo 的子组件时才需要
:::

---

## Q6：setState 是同步还是异步？

### 核心答案

**在 React 18 之前**：`setState` 在合成事件和生命周期中是"异步"的（批量更新），在 `setTimeout`/原生事件/`Promise.then` 中是同步的。

**在 React 18 之后**：所有 `setState` 都是异步批量的（自动批处理 Automatic Batching）。

### React 18 自动批处理

```jsx
// React 17：只在 React 事件处理中批量更新
function handleClick() {
  // ✅ 批量更新（一次渲染）
  setCount(c => c + 1)
  setFlag(f => !f)
}

setTimeout(() => {
  // ❌ 不批量更新（两次渲染）
  setCount(c => c + 1)
  setFlag(f => !f)
}, 1000)

// React 18：所有场景都批量更新
function handleClick() {
  // ✅ 批量更新
  setCount(c => c + 1)
  setFlag(f => !f)
}

setTimeout(() => {
  // ✅ 批量更新（React 18 新增）
  setCount(c => c + 1)
  setFlag(f => !f)
}, 1000)

// 如果确实需要同步获取更新后的值，使用 flushSync
import { flushSync } from 'react-dom'

function handleClick() {
  flushSync(() => {
    setCount(c => c + 1) // DOM 立即更新
  })
  // 此时可以获取到最新的 DOM
  console.log(domRef.current.textContent) // 最新值
}
```

### 批量更新的原理

```js
// React 18 批量更新机制简化
let isBatchingUpdates = false
const updateQueue = []

function batchedUpdates(fn) {
  isBatchingUpdates = true
  fn()
  isBatchingUpdates = false
  // 批量执行队列中的更新
  flushUpdateQueue()
}

function setState(newState) {
  if (isBatchingUpdates) {
    // 批量模式：加入队列，等待统一处理
    updateQueue.push(newState)
  } else {
    // 非批量模式：立即更新（React 18 中几乎不会进入此分支）
    flushUpdateQueue(newState)
  }
}
```

---

## Q7：受控组件 vs 非受控组件

### 核心答案

| 特性 | 受控组件（Controlled） | 非受控组件（Uncontrolled） |
|------|----------------------|--------------------------|
| 数据源 | React state 作为"唯一数据源" | DOM 自身维护状态 |
| 获取值 | `event.target.value`（通过 state） | `ref.current.value` |
| 更新方式 | `onChange` → `setState` | 直接操作 DOM |
| 优点 | 数据流清晰、便于验证、实时控制 | 代码简洁、性能好（不需要频繁 setState） |
| 缺点 | 每个输入都需要 state 和 handler | 数据流不透明、难以验证 |

### 代码示例

```jsx
// 受控组件
function ControlledForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log({ name, email }) // state 始终是最新值
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Name"
      />
      <input
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Email"
      />
      <button type="submit">Submit</button>
    </form>
  )
}

// 非受控组件
function UncontrolledForm() {
  const nameRef = useRef(null)
  const emailRef = useRef(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    // 直接从 DOM 读取值
    console.log({
      name: nameRef.current.value,
      email: emailRef.current.value
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <input ref={nameRef} defaultValue="" placeholder="Name" />
      <input ref={emailRef} defaultValue="" placeholder="Email" />
      <button type="submit">Submit</button>
    </form>
  )
}
```

---

## 面试追问环节

**Q：React 18 的 Concurrent Mode 和旧模式有什么区别？**

Concurrent Mode 是一个可中断的渲染模式。在旧模式下，一旦开始渲染就必须完成；在 Concurrent Mode 下，React 可以中断渲染去处理更高优先级的任务（如用户输入），然后恢复渲染。这使得应用可以保持响应性，即使在进行大量渲染时也不会卡顿。

**Q：React 中 key 的作用？**

key 帮助 React 识别哪些元素在列表中发生了变化（添加、删除、重新排序）。在 Diff 算法中，React 通过 key 来判断元素是否可以复用，从而减少不必要的 DOM 操作。key 应当是唯一且稳定的标识符。

**Q：React 19 的 Server Components 和之前的 SSR 有什么区别？**

RSC 允许组件在服务端运行，其代码不会发送到客户端，可以减小 bundle 大小。SSR 只是将组件渲染为 HTML 字符串发送到客户端，但组件代码仍然会发送到客户端进行 hydration。RSC 是"零 JS"组件，真正做到服务端代码不会泄漏到客户端。