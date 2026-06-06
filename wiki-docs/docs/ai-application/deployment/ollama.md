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

## 七、面试重点

::: warning 高频考点
1. **Ollama 的核心优势是什么？** 适合什么场景？
2. **如何用 Ollama 的 API 调用本地模型？** 兼容什么格式？
3. **GGUF 格式是什么？** Q4_K_M 和 Q8_0 的区别？
4. **Ollama 和 vLLM 的使用边界？** 什么时候切换？
:::