# AI 应用（ai-application）模块续建实施计划 v2

> **创建日期：** 2026-06-06
> **计划类型：** 知识库续建（在 v1 计划基础上，基于当前进度更新）
> **目标模块：** `wiki-docs/docs/ai-application/`

---

## 一、进度总览

### 1.1 已完成（13 个文件）

| 文件 | 所属阶段 | 质量评估 |
|------|----------|----------|
| `methodology/index.md` | 阶段一 | ⭐⭐⭐⭐⭐ 方法论+知识图谱+能力模型+技术栈全景 |
| `llm-basics/index.md` | 阶段一 | ⭐⭐⭐⭐⭐ Transformer心智模型+API调用+Function Calling |
| `llm-basics/token.md` | 阶段一 | ⭐⭐⭐⭐⭐ Token概念+上下文窗口+成本估算+长文本策略 |
| `llm-basics/models.md` | 阶段二 | ⭐⭐⭐⭐⭐ 国际+国内模型价格能力对比+场景推荐+趋势 |
| `llm-basics/model-selection/index.md` | 阶段二 | ⭐⭐⭐⭐⭐ 选型决策框架+分层策略+API兼容性+误区 |
| `llm-basics/model-selection/capability-matrix.md` | 阶段二 | ⭐⭐⭐⭐⭐ 基准对比+能力维度排名+标签速查+评估流程 |
| `llm-basics/model-selection/scenario-matching.md` | 阶段二 | ⭐⭐⭐⭐⭐ 7大场景详细推荐+成本-性能决策树+FAQ |
| `prompt-engineering/index.md` | 阶段二 | ⭐⭐⭐⭐⭐ Prompt结构+Zero/Few-Shot+CoT+迭代方法论 |
| `prompt-engineering/advanced.md` | 阶段二 | ⭐⭐⭐⭐⭐ ReAct+Self-Consistency+ToT+DSPy+模板化 |
| `prompt-engineering/structured-output.md` | 阶段二 | ⭐⭐⭐⭐⭐ JSON Mode+Pydantic+instructor+校验重试 |
| `rag/index.md` | 阶段三 | ⭐⭐⭐⭐⭐ RAG全链路+vs微调对比+面试高频问题 |
| `rag/vector-db.md` | 阶段三 | ⭐⭐⭐⭐⭐ 相似度度量+ANN算法+向量数据库选型 |

### 1.2 待完成（28 个文件 + 项目代码）

| 阶段 | 文件数 | 核心主题 |
|------|--------|----------|
| 阶段三：RAG 深度 | 3 | 优化策略、评估体系、高级RAG |
| 阶段四：Agent 与 MCP | 8 | Agent架构、工具调用、多Agent、记忆、框架、MCP协议 |
| 阶段五：工程化与生态 | 11 | LangChain、部署、低代码、安全、企业落地 |
| 阶段六：综合实战 | 4 + 代码 | 3个企业级项目 + 项目代码 |
| 阶段七：Python 入门 | 3 | 基础语法、AI库、虚拟环境 |
| 阶段八：配置整合 | 2 | 侧边栏更新、首页更新 |

---

## 二、续建实施计划

### 阶段三：RAG 深度突破（3 个文件）— 优先级 P0

> **目标：** 掌握 RAG 全链路优化，这是企业 AI 落地最核心的技术

| 序号 | 文件 | 核心内容 | 行数 |
|------|------|----------|------|
| 3.1 | `rag/optimization.md` | 文档分块策略（固定/语义/结构感知）、混合检索（关键词+向量）、Rerank重排序（Cross-Encoder）、HyDE假设文档嵌入、多路召回与RRF融合、查询改写（Query Rewriting）、Chunk扩展策略 | ~120 |
| 3.2 | `rag/evaluation.md` | RAGAS评估框架详解、忠实度/答案相关性/上下文精确度/上下文召回率四大指标、评估集构建方法、自动化评估流程、常见评估陷阱 | ~100 |
| 3.3 | `rag/advanced.md` | Graph RAG（知识图谱增强检索）、Agentic RAG（Agent驱动的检索策略）、Self-RAG（自我反思检索）、Corrective RAG（纠错检索）、多模态RAG、RAPTOR（层级摘要索引） | ~100 |

