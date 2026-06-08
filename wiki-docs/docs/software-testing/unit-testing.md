# 单元测试实战

## ⭐ 面试重点速览

| 知识模块 | 重点内容 | 面试频率 |
|----------|----------|----------|
| JUnit 5 核心 | 生命周期注解、@ParameterizedTest、@Nested 组织、断言体系 | 极高 |
| Mockito | @Mock/@InjectMocks 原理、when-thenReturn 与 doReturn-when 区别、Spy vs Mock | 极高 |
| 测试替身分类 | Dummy/Stub/Mock/Fake/Spy 的定义与使用场景，面试必问区分题 | 极高 |
| F.I.R.S.T 原则 | Fast/Independent/Repeatable/Self-validating/Timely 五项原则 | 高 |
| 私有方法测试 | 是否应该测试、反射策略、重构为包级可见、提取策略类 | 中高 |

---

## 一、JUnit 5 核心体系

JUnit 5 由三个子项目组成：**JUnit Platform**（运行引擎）、**JUnit Jupiter**（编程模型 + 扩展）、**JUnit Vintage**（兼容 JUnit 3/4）。

### 1.1 生命周期与执行顺序

```java
import org.junit.jupiter.api.*;

class UserServiceTest {

    // === 类级别（静态方法）===
    @BeforeAll
    static void initAll() {
        // 整个测试类执行前运行一次，适合初始化数据库连接池等重量级资源
    }

    @AfterAll
    static void tearDownAll() {
        // 整个测试类执行后运行一次
    }

    // === 方法级别 ===
    @BeforeEach
    void init() {
        // 每个 @Test 方法执行前运行，适合初始化测试数据
    }

    @AfterEach
    void tearDown() {
        // 每个 @Test 方法执行后运行
    }

    @Test
    void shouldCreateUser() {
        User user = new User("张三");
        assertNotNull(user);
        assertEquals("张三", user.getName());
    }
}
```

::: tip @BeforeAll 与 @BeforeEach 的选择
- **@BeforeAll**：适合连接池、嵌入式服务器、Spring 容器等启动成本高的资源
- **@BeforeEach**：适合每个测试需要独立状态的场景，确保测试隔离性
- 面试关键点：@BeforeAll 必须是 `static` 方法（除非使用 `@TestInstance(TestInstance.Lifecycle.PER_CLASS)`），@BeforeEach 则不需要
:::

### 1.2 @Nested 内嵌类组织测试

当测试场景复杂时，用 @Nested 按场景分层组织，提高可读性和可维护性：

```java
@DisplayName("订单服务 - 折扣计算")
class OrderDiscountTest {

    @Nested
    @DisplayName("普通会员")
    class RegularMember {
        @Test
        void 满200减10() {
            Order order = new Order(200, MemberLevel.REGULAR);
            assertEquals(190, orderService.calculateTotal(order));
        }

        @Test
        void 不满200原价() {
            Order order = new Order(199, MemberLevel.REGULAR);
            assertEquals(199, orderService.calculateTotal(order));
        }
    }

    @Nested
    @DisplayName("VIP会员")
    class VipMember {
        @Test
        void 满100打8折() {
            Order order = new Order(100, MemberLevel.VIP);
            assertEquals(80, orderService.calculateTotal(order));
        }
    }
}
```

### 1.3 @ParameterizedTest 参数化测试

避免相似用例的代码重复：

```java
@ParameterizedTest
@CsvSource({
    "200, REGULAR, 190",
    "199, REGULAR, 199",
    "100, VIP,     80",
    "100, SVIP,    70"
})
void 不同会员等级折扣计算(int amount, MemberLevel level, int expected) {
    Order order = new Order(amount, level);
    assertEquals(expected, orderService.calculateTotal(order));
}
```

::: tip 常用参数源注解
- `@ValueSource`：简单值列表
- `@CsvSource`：CSV 格式多列数据
- `@MethodSource`：从静态工厂方法获取参数
- `@EnumSource`：遍历枚举值
:::

