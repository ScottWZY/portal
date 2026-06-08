# 网络高频面试题

## ⭐ 面试重点速览

| 考点 | 考察频率 | 难度 | 掌握要求 |
|------|----------|------|----------|
| URL 到页面展示完整过程 | ⭐⭐⭐⭐⭐ | 中等 | 能完整描述从 DNS 到渲染的全链路 |
| TCP 三次握手四次挥手 | ⭐⭐⭐⭐⭐ | 中等 | 理解为什么是三次和四次 |
| HTTP 缓存策略 | ⭐⭐⭐⭐⭐ | 中等 | 强缓存/协商缓存必须区分清楚 |
| 跨域及解决方案 | ⭐⭐⭐⭐⭐ | 中等 | CORS 原理 + JSONP + 代理 |
| Cookie/Session/Token 区别 | ⭐⭐⭐⭐ | 简单 | 理解各自存储位置和安全性 |
| GET vs POST 区别 | ⭐⭐⭐⭐ | 简单 | 不止表面区别，要理解本质 |
| HTTP 状态码 | ⭐⭐⭐⭐ | 简单 | 301/302/304/401/403/500 必须掌握 |
| HTTPS 加密过程 | ⭐⭐⭐⭐ | 困难 | SSL/TLS 握手流程 |
| DNS 解析过程 | ⭐⭐⭐ | 中等 | 递归查询和迭代查询 |
| CDN 原理与优势 | ⭐⭐⭐ | 中等 | 核心原理和加速机制 |

---

## 1. Q: 浏览器输入 URL 到页面展示的完整过程？

### A: 完整流程分为 6 大阶段：

```
输入 https://www.example.com
───────────────────────────────────────────────→
1. DNS 解析        → IP 地址
2. TCP 连接        → 三次握手建立连接
3. TLS 握手        → HTTPS 安全连接（如适用）
4. HTTP 请求/响应   → 发送请求，接收响应
5. 浏览器解析渲染   → DOM + CSSOM + Render Tree
6. 连接关闭        → 四次挥手
```

### 阶段详解

**第一阶段：DNS 解析（域名 → IP）**

```
1. 浏览器缓存（chrome://net-internals/#dns）
2. 操作系统缓存（hosts 文件）
3. 路由器缓存
4. ISP DNS 缓存
5. 递归查询：根域名服务器 → 顶级域名 → 权威域名服务器
```

**第二阶段：TCP 三次握手建立连接**

```
客户端 → SYN → 服务端
客户端 ← SYN + ACK ← 服务端
客户端 → ACK → 服务端
```

**第三阶段：TLS 握手（HTTPS 场景）**

```
1. Client Hello：支持的加密套件 + 随机数
2. Server Hello：选择的加密套件 + 随机数 + 证书
3. 客户端验证证书合法性
4. 生成 Pre-Master Secret，用服务器公钥加密发送
5. 双方根据三个随机数生成会话密钥
6. 后续通信使用对称加密
```

**第四阶段：HTTP 请求/响应**

```
请求行：GET /index.html HTTP/1.1
请求头：Host, User-Agent, Accept, Cookie...
请求体：POST 数据（如有）

响应行：HTTP/1.1 200 OK
响应头：Content-Type, Content-Length, Cache-Control...
响应体：HTML 内容
```

**第五阶段：浏览器解析渲染（关键渲染路径）**

```
1. 解析 HTML → DOM 树
2. 解析 CSS → CSSOM 树
3. 合并 DOM + CSSOM → Render Tree（渲染树）
4. 布局（Layout/Reflow）：计算每个节点的位置和大小
5. 绘制（Paint）：将每个节点绘制到屏幕上
6. 合成（Composite）：分层合成显示
```

**第六阶段：连接关闭（四次挥手）**

```
客户端 → FIN → 服务端（客户端说：我说完了）
客户端 ← ACK ← 服务端（服务端说：知道了）
客户端 ← FIN ← 服务端（服务端说：我也说完了）
客户端 → ACK → 服务端（客户端说：知道了）
```

