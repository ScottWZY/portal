# Spring 生态（spring-ecosystem）完善计划

## 摘要

在现有 VitePress 知识库基础上，按面试导向文档风格，分六个阶段、约 26 个任务，完成 Spring 生态部分全部文档的编写，覆盖 Spring Framework 核心、Spring Boot、Spring Cloud、Spring Security、设计模式与实战项目，预计总篇幅约 11000 行。

---

## 当前状态分析

### 已完成内容

| 文件 | 状态 | 篇幅 |
|------|------|------|
| `spring-ecosystem/index.md` | ✅ 已完成 | 模块总览（~100 行） |

### 当前问题

1. **Spring Framework 核心缺失**：IoC、AOP、事务、Bean 生命周期等基础内容没有独立页面，侧边栏直接从 Spring Boot 开始，缺乏根基
2. **所有子页面均未创建**：侧边栏 config.js 中已规划 11 个子页面，但对应 .md 文件均不存在
3. **缺少设计模式专题**：Spring 中大量应用的经典设计模式（代理、模板方法、观察者、策略等）缺乏系统讲解
4. **缺少实战项目**：用户需要经典高频实战项目解说（如秒杀系统、微服务架构实战）

### 文档风格（所有新文档必须遵循）

- **面试导向**：开头「⭐ 面试重点速览」表格，结尾「面试高频问题汇总」
- **图表**：Mermaid 流程图、对比表格、ASCII 图示
- **代码示例**：简洁可运行的 Java 代码，关键逻辑加中文注释
- **提示容器**：`::: tip` / `::: warning` / `::: danger` / `::: info`
- **篇幅**：每篇 400-700 行，重点内容不超过 800 行
- **每小节至少 5 条**高频面试题（面试高频问题汇总部分）

### 待创建的子目录

- `spring-ecosystem/spring-framework/`（全新，Spring Framework 核心）
- `spring-ecosystem/spring-boot/`（3 个页面待创建）
- `spring-ecosystem/spring-cloud/`（5 个页面待创建 + 3 个新增）
- `spring-ecosystem/spring-security/`（3 个页面待创建 + 1 个新增）
- `spring-ecosystem/spring-patterns/`（全新，Spring 设计模式）
- `spring-ecosystem/spring-projects/`（全新，Spring 实战项目）

---

## 任务清单

### 📌 第一阶段：Spring Framework 核心（🔥 最高优先级）

> Spring Framework 是整个生态的根基，面试中 IoC、AOP、事务是必考内容。当前侧边栏缺失此模块，必须优先补齐。

#### 任务 1.1：`spring-framework/ioc.md` - IoC 容器与 Bean 生命周期

- ⭐ IoC 与 DI 概念辨析（控制反转是思想，依赖注入是实现）
- BeanFactory vs ApplicationContext 区别与层级关系
- ⭐ Bean 生命周期完整流程（实例化 → 属性填充 → Aware → BeanPostProcessor → 初始化 → 就绪 → 销毁）
- BeanDefinition 与 Bean 的作用域（singleton / prototype / request / session）
- BeanPostProcessor 扩展点详解（Spring 最核心扩展机制）
- @ComponentScan 包扫描机制
- 预计：550-650 行

#### 任务 1.2：`spring-framework/di-circular.md` - 依赖注入与循环依赖

- ⭐ @Autowired 与 @Resource 区别（注入方式、byType vs byName）
- 构造器注入 vs Setter 注入 vs 字段注入（官方推荐构造器注入）
- ⭐ 循环依赖三级缓存机制（源码级分析）
  - 一级缓存 singletonObjects（成品）
  - 二级缓存 earlySingletonObjects（半成品）
  - 三级缓存 singletonFactories（工厂对象）
- 为什么需要三级缓存而不是两级？（AOP 代理对象的循环依赖）
- 构造器注入的循环依赖为何无法解决？
- @Lazy 延迟注入解决循环依赖
- 预计：600-700 行

