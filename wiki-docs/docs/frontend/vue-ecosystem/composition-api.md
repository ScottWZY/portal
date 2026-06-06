# 组合式 API（Composition API）

## ⭐ 面试重点速览

| 知识模块 | 重点内容 | 面试频率 |
|----------|----------|----------|
| setup 函数 | 执行时机、props/context 参数、script setup 语法糖 | 极高 |
| ref vs reactive | .value 原理、模板自动解包、reactive 局限性、toRef/toRefs | 极高 |
| computed | 缓存机制、依赖追踪、与 methods 区别 | 极高 |
| watch/watchEffect | 惰性 vs 自动追踪、深度侦听、清除副作用、watchPostEffect | 极高 |
| 生命周期钩子 | setup 中替代 Option API 钩子、执行顺序 | 高 |
| 自定义 Hook | 设计原则、与 React Hooks 对比、实战案例 | 高 |

---

## 一、setup 函数

### 1.1 执行时机与参数

```vue
<script>
import { ref, toRefs } from 'vue'

export default {
  props: {
    title: String,
    count: Number
  },
  /**
   * setup 执行时机：
   * 在 beforeCreate 之前，组件实例被创建时执行
   * 此时组件实例尚未完全创建，不能使用 this
   */
  setup(props, context) {
    // props —— 响应式代理对象（不能解构，解构会丢失响应式）
    // 在 Vue 3.4 之前
    const { title } = toRefs(props)

    // context —— 包含 attrs / slots / emit / expose
    const { attrs, slots, emit, expose } = context

    // 暴露给模板的数据和方法
    const localCount = ref(props.count)

    function increment() {
      localCount.value++
    }

    // 返回值会暴露给模板和组件实例
    return {
      localCount,
      increment
    }
  }
}
</script>
```

### 1.2 script setup 语法糖

```vue
<script setup>
/**
 * <script setup> 是推荐的写法，编译时语法糖
 * 优势：
 * 1. 更少的样板代码（无需 return）
 * 2. 顶层导入和变量自动暴露给模板
 * 3. 更好的 TypeScript 类型推导
 * 4. 编译时性能更好
 */
import { ref, computed, watch, onMounted } from 'vue'

// defineProps —— 声明 props（无需导入，编译器宏）
const props = defineProps({
  title: { type: String, required: true },
  count: { type: Number, default: 0 }
})

// defineEmits —— 声明 emit（无需导入）
const emit = defineEmits(['update:count', 'submit'])

// 顶层变量自动暴露给模板
const localCount = ref(props.count)
const doubled = computed(() => localCount.value * 2)

function increment() {
  localCount.value++
  emit('update:count', localCount.value)
}

// 生命周期
onMounted(() => {
  console.log('组件已挂载')
})
</script>
```

---

## 二、响应式 API 深度对比

### 2.1 ref 详解

```js
import { ref, isRef, unref, toRef, toRefs } from 'vue'

// ref 包装基本类型
const count = ref(0)
console.log(count.value)  // 0 —— 必须通过 .value 访问
count.value++             // 取值和赋值都需要 .value

// ref 也可以包装对象（内部会调用 reactive）
const user = ref({ name: 'Alice', age: 25 })
// 等价于 ref(reactive({ name: 'Alice', age: 25 }))
console.log(user.value.name)  // 'Alice' —— 对象需要 .value 再访问属性

// isRef —— 判断是否为 ref 对象
console.log(isRef(count))  // true
console.log(isRef(0))      // false

// unref —— 语法糖：isRef(val) ? val.value : val
console.log(unref(count))  // 0
console.log(unref(0))      // 0

// toRef —— 为响应式对象的某个属性创建 ref（保持响应式连接）
const state = reactive({ name: 'Bob' })
const nameRef = toRef(state, 'name')
nameRef.value = 'Charlie'  // 修改 ref 会同步修改原对象
console.log(state.name)    // 'Charlie'

// toRefs —— 将响应式对象的所有属性转为 ref
const stateObj = reactive({ x: 1, y: 2 })
const { x, y } = toRefs(stateObj)  // 解构后保持响应式
x.value = 10
console.log(stateObj.x)  // 10
```

