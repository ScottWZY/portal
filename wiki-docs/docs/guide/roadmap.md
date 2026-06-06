# 高级工程师 / AI应用工程师 面试准备知识图谱

> **创建日期：** 2026-06-06  
> **适用岗位：** 高级Java工程师、AI应用工程师、技术专家  
> **目标公司：** 一线互联网/科技公司（BAT、TMD、字节、蚂蚁等）

---

## 一、知识图谱总览

<Mermaid id="mermaid-src-0" />
<div id="mermaid-src-0" v-pre style="display:none">
mindmap
root(面试知识图谱)
    后端基础⭐⭐⭐⭐⭐
      Java核心
      Spring生态
      数据库
      中间件
    架构能力⭐⭐⭐⭐⭐
      高并发设计
      分布式系统
      微服务治理
    工程素养⭐⭐⭐⭐
      DevOps
      代码质量
      系统设计
    AI专项⭐⭐⭐⭐
      LLM原理
      RAG架构
      Agent开发
      Prompt工程
    前端基础⭐⭐⭐
      Vue3核心
    面试技巧⭐⭐⭐⭐⭐
      算法题
      系统设计题
      行为面试
</div>

---

## 二、详细知识域图谱

### 2.1 Java高级知识域

> [!TIP]
> **Java高级**是整个后端技术栈的基石，所有上层框架和中间件的理解都依赖于此。面试中占比约 **25%~30%**。

<Mermaid id="mermaid-src-1" />
<div id="mermaid-src-1" v-pre style="display:none">
mindmap
root(Java高级 难度:⭐⭐⭐⭐⭐ 重要度:⭐⭐⭐⭐⭐)
    JVM
      内存模型
        堆 / 栈 / 方法区 / 元空间
        直接内存
      类加载机制
        双亲委派模型
        自定义类加载器
      垃圾回收
        GC算法
        G1 / ZGC / Shenandoah
        GC调优实战
      JIT编译
        C1 / C2编译器
        逃逸分析
    并发编程
      线程基础
        线程生命周期
        线程池原理
      JUC工具
        AQS原理
        ReentrantLock
        CountDownLatch / CyclicBarrier
        Semaphore
      并发容器
        ConcurrentHashMap
        CopyOnWriteArrayList
      synchronized
        锁升级机制
      原子类
        CAS原理
        LongAdder
      volatile
        内存屏障
    集合框架
      HashMap
        底层结构 / 红黑树
        扩容机制
      ArrayList / LinkedList
      TreeMap
      LinkedHashMap
    IO模型
      BIO / NIO / AIO
      Netty框架
        Reactor模型
        零拷贝
    设计模式
      创建型
        单例 / 工厂 / 建造者
      结构型
        代理 / 适配器 / 装饰器
      行为型
        观察者 / 策略 / 责任链
</div>

---

### 2.2 Spring生态知识域

> [!TIP]
> **Spring生态**是Java后端开发的标配，70%以上企业项目均基于此构建。面试中占比约 **20%~25%**。

<Mermaid id="mermaid-src-2" />
<div id="mermaid-src-2" v-pre style="display:none">
mindmap
root(Spring生态 难度:⭐⭐⭐⭐ 重要度:⭐⭐⭐⭐⭐)
    Spring Boot
      自动配置原理
        @SpringBootApplication
        条件注解
      启动流程
        run方法源码
      配置管理
        外部化配置
        profile切换
      监控
        Actuator
      嵌入式容器
        Tomcat / Undertow
    Spring Cloud
      服务注册与发现
        Nacos / Eureka
        CAP取舍
      配置中心
        Nacos Config
        动态刷新
      负载均衡
        Ribbon / LoadBalancer
      远程调用
        OpenFeign
        gRPC
      网关
        Gateway
        限流 / 鉴权
      熔断降级
        Sentinel
        规则持久化
      链路追踪
        SkyWalking
    Spring Security
      认证流程
        Filter链
        UsernamePasswordAuth
      授权模型
        RBAC
        方法级权限
      OAuth2 / JWT
      SSO单点登录
</div>

---

### 2.3 数据库知识域

> [!WARNING]
> 数据库是面试的**绝对核心**，几乎所有系统设计题都涉及存储方案设计。面试中占比约 **15%~20%**。