::: tip 面试加分点
回答时可以补充：
- **预解析**：浏览器会预解析 DNS，提前获取 IP
- **TCP 预连接**：Chrome 会在用户输入 URL 时就进行 TCP 预连接
- **资源预加载**：`<link rel="preload">` 和 `<link rel="prefetch">`
- **HTTP/2**：支持多路复用，一个 TCP 连接可以并发多个请求
- **HTTP/3**：基于 QUIC 协议，使用 UDP，0-RTT 握手
:::

---

## 2. Q: TCP 三次握手和四次挥手过程？为什么是三次和四次？

### A: 三次握手（建立连接）

```
客户端                          服务端
  │                              │
  │ ──── SYN (seq=x) ──────────→ │  ① 客户端：我要连你，我的序列号是 x
  │                              │
  │ ←── SYN+ACK (seq=y,ack=x+1)──│  ② 服务端：收到了，我的序列号是 y
  │                              │
  │ ──── ACK (ack=y+1) ─────────→ │  ③ 客户端：收到了
  │                              │
状态：ESTABLISHED             状态：ESTABLISHED
```

### 为什么是三次握手，不是两次？

**两次握手的问题**：如果客户端发送的 SYN 报文在网络中延迟，客户端超时重发了一个新的 SYN，服务端收到后建立连接。后来旧的 SYN 终于到达服务端，服务端又建立了一个连接，但客户端已经认为这是无效请求了，造成**服务端资源浪费**。

**三次握手的意义**：
1. 客户端确认自己能发能收
2. 服务端确认自己能收能发
3. 客户端确认服务端能收能发

三次握手确保双方收发能力都正常，且能防止旧连接请求的干扰。

---

### 四次挥手（断开连接）

```
客户端                          服务端
  │                              │
  │ ──── FIN (seq=u) ──────────→ │  ① 客户端：我发完了，准备关闭
  │                              │
  │ ←── ACK (ack=u+1) ──────────│  ② 服务端：知道了（但可能还有数据没发完）
  │                              │
  │ ←── FIN (seq=v) ────────────│  ③ 服务端：我也发完了，准备关闭
  │                              │
  │ ──── ACK (ack=v+1) ─────────→ │  ④ 客户端：知道了
  │                              │
  │ 等待 2MSL（约 2 分钟）         │
  │ 进入 CLOSED 状态              │  进入 CLOSED 状态
```

### 为什么是四次挥手，不是三次？

因为 TCP 连接是**全双工**的，双方都可以独立地发送数据：

1. 客户端说"我发完了"（FIN）→ 但服务端可能还有数据要发
2. 服务端先确认收到（ACK）→ 继续发送剩余数据
3. 服务端也说"我发完了"（FIN）→ 服务端数据也发完了
4. 客户端确认收到（ACK）

**如果合并成三次**：服务端收到 FIN 后立刻回复 FIN+ACK，但此时服务端的数据可能还没发完。所以中间必须分开，ACK 和 FIN 不能合并。

::: tip 为什么要有 2MSL 等待？
- **MSL**（Maximum Segment Lifetime）：报文最大生存时间
- 客户端发送最后一个 ACK 后等待 2MSL
- 目的：确保最后一个 ACK 能到达服务端（如果丢失，服务端会重发 FIN）
- 同时让本次连接的所有报文在网络中消失，不影响新连接
:::

---

## 3. Q: HTTP 缓存策略（强缓存 vs 协商缓存）？

### A: 缓存流程图

```
浏览器请求资源
    │
    ├── 强缓存是否命中？
    │   ├── 是 → 直接使用缓存（200 from disk/memory cache）
    │   └── 否 ↓
    │
    ├── 协商缓存是否命中？
    │   ├── 是 → 304 Not Modified，使用缓存
    │   └── 否 → 200 OK，返回新资源
```

### 强缓存（不需要发请求到服务器）

由 `Cache-Control` 和 `Expires` 控制：

```http
# 响应头设置
Cache-Control: max-age=3600       # 缓存 3600 秒
Cache-Control: no-cache           # 不信任缓存，需要协商
Cache-Control: no-store           # 完全不缓存
Cache-Control: public             # 可被任何中间层缓存（CDN）
Cache-Control: private            # 只能被浏览器缓存
Cache-Control: immutable          # 资源永不改变

# 旧版（已被 Cache-Control 替代）
Expires: Thu, 31 Dec 2026 23:59:59 GMT
```

