# 性能调优

## 概述
本模块系统性地介绍 Oracle 性能调优方法论，涵盖 AWR 报告解读、等待事件分析、热块竞争解决、SQL Trace 与 10046 事件等核心技术。学习目标：能独立完成 AWR 报告分析，定位系统瓶颈，制定针对性的性能优化方案。

---

## 一、知识图谱

```mermaid
graph TB
    subgraph 性能诊断工具
        AWR[自动工作负载仓库 AWR]
        ASH[活动会话历史 ASH]
        ADDM[自动数据库诊断监控 ADDM]
        TRACE[SQL Trace 10046]
        TKPROF[TKPROF 格式化]
    end
    subgraph AWR核心指标
        LS[负载概要 Load Profile]
        TWE[TOP等待事件 Top Wait Events]
        TSQ[TOP SQL]
        IE[实例效率 Instance Efficiency]
        AS[顾问部分 Advisory]
    end
    subgraph 等待事件
        DBFS[db file sequential read]
        DBFR[db file scattered read]
        LFS[log file sync]
        BCL[enq: TX - row lock contention]
        LCP[library cache pin/lock]
        BUF[free buffer waits]
        ITLT[enq: TX - allocate ITL entry]
    end
    subgraph 优化技术
        BIND[绑定变量优化]
        PARALLEL[并行查询 Parallel Query]
        PART[分区裁剪 Partition Pruning]
        RKI[反向键索引 Reverse Key Index]
        HASH_P[哈希分区 Hash Partition]
        PROFILE[SQL Profile]
        BASELINE[SQL Plan Baseline]
    end

    AWR --> LS
    AWR --> TWE
    AWR --> TSQ
    AWR --> IE
    ASH --> TWE
    DBFS --> 索引读
    DBFR --> 全表扫描
    LFS --> 日志写
    BCL --> 行锁
    BUF --> Buffer Cache
    RKI --> 热块竞争
    HASH_P --> 热块竞争
    BIND --> 共享池
    PARALLEL --> 大表扫描
```

---

## 二、基础到进阶学习路线

- **阶段一：基础入门** —— 理解 AWR 报告的基本结构，学会生成和查看 AWR，识别负载概要中的关键指标。
- **阶段二：原理深入** —— 分析 TOP 等待事件和 TOP SQL，理解各类等待事件的含义和根因，掌握 SQL Trace 的使用。
- **阶段三：实战优化** —— 热块竞争的全链路优化、绑定变量策略、并行查询的合理使用、AWR 驱动的系统级调优。

---

## 三、核心知识详解

### 3.1 AWR 报告解读

AWR（Automatic Workload Repository）是 Oracle 10g 引入的性能诊断工具，**是 Oracle 性能优化的第一入口**。

#### 3.1.1 AWR 报告生成

```sql
-- 生成 AWR 报告（SQL*Plus 中）
@?/rdbms/admin/awrrpt.sql

-- 或使用 DBMS_WORKLOAD_REPOSITORY
SELECT snap_id, begin_interval_time, end_interval_time
FROM dba_hist_snapshot
ORDER BY snap_id;

-- 生成指定时间范围的 AWR 报告
-- 格式：awrrpt.sql → 输入报告类型(html/text) → 输入天数 → 输入起始/结束 snap_id
```

#### 3.1.2 AWR 报告核心部分解读

**第一部分：负载概要（Load Profile）**

| 指标 | 含义 | 高负载阈值 |
|------|------|-----------|
| DB Time(s) | 数据库总活动时间 | 按 CPU 核心数评估 |
| Redo size (bytes) | 每秒重做日志生成量 | > 10MB/s |
| Logical reads (blocks) | 每秒逻辑读（Buffer Gets） | > 100,000 |
| Physical reads (blocks) | 每秒物理读 | > 5,000 |
| Executes (sql) | 每秒 SQL 执行次数 | > 5,000 |
| Transactions | 每秒事务数 | 按业务评估 |
| Parses (sql) | 每秒解析次数 | 硬解析应 < 10/s |

