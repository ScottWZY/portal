# JavaScript 手写题

## ⭐ 面试重点速览

| 题目 | 核心考点 | 面试频率 | 难度 |
|------|----------|----------|------|
| 防抖（debounce） | 闭包、定时器、this 绑定、立即执行 | 极高 | 中等 |
| 节流（throttle） | 时间戳 vs 定时器、性能优化思想 | 极高 | 中等 |
| 深拷贝（deepClone） | 递归、循环引用（WeakMap）、特殊对象处理 | 极高 | 困难 |
| Promise.all / race / allSettled / any | Promise 原理、并发控制、错误处理 | 极高 | 困难 |
| bind / call / apply | this 指向、原型链、Symbol | 高频 | 中等 |
| 数组去重 | Set、Map、性能对比 | 高频 | 简单 |
| 数组扁平化 | 递归、reduce、栈迭代 | 高频 | 中等 |
| 函数柯里化（curry） | 闭包、参数收集、Function.length | 高频 | 中等 |

---

## 一、防抖（debounce）

**应用场景**：搜索框输入联想、窗口 resize、按钮点击防重复提交。

### 1.1 基础版实现

```js
/**
 * 防抖基础版 —— 延迟执行
 * 触发事件后 delay 毫秒内不再触发，才执行函数
 * @param {Function} fn - 需要防抖的函数
 * @param {number} delay - 延迟时间（毫秒）
 * @returns {Function} 防抖后的函数
 */
function debounce(fn, delay = 300) {
  let timer = null
  return function (...args) {
    // 每次触发都清除上一次的定时器
    if (timer) clearTimeout(timer)
    // 重新设置定时器
    timer = setTimeout(() => {
      // 修正 this 指向调用者
      fn.apply(this, args)
      timer = null
    }, delay)
  }
}
```

### 1.2 加分版：立即执行 + 取消防抖

```js
/**
 * 防抖加分版 —— 支持立即执行 + 取消防抖
 *
 * 立即执行版应用场景：按钮点击（第一次点击立刻生效，防止后续重复点击）
 * delay 内再次触发不会执行，直到停止触发 delay 毫秒后才能再次触发
 *
 * @param {Function} fn - 需要防抖的函数
 * @param {number} delay - 延迟时间（毫秒）
 * @param {boolean} immediate - 是否立即执行
 * @returns {Function} 防抖后的函数（附带 cancel 方法）
 */
function debounce(fn, delay = 300, immediate = false) {
  let timer = null
  // 标记是否已经立即执行过（用于 immediate 模式的状态追踪）
  let isInvoked = false

  const debounced = function (...args) {
    if (timer) clearTimeout(timer)

    // 立即执行模式：首次触发时立即执行，后续在冷却期内不执行
    if (immediate && !isInvoked) {
      fn.apply(this, args)
      isInvoked = true
      // delay 后重置状态，允许下次立即执行
      timer = setTimeout(() => {
        isInvoked = false
        timer = null
      }, delay)
    } else {
      // 延迟执行模式（普通防抖）
      timer = setTimeout(() => {
        fn.apply(this, args)
        isInvoked = false
        timer = null
      }, delay)
    }
  }

  // 取消防抖：清除定时器，重置状态
  debounced.cancel = function () {
    if (timer) clearTimeout(timer)
    timer = null
    isInvoked = false
  }

  return debounced
}
```

---

## 二、节流（throttle）

**应用场景**：滚动事件、鼠标移动、动画帧。

### 2.1 基础版：时间戳实现

```js
/**
 * 节流 —— 时间戳版（首次立即执行，停止后不执行最后一次）
 * 每隔 delay 毫秒最多执行一次
 */
function throttle(fn, delay = 300) {
  let prev = 0 // 记录上一次执行的时间戳
  return function (...args) {
    const now = Date.now()
    // 距离上次执行超过 delay 才执行
    if (now - prev >= delay) {
      fn.apply(this, args)
      prev = now
    }
  }
}
```

### 2.2 基础版：定时器实现

