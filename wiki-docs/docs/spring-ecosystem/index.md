# Spring 生态

## 模块概述

Spring 生态是 Java 后端开发的绝对核心，涵盖 Spring Framework 基础、Spring Boot 自动配置、Spring Cloud 微服务、Spring Security 安全框架以及 Spring Data 持久层抽象。掌握 Spring 生态不仅是为了应对面试，更是日常开发的生产力基础。

::: tip 核心思路
不要停留在会用注解，要理解**自动配置原理**、**Bean 生命周期**、**AOP 实现机制**和**扩展点设计**。
:::

::: info 技术栈
Spring Framework 6.x / Spring Boot 3.x / Spring Cloud 2023+ / Spring Security 6.x
:::

## 核心知识点

### Spring Framework 核心

| 子模块 | 核心内容 |
|--------|----------|
| IoC 容器 | BeanFactory vs ApplicationContext、BeanDefinition、BeanPostProcessor 扩展点 |
| Bean 生命周期 | 实例化 → 属性填充 → 初始化 → 使用 → 销毁，各阶段回调接口 |
| 依赖注入 | @Autowired / @Resource 区别、构造器注入 vs 字段注入、循环依赖三级缓存 |
| AOP | JDK 动态代理 vs CGLIB、切面表达式、Advice 类型、AOP 失效场景 |
| 事务管理 | 声明式事务原理、传播行为 7 种、隔离级别、事务失效的 8 种场景 |
| 事件机制 | ApplicationEvent / ApplicationListener、异步事件处理 |

### Spring Boot

| 子模块 | 核心内容 |
|--------|----------|
| 自动配置 | @EnableAutoConfiguration 原理、spring.factories / AutoConfiguration.imports、条件注解 |
| 起步依赖 | starter 命名规范、自定义 starter 开发 |
| 监控 | Actuator 端点、Micrometer + Prometheus 集成、自定义 HealthIndicator |
| 配置加载 | 配置优先级、多环境配置、@ConfigurationProperties |
| 嵌入式容器 | Tomcat/Jetty/Undertow 参数调优 |

### Spring Cloud 微服务

| 子模块 | 核心内容 |
|--------|----------|
| 服务注册与发现 | Nacos / Eureka / Consul 对比、CAP 权衡、健康检查机制 |
| 配置中心 | Nacos Config 动态刷新原理、配置灰度发布 |
| 远程调用 | OpenFeign 原理、负载均衡策略、超时与重试机制 |
| 服务网关 | Spring Cloud Gateway 路由谓词、过滤器链、限流实现 |
| 熔断降级 | Sentinel 资源定义、流控/熔断/热点规则、控制台使用 |
| 分布式事务 | Seata AT/TCC/Saga 模式对比、TC/TM/RM 三组件架构 |

### Spring Security

| 子模块 | 核心内容 |
|--------|----------|
| 认证流程 | SecurityContextHolder → AuthenticationManager → ProviderManager 链路 |
| 授权模型 | RBAC 权限模型、方法级安全注解、表达式控制 |
| OAuth2/JWT | 授权码模式、密码模式、JWT 结构（Header/Payload/Signature）、Token 刷新 |
| 常见漏洞 | CSRF / CORS / XSS / SQL 注入防护配置 |

## 面试重点

::: warning 高频考点
1. **Spring Bean 生命周期**：完整描述从扫描到销毁的全链路，PostProcessor 的执行顺序
2. **循环依赖**：Spring 如何用三级缓存解决？为什么需要三级缓存而不是两级？
3. **@Transactional 失效场景**：非 public 方法、自调用、异常被捕获、rollbackFor 未指定等
4. **Spring Boot 自动配置原理**：从 @SpringBootApplication 入口到条件装配的完整链路
5. **MyBatis 与 Spring 整合**：MapperScannerConfigurer、SqlSessionFactory、Mapper 代理工厂
6. **微服务组件对比**：Nacos vs Eureka、Sentinel vs Hystrix、Gateway vs Zuul
:::

::: danger 容易翻车的点
- 只知道用注解，不知道 Bean 是如何被管理和增强的
- 循环依赖只背答案，不理解三级缓存中每一级的作用
- 事务失效场景说不全，或者不会举实际例子
- Spring Cloud 组件停留在会用，不关注实现原理
:::

## 学习建议

### 阶段一：Spring Framework 基础（2 周）
1. 从 ApplicationContext 入口打断点，Debug 走一遍 Bean 加载全流程
2. 手写一个简易 IoC 容器，实现 @Autowired 注入和 @PostConstruct 初始化
3. 画出 Bean 生命周期时序图，标注每个后置处理器的执行节点

### 阶段二：Spring Boot 实战（2 周）
4. 实现一个自定义 starter，深入理解自动配置机制
5. 搭建完整的 Actuator + Prometheus + Grafana 监控体系
6. 分析 spring-boot-autoconfigure 源码中的关键配置类

### 阶段三：微服务体系（3 周）
7. 搭建一个完整的 Spring Cloud 微服务项目（Gateway + Nacos + Feign + Sentinel + Seata）
8. 进行压测，验证 Sentinel 限流和熔断效果
9. 阅读 OpenFeign 动态代理生成与 HTTP 请求发送的核心代码

### 阶段四：源码串联（1 周）
10. 以 MyBatis 整合为例，串联 MyBatis AutoConfiguration → SqlSessionFactory → MapperProxy 全链路

::: details 推荐书单
- 《Spring 实战（第6版）》—— Craig Walls
- 《Spring 源码深度解析（第2版）》—— 郝佳
- 《Spring Boot 编程思想（核心篇）》—— 小马哥
- 《Spring Cloud 微服务实战》—— 翟永超
- 《Spring Security 实战》—— Laurentiu Spilca
:::