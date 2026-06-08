# 代码质量

## ⭐ 面试重点速览

| 知识模块 | 重点内容 | 面试频率 |
|----------|----------|----------|
| 代码坏味道 | 24 种坏味道分类 + 识别 + 对应重构手法 | 极高 |
| 重构手法 | 提取方法、内联、搬移、封装等核心重构操作 | 极高 |
| Clean Code | 有意义的命名、函数设计、注释原则、格式规范 | 高 |
| 圈复杂度 | 定义、计算公式、阈值标准、降低方法 | 高 |
| 代码度量 | 认知复杂度、耦合度、重复率等辅助指标 | 中 |

---

## 一、代码坏味道

代码坏味道（Code Smell）是 Martin Fowler 在《重构》中提出的概念——代码中**暗示深层设计问题**的"气味"。坏味道不是 bug，但它预示着代码正在向不可维护的方向演变。

### 1.1 类级别的坏味道

| 坏味道 | 描述 | 信号 | 对应重构 |
|--------|------|------|----------|
| **过大的类** | 一个类承担了过多职责 | 类超过 300 行，字段 > 10 个 | 提取类、提取子类 |
| **数据泥团** | 一组数据总是一起出现 | 方法的 3+ 个参数总是一起传递 | 提取类、引入参数对象 |
| **依恋情结** | 类过度依赖另一个类的数据 | 一个类中频繁调用另一个类的 getter | 搬移方法、提取方法 |
| **霰弹式修改** | 一个改动要修改多个类 | 加一个字段要改 5 个类 | 搬移方法/字段 |
| **拒绝继承** | 子类不需要父类的大部分方法 | 子类抛 `UnsupportedOperationException` | 用组合替换继承 |

### 1.2 方法级别的坏味道

```java
// ❌ 坏味道 1：过长方法——一个方法做了太多事
public void processOrder(Order order) {
    // 校验订单（20 行）
    if (order.getAmount() <= 0) { /* ... */ }
    if (order.getItems().isEmpty()) { /* ... */ }

    // 计算折扣（15 行）
    double discount = 0;
    if (order.getAmount() > 1000) { discount = 0.1; }
    // ...

    // 保存订单（10 行）
    orderRepository.save(order);

    // 发送通知（15 行）
    emailSender.send(new OrderEmail(order));
    smsSender.send(new OrderSms(order));

    // 记录日志（10 行）
    auditLogger.log("订单创建", order.getId());
}
```

```java
// ✅ 重构后：每个方法只做一件事
public void processOrder(Order order) {
    validateOrder(order);
    double discount = calculateDiscount(order);
    order.applyDiscount(discount);
    saveOrder(order);
    notifyCustomer(order);
    auditLog(order);
}

private void validateOrder(Order order) { /* ... */ }
private double calculateDiscount(Order order) { /* ... */ }
private void saveOrder(Order order) { /* ... */ }
private void notifyCustomer(Order order) { /* ... */ }
private void auditLog(Order order) { /* ... */ }
```

### 1.3 更多常见坏味道速查

| 坏味道 | 信号 | 重构方向 |
|--------|------|----------|
| **过长参数列表** | 方法参数超过 4 个 | 引入参数对象 |
| **重复代码** | 相同逻辑出现 > 2 次 | 提取方法 / 提取到父类 |
| **switch 语句泛滥** | 相同的 switch 出现在多处 | 用多态替换条件表达式 |
| **临时字段** | 字段只在特定场景下有意义 | 提取类（将临时字段+相关方法独立） |
| **中间人** | 类的半数方法都是委托调用 | 移除中间人 |
| **被拒绝的遗赠** | 子类不支持父类的部分方法 | 组合替换继承 |
| **注释过多** | 用注释解释代码逻辑 | 提炼方法——让代码自解释 |
| **基本类型偏执** | 用 String 表示电话号码、用 int 表示金额 | 引入值对象（PhoneNumber、Money） |

::: tip 识别坏味道的思维方式
不要背列表——问自己三个问题：
1. **修改时**：改这里需要同时改多少地方？（多 = 霰弹式）
2. **理解时**：我需要在脑子里同时记住多少信息？（多 = 过长方法）
3. **测试时**：这个方法容易写单元测试吗？（不能 = 依恋情结 / 职责过多）
:::

---

## 二、核心重构手法

重构是在不改变代码**外部行为**的前提下，改善代码**内部结构**的过程。重构的前提是**有测试保障**——没有测试的重构是赌博。

