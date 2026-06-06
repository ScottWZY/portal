# Pinia 状态管理

## ⭐ 面试重点速览

| 知识模块 | 重点内容 | 面试频率 |
|----------|----------|----------|
| 设计理念 | 模块化、TypeScript 友好、无 mutations | 高 |
| 三种定义方式 | Options Store、Setup Store（推荐）、组合式风格 | 高 |
| state/getters/actions | 响应式状态、派生计算、异步操作 | 高 |
| 状态持久化 | pinia-plugin-persistedstate 插件 | 中 |
| Pinia vs Vuex | 为什么不需要 mutations？相比 Vuex 的改进 | 极高 |

---

## 一、Pinia 设计理念

::: tip Pinia 的三大设计目标
1. **彻底拥抱 TypeScript**：不再需要创建复杂的类型包装器，API 设计尽可能利用 TS 类型推导
2. **废弃 Mutations**：actions 直接支持同步和异步操作，无需区分 mutation 和 action
3. **扁平化模块**：不再需要嵌套模块，每个 Store 都是独立的，通过 `useXxxStore()` 引用
:::

### 1.1 为什么 Pinia 不需要 mutations？

```js
/**
 * Vuex 的设计 —— 为什么有 mutations？
 * 1. 通过 devtools 追踪状态变更（同步操作可被追踪）
 * 2. 强制状态变更的可预测性
 *
 * 问题：这种设计在 TypeScript 时代变得多余
 * - devtools 已经可以追踪 actions 中的状态变更
 * - 强制区分 mutation 和 action 增加了代码量
 * - 类型推导在 mutation 中很困难
 */

// Vuex 4 示例 —— 需要区分 mutation 和 action
const store = createStore({
  state: { count: 0 },
  mutations: {
    INCREMENT(state) {
      state.count++     // 同步操作，可被 devtools 追踪
    }
  },
  actions: {
    async incrementAsync({ commit }) {
      await delay(1000)
      commit('INCREMENT')  // 必须通过 mutation 修改状态
      // 如果想要追踪，还必须给 mutation 起名字，使用字符串常量
    }
  }
})

// Pinia —— 直接在 action 中修改状态
const useStore = defineStore('counter', {
  state: () => ({ count: 0 }),
  actions: {
    increment() {
      this.count++  // 直接修改，devtools 同样可以追踪
    },
    async incrementAsync() {
      await delay(1000)
      this.count++  // 异步操作也直接修改
    }
  }
})
```

---

## 二、三种定义方式

### 2.1 Options Store（类 Vuex 风格）

```js
import { defineStore } from 'pinia'

/**
 * Options Store —— 与 Vuex 类似的 Options API 风格
 * 适合从 Vuex 迁移的开发者
 */
export const useCounterStore = defineStore('counter', {
  // 状态（必须使用箭头函数返回对象，保证 SSR 兼容）
  state: () => ({
    count: 0,
    name: 'Counter'
  }),

  // 计算属性（类似 computed）
  getters: {
    doubleCount: (state) => state.count * 2,

    // 在 getter 中访问其他 getter（使用 this，但不能用箭头函数）
    doubleCountPlusOne() {
      return this.doubleCount + 1
    },

    // 带参数的 getter（返回函数）
    countMultipliedBy: (state) => {
      return (multiplier) => state.count * multiplier
    }
  },

  // 操作（同步/异步均可，直接修改 state）
  actions: {
    increment() {
      this.count++
    },
    async incrementAsync(delay: number) {
      await new Promise(resolve => setTimeout(resolve, delay))
      this.count++
    },
    // 调用其他 action
    async incrementIfOdd() {
      if (this.count % 2 === 1) {
        await this.incrementAsync(500)
      }
    }
  }
})
```

### 2.2 Setup Store（推荐）

```js
import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

/**
 * Setup Store —— 使用 Composition API 风格
 * 语法通 Vue 组件的 setup 函数，推荐使用
 *
 * 优势：
 * 1. 可以使用 Vue 的 Composition API（ref/reactive/computed/watch）
 * 2. 可以创建 watcher 监听状态变化
 * 3. 可以自由使用其他组合函数
 * 4. 更好的 TypeScript 类型推导
 */
export const useUserStore = defineStore('user', () => {
  // ====== state ======
  const user = ref(null)
  const token = ref(localStorage.getItem('token') || '')
  const loading = ref(false)

  // ====== getters ======
  const isLoggedIn = computed(() => !!token.value)
  const userName = computed(() => user.value?.name ?? 'Guest')

  // ====== actions ======
  async function login(username: string, password: string) {
    loading.value = true
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
      })
      const data = await response.json()
      token.value = data.token
      user.value = data.user
      localStorage.setItem('token', data.token)
    } finally {
      loading.value = false
    }
  }

  function logout() {
    token.value = ''
    user.value = null
    localStorage.removeItem('token')
  }

  // ====== watcher ======
  // Setup Store 可以使用 watch，Options Store 不能
  watch(token, (newToken) => {
    if (newToken) {
      localStorage.setItem('token', newToken)
    }
  })

  // 返回所有需要暴露的内容
  return { user, token, loading, isLoggedIn, userName, login, logout }
})
```

