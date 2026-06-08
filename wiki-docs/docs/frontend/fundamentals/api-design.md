# RESTful vs GraphQL 接口设计

## ⭐ 面试重点速览

| 知识模块 | 重点内容 | 面试频率 |
|----------|----------|----------|
| RESTful 设计规范 | 资源导向、HTTP 方法语义、状态码选择、URL 命名规范、版本控制策略 | 极高 |
| GraphQL 核心概念 | Schema 定义、Query/Mutation/Subscription、类型系统、单端点、N+1 问题 | 极高 |
| RESTful vs GraphQL 对比 | 数据获取灵活性、请求次数、类型安全、缓存策略、学习曲线、适用场景 | 极高 |
| 选型决策 | 什么时候用 RESTful？什么时候用 GraphQL？混合使用的场景 | 中高 |

---

## 一、RESTful API 设计规范

REST（Representational State Transfer）是一种**架构风格**，而非协议。它的核心思想是将一切抽象为**资源（Resource）**，通过标准的 HTTP 方法对资源进行操作。

### 1.1 资源导向设计

RESTful 的核心：**URL 定位资源，HTTP 方法描述操作**。

```text
# ✅ 正确：资源名词复数 + HTTP 方法
GET     /api/users          # 获取用户列表
GET     /api/users/42       # 获取 id=42 的用户
POST    /api/users          # 创建新用户
PUT     /api/users/42       # 全量更新 id=42 的用户
PATCH   /api/users/42       # 部分更新 id=42 的用户
DELETE  /api/users/42       # 删除 id=42 的用户

# ❌ 错误：动词出现在 URL 中
GET  /api/getUsers          # 不要在 URL 中使用动词
POST /api/createUser
POST /api/deleteUser/42
```

### 1.2 HTTP 方法语义

| 方法 | 含义 | 幂等性 | 安全性 | 请求体 |
|------|------|--------|--------|--------|
| `GET` | 获取资源 | 是 | 是 | 无（参数在 URL） |
| `POST` | 创建资源 | 否 | 否 | 有 |
| `PUT` | 全量替换资源 | 是 | 否 | 有 |
| `PATCH` | 部分更新资源 | 否 | 否 | 有 |
| `DELETE` | 删除资源 | 是 | 否 | 无 |

::: tip 幂等性 vs 安全性
- **幂等性**：多次执行结果相同。`PUT` 多次执行，资源最终状态一致；`POST` 多次执行会产生多个资源。
- **安全性**：不会改变服务器状态。只有 `GET`、`HEAD`、`OPTIONS` 是安全方法。
:::

**POST vs PUT vs PATCH 的区别**（面试高频）：

```text
POST   /api/users      # 创建新用户（服务端生成 ID，每次请求创建新资源）
PUT    /api/users/42   # 替换 id=42 用户的全部字段（缺失字段会被置空）
PATCH  /api/users/42   # 只更新传入的字段，其余保持不变
```

```javascript
// 示例：PUT 全量替换
PUT /api/users/42
{ "name": "张三" }     // 如果原用户还有 email、age 字段，它们会被清空

// 示例：PATCH 部分更新
PATCH /api/users/42
{ "name": "张三" }     // 只更新 name 字段，email、age 保持不变
```

### 1.3 HTTP 状态码

| 状态码 | 含义 | 使用场景 |
|--------|------|----------|
| `200 OK` | 成功 | GET、PUT、PATCH 成功 |
| `201 Created` | 创建成功 | POST 创建资源成功，返回新资源 URL |
| `204 No Content` | 成功但无返回体 | DELETE 成功 |
| `301 Moved Permanently` | 永久重定向 | 资源 URL 永久变更 |
| `400 Bad Request` | 请求参数错误 | 参数校验失败、格式错误 |
| `401 Unauthorized` | 未认证 | 缺少或无效的 Token |
| `403 Forbidden` | 无权限 | 已认证但权限不足 |
| `404 Not Found` | 资源不存在 | 查询/更新/删除不存在的资源 |
| `409 Conflict` | 资源冲突 | 并发编辑冲突、唯一键重复 |
| `422 Unprocessable Entity` | 语义错误 | 参数格式正确但语义不合理 |
| `429 Too Many Requests` | 请求频率超限 | 触发限流 |
| `500 Internal Server Error` | 服务器内部错误 | 未捕获的异常 |
| `503 Service Unavailable` | 服务不可用 | 服务维护中或过载 |