---

## 二、Mockito 核心机制

### 2.1 @Mock 与 @InjectMocks

```java
@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private PaymentGateway paymentGateway;  // 创建 mock 对象

    @Mock
    private InventoryService inventoryService;

    @InjectMocks
    private OrderService orderService;      // 将 mock 注入到被测对象

    @Test
    void 下单成功_库存充足() {
        // 编排（Arrange）：定义 mock 行为
        when(inventoryService.checkStock("SKU001", 5)).thenReturn(true);
        when(paymentGateway.charge(anyString(), eq(new BigDecimal("100.00"))))
            .thenReturn(new PaymentResult("TX001", true));

        // 执行（Act）
        OrderResult result = orderService.placeOrder("SKU001", 5);

        // 验证（Assert）
        assertTrue(result.isSuccess());
        verify(inventoryService).deduct("SKU001", 5);   // 验证方法被调用
        verify(paymentGateway).charge(anyString(), eq(new BigDecimal("100.00")));
    }
}
```

### 2.2 when-thenReturn 与 doReturn-when 的本质区别

这是 Mockito 面试必考题：

| 对比维度 | `when().thenReturn()` | `doReturn().when()` |
|----------|----------------------|---------------------|
| 调用真实方法 | 会调用 mock 对象的真实方法（如果存在） | **不调用**真实方法 |
| 适用场景 | 普通 mock 对象 | Spy 对象、void 方法 |
| 类型安全 | 编译时检查返回类型 | 运行时检查 |

```java
// 场景：Spy 对象——必须用 doReturn().when()
@Spy
private OrderService orderService;

@Test
void spy对象必须用doReturn() {
    // ❌ 错误：when().thenReturn() 会先调用 orderService.calculate() 的真实方法
    // when(orderService.calculate()).thenReturn(100);

    // ✅ 正确：不触发真实方法调用
    doReturn(100).when(orderService).calculate();
}
```

### 2.3 ArgumentCaptor 捕获参数验证

```java
@Test
void 验证发送给MQ的消息体内容() {
    orderService.placeOrder("SKU001", 5);

    ArgumentCaptor<OrderMessage> captor = ArgumentCaptor.forClass(OrderMessage.class);
    verify(mqProducer).send(captor.capture());

    OrderMessage msg = captor.getValue();
    assertEquals("SKU001", msg.getSkuCode());
    assertEquals(5, msg.getQuantity());
}
```

---

## 三、测试替身（Test Double）全景

::: danger 面试高频区分题
面试官经常会问："Mock 和 Stub 有什么区别？"这个问题能有效区分候选人是否真正理解测试替身的概念。
:::

| 替身类型 | 定义 | 关注点 | 典型场景 |
|----------|------|--------|----------|
| **Dummy** | 仅用于填充参数，从不被实际调用 | 不关心 | `new Order(dummyUser, items)` |
| **Stub** | 返回预设值，不关心是否被调用 | 输入（提供数据） | `when(repo.findById(1L)).thenReturn(user)` |
| **Mock** | 验证是否按预期被调用（参数、次数、顺序） | 输出（验证交互） | `verify(emailService).send(any())` |
| **Fake** | 有真实实现但不可用于生产 | 行为模拟 | 内存数据库 H2 代替 MySQL |
| **Spy** | 部分 mock，默认走真实方法，可针对性覆写 | 混合 | 想 mock 某个方法但保留其他方法的真实行为 |