### 2.3 使用 Store

```vue
<script setup>
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'

const userStore = useUserStore()

// 方式一：直接访问（注意：store 是 reactive 对象，直接解构会丢失响应式）
console.log(userStore.token)  // ✅ 直接访问可以

// 方式二：使用 storeToRefs 保持响应式解构（推荐）
const { user, token, loading, isLoggedIn } = storeToRefs(userStore)

// 方式三：actions 可以直接解构（actions 不是响应式数据，是方法）
const { login, logout } = userStore

// 修改状态
userStore.login('admin', 'password')  // 通过 action 修改
userStore.$patch({ token: 'new-token' })  // 批量修改
userStore.$reset()  // 重置到初始状态
</script>
```

::: danger 解构陷阱
直接解构 store 会丢失响应式：

```js
// ❌ 错误 —— 解构后变量不再是响应式的
const { token, user } = useUserStore()

// ✅ 正确 —— 使用 storeToRefs 保持响应式
const { token, user } = storeToRefs(useUserStore())

// ✅ 正确 —— actions 可以直接解构（它们是方法，不是响应式数据）
const { login, logout } = useUserStore()
```
:::

---

## 三、状态持久化

### 3.1 pinia-plugin-persistedstate

```js
// main.js —— 注册持久化插件
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
```

```js
// stores/user.js —— 使用持久化
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: '',
    userInfo: null
  }),

  // 持久化配置
  persist: {
    // 存储方式：localStorage（默认）或 sessionStorage
    storage: localStorage,

    // 指定需要持久化的字段（不指定则持久化所有 state）
    paths: ['token'],

    // 自定义序列化
    serializer: {
      serialize: JSON.stringify,
      deserialize: JSON.parse
    },

    // 存储前/恢复后回调
    beforeRestore: (ctx) => {
      console.log('即将恢复：', ctx.store.$id)
    },
    afterRestore: (ctx) => {
      console.log('恢复完成：', ctx.store.$id)
    }
  }
})
```

---

## 四、Pinia vs Vuex 全面对比

| 维度 | Vuex 3/4 | Pinia |
|------|----------|-------|
| 包体积 | 约 10KB gzipped | 约 1.5KB gzipped |
| API 设计 | Options API（state/mutations/actions/getters/modules）| Options + Composition API |
| TypeScript 支持 | 需要额外类型声明，类型推导弱 | 原生支持，完美类型推导 |
| mutations | 必需（同步修改状态） | 无（直接修改状态） |
| 模块化 | 嵌套模块（namespaced） | 扁平 Store，按需引入 |
| DevTools | 支持 | 支持（且更好） |
| 热更新 | 需要额外配置 | 开箱即用 |
| 依赖注入 | 不支持 | 支持（在 actions 中使用其他 store） |
| SSR 兼容 | 需要特殊处理 | 开箱即用 |

### 4.1 Pinia 相比 Vuex 的核心改进

```js
// ====== 改进 1：TypeScript 类型推导 ======

// Vuex —— 类型推导困难，需要大量手动声明
const store = useStore()
store.commit('INCREMENT')  // 字符串魔法值，无类型提示

// Pinia —— 自动类型推导
const counter = useCounterStore()
counter.increment()  // 完整的类型提示和自动补全

// ====== 改进 2：模块间调用 ======

// Vuex —— 跨模块调用复杂
// 需要 dispatch('moduleName/actionName') 或 root: true

// Pinia —— 直接 import 其他 store
export const useCartStore = defineStore('cart', () => {
  const userStore = useUserStore()  // 直接引用

  async function checkout() {
    if (!userStore.isLoggedIn) {
      throw new Error('请先登录')
    }
    // 结账逻辑
  }

  return { checkout }
})

// ====== 改进 3：代码量对比 ======

// Vuex —— 典型的计数器模块
const vuexCounter = {
  namespaced: true,
  state: { count: 0 },
  getters: { double: state => state.count * 2 },
  mutations: { INCREMENT: state => state.count++ },
  actions: {
    incrementAsync({ commit }) {
      setTimeout(() => commit('INCREMENT'), 1000)
    }
  }
}

// Pinia —— 同样的功能，代码量减少约 50%
const usePiniaCounter = defineStore('counter', {
  state: () => ({ count: 0 }),
  getters: { double: state => state.count * 2 },
  actions: {
    increment() { this.count++ },
    async incrementAsync() {
      await new Promise(r => setTimeout(r, 1000))
      this.count++
    }
  }
})
```

