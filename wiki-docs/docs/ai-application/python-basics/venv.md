# Python 虚拟环境与包管理

> **创建日期：** 2026-06-06
> **前置知识：** Python 基础

---

## 一、为什么需要虚拟环境？

不同项目需要不同版本的依赖包，虚拟环境隔离依赖，避免冲突。类比 Java 的 Maven/Gradle 依赖隔离。

---

## 二、venv （Python 内置）

```bash
# 创建虚拟环境（在项目根目录）
python -m venv venv

# Windows 激活
venv\Scripts\activate

# 退出虚拟环境
deactivate
```

激活后，`python` 和 `pip` 命令都使用虚拟环境中的版本。

---

## 三、pip 使用

```bash
# 安装依赖
pip install requests openai pydantic fastapi

# 安装特定版本
pip install openai==1.50.0

# 查看已安装
pip list

# 导出 requirements.txt
pip freeze > requirements.txt

# 从 requirements.txt 安装
pip install -r requirements.txt

# 升级 pip
python -m pip install --upgrade pip
```

---

## 四、Poetry（现代包管理）

Poetry 比 pip + venv 更优雅，推荐用于新项目。

```bash
# 安装 Poetry（Windows）
(Invoke-WebRequest -Uri https://install.python-poetry.org -UseBasicParsing).Content | py -

# 初始化项目
poetry init

# 创建虚拟环境
poetry env use python3.11

# 安装依赖
poetry add requests openai

# 开发依赖（仅开发环境）
poetry add --dev pytest black

# 激活虚拟环境
poetry shell

# 查看依赖树
poetry show --tree

# 导出 requirements.txt
poetry export -f requirements.txt --output requirements.txt
```

**对比 pip + venv**：

| 特性 | pip + venv | Poetry |
|------|------------|--------|
| 依赖锁定 | 依赖文件无版本锁定 | 自动锁定到具体版本（poetry.lock） |
| 依赖解析 | 弱 | 强，自动解决冲突 |
| 项目管理 | 无 | 整合项目配置和依赖管理 |
| 学习曲线 | 简单 | 中等 |

---

## 五、最佳实践

1. **每个项目一个虚拟环境**，不要全局安装依赖
2. **提交代码不提交虚拟环境目录**（`.gitignore` 添加 `venv/`）
3. **提交 `poetry.lock` 或 `requirements.txt`**，保证环境可复现
4. **开发环境用 Poetry，生产环境用 pip + requirements**
5. **不要用 `sudo pip install`**，会污染系统 Python

---

## 面试高频题

### Q1: 为什么需要虚拟环境？虚拟环境的工作原理是什么？
**详细答案：** 我们团队有三个人同时在写三个 AI 项目——客服 Bot 用 `langchain==0.2.0`、代码助手用 `langchain==0.3.0`、RAG 评估工具用 `langgraph==0.1.0`。这三个包的依赖链条不完全兼容——0.2 和 0.3 的 `pydantic` 版本要求就不一样。如果全装在一台机器上全局 site-packages 里，pip 会"帮你"把所有包升到最高能兼容的版本，结果就是三个项目全部以某种微妙的方式出 bug——客服 Bot 的 Chain 不工作了，提示符不显示，排查了一整天最后发现是 pydantic 被静默升级了，`BaseModel` 的行为变了。从那之后就铁律：一个项目一个 venv，绝不全局安装。

底层原理其实就两步。`python -m venv venv` 在你的项目目录下创建了一个独立的小 Python 世界——复制/链接了 Python 解释器、创建了空的 `Lib/site-packages`、写了一个 `pyvenv.cfg` 标记 `include-system-site-packages = false`。激活（activate）就是把虚拟环境的 bin 目录插到 PATH 最前面，这样 `python` 和 `pip` 就指向虚拟环境里的版本了。我们 Dify 部署时 Docker 里每个服务一个独立容器其实就是虚拟环境思想的终极形态——每个容器就是超级隔离的"venv"。我们项目 `.gitignore` 永远有 `venv/` 和 `.venv/`，只提交 `requirements.txt` 或 `poetry.lock`，新人 git clone 后 `pip install -r requirements.txt` 五分钟就能跑起来。

### Q2: venv 和 conda 的核心区别是什么？各适用于什么场景？
**详细答案：** 我们团队 AI 后端服务全部用 venv + Poetry，训练服务器上用 conda。选型原因很直接——AI 应用开发 90% 的依赖都是纯 Python 包（openai、fastapi、langchain），venv 完全够用，一个环境大概 15MB，创建只需 2 秒。而 conda 的一个 base 环境装下来就是 2-3GB，太重了。但遇到 GPU 训练的部署，venv 就不行了——你装 `torch` with CUDA 支持的时候，venv 不管理 CUDA Toolkit 和 cuDNN，系统的 CUDA 版本一升级或者不同项目要求不同 CUDA 版本（我们训练用 CUDA 12.1、推理用 CUDA 11.8），venv 就炸了。这时候 conda 的优势就体现出来了——`conda install cudatoolkit=11.8` 直接锁定 CUDA 版本，不需要碰系统库。

