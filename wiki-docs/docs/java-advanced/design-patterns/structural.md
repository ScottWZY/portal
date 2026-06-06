# 结构型模式

## ⭐ 面试重点速览

| 知识模块 | 重点内容 | 面试频率 |
|----------|----------|----------|
| 代理模式 | JDK 动态代理 vs CGLIB、Spring AOP | 极高 |
| 装饰器模式 | 与代理模式区别、IO 类应用 | 高 |
| 适配器模式 | 类适配器 vs 对象适配器 | 中 |

---

## ⭐ 一、代理模式

### 1.1 静态代理

```java
// 接口
interface Subject { void request(); }

// 真实对象
class RealSubject implements Subject {
    public void request() { System.out.println("真实请求"); }
}

// 代理对象：需要手动编写，代理类与目标类实现相同接口
class ProxySubject implements Subject {
    private RealSubject realSubject;

    public void request() {
        System.out.println("前置增强");  // 代理逻辑
        realSubject.request();
        System.out.println("后置增强");
    }
}
```

### 1.2 ⭐ JDK 动态代理

```java
/**
 * ⭐ JDK 动态代理：基于接口，运行时动态生成代理类
 */
public class JdkProxyDemo {
    public static void main(String[] args) {
        RealSubject realSubject = new RealSubject();

        // 创建代理对象
        Subject proxy = (Subject) Proxy.newProxyInstance(
            realSubject.getClass().getClassLoader(),
            realSubject.getClass().getInterfaces(),
            (proxyObj, method, methodArgs) -> {
                System.out.println("JDK 动态代理 - 前置增强");
                Object result = method.invoke(realSubject, methodArgs);
                System.out.println("JDK 动态代理 - 后置增强");
                return result;
            }
        );

        proxy.request();
    }
}
```

::: tip JDK 动态代理原理
- 通过 `Proxy.newProxyInstance()` 运行时动态生成一个代理类
- 代理类实现了目标类实现的**所有接口**
- 通过 `InvocationHandler.invoke()` 反射调用目标方法
- **限制**：目标类必须有接口，代理类只能代理接口中的方法
:::

### 1.3 ⭐ CGLIB 动态代理

```java
/**
 * ⭐ CGLIB 动态代理：基于继承，不需要接口
 */
public class CglibProxyDemo {
    public static void main(String[] args) {
        Enhancer enhancer = new Enhancer();
        enhancer.setSuperclass(TargetClass.class);  // 设置父类
        enhancer.setCallback((MethodInterceptor) (obj, method, args1, proxy) -> {
            System.out.println("CGLIB 代理 - 前置增强");
            Object result = proxy.invokeSuper(obj, args1);
            System.out.println("CGLIB 代理 - 后置增强");
            return result;
        });

        TargetClass proxy = (TargetClass) enhancer.create();
        proxy.doSomething();
    }
}

// ⚠️ 目标类不需要实现接口
class TargetClass {
    public void doSomething() {
        System.out.println("目标方法执行");
    }
}
```

::: tip CGLIB 原理
- 通过继承目标类，动态生成子类
- 使用 ASM 字节码框架修改字节码
- 通过 `MethodInterceptor.intercept()` 拦截方法调用
- **限制**：不能代理 final 类和方法（final 不能被继承）
:::

### 1.4 ⭐ JDK vs CGLIB 对比

| 维度 | JDK 动态代理 | CGLIB 动态代理 |
|------|-------------|----------------|
| **原理** | 基于接口，生成接口实现类 | 基于继承，生成目标类的子类 |
| **要求** | 必须有接口 | 不需要接口 |
| **限制** | 只能代理接口方法 | 不能代理 final 类/方法 |
| **性能** | 创建快，调用略慢（反射） | 创建慢（字节码处理），调用快 |
| **Spring 默认** | 有接口时用 JDK | 无接口或强制指定时用 CGLIB |

### 1.5 Spring AOP 代理选择

```java
// Spring Boot 2.x 默认使用 CGLIB 代理
// spring.aop.proxy-target-class=true（默认）

// 如果目标类实现了接口，也可以强制使用 JDK 代理
// spring.aop.proxy-target-class=false
```

---

## 二、装饰器模式

### 2.1 原理

装饰器模式在**不修改原有类**的情况下，动态给对象添加新功能。