**第二部分：TOP 等待事件（Top Timed Events）**

这是 AWR 报告的**核心**，直接告诉你在哪个环节花费了最多时间：

```sql
-- 查看等待事件分类
SELECT wait_class, total_waits, time_waited
FROM v$system_wait_class
ORDER BY time_waited DESC;
```

**第三部分：实例效率指标（Instance Efficiency Percentages）**

| 指标 | 理想值 | 说明 |
|------|--------|------|
| Buffer Nowait % | 100% | 获取 Buffer 时无需等待 |
| Buffer Hit % | > 95% | Buffer Cache 命中率 |
| Library Hit % | > 95% | 共享池命中率 |
| Execute to Parse % | > 90% | 执行与解析的比率 |
| Parse CPU to Parse Elapsd % | > 90% | 解析时的 CPU 使用率 |
| Soft Parse % | > 95% | 软解析占比 |

**第四部分：TOP SQL**

按不同维度排序的 TOP SQL 列表（Elapsed Time、CPU Time、Buffer Gets、Disk Reads、Executions）。重点关注：

- **Elapsed Time 高**：总执行时间长的 SQL
- **Buffer Gets 高**：逻辑读多的 SQL，消耗 CPU
- **Disk Reads 高**：物理读多的 SQL，说明 Buffer Cache 命中不足
- **Executions 极高**：频繁执行的 SQL，优化后收益最大

#### 3.1.3 AWR 分析方法论

1. 先看 **DB Time** 和 **Elapsed Time** 的比值：DB Time / Elapsed / CPU 核心数 > 80% 说明严重过载
2. 看 **TOP 等待事件**：找到占比最高的等待类，定位瓶颈
3. 看 **TOP SQL**：找出消耗最多的 SQL
4. 看 **实例效率**：确认是否有配置层面问题
5. 看 **顾问部分**：ADDM 自动建议

### 3.2 等待事件分析

等待事件是 Oracle 性能分析的核心，记录了进程在等待什么资源。

#### 3.2.1 核心等待事件分类

| 等待事件 | 含义 | 根因 | 优化方向 |
|----------|------|------|----------|
| db file sequential read | 单块读（索引读） | 索引扫描过多、索引碎片化 | 优化 SQL、重建索引、调整 Buffer Cache |
| db file scattered read | 多块读（全表扫描） | 大表全表扫描 | 添加索引、分区裁剪、并行查询 |
| log file sync | 等待 LGWR 写入完成 | 提交过于频繁 | 批量提交、减少 commit 频率、增大 Redo Log |
| log file parallel write | LGWR 写日志到磁盘 | 日志 I/O 慢 | 使用快盘、增大 Redo Log Buffer |
| enq: TX - row lock contention | 行级锁等待 | 热点行并发更新 | 减小事务粒度、优化业务逻辑 |
| free buffer waits | 没有空闲缓冲区 | Buffer Cache 太小 | 增大 Buffer Cache |
| library cache lock/pin | 共享池锁/栓 | 频繁硬解析、DDL | 使用绑定变量、避免高峰 DDL |
| direct path read temp | 读临时表空间 | 排序/哈希内存不足 | 增大 PGA |

#### 3.2.2 等待事件诊断 SQL

```sql
-- 查看当前等待事件
SELECT sid, event, wait_class, state, seconds_in_wait
FROM v$session
WHERE wait_class != 'Idle' AND state = 'WAITING'
ORDER BY seconds_in_wait DESC;

-- 系统级等待事件统计
SELECT event, total_waits, time_waited_micro/1000000 AS time_waited_sec,
       average_wait_micro/1000 AS avg_wait_ms
FROM v$system_event
WHERE event LIKE '%file%'
ORDER BY time_waited_micro DESC;
```

### 3.3 热块竞争问题

