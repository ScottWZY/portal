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

## 四、面试高频题

### Q1: LangChain 有哪些 Chain 类型？各适用什么场景？

**详细答案：** LangChain 提供了多种 Chain 类型，每种适用于不同的编排需求。LLMChain 是最基础的 Chain，执行路径是 Prompt -> LLM -> 输出解析，适用于简单的问答、翻译、摘要等单步 LLM 调用场景。它的核心价值是将 Prompt 模板、LLM 调用和输出解析三个步骤封装为一个可复用的单元，避免每次都重复编写相同的代码。

SequentialChain 用于多步处理，前一个 Chain 的输出作为后一个 Chain 的输入。它有两种模式：SimpleSequentialChain（单输入单输出，自动传递）和 SequentialChain（多输入多输出，需要显式指定映射关系）。适用于需要分步处理的复杂任务，例如：需求分析 -> 方案设计 -> 方案评估，每个步骤依赖前一步的输出。RouterChain 用于意图路由，根据输入内容动态选择不同的下游 Chain，适用于需要根据用户意图分发到不同处理逻辑的场景，例如：客服系统中的"售后咨询"路由到售后 Chain，"技术咨询"路由到技术 Chain。

TransformChain 是纯 Python 函数转换，不调用 LLM，适用于数据预处理、格式转换、内容过滤等无需 AI 参与的步骤。它的存在让 Chain 编排更加灵活，可以在 LLM 调用前后插入任意的数据处理逻辑。此外，LangChain 还支持自定义 Chain（通过 RunnableLambda 包装自定义函数），以及通过 LCEL 的 `RunnableParallel` 实现并行 Chain（同时调用多个 Chain，合并结果）。选择 Chain 类型的关键是：先明确任务需要几个步骤、每个步骤的本质是什么（LLM 调用还是纯数据处理），然后选择合适的 Chain 类型。

### Q2: SequentialChain 和 RouterChain 的区别是什么？

**详细答案：** SequentialChain 和 RouterChain 的本质区别在于执行路径的确定性。SequentialChain 的执行路径是线性的、固定的，数据按照预先定义的顺序在多个 Chain 之间流动，前一个的输出是后一个的输入。无论输入内容是什么，执行路径都不会改变。这种模式适用于流程固定、步骤明确的任务，如文档处理流水线（解析 -> 摘要 -> 翻译 -> 格式化）。

RouterChain 的执行路径是分支的、动态的，根据输入内容通过路由逻辑选择不同的下游 Chain。路由逻辑可以是简单的关键词匹配（如"代码"路由到代码 Chain，"数据"路由到数据 Chain），也可以是 LLM 判断（让 LLM 分析输入内容，选择最合适的处理流程）。RouterChain 适用于需要根据用户意图分发到不同处理逻辑的场景，例如智能客服系统中的意图识别和分发。

两者的核心差异在于："谁来决策"。SequentialChain 中，决策者是开发者，所有执行路径在代码中预先定义；RouterChain 中，决策者是路由逻辑（可能是代码规则或 LLM 判断），执行路径在运行时动态确定。在实际项目中，两者经常组合使用：RouterChain 在最外层做路由分发，每个分支内部使用 SequentialChain 实现具体的处理流程。这种"路由+管道"的架构模式，既能实现灵活的分发，又能保持每个处理流程的清晰可控。

### Q3: ConversationBufferMemory 和 SummaryMemory 如何选择？各自的优缺点？

**详细答案：** ConversationBufferMemory 和 ConversationSummaryMemory 的核心区别在于如何管理对话历史。BufferMemory 保存完整的对话历史，不做任何压缩或摘要，优点是信息完整、不丢失任何细节，AI 可以引用对话中的任何信息；缺点是 Token 消耗随对话轮次线性增长，长对话会导致上下文窗口被占满，成本急剧上升。BufferMemory 适用于短对话场景（5-10 轮以内），或者对信息完整性要求极高的场景（如法律咨询、医疗问诊）。

SummaryMemory 对历史对话进行摘要，只保留摘要后的精简信息，优点是 Token 消耗可控，无论对话多长，历史信息始终保持在固定的 Token 范围内；缺点是摘要过程会丢失细节信息，AI 无法引用对话中的具体表述，且摘要本身需要额外调用 LLM，增加了延迟和成本。SummaryMemory 适用于长对话场景（20 轮以上），或者对成本敏感的场景。

选择策略：第一，对话轮次是首要考量，短对话用 Buffer，长对话用 Summary；第二，信息完整性要求，如果用户可能在后续对话中引用之前的细节，优先用 Buffer 或混合策略（如 BufferWindow + Summary）；第三，成本预算，如果 Token 预算有限，优先用 Summary 或 Window。实际项目中，BufferWindowMemory（只保留最近 K 轮完整对话）是一个非常实用的折中方案：既保留了最近对话的细节，又限制了历史长度上限。最佳的实践是：BufferWindow（K=5~10）+ Summary 的组合，既保留局部细节，又有全局摘要，平衡了信息完整性和成本。