::: danger 面试中容易混淆的状态码
- **401 vs 403**：401 是"你没登录/Token 过期"，403 是"你登录了但没权限访问"
- **400 vs 422**：400 是格式错误（如缺少必填字段），422 是格式正确但业务逻辑不通过（如"用户名已存在"）
- **200 vs 201**：POST 创建成功应返回 201，而不是 200
:::

### 1.4 URL 命名规范

```text
# ✅ 推荐做法
/api/users                    # 资源名用复数名词
/api/users/42                 # 层级不超过 3 层
/api/users/42/orders          # 子资源关联
/api/users/42/orders?status=paid&page=1&limit=20  # 查询参数用驼峰

# 连字符分隔（kebab-case）
/api/user-profiles            # ✅ kebab-case
/api/userProfiles             # ❌ 不要用 camelCase
/api/user_profiles            # ❌ 不要用 snake_case

# ❌ 避免的做法
/api/users/42/orders/5/items  # 层级过深（超过 3 层）
/api/v1/getAllUsers           # URL 中出现动词
/api/v1/User                  # 首字母大写
```

### 1.5 版本控制策略

三种主流方案：

| 方案 | 示例 | 优点 | 缺点 |
|------|------|------|------|
| URL 路径 | `/api/v1/users` | 直观、易调试 | URL 不够"纯净" |
| 请求头 | `Accept: application/vnd.api+v1+json` | URL 干净 | 调试不便、缓存策略复杂 |
| 查询参数 | `/api/users?version=1` | 灵活 | 语义弱、不推荐 |

::: tip 推荐
**URL 路径版本控制** 是业界最广泛使用的方案，简单直观，适合大多数项目。对于需要细粒度版本控制的 API 平台，可结合请求头方式。
:::

### 1.6 统一响应格式

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 42,
    "name": "张三",
    "email": "zhangsan@example.com"
  },
  "requestId": "req_abc123"
}
```

```json
// 列表响应
{
  "code": 0,
  "message": "success",
  "data": {
    "items": [...],
    "total": 100,
    "page": 1,
    "pageSize": 20
  }
}
```

```json
// 错误响应
{
  "code": 40001,
  "message": "参数校验失败：邮箱格式不正确",
  "errors": [
    { "field": "email", "message": "邮箱格式不正确" }
  ],
  "requestId": "req_abc123"
}
```

---

## 二、GraphQL 核心概念

GraphQL 是 Facebook 2015 年开源的一种 **API 查询语言**，核心思想是**客户端按需获取数据**，由客户端精确描述需要什么数据，服务端返回恰好对应的结构。

### 2.1 Schema 即类型契约

GraphQL 使用 **SDL（Schema Definition Language）** 定义类型系统，这是前后端之间的强类型契约：

```graphql
# 类型定义
type User {
  id: ID!
  name: String!
  email: String
  age: Int
  posts: [Post!]!       # User 与 Post 的关联关系
  createdAt: String!
}

type Post {
  id: ID!
  title: String!
  content: String
  author: User!          # 反向关联
  comments: [Comment!]!
}

# 查询入口
type Query {
  user(id: ID!): User
  users(page: Int, limit: Int): [User!]!
  post(id: ID!): Post
}

# 变更入口
type Mutation {
  createUser(name: String!, email: String!): User!
  updateUser(id: ID!, name: String, email: String): User!
  deleteUser(id: ID!): Boolean!
}

