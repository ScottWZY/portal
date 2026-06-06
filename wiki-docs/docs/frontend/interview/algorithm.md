# 前端算法真题

## ⭐ 面试重点速览

| 题目 | 考察数据结构 | 解题方法 | 时间复杂度 | 面试频率 | 难度 |
|------|-------------|----------|-----------|----------|------|
| 翻转链表 | 链表 | 迭代 + 递归 | O(n) | 极高 | 简单 |
| 二叉树遍历 | 二叉树 | 递归 + 迭代（栈） | O(n) | 极高 | 中等 |
| 最长不重复子串 | 字符串 | 滑动窗口 + Set/Map | O(n) | 高频 | 中等 |
| 三数之和 | 数组 | 排序 + 双指针 | O(n²) | 高频 | 中等 |
| LRU 缓存 | 链表 + 哈希表 | Map + 双向链表 | O(1) | 高频 | 中等 |
| 买卖股票最佳时机 | 数组 | 贪心 / 动态规划 | O(n) | 高频 | 中等 |
| 有效括号 | 字符串 | 栈 | O(n) | 高频 | 简单 |

---

## 一、翻转链表（LeetCode 206）

### 题目描述

给你单链表的头节点 `head`，请你反转链表，并返回反转后的链表。

### 解题思路

**迭代法**：用三个指针 `prev`、`curr`、`next`，遍历链表，逐个反转节点的 `next` 指向。

**递归法**：递归到链表末尾，从后往前逐个反转，新的头节点始终是原链表的尾节点。

### 代码实现

```js
// 链表节点定义
function ListNode(val, next) {
  this.val = val === undefined ? 0 : val
  this.next = next === undefined ? null : next
}

/**
 * 方法一：迭代法
 * 时间复杂度 O(n)，空间复杂度 O(1)
 *
 * 核心思路：遍历链表，将每个节点的 next 指向前一个节点
 * 1 → 2 → 3 → null  变成  null ← 1 ← 2 ← 3
 */
function reverseList(head) {
  let prev = null  // 前一个节点，初始为 null（新链表的尾部）
  let curr = head  // 当前处理的节点

  while (curr) {
    // 保存下一个节点，因为修改 curr.next 后会丢失它
    const next = curr.next
    // 反转：将当前节点的 next 指向前一个节点
    curr.next = prev
    // 移动指针：prev 和 curr 都向右移动一位
    prev = curr
    curr = next
  }

  // 循环结束后 prev 指向原链表的尾节点，即新链表的头节点
  return prev
}

/**
 * 方法二：递归法
 * 时间复杂度 O(n)，空间复杂度 O(n)（递归调用栈）
 *
 * 核心思路：递归到最后一个节点，然后从后往前反转
 * reverseList(1→2→3→null)
 *   → reverseList(2→3→null)
 *     → reverseList(3→null)
 *       → 返回 3（新头节点）
 *     → head=2, head.next=3, 3.next=2, 2.next=null
 *     → 返回 3
 *   → head=1, head.next=2, 2.next=1, 1.next=null
 *   → 返回 3
 */
function reverseListRecursive(head) {
  // 递归终止条件：空链表或只有一个节点
  if (head === null || head.next === null) {
    return head
  }

  // 递归反转后面的链表，newHead 始终是原链表的尾节点
  const newHead = reverseListRecursive(head.next)

  // 反转当前节点和下一个节点的指向
  // head.next 是原链表中 head 的下一个节点
  // 现在需要让 head.next 指向 head
  head.next.next = head
  head.next = null

  return newHead
}
```

---

## 二、二叉树遍历（LeetCode 144/94/145/102）

### 解题思路

二叉树的遍历分为两大类：**深度优先（DFS）**和**广度优先（BFS）**。

- DFS 三种顺序：前序（根-左-右）、中序（左-根-右）、后序（左-右-根）
- BFS：层序遍历（逐层从左到右）

每种遍历都有**递归**和**迭代**两种实现方式。面试中通常会要求迭代实现。

```js
// 二叉树节点定义
function TreeNode(val, left, right) {
  this.val = val === undefined ? 0 : val
  this.left = left === undefined ? null : left
  this.right = right === undefined ? null : right
}
```

### 前序遍历（根-左-右）

```js
// 递归版
function preorderTraversal(root) {
  const result = []
  function dfs(node) {
    if (!node) return
    result.push(node.val)       // 先访问根
    dfs(node.left)              // 再访问左子树
    dfs(node.right)             // 最后访问右子树
  }
  dfs(root)
  return result
}

// 迭代版（栈模拟递归）
function preorderTraversalIterative(root) {
  if (!root) return []
  const result = []
  const stack = [root] // 初始化栈，放入根节点

  while (stack.length) {
    const node = stack.pop() // 弹出栈顶节点
    result.push(node.val)    // 访问根节点
    // 先压入右子节点，再压入左子节点（栈是 LIFO，所以左先出）
    if (node.right) stack.push(node.right)
    if (node.left) stack.push(node.left)
  }

  return result
}
```

