import{f as l,D as i,o as n,c as r,a2 as a,b as t,w as p,a as c,G as b,a5 as d}from"./chunks/framework.DHYrF-q6.js";const y=JSON.parse('{"title":"集群方案","description":"","frontmatter":{},"headers":[],"relativePath":"database/redis/cluster.md","filePath":"database/redis/cluster.md","lastUpdated":1780745868000}'),u={name:"database/redis/cluster.md"};function o(m,s,h,g,v,k){const e=i("Mermaid");return n(),r("div",null,[s[1]||(s[1]=a('<h1 id="集群方案" tabindex="-1">集群方案 <a class="header-anchor" href="#集群方案" aria-label="Permalink to &quot;集群方案&quot;">​</a></h1><h2 id="概述" tabindex="-1">概述 <a class="header-anchor" href="#概述" aria-label="Permalink to &quot;概述&quot;">​</a></h2><p>从单机 Redis 到支撑亿级流量的分布式集群，主从复制、Sentinel 哨兵、Redis Cluster 构成了 Redis 高可用架构的三大支柱。本章深入剖析每种方案的架构原理、数据同步机制、故障转移流程和扩容方案，帮助你在面试中系统阐述 Redis 从单点到分布式的演进路径。</p><hr><h2 id="一、知识图谱" tabindex="-1">一、知识图谱 <a class="header-anchor" href="#一、知识图谱" aria-label="Permalink to &quot;一、知识图谱&quot;">​</a></h2>',5)),(n(),t(d,null,{default:p(()=>[b(e,{id:"mermaid-13",class:"mermaid",graph:"graph%20TB%0A%20%20%20%20subgraph%20Single%5B%22%E5%8D%95%E6%9C%BA%20Redis%22%5D%0A%20%20%20%20%20%20%20%20S1%5B%22%E6%80%A7%E8%83%BD%E7%93%B6%E9%A2%88%22%5D%0A%20%20%20%20%20%20%20%20S2%5B%22%E5%8D%95%E7%82%B9%E6%95%85%E9%9A%9C%22%5D%0A%20%20%20%20%20%20%20%20S3%5B%22%E5%86%85%E5%AD%98%E4%B8%8A%E9%99%90%22%5D%0A%20%20%20%20end%0A%0A%20%20%20%20subgraph%20MS%5B%22%E4%B8%BB%E4%BB%8E%E5%A4%8D%E5%88%B6%22%5D%0A%20%20%20%20%20%20%20%20M1%5B%22%E5%85%A8%E9%87%8F%E5%90%8C%E6%AD%A5%20RDB%22%5D%0A%20%20%20%20%20%20%20%20M2%5B%22%E5%A2%9E%E9%87%8F%E5%90%8C%E6%AD%A5%20replication%20buffer%22%5D%0A%20%20%20%20%20%20%20%20M3%5B%22replication%20backlog%22%5D%0A%20%20%20%20end%0A%0A%20%20%20%20subgraph%20Sentinel%5B%22Sentinel%20%E5%93%A8%E5%85%B5%22%5D%0A%20%20%20%20%20%20%20%20ST1%5B%22%E4%B8%BB%E8%A7%82%E4%B8%8B%E7%BA%BF%20SDOWN%22%5D%0A%20%20%20%20%20%20%20%20ST2%5B%22%E5%AE%A2%E8%A7%82%E4%B8%8B%E7%BA%BF%20ODOWN%22%5D%0A%20%20%20%20%20%20%20%20ST3%5B%22%E5%93%A8%E5%85%B5%E9%80%89%E4%B8%BE%20Leader%22%5D%0A%20%20%20%20%20%20%20%20ST4%5B%22%E6%95%85%E9%9A%9C%E8%BD%AC%E7%A7%BB%22%5D%0A%20%20%20%20end%0A%0A%20%20%20%20subgraph%20Cluster%5B%22Redis%20Cluster%22%5D%0A%20%20%20%20%20%20%20%20C1%5B%2216384%20%E6%A7%BD%E4%BD%8D%22%5D%0A%20%20%20%20%20%20%20%20C2%5B%22MOVED%20%2F%20ASK%20%E9%87%8D%E5%AE%9A%E5%90%91%22%5D%0A%20%20%20%20%20%20%20%20C3%5B%22Gossip%20%E5%8D%8F%E8%AE%AE%22%5D%0A%20%20%20%20%20%20%20%20C4%5B%22Hash%20Tag%22%5D%0A%20%20%20%20%20%20%20%20C5%5B%22%E9%9B%86%E7%BE%A4%E6%89%A9%E5%AE%B9%E8%BF%81%E7%A7%BB%22%5D%0A%20%20%20%20end%0A%0A%20%20%20%20subgraph%20Other%5B%22%E5%85%B6%E4%BB%96%E6%96%B9%E6%A1%88%22%5D%0A%20%20%20%20%20%20%20%20O1%5B%22Codis%20%E6%9E%B6%E6%9E%84%22%5D%0A%20%20%20%20%20%20%20%20O2%5B%22%E4%B8%80%E8%87%B4%E6%80%A7%E5%93%88%E5%B8%8C%22%5D%0A%20%20%20%20end%0A%0A%20%20%20%20Single%20--%3E%20MS%20--%3E%20Sentinel%20--%3E%20Cluster%0A%20%20%20%20Cluster%20--%3E%20Other%0A%20%20%20%20C2%20--%3E%20O2%0A"})]),fallback:p(()=>[...s[0]||(s[0]=[c(" Loading... ",-1)])]),_:1})),s[2]||(s[2]=a(`<hr><h2 id="二、基础到进阶学习路线" tabindex="-1">二、基础到进阶学习路线 <a class="header-anchor" href="#二、基础到进阶学习路线" aria-label="Permalink to &quot;二、基础到进阶学习路线&quot;">​</a></h2><ul><li><strong>阶段一：基础入门</strong> -- 理解主从复制的配置和基本原理，掌握 Sentinel 的部署和故障转移流程</li><li><strong>阶段二：原理深入</strong> -- 理解全量同步与增量同步的内部机制，掌握 replication buffer 和 backlog 的区别，理解 Sentinel 的选举算法</li><li><strong>阶段三：实战优化</strong> -- 掌握 Redis Cluster 的 16384 槽位设计、MOVED/ASK 重定向、Gossip 协议、hash tag 和集群扩容流程，能够对比 Codis 和一致性哈希方案</li></ul><hr><h2 id="三、核心知识详解" tabindex="-1">三、核心知识详解 <a class="header-anchor" href="#三、核心知识详解" aria-label="Permalink to &quot;三、核心知识详解&quot;">​</a></h2><h3 id="_3-1-主从复制" tabindex="-1">3.1 主从复制 <a class="header-anchor" href="#_3-1-主从复制" aria-label="Permalink to &quot;3.1 主从复制&quot;">​</a></h3><p>主从复制是 Redis 高可用的基础，通过将主节点的数据异步复制到从节点，实现读写分离和数据冗余。</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>主从复制架构：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  ┌──────────┐</span></span>
<span class="line"><span>  │  Master  │ ← 读写</span></span>
<span class="line"><span>  └────┬─────┘</span></span>
<span class="line"><span>       │ 异步复制</span></span>
<span class="line"><span>   ┌───┼───┐</span></span>
<span class="line"><span>   │   │   │</span></span>
<span class="line"><span>   v   v   v</span></span>
<span class="line"><span>┌──────┐ ┌──────┐ ┌──────┐</span></span>
<span class="line"><span>│Slave1│ │Slave2│ │Slave3│ ← 只读</span></span>
<span class="line"><span>└──────┘ └──────┘ └──────┘</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br></div></div><h4 id="全量同步-full-resynchronization" tabindex="-1">全量同步（Full Resynchronization） <a class="header-anchor" href="#全量同步-full-resynchronization" aria-label="Permalink to &quot;全量同步（Full Resynchronization）&quot;">​</a></h4><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>全量同步流程：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  Slave                                    Master</span></span>
<span class="line"><span>    │                                         │</span></span>
<span class="line"><span>    │──── PSYNC ? -1 ────────────────────────&gt;│  1. 从节点首次连接，发送 PSYNC</span></span>
<span class="line"><span>    │                                         │</span></span>
<span class="line"><span>    │                                         │  2. 主节点执行 BGSAVE</span></span>
<span class="line"><span>    │                                         │     生成 RDB 快照</span></span>
<span class="line"><span>    │                                         │</span></span>
<span class="line"><span>    │&lt;─── FULLRESYNC {replid} {offset} ───────│  3. 返回全量同步响应</span></span>
<span class="line"><span>    │                                         │</span></span>
<span class="line"><span>    │                                         │  4. 主节点发送 RDB 文件</span></span>
<span class="line"><span>    │&lt;─────── RDB File ───────────────────────│</span></span>
<span class="line"><span>    │                                         │</span></span>
<span class="line"><span>    │  5. 从节点清空旧数据，加载 RDB            │</span></span>
<span class="line"><span>    │                                         │</span></span>
<span class="line"><span>    │                                         │  6. 主节点发送缓冲区中的增量命令</span></span>
<span class="line"><span>    │&lt;─────── Buffer Commands ────────────────│</span></span>
<span class="line"><span>    │                                         │</span></span>
<span class="line"><span>    │  7. 从节点执行增量命令，完成同步           │</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br></div></div><p><strong>触发全量同步的场景</strong>：</p><ol><li>从节点首次连接主节点</li><li>从节点的 <code>replication offset</code> 不在主节点的 <code>replication backlog</code> 范围内</li><li>从节点报告的 <code>replication id</code> 与主节点不匹配</li></ol><h4 id="增量同步-partial-resynchronization" tabindex="-1">增量同步（Partial Resynchronization） <a class="header-anchor" href="#增量同步-partial-resynchronization" aria-label="Permalink to &quot;增量同步（Partial Resynchronization）&quot;">​</a></h4><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>增量同步依赖三个核心组件：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>1. replication id（复制 ID）</span></span>
<span class="line"><span>   - 每个 Master 实例的唯一标识（40 位十六进制）</span></span>
<span class="line"><span>   - Slave 保存 Master 的 replication id</span></span>
<span class="line"><span></span></span>
<span class="line"><span>2. replication offset（复制偏移量）</span></span>
<span class="line"><span>   - 主节点和从节点各自维护一个 offset</span></span>
<span class="line"><span>   - 主节点：记录已发送给从节点的字节数</span></span>
<span class="line"><span>   - 从节点：记录已接收到的字节数</span></span>
<span class="line"><span></span></span>
<span class="line"><span>3. replication backlog（复制积压缓冲区）</span></span>
<span class="line"><span>   - 主节点维护的固定大小环形缓冲区（默认 1MB）</span></span>
<span class="line"><span>   - 记录最近的写命令</span></span>
<span class="line"><span>   - 如果从节点的 offset 还在 backlog 中 → 增量同步</span></span>
<span class="line"><span>   - 如果从节点的 offset 不在 backlog 中 → 全量同步</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br></div></div><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>增量同步流程：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  Slave                                    Master</span></span>
<span class="line"><span>    │                                         │</span></span>
<span class="line"><span>    │──── PSYNC {replid} {offset} ───────────&gt;│  1. 发送 replid + offset</span></span>
<span class="line"><span>    │                                         │</span></span>
<span class="line"><span>    │                                         │  2. 检查 replid 是否匹配</span></span>
<span class="line"><span>    │                                         │     检查 offset 是否在 backlog 中</span></span>
<span class="line"><span>    │                                         │</span></span>
<span class="line"><span>    │&lt;─── CONTINUE {replid} ──────────────────│  3. 增量同步</span></span>
<span class="line"><span>    │                                         │</span></span>
<span class="line"><span>    │&lt;─── Backlog Commands ───────────────────│  4. 发送 offset 之后的命令</span></span>
<span class="line"><span>    │                                         │</span></span>
<span class="line"><span>    │  5. 从节点执行增量命令                   │</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br></div></div><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>replication buffer vs replication backlog：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>┌────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                    replication buffer                      │</span></span>
<span class="line"><span>│  每个 Slave 独享一个 buffer                                │</span></span>
<span class="line"><span>│  用于在 BGSAVE 期间暂存客户端写命令                         │</span></span>
<span class="line"><span>│  全量同步完成后，将 buffer 内容发送给 Slave                 │</span></span>
<span class="line"><span>│  大小：client-output-buffer-limit slave 256mb 64mb 60      │</span></span>
<span class="line"><span>├────────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│                   replication backlog                      │</span></span>
<span class="line"><span>│  所有 Slave 共享一个环形缓冲区                              │</span></span>
<span class="line"><span>│  记录最近的写命令数据                                       │</span></span>
<span class="line"><span>│  用于支持增量同步（断线重连）                               │</span></span>
<span class="line"><span>│  大小：repl-backlog-size 1mb                               │</span></span>
<span class="line"><span>│  时间：repl-backlog-ttl 3600                               │</span></span>
<span class="line"><span>└────────────────────────────────────────────────────────────┘</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br></div></div><h4 id="主从复制配置" tabindex="-1">主从复制配置 <a class="header-anchor" href="#主从复制配置" aria-label="Permalink to &quot;主从复制配置&quot;">​</a></h4><div class="language-conf vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">conf</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span># 从节点配置</span></span>
<span class="line"><span>replicaof 192.168.1.100 6379     # 指定主节点</span></span>
<span class="line"><span>masterauth &quot;your_password&quot;       # 主节点密码</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 主节点配置</span></span>
<span class="line"><span>repl-backlog-size 64mb           # 积压缓冲区大小（增大可减少全量同步）</span></span>
<span class="line"><span>repl-backlog-ttl 3600            # 积压缓冲区释放时间（秒）</span></span>
<span class="line"><span>min-replicas-to-write 1          # 至少 1 个从节点在线才接受写入</span></span>
<span class="line"><span>min-replicas-max-lag 10          # 从节点延迟超过 10s 拒绝写入</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br></div></div><h3 id="_3-2-sentinel-哨兵" tabindex="-1">3.2 Sentinel 哨兵 <a class="header-anchor" href="#_3-2-sentinel-哨兵" aria-label="Permalink to &quot;3.2 Sentinel 哨兵&quot;">​</a></h3><p>Sentinel 是 Redis 官方提供的高可用方案，通过监控、通知、自动故障转移实现主从架构的自动化运维。</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Sentinel 架构：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐</span></span>
<span class="line"><span>  │  Sentinel 1  │  │  Sentinel 2  │  │  Sentinel 3  │</span></span>
<span class="line"><span>  │  (26379)     │  │  (26380)     │  │  (26381)     │</span></span>
<span class="line"><span>  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘</span></span>
<span class="line"><span>         │                 │                 │</span></span>
<span class="line"><span>         └─────────────────┼─────────────────┘</span></span>
<span class="line"><span>                           │ 监控</span></span>
<span class="line"><span>              ┌────────────┼────────────┐</span></span>
<span class="line"><span>              │            │            │</span></span>
<span class="line"><span>              v            v            v</span></span>
<span class="line"><span>        ┌──────────┐ ┌──────────┐ ┌──────────┐</span></span>
<span class="line"><span>        │  Master  │ │  Slave1  │ │  Slave2  │</span></span>
<span class="line"><span>        │  (6379)  │ │  (6380)  │ │  (6381)  │</span></span>
<span class="line"><span>        └──────────┘ └──────────┘ └──────────┘</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br></div></div><h4 id="主观下线-sdown-与客观下线-odown" tabindex="-1">主观下线（SDOWN）与客观下线（ODOWN） <a class="header-anchor" href="#主观下线-sdown-与客观下线-odown" aria-label="Permalink to &quot;主观下线（SDOWN）与客观下线（ODOWN）&quot;">​</a></h4><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>主观下线（Subjectively Down）：</span></span>
<span class="line"><span>  单个 Sentinel 在指定时间内（down-after-milliseconds）</span></span>
<span class="line"><span>  未收到目标实例的有效响应，则认为该实例&quot;主观下线&quot;。</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  检测方式：每秒发送一次 PING，如果超时未收到 PONG，</span></span>
<span class="line"><span>  则标记为 SDOWN</span></span>
<span class="line"><span></span></span>
<span class="line"><span>客观下线（Objectively Down）：</span></span>
<span class="line"><span>  当 Sentinel 将某个 Master 标记为 SDOWN 后，</span></span>
<span class="line"><span>  询问其他 Sentinel 对该 Master 的看法。</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  如果超过 quorum 个 Sentinel 认为该 Master 已下线，</span></span>
<span class="line"><span>  则标记为 ODOWN，触发故障转移。</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  quorum 配置：sentinel monitor mymaster 127.0.0.1 6379 2</span></span>
<span class="line"><span>  这里的 2 就是 quorum（法定人数）</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br></div></div><h4 id="哨兵选举-leader" tabindex="-1">哨兵选举 Leader <a class="header-anchor" href="#哨兵选举-leader" aria-label="Permalink to &quot;哨兵选举 Leader&quot;">​</a></h4><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Sentinel 故障转移需要选举一个 Leader 来执行：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>1. 发现 Master ODOWN 的 Sentinel 向其他 Sentinel 发送</span></span>
<span class="line"><span>   SENTINEL is-master-down-by-addr 命令，请求投票</span></span>
<span class="line"><span></span></span>
<span class="line"><span>2. 其他 Sentinel 响应投票（先到先得原则）</span></span>
<span class="line"><span></span></span>
<span class="line"><span>3. 获得票数 &gt;= max(quorum, N/2+1) 的 Sentinel 成为 Leader</span></span>
<span class="line"><span></span></span>
<span class="line"><span>4. Leader 执行故障转移：</span></span>
<span class="line"><span>   a. 从所有 Slave 中选出新的 Master</span></span>
<span class="line"><span>   b. 让其他 Slave 复制新的 Master</span></span>
<span class="line"><span>   c. 将旧 Master 降级为 Slave（如果恢复）</span></span>
<span class="line"><span></span></span>
<span class="line"><span>为什么需要 Sentinel 集群？</span></span>
<span class="line"><span>  - 单个 Sentinel 可能误判或自身故障</span></span>
<span class="line"><span>  - 需要多个 Sentinel 协商达成共识</span></span>
<span class="line"><span>  - 推荐部署至少 3 个 Sentinel（奇数个）</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br></div></div><h4 id="故障转移流程" tabindex="-1">故障转移流程 <a class="header-anchor" href="#故障转移流程" aria-label="Permalink to &quot;故障转移流程&quot;">​</a></h4><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>故障转移完整流程：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>1. Sentinel 检测到 Master SDOWN</span></span>
<span class="line"><span>2. 确认 ODOWN（&gt;= quorum 个 Sentinel 同意）</span></span>
<span class="line"><span>3. 选举 Sentinel Leader</span></span>
<span class="line"><span>4. Leader 选择新 Master：</span></span>
<span class="line"><span>   ┌────────────────────────────────────────────────┐</span></span>
<span class="line"><span>   │ 选择标准（优先级从高到低）：                      │</span></span>
<span class="line"><span>   │ 1. slave-priority 配置最低的优先               │</span></span>
<span class="line"><span>   │ 2. 复制偏移量最大的（数据最新）                  │</span></span>
<span class="line"><span>   │ 3. runid 最小的（字典序）                       │</span></span>
<span class="line"><span>   └────────────────────────────────────────────────┘</span></span>
<span class="line"><span>5. Leader 向新 Master 发送 SLAVEOF NO ONE</span></span>
<span class="line"><span>6. Leader 向其他 Slave 发送 SLAVEOF {new_master_ip} {port}</span></span>
<span class="line"><span>7. Leader 监控旧 Master，恢复后将其降级为 Slave</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br></div></div><h3 id="_3-3-redis-cluster" tabindex="-1">3.3 Redis Cluster <a class="header-anchor" href="#_3-3-redis-cluster" aria-label="Permalink to &quot;3.3 Redis Cluster&quot;">​</a></h3><p>Redis Cluster 是 Redis 官方提供的分布式方案，通过数据分片实现水平扩展。</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Redis Cluster 架构：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>┌──────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                  Redis Cluster                       │</span></span>
<span class="line"><span>│                                                      │</span></span>
<span class="line"><span>│  ┌──────────┐  ┌──────────┐  ┌──────────┐           │</span></span>
<span class="line"><span>│  │ Master A │  │ Master B │  │ Master C │           │</span></span>
<span class="line"><span>│  │ Slot     │  │ Slot     │  │ Slot     │           │</span></span>
<span class="line"><span>│  │ 0-5460   │  │ 5461-    │  │ 10923-   │           │</span></span>
<span class="line"><span>│  │          │  │ 10922    │  │ 16383    │           │</span></span>
<span class="line"><span>│  └────┬─────┘  └────┬─────┘  └────┬─────┘           │</span></span>
<span class="line"><span>│       │             │             │                  │</span></span>
<span class="line"><span>│  ┌────┴─────┐  ┌────┴─────┐  ┌────┴─────┐           │</span></span>
<span class="line"><span>│  │ Slave A1 │  │ Slave B1 │  │ Slave C1 │           │</span></span>
<span class="line"><span>│  └──────────┘  └──────────┘  └──────────┘           │</span></span>
<span class="line"><span>│                                                      │</span></span>
<span class="line"><span>│  Gossip 协议互联（所有节点互相通信）                    │</span></span>
<span class="line"><span>└──────────────────────────────────────────────────────┘</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br></div></div><h4 id="_16384-槽位设计" tabindex="-1">16384 槽位设计 <a class="header-anchor" href="#_16384-槽位设计" aria-label="Permalink to &quot;16384 槽位设计&quot;">​</a></h4><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>为什么是 16384 个槽位？</span></span>
<span class="line"><span></span></span>
<span class="line"><span>1. 心跳消息大小考虑：</span></span>
<span class="line"><span>   每个节点的心跳消息包含槽位位图（bitmap）</span></span>
<span class="line"><span>   16384 / 8 / 1024 = 2 KB（位图大小）</span></span>
<span class="line"><span>   65536 / 8 / 1024 = 8 KB（如果 65536 个槽位）</span></span>
<span class="line"><span></span></span>
<span class="line"><span>   2KB 的心跳消息更合理，8KB 太大</span></span>
<span class="line"><span></span></span>
<span class="line"><span>2. 节点数限制：</span></span>
<span class="line"><span>   官方建议集群不超过 1000 个节点</span></span>
<span class="line"><span>   16384 个槽位足够均匀分配</span></span>
<span class="line"><span>   65536 个槽位对 1000 节点来说槽位过多，浪费</span></span>
<span class="line"><span></span></span>
<span class="line"><span>3. 压缩率：</span></span>
<span class="line"><span>   槽位位图在心跳包中可被压缩</span></span>
<span class="line"><span>   16384 个槽位在 1000 节点环境下压缩率很高</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br></div></div><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>槽位分配与路由：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  CRC16(key) % 16384 → slot → 节点</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  客户端缓存槽位映射表（slot → node）</span></span>
<span class="line"><span>  每次查询时：</span></span>
<span class="line"><span>  1. 计算 key 的 CRC16 哈希 → slot</span></span>
<span class="line"><span>  2. 查找本地缓存的 slot → node 映射</span></span>
<span class="line"><span>  3. 直接向目标节点发送请求</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br></div></div><h4 id="moved-与-ask-重定向" tabindex="-1">MOVED 与 ASK 重定向 <a class="header-anchor" href="#moved-与-ask-重定向" aria-label="Permalink to &quot;MOVED 与 ASK 重定向&quot;">​</a></h4><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>MOVED 重定向（永久重定向）：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  场景：槽位已迁移到其他节点</span></span>
<span class="line"><span>  客户端向节点 A 请求 slot 5000 的数据</span></span>
<span class="line"><span>  但 slot 5000 已经迁移到节点 B</span></span>
<span class="line"><span>  节点 A 返回：MOVED 5000 192.168.1.101:6379</span></span>
<span class="line"><span>  客户端更新本地槽位映射表</span></span>
<span class="line"><span>  客户端向节点 B 重新发送请求</span></span>
<span class="line"><span></span></span>
<span class="line"><span>ASK 重定向（临时重定向）：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  场景：槽位正在迁移中</span></span>
<span class="line"><span>  节点 A 正在将 slot 5000 迁移到节点 B</span></span>
<span class="line"><span>  请求的 key 已经迁移到节点 B，但 slot 还在 A 上</span></span>
<span class="line"><span>  节点 A 返回：ASK 5000 192.168.1.101:6379</span></span>
<span class="line"><span>  客户端向节点 B 发送 ASKING 命令 + 原请求</span></span>
<span class="line"><span>  注意：ASKING 是一次性的，不更新槽位映射表</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br></div></div><table tabindex="0"><thead><tr><th>维度</th><th>MOVED</th><th>ASK</th></tr></thead><tbody><tr><td>触发场景</td><td>槽位已完成迁移</td><td>槽位正在迁移中</td></tr><tr><td>槽位映射</td><td>更新本地缓存</td><td>不更新</td></tr><tr><td>后续请求</td><td>自动发往新节点</td><td>仍发往旧节点（直到槽位迁移完成）</td></tr><tr><td>命令前缀</td><td>无需</td><td>需要先发送 ASKING</td></tr></tbody></table><h4 id="gossip-协议" tabindex="-1">Gossip 协议 <a class="header-anchor" href="#gossip-协议" aria-label="Permalink to &quot;Gossip 协议&quot;">​</a></h4><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Gossip 协议消息类型：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>1. PING：定期向其他节点发送（包含自身信息和已知节点信息）</span></span>
<span class="line"><span>2. PONG：响应 PING / MEET 消息</span></span>
<span class="line"><span>3. MEET：邀请新节点加入集群</span></span>
<span class="line"><span>4. FAIL：通知其他节点某个节点已下线</span></span>
<span class="line"><span>5. PUBLISH：集群间广播 Pub/Sub 消息</span></span>
<span class="line"><span></span></span>
<span class="line"><span>Gossip 工作流程：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  每个节点每秒随机选择 5 个节点（1 个疑似下线 + 4 个随机）</span></span>
<span class="line"><span>  发送 PING 消息（包含 ping_sent 时间戳）</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  节点收到 PING 后，回复 PONG（包含自己的信息）</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  节点收到 PONG 后，更新本地节点状态表</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  通过这种&quot;闲聊&quot;方式，集群状态最终在 O(log N) 轮内收敛</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br></div></div><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Gossip 协议中的故障检测：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>1. 节点 A 发送 PING 给节点 B，超时未收到 PONG</span></span>
<span class="line"><span>2. 节点 A 在 gossip 消息中标记节点 B 为 PFAIL（疑似下线）</span></span>
<span class="line"><span>3. 其他节点收到 A 的 PING/PONG 后，知道 A 认为 B 是 PFAIL</span></span>
<span class="line"><span>4. 当大多数 Master 认为 B 是 PFAIL 时</span></span>
<span class="line"><span>5. 某个节点将 B 标记为 FAIL，通过 gossip 广播</span></span>
<span class="line"><span>6. 所有节点收到 FAIL 消息后，将 B 标记为 FAIL</span></span>
<span class="line"><span>7. B 的 Slave 发起故障转移</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br></div></div><h4 id="hash-tag" tabindex="-1">Hash Tag <a class="header-anchor" href="#hash-tag" aria-label="Permalink to &quot;Hash Tag&quot;">​</a></h4><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Hash Tag 原理：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  { } 之间的内容用于计算 slot</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  示例：</span></span>
<span class="line"><span>  user:{1001}:name   → 计算 hash(&quot;1001&quot;) → slot</span></span>
<span class="line"><span>  user:{1001}:age    → 计算 hash(&quot;1001&quot;) → 同一个 slot</span></span>
<span class="line"><span>  order:{1001}:items → 计算 hash(&quot;1001&quot;) → 同一个 slot</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  这三个 Key 会落在同一个 slot（同一个节点），</span></span>
<span class="line"><span>  可以安全地使用 MGET、事务、Lua 脚本等跨 Key 操作。</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br></div></div><div class="language-redis vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">redis</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>-- 使用 Hash Tag 确保同一用户的多个 Key 在同一节点</span></span>
<span class="line"><span>SET user:{1001}:name &quot;张三&quot;</span></span>
<span class="line"><span>SET user:{1001}:age 25</span></span>
<span class="line"><span>SET user:{1001}:city &quot;北京&quot;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>-- 可以安全使用 MGET</span></span>
<span class="line"><span>MGET user:{1001}:name user:{1001}:age user:{1001}:city</span></span>
<span class="line"><span></span></span>
<span class="line"><span>-- 可以在 Lua 脚本中操作</span></span>
<span class="line"><span>EVAL &quot;</span></span>
<span class="line"><span>    local name = redis.call(&#39;GET&#39;, KEYS[1])</span></span>
<span class="line"><span>    local age = redis.call(&#39;GET&#39;, KEYS[2])</span></span>
<span class="line"><span>    return name .. &#39;:&#39; .. age</span></span>
<span class="line"><span>&quot; 2 user:{1001}:name user:{1001}:age</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br></div></div><h4 id="集群扩容与数据迁移" tabindex="-1">集群扩容与数据迁移 <a class="header-anchor" href="#集群扩容与数据迁移" aria-label="Permalink to &quot;集群扩容与数据迁移&quot;">​</a></h4><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>集群扩容流程：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>1. 新节点加入集群：</span></span>
<span class="line"><span>   CLUSTER MEET {new_ip} {new_port}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>2. 分配槽位：</span></span>
<span class="line"><span>   CLUSTER ADDSLOTS {slot} 或</span></span>
<span class="line"><span>   redis-cli --cluster reshard {ip}:{port}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>3. 数据迁移（slot 迁移）：</span></span>
<span class="line"><span>   源节点：</span></span>
<span class="line"><span>     CLUSTER SETSLOT {slot} MIGRATING {target_node_id}</span></span>
<span class="line"><span>   目标节点：</span></span>
<span class="line"><span>     CLUSTER SETSLOT {slot} IMPORTING {source_node_id}</span></span>
<span class="line"><span>   获取槽位中的 Key：</span></span>
<span class="line"><span>     CLUSTER GETKEYSINSLOT {slot} {count}</span></span>
<span class="line"><span>   逐个迁移 Key：</span></span>
<span class="line"><span>     MIGRATE {target_ip} {target_port} {key} 0 {timeout}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>4. 更新槽位配置：</span></span>
<span class="line"><span>   CLUSTER SETSLOT {slot} NODE {target_node_id}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br></div></div><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>迁移过程的状态转换：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  ┌─────────┐     MIGRATING    ┌─────────┐</span></span>
<span class="line"><span>  │ 源节点   │ ───────────────&gt; │ 目标节点 │</span></span>
<span class="line"><span>  │ (NODE)  │                  │ (NODE)  │</span></span>
<span class="line"><span>  │         │ &lt;─────────────── │         │</span></span>
<span class="line"><span>  └─────────┘     IMPORTING    └─────────┘</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  迁移中的请求处理：</span></span>
<span class="line"><span>  - 源节点收到请求 → Key 已迁移？（ASKING 重定向）→ 目标节点</span></span>
<span class="line"><span>  - 源节点收到请求 → Key 未迁移？→ 正常处理</span></span>
<span class="line"><span>  - 目标节点收到请求 → slot 还在迁移？→ 需要 ASKING</span></span>
<span class="line"><span>  - 目标节点收到请求 → slot 已确认？→ 正常处理</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br></div></div><h3 id="_3-4-槽分片-vs-一致性哈希" tabindex="-1">3.4 槽分片 vs 一致性哈希 <a class="header-anchor" href="#_3-4-槽分片-vs-一致性哈希" aria-label="Permalink to &quot;3.4 槽分片 vs 一致性哈希&quot;">​</a></h3><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>一致性哈希：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  将所有节点映射到哈希环上（0 ~ 2^32-1）</span></span>
<span class="line"><span>  Key 也映射到哈希环上</span></span>
<span class="line"><span>  顺时针找到第一个节点 = 目标节点</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  优点：</span></span>
<span class="line"><span>  - 增删节点时只影响相邻节点（最小化数据迁移）</span></span>
<span class="line"><span>  - 适合节点动态变化的场景</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  缺点：</span></span>
<span class="line"><span>  - 数据分布不均匀（需要虚拟节点优化）</span></span>
<span class="line"><span>  - 热点数据无法处理</span></span>
<span class="line"><span>  - 实现复杂</span></span>
<span class="line"><span></span></span>
<span class="line"><span>Redis Cluster 槽分片：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  预先划分 16384 个固定槽位</span></span>
<span class="line"><span>  每个节点负责一部分槽位</span></span>
<span class="line"><span>  CRC16(key) % 16384 → slot</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  优点：</span></span>
<span class="line"><span>  - 实现简单，数据分布均匀</span></span>
<span class="line"><span>  - 支持 hash tag（控制 Key 分布）</span></span>
<span class="line"><span>  - 迁移粒度可控（按槽位迁移）</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  缺点：</span></span>
<span class="line"><span>  - 槽位数量固定（16384），不能动态增减</span></span>
<span class="line"><span>  - 单节点故障影响多个槽位</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br></div></div><h3 id="_3-5-codis-架构" tabindex="-1">3.5 Codis 架构 <a class="header-anchor" href="#_3-5-codis-架构" aria-label="Permalink to &quot;3.5 Codis 架构&quot;">​</a></h3><p>Codis 是豌豆荚开源的 Redis 分布式中间件方案，通过 Proxy 层实现透明分片。</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Codis 架构：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  ┌──────────────────────────────────────────────┐</span></span>
<span class="line"><span>  │                   Client                      │</span></span>
<span class="line"><span>  └──────────────────┬───────────────────────────┘</span></span>
<span class="line"><span>                     │</span></span>
<span class="line"><span>                     v</span></span>
<span class="line"><span>  ┌──────────────────────────────────────────────┐</span></span>
<span class="line"><span>  │              Codis Proxy（多实例）              │</span></span>
<span class="line"><span>  │  - 路由转发                                    │</span></span>
<span class="line"><span>  │  - 无状态，可水平扩展                           │</span></span>
<span class="line"><span>  └──────────────────┬───────────────────────────┘</span></span>
<span class="line"><span>                     │</span></span>
<span class="line"><span>                     v</span></span>
<span class="line"><span>  ┌──────────────────────────────────────────────┐</span></span>
<span class="line"><span>  │              Codis Dashboard                  │</span></span>
<span class="line"><span>  │  - 槽位管理                                    │</span></span>
<span class="line"><span>  │  - 扩容迁移协调                                │</span></span>
<span class="line"><span>  └──────────────────┬───────────────────────────┘</span></span>
<span class="line"><span>                     │</span></span>
<span class="line"><span>         ┌───────────┼───────────┐</span></span>
<span class="line"><span>         v           v           v</span></span>
<span class="line"><span>  ┌──────────┐ ┌──────────┐ ┌──────────┐</span></span>
<span class="line"><span>  │Codis-Group│ │Codis-Group│ │Codis-Group│</span></span>
<span class="line"><span>  │ Master   │ │ Master   │ │ Master   │</span></span>
<span class="line"><span>  │ Slave    │ │ Slave    │ │ Slave    │</span></span>
<span class="line"><span>  └──────────┘ └──────────┘ └──────────┘</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br></div></div><table tabindex="0"><thead><tr><th>维度</th><th>Redis Cluster</th><th>Codis</th></tr></thead><tbody><tr><td>架构</td><td>P2P 无中心</td><td>Proxy 中心化</td></tr><tr><td>槽位数</td><td>16384 固定</td><td>1024 固定</td></tr><tr><td>客户端</td><td>需要 Smart Client</td><td>支持任意客户端（通过 Proxy）</td></tr><tr><td>扩容</td><td>在线迁移，业务无感知</td><td>Dashboard 统一管理</td></tr><tr><td>事务</td><td>不支持跨 slot</td><td>不支持跨 slot</td></tr><tr><td>多 Key 操作</td><td>需要 hash tag</td><td>需要 hash tag</td></tr><tr><td>成熟度</td><td>官方维护，更成熟</td><td>社区维护，更新较慢</td></tr></tbody></table><hr><h2 id="四、经典应用场景与解决方案" tabindex="-1">四、经典应用场景与解决方案 <a class="header-anchor" href="#四、经典应用场景与解决方案" aria-label="Permalink to &quot;四、经典应用场景与解决方案&quot;">​</a></h2><h3 id="场景-从单机到集群的平滑迁移" tabindex="-1">场景：从单机到集群的平滑迁移 <a class="header-anchor" href="#场景-从单机到集群的平滑迁移" aria-label="Permalink to &quot;场景：从单机到集群的平滑迁移&quot;">​</a></h3><p><strong>问题背景</strong></p><p>某电商平台 Redis 从单机 16GB 逐步演进到 200GB 集群。要求在迁移过程中业务不中断，数据不丢失，且支持灰度切换。</p><p><strong>迁移方案</strong></p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>迁移步骤：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  阶段一：双写阶段（1 周）</span></span>
<span class="line"><span>  ┌──────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>  │  业务代码                                            │</span></span>
<span class="line"><span>  │  ├── 读：先读集群，Miss 再读单机                      │</span></span>
<span class="line"><span>  │  └── 写：同时写单机 + 集群（异步）                    │</span></span>
<span class="line"><span>  └──────────────────────────────────────────────────────┘</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  阶段二：数据同步（1 天）</span></span>
<span class="line"><span>  使用 redis-shake 工具将单机数据全量同步到集群</span></span>
<span class="line"><span>  同步期间的增量数据通过双写保证</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  阶段三：灰度切换（3 天）</span></span>
<span class="line"><span>  逐步增加集群的流量比例：10% → 30% → 50% → 100%</span></span>
<span class="line"><span>  监控集群的延迟、错误率、内存使用</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  阶段四：下线单机（1 天）</span></span>
<span class="line"><span>  确认集群稳定后，停止双写，下线单机</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br></div></div><div class="language-bash vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># redis-shake 数据迁移</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">wget</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> https://github.com/alibaba/RedisShake/releases/download/v3.0.0/redis-shake.tar.gz</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">tar</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -xzf</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> redis-shake.tar.gz</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 配置 redis-shake.toml</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[sync_reader]</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">address</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> =</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;192.168.1.100:6379&quot;</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  # 源单机</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[redis_writer]</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">address</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> =</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;192.168.1.200:6379&quot;</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  # 目标集群任一节点</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">cluster</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> =</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> true</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">                   # 目标为集群模式</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br></div></div><p><strong>Key 迁移注意事项</strong></p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>1. 大 Key 处理：</span></span>
<span class="line"><span>   - 使用 redis-cli --bigkeys 扫描大 Key</span></span>
<span class="line"><span>   - 大 Key 拆分或使用 UNLINK 异步删除</span></span>
<span class="line"><span></span></span>
<span class="line"><span>2. 热点 Key 处理：</span></span>
<span class="line"><span>   - 热点 Key 使用 hash tag 固定到特定节点</span></span>
<span class="line"><span>   - 或使用本地缓存（Caffeine）减少集群压力</span></span>
<span class="line"><span></span></span>
<span class="line"><span>3. 过期 Key 处理：</span></span>
<span class="line"><span>   - 迁移前确认过期时间正确传递</span></span>
<span class="line"><span>   - redis-shake 默认同步过期时间</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br></div></div><hr><h2 id="五、高频面试题" tabindex="-1">五、高频面试题 <a class="header-anchor" href="#五、高频面试题" aria-label="Permalink to &quot;五、高频面试题&quot;">​</a></h2><h3 id="q1-redis-cluster-为什么是-16384-个槽位" tabindex="-1">Q1: Redis Cluster 为什么是 16384 个槽位？ <a class="header-anchor" href="#q1-redis-cluster-为什么是-16384-个槽位" aria-label="Permalink to &quot;Q1: Redis Cluster 为什么是 16384 个槽位？&quot;">​</a></h3><details class="details custom-block"><summary>答案</summary><p>Redis Cluster 使用 16384（2^14）个槽位而非 65536（2^16），主要基于以下考量：</p><p><strong>1. 心跳消息大小</strong> 每个节点定期发送 PING/PONG 消息，其中包含本节点负责的槽位位图（bitmap）。槽位位图大小 = 槽位数 / 8 字节：</p><ul><li>16384 槽位：16384 / 8 = 2048 字节 = 2KB</li><li>65536 槽位：65536 / 8 = 8192 字节 = 8KB</li></ul><p>2KB 的心跳消息大小是合理的，8KB 则偏大。在 1000 个节点的集群中，每个节点每秒发送的 gossip 消息量会显著增长。</p><p><strong>2. 节点数量限制</strong> Redis 官方设计集群规模上限约为 1000 个节点。16384 个槽位分配到 1000 个节点，每个节点约 16 个槽位，分布足够均匀。65536 个槽位对于 1000 节点来说槽位过多，每个节点约 65 个槽位，对分布均匀性提升有限，但心跳消息却增大了 4 倍。</p><p><strong>3. 压缩效率</strong> 槽位位图在心跳消息中可以被压缩传输。16384 个槽位在节点数较少时（如 10 个节点），每个节点负责连续的大段槽位，位图中有大段连续的 1 和 0，压缩率很高。65536 个槽位虽然也能压缩，但原始数据量更大。</p><p><strong>4. CRC16 的天然匹配</strong> Redis 使用 CRC16 哈希算法，输出范围是 0~65535。取模 16384 后哈希分布均匀，且 CRC16 的计算效率高。</p><p><strong>总结</strong>：16384 是心跳消息大小、节点数量、哈希分布三者之间的最佳平衡点。</p></details><h3 id="q2-moved-和-ask-重定向有什么区别" tabindex="-1">Q2: MOVED 和 ASK 重定向有什么区别？ <a class="header-anchor" href="#q2-moved-和-ask-重定向有什么区别" aria-label="Permalink to &quot;Q2: MOVED 和 ASK 重定向有什么区别？&quot;">​</a></h3><details class="details custom-block"><summary>答案</summary><p>MOVED 和 ASK 都是 Redis Cluster 中客户端重定向的机制，但场景和语义不同。</p><table tabindex="0"><thead><tr><th>维度</th><th>MOVED</th><th>ASK</th></tr></thead><tbody><tr><td><strong>触发时机</strong></td><td>槽位已完全迁移到新节点</td><td>槽位正在迁移中</td></tr><tr><td><strong>语义</strong></td><td>槽位永久归新节点负责</td><td>仅当前请求的 Key 在新节点，槽位仍在迁移</td></tr><tr><td><strong>客户端行为</strong></td><td>更新本地槽位映射表，后续请求直接发往新节点</td><td>不更新槽位映射表，仅本次请求发往新节点</td></tr><tr><td><strong>命令前缀</strong></td><td>不需要</td><td>需要先发送 <code>ASKING</code> 命令</td></tr><tr><td><strong>后续请求</strong></td><td>自动路由到新节点</td><td>仍发往旧节点（直到迁移完成）</td></tr></tbody></table><p><strong>详细场景分析</strong>：</p><p><strong>MOVED 场景</strong>：</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>客户端缓存：slot 5000 → 节点 A</span></span>
<span class="line"><span>实际状态：slot 5000 已迁移到节点 B</span></span>
<span class="line"><span></span></span>
<span class="line"><span>客户端向节点 A 请求 slot 5000 的数据</span></span>
<span class="line"><span>→ 节点 A 返回：MOVED 5000 192.168.1.101:6379</span></span>
<span class="line"><span>→ 客户端更新缓存：slot 5000 → 节点 B</span></span>
<span class="line"><span>→ 客户端向节点 B 重新发送请求</span></span>
<span class="line"><span>→ 后续 slot 5000 的请求直接发往节点 B</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br></div></div><p><strong>ASK 场景</strong>：</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>迁移中：slot 5000 正在从节点 A 迁移到节点 B</span></span>
<span class="line"><span>部分 Key 已迁移到 B，但 slot 归属仍为 A</span></span>
<span class="line"><span></span></span>
<span class="line"><span>客户端向节点 A 请求已迁移的 Key</span></span>
<span class="line"><span>→ 节点 A 返回：ASK 5000 192.168.1.101:6379</span></span>
<span class="line"><span>→ 客户端向节点 B 发送 ASKING 命令</span></span>
<span class="line"><span>→ 客户端向节点 B 发送原请求</span></span>
<span class="line"><span>→ 节点 B 执行请求（因为收到 ASKING 后，允许处理正在导入的 slot）</span></span>
<span class="line"><span></span></span>
<span class="line"><span>注意：客户端不更新槽位映射表</span></span>
<span class="line"><span>后续 slot 5000 的请求仍发往节点 A</span></span>
<span class="line"><span>如果 Key 还在 A 上，A 直接处理</span></span>
<span class="line"><span>如果 Key 已迁移到 B，再次返回 ASK 重定向</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br></div></div><p><strong>为什么 ASK 不更新槽位映射表？</strong> 因为迁移是动态过程，slot 5000 中的 Key 可能部分在 A、部分在 B。如果客户端更新了映射表，下次请求 slot 5000 中仍在 A 上的 Key 时，会错误地发往 B。</p></details><h3 id="q3-sentinel-的故障转移流程是怎样的" tabindex="-1">Q3: Sentinel 的故障转移流程是怎样的？ <a class="header-anchor" href="#q3-sentinel-的故障转移流程是怎样的" aria-label="Permalink to &quot;Q3: Sentinel 的故障转移流程是怎样的？&quot;">​</a></h3><details class="details custom-block"><summary>答案</summary><p>Sentinel 故障转移是一个多阶段、协商式的过程：</p><p><strong>阶段一：主观下线检测（SDOWN）</strong></p><p>每个 Sentinel 每秒向所有监控的实例（Master + Slave + 其他 Sentinel）发送 PING 命令。如果 Master 在 <code>down-after-milliseconds</code> 时间内未回复有效 PONG，该 Sentinel 将其标记为 SDOWN。</p><p><strong>阶段二：客观下线确认（ODOWN）</strong></p><p>标记 SDOWN 的 Sentinel 向其他 Sentinel 发送 <code>SENTINEL is-master-down-by-addr</code> 命令，询问它们对 Master 状态的判断。如果 &gt;= <code>quorum</code> 个 Sentinel 认为 Master 下线，则标记为 ODOWN。</p><p><strong>阶段三：Leader 选举</strong></p><p>确认 ODOWN 后，Sentinel 之间通过 Raft-like 协议选举一个 Leader 来执行故障转移：</p><ol><li>发现 ODOWN 的 Sentinel 向其他 Sentinel 请求投票</li><li>每个 Sentinel 在每个 epoch 中只能投一票（先到先得）</li><li>获得 &gt;= max(quorum, N/2+1) 票的 Sentinel 成为 Leader</li></ol><p><strong>阶段四：选择新 Master</strong></p><p>Leader Sentinel 从所有 Slave 中选择新 Master，选择标准（优先级从高到低）：</p><ol><li><code>slave-priority</code> 配置最小的优先</li><li>复制偏移量最大的（数据最新）</li><li><code>runid</code> 字典序最小的</li></ol><p><strong>阶段五：执行切换</strong></p><ol><li>向新 Master 发送 <code>SLAVEOF NO ONE</code>，使其成为独立 Master</li><li>向其他 Slave 发送 <code>SLAVEOF {new_master_ip} {new_master_port}</code>，使其复制新 Master</li><li>持续监控旧 Master，如果恢复，将其降级为新 Master 的 Slave</li></ol><p><strong>关键时间参数</strong>：</p><ul><li><code>down-after-milliseconds</code>：30000（30 秒无响应判定 SDOWN）</li><li><code>failover-timeout</code>：180000（故障转移超时 3 分钟）</li><li><code>parallel-syncs</code>：1（同时向新 Master 同步的 Slave 数量）</li></ul><p><strong>为什么需要多个 Sentinel？</strong></p><ul><li>防止单 Sentinel 的网络分区导致误判</li><li>多个 Sentinel 协商保证故障转移决策的正确性</li><li>推荐至少 3 个 Sentinel（奇数个），避免脑裂</li></ul></details><h3 id="q4-redis-cluster-的-gossip-协议是如何工作的" tabindex="-1">Q4: Redis Cluster 的 Gossip 协议是如何工作的？ <a class="header-anchor" href="#q4-redis-cluster-的-gossip-协议是如何工作的" aria-label="Permalink to &quot;Q4: Redis Cluster 的 Gossip 协议是如何工作的？&quot;">​</a></h3><details class="details custom-block"><summary>答案</summary><p>Gossip 协议是 Redis Cluster 中节点间通信的核心协议，用于节点发现、状态同步和故障检测。</p><p><strong>消息类型</strong>：</p><table tabindex="0"><thead><tr><th>消息</th><th>方向</th><th>说明</th></tr></thead><tbody><tr><td>PING</td><td>发送</td><td>定期发送，包含自身信息和已知节点信息</td></tr><tr><td>PONG</td><td>回复</td><td>响应 PING 或 MEET</td></tr><tr><td>MEET</td><td>发送</td><td>邀请新节点加入集群</td></tr><tr><td>FAIL</td><td>广播</td><td>宣告某节点已确认下线</td></tr><tr><td>PUBLISH</td><td>广播</td><td>转发 Pub/Sub 消息</td></tr></tbody></table><p><strong>通信频率</strong>：</p><p>每个节点每秒随机选择 5 个节点发送 PING（1 个疑似下线节点 + 4 个随机节点）。PING 消息包含：</p><ul><li>本节点负责的槽位位图（2KB）</li><li>本节点 IP 和端口</li><li>本节点视角下部分其他节点的状态（随机选择 3 个节点）</li></ul><p><strong>故障检测流程</strong>：</p><ol><li>节点 A 向节点 B 发送 PING，超时未收到 PONG</li><li>节点 A 将 B 标记为 PFAIL（疑似下线），在后续 PING/PONG 消息中携带此信息</li><li>其他节点收到 A 的 gossip 消息后，知道 A 认为 B 是 PFAIL</li><li>当集群中大多数 Master 都认为 B 是 PFAIL（<code>cluster-node-timeout * 2</code> 时间内）</li><li>某个节点将 B 标记为 FAIL，通过 gossip 广播 FAIL 消息</li><li>所有节点收到 FAIL 消息后，将 B 标记为 FAIL</li><li>B 的 Slave 发起故障转移，选举新 Master</li></ol><p><strong>Gossip 协议的优势</strong>：</p><ul><li>去中心化：无需中心协调节点</li><li>最终一致性：信息通过多轮传播最终收敛</li><li>容错性好：单个节点故障不影响整体通信</li><li>低开销：每个节点每秒只发送少量消息</li></ul><p><strong>Gossip 协议的局限</strong>：</p><ul><li>收敛需要时间（O(log N) 轮），不适合实时性要求极高的场景</li><li>节点数量过大时，消息量增大（建议集群不超过 1000 节点）</li></ul></details><h3 id="q5-集群扩容时数据如何迁移-迁移过程中客户端请求如何处理" tabindex="-1">Q5: 集群扩容时数据如何迁移？迁移过程中客户端请求如何处理？ <a class="header-anchor" href="#q5-集群扩容时数据如何迁移-迁移过程中客户端请求如何处理" aria-label="Permalink to &quot;Q5: 集群扩容时数据如何迁移？迁移过程中客户端请求如何处理？&quot;">​</a></h3><details class="details custom-block"><summary>答案</summary><p><strong>数据迁移流程</strong>：</p><ol><li><p><strong>准备阶段</strong>：使用 <code>redis-cli --cluster reshard</code> 或手动执行迁移命令</p></li><li><p><strong>设置迁移状态</strong>：</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>源节点：CLUSTER SETSLOT {slot} MIGRATING {target_node_id}</span></span>
<span class="line"><span>目标节点：CLUSTER SETSLOT {slot} IMPORTING {source_node_id}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br></div></div></li><li><p><strong>获取槽位中的 Key</strong>：</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>CLUSTER GETKEYSINSLOT {slot} {count}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br></div></div><p>返回槽位中的 count 个 Key 名称</p></li><li><p><strong>逐个迁移 Key</strong>：</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>MIGRATE {target_ip} {target_port} {key} 0 {timeout} [REPLACE]</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br></div></div><p>MIGRATE 是原子操作，在源节点删除 Key 并在目标节点创建</p></li><li><p><strong>完成迁移</strong>：</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>源节点 + 目标节点：</span></span>
<span class="line"><span>CLUSTER SETSLOT {slot} NODE {target_node_id}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br></div></div><p>将槽位正式归属于目标节点，并通知所有节点</p></li></ol><p><strong>迁移中客户端请求的处理</strong>：</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>场景一：请求的 Key 还在源节点</span></span>
<span class="line"><span>  客户端 → 源节点（slot 的 MIGRATING 状态）</span></span>
<span class="line"><span>  源节点查找 Key → 存在 → 正常处理 → 返回结果</span></span>
<span class="line"><span></span></span>
<span class="line"><span>场景二：请求的 Key 已迁移到目标节点</span></span>
<span class="line"><span>  客户端 → 源节点（slot 的 MIGRATING 状态）</span></span>
<span class="line"><span>  源节点查找 Key → 不存在 → 返回 ASK 重定向</span></span>
<span class="line"><span>  客户端 → 目标节点：ASKING + 原请求</span></span>
<span class="line"><span>  目标节点（slot 的 IMPORTING 状态）→ 正常处理 → 返回结果</span></span>
<span class="line"><span></span></span>
<span class="line"><span>场景三：请求的 Key 在目标节点新增</span></span>
<span class="line"><span>  客户端 → 目标节点（slot 的 IMPORTING 状态）</span></span>
<span class="line"><span>  需要先发送 ASKING 命令</span></span>
<span class="line"><span>  目标节点正常处理</span></span>
<span class="line"><span></span></span>
<span class="line"><span>场景四：请求的 slot 还未迁移</span></span>
<span class="line"><span>  客户端 → 源节点（slot 还是 NODE 状态）</span></span>
<span class="line"><span>  源节点正常处理</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br></div></div><p><strong>迁移过程中的一致性保障</strong>：</p><ul><li>MIGRATE 命令是原子操作（源删 + 目标建）</li><li>迁移期间，源节点和目标节点都知道该 slot 的迁移状态</li><li>ASK 重定向保证客户端能正确访问到已迁移的 Key</li><li>迁移完成后，通过 Gossip 协议广播新槽位配置</li><li>如果迁移中断，槽位状态回退到源节点</li></ul><p><strong>扩容建议</strong>：</p><ul><li>在低峰期进行扩容迁移</li><li>逐个槽位迁移，控制迁移速度（避免影响正常业务）</li><li>监控迁移过程中的网络流量和延迟</li><li>确保目标节点有足够内存</li></ul></details><h3 id="q6-16384-槽位和一致性哈希有什么区别-各有什么优缺点" tabindex="-1">Q6: 16384 槽位和一致性哈希有什么区别？各有什么优缺点？ <a class="header-anchor" href="#q6-16384-槽位和一致性哈希有什么区别-各有什么优缺点" aria-label="Permalink to &quot;Q6: 16384 槽位和一致性哈希有什么区别？各有什么优缺点？&quot;">​</a></h3><details class="details custom-block"><summary>答案</summary><p><strong>一致性哈希</strong>：</p><p>将所有节点和 Key 映射到同一个哈希环（0 ~ 2^32-1），Key 顺时针寻找最近的节点。</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>哈希环示意：</span></span>
<span class="line"><span>         0</span></span>
<span class="line"><span>    ┌─────────┐</span></span>
<span class="line"><span>    │   Node A │</span></span>
<span class="line"><span>    │          │</span></span>
<span class="line"><span>    │  Node C  │</span></span>
<span class="line"><span>    │          │</span></span>
<span class="line"><span>    │   Node B │</span></span>
<span class="line"><span>    └─────────┘</span></span>
<span class="line"><span>        2^32-1</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br></div></div><p>优点：</p><ul><li>增删节点时只影响相邻节点，数据迁移量最小</li><li>适合节点动态频繁变化的场景</li><li>配合虚拟节点可实现较好的负载均衡</li></ul><p>缺点：</p><ul><li>数据分布不均匀（需要足够多的虚拟节点优化）</li><li>无法控制特定 Key 的分布（无 hash tag 机制）</li><li>实现复杂，客户端需要维护哈希环</li></ul><p><strong>槽位分片（Redis Cluster）</strong>：</p><p>预先划分 16384 个固定槽位，每个节点负责一部分槽位。</p><p>优点：</p><ul><li>实现简单，数据分布均匀</li><li>支持 hash tag（<code>{user_id}</code>），控制多 Key 在同一节点</li><li>迁移粒度可控（以槽位为单位）</li><li>协议层原生支持，Smart Client 自动路由</li></ul><p>缺点：</p><ul><li>槽位数量固定（16384），不能动态调整</li><li>增删节点时需要手动 rebalance</li><li>单节点故障影响多个槽位（需配合 Slave 高可用）</li></ul><p><strong>对比总结</strong>：</p><table tabindex="0"><thead><tr><th>维度</th><th>一致性哈希</th><th>槽位分片</th></tr></thead><tbody><tr><td>数据分布</td><td>不均匀（需虚拟节点）</td><td>均匀</td></tr><tr><td>增删节点影响</td><td>仅相邻节点</td><td>多个节点数据迁移</td></tr><tr><td>迁移粒度</td><td>按 Key</td><td>按槽位（一批 Key）</td></tr><tr><td>Hash Tag</td><td>不支持</td><td>支持</td></tr><tr><td>实现复杂度</td><td>高</td><td>低</td></tr><tr><td>代表方案</td><td>Memcached 客户端</td><td>Redis Cluster</td></tr></tbody></table><p><strong>选择建议</strong>：</p><ul><li>节点频繁变化、对数据迁移量敏感 → 一致性哈希</li><li>需要可控的 Key 分布、官方支持 → Redis Cluster 槽位分片</li></ul></details><hr><h2 id="六、选型指南" tabindex="-1">六、选型指南 <a class="header-anchor" href="#六、选型指南" aria-label="Permalink to &quot;六、选型指南&quot;">​</a></h2><h3 id="适用场景" tabindex="-1">适用场景 <a class="header-anchor" href="#适用场景" aria-label="Permalink to &quot;适用场景&quot;">​</a></h3><table tabindex="0"><thead><tr><th>场景</th><th>推荐方案</th><th>理由</th></tr></thead><tbody><tr><td>数据量 &lt; 10GB，需高可用</td><td>主从 + Sentinel</td><td>简单可靠，满足大部分需求</td></tr><tr><td>数据量 10~100GB，需水平扩展</td><td>Redis Cluster</td><td>官方原生支持，自动分片</td></tr><tr><td>数据量 &gt; 100GB，需透明扩容</td><td>Codis 或 Proxy 方案</td><td>管理方便，运维友好</td></tr><tr><td>仅需读写分离</td><td>主从复制</td><td>无需哨兵，手动切换</td></tr><tr><td>跨机房容灾</td><td>主从 + Sentinel（多机房）</td><td>哨兵分布在不同机房</td></tr></tbody></table><h3 id="不适用场景" tabindex="-1">不适用场景 <a class="header-anchor" href="#不适用场景" aria-label="Permalink to &quot;不适用场景&quot;">​</a></h3><ul><li>数据量极小（&lt; 1GB）且无高可用需求 -- 单机即可</li><li>需要强一致性的事务场景 -- 考虑关系型数据库</li><li>需要跨 slot 的事务/Lua 脚本 -- Redis Cluster 不支持，需 hash tag</li></ul><h3 id="配置建议" tabindex="-1">配置建议 <a class="header-anchor" href="#配置建议" aria-label="Permalink to &quot;配置建议&quot;">​</a></h3><div class="language-conf vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">conf</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span># ========== Redis Cluster 配置 ==========</span></span>
<span class="line"><span>cluster-enabled yes</span></span>
<span class="line"><span>cluster-config-file nodes.conf</span></span>
<span class="line"><span>cluster-node-timeout 15000          # 节点超时 15 秒</span></span>
<span class="line"><span>cluster-migration-barrier 1         # 迁移屏障</span></span>
<span class="line"><span>cluster-require-full-coverage yes   # 所有槽位覆盖才接受请求</span></span>
<span class="line"><span></span></span>
<span class="line"><span># ========== Sentinel 配置 ==========</span></span>
<span class="line"><span>sentinel monitor mymaster 192.168.1.100 6379 2</span></span>
<span class="line"><span>sentinel down-after-milliseconds mymaster 30000</span></span>
<span class="line"><span>sentinel failover-timeout mymaster 180000</span></span>
<span class="line"><span>sentinel parallel-syncs mymaster 1</span></span>
<span class="line"><span></span></span>
<span class="line"><span># ========== 主从配置 ==========</span></span>
<span class="line"><span>repl-backlog-size 64mb</span></span>
<span class="line"><span>repl-backlog-ttl 3600</span></span>
<span class="line"><span>min-replicas-to-write 1</span></span>
<span class="line"><span>min-replicas-max-lag 10</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br></div></div><hr><h2 id="相关文档" tabindex="-1">相关文档 <a class="header-anchor" href="#相关文档" aria-label="Permalink to &quot;相关文档&quot;">​</a></h2><ul><li><a href="./index">Redis 核心原理</a></li><li><a href="./persistence">持久化机制</a></li><li><a href="./distributed-lock">分布式锁</a></li><li><a href="./selection">Redis 选型指南</a></li></ul>`,86))])}const E=l(u,[["render",o]]);export{y as __pageData,E as default};
