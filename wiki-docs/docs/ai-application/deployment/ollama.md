# Ollama 本地开发

> **创建日期：** 2026-06-06
> **前置知识：** LLM 基础

---

## 一、Ollama 简介

Ollama 是最简单的本地 LLM 运行工具，类 Docker 体验：`ollama pull` → `ollama run`。

**核心优势：** 零配置、一键启动、API 兼容 OpenAI 格式。

---

## 二、安装与使用

```bash
# 安装（Windows/Mac/Linux 均可）
# 官网下载：https://ollama.com

# 拉取并运行模型
ollama pull qwen2.5:7b    # 下载 Qwen2.5 7B
ollama run qwen2.5:7b     # 交互式对话

# 查看已下载的模型
ollama list

# 删除模型
ollama rm qwen2.5:7b
```

---

## 三、推荐模型

| 模型 | 大小 | 显存需求 | 适用场景 |
|------|------|----------|----------|
| `qwen2.5:7b` | ~4.5GB | 6GB+ | 中文通用、本地开发首选 |
| `qwen2.5:14b` | ~9GB | 12GB+ | 更强的中文能力 |
| `deepseek-r1:8b` | ~5GB | 8GB+ | 推理任务、代码调试 |
| `llama3.2:3b` | ~2GB | 4GB+ | 轻量级、快速响应 |
| `phi4:14b` | ~9GB | 12GB+ | 微软出品、英文推理 |

---

## 四、REST API 调用

```python
# Ollama 提供 OpenAI 兼容 API
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:11434/v1",  # Ollama 默认地址
    api_key="ollama"  # 任意值，本地不需认证
)

response = client.chat.completions.create(
    model="qwen2.5:7b",
    messages=[{"role": "user", "content": "介绍 Transformer 架构"}],
    stream=True
)

for chunk in response:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="")
```

---

## 五、GGUF 格式

GGUF 是 Ollama 使用的模型格式，专为 CPU/GPU 混合推理优化：

| 量化级别 | 文件大小 | 质量 |
|----------|----------|------|
| Q4_K_M | 最小 | 推荐，质量和速度平衡 |
| Q5_K_M | 中等 | 更好质量 |
| Q8_0 | 较大 | 接近原始质量 |
| F16 | 最大 | 无损 |

---

## 六、本地开发工作流

```
1. ollama pull qwen2.5:7b        # 下载模型
2. 编写 Python 代码调用 API
3. 本地测试 → 通过后切换到云端 API
4. 生产环境：Ollama → vLLM / 云 API
```

**注意：** Ollama 适合开发和轻量使用，生产环境建议用 vLLM 或云服务。

---

## 面试高频题

### Q1: Ollama 的核心优势是什么？适合哪些场景？有什么局限性？
**详细答案：** Ollama 的核心优势可以用"三个零"来概括：零配置、零门槛、零成本。下载安装后无需任何配置，执行 `ollama pull qwen2.5:7b` 就能拉取模型，`ollama run qwen2.5:7b` 就能开始对话，体验类似于 Docker 的 `pull`/`run` 模式。它自动处理模型下载、量化版本选择、GPU 加速（支持 CUDA 和 Metal）、内存管理，开发者无需关心底层细节。Ollama 还默认提供 OpenAI 兼容的 REST API（`http://localhost:11434/v1`），已有的 openai-python 客户端代码几乎无需修改就能切换到本地模型，极大降低了本地 LLM 开发的门槛。

Ollama 最适合三个场景：(1) **本地开发和调试**：在开发 AI 应用时，先用 Ollama 本地模型测试逻辑，确认无误后再切换到云端 API，避免开发过程中产生大量 API 费用。(2) **学习和实验**：学习 Prompt Engineering、RAG、Agent 等概念时，Ollama 提供免费的本地实验环境，不受 API 调用频率和费用限制。(3) **数据敏感场景的 PoC**：在数据不能出本地的合规要求下，Ollama 作为快速验证方案，证明本地 LLM 的可行性后再迁移到生产级方案。

但 Ollama 有明确的局限性：(1) **性能**：Ollama 使用 llama.cpp 作为推理后端，主要针对消费级硬件优化，推理速度不如 vLLM、TGI 等生产级推理框架。(2) **并发能力**：Ollama 默认单实例推理，高并发场景下性能下降明显。(3) **功能限制**：不支持高级推理优化（如 Continuous Batching、PagedAttention、KV Cache 共享），不支持多 GPU 分布式推理。因此，Ollama 适合开发和小规模使用，生产环境建议切换到 vLLM 或云服务。