**热块（Hot Block）** 是指被多个会话同时并发访问的数据块，是 OLTP 系统中最经典的性能问题之一。

#### 3.3.1 热块问题的表现

- 等待事件：`enq: TX - row lock contention`、`buffer busy waits`
- CPU 使用率不高但响应时间很长
- 某些热点表或索引进出大量并发 DML

#### 3.3.2 解决方案

**方案一：反向键索引（Reverse Key Index）**

将索引键值反转存储，将连续的插入分散到不同的索引块：

```sql
-- 创建反向键索引
CREATE INDEX idx_orders_id ON orders(order_id) REVERSE;

-- 普通索引无法做范围扫描，只适合等值查询
SELECT * FROM orders WHERE order_id = 12345;  -- 等值查询正常
-- SELECT * FROM orders WHERE order_id BETWEEN 100 AND 200;  -- 范围查询会失效！
```

**方案二：哈希分区索引**

将索引通过哈希分区，分散到不同的段：

```sql
CREATE INDEX idx_hot_table ON hot_table(hot_column)
GLOBAL PARTITION BY HASH (hot_column) PARTITIONS 16;
```

**方案三：减小事务粒度**

```sql
-- 不好的做法：在一个事务中更新大量行
BEGIN
  UPDATE accounts SET balance = balance - 100 WHERE account_id = 1;
  UPDATE accounts SET balance = balance + 100 WHERE account_id = 2;
  -- 大量其他操作...
  COMMIT;
END;

-- 好的做法：尽快提交，缩小锁持有时间
BEGIN
  UPDATE accounts SET balance = balance - 100 WHERE account_id = 1;
  COMMIT;
  UPDATE accounts SET balance = balance + 100 WHERE account_id = 2;
  COMMIT;
END;
```

**方案四：应用层缓冲/队列**

将高并发写操作改为异步处理，通过消息队列削峰填谷。

### 3.4 绑定变量对性能的影响

#### 3.4.1 硬解析 vs 软解析

```sql
-- 硬解析：每次 SQL 文本不同，全部重新解析
SELECT * FROM employees WHERE emp_id = 100;  -- 硬解析
SELECT * FROM employees WHERE emp_id = 200;  -- 硬解析（另一条 SQL）

-- 软解析：使用绑定变量，SQL 文本相同，复用执行计划
SELECT * FROM employees WHERE emp_id = :b1;  -- 硬解析（第一次）
-- 后续执行：软解析，直接复用执行计划
```

**性能对比：**

| 解析类型 | CPU 消耗 | Library Cache Latch | 适用场景 |
|----------|----------|---------------------|----------|
| 硬解析 | 高（100倍+） | 争用严重 | 应避免 |
| 软解析 | 低 | 正常 | 推荐 |
| 软软解析 | 极低 | 几乎无 | 最优（session cursor cache） |

#### 3.4.2 强制游标共享（Cursor Sharing）

```sql
-- 查看当前 cursor_sharing 参数
SELECT name, value FROM v$parameter WHERE name = 'cursor_sharing';

-- 选项：
-- EXACT：精确匹配（默认）
-- FORCE：强制将字面量替换为绑定变量
-- SIMILAR：类似但保留某些统计信息（已废弃）

-- 设置 FORCE 模式（不推荐，因为可能导致绑定变量窥探问题）
-- 更好的做法是修改应用代码使用绑定变量
```

### 3.5 并行查询（Parallel Query）

并行查询通过将大任务分解为多个小任务，利用多个 CPU 核心并行处理：

```sql
-- 启用并行查询
SELECT /*+ PARALLEL(e, 4) */ * FROM employees e WHERE salary > 5000;

-- 表级设置并行度
ALTER TABLE employees PARALLEL 4;

-- 查看当前并行设置
SELECT table_name, degree FROM dba_tables WHERE owner = 'SCOTT';

-- 并行查询相关参数
SELECT name, value FROM v$parameter WHERE name LIKE '%parallel%';
-- parallel_max_servers：最大并行服务器进程数
-- parallel_min_servers：最小并行服务器进程数
-- parallel_degree_policy：并行度策略（MANUAL/AUTO/LIMITED）
```