**优先级**：`Cache-Control` > `Expires`

### 协商缓存（需要发请求到服务器验证）

服务器通过 `Last-Modified` / `ETag` 判断资源是否更新：

| 机制 | 请求头 | 响应头 | 判断方式 |
|------|--------|--------|----------|
| `Last-Modified` / `If-Modified-Since` | `If-Modified-Since` | `Last-Modified` | 比较最后修改时间 |
| `ETag` / `If-None-Match` | `If-None-Match` | `ETag` | 比较资源唯一标识 |

```http
# 第一次请求服务器返回
HTTP/1.1 200 OK
Last-Modified: Mon, 01 Jun 2026 08:00:00 GMT
ETag: "abc123"

# 第二次请求浏览器带上
GET /style.css HTTP/1.1
If-None-Match: "abc123"
If-Modified-Since: Mon, 01 Jun 2026 08:00:00 GMT

# 如果没变化，服务器返回
HTTP/1.1 304 Not Modified
# 浏览器继续使用本地缓存
```

### ETag vs Last-Modified

| 维度 | ETag | Last-Modified |
|------|------|---------------|
| 精度 | 高（内容变化即变化） | 低（秒级时间戳） |
| 周期性修改 | 能检测到 | 如果 1 秒内修改多次，检测不到 |
| 内容未变但时间变化 | 不变 | 会变（误判为需要更新） |
| 服务器性能 | 需要计算，性能有开销 | 直接读文件时间，开销小 |

**优先级**：`ETag` > `Last-Modified`

### 实际缓存策略

```nginx
# 对于不常变的资源（如带 hash 的 JS/CSS），使用强缓存
location ~* \.(js|css|png|jpg|gif|svg|woff2)$ {
  expires 1y;
  add_header Cache-Control "public, immutable";
}

# 对于 HTML 文件，使用协商缓存
location / {
  add_header Cache-Control "no-cache";  # 每次都验证
}
```

::: tip 面试加分
- `Cache-Control: immutable` 是较新的指令，告诉浏览器资源永不改变，即使刷新也不重新验证
- 配合文件名 hash：`app.a1b2c3.js`，内容变化 hash 就变，等同于新资源
- 强缓存最快，但需要配合文件名 hash 或版本号保证更新
- 协商缓存适合 HTML 文件（需要及时更新但可以复用）
:::

---

## 4. Q: 什么是跨域？有哪些解决方案？

### A: 核心概念

**同源策略**（Same-Origin Policy）是浏览器的安全机制，限制不同源之间的资源访问。同源指：**协议 + 域名 + 端口**三者完全相同。

```
https://www.example.com:443
  ↑       ↑              ↑
协议     域名           端口

以下情况就算跨域：
https://www.example.com:443  →  http://www.example.com:443   (协议不同)
https://www.example.com:443  →  https://api.example.com:443  (域名不同)
https://www.example.com:443  →  https://www.example.com:8080 (端口不同)
```

### 跨域解决方案

**方案 1：CORS（跨域资源共享，最推荐）**

服务器设置响应头，告诉浏览器允许跨域：

```http
# 简单请求：服务器设置
Access-Control-Allow-Origin: https://www.example.com  # 或 *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true   # 允许携带 Cookie
Access-Control-Max-Age: 86400            # 预检请求缓存时间
```

**预检请求（Preflight）**：对于非简单请求（如 PUT、DELETE、Content-Type: application/json），浏览器会先发一个 OPTIONS 请求询问服务器是否允许跨域。

```javascript
// 简单请求条件（不触发预检）：
// 1. 方法：GET / HEAD / POST
// 2. Content-Type：text/plain / multipart/form-data / application/x-www-form-urlencoded
// 3. 没有自定义头部

// 触发预检的请求（如 application/json）：
fetch('https://api.example.com/data', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'  // 触发 OPTIONS 预检
  },
  body: JSON.stringify({ name: 'test' })
})
```

---

**方案 2：JSONP（JSON with Padding）**

