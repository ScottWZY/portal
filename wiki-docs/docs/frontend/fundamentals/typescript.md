# TypeScript 核心

## ⭐ 面试重点速览

| 知识模块 | 重点内容 | 面试频率 |
|----------|----------|----------|
| 类型系统 | interface vs type 区别、联合类型/交叉类型、类型守卫 | 极高 |
| 泛型 | 泛型函数/类/接口、泛型约束 extends、条件类型 | 高 |
| 工具类型 | Partial/Required/Readonly/Pick/Omit/Record/Exclude/Extract/ReturnType | 极高 |
| 枚举 | 数字枚举/字符串枚举/常量枚举 const enum | 中 |
| TS 5.5+ 新特性 | 隐式类型守卫推导、isolatedDeclarations | 中 |

---

## 类型系统

### interface vs type 深度对比

```typescript
// === interface ===
interface User {
  name: string;
  age: number;
}

// 同名 interface 自动合并（Declaration Merging）
interface User {
  email: string; // 自动合并到上面的 User
}

// extends 继承
interface Admin extends User {
  role: 'admin' | 'super_admin';
}

// === type ===
type UserType = {
  name: string;
  age: number;
};

// type 不能同名重复声明
// type UserType = { ... }; // ❌ Error: Duplicate identifier

// 使用 & 交叉类型实现"继承"
type AdminType = UserType & {
  role: 'admin' | 'super_admin';
};

// type 可以定义联合类型、元组、映射类型等
type Status = 'active' | 'inactive' | 'pending'; // 联合类型
type Point = [number, number];                    // 元组
type StringMap = Record<string, string>;          // 映射类型
type StringOrNumber = string | number;            // 基本类型别名
```

| 对比维度 | `interface` | `type` |
|----------|-------------|--------|
| 声明合并 | 支持（同名自动合并） | 不支持（重复报错） |
| 扩展方式 | `extends` | `&` 交叉类型 |
| 联合类型 | 不支持 | 支持 |
| 元组类型 | 不支持（或需复杂写法） | 原生支持 |
| 基本类型别名 | 不支持 | 支持 |
| 映射类型 | 不支持 | 支持 |
| 实现（implements） | 可以被 class implements | 可以（只要类型兼容） |
| 编译后 | 不产生代码 | 不产生代码 |

::: tip 面试回答模板
"在日常开发中，我优先使用 `interface` 定义对象结构（因为可以被类实现且支持声明合并），使用 `type` 定义联合类型、元组、映射类型等 `interface` 无法表达的类型。`interface` 更适合描述"形状"，`type` 更适合"类型运算"。在需要扩展第三方库的类型时，`interface` 的声明合并是无可替代的。"
:::

### 联合类型与交叉类型

```typescript
// 联合类型 (Union)：A | B —— 满足 A 或 B 之一
type StringOrNumber = string | number;

function formatValue(value: StringOrNumber): string {
  if (typeof value === 'string') {
    return value.toUpperCase(); // 类型收窄后，value 是 string
  }
  return value.toFixed(2); // 类型收窄后，value 是 number
}

// 交叉类型 (Intersection)：A & B —— 同时满足 A 和 B
type Name = { name: string };
type Age = { age: number };
type Person = Name & Age; // { name: string; age: number }

// 联合类型的分布式条件类型（Distributive Conditional Types）
// 这是 TypeScript 高级类型体操的核心
type ToArray<T> = T extends any ? T[] : never;
type Result = ToArray<string | number>; // string[] | number[]（分布式处理）
// 如果不希望分布式，用方括号包裹：
type ToArrayNonDist<T> = [T] extends [any] ? T[] : never;
type Result2 = ToArrayNonDist<string | number>; // (string | number)[]
```

### 类型守卫

