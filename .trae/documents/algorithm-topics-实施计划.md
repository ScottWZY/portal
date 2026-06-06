# 算法专题 + 高频面试题 完善实施计划

> **创建日期：** 2026-06-06  
> **计划类型：** 知识库扩展与内容构建  
> **目标模块：** 新增 `wiki-docs/docs/algorithm-topics/` + 扩展 `wiki-docs/docs/interview/algorithm/`

---

## 一、任务概述

### 1.1 背景

当前项目「高级工程师面试 Wiki」已有完善的 Java 高级、Spring 生态、数据库、高并发、AI 应用等模块，但**算法知识的组织方式偏重"刷题"视角**：

- `interview/algorithm/index.md` — 刷题策略指南（如何刷题、刷题计划）
- `interview/algorithm/hot-questions.md` — Top 50 高频 LeetCode 题（按题型分类的代码题）

**缺失的能力：**
1. **没有算法理论专题**：未从"算法思想"层面系统讲解各类算法（排序、搜索、图论、贪心、DP、ML/DL 等）
2. **没有 AI 算法覆盖**：Transformer、注意力机制、梯度下降、反向传播等 AI 核心算法未涉及
3. **缺少应用场景与原理讲解**：现有题解侧重"怎么做出来"，缺少"为什么用这个算法""在什么场景用"
4. **缺少趣味化解说方案**：现有内容偏学术/应试风格，缺少易懂的类比和故事化解说

### 1.2 目标

构建一个**从经典算法到 AI 算法**的完整知识体系，作为面试 Wiki 中算法能力的"理论纵深"补充：

1. **算法专题（约 30+ 个算法）** — 覆盖排序/搜索/图论/DP/贪心/ML/DL/Transformer 等
2. **高频面试题深化** — 基于现有高频题，补充算法原理视角的深度解析
3. **统一解说框架** — 每个算法遵循固定模板：场景 → 原理 → 趣味解说 → 优缺点
4. **与现有内容互补** — 不重复刷题策略，而是补充"为什么"和"怎么用"

### 1.3 成功标准

- [ ] 新增 `algorithm-topics/` 顶级模块，在首页和导航栏中可见
- [ ] 覆盖 >= 30 个算法，从经典算法到 AI 算法形成完整梯度
- [ ] 每个算法页面包含：应用场景、核心原理、趣味解说、优缺点
- [ ] 现有 `interview/algorithm/hot-questions.md` 中每个题型关联到算法专题页
- [ ] 侧边栏配置完整更新
- [ ] 知识图谱（roadmap.md）中增加算法专题节点

---

## 二、当前状态分析

### 2.1 现有算法相关内容

| 文件 | 当前定位 | 与本次计划的关系 |
|------|----------|-----------------|
| `interview/algorithm/index.md` | 刷题策略指南（三维策略、每日计划、工具推荐） | **保留不变**，作为"怎么刷"的入口 |
| `interview/algorithm/hot-questions.md` | Top 50 高频 LeetCode 题（6 大题型 + 代码示例） | **保留 + 增强**：每个题型增加「算法专题」交叉引用 |
| `interview/index.md` | 面试冲刺总览，算法部分提及"高频题" | 增加「算法专题」入口链接 |
| `ai-application/llm-basics/index.md` | Transformer 心智模型简介 | **不重复**，算法专题中 Transformer 从算法原理角度深入 |

### 2.2 缺失的内容

| 缺失内容 | 说明 |
|----------|------|
| 排序算法专题 | 冒泡/选择/插入/归并/快排/堆排 — 原理、场景、复杂度对比 |
| 搜索算法专题 | 二分查找、BFS、DFS、A* — 应用场景 |
| 图论算法专题 | 最短路径(Dijkstra/Floyd)、拓扑排序、最小生成树 |
| 动态规划专题 | 背包问题、状态转移、最优子结构 — 趣味化解说 |
| 贪心算法专题 | 贪心选择性质、与 DP 的对比 |
| 数据结构专题 | 堆/栈/队列/哈希表/树/图 — 底层实现原理与应用场景 |
| ML 基础算法 | 线性回归、逻辑回归、决策树、SVM、K-Means |
| DL 核心算法 | 梯度下降、反向传播、CNN、RNN/LSTM |
| Transformer 算法 | 自注意力机制、多头注意力、位置编码、编码器-解码器 |
| AI 前沿算法 | 扩散模型、强化学习基础、MoE 混合专家 |

