# 前端专题 — CSS 预处理器 & UI 组件库补充计划

> **创建日期：** 2026-06-08  
> **目标：** 在前端知识专题中补充 CSS 预处理器（Sass/Less）和 Vue 3 UI 组件库（Element Plus）内容  
> **定位：** 技术面覆盖要全，核心关键问题和高频面试题都要有所了解，无需深入掌握

---

## 一、需求概述

### 1.1 当前缺口

经探索，前端专题 8 大模块存在以下关键缺口：

| 缺口 | 说明 | 面试必要性 |
|------|------|-----------|
| **CSS 预处理器** | Sass/Less 的变量、嵌套、Mixin、函数等核心特性未覆盖 | 中高 — CSS 工程化基础能力考察 |
| **Vue 3 UI 组件库** | Element Plus 等 Vue 生态核心 UI 库完全未涉及 | 中高 — 高频实操考点（按需引入、主题定制、表单校验） |

### 1.2 用户需求

> "前端专题缺少了 CSS 流行框架如 sass，以及流行的 UI 框架 element-ui 的内容；要达到技术面掌握得全，无需深入掌握，但核心关键问题和高频面试题都要有所了解"

### 1.3 核心原则

- **覆盖面全**：补充缺失的关键技术点
- **深度适中**：聚焦核心概念、高频面试题、选型对比，不做源码级深入
- **格式对齐**：遵循现有文档规范（面试重点速览表格、代码示例、`::: tip/warning/danger` 提示块）

---

## 二、当前状态分析

### 2.1 现有文件涉及范围

| 模块 | 现有文件数 | 是否涉及 CSS 预处理器 | 是否涉及 UI 组件库 |
|------|-----------|----------------------|-------------------|
| `fundamentals/` | 5 | 否（html-css.md 只覆盖原生 CSS） | 否 |
| `vue-ecosystem/` | 7 | 否 | 否 |
| `engineering/` | 9 | 否（仅覆盖构建工具，未涉及预处理器配置） | 否 |
| `interview/` | 7 | 否 | 否 |

### 2.2 归属分析

| 技术 | 推荐归属 | 理由 |
|------|---------|------|
| **Sass/Less** | `fundamentals/` | 本质是 CSS 的扩展语言，属于前端基础/CSS 核心范畴，非工程化专属 |
| **Element Plus 等 UI 库** | `vue-ecosystem/` | 与 Vue 3 深度绑定，是 Vue 生态从"框架原理"到"工程实践"的关键桥梁 |

---

## 三、实施计划

### 阶段一：新增 `fundamentals/css-preprocessors.md` — CSS 预处理器

**目的：** 覆盖 Sass/Less 核心概念、高频面试题，填补 CSS 工程化基础空白。

**内容大纲：**

```
# CSS 预处理器

## ⭐ 面试重点速览
| 知识模块 | 重点内容 | 面试频率 |
| Sass 变量与嵌套 | $变量、& 父选择器引用、嵌套规则 | 中高 |
| Mixin 与继承 | @mixin/@include、@extend、占位符 % | 中高 |
| 内置函数 | darken/lighten、颜色函数、数学函数 | 中 |
| Less vs Sass | 语法差异、编译方式、生态对比 | 中 |
| 与原生 CSS 对比 | CSS 变量、CSS Nesting、@layer | 中高（趋势） |

---

## 一、为什么需要 CSS 预处理器
  - 原生 CSS 的痛点（无变量/无嵌套/无函数/无模块化）
  - 预处理器解决的四大问题

## 二、Sass（SCSS）核心特性
  ### 2.1 变量：$primary-color、全局 vs 局部
  ### 2.2 嵌套：& 父选择器、属性嵌套、BEM 命名实践
  ### 2.3 Mixin：@mixin/@include、参数与默认值、与 @extend 对比
  ### 2.4 继承：@extend、占位符 %、与 Mixin 的区别
  ### 2.5 内置函数：颜色函数（darken/lighten/mix）、数学函数、字符串函数
  ### 2.6 模块化：@use vs @import、命名空间、私有成员
  ### 2.7 流程控制：@if/@else、@for、@each、@while

## 三、Less 核心特性
  ### 3.1 变量：@变量、延迟加载特性
  ### 3.2 嵌套与 Mixin（与 Sass 语法差异）
  ### 3.3 Less 独有的特性

## 四、Sass vs Less 对比
  - 语法风格（SCSS/Indented vs Less）
  - 编译方式（Dart Sass/node-sass vs Less.js）
  - 功能对比表（变量/嵌套/Mixin/函数/模块化/循环）
  - 生态与选型建议

## 五、预处理器 vs 原生 CSS 新特性
  - CSS 自定义属性（--var）vs Sass 变量（编译时 vs 运行时）
  - CSS Nesting（原生嵌套）vs Sass 嵌套
  - @layer 层叠规则
  - 未来趋势：原生 CSS 能替代预处理器吗？

## 六、面试高频问题
  - Q: Sass 的 @mixin 和 @extend 有什么区别？
  - Q: Sass 变量和 CSS 自定义属性的区别？
  - Q: @use 和 @import 的区别？
  - Q: Less 和 Sass 选哪个？为什么？

::: danger 容易翻车的点
- 分不清 @mixin 和 @extend 的使用场景
- 不知道 Sass 变量是编译时，CSS 变量是运行时
- 还在用 @import 而不是 @use
:::
```

**文件规模：** 约 200-250 行

---

### 阶段二：新增 `vue-ecosystem/element-plus.md` — Vue 3 UI 组件库

