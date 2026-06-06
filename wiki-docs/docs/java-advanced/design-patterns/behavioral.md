# 行为型模式

## ⭐ 面试重点速览

| 知识模块 | 重点内容 | 面试频率 |
|----------|----------|----------|
| 观察者模式 | 发布订阅、Spring 事件机制 | 极高 |
| 策略模式 | 算法族、消除 if-else | 极高 |
| 模板方法模式 | 骨架定义、Spring JDBC 应用 | 极高 |
| 责任链模式 | 链式传递、Servlet Filter | 极高 |

---

## ⭐ 一、观察者模式

### 1.1 原理

定义对象间一对多的依赖关系，当一个对象状态改变时，所有依赖它的对象都会收到通知并自动更新。

```java
/**
 * ⭐ 观察者模式：发布-订阅
 */
// 主题（被观察者）
interface Subject {
    void attach(Observer observer);
    void detach(Observer observer);
    void notifyObservers();
}

// 观察者
interface Observer {
    void update(String message);
}

// 具体主题
class NewsPublisher implements Subject {
    private List<Observer> observers = new ArrayList<>();
    private String news;

    public void publishNews(String news) {
        this.news = news;
        notifyObservers();  // 通知所有观察者
    }

    @Override
    public void notifyObservers() {
        for (Observer observer : observers) {
            observer.update(news);
        }
    }
    // attach/detach 省略...
}

// 具体观察者
class Subscriber implements Observer {
    private String name;
    public void update(String message) {
        System.out.println(name + " 收到消息：" + message);
    }
}
```

### 1.2 Spring 中的观察者模式

```java
/**
 * ⭐ Spring 事件机制（基于观察者模式）
 */
// 1. 定义事件
public class UserRegisterEvent extends ApplicationEvent {
    private String username;
    public UserRegisterEvent(Object source, String username) {
        super(source);
        this.username = username;
    }
}

// 2. 发布事件
@Component
public class UserService {
    @Autowired
    private ApplicationEventPublisher publisher;

    public void register(String username) {
        // 注册逻辑...
        publisher.publishEvent(new UserRegisterEvent(this, username));
    }
}

// 3. 监听事件
@Component
public class EmailListener {
    @EventListener
    public void handleUserRegister(UserRegisterEvent event) {
        // 发送欢迎邮件
        System.out.println("发送邮件给：" + event.getUsername());
    }
}
```

---

## ⭐ 二、策略模式

### 2.1 原理

定义一系列算法，把每个算法封装起来，使它们可以互相替换。策略模式让算法的变化独立于使用算法的客户端。

```java
/**
 * ⭐ 策略模式：消除大量 if-else
 */
// 策略接口
interface PaymentStrategy {
    void pay(double amount);
}

// 具体策略
class AlipayStrategy implements PaymentStrategy {
    public void pay(double amount) {
        System.out.println("支付宝支付：" + amount);
    }
}

class WechatPayStrategy implements PaymentStrategy {
    public void pay(double amount) {
        System.out.println("微信支付：" + amount);
    }
}

// 上下文
class PaymentContext {
    private PaymentStrategy strategy;

    public PaymentContext(PaymentStrategy strategy) {
        this.strategy = strategy;
    }

    public void executePayment(double amount) {
        strategy.pay(amount);
    }
}

// 使用
public static void main(String[] args) {
    PaymentContext context = new PaymentContext(new AlipayStrategy());
    context.executePayment(100.0);
}
```

::: tip 策略模式 vs 大量 if-else
```java
// ❌ 反模式：大量 if-else
if ("alipay".equals(type)) {
    alipay.pay(amount);
} else if ("wechat".equals(type)) {
    wechat.pay(amount);
} else if ("unionpay".equals(type)) {
    unionpay.pay(amount);
}

// ✅ 策略模式：消除 if-else
Map<String, PaymentStrategy> map = new HashMap<>();
map.put("alipay", new AlipayStrategy());
map.put("wechat", new WechatPayStrategy());
map.get(type).pay(amount);
```
:::

---

## ⭐ 三、模板方法模式

### 3.1 原理

定义一个算法的骨架，将一些步骤延迟到子类中实现。子类可以重写某些步骤，而不改变算法的结构。

```java
/**
 * ⭐ 模板方法模式
 */
abstract class Beverage {
    // ⭐ 模板方法（final，防止子类修改流程）
    public final void prepare() {
        boilWater();
        brew();
        pourInCup();
        if (customerWantsCondiments()) {  // 钩子方法
            addCondiments();
        }
    }

    private void boilWater() { System.out.println("烧水"); }
    private void pourInCup() { System.out.println("倒入杯中"); }

    abstract void brew();           // 子类实现
    abstract void addCondiments();  // 子类实现

    // 钩子方法：子类可选择性重写
    boolean customerWantsCondiments() { return true; }
}

class Tea extends Beverage {
    void brew() { System.out.println("泡茶叶"); }
    void addCondiments() { System.out.println("加柠檬"); }
}
```

### 3.2 Spring JDBC 中的应用