### 2.3 项目结构理解

当前项目是 VitePress 知识库，结构如下：

```
wiki-docs/docs/
├── index.md              # 首页（hero + features）
├── .vitepress/config.js  # 导航栏 + 侧边栏配置
├── guide/                # 学习导航、知识图谱、学习计划
├── java-advanced/        # Java 高级
├── spring-ecosystem/     # Spring 生态
├── database/             # 数据库
├── middleware/           # 中间件
├── high-concurrency/     # 高并发
├── ai-application/       # AI 应用
├── interview/            # 面试冲刺
│   └── algorithm/        # 现有算法刷题内容
├── frontend/             # 前端
└── devops/               # DevOps
```

---

## 三、方案设计

### 3.1 总体架构

新增 `algorithm-topics/` 作为顶级模块，与 `java-advanced/`、`ai-application/` 同级。内部按"经典算法 → 数据结构 → AI 算法"三阶段递进组织。

```
algorithm-topics/
├── index.md                    # 算法专题总览（知识图谱 + 学习路径）
├── classic-algorithms/         # 经典算法
│   ├── index.md                # 经典算法概览
│   ├── sorting/                # 排序算法
│   │   ├── index.md            # 排序算法全景对比
│   │   ├── bubble-sort.md      # 冒泡排序
│   │   ├── quick-sort.md       # 快速排序
│   │   ├── merge-sort.md       # 归并排序
│   │   └── heap-sort.md        # 堆排序
│   ├── searching/              # 搜索算法
│   │   ├── index.md            # 搜索算法全景
│   │   ├── binary-search.md    # 二分查找
│   │   ├── bfs.md              # 广度优先搜索
│   │   └── dfs.md              # 深度优先搜索
│   ├── graph/                  # 图论算法
│   │   ├── index.md            # 图论概览
│   │   ├── shortest-path.md    # 最短路径(Dijkstra/Floyd)
│   │   ├── topological-sort.md # 拓扑排序
│   │   └── mst.md              # 最小生成树
│   ├── dynamic-programming/    # 动态规划
│   │   ├── index.md            # DP 思想与方法论
│   │   ├── knapsack.md         # 背包问题
│   │   └── lis-lcs.md          # LIS & LCS
│   ├── greedy/                 # 贪心算法
│   │   └── index.md            # 贪心策略与证明
│   └── backtracking/           # 回溯算法
│       └── index.md            # 回溯模板与剪枝
├── data-structures/            # 数据结构专题
│   ├── index.md                # 数据结构全景
│   ├── heap.md                 # 堆（优先队列）
│   ├── hash-table.md           # 哈希表
│   ├── tree.md                 # 树（BST/AVL/红黑树/B+树）
│   └── graph-structure.md      # 图的存储与遍历
├── ml-algorithms/              # 机器学习算法
│   ├── index.md                # ML 算法全景
│   ├── linear-regression.md    # 线性回归
│   ├── logistic-regression.md  # 逻辑回归
│   ├── decision-tree.md        # 决策树与随机森林
│   ├── svm.md                  # 支持向量机
│   └── kmeans.md               # K-Means 聚类
├── dl-algorithms/              # 深度学习算法
│   ├── index.md                # DL 算法全景
│   ├── gradient-descent.md     # 梯度下降与优化器
│   ├── backpropagation.md      # 反向传播
│   ├── cnn.md                  # 卷积神经网络
│   ├── rnn-lstm.md             # RNN/LSTM/GRU
│   └── transformer.md          # Transformer 架构详解
└── ai-frontier/                # AI 前沿算法
    ├── index.md                # 前沿算法概览
    ├── attention-mechanism.md  # 注意力机制深度解析
    ├── diffusion-model.md      # 扩散模型（Stable Diffusion）
    └── reinforcement-learning.md # 强化学习基础（RLHF）
```

### 3.2 页面内容模板