#### 任务 1.3：`spring-framework/aop.md` - AOP 原理与实现

- ⭐ AOP 核心概念（Aspect / JoinPoint / Pointcut / Advice / Weaving）
- 5 种通知类型及执行顺序（@Before / @Around / @After / @AfterReturning / @AfterThrowing）
- ⭐ JDK 动态代理 vs CGLIB 代理（原理、区别、Spring 选择策略）
- AOP 失效的 6 种场景（同类调用、非 public 方法、final 方法等）
- AspectJ 与 Spring AOP 的区别（编译时织入 vs 运行时代理）
- 预计：550-650 行

#### 任务 1.4：`spring-framework/transaction.md` - 事务管理

- ⭐ 声明式事务 @Transactional 原理（AOP + TransactionInterceptor）
- ⭐ 7 种事务传播行为（REQUIRED / REQUIRES_NEW / NESTED 重点）
- 5 种事务隔离级别与数据库对应关系
- ⭐ @Transactional 失效的 8 种场景（非 public、自调用、异常被吃、rollbackFor 未指定等）
- 编程式事务（TransactionTemplate）vs 声明式事务
- 预计：550-650 行

#### 任务 1.5：`spring-framework/event.md` - Spring 事件机制

- 观察者模式在 Spring 中的实现
- ApplicationEvent / ApplicationListener / ApplicationEventPublisher
- @EventListener 注解使用（同步 vs 异步 @Async）
- ⭐ Spring Boot 启动事件链（7 个核心事件）
- 事务事件 @TransactionalEventListener（事务提交后再处理）
- 自定义事件发布与监听
- 预计：400-500 行

#### 任务 1.6：`spring-framework/extension.md` - Spring 扩展点全景

- BeanFactoryPostProcessor vs BeanPostProcessor
- ⭐ BeanPostProcessor 实战：自定义注解处理器
- ImportBeanDefinitionRegistrar（MyBatis MapperScannerConfigurer 原理）
- FactoryBean 与普通 Bean 区别（MyBatis SqlSessionFactoryBean 原理）
- ApplicationContextAware 等 Aware 接口
- InitializingBean / DisposableBean 接口
- Spring Boot 的 ApplicationRunner / CommandLineRunner
- 预计：500-600 行

---

### 📌 第二阶段：Spring Boot 深度（🔥 最高优先级）

> Spring Boot 是面试和日常开发的核心，自动配置、启动流程、Starter 机制是必考内容。

#### 任务 2.1：`spring-boot/index.md` - 自动配置原理

- ⭐ @SpringBootApplication 注解构成（3 个核心注解拆解）
- @EnableAutoConfiguration 原理
- ⭐ AutoConfigurationImportSelector 加载自动配置类全链路
- Spring Boot 3.x 变化：从 spring.factories 迁移到 AutoConfiguration.imports
- ⭐ 条件注解详解（@ConditionalOnClass / @ConditionalOnMissingBean / @ConditionalOnProperty）
- 自动配置类案例分析（如 DataSourceAutoConfiguration）
- 预计：550-650 行

#### 任务 2.2：`spring-boot/startup.md` - 启动流程

- ⭐ SpringApplication.run() 7 个核心阶段
- SpringApplication 初始化（推断应用类型、加载 Initializer/Listener）
- ⭐ ApplicationContext.refresh() 12 步核心流程
- 配置加载优先级（命令行 > 环境变量 > 配置文件等 11 级）
- Spring Boot 3.x 新特性：AOT 编译、虚拟线程、优雅关机
- 预计：500-600 行

#### 任务 2.3：`spring-boot/starter.md` - Starter 机制与自定义

- Starter 命名规范（官方 spring-boot-starter-xxx vs 第三方 xxx-spring-boot-starter）
- ⭐ 自定义 Starter 开发全流程（autoconfigure 模块 + starter 模块）
- @ConfigurationProperties 配置绑定
- spring-boot-configuration-processor 生成元数据
- 常见 Starter 源码分析（MyBatis-Starter 为例）
- 预计：500-600 行