### Q4: 如何自定义 Chain？RunnableLambda 的作用是什么？

**详细答案：** 自定义 Chain 的核心工具是 RunnableLambda，它可以将任何 Python 函数包装为 LCEL 兼容的 Runnable 组件。基本用法是 `RunnableLambda(my_function)`，包装后的函数可以像其他 LCEL 组件一样通过管道操作符串联。RunnableLambda 的作用是为 LCEL 管道提供"自定义节点"，让开发者可以在 LLM 调用前后插入任意的数据处理逻辑，而不受 LangChain 内置组件的限制。

自定义 Chain 的典型场景包括：第一，数据预处理，在 Prompt 之前对输入数据进行清洗、格式转换、敏感信息过滤等；第二，后处理，在 LLM 输出之后对结果进行格式化、校验、过滤等；第三，业务逻辑嵌入，在 Chain 中插入业务规则的判断和处理；第四，外部系统集成，例如在 Chain 中插入数据库查询、API 调用等非 LLM 操作。

自定义 Chain 的最佳实践：第一，函数应该是纯函数（无副作用），确保可预测性和可测试性；第二，函数的输入输出格式应该与上下游组件兼容，通常上游输出是字符串，下游期望的输入也是字符串或字典；第三，复杂逻辑应该拆分为多个小的 RunnableLambda，而不是一个巨大的函数，保持每个组件的单一职责；第四，对于有副作用的操作（如写数据库），应该使用 `RunnableLambda` 配合 `async` 函数，或者使用专门的 Callback 机制。此外，如果需要更复杂的自定义组件，可以继承 `Runnable` 基类实现完整的自定义 Runnable。

### Q5: Memory 的 Token 消耗如何控制？

**详细答案：** 控制 Memory 的 Token 消耗是生产环境中必须解决的问题，因为 Token 消耗直接影响 API 成本和响应延迟。核心策略包括以下几种。第一，使用 BufferWindowMemory 限制对话轮次，只保留最近 K 轮对话，K 的取值建议根据业务场景和 Token 预算确定，通常 3-10 轮。第二，使用 SummaryMemory 对历史对话进行摘要，将长对话压缩为固定长度的摘要，摘要长度通过 `max_token_limit` 参数控制。

第三，使用混合策略，将 BufferWindow 和 Summary 结合：保留最近几轮的完整对话（BufferWindow），同时维护一个全局摘要（Summary），在 Prompt 中同时注入摘要和最近的对话详情。这样既保留了局部细节，又有全局上下文。第四，使用 VectorStoreRetrieverMemory，将历史对话存入向量数据库，每次只检索与当前问题最相关的历史片段，而不是注入全部历史，适合需要选择性回忆的场景。

第五，Token 预算管理，在应用层面设置每轮对话的 Token 预算上限，当历史对话的 Token 达到上限时，自动触发压缩或截断。第六，Prompt 层面的优化，在 System Prompt 中明确要求 AI 简洁回答，减少输出 Token。第七，监控和告警，实时监控每轮对话的 Token 消耗，设置告警阈值，及时发现异常消耗。需要注意的是，Token 控制是一个权衡的过程：过度压缩历史会导致 AI 丢失上下文，回答质量下降；过度保留历史会导致成本上升。因此，建议根据业务场景做 A/B 测试，找到质量和成本的最佳平衡点。

### Q6: LangChain Memory 在多用户场景下如何管理？

**详细答案：** 在多用户场景下，Memory 管理的关键是"隔离"——每个用户/会话拥有独立的 Memory 实例，互不干扰。实现方式通常有两种。第一种，会话级 Memory 管理，为每个会话（Session）创建独立的 Memory 对象，存储在内存（dict）或外部存储（Redis）中。每次请求时，根据 session_id 查找对应的 Memory，加载历史对话，处理完成后更新 Memory。这种方式的优点是实现简单，缺点是 Memory 对象会随会话数量增长，需要定期清理过期会话。

第二种，基于数据库的持久化 Memory，将对话历史存储在数据库中（如 PostgreSQL、MongoDB），每次请求时从数据库加载最近 N 轮对话，处理后写入数据库。这种方式的优点是支持持久化，即使服务重启也不会丢失对话历史；缺点是每次请求都需要数据库查询，增加了延迟。实际生产环境中，通常采用"Redis 缓存 + 数据库持久化"的混合方案：Redis 作为热数据缓存（最近 N 轮对话），数据库作为冷数据存储（完整历史），兼顾性能和持久化。

多用户 Memory 管理的注意事项：第一，会话超时机制，设置合理的会话过期时间（如 30 分钟无活动自动过期），避免 Memory 无限增长；第二，用户级 Token 配额，限制每个用户/会话的 Token 使用上限，防止滥用；第三，敏感信息管理，Memory 中可能包含用户输入的敏感信息，需要做好数据脱敏和加密存储；第四，并发安全，同一会话的并发请求需要做好 Memory 的读写锁，防止数据竞争。在 LangChain 中，可以通过 `BaseMemory` 的子类化实现自定义的多用户 Memory 管理策略。