# Vue 高频面试题

## ⭐ 面试重点速览

| 面试题 | 核心考点 | 面试频率 | 难度 |
|--------|----------|----------|------|
| Vue2 vs Vue3 响应式原理 | Object.defineProperty vs Proxy、Reflect | 极高 | 困难 |
| v-if 和 v-for 优先级 | 为什么不能同时使用？源码层面解析 | 极高 | 中等 |
| v-for 中 key 的作用 | Diff 算法、就地复用、为什么不能用 index | 极高 | 中等 |
| keep-alive 原理 | 缓存机制、LRU 算法、activated/deactivated 钩子 | 高频 | 中等 |
| Vue3 编译优化 | PatchFlag、Block Tree、静态提升、预字符串化 | 高频 | 困难 |
| nextTick 原理 | 微任务队列、事件循环、Vue 异步更新策略 | 高频 | 中等 |
| 组件通信方式 | 8 种通信方式汇总、适用场景 | 高频 | 简单 |

---

## Q1：Vue2 和 Vue3 响应式原理的区别？为什么 Proxy 更好？

### 核心答案

Vue2 使用 `Object.defineProperty` 劫持对象属性的 getter/setter，Vue3 使用 `Proxy` 代理整个对象。

### 详细对比

| 对比维度 | Vue2（Object.defineProperty） | Vue3（Proxy） |
|----------|-------------------------------|---------------|
| 代理颗粒度 | 属性级别，需要遍历每个属性 | 对象级别，代理整个对象 |
| 新增/删除属性 | 无法检测，需要 `$set`/`$delete` | 可以检测（Proxy 拦截 `set`/`deleteProperty`） |
| 数组索引修改 | 无法检测 `arr[0] = 'x'` | 可以检测 |
| 数组 length 修改 | 无法检测 `arr.length = 0` | 可以检测 |
| 初始化性能 | 递归遍历所有属性，深层对象开销大 | 懒代理：只在访问时才递归代理（惰性劫持） |
| 拦截操作 | 仅 get/set | 13 种操作（get/set/has/deleteProperty/ownKeys 等） |
| 兼容性 | 支持 IE9+ | 不支持 IE11（Proxy 无法 polyfill） |

### 为什么用 Reflect？

Vue3 不仅在内部使用 Proxy，还搭配 `Reflect` 来保证正确的 `this` 指向：

```js
// 使用 Proxy + Reflect 实现响应式核心
function reactive(target) {
  return new Proxy(target, {
    get(target, key, receiver) {
      // 依赖收集
      track(target, key)
      const result = Reflect.get(target, key, receiver)
      // 懒代理：如果值是对象，递归代理（仅在访问时触发）
      if (typeof result === 'object' && result !== null) {
        return reactive(result)
      }
      return result
    },
    set(target, key, value, receiver) {
      const oldValue = target[key]
      const result = Reflect.set(target, key, value, receiver)
      // 触发更新
      if (oldValue !== value) {
        trigger(target, key)
      }
      return result
    },
    deleteProperty(target, key) {
      const hadKey = Object.prototype.hasOwnProperty.call(target, key)
      const result = Reflect.deleteProperty(target, key)
      // 删除属性时也触发更新
      if (hadKey && result) {
        trigger(target, key)
      }
      return result
    }
  })
}
```

::: tip 为什么必须用 Reflect 而不是 target[key]？
当 target 的 getter 中使用了 `this`，如果用 `target[key]` 直接访问，`this` 指向的是原始对象而非 Proxy 代理对象。`Reflect.get(target, key, receiver)` 中的 `receiver` 参数可以让 `this` 正确指向 Proxy 对象，从而保证嵌套对象的响应式代理正常工作。
:::

---

## Q2：v-if 和 v-for 为什么不能同时使用？优先级？

### 核心答案

**v-for 的优先级高于 v-if**（Vue2 和 Vue3 都是如此）。在同一个元素上同时使用时，v-for 会先执行，导致每次渲染都遍历整个列表并执行 v-if 判断，造成不必要的性能浪费。

### 源码层面解析

```js
// Vue3 编译器源码简化：v-for 的优先级高于 v-if
// 在编译时，v-for 包裹在 v-if 的外部
// 渲染函数等价于：
function render() {
  return items.map((item) => {
    // v-for 先遍历，每个 item 都执行 v-if 判断
    if (item.visible) {
      return h('div', item.name)
    }
  })
}
```