**目的：** 覆盖 Element Plus 核心概念、高频面试题，附带 Ant Design Vue / Naive UI 对比。

**内容大纲：**

```
# Element Plus 与 Vue 3 UI 组件库

## ⭐ 面试重点速览
| 知识模块 | 重点内容 | 面试频率 |
| 组件注册 | 全局注册 vs 按需引入（unplugin-vue-components） | 高 |
| 主题定制 | CSS 变量覆盖、SCSS 变量定制、黑暗模式 | 中高 |
| 表单校验 | el-form 校验规则、自定义校验器、动态表单 | 中高 |
| 国际化 | 多语言配置、自定义语言包 | 中 |
| 常用组件 | Table/Form/Dialog/Upload 核心 API 与配置 | 中 |
| 三大 UI 库对比 | Element Plus vs Ant Design Vue vs Naive UI | 中 |

---

## 一、Element Plus 概述
  - Element Plus 的定位（Vue 3 官方推荐 UI 库）
  - Element UI（Vue 2）→ Element Plus（Vue 3）的演进
  - 核心特性：Composition API 友好、TypeScript 支持、Tree Shaking

## 二、组件注册方式
  ### 2.1 全局注册（app.use）
  ### 2.2 按需引入（unplugin-vue-components 自动导入）
  ### 2.3 手动按需引入（对比两种方式）
  - 面试重点：按需引入如何减小打包体积？Tree Shaking 原理

## 三、主题定制
  ### 3.1 CSS 变量覆盖（:root 层面、组件级覆盖）
  ### 3.2 SCSS 变量定制（修改 Element Plus 源码变量）
  ### 3.3 黑暗模式切换（dark CSS 变量 + useDark）
  - 面试重点：如何实现组件库的主题定制？

## 四、表单校验
  ### 4.1 el-form 基础校验（rules + prop）
  ### 4.2 自定义校验器（validator 函数）
  ### 4.3 动态表单校验（v-for 循环表单）
  ### 4.4 与组合式 API 的配合（ref 获取表单实例）
  - 面试重点：Element Plus 表单校验原理？

## 五、国际化
  - 多语言配置、自定义语言包、动态切换语言

## 六、Vue 3 三大 UI 组件库对比
  | 维度 | Element Plus | Ant Design Vue | Naive UI |
  | 企业背景 | 饿了么 | 蚂蚁金服 | 图森未来 |
  | 设计风格 | Material 改良 | Ant Design 体系 | 全新设计 |
  | TypeScript | ✅ | ✅ | ✅ （原生） |
  | Tree Shaking | ✅ | ✅ | ✅ |
  | 组件数量 | 80+ | 70+ | 90+ |
  | 社区活跃度 | 最高 | 高 | 中 |
  - 选型建议

## 七、面试高频问题
  - Q: Element Plus 如何实现按需引入？
  - Q: 如何自定义 Element Plus 的主题？
  - Q: Element Plus 的表单校验如何实现？
  - Q: Element Plus vs Ant Design Vue vs Naive UI 怎么选？

::: danger 容易翻车的点
- 不知道 unplugin-vue-components 的按需引入机制
- 搞不清 CSS 变量覆盖和 SCSS 变量定制的区别
- 表单校验的 validator 函数写不对
:::
```

**文件规模：** 约 200-250 行

---

### 阶段三：更新关联文件

#### 3.1 更新 `fundamentals/index.md`

- 在"前端基础概览"表格中新增一行：`CSS 预处理器 | Sass/Less 核心特性、与原生 CSS 对比`
- 在子模块列表中添加 `[CSS 预处理器](./css-preprocessors)` 链接

#### 3.2 更新 `vue-ecosystem/index.md`

- 在"面试重点速览"表格中新增一行：`UI 组件库 | Element Plus 按需引入/主题定制/表单校验、三大 UI 库对比`
- 在子模块列表中添加 `[Element Plus 组件库](./element-plus)` 链接

#### 3.3 更新 `frontend/index.md`

- 在"前端基础"表格中新增一行 CSS 预处理器
- 在"Vue 3 生态"表格中新增一行 Element Plus
- 在 mermaid mindmap 知识图谱中新增相应节点

#### 3.4 更新 `config.js` 侧边栏

- 在 `/frontend/` 的"前端基础"分组中新增 `{ text: 'CSS 预处理器', link: '/frontend/fundamentals/css-preprocessors' }`
- 在 `/frontend/` 的"Vue 3 生态"分组中新增 `{ text: 'Element Plus 组件库', link: '/frontend/vue-ecosystem/element-plus' }`

---

## 四、文件清单汇总

| 类型 | 文件 | 操作 |
|------|------|------|
| 新增 | `fundamentals/css-preprocessors.md` | 创建（约 200-250 行） |
| 新增 | `vue-ecosystem/element-plus.md` | 创建（约 200-250 行） |
| 更新 | `fundamentals/index.md` | 新增 CSS 预处理器条目 |
| 更新 | `vue-ecosystem/index.md` | 新增 UI 组件库条目 |
| 更新 | `frontend/index.md` | 新增两个子模块的表格行和 mindmap 节点 |
| 更新 | `config.js` 侧边栏 | 新增两个链接 |

---

## 五、验证步骤

1. 确认 `css-preprocessors.md` 和 `element-plus.md` 文件已创建，内容完整
2. 确认 `fundamentals/index.md` 和 `vue-ecosystem/index.md` 已包含新条目
3. 确认 `frontend/index.md` 首页表格和 mermaid 图谱已更新
4. 确认 `config.js` 侧边栏链接正确，启动 VitePress 验证不 404