### Q2: 如何通过代码调用 Ollama 的 API？它与 OpenAI API 的兼容性如何？
**详细答案：** Ollama 默认在 `http://localhost:11434` 启动 HTTP 服务，提供两种 API 接口：Ollama 原生 API 和 OpenAI 兼容 API。使用 OpenAI 兼容 API 是最推荐的方式，因为它与现有的 openai-python 客户端完全兼容，只需修改 `base_url` 和 `api_key` 两个参数即可。具体代码为：`client = OpenAI(base_url="http://localhost:11434/v1", api_key="ollama")`，之后所有 chat.completions.create() 调用语法与调用 OpenAI 完全一致，支持流式输出、system prompt、temperature 等参数。

Ollama 的 OpenAI 兼容 API 支持以下端点：`/v1/chat/completions`（对话补全）、`/v1/completions`（文本补全）、`/v1/embeddings`（向量嵌入）、`/v1/models`（模型列表）。兼容性方面，大部分常用参数（model、messages、temperature、max_tokens、stream、top_p）都支持，但部分高级参数（如 `response_format` 结构化输出、`tools` 函数调用、`logprobs`）的支持程度取决于具体的模型能力和 Ollama 版本。Ollama 原生 API 则提供了更丰富的功能：`/api/generate`（生成接口，支持更多底层参数）、`/api/chat`（对话接口）、`/api/embed`（嵌入接口）、`/api/pull`（下载模型）、`/api/show`（模型信息）。

在开发流程中，推荐使用 OpenAI 兼容 API 编写代码，这样可以在 Ollama 本地模型和 OpenAI/其他云端 API 之间无缝切换，只需修改 `base_url` 和 `api_key` 即可。例如，开发阶段使用 `base_url="http://localhost:11434/v1"`，部署到生产环境后改为 `base_url="https://api.openai.com/v1"`，代码逻辑完全不变。

### Q3: GGUF 格式是什么？Q4_K_M 和 Q8_0 等不同量化级别的区别和取舍是什么？
**详细答案：** GGUF（GGML Universal Format）是 llama.cpp 项目定义的一种模型文件格式，专门为 CPU/GPU 混合推理优化。它是 GGML 格式的继任者，解决了 GGML 的许多设计缺陷（如元数据不可扩展、不支持多文件等）。GGUF 文件包含模型权重、分词器配置、模型架构参数、量化信息等所有运行所需的数据，是一个自包含的单文件格式。Ollama 底层使用 llama.cpp 进行推理，因此所有通过 Ollama 运行的模型都以 GGUF 格式存储。

量化级别的区别直接影响模型质量、文件大小和推理速度的平衡：(1) **Q4_K_M**（4-bit 量化）：文件大小约为原始 FP16 的 1/4，质量损失极小（通常 <1% 的基准测试分数下降），是 Ollama 的默认推荐级别，兼顾了质量和速度；(2) **Q5_K_M**（5-bit 量化）：文件约为原始 1/3，质量略好于 Q4，但需要更多显存，适合显存充裕的场景；(3) **Q8_0**（8-bit 量化）：文件约为原始 1/2，质量接近 FP16，几乎无损，适合对质量要求极高且显存足够的情况；(4) **F16**（半精度浮点）：无量化，完整保存模型权重，文件最大，质量最高。K 系列（K-quant）相比 Q 系列采用了更精细的量化策略，对不同层使用不同的量化精度（重要层用更高精度，非重要层更激进地量化），在相同文件大小下质量更好。

选择建议：日常开发用 Q4_K_M（7B 模型约 4.5GB）；对回答质量要求高且显存充足（>12GB）用 Q5_K_M 或 Q8_0；生产环境评估质量时用 F16 作为基准，然后逐步降低量化级别测试质量衰减。Ollama 在 `ollama pull` 时默认选择 Q4_K_M 级别，也可以通过 `ollama pull qwen2.5:7b-q8_0` 指定量化级别。

