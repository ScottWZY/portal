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

**详细答案：** 我们项目里四种 Chain 都用过，每种有各自的使用场景。LLMChain 最简单，我们有十几个场景都是 Prompt -> LLM -> Parser 这种三件套模式，比如情感分析、意图分类、文本润色，把它封装为可复用的模块后，团队其他人改个 prompt 模板就能上线新功能，不用碰 LLM 调用代码。SequentialChain 我们用在一个工单处理流程里：用户描述问题 -> LLM 分析关键信息 -> LLM 生成建议方案 -> LLM 评估风险，三个步骤串在一起，前一步的输出自动喂给下一步，中间不需要写传递逻辑。

RouterChain 是我们客服系统的大脑——根据用户输入路由到不同的处理分支。我们最早用关键词匹配做路由（含"退款"就进售后分支），但发现长尾表达覆盖率太差，后来改成让 LLM 自己判断意图后路由，准确率从 70% 提到了 93%。不过这也有代价，每次路由多了一次 LLM 调用，延迟增加了 300ms。TransformChain 我们用在做敏感信息过滤，在 Prompt 之前把手机号、身份证号这些脱敏，纯 Python 正则替换，不调 LLM，很快。选择一个项目用哪种 Chain，我们习惯先画执行流程图，然后看每一步本质是"调 LLM"还是"纯计算"，对号入座就行。

### Q2: SequentialChain 和 RouterChain 的区别是什么？

**详细答案：** 我们项目刚好两种模式都在用，区别一句话讲就是：SequentialChain 是"流水线"，RouterChain 是"分叉路口"。流水线上每个工位顺序是固定的，不管来的是什么原料，处理步骤都一样；分叉路口则要根据来车的方向决定往哪拐。我们用它俩的经典组合是：RouterChain 在最外层做意图识别，把用户问题分发到不同的业务分支，每个分支内部再用 SequentialChain 串起多步处理。

有个实际的坑。我们最早用 SequentialChain 做客服全流程——不管用户问什么，都走"分析 -> 检索 -> 回答"三步。结果用户来一句"我的包裹到哪了"，也先去知识库搜一圈、再让 LLM 分析，最后返回一个不确定的答复。改成 RouterChain 后，包裹查询直接进物流分支调 API 返回，延迟从 2.5 秒降到 400ms，准确率也上去了。另外我们路由规则现在用 `RunnableBranch`，条件函数里除了关键词匹配还加了个 LLM 兜底——前面规则都匹配不上时，让 LLM 自己判断意图再分发给一个通用处理 Chain。这样既有确定性路由的高效，又有 LLM 判断的兜底，不至于掉空里。

### Q3: ConversationBufferMemory 和 SummaryMemory 如何选择？各自的优缺点？

**详细答案：** 我们项目的对话系统经历过一次 Memory 策略大换血，教训很深。刚开始用的 `ConversationBufferMemory`，因为最省事，不用想那么多。上线前两周一切正常，第三周开始用户投诉——有的用户聊了 30 轮之后回复越来越慢，最离谱的一次等了 12 秒。一排查，Buffer 早把上下文塞满了，光是对话历史就占了 8000 Token，问题还没开始问，上下文窗口已经快用完。那个月 API 费用比预期高了 40%。

后来我们切成了 `ConversationSummaryBufferMemory`——最近 3 轮保留原文，更早的做摘要。切完之后效果立竿见影：单次请求 Token 稳定在 2000 以内，P50 延迟从 3 秒降到 1.5 秒。但代价也有——摘要是由另一个 LLM 调用生成的，相当于每次对话结束后要额外调一次模型做摘要，不过这部分的 Token 消耗很少（每次摘要大概 200 Token 左右）。还有个细节点，摘要的质量完全依赖做摘要的那个 LLM，我们刚开始用 gpt-3.5-turbo 做摘要，经常漏掉关键信息（比如用户说过自己退货原因是质量问题，摘要里没体现），后来换成 gpt-4o-mini 做摘要就好多了。如果对话短、预算充足，Buffer 最简单可靠；用户量上来之后，Summary 或 BufferWindow 是必须的。

### Q4: 如何自定义 Chain？RunnableLambda 的作用是什么？

