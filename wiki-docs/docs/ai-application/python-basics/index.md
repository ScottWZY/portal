# Python 快速入门（面向 Java 开发者）

> **创建日期：** 2026-06-06
> **目标：** 帮助 Java 开发者快速掌握 AI 开发所需的 Python 基础

---

## 一、环境搭建

```bash
# Windows
# 1. 下载 Python 3.11+：https://www.python.org/downloads/
# 2. 安装时勾选 "Add Python to PATH"
# 3. 验证安装
python --version  # Python 3.11.x
pip --version     # pip 23.x
```

---

## 二、核心语法对比（Java → Python）

| Java | Python | 说明 |
|------|--------|------|
| `String name = "张三";` | `name = "张三"` | 无需声明类型 |
| `int age = 25;` | `age = 25` | 动态类型 |
| `List<String> list = new ArrayList<>();` | `list = ["a", "b", "c"]` | 列表字面量 |
| `Map<String, Integer> map = new HashMap<>();` | `dict = {"a": 1, "b": 2}` | 字典字面量 |
| `for (String s : list) { ... }` | `for s in list:` | 缩进代替大括号 |
| `if (x > 0) { ... }` | `if x > 0:` | 无括号，冒号+缩进 |
| `public void foo(String x) { ... }` | `def foo(x):` | def 定义函数 |

### 关键差异速查

```python
# 1. 缩进是语法（不是代码风格）
if x > 0:           # 冒号
    print("正数")    # 必须缩进（4个空格）
else:
    print("非正数")

# 2. 列表推导式（Java 没有的语法糖）
squares = [x**2 for x in range(10)]  # [0, 1, 4, 9, ..., 81]
evens = [x for x in range(20) if x % 2 == 0]  # 过滤

# 3. 元组（不可变列表）
point = (3, 4)  # 相当于 Java 的不可变对象
x, y = point    # 解包赋值

# 4. 字典（对应 Java HashMap）
user = {"name": "张三", "age": 25}
print(user["name"])  # 张三
print(user.get("email", "无"))  # 安全访问，默认值"无"

# 5. 字符串格式化
name = "张三"
print(f"你好，{name}")  # f-string（Java 没有，最常用）
print("你好，{}".format(name))  # 类似 Java String.format
```

---

## 三、函数与类

```python
# 函数定义
def greet(name, greeting="你好"):  # 默认参数
    """打招呼函数（这是文档字符串）"""
    return f"{greeting}，{name}！"

# 调用
greet("张三")                    # "你好，张三！"
greet("李四", greeting="早上好")  # "早上好，李四！"

# 类定义
class User:
    def __init__(self, name, age):  # 构造函数（self = Java 的 this）
        self.name = name
        self.age = age

    def introduce(self):
        return f"我是{self.name}，{self.age}岁"

# 使用
user = User("张三", 25)
print(user.introduce())  # "我是张三，25岁"
```

---

## 四、装饰器（Java 没有的概念）

```python
# 装饰器 = Java 的 AOP 注解，但更灵活
def log(func):
    """记录函数调用的装饰器"""
    def wrapper(*args, **kwargs):
        print(f"调用 {func.__name__}，参数: {args}")
        result = func(*args, **kwargs)
        print(f"{func.__name__} 返回: {result}")
        return result
    return wrapper

@log  # 使用装饰器
def add(a, b):
    return a + b

add(3, 4)  # 输出: 调用 add，参数: (3, 4)  →  add 返回: 7
```

---

## 面试高频题

### Q1: Python 和 Java 的核心差异是什么？动态类型 vs 静态类型各自的优劣势？
**详细答案：** Python 和 Java 最根本的差异在于类型系统：Python 是动态类型（运行时确定变量类型），Java 是静态类型（编译时确定变量类型）。这一差异导致了两者在开发体验、性能、代码可维护性等方面的显著不同。动态类型让 Python 代码更简洁灵活——不需要声明类型、泛型、接口，代码量通常只有 Java 的 1/3 到 1/5，开发效率极高，特别适合快速原型验证和数据处理脚本。但代价是类型错误只能在运行时暴露，IDE 的代码补全和重构能力不如静态类型语言强大，大型项目的可维护性面临挑战。