::: warning 并行查询注意事项
- 适合 OLAP/DSS 系统的大表扫描和聚合操作
- OLTP 系统不建议使用并行（会占用大量 CPU 导致其他事务等待）
- 并行度通常设置为 CPU 核心数的 1-2 倍
- 过度并行会导致并行服务器进程争用，反而降低性能
:::

### 3.6 SQL Trace 与 10046 事件

SQL Trace 是最底层的 SQL 调优工具，可以追踪每个 SQL 的详细执行统计：

```sql
-- 对当前会话开启 Trace
ALTER SESSION SET sql_trace = TRUE;

-- 10046 事件（更详细的 Trace，包括等待事件和绑定变量）
ALTER SESSION SET EVENTS '10046 trace name context forever, level 12';

-- Level 含义：
-- 1：标准 SQL Trace
-- 4：包含绑定变量值
-- 8：包含等待事件
-- 12：级别 4 + 级别 8（最常用）

-- 对指定会话开启 Trace
EXEC DBMS_MONITOR.SESSION_TRACE_ENABLE(session_id => 123, serial_num => 456);

-- 关闭 Trace
ALTER SESSION SET sql_trace = FALSE;
ALTER SESSION SET EVENTS '10046 trace name context off';
```

**使用 TKPROF 格式化 Trace 文件：**

```bash
tkprof trace_file.trc output.txt sys=no explain=scott/password
```

### 3.7 ASH 报告

ASH（Active Session History）是比 AWR 更细粒度的性能数据，按秒级采样：

```sql
-- 生成 ASH 报告
@?/rdbms/admin/ashrpt.sql

-- 查询 ASH 数据
SELECT sample_time, session_id, session_serial#,
       sql_id, event, wait_class, blocking_session
FROM v$active_session_history
WHERE sample_time BETWEEN SYSDATE - 1/24 AND SYSDATE
ORDER BY sample_time;
```

**AWR vs ASH：**

| 维度 | AWR | ASH |
|------|-----|-----|
| 采样频率 | 每小时（默认） | 每秒 |
| 时间范围 | 长期（默认保留 8 天） | 短期（默认保留 24 小时） |
| 用途 | 趋势分析、容量规划 | 实时诊断、性能尖刺分析 |
| 数据量 | 小 | 大 |

---

## 四、经典应用场景与解决方案

### 场景：AWR 报告显示 log file sync 等待严重

**问题背景：**
某 OLTP 系统 AWR 报告中 TOP 等待事件第一名是 `log file sync`，平均等待时间 15ms，占 DB Time 的 35%。系统 TPS 约 2000，但用户感知延迟很大。

**根因分析：**

```sql
-- 1. 确认等待事件
SELECT event, total_waits, time_waited,
       average_wait * 10 AS avg_wait_ms
FROM v$system_event
WHERE event = 'log file sync';

-- 2. 检查提交频率
SELECT name, value FROM v$sysstat
WHERE name IN ('user commits', 'user rollbacks');

-- 3. 检查 Redo Log 大小和切换频率
SELECT group#, sequence#, bytes/1024/1024 AS size_mb,
       members, status
FROM v$log;

-- 4. 检查日志切换频率
SELECT sequence#, first_time FROM v$log_history
WHERE first_time > SYSDATE - 1
ORDER BY first_time;
```

**完整方案：**