<Mermaid id="mermaid-src-3" />
<div id="mermaid-src-3" v-pre style="display:none">
mindmap
root(数据库 难度:⭐⭐⭐⭐ 重要度:⭐⭐⭐⭐⭐)
    MySQL
      架构原理
        InnoDB存储引擎
        Buffer Pool
        Redo / Undo Log
        Binlog
      索引
        B+Tree原理
        聚簇索引 / 二级索引
        覆盖索引
        索引下推
      事务
        ACID特性
        MVCC机制
        隔离级别
      锁机制
        行锁 / 表锁 / 间隙锁
        死锁排查
      SQL优化
        Explain分析
        慢查询日志
        分库分表
      高可用
        主从复制
        MGR集群
    Redis
      数据结构
        String / Hash / List
        Set / ZSet
        HyperLogLog / Bitmaps
      底层实现
        SDS / 跳跃表 / 压缩列表
      持久化
        RDB / AOF混合
      淘汰策略
        LRU / LFU
      集群方案
        主从 / 哨兵 / Cluster
        数据分片
      缓存问题
        穿透 / 击穿 / 雪崩
      分布式锁
        RedLock
</div>

---

### 2.4 中间件知识域

> [!INFO]
> 中间件是**高级工程师**区别于普通工程师的关键分野，大厂面试中必问。面试占比约 **10%~15%**。

<Mermaid id="mermaid-src-4" />
<div id="mermaid-src-4" v-pre style="display:none">
mindmap
root(中间件 难度:⭐⭐⭐⭐⭐ 重要度:⭐⭐⭐⭐)
    消息队列
      Kafka
        高吞吐原理
        零拷贝 / 顺序写
        ISR机制
        Exactly Once语义
        Partition分配
      RocketMQ
        事务消息
        延迟消息
        架构对比Kafka
      RabbitMQ
        交换机类型
        死信队列
        消息确认
      MQ通用问题
        重复消费
        消息丢失
        消息顺序性
    分布式协调
      Zookeeper
        ZAB协议
        Watcher机制
        分布式锁 / 选举
      配置中心
        灰度发布
        版本管理
    搜索引擎
      Elasticsearch
        倒排索引
        分词器
        集群分片
</div>

---

### 2.5 高并发架构知识域

> [!WARNING]
> 高并发架构是**P6+/P7**的分水岭，直接影响定级。大厂必考系统设计题。面试占比约 **15%~20%**。

<Mermaid id="mermaid-src-5" />
<div id="mermaid-src-5" v-pre style="display:none">
mindmap
root(高并发架构 难度:⭐⭐⭐⭐⭐ 重要度:⭐⭐⭐⭐⭐)
    流量控制
      限流算法
        令牌桶 / 漏桶
        滑动窗口
      降级策略
        自动降级
        人工降级
      熔断机制
        熔断器状态机
        半开探活
    系统设计
      秒杀系统
        异步下单
        库存预热
        削峰填谷
      短链系统
        hash算法
        发号器
      红包系统
        二倍均值算法
        Lua脚本
      推送系统
        长连接 / WebSocket
        多通道触达
    数据一致性
      分布式事务
        TCC / Saga
        AT模式(Seata)
      最终一致性
        本地消息表
        MQ可靠投递
    容量规划
      QPS评估
      扩容缩容
</div>

---

### 2.6 AI应用知识域

> [!TIP]
> **AI应用工程**是2024-2026年最热门方向，人才缺口大，薪资溢价明显。面试占比约 **20%~25%**（AI应用工程师岗可达40%）。

<Mermaid id="mermaid-src-6" />
<div id="mermaid-src-6" v-pre style="display:none">
mindmap
root(AI应用 难度:⭐⭐⭐⭐ 重要度:⭐⭐⭐⭐⭐)
    LLM基础
      Transformer架构
        Self-Attention
        Multi-Head
      GPT系列原理
        预训练 / 微调
        RLHF
      开源模型
        LLaMA / Qwen
        DeepSeek
      API调用
        OpenAI API
        流式输出
        Function Calling
    RAG架构
      文档处理
        文档分割策略
        Embedding模型选型
      向量数据库
        Milvus / Chroma
        Pinecone
      检索优化
        混合检索
        重排序Reranker
      评估体系
        RAGAS评估
    Agent开发
      规划能力
        ReAct模式
        Chain-of-Thought
      工具调用
        Tool定义
        多工具编排
      记忆模块
        短期记忆
        长期记忆
      多Agent协作
        角色分工
        消息传递
    LangChain生态
      Chain组件
      LCEL表达式
      LangGraph
      LangSmith监控
    Prompt工程
      Few-Shot
      Chain-of-Thought
      Self-Consistency
      Prompt模板管理
      安全性
        Prompt注入防范
