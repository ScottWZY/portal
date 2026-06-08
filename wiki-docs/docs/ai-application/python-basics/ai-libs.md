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
**详细答案：** 我们在客服 Bot 上线初期用的是非流式输出——LLM 全部生成完毕后再一次性返回，结果用户投诉"为什么每次提问都要等四五秒才能看到答案"。其实 GPT-4o-mini 首 Token 延迟只有 300ms，但因为非流式要等全部 token 生成完，用户感知延迟就变成了 4.5 秒。改成 `stream=True` 后，300ms 就开始逐字"打字"，虽然总耗时没变，但 NPS 评分从 3.8 涨到了 4.3——这就是感知延迟和实际延迟的区别。

实现上有一个坑我们踩过：流式输出的 `delta.content` 只包含当前 chunk 的新增文本，不是完整内容。我们最早在前端直接渲染每个 chunk，结果发现中文标点全乱了——因为 OpenAI 分词时中文一个词可能被切成两个 token（比如"我们" -> "我" + "们"），前端如果按 chunk 边界渲染就会出现乱码。后来后端加了一个 buffer 在内存中收集所有 delta，检测到完整语义单元（遇到标点或换行）才推送给前端。还有 token 统计的问题——流式默认不返回 `usage` 信息，我们的成本监控差点漏掉这部分数据，后来加了 `stream_options={"include_usage": True}` 才解决。FastAPI 里用 `StreamingResponse` 封装后直接返回 SSE 流，前端 EventSource 逐字渲染，效果和 ChatGPT 一样的体验。

### Q2: pydantic 的核心价值是什么？在 AI 开发中如何使用 pydantic 实现结构化输出？
**详细答案：** pydantic 在我们项目里就是个"保险丝"——LLM 输出非结构化文本，pydantic 把它校验成可靠的数据，不合格的直接拦住。最经典的场景是我们 Agent 的理赔信息提取：定义一个 `InsuranceClaim` 模型，里面 `disease_code: str = Field(pattern=r'^[A-Z]\d{2}\.\d{3}$')` 这种正则约束加上去，LLM 哪怕偶尔输出 `disease_code: "C01.00"`（多了一个零），pydantic 立马抛 `ValidationError`，我们捕获后自动重试一次。不加 pydantic 的时候，格式错误率大概 12%，加上后压到了 1.5%。

我们踩过一个 pydantic 和 OpenAI Structured Outputs 配合的坑。早期用 `client.beta.chat.completions.parse(response_format=MyModel)`，发现 LLM 偶尔返回的 JSON 里多了一个我们没定义的字段（比如 `extra_info`），但 pydantic 默认会忽略未知字段，不会报错，导致这个字段偷偷流到了下游并被业务逻辑错误使用。后来加了 `model_config = ConfigDict(extra='forbid')` 才彻底杜绝。另外，用 pydantic 的 `BaseSettings` 做配置管理特别爽——所有 API Key、模型名、超时参数统一从一个 `.env` 文件里取，`Settings()` 初始化时自动校验，Docker 部署时用环境变量覆盖，十几项配置不会再出现"线上某个参数没改导致挂了"的情况。相比于手动读 `os.environ` + 手工校验，代码量和 bug 数量都少了至少一半。

### Q3: asyncio 和传统多线程的核心区别是什么？在 AI 开发中什么场景必须使用 asyncio？
**详细答案：** asyncio 在我们 AI 项目里就是并发的基石。我们做过一个对比——用 threading 和 asyncio 各跑 20 个并发 OpenAI API 调用，threading 版总耗时 12 秒（GIL + 线程切换开销），asyncio 版只要 2.8 秒。差距这么大的原因是 LLM API 调用 95% 的时间都在等网络 I/O，asyncio 在这段等待时间里可以去处理其他协程的任务，而 threading 在 GIL 上的线程切换反而增加了开销——每个线程唤醒后发现 GIL 被占用再挂起，浪费了大量时间。