从性能角度看，Java 的静态类型 + JIT 编译使其执行速度远超 CPython（通常快 5-10 倍甚至更多）。Java 的 JVM 经过二十多年优化，JIT 编译器可以根据运行时 hotspot 分析进行激进优化。Python 的 CPython 解释器则因为动态类型需要大量的运行时类型检查，执行效率较低。不过，Python 在 AI 领域的优势在于其生态：几乎所有 AI 框架（PyTorch、TensorFlow）的核心计算都在 C/C++/CUDA 层面执行，Python 只是"胶水语言"，因此 AI 开发的性能瓶颈不在 Python 本身。

在实际项目中，可以用类型注解（Type Hints）+ mypy/pyright 等静态类型检查工具来弥补 Python 动态类型的不足。Python 3.5+ 引入了类型注解语法，配合 pydantic、dataclasses 等库，可以在保持 Python 灵活性的同时获得接近静态类型的安全性。对于从 Java 转过来的开发者，建议养成写类型注解的习惯，并使用 `mypy --strict` 在 CI 中进行类型检查。

### Q2: 列表推导式的原理和优势是什么？什么场景下不应该使用列表推导式？
**详细答案：** 列表推导式（List Comprehension）是 Python 最具特色的语法糖之一，它提供了一种声明式的方式从可迭代对象创建新列表。基本语法 `[expression for item in iterable if condition]` 将映射（map）和过滤（filter）操作合并为一行表达式。相比传统的 `for` 循环 + `append()` 模式，列表推导式有两大优势：(1) **性能更高**：列表推导式在 C 层面执行循环，避免了 Python 层面的 `append()` 方法调用和循环控制开销，通常比等价的 `for` 循环快 1.5-2 倍；(2) **可读性更强**：对于简单的映射和过滤操作，声明式语法比命令式循环更直观，意图更清晰。

从底层原理来看，列表推导式会创建一个新的 list 对象，并在 C 层面直接向列表内部数组追加元素，避免了 `list.append()` 的 Python 函数调用开销。`[x**2 for x in range(1000000)]` 不仅比等价的 `for` 循环快，而且由于是一次性分配内存（如果表达式不复杂，Python 可以预估最终列表大小），减少了多次内存重新分配的开销。

然而，列表推导式并非万能，以下场景应避免使用：(1) **逻辑过于复杂**：如果 expression 或 condition 有多层嵌套或复杂逻辑，用列表推导式反而降低可读性，此时应拆分到普通 `for` 循环中；(2) **副作用操作**：列表推导式设计用于创建新列表，不应在其中执行有副作用的操作（如打印、写文件、修改外部变量），这是反模式；(3) **不需要完整列表**：如果只需要迭代结果而不需要保存整个列表，应使用生成器表达式 `(x**2 for x in range(1000000))`，避免一次性占用大量内存；(4) **嵌套超过两层**：`[y for x in outer for y in inner if cond]` 的可读性随嵌套深度急剧下降，此时应拆分为多行或使用普通循环。

### Q3: 装饰器的底层原理是什么？在 AI 开发中哪些典型场景使用装饰器？
**详细答案：** 装饰器的底层原理是 Python 的"函数是一等公民"特性——函数可以作为参数传递、作为返回值返回、在运行时动态创建。装饰器本质上是一个接受函数作为参数并返回新函数的高阶函数。`@decorator` 语法等价于 `func = decorator(func)`，即在函数定义后立即将原函数传递给装饰器，并用装饰器返回的新函数替换原函数。闭包（closure）是实现装饰器的关键机制：装饰器内部定义的 `wrapper` 函数捕获了外层函数的变量（包括被装饰的原始函数），即使外层函数执行完毕，这些变量仍然保留在 `wrapper` 的闭包中。

在 AI 开发中，装饰器有多个典型应用场景：(1) **API 调用重试和容错**：为 LLM API 调用函数添加自动重试装饰器，处理网络错误、限流错误（429）等临时性失败，配合指数退避策略提高调用成功率。(2) **性能监控和日志**：自动记录函数执行时间、Token 消耗、API 调用次数等指标，方便性能分析和成本控制。(3) **缓存**：使用 `@lru_cache` 或自定义缓存装饰器，缓存 LLM 的响应结果，相同输入直接返回缓存，减少 API 调用成本。(4) **参数验证**：在 FastAPI 中，`@app.get("/")` 等路由装饰器本质上是注册 HTTP 路径和处理函数的映射关系。(5) **权限控制**：在 Agent 工具函数上添加权限装饰器，限制某些敏感工具只能被特定角色调用。

