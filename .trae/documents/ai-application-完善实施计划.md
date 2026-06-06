# AI 应用（ai-application）模块完善实施计划

> **创建日期：** 2026-06-06
> **计划类型：** 知识库构建与完善
> **目标模块：** `wiki-docs/docs/ai-application/`

---

## 一、任务概述

### 1.1 背景

当前 `ai-application/` 模块仅包含 `index.md`（总览页）、`rag/index.md`、`rag/vector-db.md` 三个文件，其余子目录（`llm-basics/`、`prompt-engineering/`、`agent/`、`langchain/`）在侧边栏中已规划但尚未创建内容。迫切需要按照"方法论 → 知识图谱 → 技术栈逐个突破 → 综合实战"的路径，系统性地将该模块构建为完整的 AI 应用知识体系。

### 1.2 目标

构建一个**由浅到深、由点到面、完整且可落地**的 AI 应用知识库，涵盖：

1. **AI 应用方法论与知识图谱** — 建立全局认知框架
2. **大模型能力边界与选型** — 掌握每家大模型的核心竞争力与适用场景
3. **AI 技术栈逐个储备** — LLM 基础 → Prompt → RAG → Agent → MCP → 安全 → 部署
4. **综合实战项目** — 企业可落地的完整项目方案与代码
5. **Python 入门辅助** — 为后续 AI 开发提供语言基础

### 1.3 成功标准

- [ ] 所有侧边栏中规划的页面均已创建并填充内容
- [ ] 每个技术模块至少包含：原理、最佳实践、代码示例
- [ ] 模型选型指南覆盖国内外主流大模型（≥10 个）
- [ ] 至少 3 个完整的综合实战项目方案
- [ ] 知识图谱以 Mermaid 图表形式可视化呈现
- [ ] Python 入门内容覆盖 AI 开发所需的基础语法

---

## 二、当前状态分析

### 2.1 已完成内容

| 文件 | 状态 | 内容质量 |
|------|------|----------|
| `ai-application/index.md` | ✅ 已完成 | 总览页：模块概述、核心知识点表格、面试重点、学习建议 |
| `ai-application/rag/index.md` | ✅ 已完成 | RAG 原理概述 |
| `ai-application/rag/vector-db.md` | ✅ 已完成 | 向量数据库选型指南 |

### 2.2 侧边栏已规划但缺失的内容

| 路径 | 侧边栏标题 | 当前状态 |
|------|-----------|----------|
| `ai-application/llm-basics/` | LLM 基础 | ❌ 目录不存在 |
| `ai-application/llm-basics/models` | 主流模型对比 | ❌ 文件不存在 |
| `ai-application/llm-basics/token` | Token 与上下文 | ❌ 文件不存在 |
| `ai-application/prompt-engineering/` | Prompt 设计 | ❌ 目录不存在 |
| `ai-application/prompt-engineering/advanced` | Few-Shot / CoT | ❌ 文件不存在 |
| `ai-application/rag/optimization` | RAG 优化 | ❌ 文件不存在 |
| `ai-application/agent/` | Agent 架构 | ❌ 目录不存在 |
| `ai-application/agent/function-call` | 工具调用 | ❌ 文件不存在 |
| `ai-application/agent/multi-agent` | 多 Agent 协作 | ❌ 文件不存在 |
| `ai-application/langchain/` | LangChain 入门 | ❌ 目录不存在 |
| `ai-application/langchain/chain` | Chain 与 Memory | ❌ 文件不存在 |
| `ai-application/langchain/practice` | 实战案例 | ❌ 文件不存在 |

### 2.3 需要新增的内容模块

根据调研，当前侧边栏结构不足以覆盖完整的 AI 应用知识体系，需要新增以下模块：

| 新模块 | 必要性 | 说明 |
|--------|--------|------|
| **AI 应用方法论** | P0 | 知识图谱总览 + 方法论框架 |
| **模型选型专题** | P0 | 模型能力边界、价格对比、场景匹配 |
| **MCP 协议** | P1 | index.md 中已提及，侧边栏缺失 |
| **AI 安全与合规** | P1 | 注入攻击、数据隐私、内容安全 |
| **模型服务化部署** | P2 | vLLM / Ollama / TGI 部署方案 |
| **低代码 AI 平台** | P2 | Dify / Coze / FastGPT 对比 |
| **综合实战项目** | P1 | 3 个企业级可落地项目 |
| **Python 入门** | P3 | AI 开发所需的 Python 基础 |

