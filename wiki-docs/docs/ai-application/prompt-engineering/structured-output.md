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

## 七、面试高频题

### Q1: JSON Mode 和普通模式的区别是什么？什么时候应该使用 JSON Mode？

**详细答案：** JSON Mode 是 LLM API 提供的一种输出约束机制，开启后模型会被强制输出合法的 JSON 格式。与普通模式相比，普通模式下模型输出的是自由文本，即使你在 Prompt 中要求"输出 JSON 格式"，模型也可能在 JSON 前后添加解释性文字（如"好的，这是分析结果："），或者输出了不合法的 JSON（如尾随逗号、单引号等）。JSON Mode 通过修改采样策略和 token 概率分布，在底层保证输出的一定是合法 JSON，从根本上消除了格式解析的失败风险。

在实际开发中，判断是否使用 JSON Mode 的核心标准是：**下游是否有程序需要解析输出**。如果你的输出需要被 Python 代码 `json.loads()` 解析、需要存入数据库、需要作为 API 响应返回给前端，那么必须使用 JSON Mode。此外，如果你的输出结构复杂（嵌套对象、数组、枚举），JSON Mode 配合 JSON Schema 可以同时约束格式和内容结构，这是普通 Prompt 指令无法可靠做到的。但要注意，JSON Mode 并非万能——它只保证格式合法，不保证字段语义正确，因此还需要配合 Pydantic 校验做内容层面的验证。

常见误区：有人以为 JSON Mode 会让模型变笨或输出质量下降。实际上，主流模型（GPT-4o、Claude 等）在 JSON Mode 下的推理能力与普通模式基本一致，不存在明显的质量差异。真正影响质量的是 JSON Schema 设计是否合理——如果 Schema 中字段的 `description` 写得含糊不清，模型就会在字段中填入错误内容，但这是 Schema 设计问题，而非 JSON Mode 的问题。

### Q2: 如何用 Pydantic 校验 LLM 输出？相比手动写 JSON Schema 有什么好处？

**详细答案：** Pydantic 校验 LLM 输出的核心流程是：定义 Pydantic 模型（BaseModel 子类）→ 让 LLM 按模型的 Schema 输出 JSON → 使用 `model_validate_json()` 解析并校验。Pydantic 会自动检查：字段类型是否匹配（如 `age: int` 不能是字符串）、必填字段是否遗漏、枚举值是否在允许范围内、嵌套结构是否完整。如果校验失败，Pydantic 会抛出包含详细错误信息的 `ValidationError`，你可以将这些错误信息反馈给 LLM 让其修正，形成"输出→校验→修正→再校验"的闭环。

相比手写 JSON Schema，Pydantic 有三大显著优势。第一，**类型安全**：Pydantic 模型是 Python 类，IDE 可以提供完整的类型提示和自动补全，而手写 JSON Schema 是纯字典，容易写错字段名且无编译期检查。第二，**复用性强**：Pydantic 模型可以在代码中多处使用（API 请求体、数据库模型、LLM 输出），一处定义处处生效，避免重复维护 Schema 定义。第三，**校验能力丰富**：Pydantic 支持自定义 validator（如 `@field_validator`）、字段级约束（`Field(ge=0, le=150)`）、复杂类型（`List[CodeIssue]`、`Optional[int]`），这些在手写 JSON Schema 中要么不支持，要么实现非常繁琐。

实践建议：在 `Field(description="...")` 中一定要写清楚字段的含义和期望格式，因为 instructor 等库会将 description 直接传给 LLM 作为 Prompt 的一部分。description 写得越具体，LLM 填入的内容就越准确。例如 `description="用户姓名，格式如'张三'，不要包含称谓"` 就比 `description="姓名"` 好得多。另外，对于枚举类型，建议使用 `Literal` 而不是 `str`，这样 Pydantic 可以在校验阶段就捕获非法值。

### Q3: Function Calling 的输出格式是什么？为什么说它也是一种结构化输出？

**详细答案：** Function Calling 的底层输出格式就是 JSON——当 LLM 决定调用某个函数时，它会返回一个结构化的 JSON 对象，包含 `name`（函数名）和 `arguments`（参数的 JSON 字符串）两个字段。而函数定义中的 `parameters` 字段本身就是 JSON Schema，它定义了每个参数的名称、类型、描述、是否必填、枚举值范围等。因此，Function Calling 本质上就是"用 JSON Schema 约束 LLM 输出 JSON 格式的函数调用参数"。

