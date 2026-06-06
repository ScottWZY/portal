import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'

// 侧边栏配置 - 按知识域分组
const sidebar = {
  '/guide/': [
    { text: '学习导航', link: '/guide/' },
    { text: '知识图谱', link: '/guide/roadmap' },
    { text: '16周学习计划', link: '/guide/plan' },
  ],
  '/java-advanced/': [
    { text: 'Java 高级', link: '/java-advanced/' },
    {
      text: 'JVM',
      collapsed: false,
      items: [
        { text: 'JVM 概览', link: '/java-advanced/jvm/' },
        { text: '内存模型', link: '/java-advanced/jvm/memory-model' },
        { text: '垃圾回收', link: '/java-advanced/jvm/gc' },
        { text: '类加载机制', link: '/java-advanced/jvm/classloader' },
        { text: '性能调优', link: '/java-advanced/jvm/tuning' },
      ]
    },
    {
      text: '并发编程',
      collapsed: false,
      items: [
        { text: '并发基础', link: '/java-advanced/concurrency/' },
        { text: '线程池', link: '/java-advanced/concurrency/threadpool' },
        { text: '锁机制', link: '/java-advanced/concurrency/locks' },
        { text: 'JUC 工具类', link: '/java-advanced/concurrency/juc' },
        { text: '并发编程实战', link: '/java-advanced/concurrency/practice' },
      ]
    },
    {
      text: '集合框架',
      collapsed: false,
      items: [
        { text: '集合概览', link: '/java-advanced/collections/' },
        { text: 'HashMap 源码', link: '/java-advanced/collections/hashmap' },
        { text: 'ConcurrentHashMap', link: '/java-advanced/collections/concurrenthashmap' },
        { text: 'ArrayList vs LinkedList', link: '/java-advanced/collections/list' },
      ]
    },
    {
      text: 'IO/NIO',
      collapsed: false,
      items: [
        { text: 'IO 模型', link: '/java-advanced/io-nio/' },
        { text: 'NIO 核心', link: '/java-advanced/io-nio/nio' },
        { text: 'Netty 入门', link: '/java-advanced/io-nio/netty' },
      ]
    },
    {
      text: '设计模式',
      collapsed: false,
      items: [
        { text: '设计模式概览', link: '/java-advanced/design-patterns/' },
        { text: '创建型模式', link: '/java-advanced/design-patterns/creational' },
        { text: '结构型模式', link: '/java-advanced/design-patterns/structural' },
        { text: '行为型模式', link: '/java-advanced/design-patterns/behavioral' },
      ]
    },
  ],
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
  '/database/': [
    { text: '数据库', link: '/database/' },
    {
      text: 'MySQL',
      collapsed: false,
      items: [
        { text: 'MySQL 核心', link: '/database/mysql/' },
        { text: '索引优化', link: '/database/mysql/index-optimization' },
        { text: 'SQL 优化', link: '/database/mysql/sql-optimization' },
        { text: '事务与锁', link: '/database/mysql/transaction-locking' },
        { text: '日志系统', link: '/database/mysql/logging-system' },
        { text: '分库分表', link: '/database/mysql/sharding' },
        { text: '主从复制', link: '/database/mysql/replication' },
        { text: '选型指南', link: '/database/mysql/selection' },
      ]
    },
    {
      text: 'Oracle',
      collapsed: false,
      items: [
        { text: 'Oracle 核心架构', link: '/database/oracle/' },
        { text: '存储结构', link: '/database/oracle/storage' },
        { text: '事务与锁', link: '/database/oracle/transaction' },
        { text: '优化器与执行计划', link: '/database/oracle/optimizer' },
        { text: '备份恢复', link: '/database/oracle/backup-recovery' },
        { text: '性能调优', link: '/database/oracle/performance' },
        { text: '选型指南', link: '/database/oracle/selection' },
      ]
    },
    {
      text: '国产数据库',
      collapsed: false,
      items: [
        { text: '概览', link: '/database/domestic/' },
        { text: 'OceanBase', link: '/database/domestic/oceanbase' },
        { text: 'TiDB', link: '/database/domestic/tidb' },
        { text: 'openGauss', link: '/database/domestic/opengauss' },
        { text: '达梦 DM8', link: '/database/domestic/dameng' },
        { text: '选型对比', link: '/database/domestic/selection' },
      ]
    },
    {
      text: 'Redis',
      collapsed: false,
      items: [
        { text: 'Redis 核心', link: '/database/redis/' },
        { text: '数据结构', link: '/database/redis/data-structure' },
        { text: '持久化', link: '/database/redis/persistence' },
        { text: '分布式锁', link: '/database/redis/distributed-lock' },
        { text: '缓存策略', link: '/database/redis/cache-strategy' },
        { text: '集群方案', link: '/database/redis/cluster' },
        { text: '选型指南', link: '/database/redis/selection' },
      ]
    },
    {
      text: 'Elasticsearch',
      collapsed: false,
      items: [
        { text: 'ES 核心架构', link: '/database/elasticsearch/' },
        { text: '倒排索引与分词', link: '/database/elasticsearch/inverted-index' },
        { text: '查询与聚合', link: '/database/elasticsearch/dsl-query' },
        { text: '集群架构', link: '/database/elasticsearch/cluster' },
        { text: '性能优化', link: '/database/elasticsearch/performance' },
        { text: '选型指南', link: '/database/elasticsearch/selection' },
      ]
    },
    {
      text: 'MongoDB',
      collapsed: false,
      items: [
        { text: 'MongoDB 核心', link: '/database/mongodb/' },
        { text: '文档模型设计', link: '/database/mongodb/data-model' },
        { text: '查询与索引', link: '/database/mongodb/query-index' },
        { text: '副本集与分片', link: '/database/mongodb/replication-sharding' },
        { text: '事务支持', link: '/database/mongodb/transaction' },
        { text: '选型指南', link: '/database/mongodb/selection' },
      ]
    },
  ],
  '/middleware/': [
    { text: '中间件', link: '/middleware/' },
    {
      text: '分布式理论基础',
      collapsed: false,
      items: [
        { text: '分布式理论', link: '/middleware/distributed-system/' },
        { text: 'CAP 与 BASE', link: '/middleware/distributed-system/cap-base' },
        { text: '一致性协议', link: '/middleware/distributed-system/consensus' },
        { text: '分布式事务', link: '/middleware/distributed-system/transaction' },
        { text: '分布式 ID', link: '/middleware/distributed-system/id-generator' },
      ]
    },
    {
      text: '分布式协调',
      collapsed: false,
      items: [
        { text: 'ZooKeeper 核心', link: '/middleware/distributed-system/zookeeper' },
        { text: 'Nacos 核心', link: '/middleware/distributed-system/nacos' },
        { text: 'Dubbo 核心', link: '/middleware/distributed-system/dubbo' },
      ]
    },
    {
      text: '消息队列',
      collapsed: false,
      items: [
        { text: 'MQ 概览', link: '/middleware/message-queue/' },
        { text: 'Kafka 核心', link: '/middleware/message-queue/kafka' },
        { text: 'RocketMQ 核心', link: '/middleware/message-queue/rocketmq' },
        { text: '消息可靠性', link: '/middleware/message-queue/reliability' },
      ]
    },
  ],
  '/high-concurrency/': [
    { text: '高并发架构', link: '/high-concurrency/' },
    {
      text: '设计模式',
      collapsed: false,
      items: [
        { text: '高并发设计模式', link: '/high-concurrency/design-patterns/' },
        { text: '限流算法', link: '/high-concurrency/design-patterns/rate-limiter' },
        { text: '降级与熔断', link: '/high-concurrency/design-patterns/circuit-breaker' },
        { text: '缓存策略', link: '/high-concurrency/design-patterns/caching' },
        { text: '异步处理', link: '/high-concurrency/design-patterns/async' },
      ]
    },
    {
      text: '分布式理论',
      collapsed: false,
      items: [
        { text: '分布式理论总览', link: '/high-concurrency/distributed-theory/' },
        { text: 'CAP 与 BASE', link: '/high-concurrency/distributed-theory/cap-base' },
        { text: '一致性协议', link: '/high-concurrency/distributed-theory/consensus-protocol' },
        { text: '分布式事务', link: '/high-concurrency/distributed-theory/distributed-transaction' },
        { text: '分布式 ID', link: '/high-concurrency/distributed-theory/distributed-id' },
        { text: '分布式锁', link: '/high-concurrency/distributed-theory/distributed-lock' },
      ]
    },
    {
      text: '架构分层与扩展',
      collapsed: false,
      items: [
        { text: '架构扩展总览', link: '/high-concurrency/architecture-scaling/' },
        { text: '负载均衡', link: '/high-concurrency/architecture-scaling/load-balancing' },
        { text: '服务发现与注册', link: '/high-concurrency/architecture-scaling/service-discovery' },
        { text: '动静分离与读写分离', link: '/high-concurrency/architecture-scaling/static-dynamic-separation' },
        { text: '多活架构与链路追踪', link: '/high-concurrency/architecture-scaling/multi-active-tracing' },
        { text: '数据库连接池优化', link: '/high-concurrency/architecture-scaling/connection-pool-optimization' },
      ]
    },
    {
      text: '性能测试与容量规划',
      collapsed: false,
      items: [
        { text: '性能测试总览', link: '/high-concurrency/performance-testing/' },
        { text: 'JMH 微基准测试', link: '/high-concurrency/performance-testing/jmh-benchmark' },
        { text: '全链路压测', link: '/high-concurrency/performance-testing/full-link-testing' },
      ]
    },
    {
      text: '监控告警体系',
      collapsed: false,
      items: [
        { text: '监控告警总览', link: '/high-concurrency/monitoring-alerting/' },
        { text: '指标采集与 Prometheus', link: '/high-concurrency/monitoring-alerting/metrics-prometheus' },
        { text: '告警体系设计', link: '/high-concurrency/monitoring-alerting/alerting-design' },
      ]
    },
    {
      text: '高并发安全',
      collapsed: false,
      items: [
        { text: '网络安全', link: '/high-concurrency/security/network-security' },
      ]
    },
    {
      text: '大厂案例',
      collapsed: false,
      items: [
        { text: '大厂案例总览', link: '/high-concurrency/real-cases/' },
        { text: '12306 票务系统', link: '/high-concurrency/real-cases/12306-architecture' },
        { text: '双十一架构演进', link: '/high-concurrency/real-cases/double-11-evolution' },
      ]
    },
    {
      text: '系统设计',
      collapsed: false,
      items: [
        { text: '系统设计方法论', link: '/high-concurrency/system-design/' },
        { text: '秒杀系统', link: '/high-concurrency/system-design/seckill' },
        { text: '短链接系统', link: '/high-concurrency/system-design/short-url' },
        { text: 'IM 系统', link: '/high-concurrency/system-design/im' },
        { text: 'Feed 流系统', link: '/high-concurrency/system-design/feed' },
        { text: '文件上传系统', link: '/high-concurrency/system-design/file-upload' },
        { text: '排行榜系统', link: '/high-concurrency/system-design/leaderboard' },
        { text: '消息推送系统', link: '/high-concurrency/system-design/push-notification' },
      ]
    },
  ],
  '/ai-application/': [
    { text: 'AI 应用', link: '/ai-application/' },
    {
      text: '方法论',
      collapsed: false,
      items: [
        { text: 'AI 应用方法论', link: '/ai-application/methodology/' },
      ]
    },
    {
      text: 'LLM 基础',
      collapsed: false,
      items: [
        { text: '大模型概览', link: '/ai-application/llm-basics/' },
        { text: '主流模型对比', link: '/ai-application/llm-basics/models' },
        { text: 'Token 与上下文', link: '/ai-application/llm-basics/token' },
        {
          text: '模型选型',
          collapsed: true,
          items: [
            { text: '选型方法论', link: '/ai-application/llm-basics/model-selection/' },
            { text: '能力矩阵', link: '/ai-application/llm-basics/model-selection/capability-matrix' },
            { text: '场景匹配', link: '/ai-application/llm-basics/model-selection/scenario-matching' },
          ]
        },
      ]
    },
    {
      text: 'Prompt 工程',
      collapsed: false,
      items: [
        { text: 'Prompt 设计', link: '/ai-application/prompt-engineering/' },
        { text: '高级技巧', link: '/ai-application/prompt-engineering/advanced' },
        { text: '结构化输出', link: '/ai-application/prompt-engineering/structured-output' },
      ]
    },
    {
      text: 'RAG',
      collapsed: false,
      items: [
        { text: 'RAG 原理', link: '/ai-application/rag/' },
        { text: '向量数据库', link: '/ai-application/rag/vector-db' },
        { text: 'RAG 优化', link: '/ai-application/rag/optimization' },
        { text: 'RAG 评估', link: '/ai-application/rag/evaluation' },
        { text: '高级 RAG', link: '/ai-application/rag/advanced' },
      ]
    },
    {
      text: 'Agent 与 MCP',
      collapsed: false,
      items: [
        { text: 'Agent 架构', link: '/ai-application/agent/' },
        { text: '工具调用', link: '/ai-application/agent/function-call' },
        { text: '多 Agent 协作', link: '/ai-application/agent/multi-agent' },
        { text: '记忆系统', link: '/ai-application/agent/memory' },
        { text: '框架对比', link: '/ai-application/agent/frameworks' },
        { text: 'MCP 协议', link: '/ai-application/mcp/' },
        { text: 'MCP 原语', link: '/ai-application/mcp/tools-resources' },
        { text: 'Server 开发', link: '/ai-application/mcp/server-dev' },
      ]
    },
    {
      text: 'LangChain 生态',
      collapsed: false,
      items: [
        { text: 'LangChain 入门', link: '/ai-application/langchain/' },
        { text: 'Chain 与 Memory', link: '/ai-application/langchain/chain' },
        { text: '实战案例', link: '/ai-application/langchain/practice' },
        { text: '编排框架对比', link: '/ai-application/langchain/ecosystem' },
      ]
    },
    {
      text: '模型部署',
      collapsed: false,
      items: [
        { text: '部署方案', link: '/ai-application/deployment/' },
        { text: 'vLLM 生产部署', link: '/ai-application/deployment/vllm' },
        { text: 'Ollama 本地开发', link: '/ai-application/deployment/ollama' },
      ]
    },
    {
      text: '低代码平台',
      collapsed: false,
      items: [
        { text: '平台对比', link: '/ai-application/low-code/' },
      ]
    },
    {
      text: 'AI 安全',
      collapsed: false,
      items: [
        { text: '安全防护', link: '/ai-application/security/' },
      ]
    },
    {
      text: '企业落地',
      collapsed: false,
      items: [
        { text: '落地方法论', link: '/ai-application/enterprise/' },
        { text: '成本优化', link: '/ai-application/enterprise/cost-optimization' },
      ]
    },
    {
      text: '实战项目',
      collapsed: false,
      items: [
        { text: '项目总览', link: '/ai-application/projects/' },
        { text: '知识库问答', link: '/ai-application/projects/project1-knowledge-qa' },
        { text: 'AI 代码助手', link: '/ai-application/projects/project2-code-assistant' },
        { text: '智能数据分析', link: '/ai-application/projects/project3-data-analysis' },
      ]
    },
    {
      text: 'Python 入门',
      collapsed: false,
      items: [
        { text: 'Python 基础', link: '/ai-application/python-basics/' },
        { text: 'AI 开发库', link: '/ai-application/python-basics/ai-libs' },
        { text: '虚拟环境', link: '/ai-application/python-basics/venv' },
      ]
    },
  ],
  '/frontend/': [
    { text: '前端', link: '/frontend/' },
    {
      text: 'Vue 3',
      collapsed: false,
      items: [
        { text: 'Vue 3 核心', link: '/frontend/vue3/' },
        { text: '组合式 API', link: '/frontend/vue3/composition-api' },
        { text: '状态管理', link: '/frontend/vue3/state-management' },
        { text: 'Vite 构建', link: '/frontend/vue3/vite' },
      ]
    },
  ],
  '/devops/': [
    { text: 'DevOps', link: '/devops/' },
    {
      text: 'Docker',
      collapsed: false,
      items: [
        { text: 'Docker 基础', link: '/devops/docker/' },
        { text: 'Dockerfile', link: '/devops/docker/dockerfile' },
        { text: 'Docker Compose', link: '/devops/docker/compose' },
      ]
    },
    {
      text: 'CI/CD',
      collapsed: false,
      items: [
        { text: 'CI/CD 流程', link: '/devops/cicd/' },
        { text: 'GitHub Actions', link: '/devops/cicd/github-actions' },
      ]
    },
  ],
  '/interview/': [
    { text: '面试冲刺', link: '/interview/' },
    {
      text: '面试策略',
      collapsed: false,
      items: [
        { text: '策略与准备', link: '/interview/strategy' },
        { text: '知识体系串联', link: '/interview/knowledge-integration' },
        { text: '简历优化', link: '/interview/resume' },
      ]
    },
    {
      text: '算法',
      collapsed: false,
      items: [
        { text: '刷题指南', link: '/interview/algorithm/' },
        { text: '高频题汇总', link: '/interview/algorithm/hot-questions' },
      ]
    },
    {
      text: '系统设计',
      collapsed: false,
      items: [
        { text: '面试技巧', link: '/interview/system-design/' },
      ]
    },
    {
      text: '行为面试',
      collapsed: false,
      items: [
        { text: 'STAR 法则', link: '/interview/behavioral/' },
      ]
    },
    {
      text: '面试实战',
      collapsed: false,
      items: [
        { text: '高频真题速查', link: '/interview/hot-qa' },
        { text: '软技能与沟通', link: '/interview/soft-skills' },
        { text: '模拟面试', link: '/interview/mock-interview' },
      ]
    },
  ],
}

