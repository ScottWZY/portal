# AI 应用实战

> 创建日期：2026-06-06

---

## 模块概览

本模块聚焦 AI 大模型的应用层开发，从 RAG 知识库问答到 AI Agent 工具调用，再到 LangChain 框架实战。三个项目由浅入深，帮助 Java/Python 开发者快速切入 AI 应用开发领域。

---

## 一、rag-chatbot —— RAG 知识库问答系统

### 技术栈

| 类别 | 技术 |
|------|------|
| 语言 | Python 3.11+ |
| 框架 | LangChain + FastAPI |
| 大模型 | OpenAI API / 本地模型（Ollama） |
| 向量数据库 | Milvus / Chroma |
| Embedding | OpenAI Embedding / BGE 中文模型 |
| 文档解析 | Unstructured / PyPDF2 / python-docx |
| 前端 | Streamlit / Gradio |
| 数据库 | PostgreSQL（pgvector） |

### 学习目标

- 理解 RAG（Retrieval-Augmented Generation）的核心流程：文档加载 -> 切分 -> 向量化 -> 检索 -> 生成
- 掌握文档切分策略（按字符、按段落、按语义）对检索效果的影响
- 理解不同 Embedding 模型的选择对中文场景的影响
- 掌握向量数据库的使用（Chroma 本地开发、Milvus 生产部署）
- 能实现多轮对话中的上下文管理
- 掌握检索质量评估方法（召回率、排序质量）
- 理解高级 RAG 技术（Self-RAG、CRAG、多路召回）

### 核心功能清单

| 编号 | 功能模块 | 说明 |
|------|----------|------|
| RAG-01 | 文档上传 | 支持 PDF、Word、TXT、Markdown 多格式 |
| RAG-02 | 文档解析 | 文本提取、表格处理、图片 OCR |
| RAG-03 | 文本切分 | 多种切分策略对比（Recursive、Semantic、Markdown） |
| RAG-04 | 向量化存储 | Embedding 生成 + 向量入库 |
| RAG-05 | 语义检索 | 单路检索、多路召回 + 重排序 |
| RAG-06 | 问答生成 | Prompt 模板 + 检索上下文注入 |
| RAG-07 | 多轮对话 | 对话历史管理 + 上下文窗口控制 |
| RAG-08 | 引用溯源 | 展示回答的引用来源文档段落 |
| RAG-09 | 知识库管理 | 文档增删改、向量库同步更新 |
| RAG-10 | API 服务 | FastAPI 封装，支持 RESTful 接口 |

### 高级特性

| 特性 | 说明 |
|------|------|
| 混合检索 | 关键词检索（BM25）+ 语义检索（向量）融合 |
| 重排序 | 使用 Cross-Encoder 对召回结果精排 |
| Self-RAG | 自我反思机制，判断是否需要检索、回答是否相关 |
| 流式输出 | SSE（Server-Sent Events）实现逐字流式返回 |

### 对应 Wiki 模块

- RAG 原理与架构
- 文档处理与文本切分
- Embedding 与向量检索
- Prompt 工程
- 高级 RAG 技术

### 预计耗时

**35 ~ 45 小时**

---

## 二、agent-demo —— AI Agent 工具调用

### 技术栈

| 类别 | 技术 |
|------|------|
| 语言 | Python 3.11+ |
| 框架 | LangChain + LangGraph |
| 大模型 | OpenAI Function Calling / 本地模型 |
| 工具集成 | 搜索 API（SerpAPI）、计算器、数据库查询、HTTP 请求 |
| 记忆 | LangChain Memory（ConversationBufferMemory） |
| 规划 | ReAct / Plan-and-Execute |

### 学习目标

- 理解 AI Agent 的核心概念：感知 -> 规划 -> 行动 -> 观察 循环
- 掌握 Function Calling 机制的原理和实现
- 能使用 LangChain 的 Agent 框架构建自定义工具
- 理解 ReAct（Reasoning + Acting）模式的工作原理
- 掌握 LangGraph 构建有状态的、多步骤的 Agent 工作流
- 能实现 Agent 的记忆管理和错误恢复

### 核心实验清单

