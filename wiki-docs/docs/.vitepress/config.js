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
      text: 'Spring Boot',
      collapsed: false,
      items: [
        { text: '自动配置原理', link: '/spring-ecosystem/spring-boot/' },
        { text: '启动流程', link: '/spring-ecosystem/spring-boot/startup' },
        { text: 'Starter 机制', link: '/spring-ecosystem/spring-boot/starter' },
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
      ]
    },
    {
      text: 'Spring Security',
      collapsed: false,
      items: [
        { text: '安全框架', link: '/spring-ecosystem/spring-security/' },
        { text: '认证与授权', link: '/spring-ecosystem/spring-security/auth' },
        { text: 'OAuth2/JWT', link: '/spring-ecosystem/spring-security/oauth2' },
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
        { text: '事务与锁', link: '/database/mysql/transaction' },
        { text: '分库分表', link: '/database/mysql/sharding' },
        { text: '主从复制', link: '/database/mysql/replication' },
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
      ]
    },
  ],
  '/middleware/': [
    { text: '中间件', link: '/middleware/' },
    {
      text: '消息队列',
      collapsed: false,
      items: [
        { text: 'MQ 概览', link: '/middleware/message-queue/' },
        { text: 'Kafka 核心', link: '/middleware/message-queue/kafka' },
        { text: 'RocketMQ', link: '/middleware/message-queue/rocketmq' },
        { text: '消息可靠性', link: '/middleware/message-queue/reliability' },
      ]
    },
    {
      text: '分布式系统',
      collapsed: false,
      items: [
        { text: '分布式理论', link: '/middleware/distributed-system/' },
        { text: 'CAP 与 BASE', link: '/middleware/distributed-system/cap-base' },
        { text: '一致性协议', link: '/middleware/distributed-system/consensus' },
        { text: '分布式事务', link: '/middleware/distributed-system/transaction' },
        { text: '分布式 ID', link: '/middleware/distributed-system/id-generator' },
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
      text: '系统设计',
      collapsed: false,
      items: [
        { text: '系统设计方法论', link: '/high-concurrency/system-design/' },
        { text: '秒杀系统', link: '/high-concurrency/system-design/seckill' },
        { text: '短链接系统', link: '/high-concurrency/system-design/short-url' },
        { text: 'IM 系统', link: '/high-concurrency/system-design/im' },
        { text: 'Feed 流系统', link: '/high-concurrency/system-design/feed' },
      ]
    },
  ],
  '/ai-application/': [
    { text: 'AI 应用', link: '/ai-application/' },
    {
      text: 'LLM 基础',
      collapsed: false,
      items: [
        { text: '大模型概览', link: '/ai-application/llm-basics/' },
        { text: '主流模型对比', link: '/ai-application/llm-basics/models' },
        { text: 'Token 与上下文', link: '/ai-application/llm-basics/token' },
      ]
    },
    {
      text: 'Prompt 工程',
      collapsed: false,
      items: [
        { text: 'Prompt 设计', link: '/ai-application/prompt-engineering/' },
        { text: 'Few-Shot / CoT', link: '/ai-application/prompt-engineering/advanced' },
      ]
    },
    {
      text: 'RAG',
      collapsed: false,
      items: [
        { text: 'RAG 原理', link: '/ai-application/rag/' },
        { text: '向量数据库', link: '/ai-application/rag/vector-db' },
        { text: 'RAG 优化', link: '/ai-application/rag/optimization' },
      ]
    },
    {
      text: 'Agent',
      collapsed: false,
      items: [
        { text: 'Agent 架构', link: '/ai-application/agent/' },
        { text: '工具调用', link: '/ai-application/agent/function-call' },
        { text: '多 Agent 协作', link: '/ai-application/agent/multi-agent' },
      ]
    },
    {
      text: 'LangChain',
      collapsed: false,
      items: [
        { text: 'LangChain 入门', link: '/ai-application/langchain/' },
        { text: 'Chain 与 Memory', link: '/ai-application/langchain/chain' },
        { text: '实战案例', link: '/ai-application/langchain/practice' },
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