---

## ⭐ 面试高频问题

### Q1：为什么 Pinia 不需要 mutations？

**核心原因**：Pinia 通过 `$patch` 和 DevTools 已经实现了状态变更的追踪能力，不再需要通过 mutations 来实现"可追踪的同步状态变更"。

- **Vuex 时代**：DevTools 通过 mutations 的快照来追踪状态变化，所以需要区分 mutation（同步）和 action（异步）
- **Pinia 时代**：DevTools 可以追踪 `$patch` 调用和 actions 中的状态变更，无需区分同步/异步操作
- **TypeScript 时代**：去掉 mutations 减少了样板代码，类型推导更简单

### Q2：Options Store 和 Setup Store 如何选择？

| 场景 | 推荐 |
|------|------|
| 从 Vuex 迁移 | Options Store（更熟悉） |
| 新项目 | Setup Store（推荐） |
| 需要 watcher | Setup Store（Options Store 不支持） |
| 需要复用组合函数 | Setup Store |
| 简单状态管理 | 两者均可 |

### Q3：Pinia 如何实现 SSR 兼容？

Pinia 的 SSR 兼容基于以下机制：

1. **独立的 state 初始化**：每个请求创建独立的 Pinia 实例，避免状态跨请求共享
2. **`state: () => ({})` 工厂函数**：每次调用都返回新的状态对象，而非共享引用
3. **`pinia.state.value` 序列化**：服务端渲染完成后，将状态序列化传递到客户端

```js
// Nuxt 3 中 Pinia SSR 示例
// server 端渲染后，状态自动序列化到 window.__pinia
// client 端 hydration 时自动恢复
```

### Q4：Pinia 如何实现中间件/插件？

```js
/**
 * Pinia 插件机制 —— 为所有 store 注入通用功能
 */
function myPiniaPlugin({ store, pinia }) {
  // 为每个 store 添加共享属性
  store.$state.globalConfig = { theme: 'light' }

  // 监听 store 变化
  store.$subscribe((mutation, state) => {
    // 每次状态变更时触发
    console.log('状态变更：', mutation.storeId, mutation.type)
    // 持久化到 localStorage
    localStorage.setItem(mutation.storeId, JSON.stringify(state))
  })

  // 监听 action 调用
  store.$onAction(({ name, store, args, after, onError }) => {
    console.log(`Action ${name} 开始执行，参数：`, args)

    after((result) => {
      console.log(`Action ${name} 执行完成，结果：`, result)
    })

    onError((error) => {
      console.error(`Action ${name} 执行失败：`, error)
    })
  })
}

// 注册插件
const pinia = createPinia()
pinia.use(myPiniaPlugin)
```

---

## 面试追问环节

### Q5：Pinia 的 `$patch` 和直接修改 state 有什么区别？

```js
const store = useCounterStore()

// 直接修改 —— 每次修改触发一次订阅回调
store.count++
store.name = 'new name'

// $patch 批量修改 —— 多次修改只触发一次订阅回调
store.$patch({
  count: store.count + 1,
  name: 'new name'
})

// $patch 函数式 —— 适合复杂修改
store.$patch((state) => {
  state.count++
  state.name = 'new name'
  // 可以包含条件逻辑
  if (state.count > 10) {
    state.name = 'large'
  }
})

// 关键区别：$patch 将多次修改合并为一次 DevTools 记录
// 直接修改会产生多条 DevTools 记录
```

### Q6：Pinia 的 store 之间如何互相引用？

```js
// 方式一：在 action 内部引用（推荐，避免循环依赖）
export const useCartStore = defineStore('cart', () => {
  function checkout() {
    const userStore = useUserStore()  // 在 action 内部调用 useStore
    if (!userStore.isLoggedIn) {
      throw new Error('请先登录')
    }
  }
  return { checkout }
})

// 方式二：在 setup 函数顶层引用（注意循环依赖问题）
export const useOrderStore = defineStore('order', () => {
  // 必须在 setup 函数内部调用，不能在顶层调用
  const cartStore = useCartStore()

  function placeOrder() {
    const items = cartStore.items
    // 下单逻辑
  }
  return { placeOrder }
})
```