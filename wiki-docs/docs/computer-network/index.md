# 计算机网络

> 计算机网络是后端面试「三大基础」之一，本模块系统化覆盖 TCP/IP 协议栈、应用层协议、网络编程与优化。

## ⭐ 面试重点速览

| 考察点 | 重要程度 | 面试频率 | 掌握目标 |
|--------|----------|----------|----------|
| TCP 三次握手/四次挥手 | ⭐⭐⭐ | 极高 | 能画时序图，解释为什么三次/四次 |
| HTTP 协议演进 | ⭐⭐⭐ | 极高 | 说出 1.0→1.1→2→3 核心变化 |
| HTTPS 握手流程 | ⭐⭐⭐ | 极高 | 能完整口述 TLS 握手步骤 |
| DNS 解析过程 | ⭐⭐ | 高 | 从浏览器缓存到根域名服务器 |
| IO 多路复用 | ⭐⭐⭐ | 极高 | select/poll/epoll 原理与区别 |

## 模块导航

- [网络基础总览](./fundamentals/) — OSI 七层模型、TCP/IP 四层模型
- [TCP 协议](./fundamentals/tcp) — 三次握手/四次挥手、可靠性保证
- [TCP 拥塞控制](./fundamentals/tcp-congestion) — 慢启动/拥塞避免/快重传
- [UDP 协议](./fundamentals/udp) — 特点、与 TCP 对比、QUIC
- [HTTP 协议](./application/http) — 0.9→1.0→1.1→2→3 演进
- [HTTPS 与 TLS](./application/https-tls) — 握手流程、证书体系
- [DNS 解析](./application/dns) — 递归查询、负载均衡、HTTPDNS
- [WebSocket](./application/websocket) — 握手、帧结构、长连接
- [Socket 编程](./programming/socket) — TCP/UDP Socket、拆包粘包
- [IO 模型](./programming/io-models) — select/poll/epoll、Reactor
- [CDN 加速](./optimization/cdn) — 工作原理、缓存策略

## 与现有模块的关系

- [Java IO/NIO](../java-advanced/io-nio/)：Java 层面的 IO 多路复用实现
- [前端浏览器原理](../frontend/browser/)：HTTP 缓存、CORS 前端视角
- [高并发架构](../high-concurrency/)：负载均衡 L4 vs L7、网络安全