</div>

---

### 2.7 前端知识域

> [!INFO]
> 前端知识对**AI应用工程师**尤为重要（Demo展示、内部工具开发）。面试占比约 **5%~10%**。

<Mermaid id="mermaid-src-7" />
<div id="mermaid-src-7" v-pre style="display:none">
mindmap
root(前端 难度:⭐⭐⭐ 重要度:⭐⭐⭐)
    Vue3
      响应式原理
        Proxy
        Ref / Reactive
      Composition API
        setup语法糖
        Hooks设计
      组件通信
        Props / Emits
        Provide / Inject
      Pinia状态管理
      路由
        Vue Router
        导航守卫
      工程化
        Vite构建
        TypeScript集成
      组件库
        Element Plus
        Ant Design Vue
</div>

---

### 2.8 DevOps知识域

> [!INFO]
> DevOps体现**工程素养**，高级工程师需要具备端到端交付能力。面试占比约 **5%~10%**。

<Mermaid id="mermaid-src-8" />
<div id="mermaid-src-8" v-pre style="display:none">
mindmap
root(DevOps 难度:⭐⭐⭐ 重要度:⭐⭐⭐⭐)
    Docker
      镜像原理
        UnionFS
        多阶段构建
      容器编排
        Docker Compose
      网络 / 存储
    Kubernetes
      Pod / Service
      Deployment
      Ingress
    CI/CD
      Jenkins Pipeline
      GitHub Actions
      灰度发布
      蓝绿部署
    监控告警
      Prometheus
      Grafana
      ELK日志
</div>

---

### 2.9 面试技巧知识域

<Mermaid id="mermaid-src-9" />
<div id="mermaid-src-9" v-pre style="display:none">
mindmap
root(面试技巧 难度:⭐⭐⭐⭐ 重要度:⭐⭐⭐⭐⭐)
    算法
      数据结构
        树 / 图 / 堆
        并查集 / 字典树
      核心算法
        二分 / 双指针
        DP / 贪心
        BFS / DFS / 回溯
      刷题策略
        LeetCode Hot100
        按类型刷
        模拟面试
    系统设计
      设计框架
        4S方法
        容量估算
      经典题目
        设计短链
        设计秒杀
        设计IM
        设计Feed流
      答题技巧
        需求澄清
        方案对比
        容量演算
    行为面试
      STAR法则
      项目深挖
      技术难点
      团队协作
      冲突处理
</div>

---

## 三、知识域依赖关系

> 箭头方向表示「前置依赖关系」—— 只有掌握了前置知识，才能有效学习后续内容。