```js
/**
 * 节流 —— 定时器版（首次延迟执行，停止后会执行最后一次）
 */
function throttle(fn, delay = 300) {
  let timer = null
  return function (...args) {
    // 定时器存在说明还在冷却期，直接跳过
    if (timer) return
    timer = setTimeout(() => {
      fn.apply(this, args)
      timer = null
    }, delay)
  }
}
```

### 2.3 加分版：时间戳 + 定时器合并

```js
/**
 * 节流加分版 —— 合并时间戳和定时器
 * 首次立即执行 + 停止后执行最后一次 + 可取消
 *
 * @param {Function} fn - 需要节流的函数
 * @param {number} delay - 间隔时间（毫秒）
 * @param {Object} options - 配置项
 * @param {boolean} options.leading - 是否在开始时执行（默认 true）
 * @param {boolean} options.trailing - 是否在结束后执行（默认 true）
 */
function throttle(fn, delay = 300, options = {}) {
  const { leading = true, trailing = true } = options
  let timer = null
  let prev = 0 // 上一次执行时间
  // trailing 模式下保存最新的参数用于延迟执行
  let trailingArgs = null

  const throttled = function (...args) {
    const now = Date.now()

    // 首次调用或 leading 为 false 时初始化 prev（跳过首次立即执行）
    if (!prev && !leading) {
      prev = now
    }

    // 距离上一次执行的时间间隔还差多少
    const remaining = delay - (now - prev)

    if (remaining <= 0) {
      // 时间间隔已到，立即执行
      if (timer) {
        clearTimeout(timer)
        timer = null
      }
      fn.apply(this, args)
      prev = now
    } else if (!timer && trailing) {
      // 在间隔期内，且需要 trailing 执行，保存最新参数
      trailingArgs = args
      // 设置定时器在剩余时间后执行
      timer = setTimeout(() => {
        fn.apply(this, trailingArgs)
        // 重置状态：trailing 执行完后，重置 prev 为执行时间（或 0）
        prev = leading ? Date.now() : 0
        timer = null
        trailingArgs = null
      }, remaining)
    }
  }

  // 取消节流
  throttled.cancel = function () {
    if (timer) clearTimeout(timer)
    timer = null
    prev = 0
    trailingArgs = null
  }

  return throttled
}
```

---

## 三、深拷贝（deepClone）

**应用场景**：需要完全独立的副本时（状态管理中避免直接修改原对象、表单数据回显等）。

### 3.1 JSON 版（最简单的实现，有诸多限制）

```js
/**
 * JSON 深拷贝 —— 最简单的实现
 * 缺点：无法处理 undefined、函数、Symbol、BigInt、Date、RegExp、Map、Set、循环引用
 * 仅适用于纯 JSON 数据（纯对象/数组/字符串/数字/布尔值/null）
 */
function deepCloneJSON(obj) {
  return JSON.parse(JSON.stringify(obj))
}
```

::: danger JSON 方案的问题
1. `undefined`、`Function`、`Symbol` 都会被丢弃
2. `Date` 会变成字符串（`"2025-01-01T00:00:00.000Z"`）
3. `RegExp` 会变成空对象 `{}`
4. `Map`、`Set`、`WeakMap`、`WeakSet` 会变成空对象
5. `BigInt` 会报错（`TypeError: Do not know how to serialize a BigInt`）
6. 循环引用会报错（`TypeError: Converting circular structure to JSON`）
:::

### 3.2 递归版（处理循环引用）

```js
/**
 * 深拷贝 —— 递归版（处理循环引用，使用 WeakMap）
 * WeakMap 的优势：当原对象被垃圾回收时，WeakMap 中的对应 key 也会被 GC，
 * 不会造成内存泄漏
 *
 * @param {*} obj - 需要深拷贝的值
 * @param {WeakMap} cache - 缓存已拷贝的对象，用于处理循环引用
 * @returns {*} 深拷贝后的值
 */
function deepClone(obj, cache = new WeakMap()) {
  // 基本类型直接返回（null 也是基本类型，但 typeof null === 'object'）
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  // 处理循环引用：如果已经拷贝过该对象，直接返回缓存中的副本
  if (cache.has(obj)) {
    return cache.get(obj)
  }

  // 根据原对象的构造函数创建同类型的新实例
  const cloned = new obj.constructor()

  // 缓存副本，用于后续循环引用检测
  cache.set(obj, cloned)

  // 递归拷贝每个属性
  for (const key of Object.keys(obj)) {
    cloned[key] = deepClone(obj[key], cache)
  }

  return cloned
}
```