export default withMermaid({
  title: '高级工程师面试 Wiki',
  description: '高级工程师 / AI 应用工程师面试准备知识库',
  lang: 'zh-CN',
  base: '/',
  cleanUrls: true,
  themeConfig: {
    logo: '/logo.svg',
    nav: [
      { text: '首页', link: '/' },
      { text: '学习导航', link: '/guide/' },
      { text: 'Java 高级', link: '/java-advanced/' },
      { text: 'Spring', link: '/spring-ecosystem/' },
      { text: '数据库', link: '/database/' },
      { text: '中间件', link: '/middleware/' },
      { text: '高并发', link: '/high-concurrency/' },
      { text: 'AI 应用', link: '/ai-application/' },
      { text: '面试冲刺', link: '/interview/' },
    ],
    sidebar: sidebar,
    socialLinks: [
      { icon: 'github', link: 'https://github.com' }
    ],
    footer: {
      message: '基于 VitePress 构建',
      copyright: 'MIT Licensed'
    },
    search: {
      provider: 'local'
    },
    outline: {
      level: [2, 3],
      label: '本页目录'
    },
    docFooter: {
      prev: '上一页',
      next: '下一页'
    },
    lastUpdated: {
      text: '最后更新于'
    },
    editLink: {
      pattern: 'https://github.com',
      text: '在 GitHub 上编辑此页'
    },
  },
  markdown: {
    lineNumbers: true,
    container: {
      tipLabel: '提示',
      warningLabel: '注意',
      dangerLabel: '警告',
      infoLabel: '信息',
      detailsLabel: '详情'
    }
  }
})