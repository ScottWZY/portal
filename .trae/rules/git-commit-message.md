---
alwaysApply: true
scene: git_message
---

# Git 提交信息规范 / Git Commit Message Convention

## 1. 忽略文件规则 / Ignore File Rules

提交时**必须排除**以下类型的文件，不得将其加入暂存区：
The following file types **MUST be excluded** from staging:

- `.gitignore` 中列出的所有文件和目录
- `.vitepress/cache/`、`.vitepress/dist/` — VitePress 构建产物
- `node_modules/` — 依赖目录
- `dist/`、`build/`、`target/`、`out/` — 打包输出
- `.env*` — 环境变量文件
- `.uploads/` — 上传文件
- `.idea/`、`.vscode/` — IDE 配置
- `*.log`、`*.tmp`、`*.cache` — 日志和临时文件

在执行 `git add` 前，必须确认不包含上述文件。使用 `git add <具体文件路径>` 逐个添加，**禁止**使用 `git add .` 或 `git add -A`。

## 2. 分批提交策略 / Batch Commit Strategy

按**任务/功能维度**分批次提交，每个提交只包含一个逻辑单元的改动：
Commit in batches by **task/feature dimension**. Each commit should contain only one logical unit of change:

- 每个功能点或任务独立一次提交
- 不同功能的改动不得混在同一个提交中
- 同一功能涉及多文件修改应合并在一次提交中
- 如果一次改动涉及多个功能，需拆分为多次提交

示例 / Example:
```
✅ 正确：按功能拆分提交
  commit 1: 新增 .gitignore 配置文件
  commit 2: 添加项目文档结构
  commit 3: 配置 VitePress 站点

❌ 错误：混合提交
  commit 1: 新增 gitignore、文档和配置（混合了多个功能）
```

## 3. 提交信息格式 / Commit Message Format

提交信息必须包含**中英文双语注释**，格式如下：
Commit messages **MUST** include bilingual (Chinese + English) annotations:

```
<type>(<scope>): <中文描述> | <English description>

<可选的详细说明（中文）>
<Optional detailed description (English)>
```

### 3.1 Type 类型说明 / Type Definitions

| Type | 中文含义 | English Meaning |
|------|---------|-----------------|
| feat | 新功能 | New feature |
| fix | 修复缺陷 | Bug fix |
| docs | 文档变更 | Documentation change |
| style | 代码格式（不影响逻辑） | Code style (no logic change) |
| refactor | 重构（非新功能、非修复） | Refactoring |
| perf | 性能优化 | Performance improvement |
| test | 测试相关 | Test related |
| chore | 构建/工具变更 | Build/tool change |
| ci | CI 配置变更 | CI configuration change |

### 3.2 Scope 范围 / Scope

scope 表示影响范围，使用模块或目录名，如：
Scope indicates the affected area, using module or directory name:

- `wiki-docs` — 文档站点
- `gitignore` — Git 忽略配置
- `config` — 项目配置
- `deps` — 依赖管理

### 3.3 提交信息示例 / Commit Message Examples

```
feat(wiki-docs): 新增 AI 应用文档页面 | Add AI application doc page

添加 RAG 和向量数据库相关文档，包含架构图和代码示例。
Add RAG and vector database docs with architecture diagrams and code examples.
```

```
fix(gitignore): 修复缓存目录未被忽略的问题 | Fix cache dirs not ignored

将 .vitepress/cache 和 dist 目录加入忽略规则。
Add .vitepress/cache and dist directories to ignore rules.
```

```
chore(deps): 升级 VitePress 到最新版本 | Upgrade VitePress to latest version
```

## 4. 提交前检查清单 / Pre-commit Checklist

每次提交前必须确认：

- [ ] 暂存文件中不包含 `.gitignore` 列出的文件
- [ ] 本次提交只包含一个功能/任务的改动
- [ ] 提交信息包含中英文双语描述
- [ ] 提交信息格式符合 `<type>(<scope>): <中文> | <English>` 规范
- [ ] 使用 `git add <具体文件>` 而非 `git add .`
