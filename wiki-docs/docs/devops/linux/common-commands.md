# 常用命令

## ⭐ 面试重点速览

| 考点 | 频率 | 难度 | 考察方式 |
|------|------|------|----------|
| grep/sed/awk 三剑客实战 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 给一段日志，让你提取/转换/统计特定信息 |
| find + xargs 组合使用 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | 删除特定文件、批量处理、-exec vs xargs |
| 管道与重定向（stdin/stdout/stderr） | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | 2>&1 含义、tee 用法、子 shell 问题 |
| 常用快捷键与效率技巧 | ⭐⭐⭐ | ⭐⭐ | Ctrl+R、Ctrl+Z、Ctrl+C 区别 |
| 文本处理管道组合 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | awk/sed/sort/uniq 组合完成复杂统计 |

---

## 一、文本处理三剑客

### 1.1 grep —— 文本搜索

grep 是最常用的文本搜索工具，基于正则表达式匹配行。

```bash
# 基本用法
grep "ERROR" /var/log/app.log                  # 搜索包含 ERROR 的行
grep -i "error" /var/log/app.log               # 忽略大小写
grep -v "DEBUG" /var/log/app.log               # 反向匹配，排除 DEBUG
grep -c "ERROR" /var/log/app.log               # 统计匹配行数

# 高级用法
grep -r "timeout" /etc/nginx/                  # 递归搜索目录
grep -n "exception" app.log                    # 显示行号
grep -A 3 -B 2 "ERROR" app.log                # 显示匹配行前后各3/2行（上下文）
grep -E "ERROR|FATAL" app.log                  # 扩展正则（-E），多模式 OR
grep -P "\\d{4}-\\d{2}-\\d{2}" app.log         # Perl 正则，更强大
grep -o "userId=\\d+" app.log                  # 只输出匹配部分，不输出整行
```

```bash
# 实战：统计日志中 Top 10 的 ERROR 类型
$ grep "ERROR" app.log | awk '{print $3}' | sort | uniq -c | sort -rn | head -10
# 输出示例：
#  1523 TimeoutException
#   891 ConnectionRefused
#   456 NullPointerException
```

::: tip 性能提示
处理 GB 级别日志时，`grep` 比 `awk` 和 `sed` 更快，因为它使用了 Boyer-Moore 算法。如果不需要行级处理，优先用 grep 做初步过滤。
:::

### 1.2 sed —— 流编辑器

sed 按行处理文本，适用于替换、删除、插入等操作。

```bash
# 替换操作
sed 's/old/new/' file.txt                    # 替换每行第一个匹配
sed 's/old/new/g' file.txt                   # 全局替换
sed 's/old/new/2' file.txt                   # 替换每行第二个匹配
sed -i 's/old/new/g' file.txt                # 原地修改（-i 直接写回文件）

# 删除操作
sed '/^$/d' file.txt                         # 删除空行
sed '/^#/d' nginx.conf                       # 删除注释行
sed '2,5d' file.txt                          # 删除第2到第5行

# 提取操作
sed -n '5,10p' file.txt                      # 打印第5到第10行
sed -n '/ERROR/p' app.log                    # 只打印匹配行

# 高级用法
sed '/start/,/end/s/foo/bar/g' file.txt      # 在 start 到 end 范围内替换
```

```bash
# 实战：修改 Nginx 配置中的端口
$ sed -i 's/listen 80;/listen 8080;/g' /etc/nginx/sites-enabled/default
```

::: warning 注意
`sed -i` 在 macOS 和 Linux 上行为不同。macOS 要求 `sed -i '' 's/.../.../'`，Linux 直接用 `sed -i`。跨平台脚本建议用 `sed -i.bak` 生成备份。
:::

### 1.3 awk —— 文本处理语言

awk 是完整的文本处理语言，擅长按列处理结构化文本。

```bash
# 基本语法：awk '条件 {动作}' 文件
awk '{print $1, $3}' access.log              # 打印第1和第3列
awk -F ':' '{print $1}' /etc/passwd          # 用 : 作为分隔符
awk -F ',' '{print $NF}' data.csv            # $NF 是最后一列，$(NF-1) 倒数第二列

# 条件过滤
awk '$3 > 1000 {print $0}' data.txt           # 第3列大于1000的行
awk '/ERROR/ {print $0}' app.log              # 包含 ERROR 的行
awk '$1 ~ /^192\.168/ {print $2}' access.log  # 第1列匹配正则

# 内置变量
awk '{print NR, $0}' file.txt                 # NR = 行号，NF = 列数
awk 'END {print NR}' file.txt                 # 统计总行数
awk '{sum+=$3} END {print sum}' data.txt      # 计算第3列总和

# 实战：分析 Nginx 访问日志，统计每个 IP 的请求数
$ awk '{ip[$1]++} END {for(i in ip) print ip[i], i}' access.log | sort -rn | head
# 输出：
#  15234 192.168.1.100
#   8932 10.0.0.55
#   4521 172.16.0.23
```