# 订阅入口（实时推送）
type Subscription {
  userCreated: User!
  postUpdated(postId: ID!): Post!
}
```

::: tip Schema 是"可执行的文档"
Schema 不仅定义了数据结构，还能被工具自动生成 TypeScript 类型、API 文档、Mock 数据。GraphQL 的类型系统比 RESTful 的 JSON Schema 更内聚。
:::

### 2.2 Query：精确获取数据

客户端可以精确指定需要哪些字段，不存在"过度获取"（Over-fetching）或"获取不足"（Under-fetching）：

```graphql
# 客户端查询：只获取需要的字段
query {
  user(id: "42") {
    name
    email
    posts(limit: 3) {
      title
      comments {
        content
      }
    }
  }
}
```

```json
// 服务端响应：结构与查询完全一致
{
  "data": {
    "user": {
      "name": "张三",
      "email": "zhangsan@example.com",
      "posts": [
        {
          "title": "GraphQL 入门指南",
          "comments": [
            { "content": "写得很棒！" },
            { "content": "学习了" }
          ]
        }
      ]
    }
  }
}
```

**与 RESTful 的对比**：同样的数据需求，RESTful 可能需要 3 次请求（`/users/42`、`/users/42/posts`、`/posts/1/comments`），而 GraphQL 只需 1 次。

### 2.3 Mutation：数据变更

```graphql
# 定义变更操作
mutation CreateUser($input: CreateUserInput!) {
  createUser(input: $input) {
    id
    name
    email
  }
}
```

```json
// 变量（Variables）
{
  "input": {
    "name": "李四",
    "email": "lisi@example.com"
  }
}
```

### 2.4 Subscription：实时订阅

```graphql
# 订阅新用户创建事件（基于 WebSocket）
subscription OnUserCreated {
  userCreated {
    id
    name
    email
  }
}
```

Subscription 底层通常基于 WebSocket，适合实时消息推送、协作编辑、通知等场景。RESTful 要实现同样的功能通常需要轮询或额外引入 WebSocket。

### 2.5 单端点架构

GraphQL 只有一个端点（通常是 `/graphql`），所有请求都发送到这个端点：

```http
POST /graphql
Content-Type: application/json

{
  "query": "query { user(id: \"42\") { name email } }"
}
```

::: warning 单端点带来的挑战
- **监控**：无法通过 URL 区分不同请求类型，需要解析请求体
- **缓存**：HTTP 缓存（CDN/浏览器）无法直接使用，需要专门的缓存方案（如 Apollo Client 的规范化缓存）
- **限流**：无法按接口粒度限流，需要基于查询复杂度（Query Complexity）做限流
:::

### 2.6 N+1 问题与 DataLoader

GraphQL 的分层解析可能导致经典的 **N+1 查询问题**：

```graphql
# 查询所有用户及其文章
query {
  users {       # 1 次查询：获取 100 个用户
    name
    posts {     # 100 次查询：每个用户查一次文章
      title
    }
  }
}
```

**解决方案：DataLoader（Facebook 出品）**

```javascript
const DataLoader = require('dataloader')

// 批量加载函数：一次性查询所有需要的文章
const postLoader = new DataLoader(async (userIds) => {
  // 将多次查询合并为一次批量查询
  const posts = await db.posts.find({ authorId: { $in: userIds } })
  // 按 userId 分组返回
  return userIds.map(id => posts.filter(p => p.authorId === id))
})