```java
// JdbcTemplate 就是模板方法模式的典型应用
// 定义算法骨架，回调方法由使用者实现
jdbcTemplate.query("SELECT * FROM users", (rs, rowNum) -> {
    // 子步骤：处理每一行结果
    return new User(rs.getInt("id"), rs.getString("name"));
});
```

---

## ⭐ 四、责任链模式

### 4.1 原理

为请求创建一个处理者链，每个处理者判断自己能否处理，不能则传递给下一个处理者。

```java
/**
 * ⭐ 责任链模式：审批流程
 */
abstract class Approver {
    protected Approver next;  // 下一个处理者

    public void setNext(Approver next) {
        this.next = next;
    }

    public abstract void processRequest(int amount);
}

class Manager extends Approver {
    public void processRequest(int amount) {
        if (amount <= 1000) {
            System.out.println("经理审批通过：" + amount);
        } else if (next != null) {
            next.processRequest(amount);  // 传递给下一个
        }
    }
}

class Director extends Approver {
    public void processRequest(int amount) {
        if (amount <= 5000) {
            System.out.println("总监审批通过：" + amount);
        } else if (next != null) {
            next.processRequest(amount);
        }
    }
}
```

### 4.2 实际应用

```java
// Servlet Filter 链：典型的责任链模式
public class AuthFilter implements Filter {
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain) {
        // 前置处理：认证检查
        if (authenticated(req)) {
            chain.doFilter(req, res);  // 传递给下一个 Filter
        }
        // 后置处理
    }
}

// Spring Security FilterChain
// Netty ChannelPipeline
// MyBatis Plugin 拦截器链
```

---

## ⭐ 面试高频问题

### Q1：Spring 中有哪些设计模式的应用？

| 设计模式 | Spring 中的应用 |
|----------|----------------|
| 单例 | Bean 默认单例作用域 |
| 代理 | AOP 实现（JDK/CGLIB 动态代理） |
| 观察者 | ApplicationEvent / @EventListener |
| 模板方法 | JdbcTemplate、RestTemplate |
| 责任链 | HandlerInterceptor、Filter |
| 策略 | Resource 接口的不同实现 |
| 工厂 | BeanFactory、ApplicationContext |

### Q2：观察者模式和发布订阅模式有什么区别？

- 观察者模式：观察者和被观察者直接关联，松耦合
- 发布订阅模式：通过消息中间件/事件总线解耦，发布者和订阅者完全不知道对方

### Q3：策略模式的优势是什么？

- 消除大量 if-else，代码更清晰
- 新增策略只需新增类，符合开闭原则
- 策略可以自由切换，互不影响

### Q4：责任链模式有什么优缺点？

**优点**：
- 解耦请求发送者和处理者
- 可以动态调整处理链

**缺点**：
- 请求可能不被任何处理者处理（链尾）
- 链太长会影响性能

### Q5：模板方法模式和策略模式有什么区别？分别适用于什么场景？

| 维度 | 模板方法模式 | 策略模式 |
|------|-------------|----------|
| **核心思想** | 定义算法骨架，子类实现可变步骤 | 定义算法族，运行时选择算法 |
| **实现方式** | 继承（抽象类） | 组合（接口 + 具体策略类） |
| **扩展方式** | 子类重写父类方法 | 新增策略实现类 |
| **控制权** | 父类控制流程（好莱坞原则：别调用我们，我们会调用你） | 客户端控制选择哪个策略 |
| **代码复用** | 复用算法骨架代码 | 复用算法逻辑 |

**适用场景**：
- **模板方法**：流程固定步骤可变（如 JdbcTemplate 的查询流程固定，结果映射可变）
- **策略模式**：算法/行为需要动态切换（如支付方式、排序算法）

**示例对比**：
```java
// 模板方法：流程固定，步骤可变
abstract class DataProcessor {
    public final void process() {  // 骨架固定
        readData();
        processData();   // 子类实现
        writeData();
    }
    abstract void processData();
}

// 策略模式：算法可替换
class PaymentContext {
    private PaymentStrategy strategy;  // 组合策略
    void pay(double amount) {
        strategy.pay(amount);  // 运行时选择策略
    }
}
```

**记忆口诀**：模板方法用继承（固定流程），策略模式用组合（替换算法）。

---

## 面试追问环节

**Q：模板方法模式中为什么用 final 修饰模板方法？**

防止子类修改算法骨架。模板方法定义的是流程，子类只需要重写具体步骤，不应该改变流程。

**Q：策略模式和状态模式有什么区别？**

- 策略模式：客户端**主动选择**策略（如选择支付方式）
- 状态模式：对象**内部状态变化**自动切换行为（如订单状态变化）

**Q：Spring 的 @EventListener 是同步还是异步？**

默认是**同步**的（在发布事件的线程中执行）。需要异步需要加 `@Async` 注解。

**Q：责任链模式中的链断了怎么办？**

需要在链尾设置兜底处理者，或者确保至少有一个处理者能处理所有请求。也可以让链首持有所有处理者的引用，保证最终能被处理。