::: tip 三剑客选择原则
- **grep**：快速过滤，找到包含特定模式的行
- **sed**：行级编辑，替换/删除/插入
- **awk**：列级处理，统计/计算/格式化输出
- 管道组合：`grep 过滤 -> awk 处理 -> sort/uniq 统计`
:::

---

## 二、find 与 xargs

### 2.1 find —— 文件查找

```bash
# 按名称查找
find /var/log -name "*.log"                    # 按名称查找
find /var/log -iname "*.log"                   # 忽略大小写
find / -name "nginx.conf" 2>/dev/null          # 忽略权限错误

# 按时间查找
find /tmp -mtime +7                            # 7天前修改的文件
find /tmp -mtime -1                            # 1天内修改的文件
find /var/log -mmin -30                        # 30分钟内修改的文件
find /tmp -atime +30                           # 30天前访问过的文件

# 按大小查找
find / -size +100M                             # 大于100MB的文件
find / -size +1G -size -5G                     # 1GB到5GB之间的文件

# 按类型查找
find / -type f -name "*.conf"                  # 普通文件
find / -type d -name "nginx"                   # 目录
find / -type l                                 # 软链接

# 组合条件
find /var/log -name "*.log" -mtime +7 -size +10M  # 大于10MB且7天前修改的日志
find /tmp -name "*.tmp" -mtime +1 -delete         # 删除1天前的临时文件
```

```bash
# 实战：查找并删除所有以 .bak 结尾的文件
$ find /home/app -name "*.bak" -type f -delete
# 或使用 -exec
$ find /home/app -name "*.bak" -type f -exec rm -f {} \\;
```

### 2.2 xargs —— 参数传递

当 find 的结果太多时，`-exec` 会为每个结果启动一个进程，开销大。`xargs` 会批量传递参数。

```bash
# 基本用法
find /logs -name "*.log" | xargs rm -f                     # 删除所有日志
find /logs -name "*.log" | xargs grep "ERROR"              # 在所有日志中搜索

# 处理特殊字符（文件名含空格）
find /tmp -name "*.log" -print0 | xargs -0 rm -f           # -print0 + -0 处理特殊字符

# 控制并行度
find /data -name "*.gz" | xargs -P 4 -I {} gunzip {}       # 4个进程并行解压

# 实战：统计所有 Java 文件的总行数
$ find /src -name "*.java" | xargs wc -l | tail -1
# 输出：
#  45231 total
```

::: danger 常见陷阱
`xargs` 默认用空格和换行分隔参数。如果文件名包含空格，会出错。务必使用 `-print0` 和 `-0` 组合，或用 `-exec` 替代。
:::

---

## 三、管道与重定向

### 3.1 标准流

| 文件描述符 | 名称 | 默认目标 |
|-----------|------|----------|
| 0 | stdin（标准输入） | 键盘 |
| 1 | stdout（标准输出） | 终端 |
| 2 | stderr（标准错误） | 终端 |

### 3.2 重定向操作符

```bash
# 输出重定向
command > file          # 覆盖写入 stdout 到文件
command >> file         # 追加写入 stdout 到文件
command 2> file         # 覆盖写入 stderr 到文件
command 2>> file        # 追加写入 stderr 到文件

# 合并输出
command > file 2>&1     # stdout 和 stderr 都写入同一个文件
command &> file         # 同上（bash 简写）
command >> file 2>&1    # 追加模式合并

# 丢弃输出
command > /dev/null 2>&1   # 抛弃所有输出
command 2>&1 >/dev/null    # 注意：这个顺序是错误的！stderr 仍然输出到终端

# 输入重定向
command < file              # 从文件读取 stdin
command <<EOF               # Here Document（多行输入）
多行内容
EOF
```

```bash
# 实战：同时输出到文件和终端
$ make 2>&1 | tee build.log
# tee 将 stdin 同时写入文件和 stdout

# 实战：后台运行并记录日志
$ nohup java -jar app.jar > app.log 2>&1 &
```

### 3.3 管道