利用 `<script>` 标签不受同源策略限制的特性，只支持 GET 请求：

```javascript
// 前端：动态创建 script 标签
function jsonp(url, callbackName) {
  return new Promise((resolve) => {
    // 1. 创建全局回调函数
    window[callbackName] = (data) => {
      resolve(data)
      delete window[callbackName]
      document.body.removeChild(script)
    }
    // 2. 动态插入 script 标签
    const script = document.createElement('script')
    script.src = `${url}?callback=${callbackName}`
    document.body.appendChild(script)
  })
}

// 使用
jsonp('https://api.example.com/data', 'myCallback').then(data => {
  console.log(data)
})
```

```javascript
// 后端响应（Node.js）
app.get('/data', (req, res) => {
  const callback = req.query.callback
  const data = { name: 'test', age: 18 }
  // 返回函数调用形式的 JS 代码
  res.send(`${callback}(${JSON.stringify(data)})`)
})
```

**优点**：兼容性好，老浏览器支持  
**缺点**：只支持 GET，不安全（可能被注入恶意代码），错误处理困难

---

**方案 3：代理服务器（开发环境常用）**

```javascript
// Vite 配置 vite.config.js
export default {
  server: {
    proxy: {
      '/api': {
        target: 'https://api.example.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
}
```

同源：前端 `localhost:3000` → 请求 `localhost:3000/api` → 代理转发到 `api.example.com`。

**优点**：开发环境完美解决跨域，前端不需要任何特殊处理  
**缺点**：生产环境需要对应配置（Nginx 反向代理）

---

**方案 4：Nginx 反向代理（生产环境）**

```nginx
server {
  listen 80;
  server_name www.example.com;

  # 前端静态资源
  location / {
    root /var/www/html;
  }

  # API 代理
  location /api/ {
    proxy_pass https://backend.example.com/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }
}
```

---

**方案 5：postMessage + iframe（跨窗口通信）**

```javascript
// 父页面发送消息
iframe.contentWindow.postMessage('data', 'https://other.com')

// 子页面接收消息
window.addEventListener('message', (event) => {
  if (event.origin !== 'https://parent.com') return  // 安全校验
  console.log(event.data)
})
```

---

::: summary 各方案对比

| 方案 | 适用场景 | 请求限制 | 复杂度 | 推荐度 |
|------|----------|----------|--------|--------|
| CORS | 后端可控 | 无限制 | 低 | ⭐⭐⭐⭐⭐ |
| 代理服务器 | 开发环境 | 无限制 | 低 | ⭐⭐⭐⭐⭐ |
| Nginx 反向代理 | 生产环境 | 无限制 | 中 | ⭐⭐⭐⭐⭐ |
| JSONP | 老项目兼容 | 仅 GET | 低 | ⭐⭐ |
| postMessage | 跨窗口通信 | 非 HTTP | 中 | ⭐⭐⭐ |
:::

---

## 5. Q: Cookie、Session、Token 的区别？

### A: 核心区别对比

| 维度 | Cookie | Session | Token（JWT） |
|------|--------|---------|--------------|
| 存储位置 | 浏览器 | 服务器 | 浏览器（localStorage/Cookie） |
| 状态 | 有状态 | 有状态 | 无状态（服务器不存） |
| 安全性 | 较低（可被篡改） | 较高（ID 在服务端） | 高（签名防篡改） |
| 跨域支持 | 受同源策略限制 | 依赖 Cookie 传递 | 不依赖 Cookie，天然支持 |
| 扩展性 | 差（单机） | 差（需要共享 Session） | 好（无状态，天然分布式） |
| 大小限制 | 4KB | 无限制 | 通常较大（几百字节） |
| 移动端友好 | 一般 | 一般 | 好（原生支持 Header 传递） |

### 典型工作流程

**Cookie + Session 模式**：

```
1. 用户登录 → 服务端创建 Session，存储用户信息
2. 服务端返回 Set-Cookie: sessionId=xxx
3. 浏览器后续请求自动携带 Cookie: sessionId=xxx
4. 服务端根据 sessionId 查找 Session，获取用户信息
```

