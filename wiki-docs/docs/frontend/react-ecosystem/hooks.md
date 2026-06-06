# Hooks 核心

## ⭐ 面试重点速览

| 知识模块 | 重点内容 | 面试频率 |
|----------|----------|----------|
| useState | 函数式更新、惰性初始化、与 class setState 对比 | 极高 |
| useEffect | 执行时机、清理函数、依赖数组陷阱、生命周期映射 | 极高 |
| useMemo/useCallback | 缓存原理、性能优化时机、滥用风险 | 极高 |
| useRef | DOM 引用、保存可变值、与 useState 区别 | 高 |
| useContext | Context 消费、性能优化、拆分策略 | 高 |
| 自定义 Hooks | 设计原则、常见模式、useDebounce/usePrevious 等 | 高 |
| Hooks 规则 | 顶层调用、函数组件、底层原因 | 中高 |

---

## 为什么需要 Hooks？

React 16.8 引入 Hooks 之前，函数组件只能作为无状态组件使用，一旦需要状态或副作用，就必须转换为 Class 组件。Class 组件存在以下痛点：

1. **逻辑复用困难**：HOC 和 Render Props 导致"嵌套地狱"，组件树层级深
2. **生命周期碎片化**：相关逻辑分散在 `componentDidMount`、`componentDidUpdate`、`componentWillUnmount` 中
3. **this 绑定问题**：需要手动绑定 this，或者使用箭头函数，增加心智负担
4. **Class 编译后体积大**：Class 不能被很好压缩，且热重载不稳定

::: tip Hooks 的本质
Hooks 是让函数组件**拥有状态和副作用能力**的机制。它们不是对 Class 组件的简单替换，而是**全新的编程范式**——将组件逻辑组织为可组合的函数，而非分散在生命周期方法中。
:::

---

## useState

### 基本使用

```jsx
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  // useState 返回 [当前状态值, 更新函数]
  // 初始值 0 只在首次渲染时使用

  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
```

### 函数式更新（Functional Update）

当新状态依赖于旧状态时，必须使用函数式更新，避免闭包陷阱：

```jsx
function Counter() {
  const [count, setCount] = useState(0);

  // ❌ 错误 —— 连续调用时 count 都是闭包中的旧值
  const handleWrong = () => {
    setCount(count + 1); // 每次都是基于渲染时的 count 值
    setCount(count + 1); // 不会累加！
  };

  // ✅ 正确 —— 函数式更新，基于最新状态
  const handleCorrect = () => {
    setCount(prev => prev + 1);
    setCount(prev => prev + 1); // 累加 2 次
  };

  return (
    <>
      <p>Count: {count}</p>
      <button onClick={handleWrong}>错误方式 +2</button>
      <button onClick={handleCorrect}>正确方式 +2</button>
    </>
  );
}
```

### 惰性初始化（Lazy Initialization）

当初始值计算代价高昂时，使用函数形式避免每次渲染都重新计算：

```jsx
// ❌ 每次渲染都会执行 expensiveComputation()（即使结果被忽略）
const [state, setState] = useState(expensiveComputation());

// ✅ 只在首次渲染时执行
const [state, setState] = useState(() => expensiveComputation());
```

### useState vs Class setState

| 对比维度 | useState（函数组件） | setState（Class 组件） |
|----------|---------------------|----------------------|
| 合并策略 | **不自动合并**对象，需要手动展开 | 自动浅合并顶层属性 |
| 批量更新 | React 18 中自动批量（含异步回调） | 同步环境批量，异步不批量（React 17-） |
| 更新函数 | 函数式更新 `prev => newValue` | 函数式更新 `(prevState, props) => newState` |
| 状态存储 | 多个独立状态变量 | 单一状态对象 |

```jsx
// Class 组件：自动合并
// this.setState({ name: 'Alice' }); // age 保留

// 函数组件：不自动合并，必须手动展开
const [user, setUser] = useState({ name: '', age: 0 });
setUser(prev => ({ ...prev, name: 'Alice' })); // 必须显式保留 age
```