```sql
-- Step 1：增大 Redo Log 文件大小（减少切换频率）
-- 添加新的更大的日志组
ALTER DATABASE ADD LOGFILE GROUP 4
  ('/u01/oradata/orcl/redo04a.log',
   '/u01/oradata/orcl/redo04b.log') SIZE 2G;

ALTER DATABASE ADD LOGFILE GROUP 5
  ('/u01/oradata/orcl/redo05a.log',
   '/u01/oradata/orcl/redo05b.log') SIZE 2G;

-- 切换到新日志组后删除旧的小日志组
-- ALTER SYSTEM SWITCH LOGFILE;
-- ALTER DATABASE DROP LOGFILE GROUP 1;

-- Step 2：增大 Redo Log Buffer（减少 LGWR 写入次数）
ALTER SYSTEM SET log_buffer = 64M SCOPE=SPFILE;
-- 重启生效

-- Step 3：应用层优化
-- 减少 commit 频率，避免在循环中逐条 commit
-- 改为批量提交（每 1000 条 commit 一次）
-- 或使用异步提交（COMMIT WRITE BATCH NOWAIT）
```

---

## 五、高频面试题

### Q1: AWR 报告的核心指标有哪些？如何快速定位问题？
::: details 答案
**AWR 报告的核心指标和分析方法：**

**1. 负载概要（Load Profile）：**
- DB Time / Elapsed / CPU 核心数 > 80%：数据库严重过载
- Redo size/sec：过高说明 DML 频繁，关注 log file sync
- Logical reads/sec：过高说明 SQL 逻辑读大，关注 TOP SQL 的 Buffer Gets
- Parses/sec：过高说明硬解析多，关注绑定变量

**2. TOP 等待事件（Top Timed Events）：**
- 关注占比最高的 3-5 个等待事件
- `db file sequential read` 高 → 索引扫描过多或有索引碎片
- `db file scattered read` 高 → 全表扫描或全索引扫描
- `log file sync` 高 → 提交过于频繁，或 Redo Log 磁盘性能差
- `enq: TX - row lock contention` 高 → 热点行竞争

**3. 实例效率（Instance Efficiency）：**
- Buffer Hit % < 95% → 增大 Buffer Cache
- Library Hit % < 95% → 使用绑定变量，增大 Shared Pool
- Soft Parse % < 95% → 大量硬解析，需要绑定变量
- Execute to Parse % < 80% → 解析太频繁

**4. TOP SQL：**
- 按 Elapsed Time 排序 → 总耗时最长的 SQL
- 按 Buffer Gets/Exec 排序 → 单次执行逻辑读最多的 SQL
- 按 Executions 排序 → 执行最频繁的 SQL（优化后收益最大）

**快速定位方法论：**
DB Time 过高 → 看等待事件 → 看 TOP SQL → 看执行计划 → 制定优化方案
:::

### Q2: 常见的 Oracle 等待事件有哪些？各代表什么含义？
::: details 答案
**核心等待事件分类：**

**I/O 类：**
- `db file sequential read`：单块读，通常是索引扫描。等待时间长说明索引读效率低或 I/O 子系统慢。
- `db file scattered read`：多块读（全表扫描/全索引扫描）。正常不应频繁出现，频繁出现说明缺少合适的索引。
- `direct path read`：直接路径读（绕过 Buffer Cache），通常用于并行查询和排序溢出到 TEMP。

**日志类：**
- `log file sync`：用户提交时等待 LGWR 将 Redo 写入磁盘。如果高，说明提交太频繁或 Redo 磁盘慢。
- `log file parallel write`：LGWR 写 Redo 到磁盘。如果高，说明 I/O 子系统慢，需要更快的磁盘。
- `log buffer space`：等待 Redo Log Buffer 中有可用空间。增大 Redo Log Buffer 或提高 LGWR 写入速度。

**并发类：**
- `enq: TX - row lock contention`：行级锁等待。热点行并发更新导致。
- `enq: TX - allocate ITL entry`：ITL 槽位不足。增大 INITRANS 或 PCTFREE。
- `buffer busy waits`：数据块争用。热块问题或 Buffer Cache 太小。
- `latch: cache buffers chains`：Buffer Cache 链表闩锁争用。极高并发读取热点数据块。

