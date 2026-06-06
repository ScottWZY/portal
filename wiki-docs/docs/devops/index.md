# DevOps

## 模块概述

DevOps 模块覆盖现代软件开发中的持续集成/持续交付（CI/CD）、容器化与编排（Docker/K8s）、Linux 基础运维以及可观测性体系建设。对于后端工程师来说，DevOps 能力已经是标配——不仅要会写代码，还要能把代码快速、稳定、安全地部署到生产环境。

::: tip 全栈工程师的最后一块拼图
开发、测试、部署、监控、排障的端到端能力，是高级工程师区别于初中级工程师的关键标志。
:::

::: info 技术栈
Linux（CentOS/Ubuntu） + Docker + Kubernetes + Jenkins/GitHub Actions + Prometheus/Grafana
:::

## 核心知识点

### Linux 基础

| 子模块 | 核心内容 |
|--------|----------|
| 文件系统 | 目录结构（FHS）、权限模型（rwx/SUID/SGID）、inode、磁盘挂载 |
| 进程管理 | ps/top/htop、进程状态、kill 信号（-9/-15）、nohup & / systemd |
| 网络诊断 | netstat/ss、tcpdump 抓包、curl/wget、iptables 基础 |
| 性能排查 | CPU（top/pidstat）、内存（free/vmstat）、磁盘（iostat/iotop）、网络（iftop） |
| Shell 脚本 | 变量/条件/循环/函数、文本处理三剑客（grep/sed/awk）、常见排障脚本 |

### Docker

| 子模块 | 核心内容 |
|--------|----------|
| 核心概念 | 镜像/容器/仓库、分层存储（UnionFS）、写时复制（CoW） |
| 镜像构建 | Dockerfile 最佳实践（多阶段构建、最小化层数、.dockerignore） |
| 容器管理 | docker run 参数详解、端口映射、卷挂载（volume vs bind mount）、资源限制 |
| 网络 | bridge/host/none/overlay 模式、容器间通信、自定义网络 |
| Compose | 多服务编排、环境变量、依赖管理（depends_on）、网络配置 |
| 底层原理 | Namespace 隔离（PID/NET/MNT/UTS/IPC/User）、Cgroup 资源限制 |

### Kubernetes

| 子模块 | 核心内容 |
|--------|----------|
| 核心资源 | Pod / Deployment / StatefulSet / DaemonSet / Job/CronJob |
| 服务发现 | Service（ClusterIP/NodePort/LoadBalancer）、Ingress / Gateway API |
| 配置与存储 | ConfigMap / Secret、PV/PVC/StorageClass 动态供给 |
| 调度与伸缩 | Scheduler 调度策略、HPA（Horizontal Pod Autoscaler）、VPA |
| 网络 | CNI 插件（Calico/Flannel）、NetworkPolicy 网络策略 |
| 运维 | 滚动更新/蓝绿发布/金丝雀发布、资源配额（ResourceQuota/LimitRange） |
| 生态工具 | Helm 包管理、Kustomize 配置管理、K9s 终端管理 |

### CI/CD

| 子模块 | 核心内容 |
|--------|----------|
| 流水线设计 | 代码检出 → 编译构建 → 单元测试 → 镜像构建 → 推送仓库 → 部署发布 |
| 工具链 | Jenkins Pipeline（Declarative/Scripted）、GitHub Actions、GitLab CI |
| 策略 | 蓝绿部署、金丝雀发布（灰度）、滚动更新、A/B 测试 |
| 制品管理 | Harbor/Nexus 私有镜像仓库、Maven/NPM 私服 |

### 可观测性

| 子模块 | 核心内容 |
|--------|----------|
| 三支柱 | Logging（日志）/ Metrics（指标）/ Tracing（链路追踪） |
| 日志 | ELK/EFK Stack、Filebeat 采集、日志格式规范（JSON 结构化） |
| 监控 | Prometheus + Grafana、核心指标（RED/USE）、自定义 Metrics、告警规则 |
| 链路追踪 | OpenTelemetry + Jaeger/Zipkin、Trace/Span 概念、上下文传播（W3C Trace Context） |

## 面试重点

::: warning 高频考点
1. **Docker vs 虚拟机**：从架构层面对比差异（共享内核 vs Hypervisor），优势与局限
2. **Dockerfile 最佳实践**：如何缩小镜像体积？多阶段构建解决了什么？
3. **K8s Pod 创建流程**：kubectl → API Server → Scheduler → Kubelet → CRI → 容器运行
4. **K8s Service 原理**：ClusterIP 如何实现负载均衡（iptables/IPVS）？NodePort/LoadBalancer 分别做了什么？
5. **CI/CD 流水线设计**：代码合并到 master 后发生了什么？测试 → 构建 → 部署 → 验证全流程
6. **线上问题排查**：CPU 飙升/内存泄漏/磁盘满的排查步骤和工具链
7. **可观测性建设**：从零搭建一套可观测体系的思路和组件选型
:::

::: danger 容易翻车的点
- 只有本地开发经验，没有线上部署和排查经历
- K8s 概念停留在背书，没有实际操作过集群
- CI/CD 仅限于 Jenkins 点个按钮，不会写 Pipeline 脚本
- 排查问题时只会重启服务，不会分析日志和指标
:::

## 学习建议

### 阶段一：Linux 与 Docker（2 周）
1. 在本地虚拟机或云服务器安装 Linux，完成常用命令的系统学习
2. 将你的 Spring Boot 项目 Docker 化，编写多阶段 Dockerfile
3. 用 Docker Compose 编排一个完整的后端服务 + 数据库 + 缓存 + 消息队列环境

### 阶段二：Kubernetes 入门（2 周）
4. 用 Minikube 或 Kind 本地搭建 K8s 集群
5. 将 Docker Compose 编排的服务迁移到 K8s，编写 Deployment/Service/ConfigMap/Ingress 等 YAML
6. 实践滚动更新、金丝雀发布、HPA 自动伸缩

### 阶段三：CI/CD 与可观测性（2 周）
7. 使用 GitHub Actions 或 Jenkins 搭建 CI/CD 流水线，实现代码 Push → 自动构建 → 自动部署
8. 搭建 Prometheus + Grafana + Loki + Tempo 可观测性全家桶
9. 编写自定义 Exporter 暴露业务指标，配置告警规则

### 阶段四：综合实战（1 周）
10. 模拟一次完整的线上故障演练：注入故障 → 发现告警 → 定位问题 → 修复上线

::: details 推荐书单
- 《鸟哥的 Linux 私房菜：基础学习篇（第4版）》
- 《Docker 技术入门与实战（第3版）》—— 杨保华
- 《Kubernetes 权威指南（第5版）》—— 龚正
- 《Prometheus 监控实战》—— James Turnbull
- 《持续交付 2.0》—— 乔梁
- Kubernetes 官方文档（kubernetes.io）
:::