::: warning 为什么 useState 不自动合并？
React 团队认为函数组件中把状态拆分为多个独立变量（而非一个大对象）是更推荐的做法。每个状态独立管理，更新更精确，避免不必要的渲染。
:::

---

## useEffect

### 执行时机

`useEffect` 的执行时机与 Class 生命周期有本质区别：

```jsx
useEffect(() => {
  // 这里的代码在「渲染提交到屏幕后」异步执行
  console.log('Effect 执行 —— 相当于 componentDidMount + componentDidUpdate');

  return () => {
    // 清理函数在「下一次 Effect 执行前」或「组件卸载前」执行
    console.log('清理执行 —— 相当于 componentWillUnmount');
  };
});
```

| 执行阶段 | 时机 |
|----------|------|
| Effect 本体 | DOM 更新后异步执行（不阻塞浏览器绘制） |
| useEffectLayout | DOM 更新后同步执行（阻塞绘制，用于 DOM 测量） |
| 清理函数 | 下一次 Effect 执行前 / 组件卸载前 |

### 依赖数组详解

```jsx
// 1. 无依赖数组 —— 每次渲染后都执行
useEffect(() => {
  console.log('每次渲染都执行');
});

// 2. 空依赖数组 [] —— 只在首次渲染后执行一次
useEffect(() => {
  console.log('只在 mount 时执行');
}, []);

// 3. 有依赖项 [a, b] —— a 或 b 变化时执行
useEffect(() => {
  console.log('a 或 b 发生变化时执行');
}, [a, b]);
```

### 与生命周期映射

```
Class 组件生命周期           →    useEffect 等价写法
─────────────────────────────────────────────────────
componentDidMount           →    useEffect(() => {...}, [])
componentDidUpdate          →    useEffect(() => {...})  // 无依赖数组
componentWillUnmount        →    useEffect(() => { return () => {...} }, [])
shouldComponentUpdate       →    React.memo + useMemo
```

### 经典依赖陷阱

```jsx
// ⚠️ 陷阱 1：对象/数组作为依赖 —— 每次渲染都是新引用
function BadComponent() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log('effect');
  }, [{ key: 'value' }]); // 每次渲染都是新对象，Effect 永远执行！

  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}

// ✅ 解决：使用 useMemo 稳定引用
function GoodComponent() {
  const [count, setCount] = useState(0);
  const stableObj = useMemo(() => ({ key: 'value' }), []); // 引用稳定

  useEffect(() => {
    console.log('effect');
  }, [stableObj]);

  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}

// ⚠️ 陷阱 2：函数作为依赖
function BadComponent2() {
  const fetchData = () => { /* ... */ }; // 每次渲染都是新函数

  useEffect(() => {
    fetchData();
  }, [fetchData]); // 每次渲染 Effect 都执行！
}

// ✅ 解决：使用 useCallback 稳定函数引用
function GoodComponent2() {
  const fetchData = useCallback(() => {
    /* ... */
  }, []); // 引用稳定

  useEffect(() => {
    fetchData();
  }, [fetchData]);
}
```

::: danger 面试追问：useEffect 的依赖数组能省略某个依赖吗？
不能。React 要求 Effect 的依赖数组必须**诚实声明**所有在 Effect 中使用的外部变量。如果故意省略依赖，React 的 lint 规则（`eslint-plugin-react-hooks`）会警告。省略依赖会导致闭包过期问题——Effect 中引用的变量是旧值，与 UI 展示的最新值不一致。

如果真的需要某些值但不希望触发 Effect 重新执行，应该使用 `useRef` 保存最新值，而不是省略依赖。
:::

---

## useMemo 与 useCallback

### useMemo —— 缓存计算结果

```jsx
// ❌ 每次渲染都重新计算，即使 items 没变
function ExpensiveList({ items, filter }) {
  const filtered = items.filter(item => item.includes(filter)); // 每次渲染都执行

  return <List data={filtered} />;
}

// ✅ 只在 items 或 filter 变化时重新计算
function ExpensiveList({ items, filter }) {
  const filtered = useMemo(
    () => items.filter(item => item.includes(filter)),
    [items, filter]
  );

  return <List data={filtered} />;
}
```