---

## 三、实施方案

### 3.1 整体架构设计

```
ai-application/
├── index.md                          # [已有] 总览页
├── methodology/                      # [新增] AI应用方法论
│   └── index.md                      #   知识图谱 + 方法论框架 + 学习路径
├── llm-basics/                       # [扩充] LLM 基础
│   ├── index.md                      #   大模型概览（Transformer原理）
│   ├── models.md                     #   主流模型深度对比
│   ├── token.md                      #   Token 与上下文窗口
│   └── model-selection/              #   [新增] 模型选型专题
│       ├── index.md                  #     选型方法论
│       ├── capability-matrix.md      #     能力矩阵对比
│       └── scenario-matching.md      #     场景匹配指南
├── prompt-engineering/               # [扩充] Prompt 工程
│   ├── index.md                      #   Prompt 设计基础
│   ├── advanced.md                   #   高级技巧（Few-Shot/CoT/ToT）
│   ├── structured-output.md          #   [新增] 结构化输出
│   └── security.md                   #   [新增] Prompt 安全
├── rag/                              # [扩充] RAG
│   ├── index.md                      #   [已有] RAG 原理
│   ├── vector-db.md                  #   [已有] 向量数据库
│   ├── optimization.md               #   RAG 优化策略
│   ├── evaluation.md                 #   [新增] RAG 评估体系
│   └── advanced.md                   #   [新增] 高级 RAG（Graph RAG/Agentic RAG）
├── agent/                            # [扩充] Agent
│   ├── index.md                      #   Agent 架构与原理
│   ├── function-call.md              #   工具调用
│   ├── multi-agent.md                #   多 Agent 协作
│   ├── memory.md                     #   [新增] 记忆系统设计
│   └── frameworks.md                 #   [新增] Agent 框架对比
├── mcp/                              # [新增] MCP 协议
│   ├── index.md                      #   协议概述与架构
│   ├── server-dev.md                 #   MCP Server 开发实践
│   └── tools-resources.md            #   Tools/Resources/Prompts 详解
├── langchain/                        # [扩充] LangChain 生态
│   ├── index.md                      #   LangChain 入门
│   ├── chain.md                      #   Chain 与 Memory
│   ├── practice.md                   #   实战案例
│   └── ecosystem.md                  #   [新增] 生态对比（LangChain vs LlamaIndex vs CrewAI 等）
├── deployment/                       # [新增] 模型服务化
│   ├── index.md                      #   模型部署方案总览
│   ├── vllm.md                       #   vLLM 生产部署
│   └── ollama.md                     #   Ollama 本地开发
├── low-code/                         # [新增] 低代码平台
│   └── index.md                      #   Dify / Coze / FastGPT 对比
├── security/                         # [新增] AI 安全
│   └── index.md                      #   注入攻击/数据隐私/内容安全
├── enterprise/                       # [新增] 企业落地
│   ├── index.md                      #   企业 AI 落地方法论
│   ├── knowledge-base.md             #   智能知识库系统方案
│   ├── customer-service.md           #   智能客服系统方案
│   └── cost-optimization.md          #   成本优化策略
├── projects/                         # [新增] 综合实战项目
│   ├── index.md                      #   项目总览
│   ├── project1-knowledge-qa.md      #   项目一：企业知识库问答系统
│   ├── project2-code-assistant.md    #   项目二：AI 代码助手
│   └── project3-data-analysis.md     #   项目三：智能数据分析助手
└── python-basics/                    # [新增] Python 入门
    ├── index.md                      #   Python 基础语法
    ├── ai-libs.md                    #   AI 相关库（requests/openai/numpy）
    └── venv.md                       #   虚拟环境与包管理
```

### 3.2 分阶段实施计划

#### 阶段一：方法论与全局认知（基础框架）

**目标：** 建立 AI 应用全局认知，先有"地图"再出发