---

### 阶段四：Agent 与 MCP 协议（8 个文件）— 优先级 P0

> **目标：** 让 AI 从"回答问题"升级到"执行任务"，这是 AI 应用工程师的核心竞争力

| 序号 | 文件 | 核心内容 | 行数 |
|------|------|----------|------|
| 4.1 | `agent/index.md` | Agent架构原理（感知→规划→行动→观察循环）、ReAct框架深入、Agent设计模式（Plan-and-Execute/Self-Reflection/Reflexion）、Agent与RAG的关系、何时需要Agent | ~120 |
| 4.2 | `agent/function-call.md` | Function Calling原理深入、工具描述规范（JSON Schema最佳实践）、工具选择策略（并行/串行）、错误处理与重试、工具调用链编排、安全沙箱 | ~100 |
| 4.3 | `agent/multi-agent.md` | 多Agent协作模式（Leader-Follower/辩论式/层级式/流水线）、通信机制、任务编排与状态共享、多Agent框架选型、常见陷阱 | ~100 |
| 4.4 | `agent/memory.md` | 三层记忆系统（工作记忆/情景记忆/语义记忆）、短期记忆（对话历史管理）、长期记忆（向量存储+摘要）、记忆检索策略、记忆压缩与遗忘 | ~100 |
| 4.5 | `agent/frameworks.md` | Agent框架全景对比（LangGraph/CrewAI/AutoGen/OpenAI Agents SDK/PydanticAI/Google ADK/smolagents/Mastra）、核心定位与适用场景、选型决策树 | ~120 |
| 4.6 | `mcp/index.md` | MCP协议概述、Client-Server架构、JSON-RPC 2.0传输层、Stdio/SSE两种传输方式、与传统API集成的区别、为什么要标准化、生态现状 | ~80 |
| 4.7 | `mcp/tools-resources.md` | Resources（资源暴露）、Tools（工具定义）、Prompts（提示模板）、Sampling（采样）、各原语的设计规范与最佳实践 | ~80 |
| 4.8 | `mcp/server-dev.md` | 使用FastMCP构建Server、Python MCP SDK开发、工具注册与实现、测试与调试、常见问题 | ~80 |

---

### 阶段五：工程化与生态（11 个文件）— 优先级 P1

> **目标：** 打通从开发到部署的完整链路，具备企业级 AI 应用交付能力

| 序号 | 文件 | 核心内容 | 行数 |
|------|------|----------|------|
| 5.1 | `langchain/index.md` | LangChain架构概览、核心组件（Model I/O/Retrieval/Chains/Agents/Memory/Callbacks）、快速上手、与LlamaIndex定位差异 | ~80 |
| 5.2 | `langchain/chain.md` | Chain类型（LLMChain/SequentialChain/RouterChain）、Memory类型（Buffer/Summary/VectorStore）、自定义Chain | ~80 |
| 5.3 | `langchain/practice.md` | 实战：构建完整RAG问答应用、带记忆对话机器人、可调用工具Agent | ~100 |
| 5.4 | `langchain/ecosystem.md` | 编排框架全景对比（LangChain/LangGraph/LlamaIndex/CrewAI/Semantic Kernel）、各框架擅长领域、多框架组合策略、2026趋势 | ~100 |
| 5.5 | `deployment/index.md` | 模型服务化部署方案对比（vLLM/TGI/Ollama）、量化技术（AWQ/GPTQ/GGUF）、GPU选型与成本估算、API网关设计 | ~100 |
| 5.6 | `deployment/vllm.md` | vLLM安装与配置、PagedAttention原理、OpenAI兼容API、性能调优、多卡部署 | ~80 |
| 5.7 | `deployment/ollama.md` | Ollama安装使用、模型管理、GGUF格式、REST API、OpenAI兼容模式、本地开发工作流 | ~60 |
| 5.8 | `low-code/index.md` | Dify平台详解、Coze（扣子）详解、FastGPT详解、三平台对比（功能/部署/生态/价格）、选型建议 | ~100 |
| 5.9 | `security/index.md` | Prompt注入攻击与防御、越狱防护、数据泄露风险、内容安全审核、企业级AI安全架构、合规要求 | ~100 |
| 5.10 | `enterprise/index.md` | 企业AI落地方法论（需求评估→POC→选型→部署→运营）、组织能力建设、ROI评估框架、常见陷阱 | ~80 |
| 5.11 | `enterprise/cost-optimization.md` | Token消耗监控、Prompt缓存策略、模型降级与路由、语义缓存（GPTCache）、Prompt压缩、批量处理优化 | ~80 |

