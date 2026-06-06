# LangChain 实战案例

> **创建日期：** 2026-06-06
> **前置知识：** LangChain 入门、Chain 与 Memory

---

## 一、实战一：构建 RAG 问答应用

### 系统架构

```
用户提问 → 向量检索 → 拼接 Prompt → LLM 生成 → 返回答案（附来源）
```

### 完整代码

```python
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough

# 1. 初始化组件
llm = ChatOpenAI(model="gpt-4o", temperature=0)
embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
vectorstore = Chroma(persist_directory="./chroma_db", embedding_function=embeddings)
retriever = vectorstore.as_retriever(search_kwargs={"k": 5})

# 2. 定义 RAG Prompt 模板
prompt = ChatPromptTemplate.from_messages([
    ("system", """基于以下参考资料回答问题。
如果资料中没有相关信息，请明确说「资料中未找到相关信息」。

参考资料：
{context}

回答要求：
- 引用具体的资料内容
- 如果资料不足，诚实说明"""),
    ("user", "{question}")
])

# 3. 构建 RAG Chain
rag_chain = (
    {"context": retriever, "question": RunnablePassthrough()}
    | prompt
    | llm
    | StrOutputParser()
)

# 4. 使用
response = rag_chain.invoke("如何申请年假？")
```

---

## 二、实战二：带记忆的对话机器人

```python
from langchain.memory import ConversationBufferWindowMemory
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

# 1. 初始化记忆
memory = ConversationBufferWindowMemory(
    k=5,  # 保留最近 5 轮对话
    return_messages=True,
    memory_key="history"
)

# 2. 带历史记录的 Prompt
prompt = ChatPromptTemplate.from_messages([
    ("system", "你是一个友好的客服助手。"),
    MessagesPlaceholder(variable_name="history"),
    ("user", "{input}")
])

# 3. 构建对话 Chain
chain = prompt | llm | StrOutputParser()

# 4. 多轮对话
def chat(user_input):
    # 加载历史
    history = memory.load_memory_variables({})["history"]
    # 生成回复
    response = chain.invoke({"input": user_input, "history": history})
    # 保存到记忆
    memory.save_context({"input": user_input}, {"output": response})
    return response

# 多轮对话示例
print(chat("我的订单号是12345"))  # → "请稍等，我帮您查询"
print(chat("什么时候发货？"))     # → 基于上下文回答（记住订单号）
```

---

## 三、实战三：可调用工具的 Agent

```python
from langchain.agents import AgentExecutor, create_openai_tools_agent
from langchain_core.tools import tool

# 1. 定义工具
@tool
def get_order_status(order_id: str) -> str:
    """查询订单状态

    Args:
        order_id: 订单号
    """
    # 模拟订单查询
    orders = {
        "12345": "已发货，预计6月8日到达",
        "67890": "正在备货中"
    }
    return orders.get(order_id, "未找到该订单")

@tool
def cancel_order(order_id: str) -> str:
    """取消订单

    Args:
        order_id: 订单号
    """
    return f"订单 {order_id} 已取消"

# 2. 创建 Agent
tools = [get_order_status, cancel_order]

prompt = ChatPromptTemplate.from_messages([
    ("system", "你是一个订单客服助手，可以帮助用户查询和操作订单。"),
    ("user", "{input}"),
    MessagesPlaceholder(variable_name="agent_scratchpad")
])

agent = create_openai_tools_agent(llm, tools, prompt)
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

# 3. 使用 Agent
result = agent_executor.invoke({
    "input": "查询订单12345的状态，如果还没发货就取消"
})
```

---

## 四、面试高频题

### Q1: 如何用 LangChain 构建一个完整的 RAG 应用？核心步骤是什么？

**详细答案：** 用 LangChain 构建 RAG 应用的核心步骤分为五步。第一步，文档加载与切分：使用 LangChain 的文档加载器（如 `TextLoader`、`PDFLoader`、`WebBaseLoader`）加载原始文档，然后使用文本切分器（如 `RecursiveCharacterTextSplitter`）将文档切分为适当大小的文本块（chunk）。切分策略的选择直接影响检索质量，常见参数包括 chunk_size（块大小，通常 500-1000 tokens）和 chunk_overlap（块重叠，通常 50-200 tokens），重叠可以防止关键信息被切断在块的边界上。

第二步，向量化与存储：使用 Embedding 模型（如 `text-embedding-3-small`）将文本块转换为向量，存入向量数据库（如 Chroma、FAISS、Pinecone）。向量数据库的选择取决于部署环境和规模：本地开发用 Chroma/FAISS，生产环境用 Pinecone/Weaviate/Milvus。第三步，构建检索器：从向量数据库创建 retriever，设置检索参数（如 `k=5` 返回最相关的 5 个文档块），根据需要选择检索策略（如相似度检索、MMR 最大边际相关性检索、相似度阈值过滤）。