**JWT Token 模式**：

```
1. 用户登录 → 服务端生成 Token，返回给客户端
2. 客户端存储 Token（localStorage / Cookie）
3. 后续请求在 Header 中携带：Authorization: Bearer <token>
4. 服务端验证 Token 签名，解析用户信息（无需查数据库）
```

### 关键区别

::: tip 为什么 Token 更流行？
1. **无状态**：服务器不需要存储 Session，更易横向扩展
2. **跨域友好**：放在 Header 中不受同源策略限制
3. **移动端友好**：原生 App 不方便处理 Cookie
4. **微服务友好**：Token 可以在多个服务间传递，无需共享 Session
:::

---

## 6. Q: GET 和 POST 的区别？哪个更安全？

### A: 核心区别

| 维度 | GET | POST |
|------|-----|------|
| 参数位置 | URL 查询字符串 | 请求体（Request Body） |
| 参数长度 | 有限制（浏览器/服务器 URL 长度限制） | 无明确限制 |
| 安全性 | 参数暴露在 URL、浏览器历史、服务器日志 | 参数在请求体，相对隐蔽 |
| 缓存 | 可被缓存 | 默认不缓存 |
| 书签 | 可收藏 | 不可收藏 |
| 幂等性 | 幂等（多次请求结果相同） | 非幂等（多次请求可能产生不同结果） |
| 语义 | 获取数据 | 提交数据 |
| 编码 | application/x-www-form-urlencoded | 多种编码方式 |

### "哪个更安全"的误区

::: danger 常见误区
**GET 和 POST 本质上都不安全，都是明文传输！**

- 参数放在 URL 不代表安全，放在 Body 也不代表安全
- 只要没有 HTTPS，两者都是明文传输，都可以被中间人截获
- POST 只是让参数不直接暴露在 URL 和浏览器历史中，**相对**隐蔽，但绝不是加密
- 真正安全的是 **HTTPS**，它加密了整个 HTTP 报文
:::

### 面试回答套路

> "GET 和 POST 在安全性上没有本质区别，都是明文传输。POST 的参数在请求体中，不会暴露在 URL 和浏览器历史中，相对隐蔽一些。但真正要实现安全，必须使用 HTTPS 加密传输。从语义上讲，GET 用于获取数据，应该保持幂等；POST 用于提交数据，可以是非幂等的。"

---

## 7. Q: HTTP 状态码 301/302/304/401/403/500 含义？

### A: 状态码分类

| 范围 | 含义 | 常见状态码 |
|------|------|-----------|
| 1xx | 信息响应 | 101 Switching Protocols |
| 2xx | 成功 | 200 OK, 201 Created, 204 No Content |
| 3xx | 重定向 | 301, 302, 304 |
| 4xx | 客户端错误 | 400, 401, 403, 404, 405 |
| 5xx | 服务端错误 | 500, 502, 503, 504 |

### 高频状态码详解

**301 vs 302（永久重定向 vs 临时重定向）**

| 维度 | 301 Moved Permanently | 302 Found（Moved Temporarily） |
|------|----------------------|-------------------------------|
| 含义 | 资源永久迁移到新地址 | 资源临时跳转到新地址 |
| 浏览器行为 | 后续请求直接访问新地址 | 后续请求仍访问原地址 |
| SEO 影响 | 权重转移给新地址 | 权重保留在原地址 |
| 适用场景 | 域名更换、HTTP → HTTPS | 临时维护、活动落地页 |
| 缓存 | 浏览器会缓存 | 默认不缓存 |

---

**304 Not Modified（协商缓存）**

非错误状态码，表示资源未修改，浏览器使用缓存：

```http
# 浏览器发送
GET /style.css HTTP/1.1
If-None-Match: "abc123"

# 资源未修改，服务器返回
HTTP/1.1 304 Not Modified
# 浏览器使用本地缓存
```

---

**401 vs 403（未认证 vs 无权限）**

| 维度 | 401 Unauthorized | 403 Forbidden |
|------|-----------------|---------------|
| 含义 | 未登录或登录过期 | 已登录但没有权限 |
| 语义 | "你是谁？" | "你不能访问这个" |
| 典型场景 | Token 过期、未携带凭证 | 普通用户访问管理员页面 |
| 通常处理 | 跳转到登录页 | 显示"无权限"提示 |

