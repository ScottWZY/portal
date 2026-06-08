# 安全

> 安全是后端开发必备能力，本模块系统化覆盖密码学基础、认证授权、Web 安全与架构安全。

## ⭐ 面试重点速览

| 考察点 | 重要程度 | 面试频率 | 掌握目标 |
|--------|----------|----------|----------|
| JWT vs Session | ⭐⭐⭐ | 极高 | 优缺点、适用场景对比 |
| OAuth2.0 授权码流程 | ⭐⭐⭐ | 极高 | 完整流程、角色 |
| 对称加密 vs 非对称加密 | ⭐⭐⭐ | 高 | 原理与应用场景对比 |
| OWASP Top 10 | ⭐⭐⭐ | 高 | 主要攻击类型与防御 |
| 零信任架构 | ⭐⭐ | 中 | Never trust always verify 原则 |

## 模块导航

- [安全基础总览](./fundamentals/) — 安全三要素、纵深防御、最小权限
- [密码学基础](./fundamentals/cryptography) — 对称/非对称加密、哈希、签名
- [认证与授权](./fundamentals/auth) — Session/JWT/OAuth2.0/SSO
- [双向认证](./fundamentals/mtls) — mTLS 原理、证书固定
- [OWASP Top 10](./web/owasp-top10) — 注入/XSS/CSRF/SSRF/反序列化
- [安全编码](./web/secure-coding) — 输入校验、输出编码、参数化查询
- [API 安全](./web/api-security) — HMAC 签名、防重放、频率限制
- [零信任架构](./architecture/zero-trust) — Never trust always verify

## 与现有模块的关系

- [Spring Security](../spring-ecosystem/spring-security/) — Spring 框架中的安全实现
- [高并发网络安全](../high-concurrency/security/network-security) — DDoS 防护、TLS 网络层视角
- [前端安全](../frontend/security/) — XSS/CSRF 前端视角
- [HTTPS 与 TLS](../computer-network/application/https-tls) — TLS 协议原理