第四步，构建 RAG Prompt 模板：设计包含 context 和 question 两个变量的 Prompt 模板，在 System Prompt 中明确指示 AI 基于参考文档回答、不编造信息、引用来源等。好的 RAG Prompt 是防止幻觉的关键。第五步，构建 RAG Chain：使用 LCEL 管道语法组装完整链路 `{"context": retriever, "question": RunnablePassthrough()} | prompt | llm | StrOutputParser()`。这里 `RunnablePassthrough()` 将用户输入直接传递给 question 变量，retriever 自动从用户输入中检索相关文档。构建完成后，通过 `chain.invoke(user_question)` 即可使用。

### Q2: 带记忆的对话机器人如何实现？Memory 在其中的作用是什么？

**详细答案：** 带记忆的对话机器人的实现核心是 Memory 组件与 Prompt 模板的配合。基本流程分为四步：第一步，初始化 Memory 组件，选择合适的 Memory 类型（如 `ConversationBufferWindowMemory`），设置关键参数（如 `k=5` 保留最近 5 轮对话，`return_messages=True` 返回消息格式）。第二步，设计带历史记录的 Prompt 模板，使用 `MessagesPlaceholder(variable_name="history")` 在 Prompt 中预留历史记录的位置，让 AI 能看到之前的对话内容。

第三步，构建对话处理函数，每次用户输入时，先从 Memory 中加载历史记录（`memory.load_memory_variables({})`），将历史记录和用户输入一起传入 Chain，获取 AI 回复后，将本轮对话保存到 Memory 中（`memory.save_context()`）。第四步，循环执行，实现多轮对话。Memory 在整个流程中的作用是"外部存储"——因为 LLM 本身是无状态的，每次调用都是独立的，Memory 在外部保存对话历史，在每次调用时注入到 Prompt 中，模拟出"有记忆"的效果。

实际开发中需要注意的问题：第一，Memory 的 Token 管理，随着对话轮次增加，历史记录会占用越来越多的 Token，需要配合 BufferWindow 或 Summary 机制控制 Token 消耗；第二，Memory 的持久化，如果服务重启，内存中的 Memory 会丢失，生产环境需要将 Memory 持久化到 Redis 或数据库；第三，多会话管理，每个用户会话需要独立的 Memory 实例，通过 session_id 进行隔离；第四，Memory 的清理，长时间不活跃的会话需要自动清理，防止资源浪费。

### Q3: 如何让 Agent 调用自定义工具？@tool 装饰器的用法是什么？

**详细答案：** 让 Agent 调用自定义工具的核心是使用 `@tool` 装饰器（或 `Tool` 类）定义工具，然后将其注册到 Agent 中。`@tool` 装饰器是 LangChain 提供的最便捷的工具定义方式：直接将一个 Python 函数装饰为 `@tool`，LangChain 会自动提取函数名作为工具名、docstring 作为工具描述、参数类型注解作为参数 Schema。工具描述的质量直接影响 Agent 调用该工具的准确性，必须详细说明工具的用途、适用场景、参数含义和返回值格式。

工具定义完成后，需要创建 Agent 并将工具注册进去。基本流程是：`tools = [tool1, tool2]` -> `agent = create_openai_tools_agent(llm, tools, prompt)` -> `agent_executor = AgentExecutor(agent=agent, tools=tools)`。`AgentExecutor` 负责管理 Agent 的执行循环：调用 LLM 获取下一步行动、执行工具调用、将结果反馈给 LLM、判断是否完成。可以通过 `verbose=True` 开启详细日志，观察 Agent 的决策过程。

工具设计的最佳实践：第一，单一职责，一个工具只做一件事；第二，描述清晰，包含 WHEN（何时调用）和 WHAT（做什么）；第三，参数类型准确，类型注解直接影响 Agent 能否生成正确的参数；第四，错误友好，返回清晰的错误信息，帮助 Agent 理解失败原因并调整策略；第五，安全校验，对写操作工具进行权限检查和参数校验。此外，Agent 的 `max_iterations` 参数设置了最大执行步数，防止 Agent 陷入无限循环；`early_stopping_method` 参数控制当达到最大步数时的行为。

### Q4: RAG Chain 和 Agent 的实现有什么区别？

**详细答案：** RAG Chain 和 Agent 的实现有本质区别，体现在架构、执行模式和适用场景上。RAG Chain 的实现是确定性的管道：`检索 -> 拼接 Prompt -> LLM 生成`，执行路径固定，不涉及动态决策。代码结构清晰，使用 LCEL 管道语法，一个 `chain.invoke()` 调用即可完成整个流程。RAG Chain 的优势是简单、可控、可预测，适合标准的问答场景。