---

**500 系列（服务端错误）**

| 状态码 | 含义 | 常见原因 |
|--------|------|----------|
| 500 Internal Server Error | 服务器内部错误 | 代码 bug、未捕获异常 |
| 502 Bad Gateway | 网关错误 | 上游服务（如 Nginx 后面的应用）挂了 |
| 503 Service Unavailable | 服务不可用 | 服务器过载、维护中 |
| 504 Gateway Timeout | 网关超时 | 上游服务响应超时 |

::: tip 记忆技巧
- 301：**永久**搬家，再也不回来
- 302：**临时**离开，马上回来  
- 304：文件**没变**，用缓存
- 401：**没带钥匙**，需要登录
- 403：**带了钥匙**，但没权限进这个房间
- 500：**服务器自己崩了**，不是你的问题
:::

---

## 8. Q: HTTPS 加密过程（SSL/TLS 握手）？

### A: HTTPS = HTTP + SSL/TLS

TLS 1.3 握手流程（简化版，2 个 RTT → 1 个 RTT）：

```
客户端                                    服务端
  │                                        │
  │ ─ Client Hello ──────────────────────→ │
  │   支持的加密套件 + 密钥交换参数          │
  │    + 随机数 Client Random               │
  │                                        │
  │ ← Server Hello ─────────────────────── │
  │   选择的加密套件 + 密钥交换参数          │
  │    + 随机数 Server Random               │
  │    + 证书（含公钥）                     │
  │    + 签名（防篡改）                     │
  │                                        │
  │ ① 验证证书（CA 链 + 域名 + 有效期）     │
  │ ② 生成 Pre-Master Secret              │
  │ ③ 用公钥加密后发送                     │
  │                                        │
  │ ─ Client Finished ──────────────────→ │
  │                                        │
  │                                        │ ① 收到后用私钥解密
  │                                        │ ② 三个随机数合成会话密钥
  │ ← Server Finished ─────────────────── │
  │                                        │
  │ 后续通信使用会话密钥对称加密               │
```

### 为什么混合使用非对称加密和对称加密？

| 加密类型 | 代表算法 | 特点 | 在 HTTPS 中的角色 |
|----------|----------|------|-------------------|
| 非对称加密 | RSA/ECDHE | 安全但慢 | 握手阶段：安全交换对称密钥 |
| 对称加密 | AES/ChaCha20 | 快 | 数据传输阶段：加密通信内容 |

**总结**：用非对称加密的安全来传输对称密钥，用对称加密的高效来传输数据。

### TLS 1.3 的改进

- 握手从 2-RTT 降到 1-RTT（甚至 0-RTT 恢复连接）
- 移除不安全算法（RSA 密钥交换、SHA-1、CBC 模式）
- 加密更多握手信息（SNI 加密等）

::: tip 面试加分
- 提到证书链验证：浏览器 → 中间 CA → 根 CA，逐级验证
- 提到 HSTS：强制浏览器使用 HTTPS，防止降级攻击
- 提到证书透明（Certificate Transparency）：防止 CA 签发恶意证书
:::

---

## 9. Q: DNS 解析过程？

### A: DNS（Domain Name System）域名解析流程

```
www.example.com → 查询 IP 地址的过程
```

### 完整解析流程

```
浏览器输入 www.example.com
  │
  ├── 1. 浏览器 DNS 缓存
  │     └── 命中 → 直接返回 IP
  │
  ├── 2. 操作系统 DNS 缓存（hosts 文件）
  │     └── 命中 → 直接返回 IP
  │
  ├── 3. 路由器 DNS 缓存
  │     └── 命中 → 直接返回 IP
  │
  ├── 4. ISP DNS 服务器（本地 DNS）
  │     └── 命中 → 直接返回 IP
  │
  └── 5. 递归查询 / 迭代查询
        │
        ├── 根域名服务器（.）
        │   └── 返回 .com 顶级域名服务器地址
        │
        ├── .com 顶级域名服务器
        │   └── 返回 example.com 权威服务器地址
        │
        └── example.com 权威域名服务器
            └── 返回 www.example.com 的 IP 地址
```

