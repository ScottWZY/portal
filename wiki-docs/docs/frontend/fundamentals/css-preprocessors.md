# CSS 预处理器

## ⭐ 面试重点速览

| 知识模块 | 重点内容 | 面试频率 |
|----------|----------|----------|
| Sass 变量与嵌套 | `$` 变量、`&` 父选择器引用、嵌套规则 | 中高 |
| Mixin 与继承 | `@mixin`/`@include`、`@extend`、占位符 `%` | 中高 |
| 内置函数 | `darken`/`lighten`、颜色函数、数学函数 | 中 |
| Less vs Sass | 语法差异、编译方式、生态对比 | 中 |
| 与原生 CSS 对比 | CSS 变量、CSS Nesting、`@layer` | 中高（趋势） |

---

## 一、为什么需要 CSS 预处理器

原生 CSS 在大型项目中存在几个核心痛点：

| 痛点 | 原生 CSS | 预处理器解决方案 |
|------|----------|-----------------|
| 无变量 | 相同颜色/字号到处重复 | `$primary-color` 统一定义 |
| 无嵌套 | 选择器层级深，重复书写父选择器 | `.parent { .child { } }` 嵌套语法 |
| 无函数 | 颜色变体需手动计算 | `darken($color, 10%)` 内置函数 |
| 无模块化 | 所有样式在全局作用域 | `@use` / `@import` 拆分文件 |

CSS 预处理器本质上是 **CSS 的超集**，通过编译生成标准 CSS，让开发者用更工程化的方式编写样式。

---

## 二、Sass（SCSS）核心特性

SCSS 是 Sass 3 引入的新语法，完全兼容 CSS 语法，是当前最主流的选择。

### 2.1 变量

```scss
// 变量定义
$primary-color: #409eff;
$border-radius: 4px;
$font-stack: 'Helvetica Neue', sans-serif;

// 使用变量
.button {
  background: $primary-color;
  border-radius: $border-radius;
  font-family: $font-stack;
}
```

**变量作用域**：`{}` 内定义的变量为局部变量，全局变量需在顶层定义。可使用 `!global` 标志强制提升为全局：

```scss
.content {
  $width: 100px !global; // 强制全局
}
```

### 2.2 嵌套

```scss
// 选择器嵌套
.nav {
  background: #333;
  // & 引用父选择器
  &:hover { background: #555; }
  // 子选择器
  &-item {
    padding: 10px;
    &--active { color: $primary-color; }  // BEM 命名
  }
}

// 属性嵌套
.box {
  font: {
    size: 14px;
    weight: bold;
  }
}
```

编译后：

```css
.nav { background: #333; }
.nav:hover { background: #555; }
.nav-item { padding: 10px; }
.nav-item--active { color: #409eff; }
.box { font-size: 14px; font-weight: bold; }
```

### 2.3 Mixin（混入）

```scss
// 定义 Mixin（可传参，带默认值）
@mixin flex-center($direction: row, $gap: 0) {
  display: flex;
  flex-direction: $direction;
  justify-content: center;
  align-items: center;
  gap: $gap;
}

// 使用 Mixin
.container {
  @include flex-center(column, 16px);
}

// 可变参数
@mixin box-shadow($shadows...) {
  box-shadow: $shadows;
}
.card {
  @include box-shadow(0 2px 4px rgba(0,0,0,.1), 0 4px 8px rgba(0,0,0,.05));
}
```

### 2.4 继承（@extend）

```scss
// 占位符选择器（不会生成 CSS，仅用于继承）
%message-shared {
  padding: 10px;
  border: 1px solid;
  border-radius: 4px;
}

.success { @extend %message-shared; border-color: green; }
.error   { @extend %message-shared; border-color: red; }
```

编译后使用群组选择器，避免重复代码：

```css
.success, .error { padding: 10px; border: 1px solid; border-radius: 4px; }
.success { border-color: green; }
.error { border-color: red; }
```

**@mixin vs @extend 对比：**

| 维度 | @mixin | @extend |
|------|--------|---------|
| 参数 | 支持参数和默认值 | 不支持 |
| CSS 输出 | 每次调用复制一份代码 | 群组选择器合并，更紧凑 |
| 适用场景 | 需要参数/动态值 | 静态样式复用 |
| 选择器顺序 | 不影响 | 会影响选择器顺序（可能造成特异性问题） |

