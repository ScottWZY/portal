# 前端系统设计

## ⭐ 面试重点速览

| 设计题目 | 考察能力 | 核心技术 | 面试频率 | 难度 |
|----------|----------|----------|----------|------|
| 图片懒加载组件 | 组件 API 设计、IntersectionObserver、性能优化 | IntersectionObserver、自定义指令 | 极高 | 中等 |
| 无限滚动/虚拟列表 | 性能优化、DOM 复用、滚动计算 | 虚拟列表、可视区域计算 | 极高 | 困难 |
| 前端路由系统 | hash vs history、路由匹配、导航守卫 | History API、事件监听、正则匹配 | 高频 | 中等 |
| 简易状态管理库 | 发布-订阅模式、响应式、插件机制 | 观察者模式、单例模式 | 高频 | 中等 |

---

## 一、设计图片懒加载组件

### 1.1 需求分析

| 需求 | 优先级 | 说明 |
|------|--------|------|
| 图片进入可视区域时加载 | P0 | 核心功能 |
| 支持占位图/加载中状态 | P0 | 用户体验 |
| 加载失败处理 | P1 | 显示错误占位图 |
| 支持自定义阈值 | P1 | 提前加载（如距离视口 100px 时开始加载） |
| 兼容不支持 IntersectionObserver 的浏览器 | P2 | 降级到 scroll 事件 |
| 支持指令和组件两种使用方式 | P2 | 灵活性 |

### 1.2 接口设计

```ts
// 组件 Props
interface LazyImageProps {
  src: string            // 图片真实地址
  alt?: string           // 图片 alt 文本
  placeholder?: string   // 占位图地址
  errorPlaceholder?: string // 加载失败占位图
  threshold?: number     // 提前加载阈值（px），默认 0
  rootMargin?: string    // 根元素边距，默认 '0px'
}

// 指令用法
// v-lazy="{ src: 'xxx.jpg', placeholder: 'loading.gif' }"
```

### 1.3 代码实现

```vue
<!-- LazyImage.vue —— 组件实现 -->
<template>
  <div ref="containerRef" class="lazy-image-container">
    <!-- 占位图（加载前） -->
    <img
      v-if="status === 'pending'"
      :src="placeholder"
      :alt="alt"
      class="lazy-image-placeholder"
    />
    <!-- 错误占位图 -->
    <img
      v-else-if="status === 'error'"
      :src="errorPlaceholder"
      :alt="alt"
      class="lazy-image-error"
    />
    <!-- 真实图片 -->
    <img
      v-else
      :src="src"
      :alt="alt"
      class="lazy-image-real"
      @load="onLoad"
      @error="onError"
    />
    <!-- 加载中的过渡效果 -->
    <div v-if="status === 'loading'" class="lazy-image-loading">
      <span class="spinner" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  src: { type: String, required: true },
  alt: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  errorPlaceholder: { type: String, default: '' },
  threshold: { type: Number, default: 0 },
  rootMargin: { type: String, default: '0px' }
})

const containerRef = ref(null)
// 状态：pending → loading → loaded | error
const status = ref('pending')
let observer = null

// 创建 IntersectionObserver 监听元素是否进入可视区域
function createObserver() {
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        // 元素进入可视区域（或达到阈值）
        if (entry.isIntersecting) {
          status.value = 'loading'
          // 停止观察，避免重复触发
          observer.unobserve(entry.target)
        }
      })
    },
    {
      // rootMargin：提前触发加载（如 '100px' 表示距离视口 100px 就开始加载）
      rootMargin: props.rootMargin,
      // threshold：可见比例阈值
      threshold: props.threshold > 0 ? props.threshold : 0
    }
  )

  observer.observe(containerRef.value)
}

function onLoad() {
  status.value = 'loaded'
}

function onError() {
  status.value = 'error'
}

onMounted(() => {
  // 检查是否支持 IntersectionObserver
  if ('IntersectionObserver' in window) {
    createObserver()
  } else {
    // 降级方案：不支持则直接加载（或使用 scroll 事件 polyfill）
    status.value = 'loading'
  }
})

onBeforeUnmount(() => {
  // 清理 observer
  if (observer) {
    observer.disconnect()
    observer = null
  }
})
</script>

<style scoped>
.lazy-image-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #f0f0f0; /* 占位背景色 */
}

.lazy-image-placeholder,
.lazy-image-error,
.lazy-image-real {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.3s ease;
}

.lazy-image-placeholder {
  filter: blur(10px); /* 模糊占位图，提升体验 */
}

.lazy-image-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
```

