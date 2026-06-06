# 状态管理

## ⭐ 面试重点速览

| 知识模块 | 重点内容 | 面试频率 |
|----------|----------|----------|
| Context API | 适用场景、性能问题、拆分 Context 优化、与状态库的边界 | 高 |
| Redux Toolkit | slice/createAsyncThunk/immer 集成、中间件原理 | 高 |
| Zustand | 极简 API、无 Provider、与 Redux 对比、immer 中间件 | 高 |
| Jotai | 原子化状态、派生原子、与 Recoil 的关系 | 中 |
| 选型对比 | 学习曲线、包体积、TS 支持、适用场景矩阵 | 高 |

---

## 状态管理的分层视角

在 React 应用中，状态可以分为多个层级，不同层级适用不同的解决方案：

```
状态层级金字塔：

        ┌──────────────┐
        │  服务端状态    │  ← React Query / SWR / Apollo
        │  (Server)     │     缓存、同步、去重请求
        ├──────────────┤
        │  全局客户端状态 │  ← Redux / Zustand / Jotai
        │  (Global)     │     跨组件共享的状态
        ├──────────────┤
        │  组件树状态    │  ← Context API
        │  (Tree)       │     子树内共享的状态
        ├──────────────┤
        │  组件状态      │  ← useState / useReducer
        │  (Local)      │     单个组件内部的状态
        └──────────────┘
```

::: tip 选择原则
由下往上选择：能用组件状态解决的，不用 Context；能用 Context 解决的，不用全局状态库；服务端数据优先使用 React Query / SWR，而非手动管理。
:::

---

## Context API

### 适用场景

Context API 适合**低频变化、中等范围**的状态共享：

- 主题（theme）
- 国际化语言（locale）
- 认证用户信息（当前用户）
- 功能开关（feature flags）

### 性能问题与优化

::: danger Context 的核心性能问题
Context value 一旦变化，**所有消费该 Context 的组件都会重渲染**，即使它们只使用了 value 的一小部分。
:::

```jsx
// ❌ 问题：一个 Context 包含多个不相关的状态
const AppContext = createContext();

function AppProvider({ children }) {
  const [theme, setTheme] = useState('light');
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);

  // 每次任何状态变化，所有消费者都重渲染
  const value = { theme, setTheme, user, setUser, notifications, setNotifications };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
```

```jsx
// ✅ 优化 1：拆分 Context —— 按变化频率分组
const ThemeContext = createContext();
const UserContext = createContext();
const NotificationContext = createContext();

function AppProvider({ children }) {
  return (
    <ThemeProvider>
      <UserProvider>
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </UserProvider>
    </ThemeProvider>
  );
}

// ✅ 优化 2：拆分状态和更新函数 —— 减少不必要的渲染
const ThemeStateContext = createContext();
const ThemeDispatchContext = createContext();

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');

  return (
    <ThemeStateContext.Provider value={theme}>
      {/* setTheme 引用稳定，消费者不会因 theme 变化而重渲染 */}
      <ThemeDispatchContext.Provider value={setTheme}>
        {children}
      </ThemeDispatchContext.Provider>
    </ThemeStateContext.Provider>
  );
}

// 只消费 dispatch 的组件不会因 theme 变化重渲染
function ThemeToggle() {
  const setTheme = useContext(ThemeDispatchContext);
  return <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>切换</button>;
}

// ✅ 优化 3：useMemo 稳定 Context value
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');

  // 只在 theme 变化时创建新引用
  const value = useMemo(() => ({ theme, setTheme }), [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
```

### 何时不该用 Context

- 高频更新的状态（如输入框值、动画状态）—— 会导致大面积重渲染
- 大型应用（100+ 组件依赖）—— 维护成本高，缺少中间件和 DevTools
- 需要复杂的状态逻辑（如中间件、持久化、时间旅行）—— Context 不具备这些能力

---

## Redux Toolkit

### 核心概念

