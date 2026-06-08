# 软件测试

> 测试是工程素养的体现，高级工程师需要掌握从单元测试到契约测试的完整测试策略。本模块系统化覆盖测试金字塔、JUnit/Mockito/TestContainers、TDD、契约测试。

## ⭐ 面试重点速览

| 考察点 | 重要程度 | 面试频率 | 掌握目标 |
|--------|----------|----------|----------|
| 测试金字塔 | ⭐⭐⭐ | 高 | 说出各层含义、比例、优缺点 |
| Mock vs Stub vs Fake | ⭐⭐⭐ | 极高 | 区分四种测试替身的使用场景 |
| TDD vs 传统测试 | ⭐⭐ | 高 | TDD红-绿-重构流程、优缺点 |
| 契约测试 | ⭐⭐ | 中 | 消费者驱动契约解决了什么问题 |
| 单元测试 F.I.R.S.T 原则 | ⭐⭐⭐ | 高 | 能解释每条原则 |

## 模块导航

- [测试基础总览](./) — 测试金字塔、测试策略、覆盖率、质量保障
- [单元测试](./unit-testing) — JUnit 5、Mockito、测试替身、F.I.R.S.T
- [集成测试](./integration-testing) — Spring Boot Test、TestContainers、数据库测试
- [TDD 与 BDD](./tdd) — 红-绿-重构、BDD Gherkin 语法
- [契约测试](./contract-testing) — 消费者驱动契约、Pact、API 兼容性

## 与现有模块的关系

- [Spring Boot](../spring-ecosystem/spring-boot/) — Spring Boot Test 集成测试示例
- [高并发性能测试](../high-concurrency/performance-testing/) — 性能测试工具链