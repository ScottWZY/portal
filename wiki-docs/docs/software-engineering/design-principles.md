# 设计原则

## ⭐ 面试重点速览

| 知识模块 | 重点内容 | 面试频率 |
|----------|----------|----------|
| SOLID 原则 | 五大原则逐一理解 + 正反代码示例，尤其是 SRP、OCP、DIP | 极高 |
| DRY 原则 | 避免重复，但区分"偶然重复"和"本质重复" | 高 |
| KISS 原则 | 保持简单，避免过度设计 | 高 |
| YAGNI 原则 | 不要提前设计用不到的功能 | 中高 |
| 高内聚低耦合 | 模块设计的最核心目标 | 极高 |
| 迪米特法则 | 最少知识原则，控制耦合链条 | 中高 |

---

## 一、SOLID 五大设计原则

SOLID 是面向对象设计的五条基本原则，由 Robert C. Martin（Uncle Bob）提出。它们是**可维护、可扩展、可测试**代码的基石。

### 1.1 SRP —— 单一职责原则

> **一个类应该只有一个发生变化的原因。**

核心思想：一个类承担太多职责 = 过多的变化原因 = 修改风险扩散。

```java
// ❌ 反例：一个类承担了数据处理、格式化和持久化三个职责
public class EmployeeService {

    public double calculateSalary(Employee emp) {
        // 计算工资逻辑
        return emp.getBaseSalary() * emp.getCoefficient();
    }

    public String formatReport(Employee emp) {
        // 格式化报表逻辑
        return "Name: " + emp.getName() + ", Salary: " + calculateSalary(emp);
    }

    public void saveToDatabase(Employee emp) {
        // 持久化逻辑
        Connection conn = DriverManager.getConnection("jdbc:mysql://...");
        // ...
    }
}
```

```java
// ✅ 正例：按职责拆分为三个独立的类
public class SalaryCalculator {
    public double calculate(Employee emp) {
        return emp.getBaseSalary() * emp.getCoefficient();
    }
}

public class EmployeeReportFormatter {
    public String format(Employee emp, double salary) {
        return "Name: " + emp.getName() + ", Salary: " + salary;
    }
}

public class EmployeeRepository {
    public void save(Employee emp) {
        // 只负责持久化
    }
}
```

::: tip 识别 SRP 违反的方法
问自己一个问题："这个类做什么？"如果你需要用"和"字来回答（"它做 A **和** B **和** C"），那么很可能违反了 SRP。
:::

### 1.2 OCP —— 开闭原则

> **软件实体（类、模块、函数）应该对扩展开放，对修改关闭。**

核心思想：当需求变化时，应该通过**新增代码**来实现功能，而不是**修改已有代码**。已有代码已经经过测试上线，修改已有代码 = 引入新的 bug 风险。

```java
// ❌ 反例：新增图形类型需要修改 area() 方法
public class AreaCalculator {
    public double area(Object shape) {
        if (shape instanceof Circle) {
            Circle c = (Circle) shape;
            return Math.PI * c.getRadius() * c.getRadius();
        } else if (shape instanceof Rectangle) {
            Rectangle r = (Rectangle) shape;
            return r.getWidth() * r.getHeight();
        }
        // 每次新增形状都要在这里加 else-if
        throw new IllegalArgumentException("Unknown shape");
    }
}
```

```java
// ✅ 正例：通过接口扩展——新增形状只需新增实现类
public interface Shape {
    double area();
}

public class Circle implements Shape {
    private double radius;
    public double area() { return Math.PI * radius * radius; }
}

public class Rectangle implements Shape {
    private double width, height;
    public double area() { return width * height; }
}

// 新增三角形——无需修改任何已有代码
public class Triangle implements Shape {
    private double base, height;
    public double area() { return 0.5 * base * height; }
}
```

::: danger 常见误区
OCP 不是说"永远不改代码"，而是说"**有策略地控制修改面**"。通过抽象（接口/抽象类）将频繁变化的部分隔离，让修改的影响范围尽可能小。
:::

### 1.3 LSP —— 里氏替换原则

> **子类对象应该能够替换父类对象，而不影响程序的正确性。**

核心思想：继承不只是"复用代码"——它意味着子类必须遵守父类的**行为契约**。违反 LSP 的继承关系是脆弱的，替换后会出 bug。