```typescript
// === 1. typeof 类型守卫 ===
function process(value: string | number) {
  if (typeof value === 'string') {
    return value.toUpperCase(); // value 被收窄为 string
  }
  return value.toFixed(2); // value 被收窄为 number
}

// === 2. instanceof 类型守卫 ===
class Dog { bark() { return 'woof'; } }
class Cat { meow() { return 'meow'; } }

function makeSound(animal: Dog | Cat) {
  if (animal instanceof Dog) {
    return animal.bark(); // animal 被收窄为 Dog
  }
  return animal.meow(); // animal 被收窄为 Cat
}

// === 3. in 操作符 ===
interface Fish { swim(): void; }
interface Bird { fly(): void; }

function move(animal: Fish | Bird) {
  if ('swim' in animal) {
    animal.swim(); // animal 被收窄为 Fish
  } else {
    animal.fly(); // animal 被收窄为 Bird
  }
}

// === 4. 自定义类型谓词 (is) ===
interface SuccessResponse {
  success: true;
  data: unknown;
}
interface ErrorResponse {
  success: false;
  error: string;
}
type ApiResponse = SuccessResponse | ErrorResponse;

// 自定义类型守卫函数 —— 返回类型为 `参数 is 类型`
function isSuccess(response: ApiResponse): response is SuccessResponse {
  return response.success === true;
}

function handleResponse(response: ApiResponse) {
  if (isSuccess(response)) {
    console.log(response.data); // response 被收窄为 SuccessResponse
  } else {
    console.log(response.error); // response 被收窄为 ErrorResponse
  }
}
```

---

## 泛型

### 泛型基础

```typescript
// 泛型函数
function identity<T>(arg: T): T {
  return arg;
}
identity<string>('hello'); // 显式指定
identity(42);              // 类型推断

// 泛型接口
interface Repository<T> {
  getById(id: string): T;
  getAll(): T[];
  create(item: T): T;
}

// 泛型类
class Stack<T> {
  private items: T[] = [];
  push(item: T) { this.items.push(item); }
  pop(): T | undefined { return this.items.pop(); }
}
```

### 泛型约束

```typescript
// extends 约束 —— 泛型必须满足特定形状
interface HasLength {
  length: number;
}

// T 必须具有 length 属性
function logLength<T extends HasLength>(arg: T): T {
  console.log(arg.length);
  return arg;
}

logLength('hello');    // OK: string 有 length
logLength([1, 2, 3]); // OK: array 有 length
logLength(123);        // Error: number 没有 length

// keyof 约束
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

// 泛型约束中使用类型参数
function copyFields<T extends U, U>(target: T, source: U): T {
  for (const key in source) {
    target[key] = source[key] as any;
  }
  return target;
}
```

### 条件类型与 infer

```typescript
// 条件类型：T extends U ? X : Y
type IsString<T> = T extends string ? true : false;
type A = IsString<string>;  // true
type B = IsString<number>;  // false

// infer 关键字 —— 在条件类型中推断类型
// 提取函数返回值类型
type MyReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

// 提取 Promise 内部类型（递归解包）
type Unwrap<T> = T extends Promise<infer U> ? Unwrap<U> : T;
type T1 = Unwrap<Promise<string>>;       // string
type T2 = Unwrap<Promise<Promise<number>>>; // number

// 提取数组元素类型
type ElementType<T> = T extends (infer U)[] ? U : never;
type T3 = ElementType<string[]>; // string

// 提取函数参数类型
type Parameters<T> = T extends (...args: infer P) => any ? P : never;
type T4 = Parameters<(a: string, b: number) => void>; // [string, number]
```

---

## 工具类型

### 常用工具类型实现原理

