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

**详细答案：** FastMCP 和完整 MCP SDK 的核心区别在于抽象层次和灵活性。FastMCP 是 MCP 的简化开发框架，它通过装饰器（`@mcp.tool()`、`@mcp.resource()`）和类型注解自动生成工具定义，开发者只需编写业务逻辑，框架自动处理协议序列化、参数校验和错误处理。FastMCP 的定位是"5 分钟创建一个 MCP Server"，特别适合快速原型、简单工具和探索性开发。例如，一个简单的天气查询 Server，用 FastMCP 只需 10 行代码。

完整 MCP SDK（Python 或 TypeScript）提供了更底层的控制能力，开发者需要手动注册工具列表（`list_tools`）、处理工具调用（`call_tool`）、管理传输层（Stdio/SSE）等。虽然代码量更大，但可以完全控制每个环节的行为，适用于复杂 Server 场景：需要自定义初始化逻辑、实现复杂的权限控制、对接企业级基础设施（如日志系统、监控、配置中心）等。完整 SDK 还支持更多高级特性，如自定义传输层、精细的错误处理策略、异步流式处理等。

选择建议：快速原型、个人项目、简单工具（如查询 API、文件操作）优先使用 FastMCP；生产级 Server、企业级项目、需要精细控制通信细节的场景使用完整 MCP SDK。实际上两者并不互斥——可以先用 FastMCP 快速验证原型，确认可行性后再用完整 SDK 重构。FastMCP 底层也是基于 MCP SDK 构建的，因此迁移成本可控。

### Q2: 如何用 FastMCP 快速开发一个 MCP Server？核心步骤是什么？

**详细答案：** 使用 FastMCP 开发 MCP Server 的核心步骤分为四步。第一步，安装依赖：`pip install fastmcp`，FastMCP 会自动安装所需的 MCP 协议依赖。第二步，创建 Server 实例：`mcp = FastMCP("server-name")`，server-name 是 Server 的唯一标识，会显示在 AI 应用的 Server 列表中。第三步，定义工具：使用 `@mcp.tool()` 装饰器，将普通的 Python 函数转换为 MCP 工具。函数的 docstring 会自动成为工具的描述，参数的类型注解会自动生成 inputSchema。

第四步，定义资源和启动 Server。资源使用 `@mcp.resource("uri-pattern")` 装饰器定义，URI 模式支持路径参数（如 `file:///config/{name}`）。启动 Server 调用 `mcp.run()` 即可，默认使用 Stdio 传输方式。如果需要 SSE 方式，可以指定 `mcp.run(transport="sse", port=8000)`。配置到 AI 应用也很简单：在应用的 MCP 配置文件中添加 Server 的启动命令（Stdio）或 URL（SSE），重启应用即可。

开发中的关键注意事项：工具函数的 docstring 质量直接影响 AI 调用该工具的准确性，必须详细说明工具的用途、适用场景、参数含义和返回值格式；参数类型注解要准确，FastMCP 会根据类型注解生成 JSON Schema，如果类型不准确会导致 AI 生成错误的参数；对于复杂参数，建议使用 Pydantic 模型定义，FastMCP 会自动解析为 JSON Schema。此外，要注意 Server 的启动方式：Stdio 模式下不要使用 `print()` 输出调试信息，因为 stdout 是通信通道，调试信息会干扰协议通信，应该使用 `logging` 或 `stderr`。

### Q3: MCP Server 开发中需要注意哪些安全问题？

**详细答案：** MCP Server 开发中的安全问题需要从多个层面考虑。第一，输入验证与参数校验：所有来自 AI 的输入都不可信，必须进行严格的参数校验。对于 SQL 查询工具，必须限制只允许 SELECT 语句，禁止 DROP、DELETE、UPDATE、INSERT、ALTER 等危险操作；必须限制返回行数（如默认 LIMIT 100），防止查询返回过多数据；必须对 SQL 进行注入检测，即使 AI 生成的 SQL 通常不会有意注入，但防御性编程仍然是必要的。

第二，权限控制：MCP Server 运行在什么权限下，AI 就拥有什么权限。因此，Server 应该以最小权限原则运行：只暴露必要的文件路径、只允许访问必要的数据库表、只提供必要的 API 调用能力。对于写操作（如文件创建、数据库修改、邮件发送），应该实现额外的确认机制，例如在工具描述中要求 AI 在调用前向用户确认，或在 Server 端实现 `requires_confirmation` 标志。第三，数据安全：AI 通过 MCP Server 访问的数据可能包含敏感信息，Server 端应该实现数据脱敏（如手机号、身份证号、密码等），避免敏感数据通过 AI 响应泄露。

第四，审计日志：所有通过 MCP Server 的操作都应该记录审计日志，包括：调用时间、调用工具名、输入参数、执行结果、执行耗时等。审计日志不仅用于安全溯源，也用于成本分析和性能优化。第五，资源限制：防止 AI 滥用资源，包括：设置单次调用的 Token 消耗上限、设置并发调用数量限制、设置单次查询的数据量上限等。第六，网络隔离：如果 MCP Server 通过 SSE 暴露，应该配置 TLS 加密、API Key 认证、IP 白名单等安全措施。第七，依赖安全：MCP Server 的依赖包要及时更新，防止已知漏洞被利用。

### Q4: 如何调试和测试 MCP Server？