<Mermaid id="mermaid-src-10" />
<div id="mermaid-src-10" v-pre style="display:none">
flowchart LR
    %% ============ 样式定义 ============
    classDef java fill:#dbeafe,stroke:#2563eb,stroke-width:2px,color:#1e40af
    classDef db fill:#dcfce7,stroke:#16a34a,stroke-width:2px,color:#166534
    classDef spring fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#92400e
    classDef arch fill:#fce7f3,stroke:#db2777,stroke-width:2px,color:#9d174d
    classDef middleware fill:#f3e8ff,stroke:#9333ea,stroke-width:2px,color:#581c87
    classDef ai fill:#e0f2fe,stroke:#0284c7,stroke-width:2px,color:#075985
    classDef interview fill:#fff7ed,stroke:#ea580c,stroke-width:2px,color:#9a3412
    classDef highlight fill:#fef2f2,stroke:#dc2626,stroke-width:3px,color:#991b1b,font-weight:bold

    %% ============ Java 核心基础 ============
    subgraph G1["☕ Java 核心基础"]

        JVM["JVM 内存模型<br>GC / 类加载"]:::java
        CON["并发编程<br>JUC / 锁 / 线程池"]:::java
        COL["集合源码<br>HashMap / ConcurrentHashMap"]:::java
    end

    %% ============ 数据库 ============
    subgraph G2["🗄️ 数据库与缓存"]

        MYSQL["MySQL 深度<br>索引 / 事务 / 分库分表"]:::db
        REDIS["Redis 核心<br>数据结构 / 缓存策略"]:::db
    end

    %% ============ Spring 生态 ============
    subgraph G3["🌿 Spring 生态"]

        SB["Spring Boot<br>自动配置 / 启动流程"]:::spring
        SC["Spring Cloud<br>微服务全家桶"]:::spring
    end

    %% ============ 中间件与架构 ============
    subgraph G4["⚙️ 中间件与分布式"]

        MQ["消息队列<br>Kafka / RocketMQ"]:::middleware
        DS["分布式理论<br>CAP / 一致性 / 事务"]:::middleware
    end

    %% ============ 高并发 ============
    subgraph G5["⚡ 高并发架构"]

        RATE["限流 / 降级 / 熔断"]:::arch
        DESIGN["系统设计实战<br>秒杀 / 短链 / IM"]:::arch
    end

    %% ============ AI 应用 ============
    subgraph G6["🤖 AI 应用"]

        LLM["LLM 基础<br>Transformer / API 调用"]:::ai
        RAG["RAG 架构<br>向量库 / 检索增强"]:::ai
        AGENT["Agent 开发<br>LangChain / 工具调用"]:::ai
        PROMPT["Prompt 工程<br>模板 / 安全"]:::ai
    end

    %% ============ 面试 ============
    subgraph G7["🎯 面试冲刺"]
        ALGO["算法刷题<br>Hot100 + 高频"]:::interview
        SYS["系统设计面试<br>4S 方法 / 经典题"]:::interview
        BEHAVIOR["行为面试<br>STAR / 项目深挖"]:::interview
    end

    %% ============ 依赖连线 ============
    %% 基础 → 数据库
    JVM --> MYSQL
    CON --> MYSQL

    %% 基础 → Spring
    JVM --> SB
    COL --> SB
    CON --> SC

    %% 数据库 → 中间件
    MYSQL --> MQ
    REDIS --> DESIGN

    %% 基础 → 架构
    CON --> RATE
    CON --> DESIGN

    %% 中间件 → 分布式
    MQ --> DS

    %% Spring → 架构
    SB --> SC
    SC --> DESIGN
    DS --> DESIGN

    %% AI 依赖
    MYSQL -.->|"知识库存储"| RAG
    JVM --> LLM
    LLM --> RAG
    RAG --> AGENT
    LLM --> PROMPT

    %% 面试依赖
    DESIGN --> SYS
    DS --> SYS
    CON --> ALGO
    JVM --> ALGO

    %% 最终汇聚
    SYS --> BEHAVIOR
    ALGO --> BEHAVIOR

    %% ============ 高亮关键路径 ============
    JVM ---|"⚡ 高优路径"| CON
    CON ---|"⚡ 高优路径"| RATE
    RATE ---|"⚡ 高优路径"| DESIGN
    LLM ---|"⚡ 高优路径"| RAG
</div>

---

## 四、技术路线图（学习路线建议）

> 以下展示了从当前基础到面试通关的完整学习路径，从左到右逐步递进，每个阶梯内的箭头表示推荐学习顺序。