### 2.1 提取方法（Extract Method）

最常用的重构手法。将一段代码提取到一个独立方法中，方法名解释这段代码的意图。

```java
// 重构前：一段逻辑难以快速理解意图
public void printOwing(Invoice invoice) {
    double outstanding = 0;
    System.out.println("***********************");
    System.out.println("**** Customer Owes ****");
    System.out.println("***********************");

    // 计算欠款
    for (Order o : invoice.getOrders()) {
        outstanding += o.getAmount();
    }

    // 打印详情
    System.out.println("name: " + invoice.getCustomer());
    System.out.println("amount: " + outstanding);
}
```

```java
// 重构后：每个方法名解释其意图
public void printOwing(Invoice invoice) {
    printBanner();
    double outstanding = calculateOutstanding(invoice);
    printDetails(invoice.getCustomer(), outstanding);
}

private void printBanner() {
    System.out.println("***********************");
    System.out.println("**** Customer Owes ****");
    System.out.println("***********************");
}

private double calculateOutstanding(Invoice invoice) {
    double result = 0;
    for (Order o : invoice.getOrders()) {
        result += o.getAmount();
    }
    return result;
}

private void printDetails(String customer, double amount) {
    System.out.println("name: " + customer);
    System.out.println("amount: " + amount);
}
```

### 2.2 内联（Inline）

与提取方法相反——当方法体比方法名更清晰时，把方法调用替换为方法体。

```java
// 重构前：方法名不能提供比方法体更多的信息
public int getRating() {
    return (moreThanFiveLateDeliveries()) ? 2 : 1;
}
private boolean moreThanFiveLateDeliveries() {
    return numberOfLateDeliveries > 5;
}

// 重构后：直接内联
public int getRating() {
    return (numberOfLateDeliveries > 5) ? 2 : 1;
}
```

### 2.3 搬移方法 / 搬移字段（Move Method / Move Field）

当方法或字段在另一个类中使用得更频繁时，将其搬移到实际被使用的类中。

### 2.4 用多态替换条件表达式

```java
// 重构前：if-else 或 switch 决定行为
public double getShippingCost(Order order) {
    switch (order.getType()) {
        case "STANDARD": return 5.0;
        case "EXPRESS": return 15.0;
        case "OVERNIGHT": return 30.0;
        default: throw new IllegalArgumentException();
    }
}

// 重构后：多态——每种类型有自己的类
public interface ShippingStrategy {
    double cost();
}
public class StandardShipping implements ShippingStrategy {
    public double cost() { return 5.0; }
}
public class ExpressShipping implements ShippingStrategy {
    public double cost() { return 15.0; }
}
public class OvernightShipping implements ShippingStrategy {
    public double cost() { return 30.0; }
}
```

::: tip 重构节奏
- 每次只做一个重构操作
- 每次重构后运行测试（红线 → 重构 → 绿灯）
- 重构和功能开发分开提交
- **不要一边重构一边加新功能**——这是产生 bug 的最快途径
:::

---

## 三、Clean Code 实践

### 3.1 有意义的命名

| 原则 | 反例 | 正例 |
|------|------|------|
| **名副其实** | `int d;` // 天数 | `int daysSinceLastLogin;` |
| **避免误导** | `List accountList;` // 但它是 Set | `Set<Account> accounts;` |
| **做有意义的区分** | `a1`, `a2`, `a3` | `source`, `destination`, `result` |
| **使用可读的名字** | `genymdhms` | `generationTimestamp` |
| **可搜索的名字** | 魔法数字 `7` | `static final int DAYS_PER_WEEK = 7;` |
| **方法名用动词** | `manager.status()` | `manager.getStatus()` |

### 3.2 函数的正确写法

```java
// ❌ 坏函数示例：太长、太深层嵌套、太多参数
public void updateCustomerOrderStatus(Customer c, Order o, boolean isVip,
                                       boolean isUrgent, String note,
                                       int priority, LocalDate deadline) {
    if (c != null) {
        if (o != null) {
            if (o.getStatus() == Status.PENDING) {
                if (!o.getItems().isEmpty()) {
                    // ... 200 行嵌套逻辑
                }
            }
        }
    }
}
```

```java
// ✅ 好函数示例：短、参数少、提前返回消嵌套
public void processOrder(ProcessOrderRequest request) {
    if (request == null || !request.isValid()) {
        throw new IllegalArgumentException("Invalid order request");
    }
    Order order = request.toOrder();
    order.process();
    notifyCustomer(order);
}
```