```java
/**
 * 装饰器模式：IO 流中的经典应用
 */
// 基础组件
InputStream input = new FileInputStream("file.txt");

// 装饰一层：添加缓冲功能
InputStream buffered = new BufferedInputStream(input);

// 再装饰一层：添加数据读取功能
DataInputStream dataInput = new DataInputStream(buffered);
```

### 2.2 装饰器 vs 代理模式

| 维度 | 装饰器模式 | 代理模式 |
|------|-----------|----------|
| **目的** | 增强功能，叠加多个装饰器 | 控制访问，隐藏真实对象 |
| **关系** | 装饰器与被装饰者是同一类型 | 代理与目标实现同一接口 |
| **创建方式** | 由调用方决定装饰哪些功能 | 代理类封装在内部 |
| **典型应用** | Java IO 流 | Spring AOP、RPC 调用 |

---

## 三、适配器模式

### 3.1 原理

将一个接口转换为客户期望的另一个接口，使不兼容的接口可以一起工作。

```java
// 目标接口
interface Target { void request(); }

// 被适配的类
class Adaptee { void specificRequest() { System.out.println("适配者方法"); } }

// 对象适配器：组合 Adaptee
class ObjectAdapter implements Target {
    private Adaptee adaptee = new Adaptee();

    @Override
    public void request() {
        adaptee.specificRequest();  // 委托调用
    }
}

// 类适配器：继承 Adaptee（Java 单继承限制，不常用）
class ClassAdapter extends Adaptee implements Target {
    @Override
    public void request() {
        specificRequest();
    }
}
```

::: tip 适配器模式的应用
- `InputStreamReader` 将 `InputStream` 适配为 `Reader`
- `Arrays.asList()` 将数组适配为 `List`
- 日志框架 SLF4J 将各种日志框架适配为统一接口
:::

---

## ⭐ 面试高频问题

### Q1：JDK 动态代理和 CGLIB 的区别？

- JDK：基于接口，运行时生成实现接口的代理类，反射调用
- CGLIB：基于继承，生成目标类的子类，ASM 字节码操作
- JDK 必须有接口，CGLIB 不能代理 final 类/方法

### Q2：Spring AOP 什么时候用 JDK 代理，什么时候用 CGLIB？

- 目标类实现了接口 → 默认 JDK 代理（可配置改为 CGLIB）
- 目标类没有接口 → CGLIB
- Spring Boot 2.x 默认使用 CGLIB

### Q3：装饰器模式和代理模式有什么区别？

- 装饰器：增强功能，使用者主动叠加装饰器
- 代理：控制访问，代理类封装在内部，对使用者透明

### Q4：适配器模式在 JDK 中有哪些应用？

- `InputStreamReader`：InputStream → Reader
- `Arrays.asList()`：数组 → List
- `Collections.list()`：Enumeration → ArrayList

### Q5：JDK 动态代理生成的对象是什么类型？为什么不能代理类？

**JDK 动态代理生成的对象类型**：运行时动态生成的代理类，命名规则为 `$Proxy0`、`$Proxy1` 等，继承自 `java.lang.reflect.Proxy`。

```java
// 验证代理对象类型
Subject proxy = (Subject) Proxy.newProxyInstance(...);
System.out.println(proxy.getClass().getName());  // com.sun.proxy.$Proxy0
System.out.println(proxy instanceof Proxy);      // true
```

**为什么不能代理类**：JDK 动态代理生成的代理类已经继承了 `java.lang.reflect.Proxy`，而 Java 是单继承的，所以代理类不能再继承目标类，只能实现接口。

这就是为什么 Spring AOP 在没有接口的类上必须使用 CGLIB（通过继承目标类生成代理子类）。

**JDK 动态代理 vs CGLIB 性能对比演进**：
| 版本 | JDK 动态代理 | CGLIB |
|------|-------------|-------|
| 早期 JDK | 反射调用，性能差 | ASM 直接操作字节码，性能好 |
| JDK 7+ | 优化反射调用（`MethodHandle`、`LambdaMetafactory`） | 维持 |
| 现在 | 两者性能接近 | 两者性能接近 |

Spring Boot 2.x 默认使用 CGLIB 主要是为了统一行为，而非性能考虑。