### 3.3 加分版：完整处理所有类型

```js
/**
 * 深拷贝完整版 —— 处理 Map/Set/Date/RegExp/函数/循环引用
 *
 * 面试加分点：
 * 1. 使用 WeakMap 而非 Map 处理循环引用（避免内存泄漏）
 * 2. 使用 for...in 而非 Object.keys 遍历（可以拷贝原型链上的属性）
 * 3. 区分数组和普通对象
 * 4. 处理 Date、RegExp、Map、Set 等内置类型
 *
 * @param {*} target - 需要深拷贝的值
 * @param {WeakMap} hash - 内部使用的循环引用缓存
 * @returns {*} 深拷贝后的值
 */
function deepClone(target, hash = new WeakMap()) {
  // null 和基本类型直接返回
  if (target === null || typeof target !== 'object') {
    return target
  }

  // 处理循环引用
  if (hash.has(target)) return hash.get(target)

  // 处理 Date（Date 的 constructor 和 typeof 都是 'object'，需要特殊处理）
  if (target instanceof Date) {
    return new Date(target.getTime())
  }

  // 处理 RegExp
  if (target instanceof RegExp) {
    return new RegExp(target.source, target.flags)
  }

  // 处理 Map（Map 的 key 可以是对象，value 也需要深拷贝）
  if (target instanceof Map) {
    const clonedMap = new Map()
    hash.set(target, clonedMap)
    target.forEach((value, key) => {
      clonedMap.set(deepClone(key, hash), deepClone(value, hash))
    })
    return clonedMap
  }

  // 处理 Set
  if (target instanceof Set) {
    const clonedSet = new Set()
    hash.set(target, clonedSet)
    target.forEach((value) => {
      clonedSet.add(deepClone(value, hash))
    })
    return clonedSet
  }

  // 处理数组和普通对象
  // 使用 for...in 而非 Object.keys，可以遍历原型链上的可枚举属性
  const clonedObj = Array.isArray(target)
    ? []
    : Object.create(Object.getPrototypeOf(target))

  hash.set(target, clonedObj)

  // Reflect.ownKeys 可以同时获取字符串 key 和 Symbol key
  for (const key of Reflect.ownKeys(target)) {
    clonedObj[key] = deepClone(target[key], hash)
  }

  return clonedObj
}
```

---

## 四、手写 Promise 系列

### 4.1 Promise.all

```js
/**
 * Promise.all —— 基础版
 *
 * 特点：
 * - 接收一个可迭代对象（通常是 Promise 数组）
 * - 所有 Promise 都成功 → 返回包含所有结果的数组（顺序与输入一致）
 * - 任意一个 Promise 失败 → 立即 reject，返回第一个错误
 * - 处理空数组 → 立即 resolve([])
 *
 * @param {Iterable} promises - Promise 的可迭代对象
 * @returns {Promise} 结果 Promise
 */
function promiseAll(promises) {
  return new Promise((resolve, reject) => {
    // 将可迭代对象转为数组
    const arr = Array.from(promises)
    const len = arr.length

    // 空数组直接 resolve
    if (len === 0) return resolve([])

    const results = new Array(len) // 预分配长度，保证结果顺序
    let completed = 0

    arr.forEach((promise, index) => {
      // 将非 Promise 值包裹为 Promise（Promise.resolve 可以处理 thenable 对象）
      Promise.resolve(promise)
        .then((value) => {
          // 按 index 存储结果，保证顺序
          results[index] = value
          completed++
          // 所有都完成才 resolve
          if (completed === len) {
            resolve(results)
          }
        })
        .catch((err) => {
          // 任意一个失败立即 reject
          reject(err)
        })
    })
  })
}
```

### 4.2 Promise.all 完整版

