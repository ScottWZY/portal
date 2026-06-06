# NIO 核心

## ⭐ 面试重点速览

| 知识模块 | 重点内容 | 面试频率 |
|----------|----------|----------|
| 三大组件 | Buffer、Channel、Selector | 极高 |
| Buffer | capacity/position/limit/mark、flip | 高 |
| Selector | 多路复用原理、注册、选择 | 极高 |
| 零拷贝 | 传统 vs mmap vs sendFile | 极高 |
| 直接内存 | DirectByteBuffer、堆外内存 | 高 |

---

## 一、三大核心组件

Java NIO 的核心是三个组件：

```
Buffer（缓冲区）
  ↓ 数据读写
Channel（通道）
  ↓ 注册到
Selector（选择器）
  ↓ 监听
多个 Channel 的就绪事件
```

| 组件 | 作用 | 类比 BIO |
|------|------|----------|
| **Buffer** | 数据容器，所有数据通过 Buffer 读写 | byte[] |
| **Channel** | 双向数据传输通道 | Stream（单向） |
| **Selector** | 多路复用器，一个线程管理多个 Channel | 无对应 |

---

## ⭐ 二、Buffer

### 2.1 四个核心属性

```java
public abstract class Buffer {
    private int capacity;   // 容量：缓冲区最大容量，创建后不可变
    private int limit;      // 界限：可读/写的最大位置
    private int position;   // 位置：当前读/写的位置
    private int mark;       // 标记：用于暂存 position，调用 reset() 恢复
}
```

```
初始状态（写模式，capacity=10）：
  position=0           limit=capacity=10
  ↓                        ↓
  [ _ ][ _ ][ _ ][ _ ][ _ ][ _ ][ _ ][ _ ][ _ ][ _ ]

写入 5 个字节后：
                position=5     limit=10
                    ↓              ↓
  [ A ][ B ][ C ][ D ][ E ][ _ ][ _ ][ _ ][ _ ][ _ ]

flip() 切换到读模式：
  position=0     limit=5
  ↓                  ↓
  [ A ][ B ][ C ][ D ][ E ][ _ ][ _ ][ _ ][ _ ][ _ ]
```

### 2.2 ⭐ 核心方法

| 方法 | 作用 | 原理 |
|------|------|------|
| `flip()` | 写模式 → 读模式 | `limit = position; position = 0` |
| `clear()` | 准备重新写入 | `position = 0; limit = capacity`（数据未清除） |
| `rewind()` | 重新读取 | `position = 0`（limit 不变） |
| `compact()` | 压缩未读数据 | 将未读数据移到开头，position 指向未读数据末尾 |
| `mark()` | 标记当前位置 | `mark = position` |
| `reset()` | 回到标记位置 | `position = mark` |

```java
/**
 * Buffer 基本使用流程
 */
ByteBuffer buffer = ByteBuffer.allocate(1024);  // 分配堆内存

// 1. 写入数据
buffer.put("hello".getBytes());

// 2. ⭐ flip()：切换到读模式
buffer.flip();

// 3. 读取数据
byte[] data = new byte[buffer.remaining()];
buffer.get(data);
System.out.println(new String(data));  // "hello"

// 4. clear()：清空缓冲区，准备重新写入
buffer.clear();
```

### 2.3 直接内存 vs 堆内存

| 维度 | 堆内存缓冲区 | 直接内存缓冲区 |
|------|-------------|---------------|
| 创建 | `ByteBuffer.allocate(1024)` | `ByteBuffer.allocateDirect(1024)` |
| 存储位置 | JVM 堆内存 | 堆外内存（直接内存） |
| IO 效率 | 需要复制到直接内存 | 零拷贝，直接 IO |
| GC | 受 GC 管理 | 不受 GC 管理（通过 Cleaner 回收） |
| 分配开销 | 低 | 较高 |
| 适用场景 | 小数据量、临时使用 | 大文件 IO、长生命周期 |

---

## 三、Channel

### 3.1 特点

