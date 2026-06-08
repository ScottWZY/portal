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
**详细答案：** Ollama 是我们团队每天早上打开终端第一个敲的命令。核心优势就是简单到令人发指——`ollama pull qwen2.5:7b` 一条命令就搞定，自动选择最佳量化级别、自动 GPU 加速、自动暴露 OpenAI 兼容 API（http://localhost:11434/v1）。我们开始做原型的时候，直接用 openai-python 客户端把 `base_url` 指向 Ollama，之前写给 OpenAI 的代码一行都不用改，跑通之后再切回云端，开发效率提升了很多。

最适合三个场景：(1) 本地开发和调试——我们改 prompt 模板、测 RAG 效果、调 Agent 逻辑，全在本地 Ollama 上折腾，不受限流、不花钱。我们算过，如果没有 Ollama，团队成员每人每天 Debug 调用几十次 API，光开发阶段的 API 费用就得好几百。(2) 数据敏感 PoC——有些客户的数据不能出内网，我们先用 Ollama 在客户内网部署演示环境，证明方案可行后，再上生产级 vLLM 部署。(3) 学习和实验——想玩一下新的 embedding 策略或 chain 编排，Ollama 是最快最不伤钱包的方式。

但一提到生产就暴露短板了。并发一超过 5 个，P99 延迟能从 2 秒飙到 8 秒——因为它底层是 llama.cpp，没有 PagedAttention 和 Continuous Batching 这些优化，KV Cache 浪费严重，GPU 利用率不到 50%。而且不支持多 GPU 分布式推理，大模型跑不了。所以我们的规则是：Ollama 管开发和小规模，vLLM 管生产，不越界。

### Q2: 如何通过代码调用 Ollama 的 API？它与 OpenAI API 的兼容性如何？
**详细答案：** 我们团队几乎所有人的开发流程都是这样：打开 Ollama -> 用 OpenAI Python SDK 调 Ollama 本地 API 开发 -> 写完之后改两行配置切到 OpenAI 生产 API。兼容性做得非常好，Ollama 在 11434 端口同时暴露原生 API 和 OpenAI 兼容 API（`/v1/chat/completions`），你用 `openai.OpenAI(base_url="http://localhost:11434/v1", api_key="any")` 就行，`chat.completions.create()` 的调用格式完全一致，streaming、temperature、max_tokens 都支持。

但要注意，兼容是大部分兼容而不是 100%。OpenAI 的高级功能比如 `response_format`（structured outputs）、`tools`（function calling）、`logprobs` 在 Ollama 上有些模型不支持或者行为不一致。我们有一次在本地用 Ollama 的 qwen2.5:7b 调 `tools` 功能，发现它不会按预期格式返回 tool call，排查了半天发现是模型本身能力有限，不是 Ollama 的问题。后来换成 deepseek-r1:8b 就好了。

还有一个接口细节：`/v1/embeddings` 也支持，我们用 `text-embedding-3-small` 的替代方案就是本地用 Ollama 的 embedding 模型跑测试，效果接近。所以我们的开发规范是：核心逻辑（对话、embedding、chain 编排）在 Ollama 上开发和测试 -> 通过后切到 OpenAI API 做最终验证 -> 上线。这样代码不用动，只需切 `base_url`。

### Q3: GGUF 格式是什么？Q4_K_M 和 Q8_0 等不同量化级别的区别和取舍是什么？
**详细答案：** GGUF 就是 llama.cpp 和 Ollama 用的模型格式，我们也算天天接触。它把所有东西（权重、分词器、模型配置、量化参数）打包在一个文件里，自包含的，不需要额外的配置文件。Ollama 的 `ollama pull` 拉下来的就是 GGUF 格式。