---

### 阶段六：综合实战项目（4 个文件 + 项目代码）— 优先级 P0

> **目标：** 将各技术栈整合为可落地的企业级项目，代码存放在 `code-projects/ai-projects/`

| 序号 | 内容 | 描述 | 行数 |
|------|------|------|------|
| 6.1 | `projects/index.md` | 项目总览、技术栈要求、开发环境准备、递进关系 | ~60 |
| 6.2 | `projects/project1-knowledge-qa.md` | **项目一：企业知识库问答系统** — 需求分析、系统架构设计（文档解析→分块→Embedding→向量存储→混合检索→Rerank→LLM生成）、FastAPI后端代码、Vue3前端、Docker Compose部署、RAGAS评估 | ~200 |
| 6.3 | `projects/project2-code-assistant.md` | **项目二：AI代码助手** — 需求分析、系统架构（代码库索引→RAG检索→Agent工具调用→代码生成/审查）、Function Calling设计、IDE集成方案、后端代码 | ~150 |
| 6.4 | `projects/project3-data-analysis.md` | **项目三：智能数据分析助手** — 需求分析、系统架构（NL2SQL→数据库查询→结果分析→可视化）、Text-to-SQL Pipeline、多表关联处理、Agent驱动分析、后端代码 | ~150 |

**项目代码实现（在 `code-projects/ai-projects/` 下）：**

```
code-projects/ai-projects/
├── project1-knowledge-qa/
│   ├── backend/                 # FastAPI 后端
│   │   ├── main.py
│   │   ├── rag/                 # RAG 核心模块
│   │   ├── models/              # 数据模型
│   │   └── requirements.txt
│   ├── frontend/                # Vue3 前端
│   │   ├── src/
│   │   └── package.json
│   ├── docker-compose.yml
│   └── README.md
├── project2-code-assistant/
│   └── ...（同上结构）
└── project3-data-analysis/
    └── ...（同上结构）
```

---

### 阶段七：Python 入门辅助（3 个文件）— 优先级 P2

> **目标：** 为 Java 开发者提供 AI 开发所需的 Python 基础

| 序号 | 文件 | 核心内容 | 行数 |
|------|------|----------|------|
| 7.1 | `python-basics/index.md` | Python环境搭建、基础语法（变量/数据类型/控制流/函数/类）、与Java对比（帮助Java开发者快速上手）、列表推导式、装饰器、上下文管理器 | ~120 |
| 7.2 | `python-basics/ai-libs.md` | AI开发必备库：requests、openai、numpy、pydantic、fastapi、asyncio | ~100 |
| 7.3 | `python-basics/venv.md` | 虚拟环境（venv/conda）、pip包管理、requirements.txt、Poetry简介 | ~60 |

---

### 阶段八：侧边栏与首页更新（2 个文件）— 优先级 P1

| 序号 | 文件 | 修改内容 |
|------|------|----------|
| 8.1 | `.vitepress/config.js` | 更新 `ai-application` 侧边栏配置，添加所有新增模块的导航项 |
| 8.2 | `ai-application/index.md` | 更新总览页，补充新增模块的链接和说明 |