| 编号 | 实验名称 | 说明 |
|------|----------|------|
| AGT-01 | 基础 Agent | ReAct Agent，集成搜索 + 计算器工具 |
| AGT-02 | 自定义工具 | 封装 REST API 为 Agent 工具 |
| AGT-03 | 数据库工具 | SQL 查询工具，自然语言转 SQL 执行 |
| AGT-04 | 多工具协作 | 复杂任务的工具链编排 |
| AGT-05 | Agent 记忆 | 会话记忆、长期记忆存储 |
| AGT-06 | LangGraph 入门 | 构建状态图驱动的 Agent |
| AGT-07 | 多 Agent 协作 | 多个 Agent 分工合作完成复杂任务 |
| AGT-08 | Agent 评估 | 工具选择准确率、任务完成率评估 |

### Agent 架构

```
用户输入
   │
   ▼
┌──────────┐
│  Agent   │  (ReAct / Plan-Execute 模式)
│  大脑    │
└────┬─────┘
     │ 思考：我需要什么工具？
     ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  搜索工具     │     │  计算工具     │     │  API 工具     │
│  (SerpAPI)   │     │  (Python)    │     │  (自定义)     │
└──────────────┘     └──────────────┘     └──────────────┘
     │                      │                      │
     └──────────────────────┼──────────────────────┘
                            │ 工具的返回结果
                            ▼
                    ┌──────────────┐
                    │   结果合成     │
                    │   (LLM)      │
                    └──────┬───────┘
                           │
                           ▼
                       最终回答
```

### 对应 Wiki 模块

- AI Agent 概念与架构
- Function Calling 原理
- LangChain Agent 框架
- LangGraph 工作流
- 多 Agent 协作

### 预计耗时

**30 ~ 35 小时**

---

## 三、langchain-practice —— LangChain 实战

### 技术栈

| 类别 | 技术 |
|------|------|
| 语言 | Python 3.11+ |
| 框架 | LangChain 0.3+ / LangChain4j（Java 版） |
| 大模型 | OpenAI / Anthropic / 本地模型 |
| 链式调用 | LCEL（LangChain Expression Language） |
| 回调 | LangSmith / 自定义 Callback |
| 输出解析 | Pydantic Output Parser |

### 学习目标

- 掌握 LangChain 的核心抽象：Model、Prompt、Chain、Memory、Retriever、Tool
- 理解 LCEL（LangChain Expression Language）的声明式链式调用语法
- 掌握多种 Prompt 模板的设计（Few-Shot、Chain-of-Thought、ReAct）
- 能构建复杂的数据处理 Chain（Router Chain、Sequential Chain、Map-Reduce Chain）
- 理解 LangChain 的回调机制与可观测性（LangSmith）
- 掌握 LangChain4j 在 Java 项目中的集成
- 能对长文本进行 Map-Reduce 和 Refine 摘要处理

### 核心实验清单

| 编号 | 实验名称 | 说明 |
|------|----------|------|
| LCH-01 | Prompt 工程 | 多种 Prompt 模板的设计与效果对比 |
| LCH-02 | LCEL 链式调用 | 使用管道符 `|` 构建处理链 |
| LCH-03 | Sequential Chain | 多步骤有序执行的数据处理链 |
| LCH-04 | Router Chain | 根据输入内容动态选择处理分支 |
| LCH-05 | Map-Reduce 摘要 | 超长文档的分段摘要 + 合并 |
| LCH-06 | 结构化输出 | Pydantic Parser 实现 JSON 结构化输出 |
| LCH-07 | 回调与监控 | 自定义 Callback 记录 Token 消耗与延迟 |
| LCH-08 | 流式输出 | Streaming 实时输出处理 |
| LCH-09 | LangChain4j | Java 版 LangChain 集成与对比 |
| LCH-10 | 生产化部署 | FastAPI + Docker 部署 LangChain 服务 |

### 对应 Wiki 模块

- LangChain 核心概念
- LCEL 表达式语言
- Prompt 工程
- Chain 类型与应用
- 输出解析
- LangChain 生产化

### 预计耗时

**35 ~ 40 小时**