### useCallback —— 缓存函数引用

```jsx
// ❌ 每次渲染创建新函数，导致子组件不必要的重渲染
function Parent() {
  const [count, setCount] = useState(0);

  const handleClick = () => { console.log('clicked'); }; // 每次渲染都是新引用

  return <Child onClick={handleClick} />;
}

// ✅ 函数引用稳定，避免子组件重渲染
function Parent() {
  const [count, setCount] = useState(0);

  const handleClick = useCallback(() => {
    console.log('clicked');
  }, []); // 引用稳定

  return <Child onClick={handleClick} />;
}
```

### 何时不该用

::: warning 性能陷阱
useMemo 和 useCallback 本身有开销（创建依赖数组、比较依赖），不是所有场景都值得使用。以下场景**不应该**使用：

1. **计算很简单**时（如 `a + b`），useMemo 的创建开销 > 重新计算的开销
2. **传递给原生 DOM 元素**时，React 不会对 DOM 元素做 props 浅比较
3. **作为非 memo 组件的 prop**时，没有 `React.memo` 包裹的子组件不会跳过多余渲染
4. **依赖数组频繁变化**时，缓存总是失效，没有实际收益
:::

### useMemo 与 shouldComponentUpdate 的关系

`shouldComponentUpdate` 是 Class 组件的概念，在函数组件中对应的是 `React.memo`。`useMemo` 和 `useCallback` 配合 `React.memo` 使用才能真正跳过多余渲染：

```jsx
// 子组件使用 React.memo 包裹，props 浅比较通过才跳过渲染
const Child = React.memo(function Child({ onClick, data }) {
  console.log('Child rendered');
  return <button onClick={onClick}>Click</button>;
});

function Parent() {
  const [count, setCount] = useState(0);

  // 稳定引用 + React.memo → 子组件不会因 count 变化而重渲染
  const handleClick = useCallback(() => {}, []);
  const data = useMemo(() => ({ value: 42 }), []);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>Increment</button>
      <Child onClick={handleClick} data={data} />
    </div>
  );
}
```

---

## useRef

### 两大用途

```jsx
import { useRef, useState, useEffect } from 'react';

function Demo() {
  // 用途 1：DOM 引用 —— 获取真实 DOM 节点
  const inputRef = useRef(null);

  useEffect(() => {
    // 组件挂载后自动聚焦输入框
    inputRef.current?.focus();
  }, []);

  // 用途 2：保存可变值 —— 跨越渲染周期不触发重渲染
  const renderCount = useRef(0);
  renderCount.current += 1; // 修改不会触发重渲染

  return (
    <div>
      <input ref={inputRef} placeholder="自动聚焦" />
      <p>组件已渲染 {renderCount.current} 次</p>
    </div>
  );
}
```

### useRef vs useState

| 对比维度 | useRef | useState |
|----------|--------|----------|
| 修改后是否重渲染 | **否** | 是 |
| 值是否在渲染间保持 | 是 | 是 |
| 是否异步更新 | 同步（直接修改 `.current`） | 异步（批量更新） |
| 典型场景 | DOM 引用、定时器 ID、保存最新值 |  UI 相关的数据 |

::: tip useRef 的"逃生舱"特性
当需要在 Effect 中使用最新值，但不希望该值出现在依赖数组中时，useRef 是最佳选择：

```jsx
function Timer() {
  const [count, setCount] = useState(0);
  const latestCount = useRef(count);

  // 始终保持 ref 为最新值
  useEffect(() => {
    latestCount.current = count;
  });

  useEffect(() => {
    const id = setInterval(() => {
      // 始终读取最新 count，而不需要 count 作为依赖
      console.log('当前 count:', latestCount.current);
    }, 1000);

    return () => clearInterval(id);
  }, []); // 空依赖，只启动一次

  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```
:::

---

## useContext

### 基本使用

