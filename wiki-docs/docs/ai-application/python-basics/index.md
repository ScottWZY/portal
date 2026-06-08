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
**详细答案：** 我们项目组是典型的混合技术栈——后端服务全用 Java（Spring Boot），AI 链路全用 Python，两条线我都写了快两年，对两种类型的体感很深。动态类型在 AI 开发里最大的好处不是"少写几行代码"，而是迭代速度。我们做客服 Bot 的时候，Prompt 模板和检索策略一天要调十几版，Python 改完即跑、不用编译，从改代码到看到效果 5 秒搞定。Java 那边哪怕只改一个字段类型，都要等 Maven 编译 30 秒，调试成本就上来了。代码量差异也很明显——我们的 RAG 检索管道核心逻辑大概 200 行 Python，用 Java 实现同样的功能要 500 行以上，大部分是类型声明和模板代码。

但动态类型的代价我也是被坑过的。我们 Agent 工单系统里有一个 `create_ticket` 工具函数，参数是 `priority: int`，结果有一天 LLM 返回的 JSON 里 priority 是字符串 `"2"` 而不是数字 2，Python 一路跑到底层 HTTP 请求才炸，堆栈信息完全不指向问题源头——排查了两小时。后来引入了 pydantic 对工具参数做严格校验，这种问题基本杜绝了。我们的教训就是：Python 快，但必须用类型注解 + pydantic + mypy 做兜底。我现在写 Python 的习惯就是所有函数参数和返回值必加类型注解，CI 里跑 mypy --strict，不通过不让合代码。这个组合给了我接近 Java 的安全感，但保留了 Python 的开发效率。

### Q2: 列表推导式的原理和优势是什么？什么场景下不应该使用列表推导式？
**详细答案：** 列表推导式在我们项目里是最常用的 Python 语法之一，但也踩过坑。它的效率优势是真的——我们做知识库文档批量处理时，需要把所有 chunk 的元数据（5000 个文档 × 每个 8 个 chunk = 40000 条记录）做一遍清洗过滤，原来用 for 循环 + append 跑了大概 3.2 秒，改成列表推导式压到了 1.1 秒，差不多快了三倍。原因是列表推导式在 C 层面直接操作列表内部数组，省了 Python 层 `append()` 的调用开销，这个在大数据量的时候效果很明显。

不过最大的坑是内存。有一次我们批处理 20 万篇知乎文章做 Embedding，我用了个列表推导式把所有文章 token 统计全塞进一个 list，结果 32G 内存的机器直接 OOM 了。后来改成生成器表达式 `(count_tokens(doc) for doc in articles)`，内存占用从 12GB 降到了几百兆，因为是惰性求值。现在我们团队有个铁律——数据量超过 10000 条，用生成器；不确定要不要全量加载到内存的，也用生成器。还有一个就是嵌套超过两层的情况，比如 `[y for x in outer for y in inner if cond]`，这种可读性灾难我写完后同事 review 都说看不懂，拆成 for 循环反而清晰。说白了列表推导式的边界很简单：简单映射过滤用它，复杂逻辑用循环，不确定内存能不能撑住的时候用生成器。

### Q3: 装饰器的底层原理是什么？在 AI 开发中哪些典型场景使用装饰器？
**详细答案：** 装饰器在我们 AI 项目里到处在用，几乎每个 API 调用函数上都挂了一个。最有价值的就是 LLM 重试装饰器——我们的 OpenAI 调用每天几万次，网络抖动和 429 限流是家常便饭。最早我们手写 try-except，重复代码铺天盖地。后来抽了一个带参数的装饰器 `@retry_on_failure(max_attempts=3, backoff=2)`，里面就是用闭包捕获原函数和参数，指数退避重试，所有 API 函数一行注解搞定。用上之后，因网络临时故障导致的请求失败从每天 200+ 次压到了 5 次以内。