```typescript
// ⭐ Partial<T> —— 所有属性变为可选
type MyPartial<T> = {
  [K in keyof T]?: T[K];
};

// ⭐ Required<T> —— 所有属性变为必选（-? 移除可选修饰符）
type MyRequired<T> = {
  [K in keyof T]-?: T[K];
};

// ⭐ Readonly<T> —— 所有属性变为只读
type MyReadonly<T> = {
  readonly [K in keyof T]: T[K];
};

// ⭐ Pick<T, K> —— 从 T 中选取 K 指定的属性
type MyPick<T, K extends keyof T> = {
  [P in K]: T[P];
};

// ⭐ Omit<T, K> —— 从 T 中排除 K 指定的属性
// 核心：利用 Exclude 从 keyof T 中排除 K，再 Pick
type MyOmit<T, K extends keyof any> = MyPick<T, MyExclude<keyof T, K>>;

// ⭐ Record<K, V> —— 构造 key 为 K、value 为 V 的对象类型
type MyRecord<K extends keyof any, V> = {
  [P in K]: V;
};

// ⭐ Exclude<T, U> —— 从 T 中排除可赋值给 U 的类型
// 分布式条件类型：遍历 T 的每个成员，排除满足 extends U 的
type MyExclude<T, U> = T extends U ? never : T;
type Ex = MyExclude<'a' | 'b' | 'c', 'a'>; // 'b' | 'c'

// ⭐ Extract<T, U> —— 从 T 中提取可赋值给 U 的类型
type MyExtract<T, U> = T extends U ? T : never;

// ⭐ ReturnType<T> —— 获取函数返回值类型
type MyReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R : never;

// ⭐ NonNullable<T> —— 从 T 中排除 null 和 undefined
type MyNonNullable<T> = T extends null | undefined ? never : T;

// ⭐ Parameters<T> —— 获取函数参数类型元组
type MyParameters<T extends (...args: any) => any> = T extends (...args: infer P) => any ? P : never;

// ⭐ ConstructorParameters<T> —— 获取构造函数参数类型元组
type MyConstructorParameters<T extends abstract new (...args: any) => any> =
  T extends abstract new (...args: infer P) => any ? P : never;

// ⭐ InstanceType<T> —— 获取构造函数实例类型
type MyInstanceType<T extends abstract new (...args: any) => any> =
  T extends abstract new (...args: any) => infer R ? R : never;
```

::: tip 工具类型速查表

| 工具类型 | 作用 | 核心原理 |
|----------|------|----------|
| `Partial<T>` | 全部可选 | 映射类型 + `?` |
| `Required<T>` | 全部必选 | 映射类型 + `-?` |
| `Readonly<T>` | 全部只读 | 映射类型 + `readonly` |
| `Pick<T, K>` | 选取属性 | 映射类型 + `keyof` 约束 |
| `Omit<T, K>` | 排除属性 | `Pick` + `Exclude` |
| `Record<K, V>` | 构造对象 | 映射类型 |
| `Exclude<T, U>` | 排除类型 | 分布式条件类型 |
| `Extract<T, U>` | 提取类型 | 分布式条件类型 |
| `ReturnType<T>` | 返回值类型 | 条件类型 + `infer` |
| `NonNullable<T>` | 去 null/undefined | 条件类型 |
| `Parameters<T>` | 参数类型 | 条件类型 + `infer` |
:::

---

## 枚举

```typescript
// === 数字枚举（默认从 0 开始自增） ===
enum Direction {
  Up,    // 0
  Down,  // 1
  Left,  // 2
  Right  // 3
}

// 手动指定值
enum Status {
  Active = 1,
  Inactive = 2,
  Pending = 3
}

// === 字符串枚举（必须全部显式赋值） ===
enum Color {
  Red = 'RED',
  Green = 'GREEN',
  Blue = 'BLUE'
}

// === 常量枚举（编译时不产生代码，直接内联） ===
const enum LogLevel {
  Debug = 0,
  Info = 1,
  Warn = 2,
  Error = 3
}

// 编译后直接内联为数字
const level = LogLevel.Info; // 编译后 → const level = 1;

// === 异构枚举（不推荐） ===
enum Mixed {
  No = 0,
  Yes = 'YES'
}
```

::: warning 枚举 vs 联合类型
```typescript
// 很多场景下，字符串联合类型可以替代枚举
type Status = 'active' | 'inactive' | 'pending';

// 枚举的优势：
// 1. 可反向映射（数字枚举）—— Status[1] → 'Inactive'
// 2. 作为类型和值同时存在（可以运行时使用）
// 3. 有命名空间

// 联合类型的优势：
// 1. 更轻量，编译后不产生额外代码
// 2. 更灵活，易于扩展
// 3. 与对象字面量 as const 配合可实现类似枚举效果
const STATUS = {
  Active: 'active',
  Inactive: 'inactive',
  Pending: 'pending',
} as const;
type Status = typeof STATUS[keyof typeof STATUS]; // 'active' | 'inactive' | 'pending'
```
:::

### const enum 注意事项