- **双向**：Channel 可读可写，Stream 是单向的
- **非阻塞**：可配置为非阻塞模式
- **基于 Buffer**：数据必须通过 Buffer 读写

### 3.2 常用 Channel

| Channel | 用途 |
|---------|------|
| `FileChannel` | 文件读写 |
| `SocketChannel` | TCP 客户端 |
| `ServerSocketChannel` | TCP 服务端 |
| `DatagramChannel` | UDP 通信 |

```java
// 文件复制示例
FileChannel source = FileChannel.open(Paths.get("source.txt"));
FileChannel target = FileChannel.open(Paths.get("target.txt"),
    StandardOpenOption.CREATE, StandardOpenOption.WRITE);

// 方式一：传统方式
ByteBuffer buffer = ByteBuffer.allocate(1024);
while (source.read(buffer) != -1) {
    buffer.flip();
    target.write(buffer);
    buffer.clear();
}

// 方式二：⭐ 零拷贝（transferTo/transferFrom）
source.transferTo(0, source.size(), target);
```

---

## ⭐ 四、Selector 多路复用

### 4.1 原理

Selector 是 NIO 多路复用的核心。一个线程通过 Selector 可以监听多个 Channel 的就绪事件（连接、读、写）。

```java
/**
 * ⭐ Selector 使用流程
 */
// 1. 创建 Selector
Selector selector = Selector.open();

// 2. 创建 Channel 并注册到 Selector
ServerSocketChannel serverChannel = ServerSocketChannel.open();
serverChannel.configureBlocking(false);  // 必须是非阻塞模式
serverChannel.register(selector, SelectionKey.OP_ACCEPT);

// 3. 轮询就绪事件
while (true) {
    selector.select();  // 阻塞直到有 Channel 就绪

    // 4. 处理就绪的 Channel
    Set<SelectionKey> keys = selector.selectedKeys();
    Iterator<SelectionKey> it = keys.iterator();
    while (it.hasNext()) {
        SelectionKey key = it.next();
        if (key.isAcceptable()) {
            // 接受新连接
        } else if (key.isReadable()) {
            // 读取数据
        } else if (key.isWritable()) {
            // 写入数据
        }
        it.remove();  // ⚠️ 必须手动移除
    }
}
```

### 4.2 四种事件

| 事件 | 常量 | 触发条件 |
|------|------|----------|
| 连接就绪 | `OP_ACCEPT` | 有新的客户端连接 |
| 读就绪 | `OP_READ` | 通道有数据可读 |
| 写就绪 | `OP_WRITE` | 通道可以写入数据 |
| 连接就绪 | `OP_CONNECT` | 客户端连接建立完成 |

### 4.3 底层实现

Java NIO 的 Selector 在不同操作系统上有不同的实现：

| 操作系统 | 实现 | 说明 |
|----------|------|------|
| Linux 2.6+ | EPollSelectorImpl | 基于 epoll，高性能 |
| macOS | KQueueSelectorImpl | 基于 kqueue |
| Windows | WindowsSelectorImpl | 基于 select |

---

## ⭐ 五、零拷贝

### 5.1 传统 IO 的数据拷贝过程

```
传统 IO（read + write）：

磁盘 →(DMA拷贝)→ 内核缓冲区 →(CPU拷贝)→ 用户缓冲区 →(CPU拷贝)→ Socket缓冲区 →(DMA拷贝)→ 网卡
     ↑ 1次            ↑ 2次              ↑ 3次             ↑ 4次

共 4 次拷贝 + 2 次 CPU 拷贝 + 2 次 DMA 拷贝
共 3 次上下文切换（用户态 ↔ 内核态）
```

### 5.2 mmap + write

```
mmap + write：

磁盘 →(DMA拷贝)→ 内核缓冲区(用户态直接映射) →(CPU拷贝)→ Socket缓冲区 →(DMA拷贝)→ 网卡
     ↑ 1次                                      ↑ 2次             ↑ 3次

共 3 次拷贝 + 1 次 CPU 拷贝 + 2 次 DMA 拷贝
共 2 次上下文切换
```

### 5.3 ⭐ sendFile

