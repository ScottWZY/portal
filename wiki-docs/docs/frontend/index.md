# 前端

## 模块概述

前端模块为后端开发者提供必要的前端知识储备，覆盖 HTML/CSS/JavaScript 基础、Vue/React 主流框架、工程化工具链以及前后端协作模式。在中小团队中，全栈能力是显著加分项；在大厂面试中，理解前端运行机制有助于更好地进行前后端联调和性能优化。

::: tip 定位
本模块面向后端开发者，不追求前端深度，重点是**理解前端运行机制**和**建立前后端协作共同语言**。
:::

::: info 学习策略
以 Vue 为主线（生态统一、上手快），React 为辅助了解，关注两者的核心设计理念差异。
:::

## 核心知识点

### 前端基础

| 子模块 | 核心内容 |
|--------|----------|
| HTML5 | 语义化标签、表单验证、Canvas/SVG 基础、Web Storage（localStorage/sessionStorage） |
| CSS3 | 盒模型（W3C vs IE）、Flexbox / Grid 布局、响应式设计（媒体查询）、BFC |
| JavaScript | 原型链与继承、闭包与应用、Event Loop（宏任务/微任务）、Promise/async-await |
| ES6+ | let/const 块级作用域、箭头函数、解构赋值、模块化（ESM vs CommonJS） |
| TypeScript | 类型系统（interface/type）、泛型、工具类型（Partial/Pick/Omit）、枚举 |

### Vue 生态

| 子模块 | 核心内容 |
|--------|----------|
| 响应式原理 | Vue2 Object.defineProperty vs Vue3 Proxy、依赖收集（Dep/Watcher）、effectScope |
| 组件通信 | Props/Emits、Provide/Inject、Pinia 状态管理、EventBus |
| 组合式 API | setup/reactive/ref/computed/watch、生命周期钩子、自定义 Hook |
| 路由与构建 | Vue Router（动态路由/导航守卫）、Vite 构建工具、环境变量配置 |
| 服务端渲染 | SSR vs SSG、Nuxt.js 核心概念、同构渲染 |

### React 生态

| 子模块 | 核心内容 |
|--------|----------|
| 核心概念 | JSX 语法、函数组件 vs 类组件、Hooks（useState/useEffect/useMemo/useCallback） |
| 状态管理 | Context API vs Redux/Zustand、不可变数据与 Immer |
| 渲染优化 | useMemo/useCallback/React.memo 使用场景、Fiber 架构简述 |
| 路由与构建 | React Router v6、Next.js App Router、SSR/SSG/ISR |

### 工程化与协作

| 子模块 | 核心内容 |
|--------|----------|
| 包管理 | npm/yarn/pnpm 对比、package.json 关键字段、依赖锁定（lockfile） |
| 构建工具 | Webpack vs Vite vs Turbopack、Tree Shaking、Code Splitting 代码分割 |
| 代码规范 | ESLint + Prettier + Husky 提交检查 |
| 前后端协作 | RESTful API 规范、接口 Mock（MSW/Vite）、跨域处理（CORS/代理）、BFF 模式 |
| 浏览器原理 | 渲染流程（DOM → CSSOM → Render Tree → Layout → Paint）、重绘与回流 |

## 面试重点

::: warning 高频考点（后端岗位可能涉及）
1. **Event Loop**：宏任务与微任务的执行顺序，与 Node.js Event Loop 的区别
2. **Promise 原理**：手写 Promise.all / Promise.race、async-await 本质是 Generator + 自动执行器
3. **Vue 响应式原理**：Vue2 vs Vue3 的实现差异，为什么 Proxy 更好？
4. **跨域问题**：CORS 头配置、JSONP 原理、Nginx 反向代理、WebSocket 不受同源限制
5. **性能优化**：虚拟列表、图片懒加载、防抖节流（debounce/throttle）
6. **前端安全**：XSS（存储型/反射型/DOM 型）、CSRF Token 机制
:::

::: danger 容易翻车的点
- JavaScript 基本概念混淆（原型链、闭包、this 指向）
- Event Loop 说不清宏任务/微任务的执行时机
- 对前端框架停留在"会用"，不理解核心原理
:::

## 学习建议

### 阶段一：基础补齐（1 周）
1. 重点攻克 JavaScript 核心三座大山：原型链、闭包、Event Loop
2. 用 TypeScript 重写一个之前用 JS 写的小项目
3. 了解 CSS Flexbox 和 Grid 布局，能独立完成常见页面布局

### 阶段二：框架掌握（2 周）
4. 选择 Vue3 + Vite + Pinia + TypeScript 技术栈，完成一个 CRUD 管理后台
5. 阅读 Vue3 响应式核心源码（reactive/ref/effect）
6. 对比学习 React Hooks 开发模式，理解两大框架的设计哲学差异

### 阶段三：工程化实践（1 周）
7. 配置 ESLint + Prettier + Husky 规范提交
8. 了解 Vite 插件机制，尝试写一个简单的 Vite 插件
9. 使用 Docker 部署一个前端项目（Nginx 静态服务 + 反向代理）

::: details 推荐资源
- 《JavaScript 高级程序设计（第4版）》—— Matt Frisbie
- Vue 官方文档（中文版）—— cn.vuejs.org
- React 官方文档（新版）—— react.dev
- 《TypeScript 编程》—— Boris Cherny
- MDN Web Docs —— developer.mozilla.org
- 前端九部 - 面试题合集
:::