每个算法页面严格遵循统一模板，确保一致性和可读性：

```markdown
# 算法名称

> 创建日期：YYYY-MM-DD
> 难度：⭐ / ⭐⭐ / ⭐⭐⭐
> 前置知识：xxx

## ⭐ 面试重点速览
[表格：考察点 | 重要程度 | 考察频率 | 掌握目标]

## 一、应用场景 🎯
[2-3 个真实世界的应用场景，说明"什么情况下用这个算法"]
- 场景1：具体描述 + 为什么选这个算法
- 场景2：具体描述 + 为什么选这个算法

## 二、核心原理 🔬
[图解 + 文字说明，由浅入深解释算法如何工作]
- 核心思想（一句话）
- 逐步拆解（分步骤讲解）
- 可视化流程图（Mermaid）

## 三、趣味解说 🎭
[用类比/故事/生活化场景让算法变得易懂]
- 生活类比（把算法比作日常生活中的场景）
- 图解故事（用角色和场景串联算法步骤）

## 四、代码实现 💻
[核心代码（Java/Python），关键行加注释]
- 最简实现（展示核心逻辑）
- 时间复杂度分析

## 五、优缺点 ⚖️
[清晰的对比表格]
| 优点 | 缺点 |
|------|------|
| xxx | xxx |

## 六、面试高频题 📝
[关联到 interview/algorithm/hot-questions.md 中的具体题目]
- LeetCode xxx：xxx
- 考察点：xxx

## 七、常见误区 ❌
[面试中常见的理解偏差和踩坑点]
```

### 3.3 趣味解说方案设计

为每个算法设计一套"解说锚点"，让抽象算法变得生动：

| 算法 | 生活类比 | 可视化手法 |
|------|---------|-----------|
| 冒泡排序 | 气泡从水底升到水面，大的气泡先浮上来 | 一排身高不同的学生两两换位 |
| 快速排序 | 军训排队，选一个"基准兵"，比他矮的站左边，高的站右边 | 分治树 + 递归动画 |
| 二分查找 | 在字典里查一个单词，翻到中间，看字母在前半还是后半 | 猜数字游戏（1-100） |
| BFS | 从一棵树的根开始，一层一层地浇水，水慢慢浸透每一层 | 朋友圈扩散（一度人脉→二度人脉） |
| DFS | 走迷宫，一直走到死胡同才回头 | 深度探险，不撞南墙不回头 |
| 动态规划 | 记笔记 —— 把算过的结果写在纸上，避免重复计算 | 爬楼梯，每次可以走 1 或 2 步 |
| Dijkstra | 导航软件：从起点出发，每次选择当前最近的城市扩展 | 地图上的"最短路径光环"扩散 |
| 梯度下降 | 蒙着眼睛下山，每次都往脚底最陡的方向走一步 | 3D 山谷地形，小球滚落 |
| 反向传播 | 考试后分析错题，把错误原因归因到每个知识点 | 纠错链：输出→中间层→输入 |
| 注意力机制 | 读一篇文章时，你的眼睛会聚焦在关键词上 | 聚光灯照在重要单词上 |
| CNN | 用放大镜一块一块地观察图片，每块提取一种特征 | 滑动窗口 + 特征滤镜 |
| Transformer | 全班同学同时互相传纸条，每个人都能看到所有人的纸条 | 全连接注意力矩阵 |

### 3.4 与现有内容的融合

```
首页 (index.md)
├── features 新增卡片：「🧮 算法专题」
│
导航栏 (config.js)
├── 新增：「算法专题」 → /algorithm-topics/
│
侧边栏 (config.js)
├── 新增 '/algorithm-topics/' 分组
│
面试模块 (interview/index.md)
├── 算法部分增加「算法专题」入口链接
│
高频题 (interview/algorithm/hot-questions.md)
├── 每个题型末尾增加「📚 深入理解：[算法专题/xxx]」
│
知识图谱 (guide/roadmap.md)
├── 新增「算法与数据结构」知识域节点
│
学习计划 (guide/plan.md)
├── 第13周算法刷题冲刺中关联算法专题
```

---

## 四、实施步骤