::: tip 模板中 ref 自动解包规则
在 `<template>` 中，顶层 ref 会自动解包（无需 `.value`）：
```vue
<template>
  <!-- 自动解包：直接使用 count 而非 count.value -->
  <p>{{ count }}</p>
  <!-- 嵌套在对象中的 ref 不会自动解包 -->
  <p>{{ obj.count.value }}</p>
</template>
```
:::

### 2.2 reactive 详解与局限性

```js
import { reactive } from 'vue'

// reactive 只能代理对象类型
const state = reactive({
  count: 0,
  nested: { deep: true }
})

// ✅ 深层响应式：嵌套属性自动代理
state.nested.deep = false  // 触发更新

// ✅ 新增属性自动响应
state.newProp = 'hello'  // 触发更新（Proxy 优势）

// ✅ 删除属性自动响应
delete state.count  // 触发更新

// ❌ 局限性 1：不能替换整个对象
let stateRef = reactive({ count: 0 })
stateRef = reactive({ count: 1 })  // 丢失响应式引用！

// ❌ 局限性 2：解构丢失响应式
const { count } = reactive({ count: 0 })
count++  // 不触发更新（count 是普通值）

// ❌ 局限性 3：不能代理基本类型
// const num = reactive(1)  // 报错！

// ❌ 局限性 4：对 Map/Set 等集合类型，需要特殊处理（Vue 3 已内置支持）
const map = reactive(new Map())
map.set('key', 'value')  // ✅ Vue 3 支持，但 Vue 2 不支持
```

### 2.3 ref vs reactive 选型指南

| 场景 | 推荐 | 原因 |
|------|------|------|
| 基本类型（string/number/boolean） | `ref` | reactive 不支持基本类型 |
| 单值对象（如表单数据） | `ref` | 方便整体替换（如重置表单） |
| 复杂嵌套对象 | `reactive` | 无需 .value，访问更自然 |
| 数组 | `ref` 或 `reactive` | 两者均可，ref 需要 .value |
| 从组合函数返回 | `ref` 优先 | 解构不会丢失响应式 |
| 需要整体替换 | `ref` | 直接 .value = newValue 即可 |

::: tip 社区共识
- **ref 优先**：尤雨溪在 2023 年推荐使用 `ref` 作为默认选择，因为解构友好、统一的 `.value` 心智模型
- **reactive 补充**：当需要深层响应式对象且不需要整体替换时使用
- **Vue 3.4+**：响应式 Props 解构进一步强化了 ref 的优势
:::

---

## 三、计算属性 computed

### 3.1 缓存机制

```js
import { ref, computed } from 'vue'

const firstName = ref('John')
const lastName = ref('Doe')

// computed —— 依赖不变时返回缓存值，不重新计算
const fullName = computed(() => {
  console.log('computed 执行')  // 只在依赖变化时打印
  return `${firstName.value} ${lastName.value}`
})

console.log(fullName.value)  // "John Doe"（第一次计算）
console.log(fullName.value)  // "John Doe"（从缓存获取，不打印）
console.log(fullName.value)  // "John Doe"（从缓存获取，不打印）

firstName.value = 'Jane'
console.log(fullName.value)  // "Jane Doe"（重新计算，打印一次）
```

### 3.2 computed vs methods 区别

```vue
<script setup>
import { ref, computed } from 'vue'

const items = ref([1, 2, 3, 4, 5])

// computed —— 依赖不变时返回缓存值
const filteredItems = computed(() => {
  console.log('computed 重新计算')
  return items.value.filter(n => n > 2)
})

// methods —— 每次调用都重新执行
function getFilteredItems() {
  console.log('methods 重新计算')
  return items.value.filter(n => n > 2)
}
</script>

<template>
  <!-- computed：多次访问只计算一次 -->
  <p>{{ filteredItems }}</p>
  <p>{{ filteredItems }}</p>
  <p>{{ filteredItems }}</p>
  <!-- 方法：每次调用都重新计算 -->
  <p>{{ getFilteredItems() }}</p>
  <p>{{ getFilteredItems() }}</p>
  <p>{{ getFilteredItems() }}</p>
</template>
```