### Q4: Ollama 和 vLLM 的使用边界是什么？什么时候应该从 Ollama 切换到 vLLM？
**详细答案：** Ollama 和 vLLM 的设计目标和适用场景有本质区别。Ollama 面向"个人开发者 + 本地实验"，追求极简使用体验；vLLM 面向"生产环境 + 高并发服务"，追求极致推理性能。两者的核心差异体现在：(1) **推理性能**：vLLM 的 Continuous Batching 技术可以将多个请求动态合并为一个批次，GPU 利用率通常比 Ollama 高 2-5 倍，吞吐量（tokens/s）差距显著。(2) **显存效率**：vLLM 使用 PagedAttention 管理 KV Cache，将显存利用率从 ~50% 提升到 ~90%，相同显存可以服务更多并发请求。(3) **分布式推理**：vLLM 支持张量并行（Tensor Parallelism）和流水线并行（Pipeline Parallelism），可以将大模型拆分到多张 GPU 上推理，Ollama 主要支持单 GPU。

从 Ollama 切换到 vLLM 的明确信号包括：(1) **并发用户数 > 5**：当多个用户同时请求时，Ollama 的串行/小批次推理导致响应延迟线性增长，vLLM 的 Continuous Batching 可以显著改善。(2) **需要高吞吐量**：批量处理大量文档（如知识库构建、批量翻译），vLLM 的吞吐量优势非常明显。(3) **显存优化需求**：单 GPU 显存紧张时，vLLM 的 PagedAttention 可以更高效地利用显存，在相同硬件上支持更大的上下文或更多并发。(4) **需要生产级功能**：vLLM 提供 Prometheus 监控指标、请求优先级调度、API 鉴权、多模型管理（通过 vLLM Gateway）等企业级特性。

过渡策略应该是渐进式的：先用 Ollama 进行本地开发和功能验证（便利性优先），确认方案可行后，在测试环境部署 vLLM 进行性能测试和压测，最后在生产环境使用 vLLM。如果团队规模较小、用户量有限，Ollama 配合适当缓存可能已经足够，不必过早引入 vLLM 的运维复杂度。

### Q5: 在本地开发环境中，如何使用 Ollama 搭建完整的 AI 应用开发工作流？
**详细答案：** 使用 Ollama 搭建本地 AI 开发工作流可以分为四个步骤：(1) **环境准备**：安装 Ollama → 拉取适合的模型（推荐 `qwen2.5:7b` 用于中文项目，`llama3.2:3b` 用于轻量级测试）→ 验证 `ollama run qwen2.5:7b` 可以正常对话。(2) **API 集成**：使用 openai-python 库，配置 `base_url="http://localhost:11434/v1"`，编写 LLM 调用代码。此时可以开发 RAG 检索、Agent 工具调用、多轮对话等核心逻辑，无需担心 API 费用。(3) **多模型测试**：用 `ollama pull` 拉取多个模型（如 `qwen2.5:14b`、`deepseek-r1:8b`），编写 A/B 测试脚本对比不同模型在同一任务上的表现，选择最优模型后再切换到云端。(4) **环境切换**：通过配置文件（如 `.env` 或 pydantic Settings）管理 `BASE_URL` 和 `API_KEY`，开发环境指向 Ollama，生产环境指向云端 API，实现一键切换。

完整的本地开发工作流示例：编写一个 FastAPI 服务，定义 `/chat` 端点，使用 `AsyncOpenAI` 异步调用 Ollama。在开发阶段，用 `ollama run` 在终端直接测试 Prompt 效果，确定最佳 Prompt 模板后写入代码。调试阶段，Ollama 的本地调用不受频率限制，可以反复调整参数无成本。当核心功能稳定后，将 `BASE_URL` 改为云端 API 地址进行集成测试，验证云端模型的表现是否一致。最后，部署到服务器时，可以选择保留 Ollama（小规模、低成本）或切换到 vLLM/云 API（大规模、高性能）。

关键注意事项：(1) 本地模型和云端模型的行为可能不完全一致，上线前务必用云端模型重新测试；(2) 本地开发时注意模型版本管理，记录使用的模型名称和量化版本（如 `qwen2.5:7b-q4_k_m`），确保可复现；(3) 如果本地硬件不足以运行目标模型，可以先用 Ollama 运行小模型（如 `llama3.2:3b`）验证逻辑，确认后再在云端用大模型测试效果。