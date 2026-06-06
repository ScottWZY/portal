# IO 模型概览

## ⭐ 面试重点速览

| 知识模块 | 重点内容 | 面试频率 |
|----------|----------|----------|
| BIO/NIO/AIO | 三种模型区别、适用场景 | 极高 |
| 五种 IO 模型 | 阻塞/非阻塞/多路复用/信号驱动/异步 | 高 |
| select/poll/epoll | 区别、epoll 为什么高效 | 极高 |
| 零拷贝 | 传统 IO vs mmap vs sendFile | 极高 |

---

## 一、BIO（Blocking IO）

### 1.1 原理

BIO 是传统的**同步阻塞 IO**。每个客户端连接分配一个线程，读写操作会阻塞当前线程直到数据就绪。

```
BIO 模型：
  客户端1 → 线程1 → 阻塞读取
  客户端2 → 线程2 → 阻塞读取
  客户端3 → 线程3 → 阻塞读取
```

### 1.2 特点

| 优点 | 缺点 |
|------|------|
| 编程简单，容易理解 | 每个连接一个线程，线程数随连接数线性增长 |
| 请求隔离性好 | 线程切换开销大，大量连接时消耗资源 |
| 适合连接数少的场景 | 线程大部分时间阻塞等待，资源浪费 |

### 1.3 代码示例

```java
// BIO 服务端
ServerSocket serverSocket = new ServerSocket(8080);
while (true) {
    Socket socket = serverSocket.accept();  // 阻塞等待连接
    new Thread(() -> {
        try {
            InputStream in = socket.getInputStream();
            byte[] buffer = new byte[1024];
            int len = in.read(buffer);  // 阻塞等待数据
            // 处理数据...
        } catch (IOException e) {
            e.printStackTrace();
        }
    }).start();
}
```

---

## 二、NIO（Non-blocking IO）

### 2.1 原理

NIO 是**同步非阻塞 IO**。一个线程通过 Selector 管理多个 Channel，只有当 Channel 就绪时才进行真正的 IO 操作。

```
NIO 模型（多路复用）：
  客户端1 ─┐
  客户端2 ─┼─ Selector（一个线程）→ 就绪的 Channel 才处理
  客户端3 ─┘
```

### 2.2 特点

| 优点 | 缺点 |
|------|------|
| 一个线程管理多个连接，资源利用率高 | 编程复杂，需要理解 Buffer/Channel/Selector |
| 非阻塞，线程不会因等待而浪费 | 数据处理仍需要读写线程 |
| 适合高并发、长连接场景 | |

### 2.3 代码示例

```java
// NIO 服务端
ServerSocketChannel serverChannel = ServerSocketChannel.open();
serverChannel.bind(new InetSocketAddress(8080));
serverChannel.configureBlocking(false);  // 非阻塞模式

Selector selector = Selector.open();
serverChannel.register(selector, SelectionKey.OP_ACCEPT);

while (true) {
    selector.select();  // 阻塞直到有事件就绪
    Set<SelectionKey> keys = selector.selectedKeys();
    for (SelectionKey key : keys) {
        if (key.isAcceptable()) {
            // 接受新连接
            SocketChannel client = serverChannel.accept();
            client.configureBlocking(false);
            client.register(selector, SelectionKey.OP_READ);
        } else if (key.isReadable()) {
            // 读取数据
            SocketChannel client = (SocketChannel) key.channel();
            ByteBuffer buffer = ByteBuffer.allocate(1024);
            client.read(buffer);
            // 处理数据...
        }
    }
    keys.clear();
}
```

---

## 三、AIO（Asynchronous IO）

### 3.1 原理

AIO 是**异步非阻塞 IO**。读写操作由操作系统完成后，通过回调通知应用程序。

```
AIO 模型：
  发起读请求 → 操作系统异步读取 → 读取完成 → 回调通知 → 应用程序处理
```

### 3.2 特点

| 优点 | 缺点 |
|------|------|
| 真正的异步，不需要轮询 | 编程复杂，回调模式 |
| 操作系统层面支持，性能最好 | 在 Linux 上实现不如 NIO 成熟 |
| 适合高并发场景 | 实际使用较少，Netty 也不支持 AIO |

---

## ⭐ 四、BIO vs NIO vs AIO 对比

| 维度 | BIO | NIO | AIO |
|------|-----|-----|-----|
| IO 模型 | 同步阻塞 | 同步非阻塞 | 异步非阻塞 |
| 线程模型 | 1 连接 : 1 线程 | 1 线程 : N 连接 | 有效请求 : 1 线程 |
| 触发方式 | 阻塞等待 | Selector 轮询 | 回调通知 |
| 编程难度 | 简单 | 复杂 | 复杂 |
| 吞吐量 | 低 | 高 | 高 |
| 适用场景 | 连接数少、数据量小 | 连接数多、连接时间短 | 连接数多、连接时间长 |

---

## 五、操作系统五种 IO 模型