::: tip 建议
优先使用 `@mixin`（灵活、可控），只在明确需要合并选择器时使用 `@extend`。
:::

### 2.5 内置函数

```scss
// 颜色函数
$base: #409eff;
.button {
  background: $base;
  &:hover { background: darken($base, 10%); }   // 变暗 10%
  &:active { background: lighten($base, 10%); }  // 变亮 10%
}
// 数学函数
.sidebar  { width: percentage(1/3); }  // 33.3333%
.item     { width: round(100px / 3); } // 33px

// 字符串函数
.icon::after {
  content: to-upper-case("hello");     // "HELLO"
}
```

### 2.6 模块化：@use vs @import

```scss
// _variables.scss（下划线开头 = 部分文件，不会被单独编译）
$primary: #409eff;
$sidebar-width: 240px;

// _mixins.scss
@mixin ellipsis { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

// main.scss — 使用 @use（推荐）
@use 'variables' as vars;    // 命名空间
@use 'mixins';

.sidebar {
  width: vars.$sidebar-width;  // 通过命名空间访问
  @include mixins.ellipsis;
}
```

::: warning 注意
**`@use` 替代 `@import`**：`@import` 会使所有变量/函数/Mixin 全局可用，容易产生命名冲突；`@use` 通过命名空间隔离，是 Sass 官方推荐方式。Dart Sass 2.0 将移除 `@import`。
:::

### 2.7 流程控制

```scss
// @if / @else
@mixin theme($mode) {
  @if $mode == 'dark' {
    background: #333; color: #fff;
  } @else if $mode == 'light' {
    background: #fff; color: #333;
  }
}

// @for 循环
@for $i from 1 through 5 {
  .col-#{$i} { width: 20% * $i; }
}

// @each 遍历
$sizes: (small: 12px, medium: 16px, large: 20px);
@each $name, $size in $sizes {
  .text-#{$name} { font-size: $size; }
}

// @while 循环
$i: 1;
@while $i < 4 {
  .item-#{$i} { z-index: $i; }
  $i: $i + 1;
}
```

---

## 三、Less 核心特性

Less 在语法上更接近原生 CSS，学习成本更低。

### 3.1 变量

```less
// Less 用 @ 定义变量
@primary-color: #409eff;
@border-radius: 4px;

.button {
  background: @primary-color;
  border-radius: @border-radius;
}
```

**延迟加载特性**：Less 变量可以在定义前使用，最终值由最后一次定义决定（作用域提升）。这是 Less 与 Sass 的重要区别。

### 3.2 嵌套与 Mixin

```less
// 嵌套（与 Sass 语法一致）
.nav {
  background: #333;
  &:hover { background: #555; }
}

// Mixin（Less 中 Mixin 本质上就是类选择器）
.flex-center() {  // 加 () 表示不输出到 CSS
  display: flex;
  justify-content: center;
  align-items: center;
}
.container {
  .flex-center();  // 调用 Mixin
}
```

### 3.3 Less 独有特性

```less
// 变量插值 — 选择器和属性名中使用变量
@selector: banner;
.@{selector} { font-weight: bold; }

// 变量插值在 URL 中
@base-url: "../assets";
.logo { background: url("@{base-url}/logo.png"); }
```

---

## 四、Sass vs Less 对比

| 维度 | Sass（SCSS） | Less |
|------|-------------|------|
| 变量语法 | `$variable` | `@variable` |
| 编译方式 | Dart Sass（官方）/ node-sass | Less.js（JavaScript） |
| 条件/循环 | `@if/@else`、`@for`、`@each`、`@while` | `when` 守卫（功能较弱） |
| 内置函数 | 丰富（颜色/数学/字符串/列表/Map） | 较少 |
| 模块化 | `@use` + 命名空间 | `@import`（全局） |
| 社区生态 | 更活跃（Bootstrap 5 使用 Sass） | 较平静（Ant Design 早期使用 Less） |
| 学习曲线 | 稍高 | 较低 |