Agent 的实现是动态的决策循环：`LLM 分析 -> 选择工具 -> 执行工具 -> 观察结果 -> 继续或停止`，执行路径动态变化，LLM 在每个步骤自主决策。代码结构更复杂，需要使用 `create_openai_tools_agent` 创建 Agent、`AgentExecutor` 管理执行循环，涉及工具定义、Agent 提示、循环控制等多个组件。Agent 的优势是灵活、智能，能处理多步骤的复杂任务，但代价是不可预测性增加。

从技术实现角度看，RAG Chain 的核心是检索器（retriever）和 Prompt 模板的组合；Agent 的核心是工具集（tools）和 Agent 执行循环的组合。RAG Chain 的检索是自动的、固定的，每次问答都检索；Agent 的工具调用是动态的、按需的，只有 LLM 认为需要时才调用。在实际项目中，RAG Chain 适合知识库问答、文档检索等标准场景；Agent 适合需要多步骤操作、工具调用、动态决策的复杂场景（如客服系统、自动化工作流）。两者也可以结合：Agent 可以包含一个 RAG Chain 作为工具，在处理搜索结果时调用。

### Q5: 如何处理 LangChain 的流式输出（Streaming）？

**详细答案：** LangChain 的流式输出通过 `.stream()` 方法实现，基于 LCEL 的流式架构，所有使用 LCEL 构建的 Chain 都天然支持流式输出。基本用法是 `for chunk in chain.stream(input): yield chunk`，每次迭代返回一个 Token 或内容片段。在 Web 应用中，结合 FastAPI 的 `StreamingResponse` 和 SSE（Server-Sent Events），可以实现类似 ChatGPT 的逐字输出效果。关键代码模式：定义 `async def stream_generator()` 函数，内部使用 `async for chunk in chain.astream(input)` 迭代，通过 SSE 格式（`data: {chunk}\n\n`）发送给前端。

流式输出的关键技术点：第一，LLM 必须配置 `streaming=True`，否则无法产生流式输出；第二，`StrOutputParser` 支持流式处理，但 `JsonOutputParser` 等结构化解析器不支持流式（因为不完整的 JSON 无法解析），如果同时需要流式和结构化输出，可以先用流式输出原始文本，完成后再解析；第三，Callbacks 中的 `on_llm_new_token` 回调在每个 Token 生成时触发，适合做实时 Token 计数和进度展示。

流式输出的常见问题：第一，流式输出时前端需要处理增量更新，而非一次性渲染，需要配合状态管理实现；第二，网络中断时，流式连接会断开，需要实现重连和断点续传机制；第三，部分 LLM 的流式输出在最后一个 chunk 中包含 `finish_reason`，可以用于判断生成是否完成；第四，流式输出的计量（Token 计数）需要在流式完成后才能准确统计，流式过程中的计数是估算值。此外，流式输出虽然提升了用户体验，但在批量处理、离线分析等场景中不需要，直接使用 `.invoke()` 更高效。

### Q6: 如何在 LangChain 中实现 RAG 的质量评估？

**详细答案：** RAG 质量评估的核心是使用 RAGAS（RAG Assessment）框架，它提供了四个核心评估指标：Faithfulness（忠实度，答案是否基于检索到的文档，检测幻觉）、Answer Relevancy（答案相关性，答案是否回答了问题）、Context Precision（上下文精确度，检索到的文档中相关文档的排名）、Context Recall（上下文召回率，检索到的文档是否包含了回答问题所需的所有信息）。评估流程分为三步：准备评估数据集（包含问题、标准答案、检索结果）、运行评估、分析结果。

在 LangChain 中集成 RAGAS 评估的基本方法：第一步，收集实际的问答数据，包括用户问题、RAG 系统生成的答案、检索到的文档片段；第二步，使用 RAGAS 的评估函数（如 `evaluate()`）计算各指标分数；第三步，根据评估结果定位问题：Faithfulness 低说明存在幻觉，需要优化 Prompt 或检索策略；Context Precision 低说明检索排序不准确，需要优化检索算法或 Rerank 策略；Context Recall 低说明检索遗漏了重要信息，需要优化文档切分或检索参数。

评估体系的建立建议：第一，建立固定的评估数据集（黄金测试集），包含 50-100 个典型问题，每次系统变更后运行评估，确保质量不退化；第二，自动化评估流程，集成到 CI/CD 管道中，每次代码变更自动运行评估；第三，定性评估补充，RAGAS 的定量指标不能完全替代人工评估，建议定期进行人工抽检；第四，评估指标的选择，不同业务场景关注的指标不同，客服场景可能更关注 Faithfulness（减少幻觉），知识库场景可能更关注 Context Recall（确保信息完整）。