# AI 应用方法论与知识图谱

> **创建日期：** 2026-06-06
> **适用人群：** 后端开发者转型 AI 应用工程师

---

## 一、AI 应用知识图谱总览

```mermaid
mindmap
  root((AI应用知识体系))
    LLM基础
      Transformer架构
      Token与上下文
      主流模型概览
    Prompt工程
      基础技巧
      高级技巧
      结构化输出
      安全防护
    模型选型
      能力矩阵
      价格对比
      场景匹配
      多模型路由
    RAG检索增强
      文档处理
      向量检索
      检索优化
      RAG评估
      高级RAG
    Agent智能体
      Agent架构
      工具调用
      多Agent协作
      记忆系统
      框架选型
    MCP协议
      协议架构
      工具定义
      资源暴露
      Server开发
    工程化
      模型部署
      框架生态
      低代码平台
      安全合规
    企业落地
      知识库系统
      智能客服
      代码助手
      成本优化
```

---

## 二、AI 应用开发方法论

### 2.1 五步开发循环

```mermaid
flowchart LR
    A["需求分析"] --> B["方案设计"]
    B --> C["快速实现"]
    C --> D["效果评估"]
    D --> E["迭代优化"]
    E --> A

    classDef step fill:#dbeafe,stroke:#2563eb,stroke-width:2px,color:#1e40af
    class A,B,C,D,E step
```

| 步骤 | 核心问题 | 典型产出 | 关键原则 |
|------|----------|----------|----------|
| **需求分析** | 用户的真实痛点是什么？AI 是不是最佳方案？ | 需求文档、场景定义 | 不要为了用 AI 而用 AI，传统方案能解决的不要上大模型 |
| **方案设计** | 用什么架构？选什么模型？数据怎么来？ | 架构图、技术选型文档 | 简单场景用 RAG，复杂场景考虑 Agent；先选最便宜的模型 |
| **快速实现** | 先把端到端链路跑通，不要过早优化 | 可运行的 Demo | 一个能工作的丑陋 RAG，胜过一个漂亮但没接入检索的方案 |
| **效果评估** | 怎么衡量好坏？用户满意吗？ | 评估指标、用户反馈 | 从第一天开始建立评估集（20-50 个 QA 对），每次改动都打分 |
| **迭代优化** | 哪里是瓶颈？怎么提升？ | 优化方案、A/B 测试报告 | 瓶颈通常在检索环节，优先优化检索质量 |

### 2.2 核心设计原则

::: tip 原则一：先搭管道，再优化
端到端的链路比任何单一环节的优化都重要。先确保"用户提问 → 模型回答"完整可用，再逐一优化分块、检索、生成等环节。
:::

::: tip 原则二：用评估驱动迭代
没有评估的优化是盲目的。每次改动前记录当前指标，改动后对比变化。如果指标没提升，回退改动。
:::

::: tip 原则三：简单优于复杂
- 能用 Prompt 解决就不上 RAG
- 能用单 Agent 解决就不上多 Agent
- 能用 API 调用就不自己部署模型
- 能用 Chroma 就不上 Milvus
:::

::: tip 原则四：成本意识贯穿始终
每个设计决策都要考虑成本。Token 消耗、GPU 资源、API 调用次数都是钱。建立成本模型，在性能和成本之间找到平衡点。
:::

---

## 三、AI 应用工程师能力模型

### 3.1 能力分层

```mermaid
flowchart TB
    subgraph L4["第四层：系统架构能力"]
        L4A["多模型路由与降级"]
        L4B["大规模 RAG 系统"]
        L4C["多 Agent 编排"]
        L4D["成本优化与监控"]
    end

    subgraph L3["第三层：Agent 与工具开发"]
        L3A["Agent 设计与实现"]
        L3B["Function Calling"]
        L3C["MCP Server 开发"]
        L3D["多 Agent 协作"]
    end

    subgraph L2["第二层：RAG 全链路"]
        L2A["文档处理与分块"]
        L2B["向量数据库选型"]
        L2C["检索优化与评估"]
        L2D["高级 RAG 模式"]
    end

    subgraph L1["第一层：基础认知"]
        L1A["LLM 原理理解"]
        L1B["Prompt Engineering"]
        L1C["API 调用与集成"]
        L1D["模型选型决策"]
    end

    L1 --> L2 --> L3 --> L4

    classDef l1 fill:#dbeafe,stroke:#2563eb,color:#1e40af
    classDef l2 fill:#dcfce7,stroke:#16a34a,color:#166534
    classDef l3 fill:#fef3c7,stroke:#d97706,color:#92400e
    classDef l4 fill:#fce7f3,stroke:#db2777,color:#9d174d

    class L1A,L1B,L1C,L1D l1
    class L2A,L2B,L2C,L2D l2
    class L3A,L3B,L3C,L3D l3
    class L4A,L4B,L4C,L4D l4
```

### 3.2 各阶段学习路径