<Mermaid id="mermaid-src-11" />
<div id="mermaid-src-11" v-pre style="display:none">
flowchart LR
    %% ============ 阶段一：夯实基础 ============
    subgraph S1["📘 第一阶段·夯实基础"]

        S1_TITLE["第 1 ~ 4 周 · 每天 3h"]:::stage1Title
        S1A(("Java高级<br>JVM/并发/集合")):::stage1
        S1B("MySQL 深度<br>索引/事务/锁"):::stage1
        S1C("Redis 核心<br>数据结构/缓存"):::stage1
        S1A --> S1B --> S1C
    end

    %% ============ 阶段二：架构提升 ============
    subgraph S2["🏗️ 第二阶段·架构提升"]

        S2_TITLE["第 5 ~ 8 周 · 每天 3h"]:::stage2Title
        S2A("Spring Boot<br>自动配置原理"):::stage2
        S2B("Spring Cloud<br>微服务架构"):::stage2
        S2C("中间件<br>Kafka / RocketMQ"):::stage2
        S2A --> S2B --> S2C
    end

    %% ============ 阶段三 ============
    subgraph S3["🤖 第三阶段·AI 应用"]

        S3_TITLE["第 9 ~ 12 周 · 每天 3h"]:::stage3Title
        S3A("LLM 基础<br>Transformer / API"):::stage3
        S3B("RAG 实战<br>向量库 / 检索"):::stage3
        S3C("Agent 开发<br>LangChain / 工具"):::stage3
        S3A --> S3B --> S3C
    end

    %% ============ 阶段四 ============
    subgraph S4["🎯 第四阶段·面试冲刺"]

        S4_TITLE["第 13 ~ 16 周 · 每天 4h"]:::stage4Title
        S4A("算法刷题<br>Hot100 + 高频"):::stage4
        S4B("系统设计<br>经典题 / 模拟"):::stage4
        S4C("行为面试<br>STAR / 项目复盘"):::stage4
        S4A --> S4B --> S4C
    end

    %% ============ 阶梯间连接 ============
    S1 ===>|"基础过关 →"| S2
    S2 ===>|"架构掌握 →"| S3
    S3 ===>|"AI 实战 →"| S4

    %% ============ 里程碑节点 ============
    M1((✓)):::milestone
    M2((✓)):::milestone
    M3((✓)):::milestone
    M4((🏆)):::final

    S1 -.-> M1
    S2 -.-> M2
    S3 -.-> M3
    S4 -.-> M4

    %% ============ 样式定义 ============
    classDef stage1 fill:#dbeafe,stroke:#2563eb,stroke-width:2px,color:#1e40af,r:10px
    classDef stage1Title fill:#bfdbfe,stroke:none,color:#1e3a5f,font-weight:bold,font-size:14px
    classDef stage2 fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#92400e,r:10px
    classDef stage2Title fill:#fde68a,stroke:none,color:#78350f,font-weight:bold,font-size:14px
    classDef stage3 fill:#dcfce7,stroke:#16a34a,stroke-width:2px,color:#166534,r:10px
    classDef stage3Title fill:#bbf7d0,stroke:none,color:#14532d,font-weight:bold,font-size:14px
    classDef stage4 fill:#f3e5f5,stroke:#9333ea,stroke-width:2px,color:#581c87,r:10px
    classDef stage4Title fill:#e9d5ff,stroke:none,color:#3b0764,font-weight:bold,font-size:14px
    classDef milestone fill:#ffffff,stroke:#6b7280,stroke-width:2px,color:#374151
    classDef final fill:#fef2f2,stroke:#dc2626,stroke-width:3px,color:#991b1b
</div>

### 各阶段核心目标与产出

| 阶段 | 时间 | 核心目标 | 关键产出 | 难度 |
|------|------|----------|----------|------|
| **📘 夯实基础** | 第1-4周 | 源码级理解 Java 核心、MySQL 索引/事务 | 完成 java-core 示例、JVM 笔记 | ⭐⭐⭐⭐ |
| **🏗️ 架构提升** | 第5-8周 | 掌握微服务架构、中间件原理与实战 | 搭建微服务 Demo、MQ 实践 | ⭐⭐⭐⭐⭐ |
| **🤖 AI 应用** | 第9-12周 | 独立搭建 RAG 系统、开发 Agent 应用 | 完成 RAG Chatbot、Agent 项目 | ⭐⭐⭐⭐ |
| **🎯 面试冲刺** | 第13-16周 | 算法题量 100+、系统设计 5+ 模拟 | 刷题记录、项目复盘文档 | ⭐⭐⭐⭐⭐ |

---

## 五、学习时间线总览（甘特图）

> 以下甘特图清晰展示了 16 周的完整学习节奏，每项任务的「前置依赖」和「并行关系」一目了然。