```java
// ❌ 反例：正方形继承矩形——正方形无法独立设置宽高
public class Rectangle {
    protected int width, height;
    public void setWidth(int w) { this.width = w; }
    public void setHeight(int h) { this.height = h; }
    public int getArea() { return width * height; }
}

public class Square extends Rectangle {
    @Override
    public void setWidth(int w) {
        this.width = w;
        this.height = w;  // 破坏了父类行为契约
    }
    @Override
    public void setHeight(int h) {
        this.width = h;
        this.height = h;
    }
}

// 测试代码会失败——替换后行为不一致
public void testArea(Rectangle r) {
    r.setWidth(5);
    r.setHeight(4);
    // 期望 5 * 4 = 20，但 Square 返回 4 * 4 = 16！
    assertEquals(20, r.getArea());
}
```

```java
// ✅ 正例：不用继承关系，各自独立实现 Shape 接口
public interface Shape {
    int getArea();
}

public class Rectangle implements Shape {
    private int width, height;
    public Rectangle(int w, int h) { this.width = w; this.height = h; }
    public int getArea() { return width * height; }
}

public class Square implements Shape {
    private int side;
    public Square(int s) { this.side = s; }
    public int getArea() { return side * side; }
}
```

::: tip 面试金句
"LSP 的本质是'子类必须遵守父类的行为契约'。如果继承只是为了复用代码而破坏了行为一致性，那么应该使用组合（Composition）代替继承（Inheritance）。"
:::

### 1.4 ISP —— 接口隔离原则

> **客户端不应该被强迫依赖它不使用的方法。**

核心思想：大而全的接口会导致不必要的耦合——调用方 A 只用了方法 1，但接口修改时 A 也会受影响。

```java
// ❌ 反例：臃肿接口——每个实现类都要处理不相关的方法
public interface Worker {
    void work();
    void eat();
    void sleep();
}

// 机器人不需要吃饭睡觉，但被迫实现
public class Robot implements Worker {
    public void work() { /* 正常工作 */ }
    public void eat() { throw new UnsupportedOperationException(); }
    public void sleep() { throw new UnsupportedOperationException(); }
}
```

```java
// ✅ 正例：拆分为小接口，每个实现类按需实现
public interface Workable {
    void work();
}

public interface Eatable {
    void eat();
}

public interface Sleepable {
    void sleep();
}

// Robot 只实现自己需要的
public class Robot implements Workable {
    public void work() { /* 正常工作 */ }
}

// Human 实现全部
public class Human implements Workable, Eatable, Sleepable {
    public void work() { /* ... */ }
    public void eat() { /* ... */ }
    public void sleep() { /* ... */ }
}
```

### 1.5 DIP —— 依赖倒置原则

> **高层模块不应该依赖低层模块，两者都应该依赖抽象。抽象不应该依赖细节，细节应该依赖抽象。**

核心思想：依赖的方向应该从"具体 → 具体"变为"具体 → 抽象 ← 具体"。这是实现"低耦合"最核心的手段。

```java
// ❌ 反例：高层模块直接依赖低层模块的具体实现
public class OrderService {
    // 直接依赖具体实现——换数据库或发邮件方式就要改这里
    private MySQLOrderRepository repository = new MySQLOrderRepository();
    private SMTPEmailSender emailSender = new SMTPEmailSender();

    public void createOrder(Order order) {
        repository.save(order);
        emailSender.send("订单已创建：" + order.getId());
    }
}
```

```java
// ✅ 正例：依赖抽象接口——具体实现可随意替换
public interface OrderRepository {
    void save(Order order);
}

public interface NotificationSender {
    void send(String message);
}

public class OrderService {
    private final OrderRepository repository;
    private final NotificationSender notifier;

    // 依赖抽象，由外部注入具体实现（依赖注入）
    public OrderService(OrderRepository repository, NotificationSender notifier) {
        this.repository = repository;
        this.notifier = notifier;
    }

    public void createOrder(Order order) {
        repository.save(order);
        notifier.send("订单已创建：" + order.getId());
    }
}
```

::: tip 与 Spring 的关联
Spring 的 IoC 容器本质上就是 DIP 的落地工具——通过 `@Autowired` / 构造器注入让高层模块依赖接口，由容器在运行时注入具体实现。详见 [Spring 中的设计模式](../spring-ecosystem/spring-patterns/index.md)。
:::

---

## 二、DRY / KISS / YAGNI

### 2.1 DRY —— 不要重复自己

> **每一块知识在系统中应该有单一、明确、权威的表示。**

::: warning 重要区分
DRY 关注的是**知识重复**，不是**代码重复**。两段看起来一样的代码如果代表了不同的业务含义，将它们合并反而是错误的——这是"偶然重复"而非"本质重复"。
:::