另一个大量用的是性能打点装饰器——`@track_latency` 自动记录函数耗时和 Token 消耗。我们在 FastAPI 的每个 route handler 上都挂了，数据推 Prometheus，Grafana 面板上 QPS 和 P99 延迟一目了然。有一次 P99 突然从 2.3 秒飙到 6.8 秒，顺着这个装饰器打的数据发现是 Rerank 环节的 bge-reranker 推理时间翻了一倍，定位到 GPU 驱动升级后 batch size 没调过来。装饰器的概念本身其实就是个高阶函数——把函数当参数，返回一个新函数，`@decorator` 等价于 `func = decorator(func)`。闭包让 wrapper 能访问外层参数（比如 `max_attempts`），这个在 AI 开发里太实用了，因为这些横切逻辑（重试、打点、缓存、鉴权）不能和业务代码搅在一起。

### Q4: Python 的 GIL 是什么？对多线程有什么影响？如何在 AI 开发中绕过 GIL 限制？
**详细答案：** GIL 这件事我们项目里体会太深了。早期我们做并发 LLM 调用的时候，有个同事用 `threading` 开了 10 个线程同时调 OpenAI API，结果发现并发上去后总耗时跟串行差不多——每个线程都在争 GIL，虽然 I/O 等待时会释放，但线程切换本身的调度开销把并发增益吃掉了大半。后来切 `asyncio` + `aiohttp`，同样的 10 个并发请求，总耗时从 8 秒降到了 1.5 秒——因为协程的上下文切换是用户态的，开销几乎为零。我们线上的客服 Bot 用 FastAPI + asyncio，4 核 8G 机器轻松撑 50+ 并发，P99 延迟 2.5 秒，这在 threading 模型上根本做不到。

但多线程也不是完全没用。我们的夜间批量 Embedding 任务主要依赖 numpy 和 FAISS，这些东西的底层是 C/C++/CUDA，在进入 C 扩展之前会自动释放 GIL，所以用 ThreadPoolExecutor 做并行还真能跑满 GPU。我们 200 万条文档做批量向量化，32 线程把 4090 利用率从单线程的 45% 推到了 92%，吞吐量接近翻了倍。所以我现在的经验就一条：I/O 密集用 asyncio 协程，CPU 密集且底层是 C 库的用线程池，纯 Python CPU 计算才上 multiprocessing。Python 3.13 有实验性的无 GIL 模式了，但我们在生产还没敢用，稳定性第一位。

### Q5: Python 中的 `self` 参数是什么？为什么必须显式传递？与 Java 的 `this` 有何不同？
**详细答案：** 说实话我是从 Java 转 Python 的，刚看到 `self` 要显式传的时候很不习惯，觉得啰嗦。但写了近两年之后反而觉得这个设计挺顺手。我们项目里 Agent 的工具函数用 Mixin 模式比较多——比如 `SearchCapabilityMixin` 给不同 Agent 混入检索能力。Python 里因为 `self` 是显式参数，你可以清楚地看到 `search_knowledge_base(self, query: str)` 这个方法用了实例的哪些状态，Mixin 里引用的 `self.vector_store` 虽然没在当前类定义但你知道它来自实例属性，这在复杂继承链里排查问题时特别有用——比 Java 的隐式 `this` 清晰。

还有一个实际收益是调试。我们 Agent 工作流出错时，因为 `self` 是显式传参，我可以直接在调用点 `ClassName.method(obj, arg)` 这种方式手工验证，obj 是什么、传进去对不对一目了然。Java 里你想调试 `this` 就必须靠断点。底层原理上，`obj.method(arg)` 本质上 Python 执行的是 `ClassName.method(obj, arg)`，通过描述符协议自动把 instance 绑到方法的第一个参数上。我的建议是 Java 转过来的同学别纠结这个，花一周习惯就好，后面你会发现 `self` + `@classmethod` 的 `cls` + `@staticmethod` 的零隐式参数这套组合，比 Java 的 static/non-static 二分法灵活多了。