**配置类：**
- `free buffer waits`：没有空闲缓冲区。增大 Buffer Cache 或提高 DBWR 写入速度。
- `library cache lock/pin`：共享池中的对象锁/栓。DDL 或频繁硬解析导致。
- `cursor: pin S wait on X`：游标共享时的闩锁争用。极高并发执行同一 SQL。

**网络类：**
- `SQL*Net message from client`：等待客户端发送下一条 SQL。如果很高，可能是应用层处理慢。
- `SQL*Net message to client`：等待客户端接收数据。网络带宽不足或客户端处理慢。
:::

### Q3: 什么是热块竞争？如何解决？
::: details 答案
**热块（Hot Block）竞争：** 当多个会话同时访问同一个数据块（通常是索引块或包含热点数据行的数据块）时，产生 `buffer busy waits` 或 `enq: TX - row lock contention` 等待。

**典型场景：**
- 订单表使用自增主键（Sequence），索引根块和右侧叶块成为热点
- 账户余额表，高并发同时更新少数热点账户
- 日志表，大量并发 INSERT 争用同一个数据块

**解决方案（按推荐度）：**

**1. 反向键索引（Reverse Key Index）：**
```sql
CREATE INDEX idx_orders_id ON orders(order_id) REVERSE;
```
- 原理：将索引键值反转（如 12345 → 54321），将连续插入分散到不同索引块
- 注意：**不支持范围扫描**，只能等值查询

**2. 哈希分区索引：**
```sql
CREATE INDEX idx_hot ON hot_table(hot_col)
GLOBAL PARTITION BY HASH(hot_col) PARTITIONS 16;
```
- 原理：将索引通过哈希分散到多个物理段，减少争用
- 支持等值和范围查询（但需要扫描所有分区）

**3. 增大 PCTFREE 和 INITRANS：**
```sql
ALTER TABLE hot_table PCTFREE 20 INITRANS 10;
```
- 原理：每个块留更多空间，减少块内冲突

**4. 应用层优化：**
- 使用 Sequence 的 CACHE 选项减少对 SEQ$ 表的访问
- 减小事务粒度，尽快提交
- 使用队列削峰填谷，将同步写改为异步写

**5. 减少并发度：**
- 使用应用层排队机制
- 优化业务逻辑，避免同时更新同一行
:::

### Q4: 什么时候应该使用并行查询？并行查询有什么注意事项？
::: details 答案
**适用场景：**
1. 大表全表扫描（> 10GB），如数据仓库 ETL 操作
2. 大表的索引创建（CREATE INDEX ... PARALLEL）
3. 大表的数据加载（INSERT /*+ APPEND PARALLEL */）
4. 大表的统计信息收集
5. 分区表的分区间并行处理

**不适用场景：**
1. OLTP 系统的高并发短查询（并行查询会占用大量 CPU）
2. 小表（< 1GB 的数据量，并行启动开销大于收益）
3. 已经存在 I/O 瓶颈的系统（并行只会加剧 I/O 竞争）
4. 单 CPU 或 CPU 核心不足的系统

**注意事项：**
1. **并行度设置**：建议不超过 CPU 核心数的 2 倍，通常为核心数相同
2. **并行服务器进程**：`parallel_max_servers` 控制最大并行进程数，设置过大会导致进程争用
3. **TEMP 表空间**：并行查询可能消耗大量 TEMP 空间，确保有足够的 TEMP
4. **PGA 消耗**：每个并行进程有自己的 PGA，大量并行查询可能导致 PGA 不足
5. **队列资源**：并行查询使用 Large Pool 中的消息缓冲区，确保 Large Pool 足够大
6. **对象的并行度**：表级别的并行度设置会覆盖 Hint 中的设置

**监控并行查询：**
```sql
SELECT sql_id, px_servers_requested, px_servers_allocated
FROM v$sql
WHERE px_servers_requested > 0;
```
:::