### 步骤 1：创建目录结构与索引页

创建 `algorithm-topics/` 目录树，编写 `index.md` 总览页。

**文件清单：**
- `algorithm-topics/index.md` — 算法专题总览（知识图谱 + 学习路径 + 模块导航）
- 6 个子目录的 `index.md`（概览页）

**输出要求：**
- 总览页包含 Mermaid 知识图谱，展示"经典算法 → 数据结构 → ML → DL → AI 前沿"的学习路径
- 每个子目录的 index.md 包含该领域的算法对比总表

### 步骤 2：经典算法内容编写（排序 + 搜索 + 图论）

按"优先级高 → 中"顺序编写，每个算法一个页面。

**文件清单（12 个页面）：**

| 优先级 | 文件 | 算法 |
|--------|------|------|
| 高 | `classic-algorithms/sorting/index.md` | 排序算法全景对比 |
| 高 | `classic-algorithms/sorting/quick-sort.md` | 快速排序 |
| 高 | `classic-algorithms/sorting/merge-sort.md` | 归并排序 |
| 高 | `classic-algorithms/sorting/heap-sort.md` | 堆排序 |
| 高 | `classic-algorithms/sorting/bubble-sort.md` | 冒泡排序 |
| 高 | `classic-algorithms/searching/binary-search.md` | 二分查找 |
| 高 | `classic-algorithms/searching/bfs.md` | BFS |
| 高 | `classic-algorithms/searching/dfs.md` | DFS |
| 中 | `classic-algorithms/graph/shortest-path.md` | 最短路径 |
| 中 | `classic-algorithms/graph/topological-sort.md` | 拓扑排序 |
| 中 | `classic-algorithms/graph/mst.md` | 最小生成树 |
| 中 | `classic-algorithms/searching/index.md` | 搜索算法全景 |
| 中 | `classic-algorithms/graph/index.md` | 图论概览 |

### 步骤 3：算法思想专题（DP + 贪心 + 回溯）

| 优先级 | 文件 | 内容 |
|--------|------|------|
| 高 | `classic-algorithms/dynamic-programming/index.md` | DP 四步法 + 状态转移方程设计 |
| 高 | `classic-algorithms/dynamic-programming/knapsack.md` | 背包问题（0-1/完全/多重） |
| 高 | `classic-algorithms/dynamic-programming/lis-lcs.md` | LIS & LCS |
| 中 | `classic-algorithms/greedy/index.md` | 贪心选择性质与 DP 对比 |
| 中 | `classic-algorithms/backtracking/index.md` | 回溯模板 + 剪枝策略 |

### 步骤 4：数据结构专题

| 优先级 | 文件 | 内容 |
|--------|------|------|
| 高 | `data-structures/index.md` | 数据结构全景 + 复杂度速查 |
| 高 | `data-structures/heap.md` | 堆（二叉堆/斐波那契堆）+ Top K 问题 |
| 高 | `data-structures/hash-table.md` | 哈希表原理 + 哈希冲突解决 |
| 中 | `data-structures/tree.md` | BST/AVL/红黑树/B+树对比 |
| 中 | `data-structures/graph-structure.md` | 邻接矩阵/邻接表 + 遍历 |

### 步骤 5：ML 算法专题

| 优先级 | 文件 | 内容 |
|--------|------|------|
| 中 | `ml-algorithms/index.md` | ML 算法全景 + 分类/回归/聚类 |
| 中 | `ml-algorithms/linear-regression.md` | 最小二乘法 + 梯度下降求解 |
| 中 | `ml-algorithms/logistic-regression.md` | Sigmoid + 交叉熵损失 |
| 中 | `ml-algorithms/decision-tree.md` | 信息增益 + 剪枝 + 随机森林 |
| 低 | `ml-algorithms/svm.md` | 最大间隔 + 核技巧 |
| 低 | `ml-algorithms/kmeans.md` | 聚类 + 肘部法则 |

### 步骤 6：DL 核心算法专题

