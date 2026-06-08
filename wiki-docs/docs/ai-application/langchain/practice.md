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

**详细答案：** 我们项目搭了一个公司内部知识库 RAG 系统，踩了不少坑。核心就五步。第一步文档加载和切分——我们知识库来源很杂，有 PDF 技术手册、Confluence 页面、还有 Markdown FAQ，LangChain 的 loader 基本覆盖了，省了自己写解析。切分这块调了很久，默认 `RecursiveCharacterTextSplitter` 的 `chunk_size=1000` 对英文还行，中文文档切出来经常把一句完整的话截断——明明是在说"根据第三章第四节的规定"，结果"第三章"在一个 chunk、"第四节"在下一个 chunk，检索时匹配度一塌糊涂。后来改成 `chunk_size=800`、`chunk_overlap=100`，检索质量明显提升。

第二步向量化，我们用 `text-embedding-3-small`，800 个文档块做 embedding 花了大概 2 美分，性价比很高。向量库选了 Milvus，因为我们本来就有 K8s 集群，直接 helm install 部署。第三步检索器，`k=5` 配合 `similarity_search`，但我们很快发现一个问题：top-5 相似度都在 0.85 以上但内容不相关（全是同一个主题的重复段落），后来换了 MMR 检索，增加多样性后效果好了不少。

第四步 Prompt 模板是关键——我们踩的最大坑是没加"如果资料中没有相关信息就说不知道"这句话之前，LLM 会自己编答案，有一次用户问"公司有没有员工子女教育补贴"，资料里根本没有这个信息，LLM 硬是编了一段看起来很合理的回复，差点闹乌龙。所以 RAG 的 System Prompt 一定要明确禁止幻觉。第五步用 LCEL 把整条链串起来，`{"context": retriever, "question": RunnablePassthrough()} | prompt | llm | StrOutputParser()`，上线后每周大概处理 5000 次查询，准确率在 88% 左右。现在我们在做 Rerank 优化，检索 Top-20 后再用 CrossEncoder 重排选 Top-5，离线测试准确率能到 93%。

### Q2: 带记忆的对话机器人如何实现？Memory 在其中的作用是什么？

**详细答案：** 我们客服对话机器人上线第一版没有 Memory，用户每轮对话都是从零开始，体验很差——"我刚才说的订单号你怎么忘了？"后来加 Memory 其实代码改动不大，但效果是天壤之别。核心流程就四步：初始化 Memory（我们选了 `ConversationBufferWindowMemory(k=5)`）、在 Prompt 里用 `MessagesPlaceholder` 留好历史记录的位置、每次对话先 `load_memory_variables` 把历史加载出来注入 Prompt、对话结束后 `save_context` 保存。本质上 Memory 就是个"外挂记忆卡"——LLM 本身无状态，我们替它记住上下文再喂回去。

在实际跑多轮对话时遇到两个问题。第一个是 Token 膨胀：有个用户聊了 40 轮，最早的 30 轮还全在 Buffer 里——因为 k=5 只限制最近的轮数，但我们 buffer 的 k 设太小导致切得太激进，后来通过 A/B 测试定了 k=5 配合摘要兜底。第二个是服务重启丢数据：我们最早存内存 dict，半夜 K8s 自动重启一下所有会话全没了，第二天一堆用户投诉"怎么你又忘了"。后来 Session Memory 存 Redis + 数据库双写才解决。还有个经验：`MessagesPlaceholder` 一定要放在 system prompt 之后、user input 之前，顺序搞反了 LLM 会把历史当成当前问题来回。

### Q3: 如何让 Agent 调用自定义工具？@tool 装饰器的用法是什么？

**详细答案：** `@tool` 装饰器应该是 LangChain 里我最喜欢的 API 设计了——简洁到只需要在普通 Python 函数上加一行 `@tool`，LangChain 自动把函数名当工具名、docstring 当描述、类型注解当参数 schema，然后就能直接被 Agent 调用了。我们项目定了大概 12 个工具：查订单、查物流、查退款、取消订单、查用户信息等等，每个工具就是一个加 `@tool` 的 async 函数，里面调公司内部的 gRPC 服务。

这里有个极其重要的教训：**docstring 写得好不好，直接决定 Agent 能不能正确调用你的工具**。我们一开始偷懒，`get_order_status` 的 docstring 就写了一句"查询订单状态"，结果 Agent 在用户问"帮我查一下 12345"时完全不知道该调这个工具——它不知道这个函数需要的是 order_id 还是别的什么。后来把 docstring 改成："根据订单号查询订单当前状态，包括待付款/已发货/已签收。参数 order_id 是 5 位数字订单号，必须由用户明确提供。如果用户没有提供订单号，请先询问。"改完之后调用准确率从 60% 飙升到 90% 以上。还有就是参数类型一定要加上类型注解（`order_id: str` 而不是 `order_id`），Agent 靠这个决定传什么格式的参数。工具注册就是 `create_openai_tools_agent(llm, tools, prompt)` 一行，然后用 `AgentExecutor` 包起来管理执行循环，设好 `max_iterations=5` 防止死循环。

