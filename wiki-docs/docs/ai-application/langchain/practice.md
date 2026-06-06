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

## 四、面试重点

::: warning 高频考点
1. **如何用 LangChain 构建一个完整的 RAG 应用？** 核心步骤是什么？
2. **带记忆的对话机器人如何实现？** Memory 的作用？
3. **如何让 Agent 调用自定义工具？** @tool 装饰器的用法？
4. **RAG Chain 和 Agent 的实现有什么区别？**
5. **如何处理流式输出（Streaming）？**
:::