**详细答案：** MCP Server 的调试和测试分为三个层次。第一，使用 MCP Inspector 进行交互式调试。MCP Inspector 是官方提供的调试工具，通过 `npx @modelcontextprotocol/inspector` 启动，它提供了一个 Web UI，可以连接你的 MCP Server、查看所有注册的工具和资源、手动调用工具并查看返回结果、检查协议消息的格式是否正确。Inspector 是开发阶段最常用的调试工具，可以快速验证工具定义是否正确、参数校验是否生效、错误处理是否完善。

第二，编写单元测试。MCP 工具的测试可以像测试普通 Python 函数一样进行，使用 pytest 编写测试用例。测试要点包括：正常参数的正确返回、边界参数的处理、异常参数的错误处理、并发调用的安全性。对于 FastMCP 开发的 Server，可以直接调用 `mcp.call_tool()` 方法测试工具逻辑；对于 SDK 开发的 Server，需要模拟 Client 连接进行集成测试。测试中特别要注意验证工具的描述和参数 Schema 是否准确，因为这些直接影响 AI 的调用行为。

第三，端到端集成测试。将 MCP Server 配置到实际的 AI 应用（如 Claude Desktop）中，测试完整的调用链路：AI 是否在合适的时机选择了正确的工具、AI 生成的参数是否符合预期、工具返回的结果是否被 AI 正确理解和使用。这类测试可以发现工具描述是否足够清晰、错误信息是否足够友好等问题。常见调试技巧：如果 AI 不调用你的工具，大概率是 description 不够清晰或不够准确；如果 AI 调用了但参数错误，大概率是 inputSchema 定义有问题；如果 AI 调用了但返回结果被忽略，大概率是返回格式不够友好。

### Q5: MCP Server 的工具描述如何写好？有哪些最佳实践？

**详细答案：** MCP 工具的描述（description）是 AI 判断何时调用该工具的唯一依据，写好描述是 MCP Server 开发中最重要也最容易被忽视的环节。最佳实践包括以下几点。第一，描述要包含"WHEN"和"WHAT"：不仅要说明工具做什么，更要说明什么情况下应该使用这个工具。例如，"查询指定城市的天气信息，当用户询问天气相关问题时使用此工具"比"获取天气"要好得多。AI 模型是根据语义匹配来决定工具调用的，明确的"WHEN"描述能大幅提高调用准确率。

第二，参数描述要具体，使用自然语言说明参数的含义和格式。例如，对于 `city` 参数，描述应该是"城市名称，使用中文名称，如'北京'、'上海'"而不是简单的"城市名称"。参数描述越具体，AI 生成的参数值越准确。第三，返回值的描述同样重要，AI 需要知道返回什么格式的数据才能正确解析和使用。例如，描述中说明"返回格式为 JSON，包含 temperature（温度）、humidity（湿度）、condition（天气状况）三个字段"。

第四，工具的描述长度建议在 50-200 字之间，太短信息不足，太长可能导致 AI 的注意力分散。第五，描述语言应该与用户输入的语言保持一致，如果用户主要使用中文，工具描述也应该使用中文。第六，定期根据 AI 的实际调用行为优化描述，如果发现 AI 经常在错误场景下调用某个工具，说明描述中的"WHEN"部分需要调整；如果 AI 经常生成错误的参数，说明参数描述需要更具体。一个实用的做法是：在开发阶段，让多个同事阅读工具描述，看他们是否能准确理解工具的用途和参数含义，以此来验证描述质量。

### Q6: MCP Server 的 Stdio 通信有哪些常见问题？如何排查？

**详细答案：** MCP Server 使用 Stdio 通信时最常见的几个问题及排查方法如下。第一，Server 启动失败，通常是因为 Python 路径问题或依赖缺失。排查方法：手动在终端中运行 Server 的启动命令（如 `python server.py`），检查是否有报错；确认 Python 版本 >= 3.10；确认所有依赖已安装（`pip list | grep mcp`）。第二，工具未被 AI 应用发现，通常是因为工具注册方式不正确或 Server 在初始化时崩溃。排查方法：使用 MCP Inspector 连接 Server，查看是否能列出工具；检查 `@mcp.tool()` 装饰器是否正确使用；检查 Server 初始化代码是否有异常被静默吞掉。

第三，AI 应用连接 Server 后无响应，通常是因为 Stdio 通信被阻塞。排查方法：确认 Server 没有使用 `print()` 输出调试信息（stdout 是通信通道，print 会干扰协议）；确认 Server 没有执行阻塞操作（如同步网络请求）导致消息处理卡住；使用 `logging` 模块将日志输出到 stderr 或文件。第四，编码问题导致通信异常，确保 Server 使用 UTF-8 编码处理输入输出。在 Windows 环境下，需要特别注意 PowerShell 或 CMD 的默认编码可能不是 UTF-8。

第五，进程生命周期管理问题。Stdio 模式下，MCP Client 管理 Server 进程的启动和停止。如果 Server 意外退出，Client 需要重新启动。排查方法：检查 Server 是否有未处理的异常导致进程退出；检查 Server 是否在某些操作后自行退出（如 `sys.exit()`）；确保 Server 的主循环是持续运行的（如 `mcp.run()` 是阻塞调用）。一个实用的调试技巧：在 Server 启动时向 stderr 输出一条日志，确认 Server 成功启动；在处理每个请求时也输出日志，确认请求被正确接收和处理。