| 类型 | 说明 | 处理策略 |
|------|------|----------|
| **本质重复** | 同一业务规则出现在多处，一处改另一处也要改 | 必须消除——提取到单一来源 |
| **偶然重复** | 代码恰好相似但代表不同业务含义 | 保持独立——强行合并会导致耦合 |
| **结构重复** | 模板代码（getter/setter、Builder） | 用工具生成（Lombok、IDE 模板），不必手工消除 |

### 2.2 KISS —— 保持简单

> **Keep It Simple, Stupid —— 保持简单。**

代码的复杂度是许多工程问题的根源。KISS 原则要求：
- 能用简单方案解决的，不要引入复杂方案
- 代码应该让接手的同事（包括三个月后的自己）能快速理解
- 复杂度应该有"收益论证"——不能因为"以后可能需要"就引入复杂设计

```java
// ❌ 过度设计：简单功能引入了策略模式 + 工厂模式
public interface GreetingStrategy {
    String greet(String name);
}
public class EnglishGreeting implements GreetingStrategy {
    public String greet(String name) { return "Hello, " + name; }
}
public class GreetingStrategyFactory {
    public GreetingStrategy create(String lang) { /* ... */ }
}

// ✅ KISS：一行代码能搞定的事不需要设计模式
public String greet(String name) {
    return "Hello, " + name;
}
```

### 2.3 YAGNI —— 你不会需要它

> **You Ain't Gonna Need It —— 不要实现当前不需要的功能。**

YAGNI 是**过度设计**的解毒剂。在需求真正到来之前，不要为"可能的未来"写代码。原因：
1. 未来需求大概率和你预想的不一样——你白写了
2. 预先设计的抽象通常是错误的抽象——方向不对
3. 多余的代码增加了维护负担——不只在写，未来还要读、要改

::: tip 实践建议
先写最简单的实现，当同一个模式出现**第三次**时再考虑抽象。这就是"三次法则"（Rule of Three）。
:::

---

## 三、高内聚低耦合

### 3.1 内聚性

内聚性衡量模块内部元素（方法、字段）的关联强度：

| 内聚级别 | 描述 | 示例 |
|---------|------|------|
| **功能内聚**（最高） | 一个模块只完成一个明确的功能 | `PasswordEncoder` —— 只负责密码编码 |
| **顺序内聚** | 前一个步骤的输出是后一个步骤的输入 | 数据处理管道 |
| **通信内聚** | 操作同一份数据 | 对同一个表的 CRUD 操作 |
| **逻辑内聚**（差） | 逻辑上相似但功能无关 | 一个工具类放了 String、Date、File 各种工具 |
| **偶然内聚**（最差） | 毫无关联的代码放在一起 | `MiscUtils` —— 杂项工具类 |

### 3.2 耦合性

耦合性衡量模块之间的依赖强度。从强到弱：

1. **内容耦合**（最差）：一个模块直接修改另一个模块的内部数据
2. **控制耦合**：一个模块通过传递控制参数（flag）控制另一个模块的行为
3. **数据耦合**（最佳）：模块间只通过参数传递数据，不分享控制逻辑

降低耦合的核心手段：**依赖抽象（接口）、依赖注入、事件驱动**。

---

## 四、迪米特法则（最少知识原则）

> **一个对象应该对其他对象有尽可能少的了解。**

迪米特法则的核心约束是——一个方法内部，只应该调用以下对象的方法：
1. 当前对象自身（`this`）
2. 方法的参数对象
3. 当前对象内部持有的成员对象
4. 方法内部创建的对象

```java
// ❌ 违反迪米特法则：链式调用穿透了多级对象
public class ReportGenerator {
    public void generate(Order order) {
        // 穿透 order → customer → address → city
        String city = order.getCustomer().getAddress().getCity();
        // ReportGenerator 不应该知道 Address 有 getCity() 方法
    }
}

// ✅ 遵守迪米特法则：由 Order 自己提供所需信息
public class Order {
    public String getCustomerCity() {
        return customer.getAddress().getCity();
    }
}

public class ReportGenerator {
    public void generate(Order order) {
        String city = order.getCustomerCity();  // 只和 Order 对话
    }
}
```

::: warning 注意
迪米特法则是"给朋友的朋友发消息""的禁令，不是限制 getter。核心问题在于：A → B → C 的链式调用中，A 知道了 C 的接口，当 C 发生变化时，A 也会受影响。应该让 B 封装对 C 的访问。
:::

---

## ⭐ 面试高频问题

### Q1：请完整描述 SOLID 五大原则，并各举一个应用场景。