### 正确做法

```vue
<!-- ❌ 错误：v-if 和 v-for 同时使用 -->
<div v-for="item in items" v-if="item.visible" :key="item.id">
  {{ item.name }}
</div>

<!-- ✅ 正确：用 computed 过滤 -->
<template>
  <div v-for="item in visibleItems" :key="item.id">
    {{ item.name }}
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps(['items'])

// 先过滤，再遍历，性能更好
const visibleItems = computed(() => props.items.filter(item => item.visible))
</script>

<!-- ✅ 或者使用 template 包裹（v-if 提升到外层） -->
<template v-if="items.length">
  <div v-for="item in items" :key="item.id">
    {{ item.name }}
  </div>
</template>
```

::: warning 注意
Vue3 官方文档明确建议：**永远不要把 v-if 和 v-for 同时用在同一个元素上**。如果确实需要条件渲染列表，使用 computed 提前过滤，或在 template 层级使用 v-if。
:::

---

## Q3：v-for 中 key 的作用？为什么不能用 index？

### 核心答案

key 是 Vue 虚拟 DOM 中节点的唯一标识，用于 **Diff 算法中判断节点是否可以复用**。使用 index 作为 key 会导致错误的节点复用，造成状态错乱和性能问题。

### 详细解释

Vue 在进行虚拟 DOM 对比时，遵循"就地复用"策略：

```js
// 简化版 Diff 算法逻辑
function patchChildren(oldChildren, newChildren) {
  // 同层级比较
  for (let i = 0; i < newChildren.length; i++) {
    const newVNode = newChildren[i]
    // 先尝试通过 key 找到可复用的旧节点
    const oldVNode = findOldVNodeByKey(newVNode.key)
    if (oldVNode) {
      // 找到相同 key 的节点，复用 DOM 结构，只更新变化的内容
      patch(oldVNode, newVNode)
    } else {
      // 没找到，创建新节点
      mount(newVNode)
    }
  }
}
```

### 为什么不能用 index？

```vue
<!-- 场景：列表项包含状态（输入框、选中状态等） -->
<ul>
  <li v-for="(item, index) in list" :key="index">
    <input v-model="item.text" />
    <button @click="removeItem(index)">删除</button>
  </li>
</ul>
```

当删除第 0 项时：
- 原 key=0 的节点被删除，原 key=1 的节点 key 变成 0，原 key=2 的节点 key 变成 1
- Vue 会认为 key=0 的"旧节点"还在（实际是原来的第 1 项），于是复用它的 DOM
- 结果是：输入框的内容被"错位"了 —— 第 1 项的输入内容跑到了第 0 项的位置

```js
// 问题演示
const list = [
  { id: 'a', text: 'A' },  // index=0
  { id: 'b', text: 'B' },  // index=1
  { id: 'c', text: 'C' },  // index=2
]

// 删除第一项后，用 index 作为 key
// 旧: key=0(A) key=1(B) key=2(C)
// 新: key=0(B) key=1(C)
// Vue 认为 key=0 的节点可以复用 → 复用 A 的 DOM，但数据变成了 B
// 输入框内容错乱！
```

::: danger 正确做法
始终使用**唯一且稳定的标识符**作为 key，如数据库 ID、UUID 等：

```vue
<li v-for="item in list" :key="item.id">
  {{ item.name }}
</li>
```
:::

---

## Q4：keep-alive 原理？生命周期钩子？

### 核心答案

`<keep-alive>` 是 Vue 内置的抽象组件，用于缓存不活动的组件实例。它通过 **LRU 缓存算法** 管理缓存的组件，使用 `include`/`exclude` 控制哪些组件被缓存，使用 `max` 限制最大缓存数量。

### 缓存机制