### 1.4 自定义指令版（v-lazy）

```js
// v-lazy 指令 —— 更轻量的懒加载方式
const lazyLoadDirective = {
  mounted(el, binding) {
    // 设置默认占位图
    el.src = binding.value.placeholder || ''

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // 进入可视区域，加载真实图片
            const img = new Image()
            img.src = binding.value.src
            img.onload = () => {
              el.src = binding.value.src
            }
            img.onerror = () => {
              el.src = binding.value.errorPlaceholder || ''
            }
            observer.unobserve(el)
          }
        })
      },
      { rootMargin: binding.value.rootMargin || '50px' }
    )

    observer.observe(el)

    // 将 observer 存储到元素上，用于 unmounted 时清理
    el._lazyObserver = observer
  },

  unmounted(el) {
    if (el._lazyObserver) {
      el._lazyObserver.disconnect()
    }
  }
}

// 使用：<img v-lazy="{ src: 'xxx.jpg', placeholder: 'loading.gif' }" />
```

---

## 二、设计无限滚动列表（虚拟列表）

### 2.1 需求分析

| 需求 | 优先级 | 说明 |
|------|--------|------|
| 只渲染可视区域内的 DOM 节点 | P0 | 核心功能 |
| 支持动态高度 | P1 | 真实场景中列表项高度不一 |
| 滚动流畅（60fps） | P1 | 性能要求 |
| 支持顶部/底部加载更多 | P1 | 上拉加载 |
| 缓存已渲染项的高度 | P2 | 优化估算精度 |

### 2.2 虚拟列表核心原理

```
┌─────────────────────────┐
│  startOffset（占位空间）  │ ← 不可见区域，用 paddingTop 撑开
│  (startIndex 之前的项)    │
├─────────────────────────┤
│  Item startIndex          │ ← 可视区域开始
│  Item startIndex + 1      │
│  Item startIndex + 2      │
│  ...                      │
│  Item endIndex            │ ← 可视区域结束
├─────────────────────────┤
│  endOffset（占位空间）     │ ← 不可见区域，用 paddingBottom 撑开
│  (endIndex 之后的项)      │
└─────────────────────────┘
```

### 2.3 代码实现（固定高度版）

```vue
<!-- VirtualList.vue -->
<template>
  <div
    ref="containerRef"
    class="virtual-list-container"
    :style="{ height: containerHeight + 'px' }"
    @scroll="onScroll"
  >
    <!-- 占位容器：总高度 = 总项数 × 每项高度 -->
    <div
      class="virtual-list-phantom"
      :style="{ height: totalHeight + 'px' }"
    >
      <!-- 可视区域：通过 transform 定位到正确位置 -->
      <div
        class="virtual-list-content"
        :style="{ transform: `translateY(${startOffset}px)` }"
      >
        <div
          v-for="(item, index) in visibleItems"
          :key="item.id"
          class="virtual-list-item"
          :style="{ height: itemHeight + 'px' }"
        >
          <slot :item="item" :index="startIndex + index" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  items: { type: Array, required: true }, // 所有数据
  itemHeight: { type: Number, required: true }, // 每项高度（固定）
  containerHeight: { type: Number, default: 600 }, // 容器高度
  // 缓冲区：可视区域外额外渲染的项数，避免快速滚动时出现空白
  bufferCount: { type: Number, default: 5 }
})

const containerRef = ref(null)
const scrollTop = ref(0)

// 总高度
const totalHeight = computed(() => props.items.length * props.itemHeight)

// 可视区域能容纳的项数
const visibleCount = computed(() => Math.ceil(props.containerHeight / props.itemHeight))

// 起始索引（含缓冲区）
const startIndex = computed(() => {
  const index = Math.floor(scrollTop.value / props.itemHeight)
  return Math.max(0, index - props.bufferCount)
})

// 结束索引（含缓冲区）
const endIndex = computed(() => {
  const index = startIndex.value + visibleCount.value + props.bufferCount * 2
  return Math.min(props.items.length, index)
})

// 可视区域的数据
const visibleItems = computed(() => {
  return props.items.slice(startIndex.value, endIndex.value)
})

// 起始偏移量（顶部不可见区域的高度）
const startOffset = computed(() => {
  return startIndex.value * props.itemHeight
})

function onScroll(e) {
  // 使用 requestAnimationFrame 节流，保证 60fps
  if (scrollRAF) return
  scrollRAF = requestAnimationFrame(() => {
    scrollTop.value = e.target.scrollTop
    scrollRAF = null
  })
}

let scrollRAF = null
</script>

<style scoped>
.virtual-list-container {
  overflow-y: auto;
  position: relative;
}
.virtual-list-phantom {
  position: relative;
}
.virtual-list-content {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
}
</style>
```