| 序号 | 文件 | 核心内容 | 预估篇幅 |
|------|------|----------|----------|
| 1.1 | `methodology/index.md` | AI 应用知识图谱（Mermaid 思维导图）、AI 应用开发方法论（需求→设计→实现→评估→迭代）、学习路径规划（4 阶段）、各阶段关键产出 | ~150 行 |
| 1.2 | `llm-basics/index.md` | Transformer 架构心智模型（向量/注意力/FFNN）、LLM 工作原理概述、Tokenization 原理、API 调用范式（OpenAI Compatible）、流式输出（SSE） | ~120 行 |
| 1.3 | `llm-basics/token.md` | Token 概念、tokenizer 工作原理、上下文窗口限制、Token 计数与计费、长文本处理策略 | ~80 行 |

**阶段一依赖：** 无，可直接开始

---

#### 阶段二：模型选型与技术栈基础（深度认知）

**目标：** 掌握每家大模型的能力边界，建立选型决策能力

| 序号 | 文件 | 核心内容 | 预估篇幅 |
|------|------|----------|----------|
| 2.1 | `llm-basics/models.md` | 国际模型（GPT-4o/4.1、Claude 4.6、Gemini 2.5）能力对比、国内模型（DeepSeek V3.2/V4、Qwen3-Max、Kimi K2.5、GLM-4）能力对比、价格对比表格、各维度横向对比（综合/代码/中文/长文本/性价比） | ~150 行 |
| 2.2 | `llm-basics/model-selection/index.md` | 选型决策框架、按任务分层策略（简单→均衡→复杂→推理）、国内 vs 国外部署考量、API 兼容性说明 | ~80 行 |
| 2.3 | `llm-basics/model-selection/capability-matrix.md` | 详细能力矩阵（代码/推理/多语言/多模态/Agent/指令遵循等维度）、各模型测试基准（MMLU/HumanEval/SWE-bench）对比 | ~100 行 |
| 2.4 | `llm-basics/model-selection/scenario-matching.md` | 场景化推荐（智能客服/知识库/代码助手/数据分析/内容生成/多模态）、企业落地场景匹配、成本-性能权衡决策树 | ~100 行 |
| 2.5 | `prompt-engineering/index.md` | Prompt 工程基础、角色设定、Zero-Shot/Few-Shot、输出格式控制、常见 Prompt 模板、Prompt 迭代优化方法论 | ~100 行 |
| 2.6 | `prompt-engineering/advanced.md` | Chain-of-Thought（思维链）、Self-Consistency（自洽性）、Tree-of-Thought（思维树）、ReAct 模式、自动 Prompt 优化（APO/DSPy） | ~100 行 |
| 2.7 | `prompt-engineering/structured-output.md` | JSON Mode、Pydantic 解析、Function Calling 输出格式、输出校验与重试策略、结构化输出的工程实践 | ~80 行 |

**阶段二依赖：** 阶段一完成后

---

#### 阶段三：RAG 技术栈深度突破（核心能力）

**目标：** 掌握 RAG 全链路技术，这是企业 AI 落地最常用的技术

| 序号 | 文件 | 核心内容 | 预估篇幅 |
|------|------|----------|----------|
| 3.1 | `rag/optimization.md` | 文档分块策略（固定/语义/结构感知）、混合检索（关键词+向量）、Rerank 重排序、HyDE 假设文档嵌入、多路召回与融合、查询改写（Query Rewriting） | ~120 行 |
| 3.2 | `rag/evaluation.md` | RAGAS 评估框架、忠实度/相关性/上下文精确度/上下文召回率、评估集构建方法、自动化评估流程、常见评估陷阱 | ~100 行 |
| 3.3 | `rag/advanced.md` | Graph RAG（知识图谱增强）、Agentic RAG（Agent 驱动的检索策略）、Self-RAG（自我反思检索）、Corrective RAG（纠错检索）、多模态 RAG | ~100 行 |

**阶段三依赖：** 阶段二完成后

---

#### 阶段四：Agent 与 MCP 协议（进阶能力）

**目标：** 掌握 Agent 开发能力，让 AI 从"回答问题"到"执行任务"

