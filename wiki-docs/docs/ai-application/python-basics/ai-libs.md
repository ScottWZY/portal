# AI 开发必备 Python 库

> **创建日期：** 2026-06-06
> **前置知识：** Python 基础

---

## 一、核心库速查

| 库 | 用途 | 重要性 | 类比 Java |
|-----|------|--------|-----------|
| `openai` | 调用 OpenAI 兼容 API | ⭐⭐⭐⭐⭐ | HttpClient |
| `requests` | HTTP 请求 | ⭐⭐⭐⭐⭐ | OkHttp |
| `pydantic` | 数据验证和序列化 | ⭐⭐⭐⭐⭐ | Lombok + Validation |
| `fastapi` | Web 框架 | ⭐⭐⭐⭐⭐ | Spring Boot |
| `uvicorn` | ASGI 服务器 | ⭐⭐⭐⭐ | Tomcat |
| `numpy` | 数值计算 | ⭐⭐⭐⭐ | 无直接类比 |
| `asyncio` | 异步编程 | ⭐⭐⭐⭐ | CompletableFuture |

---

## 二、openai（LLM API 调用）

```python
from openai import OpenAI

# 初始化（支持任何 OpenAI 兼容 API）
client = OpenAI(
    api_key="sk-xxx",
    base_url="https://api.openai.com/v1"  # 可替换为其他 API 地址
)

# 基本调用
response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
        {"role": "system", "content": "你是一个有用的助手"},
        {"role": "user", "content": "介绍 Python"}
    ],
    temperature=0.7,
    max_tokens=500
)

# 获取结果
print(response.choices[0].message.content)
print(f"消耗 Token: {response.usage.total_tokens}")

# 流式输出
stream = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[{"role": "user", "content": "写一首诗"}],
    stream=True
)

for chunk in stream:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="")
```

---

## 三、pydantic（数据模型）

```python
from pydantic import BaseModel, Field
from typing import Optional

# 定义数据模型（类似 Java POJO + Validation）
class User(BaseModel):
    name: str = Field(..., description="用户姓名", min_length=1)
    age: int = Field(..., ge=0, le=150)
    email: Optional[str] = None
    tags: list[str] = []

# 自动验证
user = User(name="张三", age=25)
# user = User(name="张三", age=-1)  # 抛出 ValidationError

# 序列化
print(user.model_dump())  # {"name": "张三", "age": 25, "email": null, "tags": []}
print(user.model_dump_json())  # JSON 字符串

# 配合 OpenAI 结构化输出
from openai import OpenAI
client = OpenAI()

completion = client.beta.chat.completions.parse(
    model="gpt-4o-mini",
    messages=[{"role": "user", "content": "张三，25岁，工程师"}],
    response_format=User  # 直接解析为 Pydantic 模型
)

user = completion.choices[0].message.parsed
print(user.name)  # "张三"
```

---

## 四、requests（HTTP 请求）

```python
import requests

# GET 请求
response = requests.get("https://api.example.com/data")
data = response.json()

# POST 请求（JSON）
response = requests.post(
    "https://api.example.com/submit",
    json={"name": "张三", "age": 25},
    headers={"Authorization": "Bearer token"}
)

# 错误处理
try:
    response = requests.get("https://api.example.com/data", timeout=10)
    response.raise_for_status()  # 非 2xx 状态码抛出异常
    data = response.json()
except requests.Timeout:
    print("请求超时")
except requests.RequestException as e:
    print(f"请求失败: {e}")
```

---

## 五、asyncio（异步编程）

```python
import asyncio
from openai import AsyncOpenAI

# 异步 OpenAI 客户端
client = AsyncOpenAI()

async def ask_question(question):
    """异步调用 LLM"""
    response = await client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": question}]
    )
    return response.choices[0].message.content

async def main():
    # 并发调用多个问题
    questions = ["什么是 Python？", "什么是 Java？", "什么是 Go？"]
    tasks = [ask_question(q) for q in questions]
    answers = await asyncio.gather(*tasks)  # 并发执行
    for q, a in zip(questions, answers):
        print(f"Q: {q}\nA: {a}\n")

# 运行
asyncio.run(main())
```

---

## 六、numpy（数值计算基础）

```python
import numpy as np

# 创建数组
arr = np.array([1, 2, 3, 4, 5])
print(arr.mean())  # 平均值
print(arr.std())   # 标准差

# 矩阵运算（Embedding 计算常用）
a = np.array([0.1, 0.2, 0.3])
b = np.array([0.4, 0.5, 0.6])

# 余弦相似度
cosine_sim = np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))
print(f"余弦相似度: {cosine_sim:.4f}")
```

---

## 面试高频题

