# 代码实战项目总览

> 创建日期：2026-06-06

---

## 一、项目结构总览

```
code-projects/
├── README.md                       # 本文件 —— 项目总览与学习路线
├── java-core/                      # Java 核心能力
│   ├── README.md
│   ├── jvm-demo/                   # JVM 调优与问题排查
│   ├── concurrency-demo/           # Java 并发编程
│   └── design-patterns/            # 23 种设计模式
├── spring-projects/                # Spring 生态实战
│   ├── README.md
│   ├── springboot-starter-demo/    # 自定义 Starter
│   └── microservice-demo/          # Spring Cloud 微服务
├── middleware-practice/            # 中间件实践
│   ├── README.md
│   ├── redis-practice/             # Redis 深度应用
│   ├── kafka-practice/             # Kafka 消息队列
│   └── sharding-sphere-demo/       # 分库分表实战
├── high-concurrency-projects/     # 高并发实战
│   ├── README.md
│   ├── seckill-system/             # 秒杀系统
│   └── rate-limiter-demo/          # 限流算法
├── ai-projects/                    # AI 应用实战
│   ├── README.md
│   ├── rag-chatbot/                # RAG 知识库问答
│   ├── agent-demo/                 # AI Agent 工具调用
│   └── langchain-practice/         # LangChain 实战
└── fullstack-projects/            # 全栈项目
    ├── README.md
    ├── vue3-admin/                 # Vue3 后台管理
    └── blog-platform/              # 博客系统
```

---

## 二、学习阶段与项目对应关系

| 阶段 | 模块 | 对应项目 | 前置知识 |
|------|------|----------|----------|
| 第一阶段：基础夯实 | Java 核心 | java-core/ | Java 基础语法 |
| 第二阶段：框架掌握 | Spring 实战 | spring-projects/ | Java 核心、Spring Boot 入门 |
| 第三阶段：中间件深入 | 中间件实践 | middleware-practice/ | Spring Boot、Redis/Kafka 基础 |
| 第四阶段：高并发攻坚 | 高并发实战 | high-concurrency-projects/ | 中间件实践、分布式理论 |
| 第五阶段：AI 融合 | AI 应用 | ai-projects/ | Java/Python 基础 |
| 第六阶段：全栈综合 | 全栈项目 | fullstack-projects/ | 前端基础、Spring Boot |

---

## 三、推荐学习顺序

```
java-core  ──>  spring-projects  ──>  middleware-practice  ──>  high-concurrency-projects
                                                                       │
ai-projects  ──────────────────────────────────────────────────────────┘
     │
     └──>  fullstack-projects
```

**核心路径**（面试必备）：
1. `java-core` —— 打好语言根基
2. `spring-projects` —— 掌握主流框架
3. `middleware-practice` —— 深入中间件
4. `high-concurrency-projects` —— 攻克高并发

**拓展路径**（加分项）：
5. `ai-projects` —— AI 时代必备技能
6. `fullstack-projects` —— 全栈综合能力

---

## 四、各项目简要说明

### java-core —— Java 核心能力

深入 JVM 底层、并发编程模型、经典设计模式，构建扎实的 Java 内功。适合所有初中级 Java 开发者。

### spring-projects —— Spring 生态实战

从自定义 Starter 理解 Spring Boot 自动装配原理，到 Spring Cloud 微服务全链路实践。适合有 Spring Boot 使用经验的开发者。

### middleware-practice —— 中间件深度实践

Redis 缓存策略与分布式锁、Kafka 消息可靠性保障、ShardingSphere 分库分表，覆盖面试高频考点。适合有中间件基础概念的开发者。

### high-concurrency-projects —— 高并发实战项目

完整秒杀系统从设计到落地，限流算法原理与实现，将理论知识转化为工程能力。适合准备大厂面试的开发者。

### ai-projects —— AI 应用实战

RAG 知识库问答、AI Agent 工具调用、LangChain 开发框架，紧跟 AI 技术浪潮。适合对 AI 应用开发感兴趣的开发者。

### fullstack-projects —— 全栈项目

Vue3 + TypeScript 后台管理系统、前后端分离博客平台，打通前后端全链路。适合向全栈方向发展的开发者。

---

## 五、学习建议

1. **按阶段递进**：不要跳阶段学习，每个阶段的输出是下一阶段的输入
2. **代码为王**：每个项目务必手写代码，不要只读文档
3. **文档沉淀**：每个项目完成后，在 `docs/` 目录下撰写学习笔记
4. **定期复盘**：每完成一个阶段，回顾并总结核心知识点