### 2.4 动态高度版（核心思路）

```js
/**
 * 动态高度虚拟列表 —— 核心思路
 *
 * 1. 使用预估高度作为初始值
 * 2. 渲染后通过 ResizeObserver 或 getBoundingClientRect 获取真实高度
 * 3. 将真实高度缓存到 positions 数组中
 * 4. 通过二分查找确定 startIndex
 */
class DynamicHeightVirtualList {
  constructor() {
    // 位置缓存：每个 item 的 top、bottom、height
    this.positions = []
    // 预估高度
    this.estimatedItemHeight = 80
  }

  // 二分查找：根据 scrollTop 找到对应的 startIndex
  findStartIndex(scrollTop) {
    let left = 0
    let right = this.positions.length - 1

    while (left <= right) {
      const mid = Math.floor((left + right) / 2)
      const midBottom = this.positions[mid].bottom

      if (midBottom === scrollTop) {
        return mid + 1
      } else if (midBottom < scrollTop) {
        left = mid + 1
      } else {
        right = mid - 1
      }
    }
    return left
  }

  // 更新缓存的位置信息
  updatePositions(index, realHeight) {
    const diff = realHeight - this.positions[index].height
    this.positions[index].height = realHeight
    this.positions[index].bottom += diff

    // 更新后续所有项的位置
    for (let i = index + 1; i < this.positions.length; i++) {
      this.positions[i].top = this.positions[i - 1].bottom
      this.positions[i].bottom += diff
    }
  }
}
```

::: tip 虚拟列表优化要点
1. **缓冲区**：在可视区域外多渲染几个节点，防止快速滚动时出现空白
2. **requestAnimationFrame 节流**：而不是 setTimeout，保证滚动回调与屏幕刷新率同步
3. **key 使用数据 ID**：确保 DOM 复用正确
4. **图片高度**：如果列表项包含图片，需要提前占位或监听图片加载完成事件重新计算高度
:::

---

## 三、设计前端路由系统

### 3.1 需求分析

| 需求 | 优先级 | 说明 |
|------|--------|------|
| 支持 hash 和 history 两种模式 | P0 | 核心功能 |
| 路由注册与匹配 | P0 | 支持动态路由参数 |
| 导航守卫（全局/路由级） | P1 | beforeEach、afterEach |
| 嵌套路由 | P1 | 子路由匹配 |
| 路由懒加载 | P2 | 动态 import |

### 3.2 代码实现