#### 任务 2.4：`spring-boot/actuator.md` - 监控与 Actuator

- ⭐ Actuator 核心端点（health / metrics / info / env / loggers / threaddump）
- 自定义 HealthIndicator
- Micrometer + Prometheus + Grafana 监控体系搭建
- 自定义 Metrics 指标
- Spring Boot 3.x Observability：Micrometer 与 OpenTelemetry 集成
- 预计：450-550 行

---

### 📌 第三阶段：Spring Cloud 微服务（🟠 中高优先级）

#### 任务 3.1：`spring-cloud/index.md` - 微服务架构概览

- 微服务架构 vs 单体架构对比
- Spring Cloud 技术栈全景图
- 服务注册发现、配置中心、API 网关、远程调用、熔断降级、分布式事务
- Spring Cloud 版本演进与选型建议
- 预计：350-450 行

#### 任务 3.2：`spring-cloud/registry.md` - 服务注册与发现

- ⭐ Nacos 核心功能（服务发现 + 配置中心，一站式方案）
- AP 模式 vs CP 模式（临时实例 vs 持久实例）
- ⭐ Nacos vs Eureka vs Consul vs ZooKeeper 对比（CAP 维度）
- 健康检查机制（心跳检测、主动探测）
- 服务注册与发现流程（Mermaid 流程图）
- 预计：500-600 行

#### 任务 3.3：`spring-cloud/config.md` - 配置中心

- Nacos Config 配置管理
- ⭐ 配置动态刷新原理（@RefreshScope、长轮询 / gRPC 双向流）
- 配置优先级与灰度发布
- 配置加密（Jasypt 集成）
- 多环境配置管理策略
- 预计：450-550 行

#### 任务 3.4：`spring-cloud/gateway.md` - API 网关

- ⭐ Gateway 三大核心概念（Route / Predicate / Filter）
- 工作原理（基于 WebFlux + Netty 非阻塞 IO）
- 路由谓词（Path / Header / Query / Method 等）
- ⭐ GatewayFilter 过滤器链（局部 vs 全局过滤器）
- 限流实现（Redis 令牌桶 / Sentinel 集成）
- Gateway vs Zuul 1.x 对比
- 预计：550-650 行

#### 任务 3.5：`spring-cloud/loadbalance.md` - 负载均衡

- 客户端负载均衡 vs 服务端负载均衡
- Spring Cloud LoadBalancer 原理（替代 Ribbon）
- 负载均衡策略（轮询 / 随机 / 加权 / 最少连接 / 一致性哈希）
- 自定义负载均衡策略
- 预计：400-500 行

#### 任务 3.6：`spring-cloud/openfeign.md` - OpenFeign 远程调用

- ⭐ Feign 动态代理原理（JDK 动态代理 + Contract 契约解析）
- Feign 的执行流程（Mermaid 流程图）
- 超时配置与重试机制
- 拦截器（RequestInterceptor）与日志配置
- Feign + Sentinel 集成实现熔断
- 预计：500-600 行

#### 任务 3.7：`spring-cloud/sentinel.md` - Sentinel 熔断降级

- ⭐ Sentinel 核心架构（Slot Chain 责任链模式）
- 限流算法（滑动窗口 / 令牌桶 / 漏桶）
- 6 种限流方式（QPS / 并发线程数 / 关联 / 链路 / 热点参数 / 集群）
- ⭐ 熔断降级策略（慢调用比例 / 异常比例 / 异常数）
- Sentinel vs Hystrix vs Resilience4j 对比
- Sentinel 控制台与动态规则推送
- 预计：550-650 行

#### 任务 3.8：`spring-cloud/seata.md` - Seata 分布式事务

- 分布式事务问题场景（订单 + 库存 + 账户）
- ⭐ Seata 三组件架构（TC / TM / RM）
- ⭐ 四种模式对比（AT / TCC / Saga / XA）—— 原理、优缺点、适用场景
- AT 模式原理（UNDO_LOG 回滚日志）
- TCC 模式原理（Try / Confirm / Cancel）
- Seata 实战配置与集成
- 预计：550-650 行

