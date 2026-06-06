# 创建型模式

## ⭐ 面试重点速览

| 知识模块 | 重点内容 | 面试频率 |
|----------|----------|----------|
| 单例模式 | 五种写法、DCL 为什么需要 volatile | 极高 |
| 工厂模式 | 简单工厂/工厂方法/抽象工厂区别 | 高 |
| 建造者模式 | Builder 链式调用 | 中 |
| 原型模式 | 浅克隆 vs 深克隆 | 中 |

---

## ⭐ 一、单例模式

### 1.1 五种写法

#### ① 饿汉式

```java
// 饿汉式：类加载时初始化（线程安全，但可能浪费内存）
public class EagerSingleton {
    private static final EagerSingleton INSTANCE = new EagerSingleton();

    private EagerSingleton() {}

    public static EagerSingleton getInstance() {
        return INSTANCE;
    }
}
```

#### ② 懒汉式（线程不安全）

```java
// ❌ 懒汉式（线程不安全）：多线程可能创建多个实例
public class LazySingleton {
    private static LazySingleton instance;

    private LazySingleton() {}

    public static LazySingleton getInstance() {
        if (instance == null) {
            instance = new LazySingleton();
        }
        return instance;
    }
}
```

#### ③ ⭐ 双重检查锁定（DCL）

```java
/**
 * ⭐ DCL（Double-Checked Locking）：面试重点
 * 必须加 volatile 防止指令重排序！
 */
public class DCLSingleton {
    // ⭐ volatile 是关键：防止指令重排序
    private static volatile DCLSingleton instance;

    private DCLSingleton() {}

    public static DCLSingleton getInstance() {
        if (instance == null) {                    // 第一次检查
            synchronized (DCLSingleton.class) {
                if (instance == null) {            // 第二次检查
                    instance = new DCLSingleton();
                }
            }
        }
        return instance;
    }
}
```

::: danger 为什么 DCL 需要 volatile？
`new DCLSingleton()` 不是原子操作，分为三步：
1. 分配内存空间
2. 初始化对象
3. 将 instance 指向内存地址

JVM 可能会**指令重排序**：1 → 3 → 2。如果线程 A 执行到 3（instance 非 null 但未初始化），线程 B 在第一次检查时发现 instance 非 null，直接返回一个**未初始化完成的对象**，导致 NPE 或逻辑错误。

`volatile` 禁止指令重排序，保证 `instance` 完全初始化后才被其他线程看到。
:::

#### ④ 静态内部类（推荐）

```java
/**
 * ⭐ 静态内部类：利用 JVM 类加载机制保证线程安全，延迟加载
 */
public class InnerClassSingleton {
    private InnerClassSingleton() {}

    private static class Holder {
        // 静态内部类在第一次被引用时才加载
        private static final InnerClassSingleton INSTANCE = new InnerClassSingleton();
    }

    public static InnerClassSingleton getInstance() {
        return Holder.INSTANCE;
    }
}
```

#### ⑤ ⭐ 枚举（最推荐）

```java
/**
 * ⭐ 枚举单例：天生线程安全，防止反射和序列化破坏
 */
public enum EnumSingleton {
    INSTANCE;

    public void doSomething() {
        // 业务方法
    }
}

// 使用
EnumSingleton.INSTANCE.doSomething();
```

### 1.2 单例的破坏与防御

```java
// 1. 反射破坏单例
Constructor<DCLSingleton> constructor = DCLSingleton.class.getDeclaredConstructor();
constructor.setAccessible(true);
DCLSingleton instance2 = constructor.newInstance();  // 新的实例！

// 防御：在构造函数中判断
private DCLSingleton() {
    if (instance != null) {
        throw new RuntimeException("单例已存在，不允许反射创建");
    }
}

// 2. 序列化破坏单例
ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream("obj"));
oos.writeObject(instance);
ObjectInputStream ois = new ObjectInputStream(new FileInputStream("obj"));
DCLSingleton instance2 = (DCLSingleton) ois.readObject();  // 新的实例！

// 防御：添加 readResolve 方法
private Object readResolve() {
    return instance;
}
```

::: tip 枚举单例为什么是最佳实践？
- 天生线程安全（JVM 保证）
- 防止反射攻击（`Constructor.newInstance()` 会抛异常）
- 防止序列化破坏（序列化后仍是同一个实例）
- 代码简洁
:::

### 1.3 五种写法对比

| 写法 | 线程安全 | 延迟加载 | 防反射 | 防序列化 | 推荐度 |
|------|----------|----------|--------|----------|--------|
| 饿汉式 | ✅ | ❌ | ❌ | ❌ | ⭐⭐ |
| 懒汉式 | ❌ | ✅ | ❌ | ❌ | ⭐ |
| DCL + volatile | ✅ | ✅ | ❌ | ❌ | ⭐⭐⭐ |
| 静态内部类 | ✅ | ✅ | ❌ | ❌ | ⭐⭐⭐⭐ |
| 枚举 | ✅ | ✅ | ✅ | ✅ | ⭐⭐⭐⭐⭐ |