**函数设计原则**：
- **短小**：理想情况下不超过 20 行
- **只做一件事**：函数名能概括全部行为
- **一个抽象层级**：不要在同一个函数内混入"获取 HTTP 请求"和"解析 JSON 字段"两个层级
- **参数不超过 3 个**：超过 3 个时使用参数对象封装
- **无副作用**：函数要么做某事（命令），要么回答某事（查询），不要两者都做（CQRS）

### 3.3 注释原则

> **注释的恰当用法是弥补代码在表达意图时遭遇的失败。注释总是一种失败。——Robert C. Martin**

| 好注释 | 坏注释 |
|--------|--------|
| 解释"为什么"这样做（决策背景） | 解释"做了什么"（代码已经说了） |
| TODO 标记待办事项 | 过时的注释（修改代码未更新注释） |
| 公共 API 的 Javadoc | 被注释掉的代码 |
| 对复杂算法的简要说明 | 废话注释 `// 递增 i` for `i++` |

---

## 四、圈复杂度

### 4.1 定义

圈复杂度（Cyclomatic Complexity）是衡量代码**逻辑复杂度**的定量指标。它等于程序中**独立路径的数量**：

```
圈复杂度 M = E − N + 2P
其中：E = 控制流图中边的数量
      N = 节点数量
      P = 连通分量数（通常为 1）
```

通俗公式（简化版）：

```
M = 1 + 分支数量
   其中分支包括：if、else if、for、while、case、catch、&&、||、?:
```

```java
// 圈复杂度 = 1（基础） + 3（if * 2 + for * 1） = 4
public int calculate(int a, int b, List<Integer> items) {
    int result = 0;
    if (a > 10) {           // +1
        result += a;
    }
    if (b < 0) {            // +1
        result -= b;
    }
    for (int item : items) { // +1
        result += item;
    }
    return result;
}
```

### 4.2 阈值标准

| 圈复杂度 | 含义 | 处理建议 |
|:--------:|------|----------|
| **1 - 10** | 简单代码，风险低 | 正常 |
| **11 - 20** | 中等复杂度 | 考虑重构 |
| **21 - 50** | 复杂代码，风险较高 | 必须重构 |
| **> 50** | 不可测试，极高风险 | 立即拆分 |

::: danger 实践标准
大多数团队将圈复杂度的红线设在 **15**。超过 15 的方法应该在 Code Review 中被拦截。
:::

### 4.3 降低圈复杂度的方法

1. **提取方法**：将复杂的条件判断或循环体提取为独立方法
2. **多态替换条件**：用策略模式替代 `if-else` 链（参见 [设计模式 - 行为型模式](../java-advanced/design-patterns/behavioral.md)）
3. **提前返回**：用卫语句（Guard Clause）代替深层嵌套
4. **合并条件**：多个条件是同一语义的不同表达时合并

```java
// 重构前：圈复杂度 = 1 + 4(if) + 1(&&) = 6
public boolean isEligible(User user) {
    if (user != null) {
        if (user.isActive()) {
            if (user.getAge() >= 18 && user.getAge() <= 65) {
                if (user.hasValidId()) {
                    return true;
                }
            }
        }
    }
    return false;
}

// 重构后：圈复杂度 = 1（卫语句提前返回不含分支计数）
public boolean isEligible(User user) {
    if (user == null) return false;
    if (!user.isActive()) return false;
    if (!isValidAge(user.getAge())) return false;
    return user.hasValidId();
}

private boolean isValidAge(int age) {
    return age >= 18 && age <= 65;
}
```

---

## ⭐ 面试高频问题

### Q1：你如何判断一段代码"质量高"还是"质量低"？

**标准答案**：从四个维度判断：

1. **可读性**：一个新同事能否在 10 分钟内理解这段代码的意图？命名是否自解释？
2. **可测试性**：能否为这段代码的每个分支编写独立的单元测试？是否需要 Mock 大量依赖？
3. **可修改性**：增加一个新需求时，需要修改多少处代码？（改一处 = 好，改多处 = 坏）
4. **简洁性**：是否存在可以删除的代码？逻辑是否比需要的更复杂？

**一句话总结**：代码质量的终极标准是"**其他人（及三个月后的你）能否高效地修改这段代码**"。

### Q2：举出 5 种你最常见的代码坏味道，以及你会如何处理。

**标准答案**：