**详细答案：** `RunnableLambda` 是我们项目里用得最多的自定义组件，本质上就是把一个 Python 函数包成 LCEL 兼容的 Runnable，然后能在管道里和其他组件串联。我们项目有个典型场景：LLM 输出的是 Markdown 格式，但前端只接受纯文本，我就写了一个 `strip_markdown` 函数用正则去掉所有 Markdown 标记，然后 `RunnableLambda(strip_markdown)` 挂在 Chain 末端，`prompt | llm | StrOutputParser() | strip_markdown_lambda`，从头到尾不用写额外的转换逻辑。

不过有个坑要注意：`RunnableLambda` 默认会打断流式输出。我们前端希望看到 Markdown 格式逐步渲染，结果 strip_markdown 挂在中间把流式链路切断了——它必须等上游全部输出完才能做正则替换，所以前面那个 chain 变成了"等 LLM 出完全文 -> 去掉 Markdown -> 一次性推到前端"，用户看着空白等了几秒。解决方案要么把 lambda 移到 chain 最后面，要么重写函数让它支持 `transform` 方法做流式处理。另外，如果需要异步操作（比如在 Chain 中间查数据库），记得用 `async` 函数配合 `RunnableLambda`，LangChain 能自动适配 `.ainvoke()` 模式。我们还有个规矩：不要往一个 RunnableLambda 里塞超过 50 行的逻辑，超过就拆成独立的服务层兜一圈再回来。

### Q5: Memory 的 Token 消耗如何控制？

**详细答案：** 这是实战中一定会碰到的问题，我们生产环境每天的 Token 消耗在 80 万左右，Memory 大概占了 30%，不控制的话成本真兜不住。我们的策略是"三层防线"。第一层是 BufferWindow，只保留最近 5 轮完整对话，超过的直接丢掉。5 轮是怎么定的——我们拉了一周的数据，发现用户平均对话轮次是 6.3 轮，5 轮能覆盖 85% 的会话场景，没必要留更多。

第二层是 Summary。超过 5 轮的对话触发自动摘要，由 gpt-4o-mini（成本够低，$0.15/1M input tokens）来做，把 5-15 轮的内容压缩成 200 Token 左右的一段话。第三层是监控兜底——我们在 callback 里埋了 Token 计数，单次请求 Token 超过 3000 就发告警到飞书群，有一次一个 Prompt 模板出了 bug 把整个对话历史重复塞了两遍，这条告警救了我们，不然按当时的 QPS（峰值大概 200），一晚上能烧小几千块。

另外还有个容易被忽略的点：system prompt 本身也占 Token。我们系统 prompt 经过三次精简，从最初 500 Token 压到 120 Token，每年能省下一笔。如果项目特别讲究成本，可以考虑 `VectorStoreRetrieverMemory`——把历史对话存向量库，只检索和当前问题相关的片段注入上下文，而不是全量塞进去。不过这只适合检索式场景，普通对话用不上。

### Q6: LangChain Memory 在多用户场景下如何管理？

**详细答案：** 我们客服系统高峰期同时在线 3000+ 用户，Memory 管理不做好隔离就是灾难现场——用户 A 能看到用户 B 的对话历史，这在客服场景是严重事故。我们的方案是"Redis 热缓存 + PostgreSQL 持久化"双写。每个会话用 session_id 做 key，Memory 序列化后存 Redis，过期时间设 30 分钟。用户发消息时先从 Redis 读 Memory，反序列化后注入 Chain，处理完再写回。如果 Redis 里找不到（比如过期了），走 PostgreSQL 从数据库捞历史重建。

这里有个技术细节：LangChain 的 Memory 对象默认不可直接 JSON 序列化出问题——`ConversationSummaryBufferMemory` 里存了 LLM 实例和其他复杂对象，直接用 `json.dumps` 会挂。我们用的 `loads` / `dumps` 方法（LangChain 自带），但有时摘要内容里包含特殊字符也会导致反序列化失败，后来加了 try-catch 兜底——反序列化失败就直接从数据库重建 Memory，用户体验上就是历史丢了一两轮，但起码不会报错。

并发控制也踩过坑。同一用户快速连发两条消息，如果两条都读 Redis -> 改 Memory -> 写回，后写的那条会覆盖前一条的更新，导致前一条对话丢失。我们的解法是加分布式锁——每个 session_id 一把锁，同一时刻只允许一个请求操作 Memory。还有个经验：定期清理僵尸会话很重要，我们有一个定时任务每天凌晨扫 Redis，超过 24 小时无活动的 session 直接删掉，不然 3000 个会话的内存占用会慢慢涨到几个 G。