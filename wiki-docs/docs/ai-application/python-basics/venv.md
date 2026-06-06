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

## 六、面试重点

::: warning 高频考点
1. **为什么需要虚拟环境？** 解决依赖冲突问题
2. **venv 和 conda 的区别？** venv 是 Python 内置，conda 是 Anaconda 的包管理，支持多 Python 版本
3. **Poetry 和 pip 的区别？** Poetry 有依赖锁定和更好的依赖解析
4. **requirements.txt 里 `==` 和 `~=` 有什么区别？** `==` 精确版本，`~=` 允许兼容更新
:::