# ArrayList vs LinkedList

## ⭐ 面试重点速览

| 知识模块 | 重点内容 | 面试频率 |
|----------|----------|----------|
| ArrayList 底层 | 动态数组、扩容机制（1.5 倍） | 极高 |
| LinkedList 底层 | 双向链表 | 极高 |
| 两者对比 | 随机访问、插入删除、空间占用 | 极高 |
| fail-fast | modCount 机制、正确删除方式 | 高 |
| Vector | 为什么被淘汰 | 中 |

---

## 一、ArrayList 底层实现

### 1.1 数据结构

ArrayList 底层是一个 **Object 数组**，默认初始容量为 10。

```java
// ArrayList 核心字段
transient Object[] elementData;  // 存储元素的数组
private int size;                // 当前元素个数
private static final int DEFAULT_CAPACITY = 10;  // 默认初始容量
```

### 1.2 ⭐ 扩容机制

```java
/**
 * ArrayList 扩容核心逻辑（简化）
 */
private void grow(int minCapacity) {
    int oldCapacity = elementData.length;
    // ⭐ 新容量 = 旧容量 + 旧容量/2（即 1.5 倍）
    int newCapacity = oldCapacity + (oldCapacity >> 1);

    if (newCapacity - minCapacity < 0)
        newCapacity = minCapacity;

    if (newCapacity - MAX_ARRAY_SIZE > 0)
        newCapacity = hugeCapacity(minCapacity);

    // 复制数组到新容量
    elementData = Arrays.copyOf(elementData, newCapacity);
}
```

**扩容过程**：
1. 添加元素时检查容量是否够用：`ensureCapacityInternal(size + 1)`
2. 不够 → 扩容到原来的 **1.5 倍**（`oldCapacity + oldCapacity >> 1`）
3. 创建新数组，将旧数组元素复制到新数组（`Arrays.copyOf`）

::: tip 为什么是 1.5 倍？
- 太小（如 1.1 倍）：频繁扩容，性能差
- 太大（如 2 倍）：浪费空间
- 1.5 倍是在空间和时间上的一个折中选择
:::

### 1.3 常见操作复杂度

| 操作 | 复杂度 | 说明 |
|------|--------|------|
| `get(index)` | **O(1)** | 直接通过数组下标访问 |
| `add(E)` | O(1) | 尾部插入，偶尔扩容 |
| `add(index, E)` | **O(n)** | 需要移动 index 后面的所有元素 |
| `remove(index)` | **O(n)** | 需要移动 index 后面的所有元素 |
| `contains(E)` | O(n) | 需要遍历查找 |

---

## 二、LinkedList 底层实现

### 2.1 数据结构

LinkedList 底层是**双向链表**，每个节点有 prev 和 next 指针。

```java
// LinkedList 核心结构
transient Node<E> first;  // 头节点
transient Node<E> last;   // 尾节点

private static class Node<E> {
    E item;        // 存储的元素
    Node<E> next;  // 后继节点
    Node<E> prev;  // 前驱节点
}
```

### 2.2 常见操作复杂度

| 操作 | 复杂度 | 说明 |
|------|--------|------|
| `get(index)` | **O(n)** | 需要从头/尾遍历到 index 位置 |
| `add(E)` | O(1) | 尾部插入，直接修改 last 指针 |
| `add(index, E)` | O(n) | 需要先遍历到 index 位置 |
| `remove(index)` | O(n) | 需要先遍历到 index 位置 |
| `remove(Object)` | O(n) | 需要遍历查找 |
| `contains(E)` | O(n) | 需要遍历 |

---

## ⭐ 三、ArrayList vs LinkedList 对比

| 维度 | ArrayList | LinkedList |
|------|-----------|------------|
| **底层结构** | 动态数组 | 双向链表 |
| **随机访问** | ✅ O(1) | ❌ O(n) |
| **头部插入** | O(n)（需要移动所有元素） | O(1) |
| **尾部插入** | O(1)（偶尔扩容） | O(1) |
| **中间插入** | O(n)（需要移动） | O(n)（需要遍历定位） |
| **删除** | O(n)（需要移动） | O(1)（定位后，指针操作） |
| **内存占用** | 数组尾部有预留空间 | 每个节点额外存储 prev/next 指针 |
| **实现接口** | List | List + Deque（双端队列） |
| **适用场景** | 频繁随机访问、尾部插入 | 频繁头部/尾部插入删除 |

::: tip 关键结论
- 需要**频繁随机访问** → ArrayList
- 需要**频繁在头部/尾部插入删除** → LinkedList
- 中间位置的插入删除，两者都需要 O(n)（LinkedList 需要遍历到目标位置），实际差距不大
- 大多数场景下，ArrayList 是更好的选择（缓存友好、内存连续）
:::

---

## ⭐ 四、fail-fast 机制

### 4.1 原理

```java
// ArrayList 内部维护 modCount 字段
protected transient int modCount = 0;

// 每次修改操作都会 modCount++
public boolean add(E e) {
    ensureCapacityInternal(size + 1);
    elementData[size++] = e;
    return true;
}
// 内部会调用 modCount++ 的方法

// 迭代器创建时记录 expectedModCount
private class Itr implements Iterator<E> {
    int expectedModCount = modCount;  // 记录创建时的 modCount

    public E next() {
        checkForComodification();  // 每次 next() 都检查
        // ...
    }

    final void checkForComodification() {
        if (modCount != expectedModCount)
            throw new ConcurrentModificationException();
    }
}
```