| 维度 | computed | methods |
|------|----------|---------|
| 缓存 | 有缓存（依赖不变时不重新计算） | 无缓存（每次调用都执行） |
| 触发时机 | 依赖变化时自动触发 | 调用时执行 |
| 使用场景 | 派生状态（计算/转换/过滤） | 事件处理、副作用操作 |
| 性能 | 高频访问时性能更好 | 每次都有执行开销 |

---

## 四、侦听器 watch 与 watchEffect

### 4.1 watch 详解

```js
import { ref, reactive, watch } from 'vue'

const count = ref(0)
const state = reactive({ name: 'Alice', info: { age: 25 } })

// 1. 侦听 ref
watch(count, (newVal, oldVal) => {
  console.log(`count 从 ${oldVal} 变为 ${newVal}`)
})

// 2. 侦听 reactive 对象中的属性（必须用 getter 函数）
watch(
  () => state.name,
  (newVal, oldVal) => {
    console.log(`name 从 ${oldVal} 变为 ${newVal}`)
  }
)

// 3. 侦听多个数据源
watch(
  [count, () => state.name],
  ([newCount, newName], [oldCount, oldName]) => {
    console.log('count 或 name 变化了')
  }
)

// 4. 深度侦听
watch(
  () => state.info,
  (newVal) => {
    console.log('info 内部属性变化了')
  },
  { deep: true }  // 深度侦听，递归遍历所有嵌套属性
)

// 5. 立即执行
watch(
  count,
  (newVal) => {
    console.log('立即执行一次')
  },
  { immediate: true }  // 组件挂载时立即执行
)

// 6. 直接侦听 reactive 对象（自动开启深度侦听，implicit deep）
watch(
  state,
  (newVal) => {
    console.log('state 的任何属性变化都会触发')
  }
  // 注意：此时 newVal === oldVal（同一个 Proxy 对象）
  // 旧值和新值相等，因为都是同一个代理对象的引用
)
```

### 4.2 watchEffect 详解

```js
import { ref, watchEffect } from 'vue'

const count = ref(0)
const doubled = ref(0)

/**
 * watchEffect —— 自动追踪依赖
 * 特点：
 * 1. 立即执行一次（收集依赖）
 * 2. 自动追踪回调中使用的所有响应式数据
 * 3. 任何依赖变化时重新执行
 */
const stop = watchEffect(() => {
  // 自动追踪 count.value
  doubled.value = count.value * 2
  console.log(`count: ${count.value}, doubled: ${doubled.value}`)
})
// 立即输出：count: 0, doubled: 0

count.value++
// 输出：count: 1, doubled: 2

// 停止侦听
stop()
count.value++
// 不再输出（已停止）
```

### 4.3 清除副作用（onCleanup）

```js
import { watch, watchEffect } from 'vue'

/**
 * 副作用清除 —— 处理竞态问题
 * 典型场景：搜索输入防抖，解决异步请求返回顺序问题
 */
let controller = null

watchEffect((onCleanup) => {
  const keyword = searchText.value

  // 每次执行前先取消上一次的请求
  if (controller) {
    controller.abort()
  }
  controller = new AbortController()

  fetch(`/api/search?q=${keyword}`, {
    signal: controller.signal
  }).then(res => res.json())
    .then(data => {
      results.value = data
    })

  // 注册清除回调 —— 下一次执行前或组件卸载时调用
  onCleanup(() => {
    controller.abort()
  })
})
```

### 4.4 watch vs watchEffect 对比

| 维度 | watch | watchEffect |
|------|-------|-------------|
| 执行时机 | 惰性执行（默认） | 立即执行 |
| 依赖追踪 | 显式指定数据源 | 自动追踪回调中的依赖 |
| 旧值获取 | 提供 oldVal | 不提供旧值 |
| 深度侦听 | 需要显式设置 `deep: true` | 自动追踪所有访问的深度属性 |
| 使用场景 | 需要 oldVal、精确控制触发时机 | 自动追踪、简单数据联动 |