### 递归查询 vs 迭代查询

| 维度 | 递归查询 | 迭代查询 |
|------|----------|----------|
| 发起方 | 客户端 → 本地 DNS | 本地 DNS → 各级域名服务器 |
| 特点 | 本地 DNS 替你完成所有查询 | 每一步返回下一级服务器地址 |
| 压力 | 本地 DNS 压力大 | 各级分担 |

### DNS 优化

1. **DNS 预解析**：`<link rel="dns-prefetch" href="//api.example.com">`
2. **减少域名数量**：减少 DNS 查询次数
3. **CDN**：就近解析，减少延迟
4. **DNS 缓存**：合理设置 TTL（Time To Live）
5. **HTTPDNS**：绕过运营商 DNS，防止劫持

---

## 10. Q: CDN 的原理和优势？

### A: CDN（Content Delivery Network）内容分发网络

**核心原理**：通过在各地部署边缘节点，让用户从最近的节点获取内容，减少网络延迟。

### 工作流程

```
没有 CDN：
  用户（北京） ──────────────────────→ 源站（美国）
  延迟：200ms+

有 CDN：
  用户（北京） ─→ 边缘节点（北京） ─→ 源站（美国）
  延迟：10ms（命中缓存） / 200ms（回源）
```

### CDN 核心机制

1. **DNS 智能解析**：根据用户 IP 返回最近的边缘节点 IP
2. **缓存策略**：静态资源缓存在边缘节点，设置合理的过期时间
3. **回源机制**：边缘节点缓存未命中时，向源站拉取资源
4. **内容预热**：提前将资源推送到边缘节点，避免首次访问回源
5. **内容刷新**：资源更新后，主动刷新 CDN 缓存

### CDN 的优势

| 优势 | 说明 |
|------|------|
| **加速访问** | 就近获取内容，大幅降低延迟 |
| **减轻源站压力** | 大量请求由 CDN 节点处理，源站只处理少量回源请求 |
| **提高可用性** | 多节点冗余，单点故障不影响整体服务 |
| **安全防护** | 可抵御 DDoS 攻击（CDN 节点分散流量） |
| **带宽节省** | CDN 承载大部分流量，节省源站带宽成本 |

### 实际应用

```html
<!-- 静态资源通过 CDN 加载 -->
<script src="https://cdn.example.com/js/app.a1b2c3.js"></script>
<link rel="stylesheet" href="https://cdn.example.com/css/main.xyz.css">

<!-- 资源文件带 hash，方便 CDN 缓存 -->
<!-- 内容变化 → hash 变化 → 新 URL → CDN 自动回源获取新内容 -->
```

### CDN 缓存刷新策略

- **文件名 hash**：推荐，资源变化自动生成新 URL
- **版本号**：`app.v2.js` → `app.v3.js`
- **手动刷新**：CDN 控制台提交刷新任务
- **缓存预热**：提前推送热门资源到边缘节点

::: tip 面试加分
- CDN 不仅用于静态资源，也支持**动态加速**（全站加速）
- 边缘计算：在 CDN 节点执行代码（Edge Computing），如 Cloudflare Workers
- 提到 CDN 的局限性：不适用于强实时性数据、需要处理缓存一致性
:::

---

## 总结

网络面试题的核心是**理解协议和流程**，高频考点集中于：

1. **完整请求链路**：DNS → TCP → TLS → HTTP → 渲染，能串起来讲
2. **TCP 协议**：三次握手四次挥手，理解为什么是三次和四次
3. **HTTP 缓存**：强缓存（Cache-Control）、协商缓存（ETag/Last-Modified）
4. **跨域**：CORS 是核心，理解简单请求和预检请求
5. **认证机制**：Cookie/Session 和 Token 的区别和适用场景
6. **HTTPS**：非对称交换密钥 + 对称加密传输数据
7. **CDN**：边缘节点就近分发，加速静态资源

回答网络题时，注意逻辑清晰，先讲原理再讲应用，能用流程图辅助说明更好。