```bash
# 管道串联多个命令，前一个命令的 stdout 成为后一个命令的 stdin
ps aux | grep java | awk '{print $2, $3, $4}' | sort -k2 -rn | head -5

# 常见组合
cat access.log | awk '{print $1}' | sort | uniq -c | sort -rn | head -10
```

---

## 四、常用快捷键

| 快捷键 | 作用 | 场景 |
|--------|------|------|
| `Ctrl+C` | 发送 SIGINT，终止前台进程 | 中断卡住的命令 |
| `Ctrl+Z` | 发送 SIGTSTP，挂起前台进程 | 临时暂停，后续 `fg`/`bg` 恢复 |
| `Ctrl+D` | 发送 EOF（文件结束符） | 退出 shell、结束输入 |
| `Ctrl+R` | 反向搜索命令历史 | 快速找到之前执行过的命令 |
| `Ctrl+L` | 清屏 | 等价于 `clear` |
| `Ctrl+A` / `Ctrl+E` | 光标跳到行首/行尾 | 快速编辑长命令 |
| `Ctrl+W` | 删除光标前一个单词 | 快速修改命令 |
| `Ctrl+U` / `Ctrl+K` | 删除光标前/后所有内容 | 重新输入命令 |
| `!!` | 重复上一条命令 | `sudo !!` 以 root 重新执行 |
| `!$` | 上一条命令的最后一个参数 | `vim !$` 编辑刚才操作的文件 |

---

## 五、与相关模块的交叉引用

| 知识点 | 相关模块 |
|--------|----------|
| 管道实现原理（pipe/fifo） | [操作系统 - IO模型](../../operating-system/io/index.md) |
| 文件描述符机制 | [操作系统 - 文件系统](../../operating-system/filesystem/index.md) |
| 正则表达式原理 | [计算机网络 - 应用层](../../computer-network/application/http.md)（日志分析场景） |

---

## 六、高频面试题

### Q1：`2>&1` 和 `>file 2>&1` 的区别？顺序能换吗？
**答案：** `2>&1` 表示将 stderr（文件描述符 2）重定向到 stdout（文件描述符 1）的当前目标。顺序非常重要。`command > file 2>&1` 先将 stdout 重定向到 file，然后将 stderr 重定向到 stdout（此时 stdout 指向 file），所以两者都进入 file。如果写成 `command 2>&1 > file`，则先将 stderr 指向终端（stdout 的默认目标），然后将 stdout 指向 file，结果是 stderr 仍然输出到终端而 stdout 进入 file。

### Q2：`find -exec` 和 `find | xargs` 怎么选？
**答案：** `-exec` 为每个匹配项启动一个进程，安全但慢。`xargs` 批量传递参数，效率高但可能遇到参数过长（ARG_MAX 限制）或特殊字符问题。少量文件用 `-exec`，大量文件用 `xargs`。`xargs -P` 还支持并行处理。`-exec +` 是两者的折中，批量执行但不需要 xargs。

### Q3：如何用 awk 统计日志中每个小时的请求量？
**答案：** `awk '{split($4, a, ":"); hour[a[1]" "a[2]":00"]++} END {for(h in hour) print hour[h], h}' access.log | sort -k2`。先用 split 提取时间戳中的小时部分，用关联数组统计，END 块输出结果。这种方法可以灵活统计任意时间粒度。

### Q4：sed 的 `-i` 参数在 macOS 和 Linux 上有何不同？
**答案：** Linux 的 `sed -i` 直接原地修改文件。macOS（BSD sed）要求 `sed -i ''` 提供备份后缀，空字符串表示不备份。跨平台兼容写法：`sed -i.bak 's/old/new/g' file && rm file.bak`，或者在脚本中判断操作系统。

### Q5：如何快速找出目录下最大的 10 个文件？
**答案：** `du -ah /path | sort -rh | head -10`。`du -ah` 显示所有文件和目录的大小（人类可读格式），`sort -rh` 按人类可读格式降序排序，`head -10` 取前10条。如果目录很大，可以先用 `du -sh */` 按子目录汇总。

### Q6：`Ctrl+C` 和 `Ctrl+Z` 的本质区别是什么？
**答案：** `Ctrl+C` 发送 SIGINT 信号，默认行为是终止进程。`Ctrl+Z` 发送 SIGTSTP 信号，将进程挂起（Suspend）并放入后台，进程状态变为 Stopped。挂起的进程可以用 `fg` 恢复到前台，`bg` 在后台继续运行，或 `kill %1` 终止。`Ctrl+C` 是终端中断，进程可以捕获 SIGINT 做清理工作；`Ctrl+Z` 是终端停止信号，进程也可以捕获，但通常用于作业控制。