```js
// keep-alive 核心原理简化实现
const KeepAliveImpl = {
  name: 'KeepAlive',
  // 抽象组件：不会渲染为真实 DOM 元素
  abstract: true,

  props: {
    include: [String, RegExp, Array],  // 只有匹配的组件会被缓存
    exclude: [String, RegExp, Array],  // 匹配的组件不会被缓存
    max: [String, Number]              // 最大缓存数量
  },

  setup(props, { slots }) {
    // 缓存存储：key → VNode
    const cache = new Map()
    // 缓存的 key 列表（用于 LRU 淘汰）
    const keys = []

    // 缓存逻辑
    function pruneCacheEntry(key) {
      const cached = cache.get(key)
      // 卸载缓存组件
      if (cached) {
        cached.component.$destroy()
      }
      cache.delete(key)
      keys.splice(keys.indexOf(key), 1)
    }

    // 当缓存超出 max 限制时，淘汰最旧的（LRU）
    function pruneCache() {
      while (keys.length > props.max) {
        pruneCacheEntry(keys[0])
      }
    }

    return () => {
      const slot = slots.default()
      const vnode = slot[0] // 获取第一个子组件
      const componentName = vnode.type.name

      // 检查是否需要缓存
      if (shouldCache(props.include, props.exclude, componentName)) {
        const key = vnode.key ?? componentName

        if (cache.has(key)) {
          // 命中缓存 → 复用缓存的 VNode（保留组件实例状态）
          vnode.component = cache.get(key).component
          // 更新 LRU 位置（将当前 key 移到末尾）
          keys.splice(keys.indexOf(key), 1)
          keys.push(key)
        } else {
          // 未命中 → 缓存新 VNode
          cache.set(key, vnode)
          keys.push(key)
          // 检查是否超出最大缓存数
          if (props.max && keys.length > props.max) {
            pruneCacheEntry(keys[0])
          }
        }
      }

      return vnode
    }
  }
}
```

### 生命周期钩子

keep-alive 为被缓存的组件新增了两个生命周期钩子：

| 钩子 | 触发时机 | 典型用途 |
|------|----------|----------|
| `activated` | 组件被激活（从缓存恢复显示） | 重新获取数据、恢复滚动位置 |
| `deactivated` | 组件被停用（进入缓存） | 保存滚动位置、清理定时器 |

```vue
<script setup>
import { onActivated, onDeactivated } from 'vue'

// 组件从缓存中被激活时触发
onActivated(() => {
  console.log('组件被激活了，重新获取数据')
  fetchData()
  // 恢复之前的滚动位置
  nextTick(() => {
    scrollContainer.scrollTop = savedScrollTop.value
  })
})

// 组件被缓存时触发
onDeactivated(() => {
  console.log('组件被缓存了，保存当前状态')
  // 保存滚动位置
  savedScrollTop.value = scrollContainer.scrollTop
  // 清理定时器
  clearInterval(timer)
})
</script>
```

::: tip keep-alive 使用场景
- **Tab 切换**：用户在不同 Tab 间切换时保留表单状态和滚动位置
- **列表-详情页**：从列表页进入详情页再返回时，保留列表滚动位置和筛选条件
- **多步骤表单**：步骤间切换时保留已填写的表单数据
- **路由缓存**：配合 `<router-view>` 使用，缓存路由组件
:::

---

## Q5：Vue3 做了哪些性能优化？

### 核心答案

Vue3 的性能优化主要体现在**编译时优化**，通过模板编译阶段生成更高效的渲染代码，减少运行时 Diff 开销。

### 五大编译优化

#### 1. PatchFlag（动态标记）

```js
// Vue2 编译结果：所有节点都参与 diff
// Vue3 编译结果：只有标记了 PatchFlag 的节点参与 diff

// 模板：
// <div :class="active" :id="dynamicId">{{ text }}</div>

// Vue3 编译后的渲染函数大致等价于：
function render() {
  return h('div', {
    class: 'static-class', // 静态 class 直接保留
    'data-id': dynamicId   // 动态属性
  }, [
    h('span', null, text)  // 动态文本
  ])
  // 生成的 VNode 包含 patchFlag 标记
  // patchFlag: 9 = TEXT(1) | PROPS(8) = 同时有动态文本和动态属性
}

// 定义的 PatchFlag 枚举值
const PatchFlags = {
  TEXT: 1,              // 动态文本内容
  CLASS: 2,             // 动态 class
  STYLE: 4,             // 动态 style
  PROPS: 8,             // 动态属性（不含 class/style）
  FULL_PROPS: 16,       // 动态 key（需要全量 diff）
  HYDRATE_EVENTS: 32,   // 带事件监听
  STABLE_FRAGMENT: 64,  // 稳定的 Fragment
  KEYED_FRAGMENT: 128,  // 带 key 的 Fragment
  UNKEYED_FRAGMENT: 256,// 不带 key 的 Fragment
  NEED_PATCH: 512,      // 需要 patch
  DYNAMIC_SLOTS: 1024,  // 动态插槽
  HOISTED: -1,          // 静态提升的节点（跳过 diff）
  BAIL: -2              // 退出优化模式
}
```