### Q5: 硬解析和软解析的区别是什么？如何减少硬解析？
::: details 答案
**硬解析（Hard Parse）：**
- SQL 文本不在共享池中，需要完整解析流程
- 步骤：语法检查 → 语义检查 → 权限检查 → 查询转换 → 优化（生成执行计划）→ 生成游标
- 消耗大量 CPU 和 Library Cache Latch
- 在高并发下是性能杀手

**软解析（Soft Parse）：**
- SQL 文本已在共享池中，直接复用解析结果
- 步骤：语法检查 → 在共享池中查找 → 复用执行计划
- 消耗较少 CPU

**软软解析（Softer Soft Parse）：**
- SQL 游标仍在 Session Cursor Cache 中
- 步骤：直接从 Session Cursor Cache 中获取
- 几乎不消耗 CPU

**减少硬解析的方法：**

1. **使用绑定变量（首选方案）：**
```sql
-- 不好
SELECT * FROM emp WHERE id = 1;
SELECT * FROM emp WHERE id = 2;
-- 好
SELECT * FROM emp WHERE id = :b1;
```

2. **增大 Session Cursor Cache：**
```sql
ALTER SESSION SET session_cached_cursors = 100;
```

3. **使用 CURSOR_SHARING（不推荐）：**
```sql
ALTER SYSTEM SET cursor_sharing = FORCE;
```
- 但可能引入绑定变量窥探问题

4. **使用 PL/SQL 封装：**
- 将 SQL 放在存储过程中，天然使用绑定变量

5. **增大 Shared Pool：**
```sql
ALTER SYSTEM SET shared_pool_size = 8G;
```
- 让更多 SQL 可以保留在共享池中
:::

### Q6: ASH 和 AWR 有什么区别？什么时候用 ASH 什么时候用 AWR？
::: details 答案
**AWR（Automatic Workload Repository）：**
- 每小时自动生成快照（默认）
- 保存数据库级别的性能统计信息
- 数据保留 8 天（默认，可调整）
- 适合：长期趋势分析、容量规划、性能基线建立

**ASH（Active Session History）：**
- 每秒采样活跃会话
- 保存会话级别的活动信息
- 数据保留 24 小时（默认）
- 适合：实时诊断、性能尖刺分析、短时间窗口问题排查

**何时使用 ASH：**
- 正在发生的性能问题，需要实时查看
- 性能尖刺（持续几分钟到几小时），AWR 的小时粒度太粗
- 需要定位具体哪个会话、哪个 SQL 导致的问题
- 需要关联 Blocking Session 信息

**何时使用 AWR：**
- 性能问题持续数小时或数天
- 需要对比不同时间段的性能（如今天 vs 昨天）
- 容量规划（趋势分析）
- 寻找系统级配置问题

**协作使用：**
- AWR 告诉你"是否存在问题"（宏观）
- ASH 告诉你"问题是哪个会话/哪条 SQL 引起的"（微观）
- 两者结合，从整体到局部定位性能瓶颈
:::

---

## 六、选型指南

- **适用场景**：需要系统性性能调优的 DBA 和高级开发、OLTP 系统性能瓶颈诊断、SQL 慢查询优化、大并发系统调优
- **不适用场景**：非常简单的 SQL 慢查询（直接看执行计划即可）、基准测试环境（需要专门的测试工具）
- **配置建议**：
  - AWR 快照间隔保持默认 1 小时，保留时间建议 30 天以上
  - ASH 保留时间建议 48 小时
  - 启用 ADDM 自动诊断
  - `timed_statistics` 必须为 TRUE
  - `statistics_level` 必须为 TYPICAL 或 ALL

---

## 相关文档
- [Oracle 核心架构](./index)
- [存储结构与表空间](./storage)
- [事务与锁机制](./transaction)
- [优化器与执行计划](./optimizer)
- [备份恢复](./backup-recovery)
- [Oracle 选型指南](./selection)
- [上一级：数据库](../index)