### Q1: 如何使用 openai 库调用流式输出？流式输出和非流式输出的实现差异是什么？
**详细答案：** 流式输出（Streaming）的核心价值在于提升用户体验——LLM 生成完整回答可能需要数秒到数十秒，如果等待全部生成完毕再一次性返回，用户会感到明显的等待焦虑。流式输出通过设置 `stream=True` 参数，让 API 以 Server-Sent Events（SSE）的方式逐 token 推送生成内容，用户在第一个 token 生成后几乎立即就能看到内容开始"打字"输出，极大地改善了感知延迟。实现上，非流式调用返回一个完整的 `ChatCompletion` 对象，而流式调用返回一个迭代器，每次 `yield` 一个 `ChatCompletionChunk` 对象，通过 `chunk.choices[0].delta.content` 获取增量文本。

从底层协议来看，OpenAI API 使用 SSE 协议实现流式传输。服务端在 HTTP 响应头中设置 `Content-Type: text/event-stream`，然后持续推送 `data: {...}\n\n` 格式的事件。Python SDK 封装了 SSE 解析逻辑，将原始事件流封装为 Python 迭代器。需要注意的是，流式输出中 `delta` 对象只包含当前 chunk 的新增内容，而非完整内容，因此需要自行拼接完整文本。此外，流式调用结束后通常不包含 `usage` 信息（token 消耗统计），如果需要统计 token 使用量，可以在非流式调用中获取，或者使用 `stream_options={"include_usage": True}` 参数（较新版本的 API 支持）。

在实际 AI 应用开发中，几乎所有面向用户的对话场景都应使用流式输出。FastAPI 中可以通过 `StreamingResponse` 将流式输出的 chunk 逐块返回给前端，前端使用 `fetch` API 的 `ReadableStream` 或 EventSource 逐字渲染。需要注意的是，流式输出期间连接中断的处理策略——应考虑实现重连机制或降级为非流式调用的 fallback 逻辑。

### Q2: pydantic 的核心价值是什么？在 AI 开发中如何使用 pydantic 实现结构化输出？
**详细答案：** pydantic 的核心价值在于"类型安全的数据验证与序列化"，它让 Python 在运行时获得接近静态类型语言的安全保障。在 AI 开发中，pydantic 扮演着至关重要的角色——LLM 的输出本质上是非结构化的文本，而业务系统需要结构化数据。pydantic 充当了"LLM 文本输出"与"业务数据结构"之间的桥梁。通过定义 pydantic 模型（继承 `BaseModel`），开发者可以精确描述期望的数据结构（字段类型、约束条件、默认值等），然后利用 OpenAI 的 Structured Outputs 功能（`response_format` 参数）或 Function Calling 机制，让 LLM 直接输出符合 pydantic 模型定义的 JSON 数据。

具体使用分为三个层次：(1) **基础数据验证**：定义 `class User(BaseModel): name: str; age: int = Field(ge=0, le=150)`，任何不符合约束的数据都会在实例化时抛出 `ValidationError`，防止脏数据流入下游。(2) **LLM 结构化输出**：使用 `client.beta.chat.completions.parse(response_format=User)` 让 OpenAI API 直接按 pydantic 模型 schema 输出 JSON，返回值通过 `.parsed` 属性直接获取已验证的 pydantic 实例。(3) **配置管理**：pydantic 的 `BaseSettings` 类可以从环境变量、`.env` 文件、命令行参数中自动加载配置，非常适合管理 API Key、模型参数等敏感配置项。

在复杂的 AI 工作流中，pydantic 还可以用于定义 Agent 工具的参数 schema（自动生成 JSON Schema 供 LLM 理解工具参数）、RAG 检索结果的标准化格式、以及多步骤工作流中步骤间的数据传递契约。它的 `model_dump()` 和 `model_validate()` 方法使得与 JSON API、数据库 ORM 的交互变得简洁而安全。

### Q3: asyncio 和传统多线程的核心区别是什么？在 AI 开发中什么场景必须使用 asyncio？
**详细答案：** asyncio 和传统多线程的核心区别在于并发模型：asyncio 使用协程（coroutine）在单线程内通过事件循环（event loop）实现协作式多任务，而多线程依赖操作系统进行线程调度（抢占式）。关键差异体现在：(1) **切换开销**：协程切换由 Python 代码控制，开销极小（微秒级）；线程切换由操作系统内核调度，涉及上下文切换，开销较大（毫秒级）。(2) **共享状态**：协程天然在单线程中运行，不存在竞态条件（race condition），无需锁；多线程中共享可变状态需要加锁保护，容易出现死锁和竞态问题。(3) **适用场景**：asyncio 适合 I/O 密集型任务（网络请求、文件读写、数据库查询）；多线程适合 CPU 密集型任务，但由于 Python 的 GIL 限制，多线程在 CPU 密集型任务中实际上无法利用多核。