### 中序遍历（左-根-右）

```js
// 递归版
function inorderTraversal(root) {
  const result = []
  function dfs(node) {
    if (!node) return
    dfs(node.left)
    result.push(node.val)
    dfs(node.right)
  }
  dfs(root)
  return result
}

// 迭代版
function inorderTraversalIterative(root) {
  const result = []
  const stack = []
  let curr = root

  // 核心思路：一路向左走到头，沿途节点入栈
  while (curr || stack.length) {
    // 持续向左走，将所有左子节点入栈
    while (curr) {
      stack.push(curr)
      curr = curr.left
    }
    // 弹出栈顶节点（最左端的节点）
    curr = stack.pop()
    result.push(curr.val) // 访问（中序位置）
    // 转向右子树
    curr = curr.right
  }

  return result
}
```

### 后序遍历（左-右-根）

```js
// 递归版
function postorderTraversal(root) {
  const result = []
  function dfs(node) {
    if (!node) return
    dfs(node.left)
    dfs(node.right)
    result.push(node.val)
  }
  dfs(root)
  return result
}

// 迭代版（技巧：前序遍历（根-右-左）的反转）
function postorderTraversalIterative(root) {
  if (!root) return []
  const result = []
  const stack = [root]

  while (stack.length) {
    const node = stack.pop()
    // 前序变体：根-右-左（与标准前序相反的子节点入栈顺序）
    result.push(node.val)
    if (node.left) stack.push(node.left)
    if (node.right) stack.push(node.right)
  }

  // 反转结果：根-右-左 → 左-右-根（后序）
  return result.reverse()
}
```

### 层序遍历（BFS）

```js
function levelOrder(root) {
  if (!root) return []
  const result = []
  const queue = [root] // 队列（FIFO）

  while (queue.length) {
    const levelSize = queue.length // 当前层的节点数
    const currentLevel = []        // 当前层的值

    // 处理当前层的所有节点
    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift() // 出队
      currentLevel.push(node.val)
      // 将下一层的节点入队
      if (node.left) queue.push(node.left)
      if (node.right) queue.push(node.right)
    }

    result.push(currentLevel)
  }

  return result
}
```

---

## 三、最长不重复子串（LeetCode 3）

### 题目描述

给定一个字符串 `s`，找出其中不含有重复字符的最长子串的长度。

### 解题思路

**滑动窗口**：维护一个窗口 `[left, right]`，窗口内字符不重复。当 `right` 遇到重复字符时，移动 `left` 直到重复字符被移除。使用 Set 或 Map 记录窗口内字符。

### 代码实现

```js
/**
 * 滑动窗口 + Set
 * 时间复杂度 O(n)，空间复杂度 O(min(n, m))，m 为字符集大小
 *
 * 核心思路：
 * left 和 right 指针维护一个不重复子串的窗口
 * right 向右扩展，遇到重复字符时 left 收缩到重复字符的下一个位置
 */
function lengthOfLongestSubstring(s) {
  const set = new Set()
  let left = 0
  let maxLen = 0

  // right 指针不断向右扩展窗口
  for (let right = 0; right < s.length; right++) {
    const char = s[right]

    // 如果当前字符已存在，收缩左边界直到重复字符被移除
    while (set.has(char)) {
      set.delete(s[left])
      left++
    }

    // 将当前字符加入窗口
    set.add(char)
    // 更新最大长度
    maxLen = Math.max(maxLen, right - left + 1)
  }

  return maxLen
}

/**
 * 优化版：滑动窗口 + Map
 * 使用 Map 记录每个字符最后出现的位置，left 可以直接跳到重复字符的下一个位置
 * 避免 while 循环逐个删除，性能更优
 */
function lengthOfLongestSubstringOptimized(s) {
  const map = new Map() // 字符 → 最后出现的位置
  let left = 0
  let maxLen = 0

  for (let right = 0; right < s.length; right++) {
    const char = s[right]

    // 如果字符已存在且在窗口内，left 直接跳到重复字符的下一个位置
    if (map.has(char) && map.get(char) >= left) {
      left = map.get(char) + 1
    }

    // 更新字符的最新位置
    map.set(char, right)
    maxLen = Math.max(maxLen, right - left + 1)
  }

  return maxLen
}
```

---

## 四、三数之和（LeetCode 15）

### 题目描述