| 序号 | 文件 | 核心内容 | 预估篇幅 |
|------|------|----------|----------|
| 4.1 | `agent/index.md` | Agent 架构原理（感知→规划→行动→观察）、ReAct 框架深入、Agent 设计模式（Plan-and-Execute/Self-Reflection/Reflexion）、Agent 与 RAG 的关系、何时需要 Agent | ~120 行 |
| 4.2 | `agent/function-call.md` | Function Calling 原理、工具描述规范（JSON Schema 最佳实践）、工具选择策略、错误处理与重试、工具调用链编排 | ~100 行 |
| 4.3 | `agent/multi-agent.md` | 多 Agent 协作模式（Leader-Follower/辩论式/层级式）、通信机制、任务编排、状态共享、多 Agent 框架选型 | ~100 行 |
| 4.4 | `agent/memory.md` | 三层记忆系统（工作记忆/情景记忆/语义记忆）、短期记忆（对话历史管理）、长期记忆（向量存储+摘要）、记忆检索策略、记忆压缩与遗忘 | ~100 行 |
| 4.5 | `agent/frameworks.md` | Agent 框架全景对比（LangGraph/CrewAI/AutoGen/OpenAI Agents SDK/PydanticAI/Google ADK/smolagents/Mastra）、各框架核心定位与适用场景、选型决策树 | ~120 行 |
| 4.6 | `mcp/index.md` | MCP 协议概述、Client-Server 架构、JSON-RPC 2.0 传输层、Stdio/SSE 传输方式、与传统 API 集成的区别、为什么要标准化 | ~80 行 |
| 4.7 | `mcp/tools-resources.md` | Resources（资源暴露）、Tools（工具定义）、Prompts（提示模板）、Sampling（采样）、各原语的设计规范与最佳实践 | ~80 行 |
| 4.8 | `mcp/server-dev.md` | 使用 FastMCP 构建 Server、使用 MCP SDK（Python/TypeScript）构建 Server、工具注册与实现、测试与调试、常见问题与解决方案 | ~80 行 |

**阶段四依赖：** 阶段三完成后

---

#### 阶段五：工程化与生态（体系完备）

**目标：** 掌握 AI 应用的工程化能力，包括部署、安全、低代码平台

| 序号 | 文件 | 核心内容 | 预估篇幅 |
|------|------|----------|----------|
| 5.1 | `langchain/index.md` | LangChain 架构概览、核心组件（Model I/O/Retrieval/Chains/Agents/Memory/Callbacks）、快速上手指南、与 LlamaIndex 的定位差异 | ~80 行 |
| 5.2 | `langchain/chain.md` | Chain 类型（LLMChain/SequentialChain/RouterChain）、Memory 类型（ConversationBuffer/Summary/VectorStore）、自定义 Chain 开发 | ~80 行 |
| 5.3 | `langchain/practice.md` | 实战：构建一个完整的 RAG 问答应用、带记忆的对话机器人、可调用工具的 Agent | ~100 行 |
| 5.4 | `langchain/ecosystem.md` | 编排框架全景对比（LangChain/LangGraph/LlamaIndex/CrewAI/Semantic Kernel）、各框架擅长领域、多框架组合使用策略、2026 年最新趋势 | ~100 行 |
| 5.5 | `deployment/index.md` | 模型服务化部署方案对比（vLLM/TGI/Ollama）、量化技术（AWQ/GPTQ/GGUF）、GPU 选型与成本估算、API 网关设计 | ~100 行 |
| 5.6 | `deployment/vllm.md` | vLLM 安装与配置、PagedAttention 原理、OpenAI 兼容 API 配置、性能调优、多卡部署 | ~80 行 |
| 5.7 | `deployment/ollama.md` | Ollama 安装与使用、模型管理与下载、GGUF 格式、REST API 调用、OpenAI 兼容模式、本地开发工作流 | ~60 行 |
| 5.8 | `low-code/index.md` | Dify 平台详解、Coze（扣子）平台详解、FastGPT 平台详解、三平台对比（功能/部署/生态/价格）、选型建议 | ~100 行 |
| 5.9 | `security/index.md` | Prompt 注入攻击与防御、越狱（Jailbreak）防护、数据泄露风险、内容安全审核、企业级 AI 安全架构、合规要求（数据出境/隐私保护） | ~100 行 |
| 5.10 | `enterprise/index.md` | 企业 AI 落地方法论（需求评估→POC→选型→部署→运营）、组织能力建设、ROI 评估框架、常见陷阱与避坑指南 | ~80 行 |
| 5.11 | `enterprise/cost-optimization.md` | Token 消耗监控、Prompt 缓存策略、模型降级与路由、语义缓存（GPTCache）、Prompt 压缩、批量处理优化 | ~80 行 |

