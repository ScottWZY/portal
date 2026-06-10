import{f as l,D as i,o as n,c as r,a2 as a,b as t,w as p,a as c,G as b,a5 as d}from"./chunks/framework.DHYrF-q6.js";const B=JSON.parse('{"title":"高级数据结构详解","description":"","frontmatter":{},"headers":[],"relativePath":"database/redis/data-structure.md","filePath":"database/redis/data-structure.md","lastUpdated":1780745868000}'),u={name:"database/redis/data-structure.md"};function o(m,s,h,g,k,v){const e=i("Mermaid");return n(),r("div",null,[s[1]||(s[1]=a('<h1 id="高级数据结构详解" tabindex="-1">高级数据结构详解 <a class="header-anchor" href="#高级数据结构详解" aria-label="Permalink to &quot;高级数据结构详解&quot;">​</a></h1><h2 id="概述" tabindex="-1">概述 <a class="header-anchor" href="#概述" aria-label="Permalink to &quot;概述&quot;">​</a></h2><p>深入剖析 Redis 五种基础数据类型和四种高级数据类型的底层编码实现原理，理解 SDS、quicklist、skiplist、listpack、hashtable 等核心内部结构的设计思想与性能优势。掌握这些底层原理，能够在面试中清晰地解释 Redis 为什么快、为什么省内存，以及对高级工程师而言关键的 &quot;知其然更知其所以然&quot;。</p><hr><h2 id="一、知识图谱" tabindex="-1">一、知识图谱 <a class="header-anchor" href="#一、知识图谱" aria-label="Permalink to &quot;一、知识图谱&quot;">​</a></h2>',5)),(n(),t(d,null,{default:p(()=>[b(e,{id:"mermaid-13",class:"mermaid",graph:"graph%20TB%0A%20%20%20%20subgraph%20Basic%5B%22%E4%BA%94%E7%A7%8D%E5%9F%BA%E7%A1%80%E6%95%B0%E6%8D%AE%E7%B1%BB%E5%9E%8B%22%5D%0A%20%20%20%20%20%20%20%20String%5B%22String%3Cbr%2F%3ESDS%EF%BC%88embstr%20%2F%20raw%EF%BC%89%22%5D%0A%20%20%20%20%20%20%20%20Hash%5B%22Hash%3Cbr%2F%3Elistpack%20%E2%86%92%20hashtable%22%5D%0A%20%20%20%20%20%20%20%20List%5B%22List%3Cbr%2F%3Equicklist%22%5D%0A%20%20%20%20%20%20%20%20Set%5B%22Set%3Cbr%2F%3Elistpack%20%E2%86%92%20hashtable%22%5D%0A%20%20%20%20%20%20%20%20ZSet%5B%22ZSet%3Cbr%2F%3Elistpack%20%E2%86%92%20skiplist%20%2B%20hashtable%22%5D%0A%20%20%20%20end%0A%0A%20%20%20%20subgraph%20Internal%5B%22%E5%BA%95%E5%B1%82%E7%BC%96%E7%A0%81%E7%BB%93%E6%9E%84%22%5D%0A%20%20%20%20%20%20%20%20SDS%5B%22SDS%3Cbr%2F%3E%E5%8A%A8%E6%80%81%E5%AD%97%E7%AC%A6%E4%B8%B2%22%5D%0A%20%20%20%20%20%20%20%20Quicklist%5B%22quicklist%3Cbr%2F%3E%E5%8F%8C%E5%90%91%E9%93%BE%E8%A1%A8%20%2B%20listpack%22%5D%0A%20%20%20%20%20%20%20%20Skiplist%5B%22skiplist%3Cbr%2F%3E%E5%A4%9A%E5%B1%82%E7%B4%A2%E5%BC%95%E8%B7%B3%E8%A1%A8%22%5D%0A%20%20%20%20%20%20%20%20Listpack%5B%22listpack%20%2F%20ziplist%3Cbr%2F%3E%E7%B4%A7%E5%87%91%E5%86%85%E5%AD%98%E7%BC%96%E7%A0%81%22%5D%0A%20%20%20%20%20%20%20%20Hashtable%5B%22hashtable%3Cbr%2F%3E%E6%B8%90%E8%BF%9B%E5%BC%8F%20rehash%22%5D%0A%20%20%20%20%20%20%20%20Intset%5B%22intset%3Cbr%2F%3E%E6%95%B4%E6%95%B0%E9%9B%86%E5%90%88%22%5D%0A%20%20%20%20end%0A%0A%20%20%20%20subgraph%20Advanced%5B%22%E5%9B%9B%E7%A7%8D%E9%AB%98%E7%BA%A7%E6%95%B0%E6%8D%AE%E7%B1%BB%E5%9E%8B%22%5D%0A%20%20%20%20%20%20%20%20Bitmap%5B%22Bitmap%3Cbr%2F%3E%E4%BD%8D%E6%93%8D%E4%BD%9C%E7%AD%BE%E5%88%B0%E7%B3%BB%E7%BB%9F%22%5D%0A%20%20%20%20%20%20%20%20HyperLogLog%5B%22HyperLogLog%3Cbr%2F%3E%E5%9F%BA%E6%95%B0%E7%BB%9F%E8%AE%A1%20UV%22%5D%0A%20%20%20%20%20%20%20%20GEO%5B%22GEO%3Cbr%2F%3E%E5%9C%B0%E7%90%86%E4%BD%8D%E7%BD%AE%20LBS%22%5D%0A%20%20%20%20%20%20%20%20Stream%5B%22Stream%3Cbr%2F%3E%E6%B6%88%E6%81%AF%E9%98%9F%E5%88%97%22%5D%0A%20%20%20%20end%0A%0A%20%20%20%20String%20--%3E%20SDS%0A%20%20%20%20Hash%20--%3E%20Listpack%0A%20%20%20%20Hash%20--%3E%20Hashtable%0A%20%20%20%20List%20--%3E%20Quicklist%0A%20%20%20%20Set%20--%3E%20Listpack%0A%20%20%20%20Set%20--%3E%20Hashtable%0A%20%20%20%20Set%20--%3E%20Intset%0A%20%20%20%20ZSet%20--%3E%20Skiplist%0A%20%20%20%20ZSet%20--%3E%20Listpack%0A%0A%20%20%20%20String%20-.-%3E%20Bitmap%0A%20%20%20%20ZSet%20-.-%3E%20GEO%0A%20%20%20%20Stream%20--%3E%20Skiplist%0A"})]),fallback:p(()=>[...s[0]||(s[0]=[c(" Loading... ",-1)])]),_:1})),s[2]||(s[2]=a(`<hr><h2 id="二、基础到进阶学习路线" tabindex="-1">二、基础到进阶学习路线 <a class="header-anchor" href="#二、基础到进阶学习路线" aria-label="Permalink to &quot;二、基础到进阶学习路线&quot;">​</a></h2><ul><li><strong>阶段一：基础入门</strong> -- 熟练掌握五种基础类型的 API、使用场景和 Key 设计规范，能够在日常开发中正确选型</li><li><strong>阶段二：原理深入</strong> -- 理解每种数据类型的底层编码结构（SDS / quicklist / skiplist / listpack / hashtable），明白 Redis 在不同数据规模下自动切换编码的阈值策略</li><li><strong>阶段三：实战优化</strong> -- 掌握 Bitmap、HyperLogLog、GEO、Stream 四种高级类型的高阶用法；能够分析内存占用并给出优化方案；理解 Stream 消费者组与消息确认机制</li></ul><hr><h2 id="三、核心知识详解" tabindex="-1">三、核心知识详解 <a class="header-anchor" href="#三、核心知识详解" aria-label="Permalink to &quot;三、核心知识详解&quot;">​</a></h2><h3 id="_3-1-sds-simple-dynamic-string" tabindex="-1">3.1 SDS（Simple Dynamic String） <a class="header-anchor" href="#_3-1-sds-simple-dynamic-string" aria-label="Permalink to &quot;3.1 SDS（Simple Dynamic String）&quot;">​</a></h3><p>SDS 是 Redis 中 String 类型的底层实现，用于替代 C 语言原生字符串。它不是简单的 <code>char*</code> 封装，而是一个经过精心设计的数据结构。</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>SDS 结构（Redis 3.2+ 按长度分为 5 种）：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>sdshdr5  → flags(1B) + buf[]        （长度 &lt; 32）</span></span>
<span class="line"><span>sdshdr8  → len(1B) + alloc(1B) + flags(1B) + buf[]  （长度 &lt; 256）</span></span>
<span class="line"><span>sdshdr16 → len(2B) + alloc(2B) + flags(1B) + buf[]</span></span>
<span class="line"><span>sdshdr32 → len(4B) + alloc(4B) + flags(1B) + buf[]</span></span>
<span class="line"><span>sdshdr64 → len(8B) + alloc(8B) + flags(1B) + buf[]</span></span>
<span class="line"><span></span></span>
<span class="line"><span>核心字段：</span></span>
<span class="line"><span>  - len：已使用字节数（O(1) 获取长度）</span></span>
<span class="line"><span>  - alloc：已分配总字节数（不含头结构和结尾 &#39;\\0&#39;）</span></span>
<span class="line"><span>  - flags：低 3 位标识类型，高 5 位未使用</span></span>
<span class="line"><span>  - buf：柔性数组，存放实际数据（二进制安全，末尾额外 1 字节 &#39;\\0&#39;）</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br></div></div><table tabindex="0"><thead><tr><th>特性</th><th>C 原生字符串</th><th>SDS</th></tr></thead><tbody><tr><td>获取长度</td><td>O(n)，遍历到 <code>\\0</code></td><td>O(1)，读取 <code>len</code> 字段</td></tr><tr><td>缓冲区溢出</td><td>手动管理，容易溢出</td><td>自动扩容（预分配 + 惰性空间释放）</td></tr><tr><td>二进制安全</td><td>不安全，<code>\\0</code> 被当作结束符</td><td>安全，以 <code>len</code> 界定数据边界</td></tr><tr><td>修改操作</td><td>N 次拼接需 N 次 <code>realloc</code></td><td>预分配减少内存重分配次数</td></tr><tr><td>内存碎片</td><td>频繁 <code>malloc/free</code> 产生碎片</td><td>惰性释放 + 预分配策略</td></tr></tbody></table><h4 id="扩容策略" tabindex="-1">扩容策略 <a class="header-anchor" href="#扩容策略" aria-label="Permalink to &quot;扩容策略&quot;">​</a></h4><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>扩容规则（sdsMakeRoomFor）：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>1. 如果新长度 &lt; 1MB（SDS_MAX_PREALLOC）：</span></span>
<span class="line"><span>     新容量 = 新长度 * 2（翻倍）</span></span>
<span class="line"><span>2. 如果新长度 &gt;= 1MB：</span></span>
<span class="line"><span>     新容量 = 新长度 + 1MB（每次 +1MB，避免内存浪费）</span></span>
<span class="line"><span></span></span>
<span class="line"><span>示例：</span></span>
<span class="line"><span>  原 len=6, alloc=6 → append 4 字节 → 新长度 10</span></span>
<span class="line"><span>  → 10 * 2 = 20，分配 20 字节</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  原 len=2MB, alloc=2MB → append 1MB → 新长度 3MB</span></span>
<span class="line"><span>  → 3MB + 1MB = 4MB，分配 4MB</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br></div></div><h4 id="embstr-vs-raw-编码" tabindex="-1">embstr vs raw 编码 <a class="header-anchor" href="#embstr-vs-raw-编码" aria-label="Permalink to &quot;embstr vs raw 编码&quot;">​</a></h4><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>编码选择逻辑（object.c）：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  String 长度 ≤ OBJ_ENCODING_EMBSTR_SIZE_LIMIT（44 字节）→ embstr</span></span>
<span class="line"><span>  String 长度 &gt; 44 字节 → raw</span></span>
<span class="line"><span></span></span>
<span class="line"><span>embstr 优势：</span></span>
<span class="line"><span>  - 一次内存分配，RedisObject + SDS 在连续内存中</span></span>
<span class="line"><span>  - 缓存友好（CPU 缓存局部性更好）</span></span>
<span class="line"><span>  - 只读编码，修改时自动转为 raw</span></span>
<span class="line"><span></span></span>
<span class="line"><span>raw 特点：</span></span>
<span class="line"><span>  - 两次内存分配，RedisObject 与 SDS 分开</span></span>
<span class="line"><span>  - 可修改，复用内存</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br></div></div><h3 id="_3-2-quicklist-list-的底层实现" tabindex="-1">3.2 quicklist -- List 的底层实现 <a class="header-anchor" href="#_3-2-quicklist-list-的底层实现" aria-label="Permalink to &quot;3.2 quicklist -- List 的底层实现&quot;">​</a></h3><p>Redis 3.2 之前 List 使用 ziplist + linkedlist 混合实现，3.2 开始统一使用 quicklist。</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>quicklist 结构：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  quicklist</span></span>
<span class="line"><span>    ├── head → quicklistNode → [listpack 节点0]</span></span>
<span class="line"><span>    │                          ├─ entry0: &quot;data1&quot;</span></span>
<span class="line"><span>    │                          ├─ entry1: &quot;data2&quot;</span></span>
<span class="line"><span>    │                          └─ entry2: &quot;data3&quot;</span></span>
<span class="line"><span>    ├── ...  → quicklistNode → [listpack 节点1]</span></span>
<span class="line"><span>    │                          ├─ entry0: &quot;data4&quot;</span></span>
<span class="line"><span>    │                          └─ entry1: &quot;data5&quot;</span></span>
<span class="line"><span>    └── tail → quicklistNode → [listpack 节点2]</span></span>
<span class="line"><span>                               └─ entry0: &quot;data6&quot;</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br></div></div><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>quicklist 核心字段（quicklist.h）：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>typedef struct quicklist {</span></span>
<span class="line"><span>    quicklistNode *head;        // 链表头</span></span>
<span class="line"><span>    quicklistNode *tail;        // 链表尾</span></span>
<span class="line"><span>    unsigned long count;        // 所有 entry 总数</span></span>
<span class="line"><span>    unsigned long len;          // quicklistNode 数量</span></span>
<span class="line"><span>    int fill : QL_FILL_BITS;    // 每个节点填充因子</span></span>
<span class="line"><span>    unsigned int compress : QL_COMP_BITS;  // 两端不压缩的节点数</span></span>
<span class="line"><span>    ...</span></span>
<span class="line"><span>} quicklist;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>typedef struct quicklistNode {</span></span>
<span class="line"><span>    struct quicklistNode *prev; // 前驱指针</span></span>
<span class="line"><span>    struct quicklistNode *next; // 后继指针</span></span>
<span class="line"><span>    unsigned char *entry;       // 指向 listpack 的数据指针</span></span>
<span class="line"><span>    size_t sz;                  // listpack 字节大小</span></span>
<span class="line"><span>    unsigned int count : 16;    // 当前节点中 entry 数量</span></span>
<span class="line"><span>    unsigned int encoding : 2;  // 编码方式：RAW=1 / LZF=2</span></span>
<span class="line"><span>    ...</span></span>
<span class="line"><span>} quicklistNode;</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br></div></div><h4 id="为什么-quicklist-优于-ziplist-linkedlist" tabindex="-1">为什么 quicklist 优于 ziplist + linkedlist？ <a class="header-anchor" href="#为什么-quicklist-优于-ziplist-linkedlist" aria-label="Permalink to &quot;为什么 quicklist 优于 ziplist + linkedlist？&quot;">​</a></h4><table tabindex="0"><thead><tr><th>维度</th><th>ziplist + linkedlist</th><th>quicklist</th></tr></thead><tbody><tr><td>内存效率</td><td>linkedlist 每个节点 2 个指针（16B），小元素场景指针开销 &gt; 数据</td><td>每个节点存多个元素（listpack 批量存储），指针开销被分摊</td></tr><tr><td>操作性能</td><td>头尾 O(1)，中间 O(n) 遍历链表节点</td><td>头尾 O(1)，中间查找先定位到 quicklistNode，再遍历 listpack，更少的指针跳转</td></tr><tr><td>压缩能力</td><td>无法压缩</td><td>LZF 压缩中间节点（两端保持解压状态，保证头尾操作性能）</td></tr><tr><td>链式存储</td><td>元素少时 ziplist 紧凑但修改代价高；元素多时 linkedlist 内存碎片多</td><td>折衷方案，可调节 fill 参数控制每个节点 entry 数量</td></tr></tbody></table><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>list-max-ziplist-size（Redis 7.0 中改为 list-max-listpack-size）：</span></span>
<span class="line"><span>  -1：每个 quicklistNode 最大 4KB</span></span>
<span class="line"><span>  -2：每个 quicklistNode 最大 8KB（默认）</span></span>
<span class="line"><span>  -3：每个 quicklistNode 最大 16KB</span></span>
<span class="line"><span>  -4：每个 quicklistNode 最大 32KB</span></span>
<span class="line"><span>  -5：每个 quicklistNode 最大 64KB</span></span>
<span class="line"><span>  正数：每个 quicklistNode 最多 N 个 entry</span></span>
<span class="line"><span></span></span>
<span class="line"><span>list-compress-depth：</span></span>
<span class="line"><span>  0：不压缩（默认）</span></span>
<span class="line"><span>  1：两端各 1 个节点不压缩，中间 LZF 压缩</span></span>
<span class="line"><span>  2：两端各 2 个节点不压缩，中间 LZF 压缩</span></span>
<span class="line"><span>  ...</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br></div></div><h4 id="lzf-压缩原理" tabindex="-1">LZF 压缩原理 <a class="header-anchor" href="#lzf-压缩原理" aria-label="Permalink to &quot;LZF 压缩原理&quot;">​</a></h4><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>LZF（Lempel-Ziv-Findlay）是一种轻量级无损压缩算法：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>特点：</span></span>
<span class="line"><span>  - 压缩/解压速度极快（适合热数据场景）</span></span>
<span class="line"><span>  - 压缩率适中（通常 40%~60%）</span></span>
<span class="line"><span>  - 算法简单（约 200 行 C 代码）</span></span>
<span class="line"><span></span></span>
<span class="line"><span>quicklist 中的使用策略：</span></span>
<span class="line"><span>  - 只压缩中间节点（list-compress-depth 控制两端保留不压缩节点数）</span></span>
<span class="line"><span>  - 读操作时按需解压（懒惰解压）</span></span>
<span class="line"><span>  - 写操作前检查是否需要重新压缩</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br></div></div><h3 id="_3-3-skiplist-zset-的核心引擎" tabindex="-1">3.3 skiplist -- ZSet 的核心引擎 <a class="header-anchor" href="#_3-3-skiplist-zset-的核心引擎" aria-label="Permalink to &quot;3.3 skiplist -- ZSet 的核心引擎&quot;">​</a></h3><p>跳表是一种随机化的多层链表结构，通过在不同层级建立索引，将查找时间复杂度从 O(n) 降到 O(log n)。</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>跳表结构示意（level=4，p=0.25）：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>Level 3:  head ────────────────────────────────&gt; 20 ──────────&gt; NULL</span></span>
<span class="line"><span>Level 2:  head ────────&gt; 7 ────────────────────&gt; 20 ──────────&gt; NULL</span></span>
<span class="line"><span>Level 1:  head ──&gt; 3 ──&gt; 7 ──────&gt; 12 ────────&gt; 20 ──&gt; 25 ──&gt; NULL</span></span>
<span class="line"><span>Level 0:  head ──&gt; 3 ──&gt; 7 ──&gt; 9 ──&gt; 12 ──&gt; 18 ──&gt; 20 ──&gt; 25 ──&gt; NULL</span></span>
<span class="line"><span></span></span>
<span class="line"><span>每个节点在创建时随机分配层数（几何分布），高层的节点充当&quot;快速通道&quot;。</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br></div></div><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Redis 跳表结构（server.h）：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 跳表节点</span></span>
<span class="line"><span>typedef struct zskiplistNode {</span></span>
<span class="line"><span>    sds ele;                          // 成员对象（member）</span></span>
<span class="line"><span>    double score;                     // 分值</span></span>
<span class="line"><span>    struct zskiplistNode *backward;   // 后退指针（Level 0 双向链表）</span></span>
<span class="line"><span>    struct zskiplistLevel {</span></span>
<span class="line"><span>        struct zskiplistNode *forward;// 前进指针</span></span>
<span class="line"><span>        unsigned long span;           // 跨度（两个节点之间的节点数）</span></span>
<span class="line"><span>    } level[];                        // 柔性数组，多层索引</span></span>
<span class="line"><span>} zskiplistNode;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 跳表</span></span>
<span class="line"><span>typedef struct zskiplist {</span></span>
<span class="line"><span>    struct zskiplistNode *header, *tail;</span></span>
<span class="line"><span>    unsigned long length;             // 节点总数</span></span>
<span class="line"><span>    int level;                        // 当前最高层数</span></span>
<span class="line"><span>} zskiplist;</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br></div></div><h4 id="插入过程详解" tabindex="-1">插入过程详解 <a class="header-anchor" href="#插入过程详解" aria-label="Permalink to &quot;插入过程详解&quot;">​</a></h4><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>插入 score=15, member=&quot;data15&quot; 的过程：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>1. 随机生成层数：</span></span>
<span class="line"><span>   while (random() &amp; 0xFFFF) &lt; (ZSKIPLIST_P * 0xFFFF)  // p=0.25</span></span>
<span class="line"><span>       level++;</span></span>
<span class="line"><span>   最大层数：ZSKIPLIST_MAXLEVEL = 32</span></span>
<span class="line"><span></span></span>
<span class="line"><span>2. 从高层向低层查找每层的前驱节点（update[] 数组）：</span></span>
<span class="line"><span>   Level 3: head → 20（15 &lt; 20，update[3]=head）</span></span>
<span class="line"><span>   Level 2: head → 7 → 20（15 &lt; 20，update[2]=7 所在节点）</span></span>
<span class="line"><span>   Level 1: head → 3 → 7 → 12 → 20（15 &lt; 20，update[1]=12 所在节点）</span></span>
<span class="line"><span>   Level 0: ... 12 → 18（15 &lt; 18，update[0]=12 所在节点）</span></span>
<span class="line"><span></span></span>
<span class="line"><span>3. 计算 span（排名跨度）：</span></span>
<span class="line"><span>   对于每一层 level[i]：</span></span>
<span class="line"><span>     span = update[i]-&gt;level[i].span - (rank[0] - rank[i])</span></span>
<span class="line"><span>     rank[i] 是从 header 到 update[i] 经过的总节点数</span></span>
<span class="line"><span></span></span>
<span class="line"><span>4. 将新节点插入各层：</span></span>
<span class="line"><span>   node-&gt;level[i].forward = update[i]-&gt;level[i].forward</span></span>
<span class="line"><span>   update[i]-&gt;level[i].forward = node</span></span>
<span class="line"><span></span></span>
<span class="line"><span>5. 如果新节点层数 &gt; 当前最高层，更新 header 的高层 forward 指向新节点</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br></div></div><h4 id="查找过程" tabindex="-1">查找过程 <a class="header-anchor" href="#查找过程" aria-label="Permalink to &quot;查找过程&quot;">​</a></h4><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>查找 score=12 的节点：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>1. 从最高层（Level 3）开始：</span></span>
<span class="line"><span>   cur = header→level[3].forward = 20</span></span>
<span class="line"><span>   12 &lt; 20，下降到 Level 2</span></span>
<span class="line"><span></span></span>
<span class="line"><span>2. Level 2：</span></span>
<span class="line"><span>   cur = header→level[2].forward = 7</span></span>
<span class="line"><span>   12 &gt; 7，cur = 7→level[2].forward = 20</span></span>
<span class="line"><span>   12 &lt; 20，下降到 Level 1</span></span>
<span class="line"><span></span></span>
<span class="line"><span>3. Level 1：</span></span>
<span class="line"><span>   cur = 7→level[1].forward = 12</span></span>
<span class="line"><span>   12 == 12，命中！</span></span>
<span class="line"><span></span></span>
<span class="line"><span>4. 继续沿 Level 0 向前，找到所有 score=12 的节点（同分值按 member 字典序排列）</span></span>
<span class="line"><span></span></span>
<span class="line"><span>时间复杂度：O(log N)</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br></div></div><h4 id="为什么用跳表而不是红黑树" tabindex="-1">为什么用跳表而不是红黑树？ <a class="header-anchor" href="#为什么用跳表而不是红黑树" aria-label="Permalink to &quot;为什么用跳表而不是红黑树？&quot;">​</a></h4><table tabindex="0"><thead><tr><th>维度</th><th>跳表</th><th>红黑树</th></tr></thead><tbody><tr><td>实现复杂度</td><td>简单（约 200 行），无旋转/染色</td><td>复杂（约 400 行），插入需平衡旋转</td></tr><tr><td>范围查询</td><td><code>ZRANGEBYSCORE</code> 只需找到区间起点，沿 Level 0 顺序遍历即可</td><td>需要中序遍历，实现复杂，效率不如跳表的顺序链表</td></tr><tr><td>并发友好性</td><td>插入只影响局部节点（前驱和后继），锁粒度小</td><td>旋转可能影响大量节点，锁粒度大</td></tr><tr><td>内存占用</td><td>每个节点平均 p/(1-p)=0.33 个额外指针（p=0.25），约多 33%</td><td>每个节点 3 个指针（left/right/parent）+ 1 byte 颜色</td></tr><tr><td>排名查询</td><td>span 字段天然支持 O(logN) 排名计算</td><td>需要额外维护子树节点计数</td></tr></tbody></table><div class="tip custom-block"><p class="custom-block-title">关键理解</p><p>ZSet 同时使用 skiplist + hashtable（dict）：</p><ul><li><strong>hashtable</strong>：通过 member 查 score，O(1)，用于 <code>ZSCORE</code>、<code>ZRANK</code> 等精确查询</li><li><strong>skiplist</strong>：通过 score 查 member，O(logN)，用于 <code>ZRANGEBYSCORE</code>、<code>ZREVRANGE</code> 等范围查询</li></ul><p>两者结合，各取所长。member → score 映射存在 hashtable 中，score → member 的顺序关系存在 skiplist 中。</p></div><h3 id="_3-4-listpack-紧凑内存编码" tabindex="-1">3.4 listpack -- 紧凑内存编码 <a class="header-anchor" href="#_3-4-listpack-紧凑内存编码" aria-label="Permalink to &quot;3.4 listpack -- 紧凑内存编码&quot;">​</a></h3><p>Redis 7.0 中 listpack 全面替代 ziplist，成为 Hash、Set、ZSet 在小数据量时的默认编码。</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>ziplist 的问题（为什么被废弃）：</span></span>
<span class="line"><span>  - 连锁更新（cascade update）：</span></span>
<span class="line"><span>    每个 entry 存储前一个 entry 的长度，</span></span>
<span class="line"><span>    当某个 entry 从 253→254 字节时，</span></span>
<span class="line"><span>    下一个 entry 的 prevlen 字段从 1B 变为 5B，</span></span>
<span class="line"><span>    触发连锁扩容 → 所有后续 entry 位置偏移 → 大量内存重分配</span></span>
<span class="line"><span></span></span>
<span class="line"><span>listpack 结构：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  +--------+--------+--------+--------+-----+--------+--------+</span></span>
<span class="line"><span>  | tot-bytes| num-ele| entry1 | entry2 | ... | entryN | end-byte|</span></span>
<span class="line"><span>  +--------+--------+--------+--------+-----+--------+--------+</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  entry 结构：</span></span>
<span class="line"><span>  +-----------+-----------+-----------+</span></span>
<span class="line"><span>  | encoding  | data      | backlen   |</span></span>
<span class="line"><span>  +-----------+-----------+-----------+</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  backlen（反向长度）：记录当前 entry 的总字节数（而不是前一个的长度）</span></span>
<span class="line"><span>  从 entry 末尾向前读取 backlen，即可知道当前 entry 占多少字节，</span></span>
<span class="line"><span>  进而定位到前一个 entry，「不需要」知道前一个 entry 的长度。</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  关键优势：当前 entry 变化只影响自己的 backlen，</span></span>
<span class="line"><span>           不会触发下一个 entry 的重写 → 消除连锁更新！</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br></div></div><table tabindex="0"><thead><tr><th>编码</th><th>条件</th><th>配置参数</th></tr></thead><tbody><tr><td>Hash → listpack</td><td>字段数 ≤ 512 且单值 ≤ 64B</td><td><code>hash-max-listpack-entries</code> / <code>hash-max-listpack-value</code></td></tr><tr><td>Hash → hashtable</td><td>超过任一阈值</td><td>同上</td></tr><tr><td>Set → listpack</td><td>元素数 ≤ 128 且单元素 ≤ 64B</td><td><code>set-max-listpack-entries</code> / <code>set-max-listpack-value</code></td></tr><tr><td>Set → hashtable</td><td>超过任一阈值</td><td>同上</td></tr><tr><td>ZSet → listpack</td><td>元素数 ≤ 128 且单值 ≤ 64B</td><td><code>zset-max-listpack-entries</code> / <code>zset-max-listpack-value</code></td></tr><tr><td>ZSet → skiplist + hashtable</td><td>超过任一阈值</td><td>同上</td></tr></tbody></table><h3 id="_3-5-hashtable-渐进式-rehash" tabindex="-1">3.5 hashtable -- 渐进式 rehash <a class="header-anchor" href="#_3-5-hashtable-渐进式-rehash" aria-label="Permalink to &quot;3.5 hashtable -- 渐进式 rehash&quot;">​</a></h3><p>Redis 的字典采用链地址法解决哈希冲突，核心特色是<strong>渐进式 rehash</strong>。</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>dict 结构：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>typedef struct dict {</span></span>
<span class="line"><span>    dictType *type;       // 类型特定函数</span></span>
<span class="line"><span>    void *privdata;       // 私有数据</span></span>
<span class="line"><span>    dictht ht[2];         // 两个哈希表（用于渐进式 rehash）</span></span>
<span class="line"><span>    long rehashidx;       // rehash 索引，-1 表示不在 rehash</span></span>
<span class="line"><span>    int16_t pauserehash;  // rehash 暂停标志</span></span>
<span class="line"><span>} dict;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>typedef struct dictht {</span></span>
<span class="line"><span>    dictEntry **table;    // 哈希表数组</span></span>
<span class="line"><span>    unsigned long size;   // 哈希表大小</span></span>
<span class="line"><span>    unsigned long sizemask; // 掩码 = size - 1</span></span>
<span class="line"><span>    unsigned long used;   // 已使用节点数</span></span>
<span class="line"><span>} dictht;</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br></div></div><h4 id="渐进式-rehash-流程" tabindex="-1">渐进式 rehash 流程 <a class="header-anchor" href="#渐进式-rehash-流程" aria-label="Permalink to &quot;渐进式 rehash 流程&quot;">​</a></h4><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>为什么需要渐进式 rehash？</span></span>
<span class="line"><span>  如果哈希表中有数百万个键值对，</span></span>
<span class="line"><span>  一次性 rehash 会阻塞主线程数秒，</span></span>
<span class="line"><span>  导致所有客户端请求超时。</span></span>
<span class="line"><span></span></span>
<span class="line"><span>rehash 步骤：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>1. 为 ht[1] 分配空间：</span></span>
<span class="line"><span>    扩容：ht[1].size = 第一个大于等于 ht[0].used * 2 的 2^n</span></span>
<span class="line"><span>    缩容：ht[1].size = 第一个大于等于 ht[0].used 的 2^n</span></span>
<span class="line"><span>  设置 rehashidx = 0</span></span>
<span class="line"><span></span></span>
<span class="line"><span>2. 渐进式迁移：</span></span>
<span class="line"><span>   每次对字典执行增删改查操作时，顺带将 ht[0][rehashidx] 上的所有</span></span>
<span class="line"><span>   键值对 rehash 到 ht[1]，然后 rehashidx++</span></span>
<span class="line"><span></span></span>
<span class="line"><span>3. 迁移完成：</span></span>
<span class="line"><span>   当 ht[0].used == 0，释放 ht[0].table</span></span>
<span class="line"><span>   将 ht[1] 赋值给 ht[0]，重置 ht[1] 和 rehashidx = -1</span></span>
<span class="line"><span></span></span>
<span class="line"><span>定时辅助 rehash：</span></span>
<span class="line"><span>  serverCron 每 100ms 执行 1ms 的辅助 rehash</span></span>
<span class="line"><span>  即 databasesCron → incrementallyRehash</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br></div></div><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>rehash 期间的查找逻辑：</span></span>
<span class="line"><span>  1. 先在 ht[0] 中查找</span></span>
<span class="line"><span>  2. 如果没找到且 rehashidx != -1，再到 ht[1] 中查找</span></span>
<span class="line"><span></span></span>
<span class="line"><span>rehash 期间的插入逻辑：</span></span>
<span class="line"><span>  新键值对统一插入 ht[1]，保证 ht[0] 只减不增</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br></div></div><h3 id="_3-6-bitmap-签到系统" tabindex="-1">3.6 Bitmap -- 签到系统 <a class="header-anchor" href="#_3-6-bitmap-签到系统" aria-label="Permalink to &quot;3.6 Bitmap -- 签到系统&quot;">​</a></h3><p>Bitmap 底层就是 String，通过操作 bit 位实现极致的空间效率。</p><div class="language-redis vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">redis</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>-- ========== 用户签到系统 ==========</span></span>
<span class="line"><span></span></span>
<span class="line"><span>-- 用户 1001 在 2024-06-06 签到（一年第 157 天）</span></span>
<span class="line"><span>SETBIT checkin:user:1001:2024 157 1</span></span>
<span class="line"><span></span></span>
<span class="line"><span>-- 查询某天是否签到</span></span>
<span class="line"><span>GETBIT checkin:user:1001:2024 157          -- 1（已签到）</span></span>
<span class="line"><span></span></span>
<span class="line"><span>-- 统计全年签到天数</span></span>
<span class="line"><span>BITCOUNT checkin:user:1001:2024</span></span>
<span class="line"><span></span></span>
<span class="line"><span>-- 首次签到的日期（第一个 1 的位置）</span></span>
<span class="line"><span>BITPOS checkin:user:1001:2024 1            -- 返回 offset</span></span>
<span class="line"><span></span></span>
<span class="line"><span>-- ========== 统计连续签到用户 ==========</span></span>
<span class="line"><span></span></span>
<span class="line"><span>-- 6月5日和6月6日都签到的用户</span></span>
<span class="line"><span>BITOP AND continuous:checkin:0605-0606 checkin:date:20240605 checkin:date:20240606</span></span>
<span class="line"><span>BITCOUNT continuous:checkin:0605-0606</span></span>
<span class="line"><span></span></span>
<span class="line"><span>-- 6月1日~7日任意一天签到的用户</span></span>
<span class="line"><span>BITOP OR week:active checkin:date:20240601 checkin:date:20240602 \\</span></span>
<span class="line"><span>                     checkin:date:20240603 checkin:date:20240604 \\</span></span>
<span class="line"><span>                     checkin:date:20240605 checkin:date:20240606 \\</span></span>
<span class="line"><span>                     checkin:date:20240607</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br></div></div><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>空间计算：</span></span>
<span class="line"><span>  1 亿用户 × 365 天 = 365 亿 bit</span></span>
<span class="line"><span>  365亿 bit ÷ 8 ÷ 1024 ÷ 1024 ≈ 4.35 GB</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  但如果按年分 Key（每个用户一个 Key），</span></span>
<span class="line"><span>  每个 Key = 365 bit ≈ 46 byte + 元数据 ≈ 70 byte</span></span>
<span class="line"><span>  1 亿用户 × 70 byte ≈ 6.5 GB（Redis 内存占用，不是纯数据）</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  更优方案：按天分 Key（每天一个 Bitmap）：</span></span>
<span class="line"><span>  checkin:date:20240606 → 1 亿 bit ≈ 12 MB</span></span>
<span class="line"><span>  365 天 × 12 MB ≈ 4.38 GB</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br></div></div><h3 id="_3-7-hyperloglog-uv-统计" tabindex="-1">3.7 HyperLogLog -- UV 统计 <a class="header-anchor" href="#_3-7-hyperloglog-uv-统计" aria-label="Permalink to &quot;3.7 HyperLogLog -- UV 统计&quot;">​</a></h3><p>HyperLogLog 是一种基数估计算法，以极小的误差换取了极致的空间效率。</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>核心原理（简化理解）：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>1. 对每个元素进行哈希（64 位）</span></span>
<span class="line"><span>2. 取哈希值低位 N 位作为桶编号（N=14，共 16384 个桶）</span></span>
<span class="line"><span>3. 剩余位中，记录第一个 1 出现的位置（ρ 值）</span></span>
<span class="line"><span>4. 每个桶保留最大的 ρ 值</span></span>
<span class="line"><span></span></span>
<span class="line"><span>   例如：hash(user_1001) = ...000100110...</span></span>
<span class="line"><span>        第一个 1 在位置 4 → ρ = 4</span></span>
<span class="line"><span>        如果桶 0 当前 max_ρ = 3，更新为 4</span></span>
<span class="line"><span></span></span>
<span class="line"><span>5. 调和平均数聚合：</span></span>
<span class="line"><span>   基数 ≈ constant × 16384² / Σ(2^(-ρ[i]))</span></span>
<span class="line"><span></span></span>
<span class="line"><span>为什么 12KB？</span></span>
<span class="line"><span>  16384 个桶 × 6bit（每个桶存 0~63 的 ρ 值）</span></span>
<span class="line"><span>  = 98304 bit = 12288 byte = 12 KB</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br></div></div><table tabindex="0"><thead><tr><th>特性</th><th>Set</th><th>HyperLogLog</th></tr></thead><tbody><tr><td>精确度</td><td>100% 精确</td><td>标准误差 0.81%</td></tr><tr><td>内存占用</td><td>随元素数量线性增长</td><td>固定 12 KB</td></tr><tr><td>单元素判断</td><td>支持（SISMEMBER）</td><td>不支持</td></tr><tr><td>合并操作</td><td>SINTER / SUNION（O(N)）</td><td>PFMERGE（O(1)，12KB 固定）</td></tr><tr><td>适用场景</td><td>精确去重、标签系统</td><td>UV 统计、大流量基数估计</td></tr></tbody></table><div class="language-redis vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">redis</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>-- ========== 页面 UV 统计 ==========</span></span>
<span class="line"><span></span></span>
<span class="line"><span>-- 记录每天 UV</span></span>
<span class="line"><span>PFADD uv:page:home:20240606 user:1001 user:1002 user:1003</span></span>
<span class="line"><span></span></span>
<span class="line"><span>-- 当天 UV 数（估算值）</span></span>
<span class="line"><span>PFCOUNT uv:page:home:20240606          -- 约 3</span></span>
<span class="line"><span></span></span>
<span class="line"><span>-- 合并一周 UV（自动去重）</span></span>
<span class="line"><span>PFMERGE uv:page:home:week24 \\</span></span>
<span class="line"><span>    uv:page:home:20240603 \\</span></span>
<span class="line"><span>    uv:page:home:20240604 \\</span></span>
<span class="line"><span>    uv:page:home:20240605 \\</span></span>
<span class="line"><span>    uv:page:home:20240606 \\</span></span>
<span class="line"><span>    uv:page:home:20240607</span></span>
<span class="line"><span>PFCOUNT uv:page:home:week24            -- 周 UV</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br></div></div><div class="warning custom-block"><p class="custom-block-title">HyperLogLog 使用注意</p><ol><li><strong>结果有误差</strong>：标准误差 0.81%，不适合财务审计等精确场景</li><li><strong>不能判断元素是否存在</strong>：用 Set 或 Bloom Filter</li><li><strong>基数很小时误差较大</strong>：Redis 对基数 &lt; 10000 使用稀疏矩阵，基数很小时退化为精确计数</li><li><strong>PFMERGE 性能</strong>：合并操作是 O(1)（固定 12KB 拷贝），非常快</li></ol></div><h3 id="_3-8-geo-地理位置" tabindex="-1">3.8 GEO -- 地理位置 <a class="header-anchor" href="#_3-8-geo-地理位置" aria-label="Permalink to &quot;3.8 GEO -- 地理位置&quot;">​</a></h3><p>GEO 底层基于 ZSet 实现，通过 GeoHash 算法将经纬度编码为一维整数作为 score。</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>GeoHash 编码原理（以 5 位 GeoHash 为例）：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>Step 1: 经纬度二分逼近</span></span>
<span class="line"><span>  经度范围 [-180, 180]，不断二分：</span></span>
<span class="line"><span>    在左区间 → bit=0，在右区间 → bit=1</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  经度 116.404：</span></span>
<span class="line"><span>    0: [0, 180]       → bit=1</span></span>
<span class="line"><span>    1: [90, 180]      → bit=1</span></span>
<span class="line"><span>    2: [90, 135]      → bit=0</span></span>
<span class="line"><span>    ...</span></span>
<span class="line"><span>  得到经度二进制：11010 01011 00101 ...</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  纬度 39.915（范围[-90, 90]）：</span></span>
<span class="line"><span>    0: [0, 90]        → bit=1</span></span>
<span class="line"><span>    1: [0, 45]        → bit=0</span></span>
<span class="line"><span>    2: [22.5, 45]     → bit=1</span></span>
<span class="line"><span>    ...</span></span>
<span class="line"><span>  得到纬度二进制：10111 00011 00110 ...</span></span>
<span class="line"><span></span></span>
<span class="line"><span>Step 2: 交叉编码（经度占偶数位，纬度占奇数位）</span></span>
<span class="line"><span>  经度: 1  1  0  1  0  0  1  0 ...</span></span>
<span class="line"><span>  纬度: 1  0  1  1  1  0  0  0 ...</span></span>
<span class="line"><span>  结果: 11 01 10 11 01 00 10 00 ...</span></span>
<span class="line"><span></span></span>
<span class="line"><span>Step 3: Base32 编码 → 字符串（如 wx4g0）</span></span>
<span class="line"><span>  ZSet score = GeoHash 整数（52 位有效位）</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br></div></div><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>距离计算（Haversine 公式）：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>a = sin²(Δlat/2) + cos(lat1) * cos(lat2) * sin²(Δlon/2)</span></span>
<span class="line"><span>c = 2 * atan2(√a, √(1-a))</span></span>
<span class="line"><span>d = R * c   （R = 6371 km，地球半径）</span></span>
<span class="line"><span></span></span>
<span class="line"><span>GEORADIUS 查询流程：</span></span>
<span class="line"><span>  1. 计算目标点的 GeoHash（作为中心）</span></span>
<span class="line"><span>  2. 利用 GeoHash 前缀相同 ≈ 地理位置接近的特性，</span></span>
<span class="line"><span>     扩展查询周围 8 个相邻 GeoHash 区域</span></span>
<span class="line"><span>  3. 用 ZRANGEBYSCORE 在这些区域中检索</span></span>
<span class="line"><span>  4. 对结果进行精确距离过滤（Haversine 公式计算）</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br></div></div><div class="language-redis vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">redis</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>-- ========== LBS 附近商家 ==========</span></span>
<span class="line"><span></span></span>
<span class="line"><span>-- 添加商家位置</span></span>
<span class="line"><span>GEOADD shops 116.404 39.915 &quot;shop:001:星巴克国贸店&quot;</span></span>
<span class="line"><span>GEOADD shops 116.410 39.920 &quot;shop:002:瑞幸国贸二店&quot;</span></span>
<span class="line"><span>GEOADD shops 116.398 39.908 &quot;shop:003:Manner建外SOHO&quot;</span></span>
<span class="line"><span>GEOADD shops 121.473 31.230 &quot;shop:004:星巴克南京西路&quot;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>-- 查询国贸（116.404, 39.915）附近 3km 的商家</span></span>
<span class="line"><span>GEORADIUS shops 116.404 39.915 3 km \\</span></span>
<span class="line"><span>    WITHDIST WITHCOORD ASC COUNT 10</span></span>
<span class="line"><span></span></span>
<span class="line"><span>-- 以&quot;星巴克国贸店&quot;为基准查附近</span></span>
<span class="line"><span>GEORADIUSBYMEMBER shops &quot;shop:001:星巴克国贸店&quot; 2 km WITHDIST</span></span>
<span class="line"><span></span></span>
<span class="line"><span>-- 计算两个商家之间的距离</span></span>
<span class="line"><span>GEODIST shops &quot;shop:001:星巴克国贸店&quot; &quot;shop:002:瑞幸国贸二店&quot; km</span></span>
<span class="line"><span></span></span>
<span class="line"><span>-- 获取商家经纬度</span></span>
<span class="line"><span>GEOPOS shops &quot;shop:001:星巴克国贸店&quot;</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br></div></div><h3 id="_3-9-stream-消息队列" tabindex="-1">3.9 Stream -- 消息队列 <a class="header-anchor" href="#_3-9-stream-消息队列" aria-label="Permalink to &quot;3.9 Stream -- 消息队列&quot;">​</a></h3><p>Redis 5.0 引入的 Stream 是真正意义上支持持久化、消费者组、ACK 确认的消息队列数据结构。</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Stream 结构：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  stream</span></span>
<span class="line"><span>    ├── rax（基数树）→ 按消息 ID 索引 → 每个消息是一个 listpack</span></span>
<span class="line"><span>    ├── cgroups（消费者组字典）</span></span>
<span class="line"><span>    │   ├── group_A</span></span>
<span class="line"><span>    │   │   ├── pel（Pending Entries List -- 挂起队列）</span></span>
<span class="line"><span>    │   │   ├── consumers[]</span></span>
<span class="line"><span>    │   │   │   ├── consumer_A1 → pel</span></span>
<span class="line"><span>    │   │   │   └── consumer_A2 → pel</span></span>
<span class="line"><span>    │   │   └── last_id（最后投递的消息 ID）</span></span>
<span class="line"><span>    │   └── group_B</span></span>
<span class="line"><span>    │       └── ...</span></span>
<span class="line"><span>    └── length（消息总数）</span></span>
<span class="line"><span></span></span>
<span class="line"><span>消息 ID 格式：&lt;millisecondsTime&gt;-&lt;sequenceNumber&gt;</span></span>
<span class="line"><span>  例如：1718000000000-0</span></span>
<span class="line"><span>  时间部分保证单调递增，序号部分在同毫秒内自增</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br></div></div><h4 id="消费者组与挂起队列-pel" tabindex="-1">消费者组与挂起队列（PEL） <a class="header-anchor" href="#消费者组与挂起队列-pel" aria-label="Permalink to &quot;消费者组与挂起队列（PEL）&quot;">​</a></h4><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>消费者组工作机制：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>1. 消息投递：</span></span>
<span class="line"><span>   XREADGROUP GROUP group_A consumer_A1 STREAMS mystream &gt;</span></span>
<span class="line"><span>   - &quot;&gt;&quot; 表示只消费从未投递过的新消息</span></span>
<span class="line"><span>   - 消息被投递后，记录到 group_A 的 PEL（Pending Entries List）</span></span>
<span class="line"><span></span></span>
<span class="line"><span>2. 消息确认：</span></span>
<span class="line"><span>   XACK mystream group_A 1718000000000-0</span></span>
<span class="line"><span>   - 从 PEL 中移除该消息</span></span>
<span class="line"><span>   - 消息本身不删除（Stream 可以独立设置 MAXLEN 限制长度）</span></span>
<span class="line"><span></span></span>
<span class="line"><span>3. PEL（挂起队列）：</span></span>
<span class="line"><span>   - 记录已投递但未确认的消息</span></span>
<span class="line"><span>   - 消费者崩溃恢复后，可以重新认领（XCLAIM）未确认的消息</span></span>
<span class="line"><span>   - 超时未确认 → 其他消费者可以认领</span></span>
<span class="line"><span></span></span>
<span class="line"><span>4. 消息认领（故障转移）：</span></span>
<span class="line"><span>   XPENDING mystream group_A                    -- 查看 PEL</span></span>
<span class="line"><span>   XCLAIM mystream group_A consumer_A2 60000 1718000000000-0  -- 认领</span></span>
<span class="line"><span>   - 60000ms 超时未确认的消息可以被其他消费者认领</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br></div></div><div class="language-redis vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">redis</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>-- ========== Stream 消息队列 ==========</span></span>
<span class="line"><span></span></span>
<span class="line"><span>-- 生产者：添加消息</span></span>
<span class="line"><span>XADD order:stream * type &quot;create&quot; order_id &quot;1001&quot; amount 99.9</span></span>
<span class="line"><span>-- &quot;*&quot; 表示自动生成 ID</span></span>
<span class="line"><span></span></span>
<span class="line"><span>-- 创建消费者组</span></span>
<span class="line"><span>XGROUP CREATE order:stream order:group $ MKSTREAM</span></span>
<span class="line"><span>-- &quot;$&quot; 表示从当前最新消息开始消费</span></span>
<span class="line"><span></span></span>
<span class="line"><span>-- 消费者 A1 读取新消息（阻塞等待）</span></span>
<span class="line"><span>XREADGROUP GROUP order:group consumer:A1 \\</span></span>
<span class="line"><span>    BLOCK 5000 COUNT 2 STREAMS order:stream &gt;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>-- 消费者 A1 确认消息</span></span>
<span class="line"><span>XACK order:stream order:group 1718000000000-0</span></span>
<span class="line"><span></span></span>
<span class="line"><span>-- 查看挂起队列</span></span>
<span class="line"><span>XPENDING order:stream order:group - + 10</span></span>
<span class="line"><span></span></span>
<span class="line"><span>-- 查看特定挂起消息详情</span></span>
<span class="line"><span>XPENDING order:stream order:group - + 10 consumer:A1</span></span>
<span class="line"><span></span></span>
<span class="line"><span>-- 消费者崩溃恢复：将超时未确认的消息转给消费者 A2</span></span>
<span class="line"><span>XCLAIM order:stream order:group consumer:A2 60000 \\</span></span>
<span class="line"><span>    1718000000000-0</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br></div></div><div class="info custom-block"><p class="custom-block-title">Stream vs List 做消息队列</p><table tabindex="0"><thead><tr><th>维度</th><th>List（BLPOP）</th><th>Stream</th></tr></thead><tbody><tr><td>ACK 确认</td><td>无，消息弹出即丢失</td><td>支持，XACK 确认后才从 PEL 移除</td></tr><tr><td>消费者组</td><td>无，一个消费者消费后其他消费者看不到</td><td>支持，同组内负载均衡</td></tr><tr><td>消息回溯</td><td>不支持</td><td>支持，消息不因消费而删除</td></tr><tr><td>消息持久化</td><td>依赖 RDB/AOF</td><td>依赖 RDB/AOF</td></tr><tr><td>阻塞读取</td><td>BLPOP</td><td>XREAD BLOCK</td></tr><tr><td>适用场景</td><td>简单队列、无 ACK 要求</td><td>可靠消息投递、需要消费者组</td></tr></tbody></table></div><hr><h2 id="四、经典应用场景与解决方案" tabindex="-1">四、经典应用场景与解决方案 <a class="header-anchor" href="#四、经典应用场景与解决方案" aria-label="Permalink to &quot;四、经典应用场景与解决方案&quot;">​</a></h2><h3 id="场景-千万级用户连续签到统计" tabindex="-1">场景：千万级用户连续签到统计 <a class="header-anchor" href="#场景-千万级用户连续签到统计" aria-label="Permalink to &quot;场景：千万级用户连续签到统计&quot;">​</a></h3><p><strong>问题背景</strong></p><p>一个社交平台需要统计用户的连续签到天数、最长连续签到记录，以及全平台当天签到人数。用户量级在千万级别，对性能和存储空间要求极高。</p><p><strong>方案设计</strong></p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>架构方案：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>┌─────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                  签到请求                      │</span></span>
<span class="line"><span>└─────────────────┬───────────────────────────┘</span></span>
<span class="line"><span>                  │</span></span>
<span class="line"><span>                  v</span></span>
<span class="line"><span>    ┌─────────────────────────┐</span></span>
<span class="line"><span>    │     Redis Bitmap        │</span></span>
<span class="line"><span>    │  checkin:date:{date}    │  ← 每日签到 Bitmap（千万级用户 = 1~2 MB）</span></span>
<span class="line"><span>    └────────────┬────────────┘</span></span>
<span class="line"><span>                  │</span></span>
<span class="line"><span>                  │ BITCOUNT 当天签到人数</span></span>
<span class="line"><span>                  │ BITOP AND 连续签到</span></span>
<span class="line"><span>                  │</span></span>
<span class="line"><span>                  v</span></span>
<span class="line"><span>    ┌─────────────────────────┐</span></span>
<span class="line"><span>    │     Redis String        │</span></span>
<span class="line"><span>    │  checkin:streak:{uid}   │  ← 缓存用户当前连续签到天数</span></span>
<span class="line"><span>    │  EX 86400（当天有效）    │</span></span>
<span class="line"><span>    └─────────────────────────┘</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br></div></div><p><strong>实现代码</strong></p><div class="language-redis vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">redis</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>-- 1. 签到操作</span></span>
<span class="line"><span>SETBIT checkin:date:20240606 1001 1</span></span>
<span class="line"><span></span></span>
<span class="line"><span>-- 2. 统计当天签到人数（全平台）</span></span>
<span class="line"><span>BITCOUNT checkin:date:20240606</span></span>
<span class="line"><span></span></span>
<span class="line"><span>-- 3. 统计连续 7 天都签到的用户数</span></span>
<span class="line"><span>BITOP AND streak:7days \\</span></span>
<span class="line"><span>    checkin:date:20240531 \\</span></span>
<span class="line"><span>    checkin:date:20240601 \\</span></span>
<span class="line"><span>    checkin:date:20240602 \\</span></span>
<span class="line"><span>    checkin:date:20240603 \\</span></span>
<span class="line"><span>    checkin:date:20240604 \\</span></span>
<span class="line"><span>    checkin:date:20240605 \\</span></span>
<span class="line"><span>    checkin:date:20240606</span></span>
<span class="line"><span>BITCOUNT streak:7days</span></span>
<span class="line"><span></span></span>
<span class="line"><span>-- 4. 查询用户连续签到天数（通过 Lua 脚本计算）</span></span>
<span class="line"><span>EVAL &quot;</span></span>
<span class="line"><span>    local uid = KEYS[1]</span></span>
<span class="line"><span>    local today = ARGV[1]</span></span>
<span class="line"><span>    local streak = 0</span></span>
<span class="line"><span>    local date = today</span></span>
<span class="line"><span>    for i = 1, 365 do</span></span>
<span class="line"><span>        local bit = redis.call(&#39;GETBIT&#39;, &#39;checkin:date:&#39; .. date, uid)</span></span>
<span class="line"><span>        if bit == 1 then</span></span>
<span class="line"><span>            streak = streak + 1</span></span>
<span class="line"><span>            date = redis.call(&#39;GET&#39;, &#39;prev_date:&#39; .. date)</span></span>
<span class="line"><span>            if not date then break end</span></span>
<span class="line"><span>        else</span></span>
<span class="line"><span>            break</span></span>
<span class="line"><span>        end</span></span>
<span class="line"><span>    end</span></span>
<span class="line"><span>    return streak</span></span>
<span class="line"><span>&quot; 1 1001 20240606</span></span>
<span class="line"><span></span></span>
<span class="line"><span>-- 5. 每天定时清理过期 Bitmap Key</span></span>
<span class="line"><span>-- 设置 Key 的过期时间（保留近 90 天数据）</span></span>
<span class="line"><span>EXPIRE checkin:date:20240606 7776000  -- 90 天</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br><span class="line-number">39</span><br></div></div><div class="tip custom-block"><p class="custom-block-title">优化要点</p><ul><li>Bitmap offset 与用户 ID 绑定，需要内部维护 ID → offset 的映射（可以给用户分配递增的数字 ID）</li><li>连续签到统计可以维护一个 <code>checkin:streak:{uid}</code> 的缓存，每天凌晨批量更新</li><li>如需查询&quot;任意连续 N 天签到的用户&quot;，可以使用 <code>BITOP AND</code> 对连续 N 天的 Bitmap 做与运算</li></ul></div><hr><h2 id="五、高频面试题" tabindex="-1">五、高频面试题 <a class="header-anchor" href="#五、高频面试题" aria-label="Permalink to &quot;五、高频面试题&quot;">​</a></h2><h3 id="q1-sds-相比-c-字符串有哪些优势" tabindex="-1">Q1: SDS 相比 C 字符串有哪些优势？ <a class="header-anchor" href="#q1-sds-相比-c-字符串有哪些优势" aria-label="Permalink to &quot;Q1: SDS 相比 C 字符串有哪些优势？&quot;">​</a></h3><details class="details custom-block"><summary>答案</summary><p>SDS（Simple Dynamic String）是 Redis 自定义的字符串实现，相比 C 原生字符串有以下核心优势：</p><p><strong>1. O(1) 获取字符串长度</strong> C 字符串需要遍历到 <code>\\0</code>（O(n)），SDS 内部维护 <code>len</code> 字段，读取长度直接返回 <code>len</code>，O(1)。这对 Redis 高频使用 <code>STRLEN</code> 命令至关重要。</p><p><strong>2. 杜绝缓冲区溢出</strong> C 字符串拼接（<code>strcat</code>）时如果目标缓冲区不足，会写入相邻内存导致缓冲区溢出。SDS 在执行拼接前自动检查剩余空间，空间不足时自动扩容，从 API 层面杜绝了溢出风险。</p><p><strong>3. 减少内存重分配次数</strong> C 字符串每次修改都需要重新分配内存（<code>realloc</code>）。SDS 采用两种策略：</p><ul><li><strong>空间预分配</strong>：扩容时额外分配空间（新长度 &lt; 1MB 时翻倍，&gt;= 1MB 时 +1MB），将 N 次拼接的内存重分配次数从 N 次降为最多 N 次</li><li><strong>惰性空间释放</strong>：缩短字符串时不立即释放多余空间，而是用 <code>alloc</code> 记录，供后续拼接复用</li></ul><p><strong>4. 二进制安全</strong> C 字符串以 <code>\\0</code> 作为结束符，无法存储包含 <code>\\0</code> 的二进制数据。SDS 使用 <code>len</code> 字段界定数据边界，可以存储任意二进制数据（如图片序列化、Protobuf 编码等）。</p><p><strong>5. 兼容 C 字符串函数</strong> SDS 的 <code>buf</code> 数组末尾额外保存一个 <code>\\0</code>（不计入 <code>len</code>），使其可直接传递给 <code>printf</code> 等 C 标准库函数，兼容性良好。</p><p><strong>6. 内存友好设计（3.2+）</strong> Redis 3.2 之后根据字符串长度分为 sdshdr5/8/16/32/64 五种类型，短字符串使用更小的头结构（sdshdr8 仅 3 字节头），避免空间浪费。</p></details><h3 id="q2-redis-为什么用跳表而不是红黑树实现-zset" tabindex="-1">Q2: Redis 为什么用跳表而不是红黑树实现 ZSet？ <a class="header-anchor" href="#q2-redis-为什么用跳表而不是红黑树实现-zset" aria-label="Permalink to &quot;Q2: Redis 为什么用跳表而不是红黑树实现 ZSet？&quot;">​</a></h3><details class="details custom-block"><summary>答案</summary><p>Redis 选择跳表而非红黑树主要基于以下考量：</p><p><strong>1. 范围查询天然高效</strong> ZSet 的核心操作之一是 <code>ZRANGEBYSCORE</code>（按分数范围查询）。跳表只需找到区间起点（O(logN)），然后沿 Level 0 的顺序指针向后遍历即可获取范围内所有元素。红黑树需要中序遍历，实现更复杂且不如跳表的顺序链表直观高效。</p><p><strong>2. 实现简单，代码量少</strong> 跳表的核心实现约 200 行 C 代码，无需处理红黑树的旋转、染色等复杂平衡逻辑。在需要高度稳定性（少 Bug）的基础组件中，简单性本身就是重要的工程优势。</p><p><strong>3. 天然支持排名查询</strong> 跳表的 <code>span</code> 字段记录了每一层两个节点之间的跨度（中间经过的节点数），可以在 O(logN) 时间内计算任意节点的排名（<code>ZRANK</code>）。红黑树需要额外在每个节点维护子树节点数量，增加了实现复杂度。</p><p><strong>4. 并发友好的扩展潜力</strong> 虽然 Redis 本身是单线程模型，但跳表的插入操作只影响局部节点（前驱和后继），天然适合细粒度加锁并发改造。红黑树的旋转可能影响从叶子到根的路径上大量节点，不利于并发优化。</p><p><strong>5. 空间开销可接受</strong> 跳表每个节点平均有 1/(1-p) ≈ 1.33 层（p=0.25），即平均多约 33% 的指针开销。这个空间开销在 Redis 偏向性能优先的设计中是完全可以接受的。</p><p><strong>补充：ZSet 为什么还要搭配 hashtable？</strong> 跳表通过 score 查找 member 是 O(logN)，但通过 member 查询 score（<code>ZSCORE</code>）需要遍历。加上 hashtable 后，member → score 的映射可以 O(1) 完成，两者互补。</p></details><h3 id="q3-stream-和-list-做消息队列有什么本质区别" tabindex="-1">Q3: Stream 和 List 做消息队列有什么本质区别？ <a class="header-anchor" href="#q3-stream-和-list-做消息队列有什么本质区别" aria-label="Permalink to &quot;Q3: Stream 和 List 做消息队列有什么本质区别？&quot;">​</a></h3><details class="details custom-block"><summary>答案</summary><p>Stream 比 List 更适合做可靠消息队列，区别主要体现在以下几个方面：</p><p><strong>1. 消息确认机制（ACK）</strong></p><ul><li>List：<code>BLPOP</code> 弹出消息后立即删除，消费者崩溃导致消息永久丢失</li><li>Stream：消费后消息不删除，消费者需显式 <code>XACK</code> 确认；未确认的消息保存在 PEL（Pending Entries List）中，支持重新投递</li></ul><p><strong>2. 消费者组</strong></p><ul><li>List：无消费者组概念，一条消息只能被一个消费者取出</li><li>Stream：支持多个消费者组独立消费同一 Stream（类似 Kafka 的消费者组）；组内消费者负载均衡，消息不会重复消费</li></ul><p><strong>3. 消息持久化</strong></p><ul><li>List：消息被 <code>BLPOP</code> 弹出后即消失</li><li>Stream：消息独立于消费状态存在，可以通过 <code>MAXLEN</code> 控制 Stream 长度，消息可以被多个消费者组重复消费、回溯历史消息</li></ul><p><strong>4. 故障恢复</strong></p><ul><li>List：消费者崩溃后，已弹出但未处理的消息彻底丢失</li><li>Stream：通过 <code>XPENDING</code> 查看挂起消息，<code>XCLAIM</code> 将超时未确认的消息转交给其他消费者，实现故障转移</li></ul><p><strong>5. 消息阻塞读取</strong></p><ul><li>List：<code>BLPOP</code> 只能监听一个 Key，多个 Key 按优先级依次监听</li><li>Stream：<code>XREAD BLOCK</code> 可同时监听多个 Stream</li></ul><p><strong>6. 适用场景差异</strong></p><ul><li>List：适合简单任务队列（如异步日志）、不要求 ACK 的轻量场景</li><li>Stream：适合订单处理、消息通知等需要可靠投递、支持消费者组、故障恢复的复杂场景</li></ul><p><strong>Stream 的局限</strong>：不支持分区（Partition），因此水平扩展能力受限；消息积压时大量消息存储在内存中，不适合超高吞吐的日志场景（不如 Kafka）。</p></details><h3 id="q4-hyperloglog-为什么能在-12kb-内存下统计-2-64-个不同元素" tabindex="-1">Q4: HyperLogLog 为什么能在 12KB 内存下统计 2^64 个不同元素？ <a class="header-anchor" href="#q4-hyperloglog-为什么能在-12kb-内存下统计-2-64-个不同元素" aria-label="Permalink to &quot;Q4: HyperLogLog 为什么能在 12KB 内存下统计 2^64 个不同元素？&quot;">​</a></h3><details class="details custom-block"><summary>答案</summary><p>HyperLogLog 通过概率算法用 12KB 固定内存统计任意规模数据集的基数，核心原理如下：</p><p><strong>1. 伯努利试验与基数估计</strong> 将每个元素哈希成一个 64 位二进制串。哈希函数的特性保证每一位 &quot;0&quot; 或 &quot;1&quot; 的概率相等。一个基数为 N 的数据集中，约有一半的元素哈希值第一位是 1，约 1/4 的元素前两位是 10... 换句话说，出现最长 &quot;前导零序列&quot; 长度为 k 的概率约为 2^(-k)。如果观察到最大前导零长度 k_max ≈ 6，则可以估计 N ≈ 2^6 = 64。</p><p><strong>2. 分桶平均减少方差</strong> 单一估计波动太大。HyperLogLog 将哈希值分为两部分：低 14 位作为桶编号（共 16384 个桶），高 50 位用于计算前导零。每个桶独立记录其元素中最大的前导零长度。最终使用调和平均数（不是算术平均，因为调和平均对离群值不敏感）聚合所有桶的估计值。</p><p><strong>3. 调和平均数公式</strong> 基数估计值 = alpha * m^2 / Σ(2^(-M[j]))，其中 m=16384，alpha 是修正常数（约 0.7213），M[j] 是每个桶的最大前导零长度。</p><p><strong>4. 空间计算</strong> 16384 个桶，每个桶存储的值范围为 0~50（50 位中最大前导零），只需 6 bit（2^6=64）。总空间 = 16384 × 6 bit = 98304 bit = 12288 byte = 12KB。无论统计 100 个还是 100 亿个不同元素，始终 12KB。</p><p><strong>5. 误差控制</strong> 标准误差 = 1.04 / sqrt(m) = 1.04 / 128 ≈ 0.81%。Redis 还对基数较小（&lt; 10000）的情况做了稀疏优化，退化为精确计数。</p><p><strong>本质权衡</strong>：用 0.81% 的误差换取 12KB 到 12MB → 12KB 的空间缩减（以统计 1 亿 UV 为例，Set 需约 1GB，HLL 只需 12KB），空间效率提升了约 85000 倍。</p></details><h3 id="q5-quicklist-的结构是怎样的-为什么能兼顾内存和性能" tabindex="-1">Q5: quicklist 的结构是怎样的？为什么能兼顾内存和性能？ <a class="header-anchor" href="#q5-quicklist-的结构是怎样的-为什么能兼顾内存和性能" aria-label="Permalink to &quot;Q5: quicklist 的结构是怎样的？为什么能兼顾内存和性能？&quot;">​</a></h3><details class="details custom-block"><summary>答案</summary><p>quicklist 是 Redis 3.2 引入的 List 底层实现，设计目标是解决 ziplist + linkedlist 双编码方案中&quot;内存效率与操作性能不可兼得&quot;的问题。</p><p><strong>结构设计</strong></p><p>quicklist 是一个双向链表，每个节点（quicklistNode）内部存储的不是单个元素，而是一个 listpack（或 ziplist，旧版本），里面打包了多个元素。</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>quicklist</span></span>
<span class="line"><span>  ├── quicklistNode[0] → listpack[&quot;elem1&quot;, &quot;elem2&quot;, ..., &quot;elemN&quot;]</span></span>
<span class="line"><span>  ├── quicklistNode[1] → listpack[&quot;elemN+1&quot;, ..., &quot;elem2N&quot;]</span></span>
<span class="line"><span>  └── quicklistNode[k] → listpack[...]</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br></div></div><p>每个 quicklistNode 的 listpack 大小由 <code>list-max-listpack-size</code> 控制（默认 -2，即 8KB）。</p><p><strong>内存效率如何保证？</strong></p><ul><li>传统的 linkedlist 每个元素都是一个独立节点，有 prev/next 两个 8 字节指针 + value 指针 + 对象头，仅指针开销就 24+ 字节/元素。100 字节的字符串中指针开销占 24%</li><li>quicklist 将 N 个元素打包在一个 listpack 中，一个 quicklistNode 仅 2 个指针（prev/next），N 个元素分摊了这 16 字节的指针开销。N 越大，指针开销占比越低</li><li>通过 <code>list-compress-depth</code> 配置，可以 LZF 压缩中间节点，进一步节省内存（适合 List 头尾热数据、中间冷数据的访问模式）</li></ul><p><strong>操作性能如何保证？</strong></p><ul><li>头尾操作（LPUSH/RPOP 等）：O(1) -- 直接定位 head 或 tail 节点，操作其 listpack</li><li>中间访问（LINDEX）：先定位到 quicklistNode（O(链表节点数)），再在 listpack 中查找（O(节点内元素数)）。由于每个节点存多个元素，链表节点数远小于元素总数，遍历效率比纯 linkedlist 高很多</li><li>懒惰解压：中间被压缩的节点只有在被访问时才解压，访问完可重新压缩</li></ul><p><strong>关键配置调优</strong></p><ul><li><code>list-max-listpack-size -2</code>：节点大小 8KB。值越小，节点越多（链表变长但 listpack 更紧凑）；值越大，节点越少（链表更短但 listpack 修改代价高）</li><li><code>list-compress-depth 0</code>：不压缩。设为 1 时，两端各有 1 个节点不压缩（保证 LPUSH/RPOP 高效），中间节点 LZF 压缩</li></ul><p><strong>总结</strong>：quicklist 是 ziplist（节省内存）和 linkedlist（高性能头尾操作）的折衷方案，通过&quot;分段打包 + 按需压缩&quot;兼顾了两者的优势。</p></details><h3 id="q6-redis-7-0-用-listpack-替代-ziplist-解决了什么问题" tabindex="-1">Q6: Redis 7.0 用 listpack 替代 ziplist 解决了什么问题？ <a class="header-anchor" href="#q6-redis-7-0-用-listpack-替代-ziplist-解决了什么问题" aria-label="Permalink to &quot;Q6: Redis 7.0 用 listpack 替代 ziplist 解决了什么问题？&quot;">​</a></h3><details class="details custom-block"><summary>答案</summary><p>listpack 在 Redis 7.0 中全面替代 ziplist，核心解决的是 ziplist 的**连锁更新（cascade update）**问题。</p><p><strong>ziplist 连锁更新机制</strong></p><p>ziplist 中每个 entry 存储两个关键字段：</p><ul><li><code>previous_entry_length</code>（prevlen）：前一个 entry 的长度</li><li>如果前一个 entry 长度 &lt; 254 字节，prevlen 占 1 字节；否则占 5 字节</li></ul><p>连锁更新触发场景：</p><ol><li>初始状态下，所有 entry 都是 253 字节，prevlen 各占 1 字节</li><li>在头部插入一个 254+ 字节的 entry，第二个 entry 的 prevlen 从 1 字节变成 5 字节</li><li>第二个 entry 从 253+1=254 字节变成 253+5=257 字节</li><li>第三个 entry 的 prevlen 也需要从 1 字节变成 5 字节</li><li>以此类推，连锁反应，可能导致 O(N^2) 的内存重分配</li></ol><p><strong>listpack 的解决方案</strong></p><p>listpack 改变了对前一个 entry 的定位方式：不再存储前一个 entry 的长度，而是存储<strong>当前 entry 的长度（backlen）</strong>。定位前一个 entry 时，从当前 entry 末尾向前读 backlen，就能知道当前 entry 占多少字节，从而计算出前一个 entry 的位置。</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>ziplist entry 结构：</span></span>
<span class="line"><span>  [prevlen][encoding][data]</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  问题：当前 entry 长度变化 → 下一个 entry 的 prevlen 需要重写 → 连锁</span></span>
<span class="line"><span></span></span>
<span class="line"><span>listpack entry 结构：</span></span>
<span class="line"><span>  [encoding][data][backlen]</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  优势：当前 entry 长度变化 → 只更新自己的 backlen → 不影响其他 entry → 无连锁更新</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br></div></div><p><strong>额外收益</strong></p><ul><li>listpack 的 entry 结构更简洁，编码更紧凑</li><li>消除了连锁更新，在大 List/Hash/ZSet 场景下性能更稳定</li><li>代码更简单，减少了维护成本</li></ul></details><hr><h2 id="六、选型指南" tabindex="-1">六、选型指南 <a class="header-anchor" href="#六、选型指南" aria-label="Permalink to &quot;六、选型指南&quot;">​</a></h2><h3 id="适用场景" tabindex="-1">适用场景 <a class="header-anchor" href="#适用场景" aria-label="Permalink to &quot;适用场景&quot;">​</a></h3><table tabindex="0"><thead><tr><th>数据结构</th><th>适用场景</th><th>不适用场景</th></tr></thead><tbody><tr><td>String + SDS</td><td>缓存、计数器、分布式锁、Session</td><td>存储大对象（&gt;10KB 建议用 Hash 分字段）</td></tr><tr><td>quicklist</td><td>消息队列（简单）、最新动态列表、时间线</td><td>需要 ACK 的可靠消息队列（用 Stream）</td></tr><tr><td>skiplist</td><td>排行榜、延迟队列、范围查询</td><td>单元素精确查询（hashtable 更优）</td></tr><tr><td>Bitmap</td><td>签到、活跃用户统计、权限位图</td><td>用户 ID 稀疏的情况（浪费空间）</td></tr><tr><td>HyperLogLog</td><td>UV 统计、大流量去重计数</td><td>需要精确数字的场景</td></tr><tr><td>GEO</td><td>LBS 附近搜索、配送范围</td><td>复杂多边形地理围栏</td></tr><tr><td>Stream</td><td>可靠消息队列、事件溯源</td><td>超高吞吐日志（Kafka 更合适）</td></tr></tbody></table><h3 id="配置建议" tabindex="-1">配置建议 <a class="header-anchor" href="#配置建议" aria-label="Permalink to &quot;配置建议&quot;">​</a></h3><div class="language-conf vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">conf</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span># ========== 编码阈值配置 ==========</span></span>
<span class="line"><span></span></span>
<span class="line"><span># Hash 使用 listpack 的阈值</span></span>
<span class="line"><span>hash-max-listpack-entries 512</span></span>
<span class="line"><span>hash-max-listpack-value 64</span></span>
<span class="line"><span></span></span>
<span class="line"><span># Set 使用 listpack 的阈值</span></span>
<span class="line"><span>set-max-listpack-entries 128</span></span>
<span class="line"><span>set-max-listpack-value 64</span></span>
<span class="line"><span></span></span>
<span class="line"><span># ZSet 使用 listpack 的阈值</span></span>
<span class="line"><span>zset-max-listpack-entries 128</span></span>
<span class="line"><span>zset-max-listpack-value 64</span></span>
<span class="line"><span></span></span>
<span class="line"><span># List 使用 quicklist 的配置</span></span>
<span class="line"><span>list-max-listpack-size -2       # 每个 quicklistNode 最大 8KB</span></span>
<span class="line"><span>list-compress-depth 1           # 两端各保留 1 个解压节点</span></span>
<span class="line"><span></span></span>
<span class="line"><span># Stream 消息队列</span></span>
<span class="line"><span># 限制单个 Stream 最大长度（~ 表示近似裁剪）</span></span>
<span class="line"><span>XADD mystream MAXLEN ~ 100000 * field value</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br></div></div><hr><h2 id="相关文档" tabindex="-1">相关文档 <a class="header-anchor" href="#相关文档" aria-label="Permalink to &quot;相关文档&quot;">​</a></h2><ul><li><a href="./index">Redis 核心原理</a></li><li><a href="./persistence">持久化机制</a></li><li><a href="./cache-strategy">缓存策略与一致性</a></li><li><a href="./cluster">集群方案</a></li></ul>`,98))])}const E=l(u,[["render",o]]);export{B as __pageData,E as default};