// 在 Resolver 中使用
const resolvers = {
  User: {
    posts: (user) => postLoader.load(user.id) // 自动批量合并
  }
}
```

DataLoader 的核心机制：
1. 在每个事件循环 tick 内收集所有 `load()` 调用
2. 合并为一个 `loadMany()` 批量请求
3. 按请求顺序分发结果

---

## 三、RESTful vs GraphQL 深度对比

### 3.1 核心维度对比表

| 维度 | RESTful | GraphQL |
|------|---------|---------|
| **数据获取** | 服务端定义返回结构，可能过度获取/获取不足 | 客户端精确指定字段，按需获取 |
| **请求次数** | 关联数据需要多次请求（N+1 客户端） | 单次请求获取所有关联数据 |
| **端点数量** | 多个端点（每个资源一个） | 单一端点 `/graphql` |
| **类型安全** | 需要额外工具（OpenAPI/Swagger） | Schema 即类型，天然类型安全 |
| **HTTP 缓存** | 天然支持 HTTP 缓存（CDN/浏览器） | 需要专门的 GraphQL 缓存方案 |
| **版本控制** | URL 路径版本（`/v1/`） | 无需版本控制（按需获取字段，向后兼容） |
| **学习曲线** | 低（依赖 HTTP 语义） | 中高（需要学习 SDL、Resolver、DataLoader） |
| **工具链** | 成熟（Postman、Swagger、curl） | Apollo、GraphiQL、Relay |
| **文件上传** | 原生支持 multipart/form-data | 需要专门的规范或插件 |
| **错误处理** | HTTP 状态码明确 | 统一 200，错误在 `errors` 数组中 |
| **性能** | 简单场景性能好 | 复杂查询可能引发性能问题（需限制查询深度） |
| **社区生态** | 极度成熟，几乎所有语言都有框架 | 快速增长，Node.js/JS 生态最成熟 |

### 3.2 数据获取对比示例

**场景**：获取用户信息、该用户的文章、每篇文章的评论数量。

```text
# RESTful 方式（3 次请求）
GET /api/users/42
# → { "id": 42, "name": "张三", "email": "..." }

GET /api/users/42/posts
# → [{ "id": 1, "title": "Post 1" }, { "id": 2, "title": "Post 2" }]

GET /api/posts/1/comments?countOnly=true
GET /api/posts/2/comments?countOnly=true
# → { "count": 5 }, { "count": 3 }
```

```graphql
# GraphQL 方式（1 次请求）
query {
  user(id: "42") {
    name
    email
    posts {
      title
      commentCount   # 服务端计算字段
    }
  }
}
```

### 3.3 缓存策略对比

| 缓存层 | RESTful | GraphQL |
|--------|---------|---------|
| **浏览器 HTTP 缓存** | 天然支持（Cache-Control/ETag） | 几乎不可用（统一 POST 端点） |
| **CDN 缓存** | GET 请求可直接缓存 | 需要专门的 GraphQL CDN（如 Apollo GraphOS） |
| **客户端缓存** | 自行管理（Redux/Zustand） | Apollo Client 规范化缓存（自动去重、更新） |
| **服务端缓存** | Redis 缓存接口响应 | 需在 Resolver 层自行实现 |

```javascript
// Apollo Client 的规范化缓存
// 自动将查询结果按 __typename + id 扁平化存储
const client = new ApolloClient({
  cache: new InMemoryCache({
    typePolicies: {
      User: {
        keyFields: ["id"],  // 按 id 去重
      },
    },
  }),
})