```java
// Mock 示例：关注交互验证
@Test
void mock验证删除操作() {
    userService.deleteUser(1L);
    // 核心：验证 deleteById(1L) 是否被精确调用一次
    verify(userRepository).deleteById(1L);
}

// Stub 示例：关注返回值
@Test
void stub提供预设数据() {
    // 核心：只关心"查询时返回什么"，不关心是否被调用
    when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
    User user = userService.getUser(1L);
    assertEquals("张三", user.getName());
}

// Fake 示例：完整但不可用于生产
class FakeUserRepository implements UserRepository {
    private Map<Long, User> storage = new HashMap<>();

    @Override
    public Optional<User> findById(Long id) {
        return Optional.ofNullable(storage.get(id));
    }

    @Override
    public void save(User user) {
        storage.put(user.getId(), user);
    }
}
```

::: tip 记忆口诀
- **Stub 管输入**（你要什么我给你什么）
- **Mock 管输出**（我关心你怎么调用我）
- **Fake 管行为**（我有完整实现但不能上线）
:::

---

## 四、F.I.R.S.T 原则

Robert C. Martin 提出的单元测试五项原则：

| 原则 | 含义 | 反例 |
|------|------|------|
| **F**ast | 测试运行要快 | 测试中 sleep(5000) 或真实网络请求 |
| **I**ndependent | 测试之间互不依赖 | 测试 B 依赖测试 A 的执行结果 |
| **R**epeatable | 任何时候任何环境可重复运行 | 依赖当前日期 `LocalDate.now()` |
| **S**elf-validating | 测试自己验证结果，不需要人工判断 | 只打印日志不写断言 |
| **T**imely | 测试代码与产品代码同步编写（TDD） | 上线两周后再补测试 |

```java
// 违反 Repeatable 原则的典型错误
@Test
void 违规_依赖当前日期() {
    // ❌ 今天能通过，明天就失败
    assertTrue(orderService.isToday(new Date()));
}

// 正确做法：注入时间源
@Test
void 正确_使用固定时间() {
    Clock fixedClock = Clock.fixed(
        Instant.parse("2025-06-08T10:00:00Z"), ZoneId.of("Asia/Shanghai"));
    orderService.setClock(fixedClock);
    assertTrue(orderService.isToday(
        Date.from(fixedClock.instant())));
}
```

---

## 五、私有方法测试策略

::: warning 争议话题
这是单元测试领域最具争议的话题之一。支持方认为"只要是代码就应该测试"，反对方认为"私有方法是实现细节，不应直接测试"。
:::

### 5.1 推荐策略：间接测试

私有方法应通过公有方法的测试间接覆盖。如果无法通过公有方法覆盖到，说明私有方法可能是"死代码"或逻辑过于复杂需要重构。

### 5.2 重构优先于测试

如果私有方法逻辑复杂到需要独立测试，通常意味着它应该被提取为独立的类：

```java
// 重构前：复杂的私有方法
class OrderService {
    private BigDecimal calculateDiscount(Order order) {
        // 50 行复杂的折扣计算逻辑
    }
}

// 重构后：提取为策略类，可独立测试
class DiscountCalculator {
    public BigDecimal calculate(Order order) {
        // 同上，但现在可以独立测试了
    }
}

class OrderService {
    private DiscountCalculator discountCalculator; // 构造注入

    public BigDecimal getTotal(Order order) {
        // 委托给 DiscountCalculator，测试时注入 mock
        return discountCalculator.calculate(order);
    }
}
```

### 5.3 不得已时的反射方案

对于遗留代码中确实无法重构的私有方法：

```java
@Test
void 遗留代码私有方法测试_反射方案() throws Exception {
    LegacyService service = new LegacyService();

    Method privateMethod = LegacyService.class
        .getDeclaredMethod("complexAlgorithm", String.class, int.class);
    privateMethod.setAccessible(true);

    Object result = privateMethod.invoke(service, "input", 42);
    assertEquals("expected", result);
}
```

::: danger 反射测试的反模式警示
- 破坏了封装性，测试与实现细节耦合
- 重构私有方法名会导致测试编译不通过（反射的方式会运行时失败，更难排查）
- **始终优先考虑重构**，反射只应作为迁移期的临时手段
:::

---