| 坏味道 | 处理方式 |
|--------|---------|
| **过长方法**（> 40 行） | 提取方法——把方法拆成若干意图清晰的小方法 |
| **过长参数列表**（> 4 个） | 引入参数对象（DTO / VO）封装相关参数 |
| **switch 语句泛滥** | 用多态替换条件表达式——每种 case 变成一个策略类 |
| **数据泥团** | 提取类——把总在一起出现的字段 + 相关方法独立成一个值对象 |
| **注释代码** | 直接删除（有 Git 历史，不需要保留注释的代码） |

### Q3：重构和重写有什么区别？什么时候选择重构，什么时候选择重写？

**标准答案**：

| 维度 | 重构（Refactoring） | 重写（Rewrite） |
|------|-------------------|----------------|
| 策略 | 渐进式改善，每次一小步 | 推倒重来，一次性替换 |
| 风险 | 低——每步都有测试保障 | 高——重写过程中可能丢失已有的业务逻辑 |
| 时间 | 持续进行，融入日常开发 | 需要专门的大段时间 |
| 适用场景 | 代码整体结构可接受，局部有问题 | 代码架构已完全不适合当前需求 |

**决策原则**：优先重构。只有当前代码连"一步步重构"的起点都找不到时（例如完全不可测试、无法拆分），才考虑重写。而且重写也应该**绞杀者模式**（Strangler Fig）——渐进替换而非大爆炸式切换。

### Q4：圈复杂度为 30 的方法意味着什么？你会怎么做？

**标准答案**：圈复杂度 30 意味着这个方法有至少 30 条独立的执行路径，要达到 100% 的测试覆盖率需要至少 30 个测试用例。这是维护噩梦。

处理步骤：
1. 先为现有行为补充特征测试（Characterization Test）——记录当前输出
2. 识别方法中的逻辑块：存在几种不同的处理场景？
3. 对每种场景**提取方法**——每个提取方法圈复杂度控制在 5 以内
4. 如果提取后发现多种场景对应不同的"类型"，进一步用**策略模式**替代（参见 [设计模式概览](../java-advanced/design-patterns/index.md)）
5. 每次重构后运行测试确保行为不变

### Q5：Clean Code 中关于"函数"的核心建议是什么？

**标准答案**：

1. **短小**：每个函数不超过 20 行（理想情况）
2. **只做一件事**：函数应该做好一件事，没有副业
3. **一个抽象层级**：函数内不应混合高低层级（如 HTTP 请求解析和业务规则不应共存于一个函数）
4. **参数少**：不超过 3 个参数，超过时用对象封装
5. **无副作用**：函数要么查询要么命令，不要两者都做
6. **使用异常而非错误码**：不要在方法间传递错误码，抛异常 + 全局异常处理

**面试金句**："一个好的函数应该让人一眼看懂它做了什么——不需要注释，不需要调试，不需要在脑子里维护一个调用栈。"

### Q6：为什么说"注释是一种失败"？那什么情况下注释是必要的？

**标准答案**：Uncle Bob 说"注释是一种失败"指的是**用注释来解释代码做了什么**——这种情况说明代码本身不够清晰。好代码应该自解释。

但注释在以下情况下是必要的：
1. **解释决策背景**："为什么选择自建队列而不是用 `ConcurrentLinkedQueue`？因为需要支持优先级驱逐"
2. **复杂算法的参考**："这是红黑树的删除修复算法，参考 CLRS 第 13 章"
3. **TODO / FIXME**：标记已知的临时解决方案
4. **公共 API 文档**：对外暴露的接口需要清晰的 Javadoc/TSDoc

**关键区分**：注释解释"为什么"（好），注释解释"做了什么"（说明代码不够好）。

### Q7：代码质量和交付速度矛盾吗？如何在项目中平衡？

**标准答案**：短期来看有矛盾，长期来看是统一的。

- **短期矛盾**：写高质量的代码确实比"能跑就行"的代码慢 10%-30%
- **长期统一**：高质量代码的修改成本远低于低质量代码。随着迭代次数增加，质量投入的 ROI 呈指数增长

平衡策略：
1. **分层投入**：核心业务逻辑（100% 质量要求） > 业务支撑代码 > 一次性脚本（低要求）
2. **技术债务显式管理**：快速交付时可以有意识地欠债，但必须记录并排期偿还
3. **20% 原则**：每个 Sprint 留 20% 时间做重构和技术债务偿还
4. **止损线**：当技术债务导致 bug 率上升或交付速度下降时，暂停新功能，集中还债