### 4.5 watchPostEffect

```js
import { watchPostEffect } from 'vue'

/**
 * watchPostEffect —— DOM 更新后执行
 * 等价于 watchEffect 的 { flush: 'post' } 配置
 *
 * 使用场景：需要访问更新后的 DOM
 */
watchPostEffect(() => {
  // 在 DOM 更新后执行，可以安全地访问更新后的 DOM
  console.log('DOM 已更新', document.querySelector('.box').textContent)
})
```

---

## 五、生命周期钩子

### 5.1 Options API 与 Composition API 映射

| Options API | Composition API（setup 中） | 执行时机 |
|-------------|---------------------------|----------|
| `beforeCreate` | `setup()` 本身 | 实例初始化之后 |
| `created` | `setup()` 本身 | 实例创建完成 |
| `beforeMount` | `onBeforeMount` | 挂载开始之前 |
| `mounted` | `onMounted` | 挂载完成（DOM 可用） |
| `beforeUpdate` | `onBeforeUpdate` | 数据变化，DOM 更新前 |
| `updated` | `onUpdated` | DOM 更新后 |
| `beforeUnmount` | `onBeforeUnmount` | 组件卸载前 |
| `unmounted` | `onUnmounted` | 组件卸载后 |
| `errorCaptured` | `onErrorCaptured` | 捕获子组件错误 |
| `activated` | `onActivated` | keep-alive 激活 |
| `deactivated` | `onDeactivated` | keep-alive 停用 |

```vue
<script setup>
import { onMounted, onUnmounted } from 'vue'

// 生命周期钩子可以在 setup 中多次调用，按注册顺序执行
onMounted(() => {
  console.log('第一个 mounted 回调')
})

onMounted(() => {
  console.log('第二个 mounted 回调')
})

// 异步操作清理
let timer = null
onMounted(() => {
  timer = setInterval(() => {
    console.log('tick')
  }, 1000)
})

onUnmounted(() => {
  clearInterval(timer)
})
</script>
```

---

## 六、自定义 Hook（组合函数）

### 6.1 设计原则

```js
/**
 * 自定义 Hook 设计原则：
 * 1. 命名以 use 开头（约定）
 * 2. 逻辑内聚：一个 Hook 只做一件事
 * 3. 返回值清晰：输入 → 输出
 * 4. 副作用清理：返回清理函数或使用 onUnmounted
 */

// 示例：useMouse —— 追踪鼠标位置
import { ref, onMounted, onUnmounted } from 'vue'

export function useMouse() {
  const x = ref(0)
  const y = ref(0)

  function update(event) {
    x.value = event.pageX
    y.value = event.pageY
  }

  onMounted(() => window.addEventListener('mousemove', update))
  onUnmounted(() => window.removeEventListener('mousemove', update))

  return { x, y }
}

// 使用
const { x, y } = useMouse()
```

### 6.2 实战案例：useFetch

```js
/**
 * useFetch —— 通用数据请求 Hook
 * 支持：loading 状态、错误处理、自动清理
 */
import { ref, watchEffect, toValue } from 'vue'

export function useFetch(url) {
  const data = ref(null)
  const error = ref(null)
  const loading = ref(false)

  // 使用 watchEffect 自动追踪依赖
  watchEffect(async (onCleanup) => {
    let isCancelled = false

    loading.value = true
    error.value = null

    try {
      // toValue 统一处理 ref 和普通值
      const response = await fetch(toValue(url))

      if (!isCancelled) {
        data.value = await response.json()
      }
    } catch (e) {
      if (!isCancelled) {
        error.value = e.message
      }
    } finally {
      if (!isCancelled) {
        loading.value = false
      }
    }

    // 竞态处理：新的请求开始时取消旧的请求
    onCleanup(() => {
      isCancelled = true
    })
  })

  return { data, error, loading }
}

// 使用
const { data, loading, error } = useFetch(() => `/api/users/${userId.value}`)
```

### 6.3 与 React Hooks 对比