| 模型 | 说明 | 阻塞阶段 |
|------|------|----------|
| 阻塞 IO | 应用进程一直等到数据就绪才返回 | 内核等待数据 + 复制数据 |
| 非阻塞 IO | 应用进程轮询内核，数据没就绪就返回 | 复制数据 |
| IO 多路复用 | 一个线程监听多个 fd，就绪后通知 | select/epoll 等待 + 复制数据 |
| 信号驱动 IO | 内核数据就绪后发信号通知 | 复制数据 |
| 异步 IO | 内核完成所有操作后通知 | 无阻塞 |

---

## ⭐ 六、select / poll / epoll

| 维度 | select | poll | epoll |
|------|--------|------|-------|
| 数据结构 | 位图（fd_set） | 链表（pollfd） | 红黑树 + 就绪链表 |
| 最大连接数 | 1024（默认） | 无限制 | 无限制 |
| 遍历方式 | 遍历所有 fd（O(n)） | 遍历所有 fd（O(n)） | 只返回就绪的 fd（O(1)） |
| 触发模式 | 水平触发 | 水平触发 | 水平触发 + 边缘触发 |
| 内存拷贝 | 每次调用都需要拷贝 fd_set | 每次调用都需要拷贝 | 使用 mmap 共享内存 |

::: tip epoll 为什么高效？
1. **红黑树管理 fd**：增删改查 O(log n)
2. **就绪链表**：只返回就绪的 fd，不需要遍历所有 fd
3. **mmap 减少拷贝**：内核和用户空间共享内存，减少数据拷贝
4. **边缘触发（ET）**：只通知一次，减少重复通知
:::

---

## ⭐ 面试高频问题

### Q1：BIO、NIO、AIO 的区别？

| BIO | NIO | AIO |
|-----|-----|-----|
| 同步阻塞 | 同步非阻塞 | 异步非阻塞 |
| 一个连接一个线程 | 一个线程多个连接 | 系统回调通知 |
| 连接数少场景 | 高并发场景 | 高并发、长连接 |

### Q2：select、poll、epoll 的区别？

select 有 fd 数量限制（1024），O(n) 遍历；poll 无数量限制，但仍 O(n) 遍历；epoll 用红黑树 + 就绪链表，O(1) 获取就绪 fd，是 Linux 下高性能网络编程的首选。

### Q3：为什么 Netty 使用 NIO 而不是 AIO？

Netty 在 Linux 上底层使用 epoll（NIO 多路复用），性能已经非常好。AIO 在 Linux 上的实现不如 Windows 成熟，且在 Netty 的架构中，NIO 的非阻塞模型已经足够高效。

### Q4：epoll 为什么比 select/poll 高效？底层是怎么实现的？

| 对比维度 | select/poll | epoll |
|----------|-------------|-------|
| **数据结构** | 数组/链表存储所有 fd | 红黑树 + 就绪链表 |
| **遍历方式** | 每次 select 遍历全部 fd O(n) | 只返回就绪 fd O(1) |
| **内存拷贝** | 每次调用拷贝 fd 集合到内核 | mmap 共享内存，减少拷贝 |
| **fd 增删** | 每次重新设置整个集合 | epoll_ctl 增量添加 O(1) |

**epoll 底层三件套**：
- `epoll_create`：创建 epoll 实例，内核创建红黑树 + 就绪链表
- `epoll_ctl`：添加/删除/修改 fd 到红黑树，并注册回调函数
- `epoll_wait`：等待就绪链表中有 fd，直接返回

当 fd 就绪时，内核中断处理程序会将该 fd 加入就绪链表，`epoll_wait` 直接从这个链表中取，不需要遍历。

### Q5：同步 IO 和异步 IO 的根本区别是什么？NIO 为什么是同步非阻塞的？

**根本区别**：看数据准备和数据拷贝两个阶段由谁完成。

| IO 模型 | 数据准备（等数据从网卡到内核） | 数据拷贝（内核到用户空间） |
|---------|-------------------------------|----------------------------|
| BIO（同步阻塞） | 线程阻塞等待 | 线程阻塞等待 |
| NIO（同步非阻塞） | 线程 select 轮询（不阻塞） | 线程执行 read（阻塞拷贝） |
| AIO（异步非阻塞） | 内核完成，回调通知 | 内核完成，回调通知 |

**NIO 为什么是"同步"的**：虽然 NIO 在等待数据时不阻塞（多路复用），但真正读取数据时（`channel.read()`），数据从内核空间拷贝到用户空间这个阶段，**线程仍然需要参与拷贝**。而 AIO 的拷贝阶段也由内核完成，线程完全不参与。

这就是 NIO 被称为"同步非阻塞"的原因：**等待不阻塞，拷贝仍同步**。

---

## 面试追问环节

**Q：水平触发（LT）和边缘触发（ET）有什么区别？**

- **LT（Level Trigger）**：只要 fd 还有数据可读，每次 `epoll_wait` 都会返回。不处理完会一直通知（默认模式）
- **ET（Edge Trigger）**：只在 fd 状态变化时通知一次。必须一次性把数据读完，否则会丢事件

**Q：NIO 是非阻塞的，为什么 selector.select() 方法会阻塞？**

`select()` 阻塞是等待事件就绪，不是等待 IO 数据。一旦有 Channel 就绪，`select()` 立即返回，应用程序可以非阻塞地处理数据。