装饰器还支持参数化：`@retry(max_attempts=3)` 这种形式实际上是三层嵌套函数——外层函数接收装饰器参数，中层函数接收被装饰的函数，内层函数是实际的 wrapper。这种模式提供了极大的灵活性，可以将横切关注点（cross-cutting concerns）与业务逻辑彻底分离。

### Q4: Python 的 GIL 是什么？对多线程有什么影响？如何在 AI 开发中绕过 GIL 限制？
**详细答案：** GIL（Global Interpreter Lock，全局解释器锁）是 CPython 解释器中的一个互斥锁，它确保同一时刻只有一个线程执行 Python 字节码。GIL 的设计初衷是为了简化 CPython 的内存管理——Python 使用引用计数进行垃圾回收，如果没有 GIL，多个线程同时修改引用计数会导致竞态条件，而引入细粒度锁会带来巨大的性能开销。GIL 对多线程的影响是深远的：即使在多核 CPU 上，CPU 密集型 Python 代码的多线程执行也无法利用多核优势，反而因为线程切换和锁竞争导致性能下降。

在 AI 开发中，理解 GIL 的影响至关重要，但好消息是 AI 开发的常见场景大多数可以规避 GIL 限制：(1) **I/O 密集型任务不受影响**：LLM API 调用、数据库查询、文件读写等 I/O 操作在等待时会释放 GIL，因此使用 asyncio 或多线程处理 I/O 并发是高效的。(2) **科学计算库自动绕过 GIL**：numpy、pandas、scipy 等库的核心计算在 C 扩展中执行，C 扩展可以主动释放 GIL（通过 `Py_BEGIN_ALLOW_THREADS` 宏），因此 numpy 矩阵运算的多线程执行可以获得真正的并行加速。(3) **使用多进程**：对于 CPU 密集型任务，使用 `multiprocessing` 模块可以创建多个独立的 Python 进程，每个进程有自己的 GIL，真正利用多核 CPU。(4) **使用非 CPython 解释器**：Jython（运行在 JVM 上）和 IronPython（运行在 .NET 上）没有 GIL；PyPy 虽然也有 GIL，但正在开发无 GIL 版本；Python 3.13 引入了实验性的无 GIL 模式（通过 `--disable-gil` 编译选项）。

对于 AI 应用开发者来说，最实用的策略是：将 CPU 密集型计算交给 numpy/底层库处理，将 I/O 密集型并发交给 asyncio 处理，只在确实需要 CPU 并行且无法利用底层库时，才考虑使用多进程。

### Q5: Python 中的 `self` 参数是什么？为什么必须显式传递？与 Java 的 `this` 有何不同？
**详细答案：** `self` 是 Python 类实例方法的第一个参数，代表调用该方法的实例对象本身。在 Java 中，`this` 是隐式可用的关键字，编译器自动将当前实例绑定到方法中；而在 Python 中，`self` 必须显式声明为方法的第一个参数，这是 Python 设计哲学"显式优于隐式"（Explicit is better than implicit）的体现。显式声明 `self` 的好处是：方法定义中明确展示了该方法属于实例方法（而非静态方法或类方法），且可以自由命名这个参数（虽然约定俗成使用 `self`）。

从底层实现来看，Python 的实例方法调用经历了一个"绑定"过程：当你调用 `obj.method(arg)` 时，Python 实际上执行的是 `ClassName.method(obj, arg)`。这是因为 Python 的方法本质上就是普通函数，存储在类的 `__dict__` 中，通过描述符协议（descriptor protocol）在实例访问时自动将 `self` 绑定进去。理解这一点对于理解装饰器应用、元类编程等高级特性至关重要。

与 Java 的 `this` 的差异不仅在于语法层面：(1) Python 的 `self` 只是一个参数名，理论上可以改为任何名称（虽然强烈不建议）；Java 的 `this` 是保留关键字。(2) Python 有 `@classmethod` 和 `@staticmethod` 装饰器，分别对应 `cls` 参数（类本身）和无隐式参数，这种灵活性在 Java 中需要通过不同的方法声明方式来实现。(3) 在 Python 的嵌套类和闭包中，`self` 的引用明确且直接；Java 中使用 `OuterClass.this` 来引用外部类实例。对于从 Java 转过来的开发者，最简单的记忆方式：Java 的 `this` 是隐式自动传入的，Python 的 `self` 需要你手动声明接收，但调用时自动传入。