---

### 📌 第四阶段：Spring Security 安全（🟡 中等优先级）

#### 任务 4.1：`spring-security/index.md` - 安全框架概览

- Spring Security 核心架构（过滤器链）
- ⭐ Spring Security 6.x 核心变化（不再继承 WebSecurityConfigurerAdapter）
- SecurityFilterChain Bean 配置方式
- 核心组件：SecurityContextHolder / Authentication / GrantedAuthority
- 预计：400-500 行

#### 任务 4.2：`spring-security/auth.md` - 认证与授权

- ⭐ 认证流程（请求 → Filter → AuthenticationManager → ProviderManager → UserDetailsService）
- UserDetailsService 与 UserDetails 接口
- DelegatingPasswordEncoder 密码编码器代理
- ⭐ RBAC 权限模型（5 张核心表：user / role / menu / user_role / role_menu）
- @EnableMethodSecurity + @PreAuthorize 方法级权限控制
- 自定义权限表达式（@PreAuthorize("@pms.hasPermission('xxx')")）
- 预计：550-650 行

#### 任务 4.3：`spring-security/oauth2.md` - OAuth2 与 JWT

- ⭐ OAuth2 四种授权模式（授权码 / 密码 / 客户端凭证 / 隐式）
- OAuth2.1 新变化（PKCE 必选、隐式模式废弃）
- ⭐ JWT 结构（Header / Payload / Signature）与签发验证流程
- Token 刷新机制（Refresh Token + Access Token 双 Token）
- Spring Authorization Server 搭建（OAuth2 授权服务器）
- 前后端分离 JWT 认证最佳实践
- 预计：550-650 行

#### 任务 4.4：`spring-security/vulnerability.md` - 安全漏洞防护

- ⭐ CSRF 攻击原理与防护（前后端分离为何可以关闭 CSRF）
- CORS 跨域配置（addAllowedOrigin vs addAllowedOriginPattern）
- XSS 攻击防护（输出编码 + CSP 策略）
- SQL 注入防护（MyBatis #{} vs ${}）
- 会话固定攻击与 Session 管理
- 预计：450-550 行

---

### 📌 第五阶段：Spring 设计模式（🟡 中等优先级）

#### 任务 5.1：`spring-patterns/index.md` - Spring 中的设计模式全景

- 12 种设计模式在 Spring 中的应用总览表
- 设计模式与 Spring 架构的关系
- 面试中如何回答「Spring 中用了哪些设计模式」
- 预计：300-400 行

#### 任务 5.2：`spring-patterns/proxy-template-observer.md` - 核心模式深度解析

- ⭐ 代理模式：AOP 两种代理方式、创建时机（BeanPostProcessor 后置处理阶段）
- ⭐ 模板方法模式：JdbcTemplate / RestTemplate / RedisTemplate 源码分析
- ⭐ 观察者模式：ApplicationEvent 事件驱动模型、Spring Boot 启动事件链
- 预计：500-600 行

#### 任务 5.3：`spring-patterns/factory-strategy-chain.md` - 进阶模式深度解析

- ⭐ 工厂模式：BeanFactory 三级继承体系、FactoryBean vs 普通 Bean
- ⭐ 策略模式：PlatformTransactionManager / Resource 接口 / HandlerMapping
- ⭐ 责任链模式：Spring Security 过滤器链 / Sentinel Slot Chain
- 适配器模式：HandlerAdapter 在 Spring MVC 中的应用
- 委派模式：DispatcherServlet 委派给各类组件
- 预计：500-600 行

---

### 📌 第六阶段：Spring 实战项目（🟠 中高优先级）

#### 任务 6.1：`spring-projects/seckill.md` - Spring Boot 秒杀系统实战

