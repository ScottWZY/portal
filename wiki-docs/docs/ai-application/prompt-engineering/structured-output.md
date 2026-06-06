# 结构化输出

> **创建日期：** 2026-06-06
> **前置知识：** Prompt 工程基础

---

## 一、为什么需要结构化输出？

在实际应用中，LLM 的输出通常需要被程序解析和处理。如果输出格式不稳定，后续处理会非常困难。

| 非结构化输出 | 结构化输出 |
|--------------|------------|
| 需要复杂的文本解析 | 可以直接反序列化为对象 |
| 格式不稳定，容易出错 | 格式固定，稳定可靠 |
| 难以做校验 | 可以基于 Schema 做校验 |
| 后续处理成本高 | 后续处理简单直接 |

---

## 二、JSON Mode

大多数模型支持 JSON Mode，强制输出 JSON 格式：

```python
# 使用 JSON Mode
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {"role": "system", "content": "你是一个数据分析助手"},
        {"role": "user", "content": "分析以下销售数据：1月100万，2月120万，3月90万"}
    ],
    response_format={"type": "json_object"}  # 强制 JSON 输出
)

import json
result = json.loads(response.choices[0].message.content)
```

### 自定义 JSON Schema

```python
# 使用 JSON Schema 约束输出格式
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "分析销售数据"}],
    response_format={
        "type": "json_schema",
        "json_schema": {
            "name": "sales_analysis",
            "schema": {
                "type": "object",
                "properties": {
                    "summary": {"type": "string"},
                    "trend": {"type": "string", "enum": ["上升", "下降", "平稳"]},
                    "months": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "month": {"type": "string"},
                                "revenue": {"type": "number"},
                                "growth": {"type": "number"}
                            },
                            "required": ["month", "revenue"]
                        }
                    }
                },
                "required": ["summary", "trend", "months"]
            }
        }
    }
)
```

---

## 三、Pydantic 解析

Pydantic 是 Python 最流行的数据校验库，可以与 LLM 输出深度结合：

```python
from pydantic import BaseModel, Field
from typing import List, Optional

# 定义输出模型
class CodeIssue(BaseModel):
    """代码问题模型"""
    severity: str = Field(description="严重程度：高/中/低")
    line: Optional[int] = Field(description="问题所在行号")
    description: str = Field(description="问题描述")
    suggestion: str = Field(description="修改建议")

class CodeReview(BaseModel):
    """代码审查结果模型"""
    overall_score: int = Field(description="总体评分（1-10）")
    issues: List[CodeIssue] = Field(description="发现的问题列表")
    summary: str = Field(description="审查总结")

# 使用 Pydantic 解析 LLM 输出
import json

def review_code(code: str) -> CodeReview:
    prompt = f"""
    请审查以下代码，并以 JSON 格式输出。

    输出格式：
    {CodeReview.model_json_schema()}

    代码：
    {code}
    """
    response = llm.generate(prompt)
    # 解析并校验
    return CodeReview.model_validate_json(response)
```

### 使用 instructor 库简化

```python
# instructor 库提供了更简洁的 API
import instructor
from openai import OpenAI

client = instructor.from_openai(OpenAI())

# 一行代码获取结构化输出
review = client.chat.completions.create(
    model="gpt-4o",
    response_model=CodeReview,  # 直接指定 Pydantic 模型
    messages=[{"role": "user", "content": f"审查代码：{code}"}]
)
# review 是 CodeReview 类型，直接可用
print(review.overall_score)
```

---

## 四、Function Calling 输出格式

Function Calling 本身就是一种结构化的输出方式：

```python
# 工具定义 - 本质上是结构化的 JSON Schema
tools = [{
    "type": "function",
    "function": {
        "name": "create_ticket",
        "description": "创建工单",
        "parameters": {
            "type": "object",
            "properties": {
                "title": {"type": "string", "description": "工单标题"},
                "priority": {
                    "type": "string",
                    "enum": ["低", "中", "高", "紧急"],
                    "description": "优先级"
                },
                "assignee": {"type": "string", "description": "指派人"},
                "deadline": {"type": "string", "description": "截止日期（YYYY-MM-DD）"}
            },
            "required": ["title", "priority"]
        }
    }
}]
```

---

## 五、输出校验与重试

### 5.1 校验策略

```python
def validate_and_retry(response, expected_schema, max_retries=3):
    """校验输出并自动重试"""
    for attempt in range(max_retries):
        try:
            # 尝试解析
            parsed = expected_schema.model_validate_json(response)
            return parsed
        except Exception as e:
            if attempt < max_retries - 1:
                # 将错误信息反馈给模型，让它修正
                response = llm.generate(
                    f"你的输出格式不正确：{e}\n请修正后重新输出。"
                )
            else:
                raise
```

### 5.2 常见问题与处理

| 问题 | 处理方式 |
|------|----------|
| JSON 格式错误（缺少括号） | 重试，在 Prompt 中强调 "确保 JSON 格式正确" |
| 字段类型错误 | 重试，在 Schema 中明确类型，使用 enum 限制 |
| 遗漏必填字段 | 重试，在 Prompt 中列出必填字段 |
| 字段含义错误 | 在 Schema 的 description 中写清楚含义 |

---

## 六、工程实践建议

1. **始终使用 Pydantic 定义输出模型**：比手写 JSON Schema 更清晰，可复用
2. **使用 instructor 等库**：减少样板代码，提高开发效率
3. **添加重试机制**：LLM 输出不稳定，自动重试减少人工介入
4. **记录失败案例**：分析失败原因，优化 Prompt 和 Schema
5. **在 description 中提供示例**：模型能更好地理解你的意图

```python
# 好的 description 示例
class UserInfo(BaseModel):
    name: str = Field(description="用户姓名，格式如'张三'")
    age: int = Field(description="年龄，整数，范围 0-150")
    email: str = Field(description="邮箱地址，格式如 user@example.com")
```

---

## 七、面试重点

::: warning 高频考点
1. **JSON Mode 和普通模式的区别？** 什么时候用 JSON Mode？
2. **如何用 Pydantic 校验 LLM 输出？** 有什么好处？
3. **Function Calling 的输出格式是什么？** 为什么也是结构化的？
4. **输出校验失败怎么处理？** 重试策略是什么？
5. **instructor 库做了什么？** 原理是什么？
:::