给你一个整数数组 `nums`，判断是否存在三元组 `[nums[i], nums[j], nums[k]]` 满足 `i != j`、`i != k` 且 `j != k`，且 `nums[i] + nums[j] + nums[k] == 0`。返回所有和为 0 且不重复的三元组。

### 解题思路

**排序 + 双指针**：先将数组排序，固定一个数 `nums[i]`，然后在 `i` 右侧使用双指针寻找两数之和为 `-nums[i]` 的组合。关键在于**去重**。

### 代码实现

```js
/**
 * 排序 + 双指针
 * 时间复杂度 O(n²)，空间复杂度 O(1)（不计结果数组）
 *
 * 核心思路：将三数之和转化为两数之和问题
 * 1. 排序数组（方便去重和双指针移动）
 * 2. 固定第一个数 nums[i]
 * 3. 在 i 右侧使用双指针 left 和 right 寻找 nums[left] + nums[right] = -nums[i]
 */
function threeSum(nums) {
  const result = []
  const n = nums.length

  // 排序是双指针的前提
  nums.sort((a, b) => a - b)

  for (let i = 0; i < n - 2; i++) {
    // 剪枝：如果当前数已经大于 0，后面的数更大，不可能和为 0
    if (nums[i] > 0) break

    // 去重：跳过重复的 nums[i]
    if (i > 0 && nums[i] === nums[i - 1]) continue

    let left = i + 1
    let right = n - 1

    while (left < right) {
      const sum = nums[i] + nums[left] + nums[right]

      if (sum === 0) {
        // 找到一组解
        result.push([nums[i], nums[left], nums[right]])

        // 去重：跳过重复的 nums[left] 和 nums[right]
        while (left < right && nums[left] === nums[left + 1]) left++
        while (left < right && nums[right] === nums[right - 1]) right--

        // 移动双指针
        left++
        right--
      } else if (sum < 0) {
        // 和太小，左指针右移（增大和）
        left++
      } else {
        // 和太大，右指针左移（减小和）
        right--
      }
    }
  }

  return result
}
```

---

## 五、LRU 缓存（LeetCode 146）

### 题目描述

设计并实现一个满足 LRU（最近最少使用）缓存约束的数据结构。实现 `LRUCache` 类，`get(key)` 和 `put(key, value)` 操作的平均时间复杂度为 O(1)。

### 解题思路

**Map + 双向链表**：使用 Map 实现 O(1) 查找，使用双向链表维护访问顺序（最近使用的在头部，最久未使用的在尾部）。

面试中也可以使用 JavaScript 内置的 `Map` 直接实现（因为 `Map` 的迭代顺序就是插入顺序）。

### 代码实现

```js
/**
 * 方法一：使用 JavaScript Map（利用 Map 的插入顺序特性）
 * Map 的 keys() 返回的迭代器按照插入顺序排列
 * 每次 get/put 时先删除再重新插入，保证该 key 在 Map 的最末尾（最近使用）
 * 超出容量时删除 Map 的第一个 key（最久未使用）
 *
 * 时间复杂度：get O(1)，put O(1)
 * 空间复杂度：O(capacity)
 */
class LRUCache {
  constructor(capacity) {
    this.capacity = capacity
    this.cache = new Map()
  }

  get(key) {
    if (!this.cache.has(key)) return -1

    // 访问后移动到末尾（标记为最近使用）
    const value = this.cache.get(key)
    this.cache.delete(key)
    this.cache.set(key, value)
    return value
  }

  put(key, value) {
    // 如果 key 已存在，先删除旧值
    if (this.cache.has(key)) {
      this.cache.delete(key)
    }
    // 插入新值到末尾
    this.cache.set(key, value)

    // 超出容量，删除最久未使用的（Map 的第一个 key）
    if (this.cache.size > this.capacity) {
      const oldestKey = this.cache.keys().next().value
      this.cache.delete(oldestKey)
    }
  }
}

/**
 * 方法二：双向链表 + Map（经典实现，展示数据结构理解）
 * 双向链表维护访问顺序，Map 实现 O(1) 查找
 */
class DoublyLinkedNode {
  constructor(key, value) {
    this.key = key
    this.value = value
    this.prev = null
    this.next = null
  }
}

class LRUCacheClassic {
  constructor(capacity) {
    this.capacity = capacity
    this.cache = new Map() // key → 链表节点

    // 虚拟头尾节点，简化边界处理
    this.head = new DoublyLinkedNode(0, 0) // 最近使用
    this.tail = new DoublyLinkedNode(0, 0) // 最久未使用
    this.head.next = this.tail
    this.tail.prev = this.head
  }

  // 将节点移到头部（标记为最近使用）
  #moveToHead(node) {
    this.#removeNode(node) // 先从链表中移除
    this.#addToHead(node)  // 再插入到头部
  }

  // 在头部插入节点
  #addToHead(node) {
    node.prev = this.head
    node.next = this.head.next
    this.head.next.prev = node
    this.head.next = node
  }

  // 从链表中移除节点
  #removeNode(node) {
    node.prev.next = node.next
    node.next.prev = node.prev
  }

  // 移除尾部节点（最久未使用）
  #removeTail() {
    const node = this.tail.prev
    this.#removeNode(node)
    return node
  }

  get(key) {
    if (!this.cache.has(key)) return -1

    const node = this.cache.get(key)
    this.#moveToHead(node) // 访问后移到头部
    return node.value
  }

  put(key, value) {
    if (this.cache.has(key)) {
      // key 已存在，更新值并移到头部
      const node = this.cache.get(key)
      node.value = value
      this.#moveToHead(node)
    } else {
      // 新 key，创建节点并加入头部
      const node = new DoublyLinkedNode(key, value)
      this.cache.set(key, node)
      this.#addToHead(node)

      // 超出容量，删除尾部节点
      if (this.cache.size > this.capacity) {
        const removed = this.#removeTail()
        this.cache.delete(removed.key)
      }
    }
  }
}
```