```js
/**
 * 简易前端路由系统
 *
 * 核心设计：
 * 1. 路由表：存储路径到组件的映射（支持动态参数 :id）
 * 2. 当前路由状态：响应式的 currentRoute
 * 3. 模式切换：hash 模式监听 hashchange，history 模式监听 popstate
 * 4. 导航守卫：beforeEach（前置守卫）和 afterEach（后置守卫）
 */
class Router {
  constructor(options = {}) {
    this.routes = options.routes || []      // 路由表
    this.mode = options.mode || 'hash'       // 路由模式：hash | history
    this.currentRoute = '/'                  // 当前路径（响应式）
    this.beforeHooks = []                    // 全局前置守卫
    this.afterHooks = []                     // 全局后置守卫
    this.routeMap = new Map()                // 路径 → 路由配置的映射（快速查找）

    // 初始化路由映射
    this.#initRouteMap()
    // 监听路由变化
    this.#initEvents()
  }

  // 初始化路由映射表
  #initRouteMap() {
    this.routes.forEach((route) => {
      this.routeMap.set(route.path, route)
    })
  }

  // 监听浏览器路由事件
  #initEvents() {
    if (this.mode === 'hash') {
      // hash 模式：监听 hashchange 事件
      window.addEventListener('hashchange', this.#onRouteChange.bind(this))
      // 页面加载时触发一次
      window.addEventListener('load', this.#onRouteChange.bind(this))
    } else {
      // history 模式：监听 popstate 事件（浏览器前进后退）
      window.addEventListener('popstate', this.#onRouteChange.bind(this))
      // 页面加载时触发一次
      window.addEventListener('load', this.#onRouteChange.bind(this))
    }
  }

  // 路由变化处理
  #onRouteChange() {
    const path = this.#getCurrentPath()
    this.navigateTo(path)
  }

  // 获取当前路径
  #getCurrentPath() {
    if (this.mode === 'hash') {
      // 去掉 # 号，没有 hash 时默认为 '/'
      return window.location.hash.slice(1) || '/'
    }
    return window.location.pathname
  }

  // 编程式导航
  push(path) {
    if (this.mode === 'hash') {
      window.location.hash = path
    } else {
      // history 模式使用 pushState（不刷新页面）
      window.history.pushState(null, '', path)
      this.#onRouteChange()
    }
  }

  replace(path) {
    if (this.mode === 'hash') {
      // hash 的 replace 实现
      const url = window.location.href.replace(/#.*$/, '') + '#' + path
      window.location.replace(url)
    } else {
      window.history.replaceState(null, '', path)
      this.#onRouteChange()
    }
  }

  // 核心：路由匹配（支持动态参数）
  #matchRoute(path) {
    for (const route of this.routes) {
      // 将路由路径转为正则：/user/:id → /user/([^/]+)
      const paramNames = []
      const regexStr = route.path
        .replace(/:(\w+)/g, (_, name) => {
          paramNames.push(name)
          return '([^/]+)'
        })
        .replace(/\*/g, '.*')

      const regex = new RegExp(`^${regexStr}$`)
      const match = path.match(regex)

      if (match) {
        // 提取动态参数
        const params = {}
        paramNames.forEach((name, index) => {
          params[name] = match[index + 1]
        })
        return { route, params }
      }
    }
    return null
  }

  // 注册全局前置守卫
  beforeEach(guard) {
    this.beforeHooks.push(guard)
  }

  // 注册全局后置守卫
  afterEach(hook) {
    this.afterHooks.push(hook)
  }

  // 导航到指定路径
  navigateTo(path) {
    const matched = this.#matchRoute(path)

    if (!matched) {
      // 路由未匹配，尝试导航到 404 页面
      const notFound = this.#matchRoute('/404')
      if (notFound) {
        this.currentRoute = {
          path: '/404',
          component: notFound.route.component,
          params: {}
        }
      }
      return
    }

    const to = {
      path,
      component: matched.route.component,
      params: matched.params
    }

    const from = { ...this.currentRoute }

    // 执行前置守卫
    this.#runGuards(this.beforeHooks, to, from, () => {
      // 守卫通过，更新路由
      this.currentRoute = to
      // 执行后置守卫
      this.afterHooks.forEach((hook) => hook(to, from))
    })
  }

  // 按顺序执行守卫
  #runGuards(guards, to, from, next) {
    if (guards.length === 0) return next()

    let index = 0
    const runGuard = () => {
      if (index >= guards.length) return next()
      const guard = guards[index++]
      guard(to, from, runGuard) // 守卫调用 next() 才会继续
    }
    runGuard()
  }
}

// ---- 使用示例 ----
const router = new Router({
  mode: 'history',
  routes: [
    { path: '/', component: 'Home' },
    { path: '/user/:id', component: 'User' },
    { path: '/about', component: 'About' },
    { path: '/404', component: 'NotFound' }
  ]
})

// 注册导航守卫
router.beforeEach((to, from, next) => {
  console.log(`导航从 ${from.path} 到 ${to.path}`)
  // 权限检查等逻辑
  const isAuthenticated = true
  if (to.path === '/admin' && !isAuthenticated) {
    router.push('/login')
  } else {
    next() // 必须调用 next 才能继续
  }
})

// 编程式导航
router.push('/user/123') // 跳转到 /user/123，params: { id: '123' }
```

---

## 四、设计简易状态管理库

### 4.1 需求分析

| 需求 | 优先级 | 说明 |
|------|--------|------|
| 响应式状态存储 | P0 | 状态变化时自动通知订阅者 |
| getter 派生状态 | P1 | 基于 state 计算派生值 |
| action 异步操作 | P1 | 支持异步修改状态 |
| 订阅/取消订阅 | P1 | 手动监听状态变化 |
| 插件机制 | P2 | 支持中间件/插件扩展 |

### 4.2 代码实现