Q4_K_M 是我们团队最常用的，它是 4-bit 量化，K 代表 K-quant（不同层用不同的量化精度——Attention 层精一点，前馈层可以激进一些），M 是中等大小的模型。Qwen2.5-7B 用 Q4_K_M 大概是 4.5GB，在 4090 上轻松跑，而且质量损失极小（基准测试掉不到 1%）。Q5_K_M 质量稍微好一点点，但文件大了 30%，对我们来说不值得——4.5GB 和 6GB 的成本差距在用户体验上几乎分辨不出来。Q8_0 是 8-bit 量化，接近 FP16 质量但文件也是翻倍大，基本上只在我们做基准测试或者最终验证效果时才用。

我的建议很简单：日常开发用 Q4_K_M，兼顾速度和质量；测试模型极限用 Q8_0 或 F16；不要盲目追求高精度——从 Q4 到 Q8 质量提升很小，但显存和速度代价很大。Ollama 默认就是 Q4_K_M，如果没特殊需要不用改。然后用 `ollama list` 能看到所有已下载模型及其量化版本，管理起来也很清晰。

### Q4: Ollama 和 vLLM 的使用边界是什么？什么时候应该从 Ollama 切换到 vLLM？
**详细答案：** 我们团队的切换信号很明确：当并发超过 5 个用户同时用，Ollama 就开始吃力了。具体来说，我们测过的数据——Qwen2.5-7B 在 4090 上，Ollama 1 个并发 P50 延迟 1.2 秒、P99 2 秒；5 个并发 P99 就飙到 8 秒。vLLM 同样的模型，5 个并发 P99 只有 1.5 秒，30 个并发才 2.5 秒。差距就是因为 vLLM 的 PagedAttention 和 Continuous Batching 能更高效地利用 GPU 和 KV Cache。

切换时机我们总结了三条：(1) 并发 > 5，必须切；(2) 需要批量处理（比如每晚批量跑几千条数据），Ollama 吞吐量太差；(3) 显存紧张——Ollama 的显存利用效率低，同样的模型比 vLLM 多占 30-40% 显存用于 KV Cache 浪费。还有一个隐性指标：当你开始操心监控和告警时，就说明该上 vLLM 了，因为 Ollama 几乎没有生产级的可观测性。

但要提醒的是，不要过早优化。我们之前有个内部工具一天才 100 次调用，完全没必要上 vLLM，Ollama 稳稳当当跑了一年了。很多项目的问题不是选错了工具，而是在不需要复杂方案的时候硬上复杂方案。小团队、低并发、轻量场景，Ollama 完全够用。

### Q5: 在本地开发环境中，如何使用 Ollama 搭建完整的 AI 应用开发工作流？
**详细答案：** 我们团队的开发流程已经标准化成四步。第一步环境准备——装好 Ollama，`ollama pull qwen2.5:7b`（中文场景最佳性价比），多拉几个备用（deepseek-r1:8b 测推理逻辑、phi4:14b 测英文场景）。第二步本地编码——用 openai-python SDK 指向 `localhost:11434/v1`，写 RAG、Agent、对话管理代码，随便调、不花钱、不限速。我经常一次 Debug 循环调 50+ 次 API，如果是调用 OpenAI 的话一次 Debug 就得烧好几美元。第三步多模型对比——用同一个测试集对 juan 几个候选模型（qwen2.5:7b、deepseek-r1:8b、llama3.2:3b）做 A/B 测试，选最优的切到云端。

第四步环境切换——用环境变量控制 `BASE_URL` 和 `MODEL_NAME`，本地指向 Ollama、线上指向 OpenAI 或自建 vLLM。我们还在测试环境保留了一个 Ollama 实例，有些临时需求不想走付费 API 的就直接调它。关键注意事项：(1) Ollama 本地模型和 OpenAI 云端模型的行为可能有差异（比如 tool calling 支持程度），上线前必须用目标模型重新验证；(2) 记录模型版本（如 `qwen2.5:7b-q4_k_m`），确保可复现；(3) 如果本地硬件跑不动目标模型，先用 3B 小模型验证代码逻辑，再到云端用大模型出效果——逻辑是一样的，只是回答质量不同。