```js
/**
 * Promise.all —— 完整版（兼容各种边界情况）
 *
 * 面试加分点：
 * 1. 处理可迭代对象（Array、Set 等）
 * 2. 结果顺序保证
 * 3. 非 Promise 值自动包装
 * 4. 失败立即拒绝
 * 5. 空数组直接 resolve
 *
 * @param {Iterable} iterable - Promise 的可迭代对象
 * @returns {Promise<Array>}
 */
function promiseAll(iterable) {
  // 第一步：参数校验 —— 确保是可迭代对象
  if (iterable == null || typeof iterable[Symbol.iterator] !== 'function') {
    return Promise.reject(
      new TypeError(`${iterable} is not iterable (cannot read property Symbol(Symbol.iterator))`)
    )
  }

  return new Promise((resolve, reject) => {
    // 转为数组（处理 Map、Set 等）
    const promises = Array.from(iterable)
    const len = promises.length

    if (len === 0) {
      return resolve([])
    }

    const results = new Array(len)
    let resolvedCount = 0

    for (let i = 0; i < len; i++) {
      // 使用 Promise.resolve 包裹：自动处理非 Promise 值和 thenable 对象
      Promise.resolve(promises[i]).then(
        (value) => {
          results[i] = value
          resolvedCount++
          if (resolvedCount === len) {
            resolve(results)
          }
        },
        // 第二个 then 参数 = .catch，短路处理失败
        (reason) => {
          reject(reason)
        }
      )
    }
  })
}
```

### 4.3 Promise.race

```js
/**
 * Promise.race —— 竞速模式
 * 返回第一个 settled（无论 fulfilled 还是 rejected）的 Promise 的结果
 *
 * 应用场景：请求超时控制（"请求如果在 3 秒内没返回就超时"）
 */
function promiseRace(iterable) {
  return new Promise((resolve, reject) => {
    const promises = Array.from(iterable)

    for (const promise of promises) {
      // 谁先 settled 就用谁的结果
      Promise.resolve(promise).then(resolve, reject)
    }
  })
}
```

### 4.4 Promise.allSettled

```js
/**
 * Promise.allSettled —— 全部结果版
 * 等待所有 Promise 完成（无论成功或失败），返回包含所有结果的对象数组
 *
 * 返回格式：
 * { status: 'fulfilled', value: xxx }  — 成功
 * { status: 'rejected', reason: xxx }  — 失败
 *
 * 应用场景：批量请求，需要知道每个请求的结果，不因某个失败而中断
 */
function promiseAllSettled(iterable) {
  return new Promise((resolve) => {
    const promises = Array.from(iterable)
    const len = promises.length

    if (len === 0) return resolve([])

    const results = new Array(len)
    let settledCount = 0

    promises.forEach((promise, index) => {
      Promise.resolve(promise).then(
        (value) => {
          results[index] = { status: 'fulfilled', value }
          settledCount++
          if (settledCount === len) resolve(results)
        },
        (reason) => {
          results[index] = { status: 'rejected', reason }
          settledCount++
          if (settledCount === len) resolve(results)
        }
      )
    })
  })
}
```

### 4.5 Promise.any

```js
/**
 * Promise.any —— 任一成功版（ES2021）
 * 返回第一个 fulfilled 的 Promise
 * 如果所有都 rejected  → reject 一个 AggregateError
 *
 * 应用场景：多个 CDN 资源竞速加载，用最快的那个
 */
function promiseAny(iterable) {
  return new Promise((resolve, reject) => {
    const promises = Array.from(iterable)
    const len = promises.length

    if (len === 0) {
      return reject(new AggregateError([], 'All promises were rejected'))
    }

    const errors = new Array(len)
    let rejectedCount = 0

    promises.forEach((promise, index) => {
      Promise.resolve(promise).then(
        (value) => {
          // 第一个成功的直接 resolve，后续的忽略
          resolve(value)
        },
        (reason) => {
          errors[index] = reason
          rejectedCount++
          if (rejectedCount === len) {
            reject(new AggregateError(errors, 'All promises were rejected'))
          }
        }
      )
    })
  })
}
```

---

## 五、手写 bind / call / apply

### 5.1 手写 call

