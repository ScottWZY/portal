# AI 应用

## 模块概述

AI 应用模块面向后端开发者的 AI 落地实践，从大语言模型（LLM）的基础概念到 Prompt Engineering、RAG 检索增强生成、Agent 智能体开发以及 MCP 协议。当前后端工程师的核心竞争力正在从"写业务逻辑"转向"AI 集成与调优"。

::: tip 趋势判断
未来 3 年，具备 AI 应用落地能力的后端工程师将成为稀缺资源。不是每个人都需要训练模型，但每个人都需要学会**用好模型**。
:::

::: info 技术栈
大模型 API（OpenAI / 文心 / 通义 / DeepSeek） + LangChain / LlamaIndex + RAG + Agent + MCP
:::

## 核心知识点

### LLM 基础

| 子模块 | 核心内容 |
|--------|----------|
| 基础概念 | Token / Context Window / Temperature / Top-P / Top-K / Embedding |
| Transformer | Self-Attention 机制、Encoder-Decoder 架构、GPT vs BERT 路线差异 |
| 主流模型 | GPT-4o / Claude / Gemini / DeepSeek / 文心一言 / 通义千问 能力对比与选型 |
| API 调用 | OpenAI Compatible API 格式、流式输出（SSE）、Function Calling |

### Prompt Engineering

| 子模块 | 核心内容 |
|--------|----------|
| 基础技巧 | 角色设定、Few-Shot（少样本提示）、Chain-of-Thought（思维链）、格式化输出 |
| 高级技巧 | ReAct（推理+行动）、Self-Consistency（自洽性）、Tree-of-Thought（思维树） |
| 结构化输出 | JSON Mode、Pydantic 解析、输出校验与重试 |
| 安全与防护 | Prompt 注入防御、越狱防护、内容安全审核 |

### RAG（检索增强生成）

| 子模块 | 核心内容 |
|--------|----------|
| 文档处理 | 文档切分策略（固定长度 / 语义分块）、Metadata 标注、多格式解析（PDF/Word/HTML） |
| 向量检索 | Embedding 模型选型、向量数据库（Milvus/Pinecone/Chroma/Qdrant）、相似度计算 |
| 检索优化 | 混合检索（关键词 + 向量）、Rerank 重排序、HyDE（假设文档嵌入）、多路召回 |
| RAG 评估 | 忠实度/相关性/上下文精确度、RAGAS 评估框架 |
| 高级 RAG | Graph RAG（知识图谱增强）、Agentic RAG（Agent 驱动的检索策略） |

### Agent 开发

| 子模块 | 核心内容 |
|--------|----------|
| Agent 架构 | 感知 → 规划 → 行动 → 观察循环、ReAct 框架 |
| 工具调用 | Function Calling / Tool Use、工具描述规范、工具选择策略 |
| 多 Agent | 角色分工（Leader-Follower）、通信机制、任务编排 |
| 记忆管理 | 短期记忆（对话历史）、长期记忆（向量存储）、摘要记忆 |
| 框架 | LangChain / LangGraph、AutoGen / CrewAI、Dify 低代码平台 |

### MCP 协议

| 子模块 | 核心内容 |
|--------|----------|
| 协议架构 | Client-Server 架构、JSON-RPC 2.0 传输层、Stdio / SSE 两种传输方式 |
| 核心概念 | Resources（资源暴露）、Tools（工具定义）、Prompts（提示模板）、Sampling |
| 开发实践 | 使用 FastMCP 或 MCP SDK 构建 MCP Server |

### 企业级落地

| 子模块 | 核心内容 |
|--------|----------|
| 知识库系统 | 企业内部知识库架构设计、权限控制、多租户隔离 |
| 智能客服 | 意图识别 → 知识检索 → 答案生成 → 人工转接 |
| 代码助手 | AI Code Review、SQL 生成、单元测试生成 |
| 成本优化 | Token 消耗监控、缓存策略、模型降级、Prompt 压缩 |

## 面试重点

::: warning 高频考点
1. **RAG 全文检索流程**：从文档上传到用户提问返回答案的完整链路，每个环节的优化手段
2. **Prompt Engineering 实践**：给出一个业务场景，设计 Prompt 模板并说明设计思路
3. **向量检索原理**：Embedding 是什么？为什么能表示语义？向量相似度计算方法对比
4. **Agent 设计思路**：如何让 LLM 自主拆解任务、调用工具、纠正错误？
5. **MCP 协议**：与传统 API 集成的区别，为什么需要标准化的上下文协议？
6. **大模型选型**：不同场景（代码生成/内容创作/逻辑推理）的模型推荐与评估标准
:::

::: danger 容易翻车的点
- 停留在"调 API"层面，不理解 RAG 各环节的优化方向
- Prompt 设计凭感觉，没有工程化的迭代思路
- 对 Embedding 和向量检索的理解不到位，说不出优化策略
- 忽视 AI 应用的安全问题（注入攻击、数据泄露）
:::

## 学习建议

### 阶段一：基础入门（1 周）
1. 调用 OpenAI Compatible API，完成对话、流式输出、Function Calling 三个 Demo
2. 学习 Prompt Engineering 指南，用不同任务验证效果
3. 理解 Token 计数和计费逻辑，建立成本意识

### 阶段二：RAG 系统（2 周）
4. 从零搭建一个本地知识库问答系统（文档解析 → 切分 → Embedding → 向量存储 → 检索 → 生成）
5. 对比不同的文档切分策略对检索准确率的影响
6. 使用 RAGAS 评估你的 RAG 系统质量

### 阶段三：Agent 开发（2 周）
7. 使用 LangChain/LangGraph 构建一个能调用工具的 Agent
8. 实现多 Agent 协作场景（例如：分析师 + 执行者双 Agent）
9. 开发一个简单的 MCP Server，让 LLM 能访问企业内部 API

### 阶段四：企业落地（1 周）
10. 设计一个智能客服系统的完整技术方案，包含 RAG + Agent + Fallback 策略

::: details 推荐资源
- OpenAI 官方 Cookbook 和 Prompt Engineering Guide
- LangChain / LlamaIndex 官方文档
- DeepLearning.AI 的 LangChain 和 RAG 系列课程
- 《Building LLM Apps》—— Valentina Alto
- MCP 协议官方规范（modelcontextprotocol.io）
- 各模型厂商的 Best Practice 文档
:::