**阶段五依赖：** 阶段四完成后

---

#### 阶段六：综合实战项目（能力整合）

**目标：** 将各技术栈整合为可落地的企业级项目方案

项目代码存放路径：`code-projects/ai-projects/`

| 序号 | 文件 | 核心内容 | 预估篇幅 |
|------|------|----------|----------|
| 6.1 | `projects/index.md` | 项目总览、技术栈要求、开发环境准备、项目之间的递进关系 | ~60 行 |
| 6.2 | `projects/project1-knowledge-qa.md` | **项目一：企业知识库问答系统** — 需求分析、系统架构设计（文档解析→分块→Embedding→向量存储→混合检索→Rerank→LLM 生成）、后端代码（Python/FastAPI）、前端界面（Vue3）、部署方案（Docker Compose）、效果评估（RAGAS） | ~200 行 |
| 6.3 | `projects/project2-code-assistant.md` | **项目二：AI 代码助手** — 需求分析、系统架构（代码库索引→RAG 检索→Agent 工具调用→代码生成/审查）、Function Calling 设计、与 IDE 集成方案、后端代码、效果评估 | ~150 行 |
| 6.4 | `projects/project3-data-analysis.md` | **项目三：智能数据分析助手** — 需求分析、系统架构（NL2SQL→数据库查询→结果分析→可视化）、Text-to-SQL Pipeline、多表关联处理、Agent 驱动分析流程、后端代码、效果评估 | ~150 行 |

**阶段六依赖：** 阶段五完成后，需要编写配套项目代码到 `code-projects/ai-projects/`

---

#### 阶段七：Python 入门辅助（语言基础）

**目标：** 为不熟悉 Python 的 Java 开发者提供 AI 开发所需的 Python 基础知识

| 序号 | 文件 | 核心内容 | 预估篇幅 |
|------|------|----------|----------|
| 7.1 | `python-basics/index.md` | Python 环境搭建、基础语法（变量/数据类型/控制流/函数/类）、与 Java 的对比（帮助 Java 开发者快速上手）、列表推导式、装饰器、上下文管理器 | ~120 行 |
| 7.2 | `python-basics/ai-libs.md` | AI 开发必备库：requests（HTTP 调用）、openai（大模型 API）、numpy（向量计算）、pydantic（数据校验）、fastapi（Web 框架）、asyncio（异步编程） | ~100 行 |
| 7.3 | `python-basics/venv.md` | 虚拟环境（venv/conda）、pip 包管理、requirements.txt、Poetry 简介、常见问题排查 | ~60 行 |

**阶段七依赖：** 无，可与阶段一~五并行

---

#### 阶段八：侧边栏与首页更新（配置整合）

**目标：** 更新 VitePress 配置，使所有新增页面在导航中可见

| 序号 | 文件 | 修改内容 |
|------|------|----------|
| 8.1 | `.vitepress/config.js` | 更新 `ai-application` 侧边栏配置，添加所有新增模块的导航项 |
| 8.2 | `ai-application/index.md` | 更新总览页，补充新增模块的链接和说明 |

**阶段八依赖：** 所有内容页面创建完成后

---

## 四、实施顺序与依赖关系

```
阶段一（方法论+基础）
    │
    ▼
阶段二（模型选型+Prompt）
    │
    ▼
阶段三（RAG 深度）   阶段七（Python 入门）  ← 可并行
    │                      │
    ▼                      │
阶段四（Agent+MCP）        │
    │                      │
    ▼                      ▼
阶段五（工程化+生态）  ← Python 基础就绪
    │
    ▼
阶段六（综合实战项目）
    │
    ▼
阶段八（配置整合）
```