#### 2. Block Tree（块树）

```html
<template>
  <!-- Block Tree 将模板分为静态块和动态块 -->
  <div>
    <!-- 静态块：完全不参与 diff -->
    <h1>Hello World</h1>

    <!-- 动态块：只 diff 这部分 -->
    <p>{{ message }}</p>
    <p :class="dynamicClass">dynamic</p>
  </div>
</template>
```

Block Tree 将动态节点收集到一个扁平数组中，Diff 时跳过所有静态节点，只对比动态节点，将 Diff 复杂度从 O(n) 降至 O(动态节点数)。

#### 3. 静态提升（Static Hoisting）

```js
// 模板：
// <div>
//   <span>static text</span>
//   <span>{{ dynamicText }}</span>
// </div>

// 编译后 —— 静态节点提升到渲染函数外部，只创建一次
const _hoisted_1 = h('span', null, 'static text') // 静态提升！

function render() {
  return h('div', null, [
    _hoisted_1,                                   // 直接复用，不重新创建
    h('span', null, dynamicText.value)
  ])
}
```

#### 4. 预字符串化（Static Stringification）

当模板中有大量连续的静态节点时，Vue3 编译器会将其编译为字符串，通过 `innerHTML` 直接设置，跳过 VNode 创建和 Diff：

```js
// 20 个连续的静态 <div> 节点
// 编译后：直接合并为一个 innerHTML 字符串
const _hoisted_1 = h('div', { innerHTML: `<div></div><div></div>...` })
```

#### 5. 缓存事件处理函数

```js
// Vue2：每次渲染都创建新的函数（导致子组件不必要的重渲染）
// <button @click="handleClick">Click</button>

// Vue3 编译后：缓存函数引用
function render() {
  return h('button', {
    // _cache[0] 缓存了 handleClick，避免每次创建新函数
    onClick: _cache[0] || (_cache[0] = ($event) => handleClick($event))
  }, 'Click')
}
```

::: tip 性能对比总结
| 优化 | Vue2 | Vue3 |
|------|------|------|
| Diff 范围 | 全量对比 | 仅对比动态节点 |
| 静态节点 | 每次创建新 VNode | 提升复用，跳过创建 |
| 事件绑定 | 每次创建新函数 | 缓存函数引用 |
| 大量静态内容 | 逐个 VNode diff | 预字符串化 innerHTML |
:::

---

## Q6：nextTick 原理？

### 核心答案

`nextTick` 将回调函数推迟到**下一个 DOM 更新周期之后**执行。其原理是利用 JavaScript 事件循环的微任务队列，在数据变化后，Vue 会异步批量更新 DOM，`nextTick` 保证回调在 DOM 更新完成后执行。

### 实现原理

```js
// Vue3 nextTick 简化实现
const queue = []        // 任务队列
let isFlushing = false  // 是否正在刷新队列
let isFlushPending = false

const resolvedPromise = Promise.resolve()
let currentFlushPromise = null

function nextTick(fn) {
  // 如果传入了回调，将其加入微任务队列
  const p = currentFlushPromise || resolvedPromise
  return fn ? p.then(fn) : p
}

function queueFlush() {
  if (!isFlushing && !isFlushPending) {
    isFlushPending = true
    // 使用 Promise.resolve().then() 将刷新任务加入微任务队列
    currentFlushPromise = resolvedPromise.then(flushJobs)
  }
}

function flushJobs() {
  isFlushPending = false
  isFlushing = true

  // 按顺序执行队列中的任务
  queue.sort((a, b) => a.id - b.id)
  for (let i = 0; i < queue.length; i++) {
    const job = queue[i]
    job()
  }
  queue.length = 0

  isFlushing = false
  currentFlushPromise = null
}
```

### 执行流程

```
数据变化 → 触发 setter
    ↓
触发依赖更新（effect.scheduler）
    ↓
将更新任务加入队列（去重）
    ↓
Promise.resolve().then(flushJobs)  ← 加入微任务队列
    ↓
当前同步代码执行完毕
    ↓
微任务队列执行：flushJobs 批量更新 DOM
    ↓
DOM 更新完成
    ↓
nextTick 的回调函数执行 ← 此时可以获取到最新的 DOM
```