## 面试高频题

**Q1：JUnit 5 和 JUnit 4 的主要区别？**

**标准答案**：(1) 架构变化：JUnit 5 拆分为 Platform + Jupiter + Vintage 三个模块；(2) 注解包名变更：`org.junit.Test` 变为 `org.junit.jupiter.api.Test`；(3) @Before/@After 改为 @BeforeEach/@AfterEach，@BeforeClass/@AfterClass 改为 @BeforeAll/@AfterAll；(4) 新增 @DisplayName、@Nested、@ParameterizedTest 等注解；(5) @RunWith 改为 @ExtendWith；(6) 断言方法参数顺序变为参数在前、期望值在后；(7) @Test 注解不再需要 public 修饰符。

**Q2：Mock 和 Spy 的区别？何时使用 Spy？**

**标准答案**：Mock 是完全虚拟的对象，所有方法默认返回默认值，不执行真实逻辑。Spy 是部分 mock 的对象，默认走真实方法，只有被显式 stub 的方法才返回预设值。使用 Spy 的场景：(1) 想 mock 对象的部分方法同时保留其他方法的真实行为；(2) 对遗留代码做测试，不想大规模重构；(3) 需要验证真实方法是否被调用。需注意：Spy 使用 `doReturn().when()` 而非 `when().thenReturn()`，以避免触发真实方法调用。

**Q3：F.I.R.S.T 原则中 R（Repeatable）为什么重要？**

**标准答案**：Repeatable 要求测试在任何时间、任何环境都能重复执行并得到一致结果。违反 Repeatable 的典型场景包括：依赖系统时间（`LocalDate.now()`）、依赖外部服务状态、依赖数据库中的现有数据。解决方案是通过依赖注入引入可控制的时间源（Clock）、使用测试替身替换外部依赖、在 @BeforeEach 中初始化确定性的测试数据。Repeatable 是 CI/CD 流水线稳定性的基石——一个今天通过明天失败的测试会严重降低团队对测试的信任度。

**Q4：@InjectMocks 的注入策略是什么？**

**标准答案**：@InjectMocks 按以下优先级注入：构造器注入 > Setter 注入 > 字段注入。它会在测试类中查找所有 @Mock 和 @Spy 注解的对象，按类型匹配注入到 @InjectMocks 对象中。需要注意：(1) Spring 的 @Autowired 和 @Mock 注解不应混用；(2) 如果有多个同类型的 @Mock，需配合 @Mock 的 name 属性或 @Qualifier 注解区分；(3) @InjectMocks 不能与 @Autowired 同时使用，因为前者创建的是纯 Mockito 管理的对象，后者是 Spring 管理的 Bean。

**Q5：什么时候应该 mock，什么时候不应该 mock？**

**标准答案**：应该 mock 的场景：(1) 外部系统调用（数据库、MQ、第三方 API）；(2) 执行缓慢的操作（文件 IO、网络请求）；(3) 具有不可控副作用的操作（发邮件、发短信）；(4) 尚未实现或难以构建状态的依赖。不应该 mock 的场景：(1) 值对象（VO、DTO、Entity）；(2) 被测类自身的方法；(3) JDK 核心类（String、List）；(4) 简单的 POJO 工具类。核心判断标准：mock 的对象应该是 **依赖**（depended-on components），而不是 **数据**（data）。

**Q6：@DataJpaTest 和 @SpringBootTest 在测试中有什么区别？**

**标准答案**：@DataJpaTest 是切片测试（slice test），只加载 JPA 相关组件（EntityManager、DataSource、Repository），不加载完整的 Spring 上下文。它默认使用嵌入式内存数据库（H2），事务默认回滚，启动速度快。@SpringBootTest 加载完整的 Spring 应用上下文，启动速度慢，适合端到端集成测试。对于 Repository 层的测试，应优先使用 @DataJpaTest，它更轻量、更快，符合测试金字塔的原则。