---

## 二、工厂模式

### 2.1 简单工厂

```java
// 简单工厂：一个工厂类，根据参数创建不同产品
public class SimpleFactory {
    public static Product create(String type) {
        if ("A".equals(type)) return new ProductA();
        if ("B".equals(type)) return new ProductB();
        throw new IllegalArgumentException("未知类型");
    }
}
```

### 2.2 工厂方法

```java
// 工厂方法：每个产品有对应的工厂，子类决定创建哪个产品
interface Factory { Product create(); }
class FactoryA implements Factory { public Product create() { return new ProductA(); } }
class FactoryB implements Factory { public Product create() { return new ProductB(); } }
```

### 2.3 抽象工厂

```java
// 抽象工厂：创建一族相关产品（如不同主题的 UI 组件）
interface UIFactory { Button createButton(); TextField createTextField(); }
class WindowsFactory implements UIFactory { /* 创建 Windows 风格组件 */ }
class MacFactory implements UIFactory { /* 创建 Mac 风格组件 */ }
```

| 类型 | 核心 | 适用场景 |
|------|------|----------|
| 简单工厂 | 一个工厂生产所有产品 | 产品类型少，不频繁扩展 |
| 工厂方法 | 每个产品一个工厂 | 产品类型会扩展 |
| 抽象工厂 | 创建相关产品族 | 需要创建一组关联对象 |

---

## 三、建造者模式（Builder）

```java
/**
 * ⭐ 建造者模式：链式调用构建复杂对象
 */
public class Computer {
    private String cpu;
    private String memory;
    private String disk;

    private Computer(Builder builder) {
        this.cpu = builder.cpu;
        this.memory = builder.memory;
        this.disk = builder.disk;
    }

    public static class Builder {
        private String cpu;
        private String memory;
        private String disk;

        public Builder cpu(String cpu) { this.cpu = cpu; return this; }
        public Builder memory(String memory) { this.memory = memory; return this; }
        public Builder disk(String disk) { this.disk = disk; return this; }

        public Computer build() { return new Computer(this); }
    }
}

// 使用
Computer pc = new Computer.Builder()
    .cpu("i7")
    .memory("16G")
    .disk("1T")
    .build();
```

::: tip lombok @Builder 注解
实际开发中可使用 lombok 的 `@Builder` 注解自动生成建造者模式代码。
:::

---

## 四、原型模式

```java
/**
 * 原型模式：通过克隆创建对象，避免重复初始化
 */
public class Prototype implements Cloneable {
    private String name;

    @Override
    public Prototype clone() {
        try {
            return (Prototype) super.clone();  // 浅克隆
        } catch (CloneNotSupportedException e) {
            throw new RuntimeException(e);
        }
    }
}
```

::: warning 浅克隆 vs 深克隆
- 浅克隆：基本类型复制值，引用类型复制引用（指向同一个对象）
- 深克隆：所有引用类型也递归克隆（完全独立的副本）
:::

---

## ⭐ 面试高频问题

### Q1：单例模式有哪几种写法？优缺点？

五种写法：饿汉式、懒汉式、DCL+volatile、静态内部类、枚举。推荐枚举或静态内部类。

### Q2：DCL 为什么需要 volatile？

防止指令重排序。`new` 操作不是原子操作，可能先分配内存再初始化。volatile 禁止重排序，保证对象完全初始化后才被其他线程可见。

### Q3：简单工厂、工厂方法、抽象工厂的区别？

- 简单工厂：一个工厂，根据参数创建不同产品
- 工厂方法：为每个产品创建对应工厂，子类决定创建哪个产品
- 抽象工厂：创建一组相关产品族

### Q4：枚举单例有什么好处？

线程安全、防反射、防序列化破坏、代码简洁。

### Q5：建造者模式（Builder）和工厂模式有什么区别？什么时候用建造者？

| 维度 | 工厂模式 | 建造者模式 |
|------|----------|------------|
| **关注点** | 创建对象（创建什么） | 组装对象（怎么创建） |
| **参数数量** | 参数少，构造函数简单 | 参数多，构造函数复杂 |
| **创建过程** | 一步创建 | 分步创建，链式调用 |
| **对象属性** | 属性之间无依赖 | 属性之间可能有约束关系 |
| **返回** | 直接返回产品 | 最后调用 build() 返回 |

**使用建造者模式的场景**：
1. 构造函数参数超过 4 个，且很多可选参数
2. 对象创建过程复杂，需要分步设置
3. 需要生成不同表示的对象（如不同配置的电脑）

```java
// ❌ 构造函数参数太多，容易搞混
new User("张三", 25, "北京", "13800138000", "zhangsan@email.com", true, 5000);

// ✅ 建造者模式，清晰明了
User.builder()
    .name("张三")
    .age(25)
    .city("北京")
    .build();
```

**建造者模式 vs 工厂模式的选择**：
- 参数少、类型固定 → 工厂模式
- 参数多、可选参数多 → 建造者模式