| 阶段 | 周期 | 目标 | 核心产出 | 关键里程碑 |
|------|------|------|----------|------------|
| **基础认知** | 2-4 周 | 理解 AI 能做什么、不能做什么 | 一个可运行的 ChatBot Demo | 能独立调用 API 完成对话 |
| **RAG 实战** | 3-4 周 | 掌握生产中最常用的 AI 技术 | 一个本地知识库问答系统 | RAGAS 评估得分 > 0.7 |
| **Agent 进阶** | 3-4 周 | 让 AI 从"回答问题"到"执行任务" | 一个带工具调用的 Agent 应用 | Agent 能自主完成 3 步以上任务 |
| **生产落地** | 2-4 周 | 将 Demo 变成可上线的产品 | 可部署的企业级 AI 应用 | 通过安全审查和性能测试 |

---

## 四、技术栈全景图

```mermaid
flowchart TB
    subgraph App["应用层"]
        APP1["知识库问答"]
        APP2["智能客服"]
        APP3["代码助手"]
        APP4["数据分析"]
        APP5["低代码平台（Dify/Coze）"]
    end

    subgraph Orchestration["编排层"]
        ORC1["LangChain / LangGraph"]
        ORC2["LlamaIndex"]
        ORC3["CrewAI / AutoGen"]
        ORC4["OpenAI Agents SDK"]
        ORC5["PydanticAI"]
    end

    subgraph Model["模型层"]
        M1["GPT-4o / 4.1"]
        M2["Claude 4.6"]
        M3["Gemini 2.5"]
        M4["DeepSeek V3 / R1"]
        M5["Qwen3 / Kimi / GLM"]
        M6["本地部署（vLLM / Ollama）"]
    end

    subgraph Data["数据层"]
        D1["向量数据库（Milvus/Qdrant/Chroma/pgvector）"]
        D2["文档处理（LlamaParse/Unstructured）"]
        D3["嵌入模型（BGE/Jina/OpenAI）"]
        D4["全文检索引擎（Elasticsearch）"]
    end

    subgraph Infra["基础设施层"]
        I1["GPU 集群 / 云服务"]
        I2["Docker / Kubernetes"]
        I3["API 网关（模型路由）"]
        I4["监控（Prometheus / Grafana）"]
    end

    App --> Orchestration
    Orchestration --> Model
    Orchestration --> Data
    Model --> Infra
    Data --> Infra

    classDef app fill:#dbeafe,stroke:#2563eb,color:#1e40af
    classDef orc fill:#dcfce7,stroke:#16a34a,color:#166534
    classDef model fill:#fef3c7,stroke:#d97706,color:#92400e
    classDef data fill:#fce7f3,stroke:#db2777,color:#9d174d
    classDef infra fill:#f3e8ff,stroke:#9333ea,color:#581c87

    class APP1,APP2,APP3,APP4,APP5 app
    class ORC1,ORC2,ORC3,ORC4,ORC5 orc
    class M1,M2,M3,M4,M5,M6 model
    class D1,D2,D3,D4 data
    class I1,I2,I3,I4 infra
```

---

## 五、软件工程师转型 AI 的关键原则

### 5.1 你不需要从头训练模型

AI 应用工程师的工作不是训练模型，而是将 **Transformers、检索、Agent** 三个原语组合成产品。就像后端工程师不需要自己写数据库，AI 应用工程师不需要自己训练模型。

### 5.2 评估是唯一的导航仪

从第一天开始建立评估集。没有评估，你无法知道：
- 改动是否有效？
- 新模型是否更好？
- 系统是否在退化？

### 5.3 不要过早引入多 Agent

绝大多数项目应该从单 Agent 起步。先明确工具边界，再局部引入多 Agent。多 Agent 增加了复杂度，但不一定提升效果。

### 5.4 成本是设计约束，不是事后考虑

每个 API 调用都花钱。从设计阶段就考虑：
- 这个场景真的需要最贵的模型吗？
- 能用缓存减少调用吗？
- 能否用更便宜的模型处理简单任务？

---

## 六、推荐学习资源

| 类型 | 资源 | 说明 |
|------|------|------|
| 课程 | DeepLearning.AI Short Courses | LLM/RAG/Agent 短期课程，免费 |
| 文档 | LangChain 官方文档 | Agent 编排框架权威参考 |
| 文档 | LlamaIndex 官方文档 | RAG 和文档智能权威参考 |
| 协议 | MCP 官方规范（modelcontextprotocol.io） | AI 工具标准化协议 |
| 书籍 | 《Building LLM Apps》— Valentina Alto | AI 应用开发入门 |
| 实践 | OpenAI Cookbook | 官方最佳实践代码示例 |
| 社区 | GitHub Trending（LangChain/AutoGPT 等） | 跟踪 AI 应用最新动态 |
| 博客 | 各大厂技术博客（美团/字节/阿里） | 企业 AI 落地实战案例 |