| 优先级 | 文件 | 内容 |
|--------|------|------|
| 高 | `dl-algorithms/index.md` | DL 算法全景 + 神经网络基础 |
| 高 | `dl-algorithms/gradient-descent.md` | SGD/Momentum/Adam 优化器对比 |
| 高 | `dl-algorithms/backpropagation.md` | 链式法则 + 计算图 |
| 高 | `dl-algorithms/transformer.md` | 自注意力 + 多头注意力 + 位置编码 |
| 中 | `dl-algorithms/cnn.md` | 卷积/池化/全连接 + 经典架构 |
| 中 | `dl-algorithms/rnn-lstm.md` | 序列建模 + 梯度消失/爆炸 |

### 步骤 7：AI 前沿算法专题

| 优先级 | 文件 | 内容 |
|--------|------|------|
| 中 | `ai-frontier/index.md` | 前沿算法概览 + 面试趋势 |
| 中 | `ai-frontier/attention-mechanism.md` | 注意力机制深度拆解（从 Seq2Seq 到 Transformer） |
| 低 | `ai-frontier/diffusion-model.md` | 扩散模型原理（Stable Diffusion 背后的算法） |
| 低 | `ai-frontier/reinforcement-learning.md` | RL 基础 + RLHF 与 LLM 对齐 |

### 步骤 8：修改配置与现有内容融合

**修改文件：**
1. `wiki-docs/docs/index.md` — 首页 features 新增「🧮 算法专题」卡片
2. `wiki-docs/docs/.vitepress/config.js`：
   - 导航栏新增「算法专题」
   - 侧边栏新增 `/algorithm-topics/` 完整配置
3. `wiki-docs/docs/guide/roadmap.md` — 知识图谱新增算法专题节点
4. `wiki-docs/docs/interview/index.md` — 算法部分增加算法专题入口
5. `wiki-docs/docs/interview/algorithm/hot-questions.md` — 每个题型末尾增加深入链接

### 步骤 9：验证与收尾

- [ ] 所有页面可正常渲染（VitePress dev server 验证）
- [ ] 所有链接可正确跳转（无死链）
- [ ] 每个算法页面包含完整模板（场景/原理/解说/优缺点）
- [ ] 侧边栏导航层级正确
- [ ] Mermaid 图表可正常渲染

---

## 五、关键决策

### 5.1 为什么新增独立模块而非扩展现有 interview/algorithm？

| 维度 | 扩展现有模块 | 新增独立模块（✅ 推荐） |
|------|------------|---------------------|
| 定位 | 算法 = 刷题，认知局限 | 算法 = 思想 + 工具 + 应用，认知完整 |
| 导航 | 隐藏在面试冲刺下，不易发现 | 顶级入口，与 Java/AI 等模块同级 |
| 内容量 | 30+ 页面塞入 interview/ 会臃肿 | 独立模块，结构清晰 |
| 复用性 | 仅服务于面试场景 | 可用于日常学习、技术分享等多种场景 |

### 5.2 为什么从经典算法到 AI 算法全覆盖？

面试 Wiki 的目标用户是"高级工程师 + AI 应用工程师"，面试中：
- 经典算法是基础门槛（尤其是大厂算法面）
- AI 算法是差异化竞争力（AI 应用岗必问）
- 两者形成完整梯度，体现"从基础到前沿"的技术深度

### 5.3 为什么用"趣味解说"而非纯技术讲解？

1. **降低认知负荷**：抽象算法通过生活类比更容易形成长期记忆
2. **面试表达优势**：面试中能用类比解释算法，是高级工程师的加分项
3. **差异化体验**：全网技术文档千篇一律，趣味化解说形成独特记忆点

---

## 六、假定与约束

1. **内容语言**：所有新页面使用中文
2. **代码语言**：经典算法使用 Java，AI 算法使用 Python（与项目整体风格一致）
3. **图表**：使用 Mermaid 语法绘制流程图和知识图谱
4. **不重复现有内容**：不重写 LeetCode 题解，只做原理讲解和交叉引用
5. **与 AI 应用模块的边界**：AI 应用模块侧重"工程落地"（如何用 RAG、Agent），算法专题侧重"算法原理"（Transformer 为什么这样设计、梯度下降的数学直觉）
6. **页面长度**：每个算法页面控制在 200-400 行，确保可读性