有一个场景是非 asyncio 不可的：FastAPI 的 Web 服务。我们客服接口在峰值 QPS 30 的时候，用同步 FastAPI（普通 def 函数）P99 延迟 5.8 秒，因为 thread pool 里的线程全被 LLM 的 I/O 等待占满了，新请求排队等线程。切到 `async def` + `AsyncOpenAI` 后，同一个机器 P99 降到 2.1 秒——因为协程的并发是事件循环级别的，不受线程池大小限制。我们的 Agent 并行工具调用也是 asyncio 的重度场景——用户说"查一下订单和物流状态"，Agent 同时调两个工具，用 `asyncio.gather()` 并行，总耗时取较慢的那个人（大约 1.2 秒），如果串行就是 2.4 秒，用户体验差距明显。但 asyncio 不是万能的——CPU 密集的批量 Embedding 计算我们还是用 `ProcessPoolExecutor` 多进程，因为 asyncio 在纯计算上没有优势。

### Q4: 如何并发调用多个 LLM API？asyncio.gather() 的使用和错误处理策略是什么？
**详细答案：** 我们做 A/B 测试的时候对并发调用感触最深。每次测试要同时调 4 个模型（DeepSeek V3、GPT-4o-mini、Claude Sonnet、Qwen）回同一个问题，用 `asyncio.gather()` 四个任务一起跑，总耗时 1.8 秒（最慢的 Claude Sonnet），比串行快了 6 倍。核心代码很简单：`AsyncOpenAI` 配不同 `base_url`，每个模型一个 `async def`，`await asyncio.gather(*tasks, return_exceptions=True)` 并发。

但 `return_exceptions=True` 是血的教训换来的。早期我们忘加这个参数，A/B 测试时 DeepSeek 偶尔返回 503，整个 `gather()` 直接抛异常，另外三个模型的正常返回值全丢了。加上 `return_exceptions=True` 后，每个任务独立处理——成功了拿结果，失败了用 `isinstance(r, Exception)` 判断后降级。我们现在的处理是：一个模型挂了就记录告警但继续用其他模型的结果，如果四个全挂才走兜底回复。还有一个超时控制的小技巧：`asyncio.wait_for()` 给每个任务单独设超时——GPT-4o 设 5 秒、DeepSeek 设 3 秒，防止某个慢模型拖死整个 gather。另外信号量 `asyncio.Semaphore(10)` 也很关键——避免瞬时并发冲爆 OpenAI 的 rate limit（我们测过，单个 API Key 同时超过 50 个请求大概率触发 429），Semaphore 控制并发数，稳住了整体 P99 延迟。

### Q5: 使用 requests 库请求外部 API 时，常见的错误处理策略和最佳实践有哪些？
**详细答案：** requests 在我们项目里主要用来调非 OpenAI 标准接口的第三方服务（飞书、钉钉、内部监控 Webhook），踩的坑不少。最大的教训就是 `timeout` 不能省略——有一次钉钉机器人 Webhook 挂了，我们的 `requests.post()` 没设 timeout，线程卡了整整两小时才被 OS 层面的 socket 超时踢掉，那台服务器的进程数飙到了 800+，当时是半夜没人值班，第二天早上发现整个 AI 服务全挂了。现在所有 requests 调用必带 `timeout=(3, 10)`——连接超时 3 秒、读取超时 10 秒，从配置上杜绝永久挂起。

另一个生产级改变是用 `requests.Session()` 代替裸调用。我们的监控埋点每秒发几十次日志到 Webhook，用裸 `requests.post()` 每次建立 TCP 连接然后 TLS 握手，总耗时 120ms。切换 Session 后复用了底层连接，延迟降到 25ms，而且 Session 统一管理了 `Authorization` header 重试策略。重试这块我们配合 `urllib3.Retry` 设了 `total=3, backoff_factor=1`，专打 429/502/503/504 这四种状态码。还有一个经验：429 限流不能乱重试——`Retry-After` 头告诉你要等多少秒就得等多少秒，我们最早忽略了这个头、固定 1 秒重试，结果被 OpenAI 的 rate limiter 惩罚，限制级别从 Tier 1 被升到了 Tier 3，整整降级了 15 分钟。现在 Retry 逻辑先读 `Retry-After` 头，有就用那个值，没有才用指数退避。