### Q4: RAG Chain 和 Agent 的实现有什么区别？

**详细答案：** 我们项目同时在用 RAG Chain 和 Agent，区别太明显了——一句话总结：RAG 是"固定走三步"，Agent 是"让 LLM 自己看着办"。RAG Chain 不管你问什么，都是"你问我一个问题 -> 我去向量库搜 Top-5 -> 拼 prompt 给 LLM -> LLM 出答案"，执行路径写死了，一点不拐弯。我们知识库问答用的就是这个，每天跑五千次，每次延迟平均 1.2 秒，很稳。

Agent 就不一样了，它是个循环："读用户输入 → LLM 思考该调哪个工具 → 调工具拿到结果 → 再让 LLM 看看结果够不够回答 → 够了就停，不够就再调"。我们客服用的是 Agent，因为用户可能说"我想退款，订单是 12345"，Agent 需要先调用 `get_order_status` 确认订单状态，如果已发货，就会提示用户退货流程；如果没发货，直接调 `cancel_order`。这种多步决策 RAG Chain 做不了，因为你无法预先知道用户会问出什么流程。

但 Agent 问题也多，每个步骤都要调一次 LLM，一次对话下来有时候要调 2-3 次，延迟从 1 秒涨到 3 秒左右，Token 消耗也翻几倍。所以现在我们是混合架构：外层用 RouterChain，FAQ 问题直接走 RAG Chain 回答，需要操作订单（退款、查物流）的问题转给 Agent 处理。这样既保证了简单问题快，又能 handle 复杂问题。还有个坑要提醒：Agent 的 `max_iterations` 一定要设，我们设的是 5，超过就停止，之前有一次没设，LLM 在两个工具之间反复横跳把自己绕进去了，一次对话烧了一万多 Token。

### Q5: 如何处理 LangChain 的流式输出（Streaming）？

**详细答案：** 我们整个客服前端是类似 ChatGPT 的界面，流式输出是基础体验要求。LangChain 这块封装的确实省心，LCEL 构建的 Chain 直接 `.astream()` 就能跑异步流式。我们后端 FastAPI，`StreamingResponse` 包一个 async generator，里面 `async for chunk in chain.astream(input): yield f"data: {json.dumps(chunk)}\n\n"`，十来行代码就搞定了 SSE 对接。用户体验上，第一个 Token 通常 600-800ms 返回到前端，基本看不出延迟。

但有两个点是我实战中踩过的。第一个，结构化输出 + 流式是死敌。我们有个"订单信息抽取"场景，需要 LLM 按固定 JSON 格式返回结构化数据，用了 `JsonOutputParser`。在流式模式下，每个 chunk 都是不完整的 JSON，parser 直接崩。后来我们的策略是：流式场景用纯文本输出 + `StrOutputParser`，后端拿到完整文本后再单独做 JSON 解析。第二个，`on_llm_new_token` 回调特别适合做实时 Token 计数——我在这个回调里埋了 Prometheus 指标，每次 Token 增量都打点，最后能算出每轮对话的实时 Token 消耗。有一次排查"某些请求耗时异常高"，就看这个 Grafana 面板，发现是某类问题的模型输出特别长（3000+ Token），不是网络或服务问题。

### Q6: 如何在 LangChain 中实现 RAG 的质量评估？

**详细答案：** 我们 RAG 上线第一个月全靠人工抽检，抽了 200 条结果自己一条条看，效率太低了。后来引入了 RAGAS 框架做自动化评估，四个指标很实用：Faithfulness（答案有没有编造）、Answer Relevancy（回答是否跑题）、Context Precision（检索到的相关文档排在前面没）、Context Recall（该找的是不是都找回来了）。我们用 RAGAS 搭建了一套离线评估 pipeline：每周从线上抽样 200 条问答，拿用户的真实问题跑 RAG 系统，对比标准答案算出四个指标，输出到 Grafana 面板。

发现了几个具体问题。一次迭代之后 Faithfulness 从 0.88 掉到 0.74，排查下来是 Prompt 里把"基于参考资料回答"那句话挪到了后面——LLM 读完大段上下文后忘了这个限制，开始自由发挥。还有个更隐蔽的：Context Precision 低（0.65），说明检索排序不对，top-5 里位置靠前的不是最相关的。我们加了一个 BM25 关键词匹配做粗排、再向量检索精排、最后 CrossEncoder reranker 重排的三段式策略，Precision 从 0.65 提到了 0.82。

评估流程最好自动化，我们集成进了 CI——每次改 System Prompt 或者检索参数，自动跑一遍固定的 80 个 Golden Test Case，四个指标有任何一个下降超过 5% 就不让合入。但也要说句实话：RAGAS 的评分和用户的真实满意度不是完全对齐的。我们见过 Faithfulness 0.85 但用户觉得"答非所问"的情况，因为评估测的是"答案是否来自文档"，但用户关心的是"答案是否回答了我的问题"。所以定量评估 + 人工抽检双轨制才是靠谱方案。