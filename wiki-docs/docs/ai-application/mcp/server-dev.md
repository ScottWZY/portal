# MCP Server 开发实践

> **创建日期：** 2026-06-06
> **前置知识：** MCP 协议概述、核心原语

---

## 一、开发方式对比

| 方式 | 复杂度 | 适用场景 |
|------|--------|----------|
| **FastMCP（推荐）** | ⭐ 低 | 快速原型、简单 Server |
| **Python MCP SDK** | ⭐⭐ 中 | 复杂 Server、自定义需求 |
| **TypeScript MCP SDK** | ⭐⭐ 中 | TypeScript/Node.js 项目 |

---

## 二、FastMCP 快速开发

FastMCP 是 MCP 的简化开发框架，用装饰器即可定义工具：

```python
# 安装：pip install fastmcp
from fastmcp import FastMCP

# 创建 MCP Server
mcp = FastMCP("我的第一个 MCP Server")

# 定义工具：使用 @mcp.tool() 装饰器
@mcp.tool()
def get_weather(city: str) -> str:
    """获取指定城市的天气信息

    Args:
        city: 城市名称，如'北京'
    """
    # 这里是实际的 API 调用逻辑
    return f"{city}今天晴，25°C"

# 定义资源
@mcp.resource("file:///config/{name}")
def get_config(name: str) -> str:
    """读取配置文件"""
    return f"配置 {name} 的内容..."

# 启动 Server（Stdio 模式）
if __name__ == "__main__":
    mcp.run()
```

### 配置到 AI 应用

```json
{
  "mcpServers": {
    "my-server": {
      "command": "python",
      "args": ["server.py"]
    }
  }
}
```

---

## 三、Python MCP SDK 开发

对于更复杂的场景，使用完整的 MCP SDK：

```python
# 安装：pip install mcp
from mcp.server import Server, NotificationOptions
from mcp.server.models import InitializationCapabilities
from mcp.server.stdio import stdio_server

# 创建 Server 实例
server = Server("advanced-server")

# 注册工具列表
@server.list_tools()
async def handle_list_tools() -> list:
    return [
        {
            "name": "query_database",
            "description": "执行 SQL 查询（只读）",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "sql": {"type": "string", "description": "SQL 查询语句"}
                },
                "required": ["sql"]
            }
        }
    ]

# 注册工具调用处理
@server.call_tool()
async def handle_call_tool(name: str, arguments: dict) -> list:
    if name == "query_database":
        sql = arguments["sql"]
        # 执行查询（需要做安全校验）
        result = execute_safe_query(sql)
        return [{"type": "text", "text": str(result)}]
    raise ValueError(f"未知工具: {name}")

# 启动 Server
async def main():
    async with stdio_server() as (read_stream, write_stream):
        await server.run(
            read_stream,
            write_stream,
            InitializationCapabilities(...)
        )

import asyncio
asyncio.run(main())
```

---

## 四、工具注册与实现要点

### 4.1 安全校验

```python
def execute_safe_query(sql: str):
    """安全的 SQL 查询执行"""
    # 1. 只允许 SELECT 语句
    if not sql.strip().upper().startswith("SELECT"):
        raise ValueError("只允许 SELECT 查询")

    # 2. 禁止危险关键字
    dangerous_keywords = ["DROP", "DELETE", "UPDATE", "INSERT", "ALTER"]
    for keyword in dangerous_keywords:
        if keyword in sql.upper():
            raise ValueError(f"禁止使用 {keyword}")

    # 3. 限制返回行数
    if "LIMIT" not in sql.upper():
        sql += " LIMIT 100"

    # 4. 执行查询
    return database.execute(sql)
```

### 4.2 错误处理

```python
@mcp.tool()
def safe_operation(param: str) -> str:
    try:
        result = perform_operation(param)
        return result
    except ValueError as e:
        # 返回清晰的错误信息，帮助 AI 调整
        return f"参数错误：{str(e)}。请检查参数格式。"
    except PermissionError:
        return "权限不足，无法执行此操作。"
    except Exception as e:
        return f"操作失败：{str(e)}。请稍后重试。"
```

---

## 五、测试与调试

### 5.1 使用 MCP Inspector

```bash
# 安装 MCP Inspector
npx @modelcontextprotocol/inspector

# 在 Inspector 中连接你的 Server 进行调试
```