<Mermaid id="mermaid-src-12" />
<div id="mermaid-src-12" v-pre style="display:none">
gantt
    title 高级工程师 / AI 应用工程师 面试准备时间线
    dateFormat  YYYY-MM-DD
    axisFormat  第%W周
    tickInterval 1week

    section 📘 第一阶段·夯实基础
    JVM 内存模型与调优           :a1, 2026-06-08, 7d
    并发编程（JUC/锁/线程池）    :a2, after a1, 7d
    集合源码解析                 :a3, after a2, 5d
    MySQL 索引与事务             :a4, after a1, 7d
    Redis 核心数据结构           :a5, after a4, 5d
    设计模式复习                 :a6, after a3, 3d
    阶段一自检 + 整理笔记        :a7, after a6, 2d

    section 🏗️ 第二阶段·架构提升
    Spring Boot 核心原理         :b1, after a7, 5d
    Spring Cloud 微服务          :b2, after b1, 7d
    Spring Security + OAuth2     :b3, after b2, 3d
    Kafka / RocketMQ 消息队列     :b4, after b1, 7d
    分布式理论 + 一致性协议      :b5, after b4, 5d
    高并发设计（限流/熔断/降级）  :b6, after b5, 5d
    阶段二自检 + 项目实战        :b7, after b6, 3d

    section 🤖 第三阶段·AI 应用
    LLM 基础（Transformer/API）   :c1, after b7, 5d
    RAG 架构 + 向量数据库         :c2, after c1, 7d
    Agent 开发（LangChain）       :c3, after c2, 7d
    Prompt 工程实践               :c4, after c1, 3d
    阶段三自检 + AI 项目实战      :c5, after c3, 5d

    section 🎯 第四阶段·面试冲刺
    LeetCode Hot100 刷题          :d1, after c5, 10d
    系统设计面试（5+ 经典题）     :d2, after c5, 8d
    行为面试（STAR + 项目梳理）   :d3, after d2, 4d
    模拟面试 + 查漏补缺           :d4, after d3, 4d
    简历优化 + 投递准备           :d5, after d4, 2d
</div>

> **使用建议：** 甘特图中的日期为示例，建议根据自己的实际开始日期调整 `dateFormat`。每项任务可以按实际进度自主调整时长。

---

## 六、各阶段时间与精力分配建议

| 阶段 | 时间预算 | 精力占比 | 重点产出 |
|------|----------|----------|----------|
| 夯实基础 | 2~4 周 | 25% | 源码级理解Java核心、MySQL索引/事务 |
| 架构提升 | 3~5 周 | 35% | 独立完成高并发系统设计、微服务架构设计 |
| AI专项 | 3~4 周 | 25% | 独立搭建RAG系统、开发Agent应用 |
| 冲刺面试 | 2~3 周 | 15% | 刷完Hot100、完成5+系统设计模拟 |

---

## 七、推荐资源

### 书籍

| 书名 | 适用阶段 | 说明 |
|------|----------|------|
| 《深入理解Java虚拟机(第3版)》 | 夯实基础 | JVM圣经，必读 |
| 《Java并发编程的艺术》 | 夯实基础 | JUC深入理解 |
| 《高性能MySQL(第4版)》 | 夯实基础 | MySQL必读 |
| 《Redis设计与实现》 | 夯实基础 | Redis源码级讲解 |
| 《Spring Boot编程思想》 | 架构提升 | Spring Boot深入 |
| 《企业IT架构转型之道》 | 架构提升 | 阿里巴巴中台实践 |
| 《设计数据密集型应用》(DDIA) | 架构提升 | 分布式系统圣经 |
| 《大规模分布式存储系统》 | 架构提升 | 分布式存储实践 |

### 在线资源

| 资源 | 说明 |
|------|------|
| LeetCode Hot100 | 算法刷题首选 |
| 小林Coding 图解系列 | 计算机基础图解 |
| LangChain官方文档 | AI应用开发权威参考 |
| DeepLearning.AI Short Courses | LLM/RAG/Agent短期课程 |
| GitHub Trending (LangChain/AutoGPT) | 跟踪AI应用最新动态 |
| 各大厂技术博客 (美团/字节/阿里) | 实战案例最佳来源 |

---

> [!WARNING]
> **注意：** 面试准备是一个系统工程，建议至少预留 **10~15 周** 的完整准备时间。  
> 如果同时准备 **AI应用工程师** 方向，AI专项部分需要额外增加 2~3 周深入实战。  
> 切忌跳过基础直接看面经，扎实的内功才是面试通关的根本保障。