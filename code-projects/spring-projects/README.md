# Spring 实战项目

> 创建日期：2026-06-06

---

## 模块概览

本模块聚焦 Spring 生态的核心实战能力：从深入理解 Spring Boot 自动装配原理（自定义 Starter），到构建完整的 Spring Cloud 微服务体系。掌握这两个方向，基本覆盖了企业级 Java 后端开发的主流技术需求。

---

## 一、springboot-starter-demo —— 自定义 Starter

### 技术栈

| 类别 | 技术 |
|------|------|
| 语言 | Java 17 |
| 框架 | Spring Boot 3.x |
| 构建工具 | Maven |
| 配置处理 | spring-boot-configuration-processor |
| 自动装配 | spring-boot-autoconfigure |

### 学习目标

- 深入理解 Spring Boot 自动装配原理（@EnableAutoConfiguration、spring.factories / META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports）
- 掌握 @Conditional 系列注解的使用场景（@ConditionalOnClass、@ConditionalOnMissingBean 等）
- 能独立设计和实现一个生产级自定义 Starter
- 理解 spring-boot-starter 的命名规范与模块拆分（starter vs autoconfigure）
- 掌握配置属性绑定（@ConfigurationProperties）与 IDE 提示支持

### 核心实践

| 编号 | 实践名称 | 说明 |
|------|----------|------|
| ST-01 | 简单 Starter | 实现一个最小化 Starter，理解核心流程 |
| ST-02 | 带配置的 Starter | 添加 @ConfigurationProperties，支持外部化配置 |
| ST-03 | 条件装配 Starter | 使用 @Conditional 系列注解控制 Bean 的创建 |
| ST-04 | 多模块 Starter | 拆分 autoconfigure 模块和 starter 模块 |
| ST-05 | 实战：短信 Starter | 实现多供应商（阿里云/腾讯云）短信发送 Starter |
| ST-06 | 实战：限流 Starter | 基于 AOP + Redis 实现方法级限流 Starter |

### 对应 Wiki 模块

- Spring Boot 自动装配原理
- Spring Boot Starter 开发
- Spring 条件装配机制

### 预计耗时

**20 ~ 25 小时**

---

## 二、microservice-demo —— Spring Cloud 微服务完整示例

### 技术栈

| 类别 | 技术 |
|------|------|
| 语言 | Java 17 |
| 框架 | Spring Boot 3.x + Spring Cloud 2023.x |
| 注册中心 | Nacos（服务注册与发现 + 配置中心） |
| 负载均衡 | Spring Cloud LoadBalancer |
| 远程调用 | OpenFeign |
| 网关 | Spring Cloud Gateway |
| 熔断降级 | Resilience4j / Sentinel |
| 链路追踪 | Micrometer Tracing + Zipkin |
| 消息驱动 | Spring Cloud Stream + Kafka |
| 数据库 | MySQL 8.0 + MyBatis-Plus |
| 容器化 | Docker + Docker Compose |

### 学习目标

- 掌握 Spring Cloud 微服务架构的完整组件体系
- 理解服务注册与发现的工作原理（AP vs CP）
- 能使用 OpenFeign 进行声明式远程调用（含超时、重试、熔断配置）
- 掌握 Gateway 路由规则、过滤器链、限流配置
- 理解配置中心（Nacos Config）的动态刷新机制
- 实现分布式链路追踪，快速定位跨服务调用问题
- 能通过 Docker Compose 一键启动完整的微服务环境

### 服务架构

```
                    ┌─────────────┐
                    │   Gateway   │  (API 网关，端口: 8080)
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
     ┌────────▼───┐  ┌────▼─────┐  ┌───▼──────────┐
     │ User Service│  │Order Svc │  │Product Svc   │
     │  (8081)    │  │ (8082)   │  │ (8083)       │
     └─────┬──────┘  └────┬─────┘  └──────┬───────┘
           │              │               │
           └──────────────┼───────────────┘
                          │
              ┌───────────▼───────────┐
              │    Nacos (8848)       │  (注册中心 + 配置中心)
              └───────────────────────┘
              ┌───────────────────────┐
              │    Kafka              │  (异步消息)
              └───────────────────────┘
              ┌───────────────────────┐
              │    Zipkin (9411)      │  (链路追踪)
              └───────────────────────┘
```

### 核心实践

| 编号 | 实践名称 | 说明 |
|------|----------|------|
| MS-01 | 服务注册与发现 | Nacos 注册中心搭建，服务间互相发现 |
| MS-02 | 配置中心 | Nacos Config 实现配置集中管理与动态刷新 |
| MS-03 | OpenFeign 调用 | 服务间声明式调用，含拦截器与日志 |
| MS-04 | Gateway 网关 | 路由配置、断言工厂、自定义过滤器 |
| MS-05 | 熔断与降级 | Resilience4j 实现服务熔断、限流、重试 |
| MS-06 | 链路追踪 | Micrometer Tracing + Zipkin 全链路追踪 |
| MS-07 | 分布式事务 | Seata AT 模式解决跨服务数据一致性 |
| MS-08 | 统一异常处理 | 全局异常拦截与统一响应格式 |
| MS-09 | Docker Compose | 一键启动全部微服务 |

### 对应 Wiki 模块

- 微服务架构概述
- 服务注册与发现
- 配置中心
- API 网关
- 服务调用与负载均衡
- 熔断降级与限流
- 分布式链路追踪

### 预计耗时

**45 ~ 55 小时**