### 5.2 单元测试

```python
# 测试 MCP 工具
import pytest
from my_server import mcp

def test_get_weather():
    """测试天气查询工具"""
    result = mcp.call_tool("get_weather", {"city": "北京"})
    assert "北京" in result
    assert "天气" in result or "°C" in result
```

---

## 六、常见问题

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| Server 启动失败 | Python 路径或依赖问题 | 检查 Python 版本（≥3.10），确认依赖已安装 |
| 工具未被发现 | 工具注册方式不正确 | 检查 `@mcp.tool()` 装饰器是否正确使用 |
| AI 不调用工具 | 工具描述不够清晰 | 优化 description，明确说明何时调用 |
| Stdio 通信异常 | 编码问题 | 确保使用 UTF-8 编码 |

---

## 七、面试高频题

### Q1: FastMCP 和完整 MCP SDK 的区别是什么？什么时候用哪个？

**详细答案：** 我们团队两个都用,不同阶段选不同工具。FastMCP 就是快速原型神器——用装饰器 `@mcp.tool()` 一秒定义一个工具，Python 函数变成 MCP 工具，参数类型注解自动转 JSON Schema，代码量少、上手快。我们早期做文件处理工具和数据库查询工具全部用 FastMCP 写，一天就能写完部署。缺点就是灵活性受限——想要自定义连接池管理、精细化错误处理策略的时候框架就束手束脚了。

完整 MCP SDK 给了你底层全部控制权——手动注册 `list_tools`、手动写 `call_tool` 处理逻辑、手动管理 Stdio/SSE 传输层。代码量确实更多，但我们后来做企业级数据库接入时完全绕不开它——需要自定义连接池、审计日志格式、精细化认证授权，这些在 FastMCP 里做不到。还有个额外坑：FastMCP 底层依赖 MCP SDK，版本升级不同步时容易出兼容问题。选择建议很简单——原型/个人项目 -> FastMCP；生产级复杂接入 -> 完整 SDK。两者可以串联——先用 FastMCP 跑通 MVP，验证完再完整 SDK 重构，迁移成本可控。

### Q2: 如何用 FastMCP 快速开发一个 MCP Server？核心步骤是什么？

**详细答案：** 四步走，我们团队已经流水线化了。第一步 `pip install fastmcp` 一步到位依赖全拉进来。第二步 `mcp = FastMCP("my-server")` 创建一个 Server 实例，这个名字就是 AI 应用里显示的 Server 标识。第三步就是写工具—— `@mcp.tool()` 装饰器直接把 Python 函数变成 MCP 工具。关键是docstring——它是 AI 的唯一工具描述来源，必须写清楚"这个工具干什么、什么时候用、什么时候不要用、参数是什么、出什么"。函数签名里的类型会直接映射到 JSON Schema，所以类型写不准 AI 就会填错参数。我们公司内部要求开发时必须拿 docstring 给至少两个同事评审，确认描述明白没有歧义。

第四步 `mcp.run()` 启动。Stdio 模式下千万不要用 `print()` 调试，因为 stdout 是通信通道，print 会污染协议消息——我们用 `logging` 输出到 stderr。资源用 `@mcp.resource("uri-pattern")` 装饰。还有一个小但重要的点——调试信息输出到 stderr 不要到 stdout，否则会打断通信链路，非常膈应。

### Q3: MCP Server 开发中需要注意哪些安全问题？

**详细答案：** 安全是我们做 Server 的第一优先级，因为 MCP Server 一跑，AI 就拿到你所有暴露出来的权限。第一条输入验证——所有来自 AI 的参数全不可信，必须严格校验。SQL 查询工具只允许 SELECT 语句，DROP/DELETE/UPDATE/INSERT/ALTER 全禁，我们在代码里直接封死关键字白名单。查询默认 `LIMIT 100` 防返回过多。第二条权限最小化——Server 以最低权限跑，只暴露需要访问的文件路径和数据库表。我们有一个工具就能查询保单数据，不是所有表都能碰，物理上隔绝越权。