```jsx
import { createContext, useContext, useState } from 'react';

// 1. 创建 Context
const ThemeContext = createContext('light');

// 2. 提供值
function App() {
  const [theme, setTheme] = useState('light');

  return (
    <ThemeContext.Provider value={theme}>
      <Toolbar />
      <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>
        切换主题
      </button>
    </ThemeContext.Provider>
  );
}

// 3. 消费值
function Toolbar() {
  const theme = useContext(ThemeContext);
  return <div style={{ background: theme === 'dark' ? '#333' : '#fff' }}>当前主题：{theme}</div>;
}
```

### Context 性能优化

::: danger 性能陷阱
Context 的 value 一旦变化，**所有消费该 Context 的组件都会重渲染**，即使它们只使用了 value 的一部分属性。这是 Context 最大的性能问题。
:::

```jsx
// ❌ 问题：theme 和 locale 在一个 Context 中，切换主题时语言组件也重渲染
const AppContext = createContext({ theme: 'light', locale: 'zh' });

// ✅ 解决：拆分 Context，按使用频率分组
const ThemeContext = createContext('light');  // 变化频繁
const LocaleContext = createContext('zh');    // 几乎不变

// ✅ 进阶：使用 useMemo 稳定 Context value 引用
function App() {
  const [theme, setTheme] = useState('light');
  const [locale, setLocale] = useState('zh');

  // 使用 useMemo 确保 value 引用不会在无关状态变化时改变
  const themeValue = useMemo(() => ({ theme, setTheme }), [theme]);

  return (
    <ThemeContext.Provider value={themeValue}>
      <LocaleContext.Provider value={locale}>
        <Children />
      </LocaleContext.Provider>
    </ThemeContext.Provider>
  );
}
```

---

## 自定义 Hooks

### 设计原则

1. **命名以 `use` 开头**：React 通过命名约定识别 Hooks 并应用规则检查
2. **单一职责**：每个自定义 Hook 只做一件事
3. **返回清晰**：通常返回 `[value, setter]` 元组或 `{ data, loading, error }` 对象
4. **可组合**：自定义 Hook 可以调用其他 Hooks

### 常用模式

```jsx
// ===== useDebounce：防抖值 =====
function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer); // 清理上一次的定时器
  }, [value, delay]);

  return debouncedValue;
}

// ===== usePrevious：保存上一次的值 =====
function usePrevious(value) {
  const ref = useRef();

  useEffect(() => {
    ref.current = value; // 在 Effect 中更新，确保返回的是渲染前的值
  });

  return ref.current; // 渲染时返回的是上一次的值
}

// ===== useLocalStorage：持久化状态 =====
function useLocalStorage(key, initialValue) {
  // 惰性初始化：从 localStorage 读取
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // 同步到 localStorage
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}

// ===== useFetch：数据获取 =====
function useFetch(url) {
  const [state, setState] = useState({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false; // 竞态条件处理

    setState({ data: null, loading: true, error: null });

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (!cancelled) setState({ data, loading: false, error: null });
      })
      .catch(error => {
        if (!cancelled) setState({ data: null, loading: false, error });
      });

    return () => { cancelled = true; };
  }, [url]);

  return state;
}
```

---

## Hooks 规则

### 两条核心规则

1. **只在函数组件顶层调用 Hooks**：不要在循环、条件语句或嵌套函数中调用
2. **只在 React 函数组件或自定义 Hook 中调用 Hooks**：不要在普通 JavaScript 函数中调用

### 为什么？

React 通过 **Hooks 的调用顺序** 来维护每个 Hook 对应的状态。组件渲染时，React 内部维护一个当前正在处理的 Hook 索引，按顺序读取对应位置的状态。

```jsx
// React 内部视角（简化）
let hookIndex = 0;
const hooks = []; // 每个组件实例维护自己的 hooks 数组

function useState(initial) {
  const currentIndex = hookIndex;
  // 首次渲染时初始化，后续渲染时读取
  hooks[currentIndex] = hooks[currentIndex] ?? initial;
  const setState = (newValue) => {
    hooks[currentIndex] = newValue;
    render(); // 触发重渲染
  };
  hookIndex++;
  return [hooks[currentIndex], setState];
}

// 如果在条件语句中调用，hookIndex 的对应关系会错乱
```