## 五、关键决策与假设

### 5.1 技术选型假设

| 决策项 | 选择 | 理由 |
|--------|------|------|
| 主要编程语言 | Python | AI 生态以 Python 为主，用户 Java 背景，Python 入门即可 |
| Agent 框架重点 | LangChain/LangGraph | 生态最成熟，文档最丰富 |
| 向量数据库起步 | Chroma | 零配置、进程内运行，适合学习 |
| 模型服务化（开发） | Ollama | 类 Docker 体验，本地开发友好 |
| 模型服务化（生产） | vLLM | 性能最优，OpenAI 兼容 API |
| 低代码平台 | Dify | 开源、私有化部署、功能全面 |
| 前端框架 | Vue3 | 与用户现有技能匹配 |

### 5.2 内容组织原则

- **每个文件保持 60~200 行**，确保深度适中、可读性好
- **代码示例使用 Python**，复杂逻辑添加中文注释
- **尽量使用 Mermaid 图表**（流程图、思维导图、对比图）增强可读性
- **对比表格**作为重要的知识组织方式，帮助快速建立认知
- **内容面向后端开发者**，从 Java 开发者的视角解释 AI 概念

### 5.3 项目代码假设

- 实战项目代码存放在 `d:\traeData\trae-solo\trae_prepare\code-projects\ai-projects\`
- 每个项目使用 Poetry 管理依赖
- 项目后端使用 FastAPI + Python
- 项目前端使用 Vue3 + Vite
- 使用 Docker Compose 统一部署

---

## 六、验证标准

### 6.1 内容完整性验证

- [ ] 所有 40+ 个页面文件均已创建
- [ ] 每个页面至少包含：概述、核心内容、代码示例/实践建议
- [ ] 知识图谱以 Mermaid 图表形式呈现
- [ ] 模型选型对比表格覆盖 ≥10 个模型
- [ ] 至少 3 个完整的实战项目方案

### 6.2 技术准确性验证

- [ ] 模型价格数据来自 2026 年最新官方定价
- [ ] 框架对比基于最新版本（2026 年 6 月）
- [ ] 代码示例语法正确、可运行
- [ ] Mermaid 图表语法正确

### 6.3 可用性验证

- [ ] VitePress 侧边栏导航完整
- [ ] 所有链接有效，无死链
- [ ] VitePress 本地构建成功（`npm run docs:build`）
- [ ] 页面在浏览器中正常渲染

### 6.4 学习路径验证

- [ ] 从方法论到实战的递进关系清晰
- [ ] 每个阶段有明确的产出要求
- [ ] Java 开发者能通过 Python 入门快速上手

---

## 七、预估工作量

| 阶段 | 页面数 | 预估总行数 | 难度 |
|------|--------|-----------|------|
| 阶段一：方法论与基础 | 3 | ~350 行 | ⭐⭐ |
| 阶段二：模型选型与 Prompt | 7 | ~630 行 | ⭐⭐⭐ |
| 阶段三：RAG 深度 | 3 | ~320 行 | ⭐⭐⭐ |
| 阶段四：Agent 与 MCP | 8 | ~780 行 | ⭐⭐⭐⭐ |
| 阶段五：工程化与生态 | 11 | ~960 行 | ⭐⭐⭐ |
| 阶段六：综合实战 | 4 | ~560 行 + 项目代码 | ⭐⭐⭐⭐⭐ |
| 阶段七：Python 入门 | 3 | ~280 行 | ⭐⭐ |
| 阶段八：配置整合 | 2 | 修改现有文件 | ⭐ |
| **合计** | **41 个页面** | **~3880 行** | — |

---

## 八、注意事项

1. **内容质量优先于速度**：每个页面确保内容准确、结构清晰、有实用价值
2. **保持 Java 开发者视角**：用 Java 概念类比解释 AI 概念，降低理解门槛
3. **代码示例必须可运行**：所有 Python 代码示例经过验证（至少语法正确）
4. **价格数据标注日期**：模型价格变动频繁，所有价格表格标注"截至 2026 年 6 月"
5. **遵循项目规则**：文档命名使用 kebab-case、内容使用中文、遵循 docs 目录结构规范