| 维度 | Vue 3 Composition API | React Hooks |
|------|----------------------|-------------|
| 执行次数 | `setup()` 只执行一次 | 每次渲染都执行 |
| 依赖管理 | 自动追踪依赖（Proxy） | 手动声明依赖数组 |
| 心智负担 | 低（无需考虑闭包陷阱） | 较高（闭包陈旧值、依赖数组） |
| 调用顺序 | 无限制（不会被条件调用影响） | 必须在顶层调用，不能条件调用 |
| 性能优化 | 自动精确更新 | 需要 useMemo/useCallback 手动优化 |
| 清理方式 | `onUnmounted` / `onCleanup` | `useEffect` 返回清理函数 |

::: danger Vue 组合函数 vs React Hooks 的核心差异
React Hooks 的"每次渲染都执行"带来了闭包陈旧值（Stale Closure）问题，需要手动维护依赖数组。Vue 的 Composition API 因为 `setup()` 只执行一次，且响应式系统自动追踪依赖，天然避免了这些问题。

```js
// React —— 闭包陈旧值问题
function Counter() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCount(count + 1)  // ⚠️ count 永远是 0（闭包陈旧值）
    }, 1000)
    return () => clearInterval(timer)
  }, [])  // 需要添加 count 依赖，但这会导致 timer 频繁重建

  // 正确做法：使用函数式更新
  // setCount(c => c + 1)
}

// Vue —— 自动追踪，无闭包问题
const count = ref(0)
onMounted(() => {
  const timer = setInterval(() => {
    count.value++  // ✅ 总是使用最新值
  }, 1000)
  onUnmounted(() => clearInterval(timer))
})
```
:::

---

## ⭐ 面试高频问题

### Q1：ref 和 reactive 到底选哪个？

```js
// 推荐策略：ref 优先 + reactive 补充

// ✅ 使用 ref 的场景（推荐）
const count = ref(0)           // 基本类型
const form = ref({             // 表单数据（方便整体替换）
  name: '',
  email: ''
})
function resetForm() {
  form.value = { name: '', email: '' }  // 整体替换
}

// ✅ 使用 reactive 的场景
const state = reactive({       // 复杂嵌套对象
  user: { profile: { name: '', age: 0 } },
  settings: { theme: 'light', lang: 'zh' }
})
// 无需 .value，访问更自然

// 从组合函数返回时，ref 更友好（解构不丢失响应式）
function useFeature() {
  const data = ref(null)
  const loading = ref(false)
  return { data, loading }  // 调用方可以解构
}
```

### Q2：computed 和 watch 的区别和使用场景？

```js
// computed —— 派生状态（有缓存，有返回值）
const fullName = computed(() => `${firstName.value} ${lastName.value}`)

// watch —— 副作用操作（无返回值，可以执行异步操作）
watch(searchText, async (newVal) => {
  const results = await fetchSearchResults(newVal)
  // 更新搜索结果
})
```

| 特征 | computed | watch |
|------|----------|-------|
| 目的 | 计算派生值 | 响应变化执行副作用 |
| 返回值 | 有（ref） | 无 |
| 缓存 | 有 | 无 |
| 异步 | 不支持 | 支持 |
| 典型场景 | 过滤列表、格式化数据 | 请求数据、操作 DOM、存储状态 |

### Q3：自定义 Hook 的设计模式有哪些？

```js
// 模式 1：状态管理 Hook（返回响应式数据）
export function useLocalStorage(key, defaultValue) {
  const data = ref(JSON.parse(localStorage.getItem(key) || defaultValue))
  watch(data, (val) => localStorage.setItem(key, JSON.stringify(val)))
  return data
}

// 模式 2：事件监听 Hook（返回响应式数据 + 方法）
export function useEventListener(target, event, handler) {
  onMounted(() => target.addEventListener(event, handler))
  onUnmounted(() => target.removeEventListener(event, handler))
}

// 模式 3：组合多个 Hook（高阶 Hook）
export function useUserSearch() {
  const keyword = ref('')
  // 复用 useFetch Hook
  const { data: users, loading } = useFetch(
    () => keyword.value ? `/api/users?q=${keyword.value}` : null
  )
  return { keyword, users, loading }
}
```