```js
/**
 * 简易状态管理库 —— 类似 Pinia/Zustand
 *
 * 核心设计：
 * 1. 使用 发布-订阅模式 管理状态变更通知
 * 2. 使用 Proxy 或 Object.defineProperty 实现响应式
 * 3. 每个 store 是独立的命名空间
 * 4. 支持插件机制（中间件）
 */
class Store {
  constructor(options) {
    this.id = options.id                     // store 唯一标识
    this._state = options.state?.() || {}    // 初始状态
    this._getters = options.getters || {}    // 派生状态
    this._actions = options.actions || {}    // 操作方法
    this._subscribers = new Set()            // 订阅者集合
    this._plugins = []                       // 插件列表

    // 创建响应式状态
    this.state = this.#makeReactive(this._state)
    // 创建 getters（基于 state 的计算属性）
    this.getters = this.#createGetters()
    // 绑定 actions 的 this
    this.actions = this.#bindActions()
  }

  // 使用 Proxy 实现响应式状态
  #makeReactive(state) {
    const self = this
    return new Proxy(state, {
      get(target, key, receiver) {
        return Reflect.get(target, key, receiver)
      },
      set(target, key, value, receiver) {
        const oldValue = target[key]
        const result = Reflect.set(target, key, value, receiver)
        // 值变化时通知所有订阅者
        if (oldValue !== value) {
          self.#notify({ key, oldValue, newValue: value })
        }
        return result
      },
      deleteProperty(target, key) {
        const result = Reflect.deleteProperty(target, key)
        self.#notify({ key, type: 'delete' })
        return result
      }
    })
  }

  // 创建 getters（派生状态）
  #createGetters() {
    const getters = {}
    for (const [key, fn] of Object.entries(this._getters)) {
      Object.defineProperty(getters, key, {
        get: () => fn(this.state),
        enumerable: true
      })
    }
    return getters
  }

  // 绑定 actions 的 this 指向
  #bindActions() {
    const actions = {}
    for (const [key, fn] of Object.entries(this._actions)) {
      actions[key] = (...args) => fn(this, ...args)
    }
    return actions
  }

  // 通知所有订阅者
  #notify(change) {
    this._subscribers.forEach((callback) => {
      callback(change, this.state)
    })
  }

  // 订阅状态变化
  subscribe(callback) {
    this._subscribers.add(callback)
    // 返回取消订阅函数
    return () => {
      this._subscribers.delete(callback)
    }
  }

  // 使用插件
  use(plugin) {
    this._plugins.push(plugin)
    plugin(this)
  }

  // 重置状态
  $reset() {
    const initialState = this._state
    Object.keys(this.state).forEach((key) => {
      this.state[key] = initialState[key]
    })
  }
}

// ---- 创建 Store 的工厂函数 ----
function defineStore(id, options) {
  return () => {
    // 单例模式：同一个 id 只创建一次
    if (!defineStore._instances[id]) {
      defineStore._instances[id] = new Store({ id, ...options })
    }
    return defineStore._instances[id]
  }
}
defineStore._instances = {}

// ---- 使用示例 ----
const useCounterStore = defineStore('counter', {
  state: () => ({
    count: 0,
    name: 'Counter'
  }),
  getters: {
    doubleCount(state) {
      return state.count * 2
    },
    greeting(state) {
      return `Hello ${state.name}!`
    }
  },
  actions: {
    increment(store) {
      store.state.count++
    },
    async asyncIncrement(store) {
      await new Promise(resolve => setTimeout(resolve, 1000))
      store.state.count++
    },
    decrement(store) {
      store.state.count--
    }
  }
})

// 使用
const store = useCounterStore()
console.log(store.state.count)        // 0
console.log(store.getters.doubleCount) // 0

// 订阅状态变化
const unsubscribe = store.subscribe((change, state) => {
  console.log(`状态变化: ${change.key} -> ${change.newValue}`, state)
})

store.actions.increment()
// 输出: 状态变化: count -> 1

unsubscribe() // 取消订阅
store.$reset() // 重置状态
```

### 4.3 插件机制示例

```js
// 日志插件：记录每次状态变化
function loggerPlugin(store) {
  store.subscribe((change) => {
    console.log(
      `[${store.id}] ${change.key}: ${change.oldValue} → ${change.newValue}`
    )
  })
}

// 持久化插件：将状态保存到 localStorage
function persistPlugin(store) {
  const key = `store_${store.id}`

  // 初始化时从 localStorage 恢复状态
  const saved = localStorage.getItem(key)
  if (saved) {
    try {
      const data = JSON.parse(saved)
      Object.assign(store.state, data)
    } catch (e) {
      console.error('Failed to restore state:', e)
    }
  }

  // 状态变化时保存到 localStorage
  store.subscribe(() => {
    localStorage.setItem(key, JSON.stringify(store.state))
  })
}

// 使用插件
const store = useCounterStore()
store.use(loggerPlugin)
store.use(persistPlugin)
```

::: tip 设计要点
1. **发布-订阅模式**是状态管理库的核心，解耦状态变化和 UI 更新
2. **响应式状态**确保状态变化能自动触发视图更新
3. **单例模式**保证同一个 store 全局只有一个实例
4. **插件机制**让状态管理库具备良好的扩展性
:::