第三条数据安全——经过 MCP Server 返回给 AI 的敏感信息全脱敏，手机号、身份证号、密码全部打码。第四条审计日志全员覆盖——调了哪个工具、传了什么参数、返回什么结果、耗时多长全记录，方便溯源和成本分析。第五条 SE 网络隔离——SSE 服务配 TLS + JWT 认证 + IP 白名单，缺一不可。最后一点依赖安全常被忽视——依赖包版本不及时更新有已知漏洞的，我们每月跑一次安全扫描。还有一个小经验：不要在你的 docstring 里泄露任何系统架构信息（比如数据库类型、表名），AI 调用日志可能被其他用户看到。

### Q4: 如何调试和测试 MCP Server？

**详细答案：** 我们调试 MCP Server 三层走。第一用 MCP Inspector 做交互式调试——`npx @modelcontextprotocol/inspector` 启动后连上 Server，能看到所有注册的工具和资源，手动调用看返回结果，检查 JSON-RPC 消息格式正确与否。这是开发阶段最常用的，发现工具定义问题比看代码快多了。第二写 pytest 单元测试——把 Server 工具当普通 Python 函数测，正常参数返回值、边界参数处理、异常参数错误处理都写进测试。FastMCP 可以直接调 `mcp.call_tool()` 验证逻辑，完整 SDK 需要模拟 Client 连接。

第三端到端集成测试——把 Server 配置到 Claude Desktop 里测完整链路：AI 是不是选对了工具？参数有没有填对？返回结果被 AI 正确理解了吗？这类测试能发现 docstring 写不清楚或错误信息不友好的问题。常见调试经验：如果 AI 不调你的工具，大概率是 description 写得模糊（80% 的问题都是这个）；如果调了但参数错了，大概率是 JSON Schema 有问题；如果返回结果被忽略，大概率是返回格式不友好。还有一个小坑——Stdio 模式下 stdout 用来通信，打印 debug 信息会打断协议，我们统一用 `logging` 走 stderr。

### Q5: MCP Server 的工具描述如何写好？有哪些最佳实践？

**详细答案：** 工具描述就是 AI 唯一的"使用说明书"，写不好 AI 就选错工具。我们项目里总结出来五条铁律。第一写 WHEN 而不只是 WHAT——"查询指定城市的天气信息，当用户询问天气相关问题时使用此工具"比"获取天气"的准确率高多了，因为 AI 是根据语义匹配来决定调用的，明确的 WHEN 描述大幅提高调用准确率。第二参数描述给具体示例——`city` 参数写成"城市名称，使用中文名称，如'北京'、'上海'"而不是简单的"城市名称"。第三返回值格式要声明——说明"返回 JSON 包含 temperature(温度)、humidity(湿度)、condition(天气状况)"，这样 AI 才能正确解析。

第四长度控制在 50-200 字，太短信息不够，太长 AI 注意力分散。第五定期反哺——根据线上 AI 实际调用行为回看为什么选错了工具来优化描述。如果 AI 频繁在错误场景下调用这个工具，就是 WHEN 需要调；如果参数老是填错，就是参数描述需要更具体。我们内部规定每个工具上线两周后必须拉线上数据做一轮描述优化，平均优化两轮后误调用率降到 5% 以下。

### Q6: MCP Server 的 Stdio 通信有哪些常见问题？如何排查？

**详细答案：** Stdio 通信看起来简单，但在生产跑起来问题也不少。第一 Server 启动失败——绝大多数都是 Python 路径问题或依赖缺失。排查就是手动在终端 `python server.py` 看报错，确认 Python >= 3.10，`pip list | grep mcp` 检查依赖。第二工具没被发现——这是我们踩得最多的坑，`@mcp.tool()` 装饰器忘了加或者初始化异常被静默捕获了。用 MCP Inspector 连上去看工具列表就能验证。

第三通信被阻塞最头疼——Server 里用了 `print()` 输出 debug 信息，stdout 通道被污染导致 Client 解析不出来（因为我们就是被这个坑过两次，后来铁律用 `logging` 不走 stdout）。第四 Windows 环境编码问题——PowerShell 默认不是 UTF-8，解决就是 Server 启动时强制设 UTF-8 编码。第五生命周期管理——Server 因未处理异常退出需要 Client 重连，我们在 Server 里加了全局异常捕获和心跳检测。最快出坑的方法就是启动时向 stderr 写一条 log 确认 Server 成功开了，每个请求处理也写日志确认。