::: danger 面试追问：React 如何区分组件实例的 Hooks 状态？
每个 Fiber 节点都有一个 `memoizedState` 属性，指向一个**单向链表**。链表中的每个节点存储一个 Hook 的状态（Hook 类型、当前值、依赖数组等）。每次渲染时，React 重置全局指针，然后按顺序遍历链表读取状态。这就是为什么调用顺序必须保持一致。
:::

---

## ⭐ 面试高频问题汇总

### Q1：useEffect 和 useLayoutEffect 的区别？

- **useEffect**：在浏览器**绘制完成后**异步执行，不阻塞页面渲染。适用于数据获取、订阅、手动 DOM 操作（不影响布局的）。
- **useLayoutEffect**：在 DOM 变更后、浏览器**绘制前**同步执行，会阻塞渲染。适用于需要读取 DOM 布局信息并同步修改 DOM 的场景（如测量元素尺寸后调整位置）。

```jsx
// useLayoutEffect 典型场景：避免闪烁
function Tooltip() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const ref = useRef(null);

  useLayoutEffect(() => {
    // 在绘制前计算位置，避免用户看到闪烁
    const rect = ref.current.getBoundingClientRect();
    setPosition({ x: rect.left, y: rect.bottom });
  }, []);

  return <div ref={ref} style={{ left: position.x, top: position.y }}>提示</div>;
}
```

### Q2：为什么 useCallback 包裹的函数内部读到的状态是旧的？

这是经典的 **Hooks 闭包陷阱**。当 useCallback 的依赖数组未包含某个状态时，函数内部捕获的是创建时的状态快照，后续状态更新后函数内部看到的是旧值。解决方案：

1. 将状态加入依赖数组（最推荐）
2. 使用 useRef 保存最新值（"逃生舱"模式）
3. 使用函数式更新 `setState(prev => ...)`（只适用于 setState 场景）

### Q3：useMemo 和 React.memo 的区别？

- **useMemo**：在**组件内部**缓存计算结果，避免每次渲染都重新计算
- **React.memo**：是**高阶组件**，对组件的 props 进行浅比较，props 未变化时跳过组件渲染

两者配合使用才能达到最佳效果：useMemo/useCallback 提供稳定 props 引用，React.memo 利用稳定引用跳过渲染。

---

## 面试追问环节

**Q：如果一个组件有 20 个 useState，React 如何管理它们？**

每个 useState 调用时，React 为当前 Fiber 节点的 `memoizedState` 链表追加一个新节点。20 个 useState 会产生 20 个 Hook 节点，通过单向链表串联。重渲染时，React 按调用顺序依次遍历链表，每个 Hook 节点包含对应的状态值和更新队列。

**Q：useEffect 的清理函数在什么时候执行？**

清理函数在两种情况下执行：
1. 组件卸载时（最后一次执行）
2. 下一次 Effect 执行前（先清理上一个 Effect，再执行新的）

这种设计保证了 Effect 的连续性——每个 Effect 只处理当前渲染周期的副作用，清理函数负责撤销上一个周期的副作用。

**Q：React 18 中的自动批处理（Automatic Batching）对 Hooks 有什么影响？**

React 18 之前，只有在 React 事件处理函数中的更新会被批处理，setTimeout、Promise 等异步回调中的更新不会批处理。React 18 通过 `createRoot` API 实现了**自动批处理**——所有更新都会自动批处理，减少了不必要的渲染次数。

```jsx
// React 17：这里会触发两次渲染
setTimeout(() => {
  setCount(c => c + 1);
  setFlag(f => !f);
}, 1000);

// React 18：自动批处理，只触发一次渲染
setTimeout(() => {
  setCount(c => c + 1);
  setFlag(f => !f);
}, 1000);
```