我们踩过一个 conda 和 venv 混用的坑。一个同事在 conda 环境里又 `python -m venv venv` 创建了一个内层 venv，结果内层 venv 继承了 conda 的部分包又没继承全，`import torch` 时报 `libcublas.so` 找不到，排查了四个小时才定位到是嵌套环境导致的库路径混乱。现在的规范就一条：AI 应用后端用 Poetry（底层是 venv），LLM 训练/推理环境用 conda，两者绝不混用。conda 另有一个好处是可以独立管理 Python 版本——我们的 BGE 模型 v1 要求 Python 3.9，v2 要求 3.11，conda 可以并存，venv 做不到。

### Q3: Poetry 相比 pip + venv 的优势是什么？什么时候应该选用 Poetry？
**详细答案：** 我们项目从 pip + venv 迁到 Poetry 的原因是依赖冲突。LangChain 0.2 要求 `pydantic>=2.0,<2.6`，我们另一个内部工具包又要求 `pydantic>=2.5`，pip 直接装了 pydantic 2.6，结果 LangChain 运行时报了 `AttributeError`。原因就是 pip 的依赖解析是"最后写入者胜出"——先装 A 的依赖再装 B 的依赖，B 的版本覆盖了 A 需要的，pip 不会告诉你冲突。Poetry 用 SAT 求解器在安装前就解析所有依赖约束，发现有冲突就直接报错告诉你"A 要 pydantic <2.6，但 B 要 pydantic >=2.5，当前 pydantic 2.6 不满足"，你再手动解决。这个功能在依赖超过 50 个包之后简直是救命级。

`poetry.lock` 是另一个让我觉得很踏实的点。我们用 pip 的时候每次部署 Docker 都可能拉到不同版本的传递依赖（比如某个底层库默默升级了），生产环境偶尔因为这种"幽灵升级"出 bug。Poetry 把所有包的具体版本和哈希锁死在 `poetry.lock` 里，确保开发、测试、生产三个环境装的依赖是逐字节相同的。但 Poetry 也不算完美——跨平台兼容有一些小问题，我们有一次在 macOS 上 `poetry lock` 生成的 lock 文件在 Linux Docker 里报错，因为某个包的 macOS-only 子依赖被锁了进去。现在我们的做法是 CI 的 lock 统一在 Linux 上跑。结论就是：新项目直接上 Poetry，老项目如果依赖不超过 10 个且没出过冲突，不着急迁。

### Q4: requirements.txt 中 `==`、`~=`、`>=` 的区别是什么？生产环境应该用哪种？
**详细答案：** 我们生产被版本号坑过一次之后就有了铁律。那次是 `openai` 库从 1.50 升到 1.51（小版本升级），默认把默认的 timeout 从 600 秒改成了 60 秒，我们的长文档流式输出直接超时了。当时 requirements.txt 写的是 `openai>=1.50`，部署自动拉了 1.51 导致线上挂了两个小时。现在生产 Docker 镜像的 requirements.txt 每个包全部 `==` 精确锁定，绝不允许自动升级。

`~=` 我们用得比较多的是开发阶段。比如 `openai~=1.50.0` 等价于 `>=1.50.0, <1.51.0`，允许你获取这个 minor 版本下的所有补丁修复（bugfix），但不会跳到功能变化的新 minor 版本。这个在开发期比较安全——没功能变更但有 bug 修。`>=` 我们只在自己的内部工具库上用过，这些 API 不轻易变。

分层策略我们现在固定为：开发的 `pyproject.toml`（Poetry）里用 `~=` 或 `^`（caret 约束，允许不破坏 API 的升级），生产 Docker build 用 `poetry export` 导出每个包 `==` 精确版本的 `requirements.txt`。这样既不影响开发期的灵活性，又保证了生产环境的确定性。还有一个容易忽略的点：`pip freeze` 会把传递依赖（间接依赖）也列出来，这些包的版本号你通常不需要管——锁定直接依赖就够了，除非某个传递依赖有已知安全漏洞。我们就是在 CI 里用 `pip-audit` 定期扫 lock 文件里的安全漏洞，扫出来才去单独 pin 那个传递依赖的版本。

### Q5: 如何确保团队中所有开发者的依赖环境一致？有哪些最佳实践？
**详细答案：** 我们团队 5 个人用了三台不同操作系统的机器（两台 macOS、一台 Ubuntu、一台 Windows），一开始环境一致性是个噩梦。有人在 macOS 上跑得好好的，到 Ubuntu CI 上就挂了，排查出来是因为 `chromadb` 在 macOS 和 Linux 上的底层 HNSW 实现调用了不同的二进制库。最后统一用 Poetry 锁定所有平台相关的依赖，CI 单独在 Linux Docker 里跑 lock 更新。

我们现在的规范五条：(1) 提交 `pyproject.toml` + `poetry.lock`，不允许只交 `pyproject.toml` 不交 lock；(2) 项目根目录放一个 `.python-version` 文件写 `3.11.9`，CI 启动时先用 pyenv 切到这个版本；(3) CI 里加一步 `poetry check --lock` 验证 lock 文件和 `pyproject.toml` 是一致的（有人只改了 toml 忘了重新 lock）；(4) 每个月最后一周跑 `poetry update` 做一轮依赖升级，在 CI 上跑全量测试通过后才合并到主分支，这样依赖就不会积累超过一个月的技术债；(5) 内网搭了 devpi 做私有 PyPI 镜像，所有依赖都从内网走，不依赖公网 PyPI，避免某天 PyPI 挂了或者某个包被作者删了导致全组无法工作。这套流程跑了快一年，依赖相关的线上事故从每个月两三次降到了零次。