```js
/**
 * 手写 call —— 核心思想：将函数临时挂到目标对象上调用，然后删除
 *
 * @param {Object} context - this 的指向（非严格模式下 null/undefined 指向 window/global）
 * @param {...any} args - 剩余参数
 * @returns {*} 函数返回值
 */
Function.prototype.myCall = function (context, ...args) {
  // 处理 null/undefined，非严格模式指向全局对象
  context = context == null ? globalThis : Object(context)

  // 使用 Symbol 作为临时 key，避免覆盖原属性
  const fnKey = Symbol('fn')
  context[fnKey] = this

  // 通过对象调用函数，此时 this 指向 context
  const result = context[fnKey](...args)

  // 删除临时属性，恢复原状
  delete context[fnKey]

  return result
}
```

### 5.2 手写 apply

```js
/**
 * 手写 apply —— 与 call 几乎一样，只是参数以数组形式传入
 */
Function.prototype.myApply = function (context, args) {
  context = context == null ? globalThis : Object(context)

  const fnKey = Symbol('fn')
  context[fnKey] = this

  // args 可能是 undefined 或非数组，需要处理
  const result = args ? context[fnKey](...args) : context[fnKey]()

  delete context[fnKey]

  return result
}
```

### 5.3 手写 bind

```js
/**
 * 手写 bind —— 返回一个绑定了 this 的新函数
 *
 * 关键点：
 * 1. 返回新函数，不立即执行
 * 2. 支持部分应用（柯里化）：可以在 bind 时和调用时分别传参
 * 3. bind 返回的函数可以作为构造函数（new 调用）：
 *    当作为构造函数时，bind 的 this 绑定失效，this 指向新创建的实例
 * 4. 维护原型链
 *
 * @param {Object} context - 绑定的 this
 * @param {...any} args - 预设参数（部分应用）
 * @returns {Function} 绑定后的新函数
 */
Function.prototype.myBind = function (context, ...bindArgs) {
  const originalFn = this // 保存原函数

  // 返回的绑定函数
  function boundFn(...callArgs) {
    // 判断是否通过 new 调用：
    // new 调用时 this 是 boundFn 的实例，this instanceof boundFn 为 true
    // 此时不绑定 context，使用新创建的 this
    const finalContext = this instanceof boundFn ? this : context

    // 合并 bind 预设参数和调用时参数
    return originalFn.apply(finalContext, [...bindArgs, ...callArgs])
  }

  // 维护原型链：绑定函数创建的实例应该能访问原函数的 prototype
  // 使用 Object.create 而非直接赋值，避免修改 boundFn.prototype 影响 originalFn.prototype
  boundFn.prototype = Object.create(originalFn.prototype)

  return boundFn
}
```

::: tip bind 面试追问：new 调用的处理
面试官可能追问："为什么 bind 返回的函数 new 调用时 this 绑定失效？"
答案：`new` 关键字的优先级高于 `bind`。当使用 `new` 调用时，JS 引擎会创建一个新对象，并将 this 指向该对象。这是 ECMAScript 规范明确规定的行为。
:::

---

## 六、数组去重

### 6.1 Set 一行版（最简洁）

```js
// Set 天然去重，配合展开运算符一行搞定
const unique = (arr) => [...new Set(arr)]
```

### 6.2 forEach + includes 版

```js
function unique(arr) {
  const result = []
  arr.forEach((item) => {
    // includes 是 O(n) 操作，整体 O(n²)
    if (!result.includes(item)) {
      result.push(item)
    }
  })
  return result
}
```

### 6.3 filter + indexOf 版

```js
function unique(arr) {
  // 对于重复元素，只保留第一次出现的位置
  return arr.filter((item, index) => arr.indexOf(item) === index)
}
```

### 6.4 forEach + Map 版（性能最优）

```js
/**
 * Map 版去重 —— 利用 Map 的 key 唯一性，O(n) 时间复杂度
 * 相比之下 includes/indexOf 都是 O(n²)
 */
function unique(arr) {
  const map = new Map()
  const result = []
  arr.forEach((item) => {
    if (!map.has(item)) {
      map.set(item, true)
      result.push(item)
    }
  })
  return result
}
```

