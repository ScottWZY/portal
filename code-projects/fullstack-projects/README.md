# 全栈项目

> 创建日期：2026-06-06

---

## 模块概览

本模块涵盖两个完整的全栈项目：Vue3 + TypeScript 后台管理系统和前后端分离博客平台。通过这两个项目，打通前端到后端、开发到部署的完整链路，培养全栈工程化思维。

---

## 一、vue3-admin —— Vue3 + TypeScript 后台管理系统

### 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | Vue 3.4+（Composition API） |
| 语言 | TypeScript 5.x |
| 构建工具 | Vite 5.x |
| UI 组件库 | Element Plus |
| 状态管理 | Pinia |
| 路由 | Vue Router 4.x |
| HTTP 客户端 | Axios（封装拦截器） |
| 表格组件 | vxe-table |
| 图表 | ECharts 5.x |
| 代码规范 | ESLint + Prettier + Husky |
| 包管理 | pnpm |

### 学习目标

- 掌握 Vue3 Composition API 的最佳实践（ref、reactive、computed、watch、生命周期）
- 理解 TypeScript 在 Vue3 项目中的深度应用（泛型组件、类型推导）
- 掌握 Pinia 状态管理的模块化设计
- 能实现动态路由与权限控制（RBAC）
- 掌握 Axios 请求封装（拦截器、取消重复请求、错误统一处理）
- 能封装可复用的业务组件（表单、表格、弹窗）
- 理解前端工程化（Vite 配置、环境变量、代理、打包优化）

### 核心功能清单

| 编号 | 功能模块 | 说明 |
|------|----------|------|
| ADM-01 | 项目初始化 | Vite + Vue3 + TS + Element Plus 脚手架搭建 |
| ADM-02 | 登录认证 | JWT 登录、Token 刷新、路由守卫 |
| ADM-03 | 动态路由 | 根据后端权限动态生成菜单和路由 |
| ADM-04 | 用户管理 | CRUD、分页、搜索、导出 |
| ADM-05 | 角色管理 | 角色分配权限（RBAC） |
| ADM-06 | 权限控制 | 按钮级权限指令（v-permission） |
| ADM-07 | 数据大屏 | ECharts 数据可视化 |
| ADM-08 | 主题切换 | 暗黑模式 + 多主题色 |
| ADM-09 | 国际化 | vue-i18n 中英文切换 |
| ADM-10 | 表单封装 | 动态表单、表单校验、表单联动 |
| ADM-11 | 文件上传 | 分片上传、断点续传、进度展示 |
| ADM-12 | 打包部署 | Nginx 配置、Docker 部署 |

### 项目目录结构

```
vue3-admin/
├── src/
│   ├── api/                # API 接口层
│   ├── assets/             # 静态资源
│   ├── components/         # 公共组件
│   │   ├── Form/           # 动态表单组件
│   │   ├── Table/          # 通用表格组件
│   │   └── Upload/         # 文件上传组件
│   ├── composables/        # 组合式函数（Hooks）
│   ├── directives/         # 自定义指令
│   ├── layouts/            # 布局组件
│   ├── router/             # 路由配置
│   ├── stores/             # Pinia 状态管理
│   ├── styles/             # 全局样式
│   ├── types/              # TypeScript 类型定义
│   ├── utils/              # 工具函数
│   └── views/              # 页面视图
├── .env.development        # 开发环境变量
├── .env.production         # 生产环境变量
├── vite.config.ts          # Vite 配置
└── package.json
```

### 对应 Wiki 模块

- Vue3 核心语法
- TypeScript 实战
- 状态管理与路由
- 权限系统设计
- 前端工程化

### 预计耗时

**40 ~ 50 小时**

---

## 二、blog-platform —— 前后端分离博客系统

### 技术栈