从这个角度看，Function Calling 是一种"强约束的结构化输出"：它不仅约束了输出格式（必须是 JSON），还约束了输出的语义结构（必须符合函数参数 Schema）。与 JSON Mode 相比，Function Calling 的约束更强——JSON Mode 只保证输出是合法 JSON，而 Function Calling 还保证输出的 JSON 结构必须匹配你定义的函数签名。这种强约束使得 Function Calling 天然适合需要精确参数提取的场景，如从用户对话中提取工单信息（标题、优先级、指派人），或从自然语言中解析查询条件（时间范围、筛选维度）。

一个容易被忽视的点是：Function Calling 不仅可以用于"调用工具"，还可以用于"纯结构化输出"。很多开发者会定义一个"虚拟函数"（如 `format_response`），其参数 Schema 就是期望的输出格式，然后让 LLM 调用这个函数来输出结构化数据。这种技巧在需要精确控制输出结构时非常有效，尤其是在模型不原生支持 JSON Schema 的场景下。不过，现在主流模型已直接支持 `response_format` 的 JSON Schema 模式，虚拟函数技巧的适用场景在减少。

### Q4: LLM 输出校验失败时应该怎么处理？重试策略如何设计？

**详细答案：** LLM 输出校验失败时的处理策略应该遵循"渐进式纠错"原则，而非简单粗暴地重试。首先，需要区分校验失败的类型：如果是 JSON 格式错误（如缺少括号、引号不匹配），说明模型没有正确遵循 JSON 格式约束，可以在重试 Prompt 中强调"请确保输出合法的 JSON 格式，不要添加额外文字"。如果是字段类型错误（如 `age` 字段填了字符串 "三十岁"），说明 Schema 的 description 不够清晰，应该在重试时提供更具体的示例。如果是遗漏必填字段，说明模型可能遗漏了部分要求，需要在重试 Prompt 中列出所有必填字段。

重试策略设计要点有三。第一，**指数退避重试**：不要连续立即重试，应该在每次重试之间增加等待时间（如 1s、2s、4s），避免触发 API 限流。第二，**错误信息注入**：每次重试时，将上一次校验失败的具体错误信息反馈给模型，如"你的上一次输出中，`age` 字段的值是字符串，但期望的是整数。请修正。" 这比简单地说"输出格式错误"效果好得多。第三，**设置重试上限和降级策略**：通常设置 3 次重试已足够，超过上限后不要无限重试，而应该触发降级策略（如返回默认值、使用缓存结果、人工介入）。

值得注意的是，重试本身也有成本（额外的 API 调用 + 延迟），所以应该从源头减少校验失败。关键在于：写好 Schema 的 description、在 Prompt 中提供示例（few-shot）、使用 instructor 等成熟库内置的重试和纠错机制。如果一个 Schema 反复出现校验失败，大概率是 Schema 设计本身有问题，应该优化 Schema 而不是增加重试次数。

### Q5: instructor 库做了什么？它的底层原理是什么？

**详细答案：** instructor 库的核心价值在于**将 LLM 的文本输出自动解析为 Pydantic 模型实例**，让开发者可以用面向对象的方式操作 LLM 输出，而不需要手动处理 JSON 解析和校验。它的 API 设计非常简洁：用 `instructor.from_openai(client)` 包装 OpenAI 客户端，然后在 `chat.completions.create` 中传入 `response_model=YourPydanticModel`，instructor 就会自动处理从 Prompt 构建到输出解析的全流程。

instructor 的底层原理分为三个阶段。第一阶段是 **Prompt 注入**：instructor 会读取 Pydantic 模型的 JSON Schema（通过 `model_json_schema()`），将其作为 `response_format` 参数传给 LLM API，同时根据配置决定是否在 Prompt 中添加格式说明。第二阶段是 **输出解析**：LLM 返回 JSON 后，instructor 调用 `model_validate_json()` 将 JSON 解析为 Pydantic 实例。第三阶段是**自动重试**：如果解析失败，instructor 会将 Pydantic 的 `ValidationError` 详细信息作为新的消息追加到对话中，让 LLM 重新生成，直到解析成功或达到最大重试次数。

instructor 的另一个重要特性是支持多种"模式"（mode）。除了默认的 `Mode.TOOLS`（利用 Function Calling 机制约束输出），还支持 `Mode.JSON`（使用 JSON Mode）、`Mode.MD_JSON`（从 Markdown 代码块中提取 JSON）、`Mode.FUNCTIONS`（旧版 Function Calling）等。不同模式适用于不同模型和场景，例如某些开源模型不支持原生 Function Calling 时，可以切换到 `Mode.JSON` 模式。这种多模式支持使得 instructor 具有良好的跨模型兼容性，在实际项目中避免了因模型切换带来的代码大改。