```
sendFile（Linux 2.4+）：

磁盘 →(DMA拷贝)→ 内核缓冲区 →(DMA拷贝，不经过CPU)→ 网卡
     ↑ 1次                        ↑ 2次

共 2 次拷贝 + 0 次 CPU 拷贝 + 2 次 DMA 拷贝
共 2 次上下文切换（但切换开销极小）
```

| 方式 | 拷贝次数 | CPU 拷贝 | 上下文切换 |
|------|----------|----------|------------|
| 传统 IO | 4 | 2 | 3 |
| mmap + write | 3 | 1 | 2 |
| sendFile | 2 | 0 | 2 |

### 5.4 Java 中的零拷贝

```java
// ⭐ FileChannel.transferTo() —— 底层使用 sendFile
FileChannel source = FileChannel.open(Paths.get("source"));
FileChannel target = FileChannel.open(Paths.get("target"),
    StandardOpenOption.CREATE, StandardOpenOption.WRITE);
source.transferTo(0, source.size(), target);

// ⭐ FileChannel.map() —— 底层使用 mmap
MappedByteBuffer mapped = FileChannel.open(Paths.get("file"))
    .map(FileChannel.MapMode.READ_WRITE, 0, fileSize);
// 直接操作内存，修改会同步到文件
mapped.put("hello".getBytes());
```

::: tip 零拷贝的本质
"零拷贝"不是真的不拷贝，而是**不经过 CPU 拷贝**（数据不经过用户空间），所有拷贝都由 DMA 完成，CPU 可以去做其他事。适用于大文件传输场景。
:::

---

## ⭐ 面试高频问题

### Q1：NIO 三大组件是什么？

- **Buffer**：数据容器，所有数据通过 Buffer 读写
- **Channel**：双向数据传输通道，可配置非阻塞
- **Selector**：多路复用器，一个线程监听多个 Channel 的就绪事件

### Q2：Buffer 的 flip() 和 clear() 有什么区别？

- `flip()`：写模式切换到读模式，`limit = position; position = 0`
- `clear()`：准备重新写入，`position = 0; limit = capacity`（数据未清除，只是重置指针）

### Q3：说一下零拷贝原理？

传统 IO 需要 4 次拷贝（2 次 CPU 拷贝 + 2 次 DMA 拷贝）。sendFile 零拷贝只需要 2 次 DMA 拷贝，数据不经过用户空间，CPU 不参与拷贝。

### Q4：DirectByteBuffer 和 HeapByteBuffer 的区别？

- HeapByteBuffer：在 JVM 堆上分配，受 GC 管理，但 IO 时需要先复制到直接内存
- DirectByteBuffer：在堆外内存分配，IO 效率高（零拷贝），分配和回收开销大

### Q5：直接内存（Direct Memory）的优缺点？什么场景下应该使用？

**优点**：
1. **IO 效率高**：数据不需要从堆内存复制到直接内存，减少一次拷贝
2. **不受 GC 影响**：不会因为 GC 导致应用程序停顿
3. **大文件操作友好**：适合需要反复读写的大数据场景

**缺点**：
1. **分配和回收开销大**：创建 DirectByteBuffer 比堆内存慢
2. **不受 JVM 直接管理**：通过 Cleaner 机制回收，回收时机不可控
3. **受物理内存限制**：超出 `-XX:MaxDirectMemorySize` 会导致 OOM

**适用场景**：
| 场景 | 是否使用 |
|------|----------|
| Netty 网络通信 | ✅ 使用（频繁 IO，避免拷贝） |
| 文件大块读写 | ✅ 使用 |
| 临时小数据 | ❌ 用堆内存（分配快） |
| 需要 GC 自动管理 | ❌ 用堆内存 |

**注意事项**：
```bash
# 监控直接内存使用，避免 OOM
-XX:MaxDirectMemorySize=512m  # 限制最大直接内存
```

同时，Netty 等框架通过内存池（PooledByteBufAllocator）复用 DirectByteBuffer，降低分配和回收开销，结合引用计数实现自动释放。