在 AI 开发中，以下场景必须或强烈推荐使用 asyncio：(1) **并发调用多个 LLM API**：同时向多个模型发送请求（如 A/B 测试、模型路由），或者同时调用多个工具（如 Agent 中的多工具并行调用），asyncio 可以让所有请求并发执行，总耗时接近最慢的那个请求，而非所有请求耗时之和。(2) **流式输出的 Web 服务**：FastAPI 天然支持 async/await，使用 asyncio 编写的端点可以在等待 LLM 流式响应的同时处理其他请求，不会阻塞整个服务。(3) **RAG 检索管道**：知识库检索通常需要同时查询多个向量库、搜索引擎、数据库，使用 asyncio.gather() 并发执行可以显著降低检索延迟。(4) **长时间运行的 Agent 工作流**：Agent 可能在执行过程中需要等待多个外部服务（LLM、工具、API），asyncio 的 `await` 机制让等待期间可以处理其他任务。

### Q4: 如何并发调用多个 LLM API？asyncio.gather() 的使用和错误处理策略是什么？
**详细答案：** 并发调用多个 LLM API 的核心是使用 `asyncio.gather()` 将多个异步任务同时执行。基本模式是：(1) 使用 `AsyncOpenAI`（或普通 `OpenAI` 的 `async` 方法）创建异步客户端；(2) 将每个 LLM 调用封装为 `async def` 函数；(3) 通过 `asyncio.gather(*tasks)` 并发执行所有任务。例如，向同一个问题询问 3 个不同模型，可以创建 3 个异步任务，使用 `gather()` 同时发起请求，总耗时约为最慢模型的响应时间，而非三个模型响应时间之和。

错误处理是并发调用的关键难点。`asyncio.gather()` 默认行为是：如果任何一个任务抛出异常，`gather()` 会立即将该异常传播给调用者，导致其他正在运行的任务被取消。因此，推荐使用 `asyncio.gather(*tasks, return_exceptions=True)` 参数，这样每个任务的异常不会传播，而是作为返回值返回（异常对象本身）。调用者可以遍历返回结果，通过 `isinstance(result, Exception)` 判断每个任务是否成功，对失败的任务进行降级处理（如重试、使用默认值、或跳过该模型的输出）。此外，还可以使用 `asyncio.wait_for()` 为每个调用设置超时，防止某个模型响应过慢拖慢整体。

更高级的并发控制策略包括：(1) **信号量限流**：使用 `asyncio.Semaphore` 限制同时进行的 LLM 调用数量，避免超过 API 的并发限制（rate limit）；(2) **优先级队列**：使用 `asyncio.Queue` 实现任务队列，按优先级调度 LLM 调用；(3) **熔断器模式**：当某个模型连续失败达到阈值时，暂时从候选池中移除，避免继续浪费资源。在实际项目中，推荐将这些策略封装为一个通用的 `LLMConcurrentExecutor` 工具类，方便复用。

### Q5: 使用 requests 库请求外部 API 时，常见的错误处理策略和最佳实践有哪些？
**详细答案：** requests 库在实际 AI 开发中承担着与外部 API 交互的基础角色，但网络请求天生具有不确定性，必须建立完善的错误处理机制。核心策略包括：(1) **超时设置**：始终使用 `timeout` 参数（如 `timeout=30`），避免请求永远挂起。推荐使用 `timeout=(connect_timeout, read_timeout)` 元组分别设置连接超时和读取超时。(2) **状态码检查**：使用 `response.raise_for_status()` 在响应状态码非 2xx 时抛出 `HTTPError`，避免静默处理错误响应。(3) **重试机制**：对于瞬时性错误（网络抖动、服务暂时不可用），实现指数退避重试策略。

具体实现上，推荐使用 `requests.Session()` 而非直接使用 `requests.get/post` 等函数。Session 对象可以复用底层 TCP 连接（HTTP Keep-Alive），在高频调用场景下显著减少连接建立开销。Session 还可以统一设置默认请求头（如 `Authorization`、`User-Agent`）、超时和重试策略。配合 `urllib3.Retry` 或 `tenacity` 库实现自动重试：`Retry(total=3, backoff_factor=1, status_forcelist=[429, 500, 502, 503, 504])`，在遇到限流（429）或服务端错误时自动重试，重试间隔按指数递增（1s, 2s, 4s）。

在 AI 应用场景中，还需要特别注意 API 的 rate limit（速率限制）。当请求频率过高时，API 提供方会返回 429 状态码，响应头中通常包含 `Retry-After` 字段指示需要等待的秒数。最佳实践是：(1) 实现客户端限流器，在发起请求前主动控制频率；(2) 收到 429 时读取 `Retry-After` 头，精确等待指定时间后重试；(3) 不要对 429 错误使用固定间隔重试，否则可能触发更严格的限流惩罚。此外，所有 API 调用都应记录请求日志（包括耗时、状态码、错误信息），便于排查问题和性能分析。