**选型建议：** 新项目推荐 **Sass（SCSS）**，功能更强大、生态更活跃；如果团队已有 Less 项目或需要极低学习成本，Less 仍是合理选择。

---

## 五、预处理器 vs 原生 CSS 新特性

随着 CSS 标准的发展，原生 CSS 正在逐步"追赶"预处理器的功能：

| 功能 | 预处理器 | 原生 CSS |
|------|---------|---------|
| 变量 | `$var`（编译时） | `--var`（运行时，可被 JS 动态修改） |
| 嵌套 | Sass/Less 嵌套 | CSS Nesting（Chrome 120+，写法略有差异） |
| 颜色函数 | `darken()`/`lighten()` | `color-mix()`、`hsl()` 运算 |
| 模块化 | `@use` | `@import`（原生支持，但不推荐） |

```css
/* 原生 CSS 变量 — 运行时动态 */
:root {
  --primary-color: #409eff;
}
.button {
  background: var(--primary-color);
}
/* JavaScript 可动态修改：*/
/* document.documentElement.style.setProperty('--primary-color', '#e74c3c'); */
```

```css
/* CSS Nesting（原生嵌套） */
.card {
  background: #fff;
  & .title { font-size: 18px; }  /* 注意：需要 & 前缀 */
  @media (width > 768px) { padding: 20px; }
}
```

::: tip 关键区别
**Sass 变量是编译时的**（编译后替换为字面值），**CSS 变量是运行时的**（浏览器解析，支持 JS 动态修改）。CSS 变量适合需要动态切换的主题（如黑暗模式），Sass 变量适合编译时确定的常量。
:::

**未来趋势：** 原生 CSS 的能力在快速增长，但预处理器的**函数、Mixin、循环、模块化**等高级特性短期内仍无法被替代。在实际项目中，两者通常配合使用。

---

## 六、面试高频问题

### Q1: Sass 的 @mixin 和 @extend 有什么区别？

**@mixin**：将样式代码复制到每个调用处，支持参数，灵活性高，但可能产生重复 CSS。
**@extend**：将多个选择器合并为群组选择器，输出更紧凑，但不支持参数，且可能影响选择器顺序导致特异性问题。

实际开发中**优先使用 @mixin**，只在确定的静态样式复用场景使用 @extend。

### Q2: Sass 变量和 CSS 自定义属性的区别？

| | Sass 变量 | CSS 自定义属性 |
|---|---|---|
| 处理时机 | 编译时（替换为字面值） | 运行时（浏览器解析） |
| 动态修改 | 不支持 | 支持（JS 修改） |
| 作用域 | 选择器块级 | DOM 层级（继承） |
| 适用场景 | 编译时确定的常量 | 主题切换、动态样式 |

### Q3: @use 和 @import 的区别？

- **@import**：全局导入，所有变量/Mixin 全局可用，容易命名冲突，Sass 2.0 将移除
- **@use**：命名空间隔离，需要通过 `命名空间.变量` 访问，避免冲突，支持私有成员（`$-` 或 `$_` 前缀）

### Q4: Less 和 Sass 选哪个？为什么？

**推荐 Sass（SCSS）**：功能更全面（条件循环、内置函数）、生态更活跃（Bootstrap 5 等主流库使用）、`@use` 模块化体系更成熟。

如果团队已有 Less 项目或需要极低学习成本，Less 仍可行。

::: danger 容易翻车的点
- 分不清 `@mixin` 和 `@extend` 的使用场景，面试中答反
- 不知道 Sass 变量是编译时，CSS 变量是运行时
- 还在用 `@import` 而不是 `@use`（Sass 2.0 将移除 @import）
- 把 Less 的延迟加载特性当成 Bug
- 认为原生 CSS 可以完全替代预处理器（目前还不能）
:::

---

## 总结

- CSS 预处理器解决原生 CSS 的四大痛点：变量、嵌套、函数、模块化
- Sass（SCSS）是当前主流选择，功能强大、生态丰富
- Less 学习成本低，语法接近原生 CSS
- `@mixin` 灵活但有代码冗余，`@extend` 紧凑但有限制
- 原生 CSS 正在追赶，但预处理器的高级特性短期内不可替代
- `@use` 替代 `@import` 是 Sass 的模块化方向