```jsx
// ===== 创建 Slice =====
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// 异步 thunk —— 自动生成 pending/fulfilled/rejected action
const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (params, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/users?page=${params.page}`);
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const usersSlice = createSlice({
  name: 'users',
  initialState: {
    list: [],
    loading: false,
    error: null,
    currentPage: 1,
  },
  reducers: {
    // 同步 action
    setPage(state, action) {
      state.currentPage = action.payload; // Immer 自动处理不可变性
    },
    removeUser(state, action) {
      state.list = state.list.filter(u => u.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setPage, removeUser } = usersSlice.actions;
export default usersSlice.reducer;
```

### Immer 集成原理

Redux Toolkit 内置了 Immer，允许在 reducer 中"直接修改"状态：

```jsx
// 传统 Redux —— 必须手动保证不可变性，嵌套深时极其繁琐
const reducer = (state, action) => {
  switch (action.type) {
    case 'UPDATE_NESTED':
      return {
        ...state,
        users: {
          ...state.users,
          [action.payload.id]: {
            ...state.users[action.payload.id],
            profile: {
              ...state.users[action.payload.id].profile,
              name: action.payload.name,
            },
          },
        },
      };
  }
};

// Redux Toolkit + Immer —— 直接修改即可
const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    updateNested(state, action) {
      // Immer 使用 Proxy 追踪修改，自动生成不可变副本
      state.users[action.payload.id].profile.name = action.payload.name;
    },
  },
});
```

### 中间件架构

```
Action → Middleware 1 → Middleware 2 → Middleware 3 → Reducer → Store 更新
           ↑               ↑               ↑
       redux-thunk    redux-logger    自定义中间件
```

```jsx
// 自定义中间件示例 —— 日志记录
const loggerMiddleware = (store) => (next) => (action) => {
  console.group(action.type);
  console.log('prev state:', store.getState());
  console.log('action:', action);

  const result = next(action); // 调用下一个中间件

  console.log('next state:', store.getState());
  console.groupEnd();

  return result;
};
```

---

## Zustand

### 极简 API

Zustand 的核心优势是**极简**——无 Provider、无 Context、无样板代码：

```jsx
import { create } from 'zustand';

// 创建 store —— 一个简单的函数
const useBearStore = create((set, get) => ({
  bears: 0,
  fish: 0,

  // 同步 action
  increaseBears: () => set((state) => ({ bears: state.bears + 1 })),
  removeAllBears: () => set({ bears: 0 }),

  // 异步 action —— 与同步 action 写法完全一致
  fetchBears: async () => {
    const response = await fetch('/api/bears');
    const count = await response.json();
    set({ bears: count });
  },

  // 使用 get() 读取当前状态
  eatFish: () => {
    const { fish } = get();
    if (fish > 0) {
      set((state) => ({ fish: state.fish - 1 }));
    }
  },
}));

// 使用 —— 在任何组件中直接调用，无需 Provider
function BearCounter() {
  const bears = useBearStore((state) => state.bears); // 精确订阅
  return <h1>{bears} bears</h1>;
}

function Controls() {
  const increaseBears = useBearStore((state) => state.increaseBears);
  const fetchBears = useBearStore((state) => state.fetchBears);

  return (
    <>
      <button onClick={increaseBears}>Add Bear</button>
      <button onClick={fetchBears}>Fetch Bears</button>
    </>
  );
}
```

### 与 Redux 对比

| 对比维度 | Redux Toolkit | Zustand |
|----------|---------------|---------|
| 样板代码 | 需要 createSlice + configureStore + Provider | 一个 create() 调用 |
| 学习曲线 | 中等（需要理解 action/reducer/middleware） | 低（几乎零学习成本） |
| 包体积 | ~12KB gzipped | ~1.5KB gzipped |
| TypeScript | 优秀（需要额外类型定义） | 优秀（自动推断） |
| 中间件 | 丰富的中间件生态 | 内置 persist/immer/devtools |
| DevTools | Redux DevTools 功能最强 | 支持 Redux DevTools |
| 不可变性 | Immer 内置 | 可选 immer 中间件 |
| 适用场景 | 大型应用、严格的数据流管控 | 中小型应用、快速开发 |

### 常用中间件

```jsx
import { create } from 'zustand';
import { persist, immer } from 'zustand/middleware';

const useStore = create(
  persist(
    immer((set, get) => ({
      user: { name: '', preferences: {} },
      setUserName: (name) => {
        // immer 中间件允许直接修改
        set((state) => { state.user.name = name; });
      },
      setPreference: (key, value) => {
        set((state) => { state.user.preferences[key] = value; });
      },
    })),
    {
      name: 'user-storage', // localStorage key
      partialize: (state) => ({ user: state.user }), // 只持久化 user
    }
  )
);
```

---

## Jotai

### 原子化状态

Jotai 受 Recoil 启发，采用**原子化**（Atomic）状态管理——状态被拆分为最小的独立单元（atom）：

```jsx
import { atom, useAtom } from 'jotai';

// 1. 定义原子 —— 最小的状态单元
const countAtom = atom(0);
const textAtom = atom('hello');

// 2. 派生原子 —— 基于其他原子计算
const doubleCountAtom = atom((get) => get(countAtom) * 2);

// 3. 可写派生原子 —— 既能读也能写
const countWithLogAtom = atom(
  (get) => get(countAtom),
  (get, set, newValue) => {
    console.log(`count changed: ${get(countAtom)} → ${newValue}`);
    set(countAtom, newValue);
  }
);

// 4. 使用 —— 与 useState 几乎相同的 API
function Counter() {
  const [count, setCount] = useAtom(countAtom);
  const [doubleCount] = useAtom(doubleCountAtom);

  return (
    <div>
      <p>Count: {count}</p>
      <p>Double: {doubleCount}</p>
      <button onClick={() => setCount(c => c + 1)}>+1</button>
    </div>
  );
}
```

### 与 Zustand 的对比

| 维度 | Zustand | Jotai |
|------|---------|-------|
| 状态模型 | 单一 Store（可拆分为多个 slice） | 多原子（每个 atom 独立） |
| 依赖追踪 | 手动选择器 `useStore(s => s.x)` | 自动追踪 atom 依赖 |
| 派生状态 | 通过 get() 手动计算 | 派生原子自动计算 |
| 性能 | 精确订阅（selector） | 精确订阅（atom 级别） |
| 心智模型 | 接近 Redux | 接近 useState |
| 适用场景 | 全局状态管理 | 细粒度状态、大量独立状态 |

---

## 状态管理方案选型对比

| 方案 | 学习曲线 | 包体积 | TS 支持 | 适用场景 |
|------|----------|--------|---------|----------|
| Context + useReducer | 低 | 0（内置） | 好 | 小型应用、低频更新的主题/语言 |
| Redux Toolkit | 中 | ~12KB | 优秀 | 大型应用、复杂状态逻辑、团队协作 |
| Zustand | 低 | ~1.5KB | 优秀 | 中小型应用、快速开发、简单全局状态 |
| Jotai | 低 | ~3KB | 优秀 | 细粒度状态、大量独立状态单元 |
| MobX | 中 | ~16KB | 好 | 复杂对象图、需要响应式编程 |
| XState | 高 | ~18KB | 好 | 复杂状态机、多步骤流程 |

---

## ⭐ 面试高频问题汇总

### Q1：Redux vs Zustand 如何选型？

**选 Redux Toolkit 的场景**：
- 大型团队协作，需要严格的代码规范
- 需要对状态变更进行精细的时间旅行调试
- 已有 Redux 技术栈的项目
- 复杂的中间件需求（如 saga、observable）

**选 Zustand 的场景**：
- 中小型项目，追求开发效率
- 不需要复杂的中间件
- 团队不想在状态管理上投入太多学习成本
- 需要极小的包体积（如库/SDK 开发）

```jsx
// Zustand 的简洁性 —— 5 行代码完成所有设置
const useStore = create((set) => ({
  count: 0,
  inc: () => set((s) => ({ count: s.count + 1 })),
}));

// Redux Toolkit 的规范性 —— 需要 store + slice + Provider
const slice = createSlice({ /* ... */ });
const store = configureStore({ reducer: { counter: slice.reducer } });
// 还需要 <Provider store={store}> 包裹根组件
```

### Q2：Context 性能优化的核心思路？

1. **拆分 Context**：按变化频率和功能域拆分，避免无关状态变化导致大面积重渲染
2. **分离读写**：将状态值和更新函数放在不同的 Context 中，只消费更新函数的组件不会因状态变化重渲染
3. **useMemo 稳定 value**：防止 Provider 的 value 引用在每次渲染时变化
4. **组件提升**：将消费 Context 的子树抽离为独立组件，用 `React.memo` 包裹
5. **使用订阅模式**：对于高频变化的值，使用 `useSyncExternalStore` 或状态库替代 Context

### Q3：Jotai 的原子化模型有什么优势？

原子化状态的核心优势是**精确的依赖追踪和渲染优化**：

- 每个 atom 是独立的，修改 `countAtom` 不会触发 `textAtom` 的消费者重渲染
- 派生原子自动追踪依赖，`doubleCountAtom` 只在 `countAtom` 变化时重新计算
- 不需要像 Redux 那样手动编写 selector 或像 Zustand 那样使用选择器函数
- 可以按需组合原子，灵活度远高于单一 Store 模型

---

## 面试追问环节

**Q：Redux 的中间件原理是什么？**

Redux 中间件通过 **函数柯里化** 实现。核心代码（简化）：

```jsx
function applyMiddleware(...middlewares) {
  return (createStore) => (reducer, initialState) => {
    const store = createStore(reducer, initialState);
    let dispatch = store.dispatch;

    const middlewareAPI = {
      getState: store.getState,
      dispatch: (action) => dispatch(action),
    };

    // 依次执行中间件，每个中间件增强 dispatch
    const chain = middlewares.map(m => m(middlewareAPI));
    dispatch = chain.reduceRight((next, middleware) => middleware(next), store.dispatch);

    return { ...store, dispatch };
  };
}
```

**Q：Zustand 如何实现无 Provider 的全局状态？**

Zustand 的原理是**基于发布-订阅模式**，不依赖 React Context：

1. `create()` 创建一个闭包，保存状态和订阅者列表
2. 组件调用 `useStore(selector)` 时，订阅状态变化
3. `set()` 更新状态后，通知所有订阅者，触发组件重渲染
4. 因为不依赖 Context，所以不需要 Provider 包裹

**Q：什么时候应该用 useReducer 而不是 useState？**

1. 状态逻辑复杂，涉及多个子值（如包含多个字段的表单）
2. 下一个状态依赖于上一个状态（如购物车的增删改）
3. 多个状态更新之间有逻辑关联，需要保证原子性
4. 需要将状态更新逻辑抽离到组件外部进行测试