- ⭐ 系统架构设计（Mermaid 架构图）
- 前端限流：Nginx + Lua 令牌桶限流
- 后端限流：Sentinel 接口限流 + 热点参数限流
- ⭐ Redis 预减库存（原子操作 Lua 脚本）
- 消息队列异步下单（RocketMQ 削峰填谷）
- 防止超卖（数据库行锁 + 乐观锁 + Redis 分布式锁）
- 接口防刷（验证码 + 限流 + IP 黑名单）
- 预计：600-750 行

#### 任务 6.2：`spring-projects/microservice-project.md` - 微服务架构实战

- ⭐ 完整微服务架构设计（Gateway + Nacos + Feign + Sentinel + Seata）
- 项目模块划分与依赖关系
- 服务间通信方案（Feign 同步调用 + MQ 异步消息）
- 统一异常处理与返回格式
- 分布式链路追踪（Sleuth / Micrometer Tracing）
- 容器化部署（Dockerfile + Docker Compose）
- 监控体系（Actuator + Prometheus + Grafana）
- 预计：600-750 行

---

## 推进顺序

```
第一阶段（Spring Framework 核心：6 个任务）
    ↓
第二阶段（Spring Boot 深度：4 个任务）
    ↓
第三阶段（Spring Cloud 微服务：8 个任务）
    ↓
第四阶段（Spring Security 安全：4 个任务）
    ↓
第五阶段（Spring 设计模式：3 个任务）
    ↓
第六阶段（Spring 实战项目：2 个任务）
```

**依赖说明**：
- 第一阶段是 Spring 生态的根基，IoC、AOP、事务是后续所有模块的基础，必须最先完成
- 第二阶段 Spring Boot 依赖第一阶段的核心概念
- 第三阶段 Spring Cloud 是微服务实战的核心，内容最多
- 第四阶段 Spring Security 相对独立，可灵活调整顺序
- 第五、六阶段依赖前四阶段的知识积累，适合最后完成

---

## VitePress 侧边栏配置更新

当前 config.js 中 spring-ecosystem 侧边栏只有 11 个页面，需要扩展为：

```js
'/spring-ecosystem/': [
  { text: 'Spring 生态', link: '/spring-ecosystem/' },
  {
    text: 'Spring Framework 核心',
    collapsed: false,
    items: [
      { text: 'IoC 与 Bean 生命周期', link: '/spring-ecosystem/spring-framework/ioc' },
      { text: '依赖注入与循环依赖', link: '/spring-ecosystem/spring-framework/di-circular' },
      { text: 'AOP 原理', link: '/spring-ecosystem/spring-framework/aop' },
      { text: '事务管理', link: '/spring-ecosystem/spring-framework/transaction' },
      { text: '事件机制', link: '/spring-ecosystem/spring-framework/event' },
      { text: '扩展点全景', link: '/spring-ecosystem/spring-framework/extension' },
    ]
  },
  {
    text: 'Spring Boot',
    collapsed: false,
    items: [
      { text: '自动配置原理', link: '/spring-ecosystem/spring-boot/' },
      { text: '启动流程', link: '/spring-ecosystem/spring-boot/startup' },
      { text: 'Starter 机制', link: '/spring-ecosystem/spring-boot/starter' },
      { text: '监控与 Actuator', link: '/spring-ecosystem/spring-boot/actuator' },
    ]
  },
  {
    text: 'Spring Cloud',
    collapsed: false,
    items: [
      { text: '微服务架构', link: '/spring-ecosystem/spring-cloud/' },
      { text: '注册与发现', link: '/spring-ecosystem/spring-cloud/registry' },
      { text: '配置中心', link: '/spring-ecosystem/spring-cloud/config' },
      { text: '网关', link: '/spring-ecosystem/spring-cloud/gateway' },
      { text: '负载均衡', link: '/spring-ecosystem/spring-cloud/loadbalance' },
      { text: 'OpenFeign 远程调用', link: '/spring-ecosystem/spring-cloud/openfeign' },
      { text: 'Sentinel 熔断降级', link: '/spring-ecosystem/spring-cloud/sentinel' },
      { text: 'Seata 分布式事务', link: '/spring-ecosystem/spring-cloud/seata' },
    ]
  },
  {
    text: 'Spring Security',
    collapsed: false,
    items: [
      { text: '安全框架', link: '/spring-ecosystem/spring-security/' },
      { text: '认证与授权', link: '/spring-ecosystem/spring-security/auth' },
      { text: 'OAuth2 / JWT', link: '/spring-ecosystem/spring-security/oauth2' },
      { text: '安全漏洞防护', link: '/spring-ecosystem/spring-security/vulnerability' },
    ]
  },
  {
    text: 'Spring 设计模式',
    collapsed: false,
    items: [
      { text: '设计模式全景', link: '/spring-ecosystem/spring-patterns/' },
      { text: '代理·模板·观察者', link: '/spring-ecosystem/spring-patterns/proxy-template-observer' },
      { text: '工厂·策略·责任链', link: '/spring-ecosystem/spring-patterns/factory-strategy-chain' },
    ]
  },
  {
    text: 'Spring 实战项目',
    collapsed: false,
    items: [
      { text: '秒杀系统实战', link: '/spring-ecosystem/spring-projects/seckill' },
      { text: '微服务架构实战', link: '/spring-ecosystem/spring-projects/microservice-project' },
    ]
  },
],
```