**标准答案**：

| 原则 | 一句话 | Spring 中的应用 |
|------|--------|----------------|
| **SRP 单一职责** | 一个类只做一件事 | `@Controller`（Web 层）、`@Service`（业务层）、`@Repository`（数据层）分层 |
| **OCP 开闭原则** | 扩展开放，修改关闭 | `BeanPostProcessor` 接口——通过新增处理器扩展 Bean 创建流程，不修改核心代码 |
| **LSP 里氏替换** | 子类可替换父类 | `AbstractApplicationContext` 的子类都可替换父类使用 |
| **ISP 接口隔离** | 不强迫依赖不需要的方法 | Spring 接口粒度很细：`BeanFactory`（核心） vs `ListableBeanFactory`（列表） vs `ConfigurableBeanFactory`（配置） |
| **DIP 依赖倒置** | 依赖抽象不依赖具体 | `@Autowired` 注入接口，运行时由容器提供具体实现 |

### Q2：如何向非技术同事解释 SOLID 原则？

**标准答案**：用餐厅类比：

- **SRP**：厨师只管做菜，服务员只管上菜，收银只管收钱——各司其职
- **OCP**：新增一道菜不需要改造厨房——只需在菜单上加一项
- **LSP**：不管主厨还是副厨做菜，客人体验到的菜品质量应该一致
- **ISP**：菜单不要做得太厚——素食者不需要看到荤菜页
- **DIP**：餐厅不绑定特定供应商——换一个供应商不影响厨房运作

### Q3：DRY 和"复制粘贴"是同一回事吗？

**标准答案**：不是。DRY 关注的是**知识的重复**，不是代码文本的相似性。

- 两段完全相同的 SQL 如果服务于不同的业务场景（一个是报表查询，一个是在线查询），可能不应该合并——未来它们的优化方向可能不同，合并反而造成耦合
- 两段看起来不同的代码如果体现了同样的业务规则（如"VIP 折扣 = 8折"），则需要提取为单一来源

**关键判断标准**：修改 A 处是否必须同步修改 B 处？如果是，则是 DRY 要解决的问题；如果不是，保持独立更好。

### Q4：KISS 和 YAGNI 有什么区别？在实践中如何平衡？

**标准答案**：

- **KISS** 关注的是**当前**：不要把当前的方案搞复杂
- **YAGNI** 关注的是**未来**：不要为可能不存在的需求提前设计

两者相互补充：KISS 让你不把简单问题复杂化，YAGNI 让你不把当前问题未来化。

平衡策略：**三次法则（Rule of Three）**——第一次写最简单实现，第二次复制容忍，第三次出现同样模式时再抽象。

### Q5：高内聚低耦合和 SOLID 原则有什么关系？

**标准答案**：SOLID 原则是高内聚低耦合的**具体实现手段**：

- **SRP**：提高内聚（一个类只做一件相关的事）
- **OCP**：降低耦合（扩展不需要修改依赖方）
- **LSP**：保证降低耦合的实施不会破坏行为正确性
- **ISP**：降低耦合（减小接口意味着更少的依赖面）
- **DIP**：降低耦合（依赖倒转，控制依赖方向）

高内聚低耦合是**目标**，SOLID 是实现这个目标的**方法**。

### Q6：什么时候应该使用继承，什么时候应该使用组合？

**标准答案**：

使用**继承**当：
- 子类和父类是严格的"is-a"关系
- 子类需要复用父类的行为且不需要改变行为契约
- 父类的设计是专门为继承考虑的（有良好的文档和设计）

使用**组合**当：
- 需要复用功能但关系是"has-a"
- 需要在运行时动态改变行为
- 继承会导致违反 LSP（如正方形继承矩形）
- 只需要复用父类的部分功能

> **原则**：当拿不准时，优先选择组合（Combination over Inheritance）。这是 GoF 设计模式的核心建议之一。详见 [设计模式概览](../java-advanced/design-patterns/index.md)。

### Q7：迪米特法则在实际项目中如何落地？有什么代价？

**标准答案**：

落地方式：限制方法内部的调用链条，方法只与"直接朋友"通信。

代价：
1. **中间类膨胀**：为了遵守迪米特法则，中间类需要增加大量"转发方法"
2. **性能开销**：有时直接穿透查询更快，强制封装会导致多次方法调用

**折中策略**：对**稳定的、内聚的模块**（如 DTO、值对象）可以适当放宽；对**不稳定、复杂交互的业务模块**严格遵循。判断标准仍然是：被穿透的对象变更时，是否会影响当前模块。