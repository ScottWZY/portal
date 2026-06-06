# Chain 与 Memory

> **创建日期：** 2026-06-06
> **前置知识：** LangChain 入门

---

## 一、Chain（链式调用）

Chain 是 LangChain 的核心编排机制，将多个组件串联成处理管道。

### 1.1 Chain 类型

| 类型 | 说明 | 适用场景 |
|------|------|----------|
| **LLMChain** | 最简单的 Chain：Prompt → LLM → 输出 | 基础问答 |
| **SequentialChain** | 多个 Chain 串联，前一个的输出是后一个的输入 | 多步处理 |
| **RouterChain** | 根据输入动态选择下游 Chain | 意图路由 |
| **TransformChain** | 纯 Python 函数转换，不调用 LLM | 数据预处理 |

### 1.2 SequentialChain 示例

```python
# 串联多个 Chain
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

# Chain 1：分析需求
analyze_prompt = ChatPromptTemplate.from_template(
    "分析以下需求的关键点：{requirement}"
)
analyze_chain = analyze_prompt | llm | StrOutputParser()

# Chain 2：生成方案
design_prompt = ChatPromptTemplate.from_template(
    "基于以下分析，设计技术方案：{analysis}"
)
design_chain = design_prompt | llm | StrOutputParser()

# Chain 3：评估方案
review_prompt = ChatPromptTemplate.from_template(
    "评估以下方案的风险和改进点：{design}"
)
review_chain = review_prompt | llm | StrOutputParser()

# 串联成完整管道
full_chain = analyze_chain | design_chain | review_chain
result = full_chain.invoke("需要设计一个支持100万并发的消息系统")
```

### 1.3 RouterChain 示例

```python
# 意图路由
from langchain_core.runnables import RunnableBranch

# 定义路由分支
branch = RunnableBranch(
    # (条件, 处理链)
    (lambda x: "代码" in x["input"], code_chain),
    (lambda x: "数据" in x["input"], data_chain),
    general_chain  # 默认链
)

result = branch.invoke({"input": "帮我写一段 Java 代码"})
```

---

## 二、Memory（记忆管理）

### 2.1 Memory 类型对比

| 类型 | 原理 | 优点 | 缺点 | 适用场景 |
|------|------|------|------|----------|
| **ConversationBufferMemory** | 保存完整对话历史 | 信息完整 | Token 消耗大 | 短对话 |
| **ConversationSummaryMemory** | 对历史进行摘要 | Token 消耗少 | 丢失细节 | 长对话降低成本 |
| **ConversationBufferWindowMemory** | 只保留最近 K 轮 | 实现简单 | 丢失早期信息 | 通用场景 |
| **VectorStoreRetrieverMemory** | 向量存储历史，按相关性检索 | 智能检索历史 | 额外依赖向量库 | 需要上下文检索 |

### 2.2 BufferWindowMemory 示例

```python
from langchain.memory import ConversationBufferWindowMemory

# 只保留最近 3 轮对话
memory = ConversationBufferWindowMemory(k=3, return_messages=True)

# 保存对话
memory.save_context(
    {"input": "我叫张三"},
    {"output": "你好张三！"}
)
```

### 2.3 SummaryMemory 示例

```python
from langchain.memory import ConversationSummaryMemory

# 使用摘要管理长对话
memory = ConversationSummaryMemory(
    llm=llm,
    max_token_limit=500,  # 摘要的 token 上限
    return_messages=True
)
```

---

## 三、自定义 Chain

```python
from langchain_core.runnables import RunnableLambda

# 自定义处理函数
def extract_keywords(text: str) -> str:
    """提取关键词（自定义逻辑）"""
    keywords = ["高并发", "微服务", "分布式"]
    found = [k for k in keywords if k in text]
    return f"关键词：{', '.join(found)}"

# 将自定义函数包装为 Runnable
keyword_chain = RunnableLambda(extract_keywords)

# 嵌入到 Chain 中
custom_chain = prompt | llm | StrOutputParser() | keyword_chain
```

---

## 四、面试重点

::: warning 高频考点
1. **LangChain 有哪些 Chain 类型？** 各适用什么场景？
2. **SequentialChain 和 RouterChain 的区别？**
3. **ConversationBufferMemory 和 SummaryMemory 如何选择？**
4. **如何自定义 Chain？** RunnableLambda 的作用？
5. **Memory 的 Token 消耗如何控制？**
:::