```typescript
// const enum 在编译时会被完全内联，不产生运行时代码
// 这意味着：
// 1. 不能对 const enum 使用反向映射
// 2. 通过变量访问 const enum 成员时，编译可能报错

const enum Size { Small, Medium, Large }
const s = Size.Medium;     // 编译后 → const s = 1
const name = Size[1];      // Error: const enum 不支持反向映射
```

---

## TS 5.5+ 新特性

### 隐式类型守卫推导

```typescript
// TS 5.5 之前：需要显式写 is 类型谓词
function isNumberOld(value: unknown): value is number {
  return typeof value === 'number';
}

// TS 5.5+：某些场景下可自动推导类型守卫
// 当函数返回 boolean 且没有类型注解时，TS 会尝试推断类型谓词
function filterNulls<T>(arr: (T | null | undefined)[]): T[] {
  // TS 5.5 可以更智能地推断 filter 回调的类型守卫
  return arr.filter((item): item is T => item !== null && item !== undefined);
}

// 控制流分析增强：对常量索引访问的守卫
function getValue(obj: Record<string, unknown>, key: string) {
  if (key in obj) {
    // TS 5.5 可以更智能地收窄类型
    return obj[key]; // 之前可能需要类型断言
  }
}
```

### isolatedDeclarations

```typescript
// TS 5.5 引入 isolatedDeclarations 选项
// 要求每个导出必须有显式的类型注解，支持并行类型生成

// 开启 isolatedDeclarations 后，以下代码会报错：
export function add(a: number, b: number) {
  return a + b; // Error: 需要显式注解返回值类型
}

// 必须改为：
export function add(a: number, b: number): number {
  return a + b;
}

// 优势：
// 1. 支持并行类型声明生成（大幅提升大型项目构建速度）
// 2. 类型声明可独立于实现文件生成
// 3. 与 isolatedModules 配合，确保跨工具链兼容性
```

---

## ⭐ 面试高频问题汇总

### Q1：interface 和 type 的深度对比

详见 [interface vs type 深度对比](#interface-vs-type-深度对比)。

关键差异：
1. **声明合并**：interface 支持，type 不支持
2. **表达能力**：type 支持联合类型、元组、映射类型等
3. **扩展方式**：interface 用 `extends`，type 用 `&`
4. **选择策略**：描述对象形状优先 interface，类型运算优先 type

### Q2：Partial / Required / Pick / Omit 等工具类型的实现原理

核心是**映射类型**（Mapped Types）：

```typescript
// 映射类型的基本语法
type Mapped<T> = {
  [K in keyof T]: T[K]; // 遍历 T 的所有 key
};

// Partial 就是在每个 key 后加 ?
type Partial<T> = { [K in keyof T]?: T[K] };

// Required 就是用 -? 移除可选修饰符
type Required<T> = { [K in keyof T]-?: T[K] };

// Pick 就是限制 K 的范围
type Pick<T, K extends keyof T> = { [P in K]: T[P] };

// Omit = Pick + Exclude
type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;
```

### Q3：Exclude 和 Extract 的区别？

两者都是**分布式条件类型**：

- `Exclude<T, U>`：从 T 中排除可赋值给 U 的类型，即 `T extends U ? never : T`
- `Extract<T, U>`：从 T 中提取可赋值给 U 的类型，即 `T extends U ? T : never`

```typescript
type T = 'a' | 'b' | 'c' | 'd';
type E1 = Exclude<T, 'a' | 'b'>;  // 'c' | 'd'
type E2 = Extract<T, 'a' | 'b'>;  // 'a' | 'b'
```

### Q4：如何理解 TypeScript 的类型体操？

TypeScript 的类型系统是**图灵完备**的，类型体操本质上是在类型层面做计算：

1. **基础元素**：基础类型、联合类型、交叉类型、字面量类型
2. **流程控制**：条件类型（`extends ? :`）相当于 if/else
3. **变量**：泛型参数相当于函数参数，`infer` 相当于在模式匹配中声明变量
4. **循环/迭代**：分布式条件类型自动遍历联合类型，映射类型遍历对象属性
5. **递归**：条件类型可以递归调用自身

核心思想：**把类型当作值来操作，在编译期完成计算**。