::: tip 性能对比
| 方法 | 时间复杂度 | 特点 |
|------|-----------|------|
| Set | O(n) | 最简洁，推荐日常使用 |
| Map | O(n) | 性能最优，可同时处理 NaN |
| filter + indexOf | O(n²) | 不推荐，仅了解 |
| 双重循环 | O(n²) | 最差方案 |
:::

---

## 七、数组扁平化

### 7.1 flat 一行版

```js
// 使用 Infinity 表示无限层级展开
const flatten = (arr) => arr.flat(Infinity)
```

### 7.2 递归版

```js
function flatten(arr) {
  const result = []
  for (const item of arr) {
    if (Array.isArray(item)) {
      // 递归展开子数组并合并
      result.push(...flatten(item))
    } else {
      result.push(item)
    }
  }
  return result
}
```

### 7.3 reduce + concat 版

```js
function flatten(arr) {
  return arr.reduce(
    (acc, item) => acc.concat(Array.isArray(item) ? flatten(item) : item),
    []
  )
}
```

### 7.4 栈迭代版（避免递归栈溢出）

```js
/**
 * 栈迭代版 —— 避免深层嵌套导致的递归栈溢出
 * 面试加分点：能说出递归版可能在深层嵌套时栈溢出，迭代版更安全
 */
function flatten(arr) {
  const stack = [...arr]
  const result = []

  while (stack.length) {
    const item = stack.pop()
    if (Array.isArray(item)) {
      // 子数组展开后放回栈中（逆序 push 保证顺序）
      stack.push(...item)
    } else {
      // 使用 unshift 保证顺序（面试时可以提到用 reverse 替代优化性能）
      result.unshift(item)
    }
  }

  return result
}
```

---

## 八、函数柯里化（curry）

**应用场景**：参数复用、延迟执行、函数组合（compose/pipe）。

```js
/**
 * 函数柯里化 —— 将一个多参数函数转为一系列单参数函数
 *
 * 核心思想：利用闭包收集参数，参数够了就执行，不够返回新函数继续收集
 *
 * @param {Function} fn - 需要柯里化的函数
 * @returns {Function} 柯里化后的函数
 */
function curry(fn) {
  // fn.length 获取函数期望的参数个数
  return function curried(...args) {
    // 参数够了 → 执行
    if (args.length >= fn.length) {
      return fn.apply(this, args)
    }
    // 参数不够 → 返回新函数继续收集
    return function (...nextArgs) {
      return curried.apply(this, [...args, ...nextArgs])
    }
  }
}

// ---- 使用示例 ----
function add(a, b, c) {
  return a + b + c
}

const curriedAdd = curry(add)
console.log(curriedAdd(1)(2)(3))   // 6 —— 逐个传参
console.log(curriedAdd(1, 2)(3))   // 6 —— 部分传参
console.log(curriedAdd(1)(2, 3))   // 6 —— 混合传参
console.log(curriedAdd(1, 2, 3))   // 6 —— 一次性传参
```

::: tip 面试加分点
- `fn.length` 获取函数形参个数，但**不包含默认参数和剩余参数**
- 柯里化是函数式编程的基石，可以推导出 **compose（组合）**和 **pipe（管道）**模式
- 在实际项目中，柯里化常用于中间件模式（如 Redux 中间件、Koa 洋葱模型）
:::

---

## 总结：手写题优先级与策略

| 题目 | 面试策略 | 面试时长的控制 |
|------|----------|----------------|
| debounce | 先写基础版，面试官有要求再加立即执行和取消 | 3~5 分钟 |
| throttle | 先写时间戳版，再说出定时器版的区别 | 3~5 分钟 |
| deepClone | 先写递归版 + WeakMap，再说出 Map/Set/Date/RegExp 的处理思路 | 5~8 分钟 |
| Promise.all | 必须完整写出，包括边界情况（非 Promise 值、空数组） | 5~8 分钟 |
| bind | 必须完整写出，尤其 new 调用的处理 | 3~5 分钟 |
| call/apply | 必须快速写出 | 2~3 分钟 |
| 数组去重 | Set 一行搞定，再说出其他方案的区别 | 2~3 分钟 |
| 扁平化 | 递归版 + 提到迭代版避免栈溢出 | 3~5 分钟 |
| 柯里化 | 完整实现 | 3~5 分钟 |