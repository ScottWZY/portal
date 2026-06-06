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

## 七、面试重点

::: warning 高频考点
1. **FastMCP 和完整 MCP SDK 的区别？** 什么时候用哪个？
2. **如何用 FastMCP 快速开发一个 MCP Server？** 核心步骤是什么？
3. **MCP Server 开发中需要注意哪些安全问题？**
4. **如何调试和测试 MCP Server？**
5. **MCP Server 的工具描述如何写好？** 有哪些最佳实践？
:::