### 使用场景

```js
import { ref, nextTick } from 'vue'

const message = ref('Hello')
const divRef = ref(null)

function updateMessage() {
  message.value = 'World'

  // 此时 DOM 还未更新，获取到的还是旧内容
  console.log(divRef.value.textContent) // 'Hello'

  // nextTick 回调在 DOM 更新后执行
  nextTick(() => {
    console.log(divRef.value.textContent) // 'World'
    // 此时可以安全地操作 DOM
  })

  // 也可以使用 await 语法
  // await nextTick()
  // console.log(divRef.value.textContent) // 'World'
}
```

::: tip 为什么 Vue 使用微任务而不是宏任务？
微任务（Promise.then）在当前宏任务结束前执行，比宏任务（setTimeout）更快。Vue 优先使用 `Promise.resolve().then()`，如果环境不支持 Promise，则降级到 `setTimeout(fn, 0)`。
:::

---

## Q7：组件通信方式汇总（8 种）

| 方式 | 适用场景 | 数据流向 | 特点 |
|------|----------|----------|------|
| Props / Emits | 父子组件 | 父→子（Props）子→父（Emits） | Vue 最基础的通信方式 |
| v-model | 父子组件双向绑定 | 双向 | 语法糖，本质是 Props + Emits |
| ref / $refs | 父访问子组件实例 | 父→子 | 直接操作子组件方法和数据 |
| Provide / Inject | 跨层级（祖先→后代） | 祖先→后代 | 适合深层嵌套，避免 props 逐层传递 |
| Pinia / Vuex | 全局状态管理 | 任意方向 | 复杂应用必备 |
| EventBus（已废弃） | 任意组件 | 任意方向 | Vue3 中推荐使用 mitt 库替代 |
| $parent / $root | 访问父/根实例 | 子→父/根 | 耦合度高，不推荐 |
| 插槽（Slot） | 父组件向子组件传递模板 | 父→子 | 内容分发，作用域插槽可实现子→父通信 |

### 代码示例

```vue
<!-- 1. Props + Emits -->
<Child :title="title" @update="handleUpdate" />

<!-- 2. v-model（支持多个 v-model） -->
<Child v-model:title="title" v-model:content="content" />

<!-- 3. ref 访问子组件 -->
<script setup>
import { ref } from 'vue'
const childRef = ref(null)
// 调用子组件暴露的方法
childRef.value.childMethod()
</script>
<Child ref="childRef" />

<!-- 4. Provide / Inject -->
<script setup>
import { provide } from 'vue'
// 祖先组件
provide('theme', 'dark')
// 后代组件
import { inject } from 'vue'
const theme = inject('theme', 'light') // 默认值
</script>

<!-- 8. 作用域插槽（子传父） -->
<Child v-slot="{ item }">
  {{ item.name }}
</Child>
```

---

## 面试追问环节

**Q：Vue 的异步更新机制有什么好处？**

Vue 在数据变化时不会立即更新 DOM，而是将更新任务推入一个队列，在同一个事件循环中多次数据变化会被去重合并为一次 DOM 更新。这避免了不必要的 DOM 操作，提升了性能。例如，在同一个同步代码块中修改 100 次数据，Vue 只会在最后执行一次 DOM 更新。

**Q：Vue3 中 ref 和 reactive 如何选择？**

- `ref` 适用于基本类型和需要 `.value` 访问的场景，也可以包裹对象
- `reactive` 适用于对象类型，不需要 `.value` 访问
- 推荐：统一使用 `ref`（Vue3 官方推荐风格），因为 `ref` 可以处理任何类型，且解构不会丢失响应式（配合 `toRefs`）
- `reactive` 的局限：不能重新赋值（会丢失响应式）、解构会丢失响应式

**Q：Vue3 的 Composition API 相比 Options API 有什么优势？**

- **逻辑复用**：通过自定义 Hook 提取和复用逻辑（替代 Mixin 的命名冲突和来源不清晰问题）
- **代码组织**：按功能而非选项类型组织代码，一个功能的代码集中在一起
- **TypeScript 支持**：更好的类型推导，天然支持 TS
- **Tree Shaking**：Composition API 可以按需引入，减小打包体积