---

## 汇总统计

| 阶段 | 模块 | 优先级 | 任务数 | 预计行数 |
|------|------|--------|--------|----------|
| 一 | Spring Framework 核心 | 🔴 最高 | 6 | ~3300 |
| 二 | Spring Boot 深度 | 🔴 最高 | 4 | ~2100 |
| 三 | Spring Cloud 微服务 | 🟠 中高 | 8 | ~4100 |
| 四 | Spring Security 安全 | 🟡 中等 | 4 | ~2050 |
| 五 | Spring 设计模式 | 🟡 中等 | 3 | ~1400 |
| 六 | Spring 实战项目 | 🟠 中高 | 2 | ~1350 |
| **合计** | | | **27** | **~14300** |

---

## 每个文档的面试题要求

每个文档结尾必须包含「⭐ 面试高频问题汇总」章节，至少 **5 条**高频面试题，每道题包含：
- 题目（Q：xxx？）
- 标准答案（要点式回答）
- 关键代码示例（如适用）
- 面试加分提示

---

## 假设与决策

1. **文档风格**：沿用现有 java-advanced 文档的面试导向风格（速览表格 + 章节 + 代码示例 + Mermaid 图表 + 面试问答汇总）
2. **篇幅控制**：每篇 400-700 行，重点内容不超过 800 行，实战项目可达 750 行
3. **VitePress 配置**：需要更新 config.js 侧边栏，新增 spring-framework、spring-patterns、spring-projects 分组
4. **子目录**：需要创建 `spring-framework/`、`spring-patterns/`、`spring-projects/` 三个新子目录，以及填充 `spring-boot/`、`spring-cloud/`、`spring-security/` 现有子目录
5. **推进方式**：按阶段逐步推进，每完成一个阶段用户确认后继续下一阶段
6. **技术栈版本**：以 Spring Boot 3.x / Spring Framework 6.x / Spring Cloud 2023+ / Spring Security 6.x 为基准
7. **面试题数量**：每个文档末尾至少 5 条面试问答，核心文档（如 IoC、AOP、事务）可达 8-10 条

---

## 验证步骤

1. 每完成一个文档，检查 VitePress 侧边栏链接是否正确
2. 确保 Mermaid 图表语法正确，能在 VitePress 中正常渲染
3. 确保代码示例语法正确（Java 代码块使用 `java` 标记）
4. 确保所有容器（tip/warning/danger/info）语法正确
5. 检查每个文档末尾面试问答数量 ≥ 5 条
6. 完成后运行 `npx vitepress dev docs` 验证页面显示效果
7. 确保所有相对链接正确，无死链