// 修改用户后，所有引用该用户的查询自动更新
client.writeFragment({
  id: 'User:42',
  fragment: gql`fragment UserName on User { name }`,
  data: { name: '新名字' },
})
```

---

## 四、选型决策：什么时候用 RESTful？什么时候用 GraphQL？

### 4.1 适合 RESTful 的场景

- **简单的 CRUD 应用**：资源关系简单，没有复杂的嵌套查询需求
- **需要充分利用 HTTP 缓存**：CDN 缓存、浏览器缓存对性能至关重要
- **文件上传/下载服务**：原生支持 multipart 和流式传输
- **对内/对外的简单 API**：接口数量少、调用方单一
- **团队 HTTP 经验丰富**：不需要额外学习 GraphQL 技术栈
- **微服务间的 RPC 调用**：gRPC 或 RESTful 更合适

### 4.2 适合 GraphQL 的场景

- **复杂的数据关联查询**：页面需要多个关联资源的聚合数据
- **多端差异化需求**：移动端、Web 端、小程序需要不同字段组合
- **前端主导型项目**：前端团队希望自主控制数据获取逻辑
- **快速迭代的产品**：需求频繁变更，新增字段不需要服务端配合
- **实时数据需求**：Subscription 替代轮询 + WebSocket 临时方案
- **类型安全是刚需**：前后端需要强类型契约保障

### 4.3 混合使用策略

在实际企业中，**RESTful + GraphQL 混合使用** 是最常见的方案：

```text
                     ┌──────────────┐
                     │   API Gateway │
                     └──────┬───────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│  /graphql     │   │  /api/rest/*  │   │  /api/upload  │
│  复杂查询场景  │   │  简单 CRUD    │   │  文件上传     │
│  Apollo Server│   │  Express/Koa  │   │  multipart    │
└───────────────┘   └───────────────┘   └───────────────┘
```

::: tip 混合策略原则
- **BFF（Backend For Frontend）层**使用 GraphQL，聚合多个微服务的数据
- **微服务间通信**使用 RESTful 或 gRPC
- **文件上传、静态资源**使用 RESTful
- **管理后台**的简单 CRUD 使用 RESTful
- **移动端/前端数据聚合**使用 GraphQL
:::

---

## 五、面试高频问题

### Q1: RESTful API 的核心设计原则是什么？

RESTful 的六大设计原则：

1. **资源导向**：URL 表示资源，名词复数形式（`/api/users`）
2. **HTTP 方法语义**：GET 查询、POST 创建、PUT 全量更新、PATCH 部分更新、DELETE 删除
3. **无状态（Stateless）**：每个请求包含所有必要信息，服务端不保存客户端状态
4. **统一接口**：一致的 URL 命名、响应格式、状态码
5. **分层系统**：客户端不关心是否直接连接到服务器，可通过代理/负载均衡
6. **按需编码（可选）**：服务端可返回可执行代码（如 JavaScript）

### Q2: PUT 和 PATCH 的区别？什么时候用哪个？

| 对比维度 | PUT | PATCH |
|----------|-----|-------|
| 语义 | 全量替换资源 | 部分更新资源 |
| 幂等性 | 是 | 否（取决于实现，RFC 允许非幂等） |
| 请求体 | 完整的资源表示 | 仅包含需要修改的字段 |
| 缺失字段 | 会被置空/默认值 | 保持不变 |

**使用建议**：实际项目中，`PATCH` 的使用频率远高于 `PUT`，因为大多数更新场景只需要修改部分字段。`PUT` 适合表单提交场景（前端持有完整资源版本）。

### Q3: GraphQL 的 N+1 问题怎么解决？

使用 **DataLoader** 批量合并请求：

1. DataLoader 收集同一事件循环 tick 内的所有 `load()` 调用
2. 自动合并为 `loadMany()` 批量请求
3. 按调用顺序分发结果，对单个请求返回对应的 Promise

核心原理：**批处理（Batching）** + **缓存（Caching）**。DataLoader 默认还会缓存已加载的数据，避免重复查询。

### Q4: 什么时候用 RESTful？什么时候用 GraphQL？

**RESTful**：
- 简单 CRUD 场景、需要 HTTP 缓存（CDN）、文件上传下载、微服务间通信
- 团队 HTTP 经验丰富，不需要 GraphQL 学习成本

**GraphQL**：
- 复杂数据关联查询、多端差异化需求、前端主导型项目、快速迭代产品
- 需要强类型契约、实时数据推送

**混合策略**：BFF 层用 GraphQL，微服务间用 RESTful，文件上传用 RESTful。这是目前大厂最主流的实践。

### Q5: GraphQL 如何做权限控制？

GraphQL 的权限控制通常在 **Resolver 层** 实现，而非 Schema 层：

```javascript
const resolvers = {
  Query: {
    // 方案一：在 Resolver 中直接校验
    users: (parent, args, context) => {
      if (!context.user || context.user.role !== 'admin') {
        throw new AuthenticationError('无权限访问')
      }
      return db.users.findAll()
    },
  },
  User: {
    // 方案二：字段级权限（敏感字段脱敏）
    email: (user, args, context) => {
      if (context.user.id !== user.id && context.user.role !== 'admin') {
        return null // 非本人且非管理员，不返回邮箱
      }
      return user.email
    },
  },
}
```

也可以使用 GraphQL Shield 等中间件实现声明式权限控制。

---

## 六、面试追问环节

**Q：GraphQL 的缺点有哪些？**

1. **单端点复杂度**：监控、缓存、限流都变得更困难
2. **N+1 查询**：需要 DataLoader 解决，增加架构复杂度
3. **查询复杂度不可控**：客户端可能构造超深层级查询，需要限制查询深度和复杂度
4. **文件上传**：原生不支持，需要额外规范或插件
5. **学习成本**：团队需要学习 SDL、Resolver、DataLoader 等概念
6. **错误处理**：HTTP 始终返回 200，错误信息在 `errors` 数组中，不够直观

**Q：如果让你设计一个同时支持 RESTful 和 GraphQL 的后端架构，你会怎么做？**

```text
┌──────────────────────────────────────┐
│           API Gateway (Kong/Nginx)    │
│  - 路由分发                           │
│  - 限流 / 认证                        │
│  - 日志 / 监控                        │
└──────────┬───────────────┬───────────┘
           │               │
           ▼               ▼
┌──────────────────┐ ┌──────────────────┐
│  GraphQL Server  │ │  REST API Server │
│  - 复杂查询聚合  │ │  - 简单 CRUD     │
│  - BFF 层        │ │  - 文件上传      │
│  - Apollo Server │ │  - Express/Koa   │
└────────┬─────────┘ └────────┬─────────┘
         │                    │
         └──────────┬─────────┘
                    ▼
┌──────────────────────────────────────┐
│          Service Layer（共享）        │
│  - 业务逻辑                          │
│  - 数据库访问                        │
│  - 缓存 / 消息队列                   │
└──────────────────────────────────────┘
```

关键设计点：
1. **共享 Service 层**：GraphQL 和 RESTful 共享同一套业务逻辑和数据访问层
2. **API Gateway 统一入口**：路由分发、认证、限流在网关层统一处理
3. **GraphQL 作为 BFF**：面向前端做数据聚合，不直接暴露给第三方
4. **RESTful 对外**：如果需要对第三方开放 API，RESTful 更友好

::: danger 容易翻车的点
- 用 POST 做查询操作（把 GraphQL 的查询概念套到 RESTful 上）
- 分不清 401 和 403 的区别
- 不知道 GraphQL 的 N+1 问题是什么，更不知道 DataLoader
- 认为 GraphQL 能完全替代 RESTful（实际项目中两者互补）
- GraphQL 查询不做深度限制，导致恶意查询拖垮服务
- 把版本号放在 URL 中间（如 `/v1/api/users`）而不是最前面
:::

---

## 总结

- RESTful 是**架构风格**，核心是资源导向 + HTTP 方法语义 + 多端点
- GraphQL 是**查询语言**，核心是客户端按需获取 + 单端点 + 强类型 Schema
- RESTful 的优势在于简单、缓存友好、生态成熟；劣势在于过度获取和多次请求
- GraphQL 的优势在于精确获取、减少请求、类型安全；劣势在于复杂度、缓存困难
- 实际项目中推荐**混合使用**：GraphQL 做 BFF 数据聚合，RESTful 做简单 CRUD 和文件上传
- DataLoader 是 GraphQL 解决 N+1 问题的标配方案
- 选型核心考量：**数据复杂度、多端差异、团队能力、缓存需求**