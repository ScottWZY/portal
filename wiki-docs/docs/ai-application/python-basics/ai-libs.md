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

## 七、面试重点

::: warning 高频考点
1. **openai 库如何调用流式输出？** stream=True 参数
2. **pydantic 的核心作用是什么？** 数据验证 + 序列化
3. **asyncio 和传统的多线程有什么区别？** 协程 vs 线程
4. **如何并发调用多个 LLM API？** asyncio.gather()
:::