::: tip 面试建议
前端面试中，方法一（Map 实现）通常就足够了，代码简洁且满足 O(1) 要求。但如果面试官追问"Map 为什么能保证顺序"，可以补充说明 ES6 的 Map 维护了插入顺序。方法二展示了对数据结构的深入理解，是加分项。
:::

---

## 六、买卖股票最佳时机（LeetCode 121）

### 题目描述

给定一个数组 `prices`，`prices[i]` 表示第 `i` 天的股票价格。你只能选择某一天买入并在未来的某一天卖出，求最大利润。如果无法获得利润，返回 0。

### 解题思路

**贪心法**：遍历数组，维护一个历史最低价格 `minPrice`，对于每一天，计算"当天卖出"的利润 = `prices[i] - minPrice`，取最大值。

### 代码实现

```js
/**
 * 贪心法
 * 时间复杂度 O(n)，空间复杂度 O(1)
 *
 * 核心思路：在第 i 天卖出时，最优买入价是前 i-1 天的最低价格
 * 因此遍历过程中维护最低价格，并计算最大利润
 */
function maxProfit(prices) {
  let minPrice = Infinity // 历史最低买入价
  let maxProfit = 0       // 最大利润

  for (const price of prices) {
    // 更新历史最低价
    if (price < minPrice) {
      minPrice = price
    } else {
      // 以当前价格卖出能获得的利润
      const profit = price - minPrice
      // 更新最大利润
      maxProfit = Math.max(maxProfit, profit)
    }
  }

  return maxProfit
}
```

---

## 七、有效括号（LeetCode 20）

### 题目描述

给定一个只包括 `'('`、`')'`、`'{'`、`'}'`、`'['`、`']'` 的字符串 `s`，判断字符串是否有效。有效条件：左括号必须用相同类型的右括号闭合，且左括号必须以正确的顺序闭合。

### 解题思路

**栈**：遇到左括号入栈，遇到右括号时检查栈顶是否匹配。匹配则弹出栈顶，不匹配则无效。最后检查栈是否为空。

### 代码实现

```js
/**
 * 栈解法
 * 时间复杂度 O(n)，空间复杂度 O(n)
 */
function isValid(s) {
  const stack = []
  // 右括号到左括号的映射
  const map = {
    ')': '(',
    ']': '[',
    '}': '{'
  }

  for (const char of s) {
    if (char === '(' || char === '[' || char === '{') {
      // 左括号 → 入栈
      stack.push(char)
    } else {
      // 右括号 → 检查栈顶是否匹配
      if (stack.pop() !== map[char]) {
        return false
      }
    }
  }

  // 栈为空说明所有括号都正确匹配
  return stack.length === 0
}
```

---

## 算法面试策略

| 策略 | 说明 |
|------|------|
| 先说思路 | 在写代码之前，先用自然语言描述解题思路，展现思考过程 |
| 分析复杂度 | 主动说明时间复杂度和空间复杂度 |
| 边界情况 | 考虑空输入、单元素、极端值等边界情况 |
| 优化意识 | 先写出可行解，再讨论优化方向（如递归改迭代、空间换时间） |
| 测试用例 | 自己跑几个测试用例验证代码正确性 |

::: danger 常见踩坑
1. **直接写代码不解释**：面试官看的是你的思考过程，不是背答案的能力
2. **忽略边界情况**：链表为空、数组长度为 0、字符串为空等
3. **不分析复杂度**：这体现你的算法素养
4. **递归不写终止条件**：导致栈溢出
5. **变量命名随意**：面试代码也需要可读性
:::