### 4.2 如何正确删除？

```java
// ❌ 错误：增强 for 循环中直接删除
for (String s : list) {
    if (s.equals("target")) {
        list.remove(s);  // 抛出 ConcurrentModificationException
    }
}

// ✅ 正确：使用迭代器的 remove()
Iterator<String> it = list.iterator();
while (it.hasNext()) {
    String s = it.next();
    if (s.equals("target")) {
        it.remove();  // 迭代器内部同步了 expectedModCount
    }
}

// ✅ 正确：使用 removeIf（JDK 8+）
list.removeIf(s -> s.equals("target"));
```

---

## 五、Vector 为什么被淘汰？

| 维度 | Vector | ArrayList |
|------|--------|-----------|
| 线程安全 | ✅ 所有方法都用 synchronized 修饰 | ❌ 线程不安全 |
| 性能 | 低（每次操作都要获取锁） | 高 |
| 扩容 | 2 倍扩容 | 1.5 倍扩容 |
| 遗留问题 | 每次操作都加锁，粒度太大 | 需要时外部同步 |

即使需要线程安全，也不推荐用 Vector，应该用 `Collections.synchronizedList()` 或 `CopyOnWriteArrayList`。

---

## ⭐ 面试高频问题

### Q1：ArrayList 和 LinkedList 的区别？

- ArrayList：底层动态数组，随机访问 O(1)，插入删除 O(n)。适合读多写少
- LinkedList：底层双向链表，随机访问 O(n)，首尾插入 O(1)。适合频繁首尾操作

### Q2：ArrayList 的扩容机制？

默认容量 10，每次扩容为原来的 1.5 倍（`oldCapacity + oldCapacity >> 1`）。通过 `Arrays.copyOf` 创建新数组并复制元素。

### Q3：什么是 fail-fast？如何避免？

fail-fast 是集合的快速失败机制。遍历时如果集合结构被修改，抛出 `ConcurrentModificationException`。

避免方式：
- 使用迭代器的 `remove()` 方法
- 使用 `removeIf()`（JDK 8+）
- 使用 fail-safe 集合（如 `CopyOnWriteArrayList`）

### Q4：为什么 ArrayList 的 add 操作不需要扩容时是 O(1)？

数组支持按索引直接访问，尾部插入只需将元素放在 `elementData[size]` 位置，然后 `size++`，不需要移动其他元素。

### Q5：ArrayList 序列化时，elementData 为什么用 transient 修饰？如何保证序列化正确？

`transient` 修饰 `elementData` 是为了**节省序列化空间**。ArrayList 的 `elementData` 数组通常比实际元素多（预留扩容空间），如果直接序列化整个数组，会有大量 null 被序列化。

ArrayList 通过自定义 `writeObject` 和 `readObject` 方法控制序列化：

```java
// ArrayList 自定义序列化（简化）
private void writeObject(ObjectOutputStream s) throws IOException {
    s.defaultWriteObject();
    s.writeInt(size);  // 写入实际大小
    // 只序列化实际元素（size 个）
    for (int i = 0; i < size; i++) {
        s.writeObject(elementData[i]);
    }
}

private void readObject(ObjectInputStream s) throws IOException {
    s.defaultReadObject();
    int capacity = s.readInt();
    // 逐个读取元素
    for (int i = 0; i < capacity; i++) {
        elementData[i] = s.readObject();
    }
}
```

这样只序列化了实际存储的 `size` 个元素，避免了 null 空位的序列化开销。

---

## 面试追问环节

**Q：ArrayList 和 LinkedList 内存占用对比？**

- ArrayList：只存储元素引用，数组部分位置可能为空（预留空间），内存连续
- LinkedList：每个节点额外存储 prev 和 next 两个引用（共 24 字节开销），内存不连续
- 一般情况下，ArrayList 更省内存

**Q：为什么 ArrayList 是缓存友好的？**

ArrayList 底层是连续内存的数组，CPU 缓存行可以预加载相邻元素，遍历时缓存命中率高。LinkedList 节点分散在堆中，缓存命中率低。

**Q：在什么场景下 LinkedList 比 ArrayList 快？**

- 频繁在头部插入/删除：ArrayList 需要移动所有元素，LinkedList 只需修改指针
- 但如果需要先遍历定位，LinkedList 的优势就不明显了

**Q：为什么 ArrayList 的 elementData 用 transient 修饰？**

`transient` 是告诉 Java 序列化机制不要序列化这个字段。ArrayList 自己实现了 `writeObject` 和 `readObject` 方法，只序列化实际存储的元素（size 个），而不是整个数组（可能包含很多 null 空位），节省空间。**Q：为什么 ArrayList 的 elementData 用 transient 修饰？**

`transient` 是告诉 Java 序列化机制不要序列化这个字段。ArrayList 自己实现了 `writeObject` 和 `readObject` 方法，只序列化实际存储的元素（size 个），而不是整个数组（可能包含很多 null 空位），节省空间。