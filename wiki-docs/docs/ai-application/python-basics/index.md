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

## 五、面试重点

::: warning 高频考点
1. **Python 和 Java 的核心差异？** 动态类型 vs 静态类型
2. **列表推导式是什么？** 有什么优势？
3. **装饰器的原理？** 什么场景下使用？
4. **Python 的 GIL 是什么？** 对多线程有什么影响？
:::