---

## 三、实施顺序与依赖关系

```
已完成（阶段一+二）───→ 阶段三（RAG深度）───→ 阶段四（Agent+MCP）
                                                    │
                        阶段七（Python入门）←────────┤（可并行）
                                                    │
                                                    ▼
                                              阶段五（工程化+生态）
                                                    │
                                                    ▼
                                              阶段六（综合实战项目）
                                                    │
                                                    ▼
                                              阶段八（配置整合）
```

**推荐执行顺序：**
1. **阶段三（RAG深度）** → 最核心的企业落地技术
2. **阶段四（Agent+MCP）** → 进阶能力，与 RAG 深度结合
3. **阶段五（工程化）** → 部署、安全、企业落地
4. **阶段六（实战项目）** → 综合应用所有技术栈
5. **阶段七（Python入门）** → 可与阶段三~五并行
6. **阶段八（配置整合）** → 最后收尾

---

## 四、关键决策

### 4.1 内容组织原则

- **每个文件保持 60~200 行**，确保深度适中、可读性好
- **代码示例使用 Python**，复杂逻辑添加中文注释
- **尽量使用 Mermaid 图表**（流程图、思维导图、对比图）增强可读性
- **对比表格**作为重要知识组织方式
- **内容面向 Java 后端开发者**，用 Java 概念类比解释 AI 概念

### 4.2 技术选型

| 决策项 | 选择 | 理由 |
|--------|------|------|
| 主要编程语言 | Python | AI 生态以 Python 为主 |
| Agent 框架重点 | LangChain/LangGraph | 生态最成熟 |
| 向量数据库 | Chroma（学习）/ Milvus（生产） | 渐进式 |
| 模型服务化（开发） | Ollama | 本地开发友好 |
| 模型服务化（生产） | vLLM | 性能最优 |
| 低代码平台 | Dify | 开源、私有化部署 |
| 前端框架 | Vue3 | 与用户技能匹配 |

### 4.3 项目代码规范

- 实战项目代码存放在 `code-projects/ai-projects/`
- 每个项目使用 Poetry 管理依赖
- 后端使用 FastAPI
- 前端使用 Vue3 + Vite
- 使用 Docker Compose 统一部署

---

## 五、验证标准

### 5.1 内容完整性

- [ ] 所有 28 个待完成页面均已创建
- [ ] 每个页面至少包含：概述、核心内容、代码示例/实践建议
- [ ] 至少 3 个完整的实战项目方案
- [ ] VitePress 侧边栏导航完整
- [ ] 所有链接有效，VitePress 构建成功

### 5.2 技术准确性

- [ ] 模型价格数据来自 2026 年最新官方定价
- [ ] 框架对比基于最新版本
- [ ] 代码示例语法正确、可运行
- [ ] Mermaid 图表语法正确

### 5.3 学习路径

- [ ] 从方法论到实战的递进关系清晰
- [ ] 每个阶段有明确的产出要求
- [ ] Java 开发者能通过 Python 入门快速上手

---

## 六、预估工作量

| 阶段 | 页面数 | 预估行数 | 难度 |
|------|--------|----------|------|
| 阶段三：RAG 深度 | 3 | ~320 | ⭐⭐⭐ |
| 阶段四：Agent 与 MCP | 8 | ~780 | ⭐⭐⭐⭐ |
| 阶段五：工程化与生态 | 11 | ~960 | ⭐⭐⭐ |
| 阶段六：综合实战 | 4 + 代码 | ~560 + 项目代码 | ⭐⭐⭐⭐⭐ |
| 阶段七：Python 入门 | 3 | ~280 | ⭐⭐ |
| 阶段八：配置整合 | 2 | 修改现有 | ⭐ |
| **合计** | **31 个页面 + 项目代码** | **~2900 行** | — |