| 层级 | 技术 |
|------|------|
| **后端** | |
| 框架 | Spring Boot 3.x |
| ORM | MyBatis-Plus |
| 数据库 | MySQL 8.0 |
| 缓存 | Redis 7.x |
| 搜索引擎 | Elasticsearch 8.x |
| 认证 | Spring Security + JWT |
| API 文档 | Knife4j（Swagger） |
| 对象存储 | MinIO（本地） / 阿里云 OSS |
| 容器化 | Docker |
| **前端** | |
| 框架 | Vue 3.4+ + TypeScript |
| 构建 | Vite 5.x |
| UI | 用户端：自定义 CSS / 博客端：Element Plus |
| SSR | Nuxt 3（SEO 优化） |
| Markdown | marked + highlight.js |

### 学习目标

- 掌握前后端分离项目的完整开发流程
- 理解 Spring Security + JWT 的认证授权方案
- 掌握 Elasticsearch 全文检索的实现
- 能实现 Markdown 编辑器的集成与 XSS 防护
- 理解评论系统的树形结构设计与实现
- 掌握图片上传与对象存储的集成
- 能实现博客的 SEO 优化（SSR、sitemap、meta 标签）

### 核心功能清单

| 编号 | 模块 | 功能 | 说明 |
|------|------|------|------|
| BLOG-01 | 用户 | 注册 / 登录 | JWT 认证，支持 GitHub 第三方登录 |
| BLOG-02 | 用户 | 个人中心 | 资料编辑、头像上传 |
| BLOG-03 | 文章 | 发布 / 编辑 | Markdown 编辑器 + 实时预览 |
| BLOG-04 | 文章 | 分类 / 标签 | 多对多关系管理 |
| BLOG-05 | 文章 | 全文搜索 | Elasticsearch 高亮搜索 |
| BLOG-06 | 文章 | 浏览量统计 | Redis 计数 + 定时持久化 |
| BLOG-07 | 评论 | 发表 / 回复 | 树形评论结构，支持嵌套 |
| BLOG-08 | 评论 | 敏感词过滤 | DFA 算法 / 第三方 API |
| BLOG-09 | 管理 | 后台管理 | 文章审核、用户管理、数据统计 |
| BLOG-10 | 管理 | 数据看板 | 访问量、文章数、用户数统计 |
| BLOG-11 | 系统 | 缓存优化 | 热门文章缓存、首页缓存 |
| BLOG-12 | 系统 | 日志记录 | AOP 操作日志 + 登录日志 |
| BLOG-13 | 部署 | Docker 部署 | 前后端 + MySQL + Redis + ES 一键部署 |

### 系统架构

```
                         ┌──────────────────────────┐
                         │       Nginx (80/443)      │
                         │   反向代理 + 静态资源      │
                         └──────────┬───────────────┘
                                    │
               ┌────────────────────┼────────────────────┐
               │                    │                    │
     ┌─────────▼──────┐  ┌─────────▼──────┐  ┌─────────▼──────┐
     │  前端 (3000)    │  │  后端 (8080)   │  │  MinIO (9000)  │
     │  Vue3 + Nuxt3  │  │  Spring Boot   │  │  对象存储       │
     └────────────────┘  └───────┬────────┘  └────────────────┘
                                 │
              ┌──────────────────┼──────────────────┐
              │                  │                  │
    ┌─────────▼──────┐  ┌───────▼──────┐  ┌───────▼────────┐
    │  MySQL (3306)  │  │ Redis (6379) │  │  ES (9200)     │
    │   主数据库      │  │   缓存       │  │   搜索引擎      │
    └────────────────┘  └──────────────┘  └────────────────┘
```

### 数据库核心表

| 表名 | 说明 |
|------|------|
| user | 用户表 |
| article | 文章表 |
| category | 分类表 |
| tag | 标签表 |
| article_tag | 文章-标签关联表 |
| comment | 评论表（自关联实现树形结构） |
| operation_log | 操作日志表 |

### 对应 Wiki 模块

- Spring Security + JWT 认证
- Elasticsearch 全文检索
- 评论系统设计
- 博客系统架构
- 前后端分离最佳实践
- Docker 容器化部署

### 预计耗时

**50 ~ 60 小时**