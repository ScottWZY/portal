# CSS 高频面试题

## ⭐ 面试重点速览

| 考点 | 考察频率 | 难度 | 掌握要求 |
|------|----------|------|----------|
| BFC 原理与应用 | ⭐⭐⭐⭐⭐ | 中等 | 必须精通触发条件和应用场景 |
| 水平垂直居中方案 | ⭐⭐⭐⭐⭐ | 简单 | 至少掌握 3 种以上 |
| 清除浮动方法 | ⭐⭐⭐⭐ | 简单 | 理解各种方法的优缺点 |
| 三栏/两栏布局实现 | ⭐⭐⭐⭐⭐ | 中等 | flex/grid/圣杯双飞翼都要会 |
| Flex 子项属性详解 | ⭐⭐⭐⭐⭐ | 中等 | flex: 1 的含义必须清楚 |
| 选择器优先级计算 | ⭐⭐⭐⭐ | 简单 | 能准确计算优先级 |
| display/visibility/opacity 区别 | ⭐⭐⭐⭐ | 简单 | 关键点在回流重绘 |
| em/rem/vw/vh 区别 | ⭐⭐⭐⭐ | 简单 | 适用场景要分清 |
| 移动端 1px 问题 | ⭐⭐⭐ | 中等 | 至少掌握一种解决方案 |
| transition vs animation | ⭐⭐⭐ | 简单 | 区别和适用场景 |
| CSS 实现三角形 | ⭐⭐⭐ | 简单 | 原理要懂 |

---

## 1. Q: BFC 是什么？触发条件和应用场景？

### A: 核心概念

**BFC（Block Formatting Context，块级格式化上下文）** 是 CSS 布局中的一个独立渲染区域，它规定了内部块级盒子如何布局，并且区域内部的布局不会影响外部元素。

### 触发 BFC 的条件

只要满足以下任意一条，就会创建 BFC：

1. `html` 根元素本身就是 BFC
2. `float` 不为 `none`（元素浮动）
3. `position` 为 `absolute` 或 `fixed`（绝对定位）
4. `display` 为 `inline-block`、`table-cell`、`flex`、`grid`
5. `overflow` 不为 `visible`（即 `hidden`/`auto`/`scroll`）
6. `contain` 为 `layout`、`paint` 或 `strict`

### BFC 的布局规则

```css
/* BFC 的核心特性 */
1. BFC 内部的块级盒子会在垂直方向上一个接一个排列
2. 垂直方向上的间距由 margin 决定，同一个 BFC 内相邻块级盒子会发生 margin 折叠
3. 每个盒子的左外边缘（margin-left）会触碰到 BFC 的左边缘（border-left）
4. BFC 是页面上一个独立的隔离容器，内部元素不会影响外部元素
5. 计算 BFC 高度时，浮动元素也会参与计算
```

### 常见应用场景

::: tip 场景 1：清除浮动（解决高度塌陷）
当父元素没有设置高度，且内部子元素都浮动时，父元素高度会塌陷为 0。触发父元素 BFC 可以让父元素在计算高度时包含浮动子元素。

```css
/* 父元素触发 BFC，包含浮动子元素 */
.parent {
  overflow: hidden; /* 触发 BFC */
}
.parent .child {
  float: left;
  width: 100px;
  height: 100px;
}
```
:::

::: tip 场景 2：阻止 margin 折叠
同一个 BFC 内相邻元素的垂直 margin 会发生折叠，放到不同 BFC 中可以避免折叠。

```html
<div class="box1">
  <p>第一个段落，margin-bottom: 20px</p>
</div>
<div class="box2">
  <p>第二个段落，margin-top: 20px</p>
</div>
```

```css
/* 如果不包 BFC，两个 p 标签的 margin 会折叠成 20px */
/* 包了 BFC 之后，两个 p 在不同 BFC，不会折叠 */
.box1, .box2 {
  overflow: hidden; /* 各自触发 BFC */
}
```
:::

::: tip 场景 3：实现自适应两栏布局
左侧浮动，右侧触发 BFC 自动填充剩余宽度。

```html
<div class="container">
  <div class="left">左侧固定宽度</div>
  <div class="right">右侧自适应宽度</div>
</div>
```

```css
.container .left {
  float: left;
  width: 200px;
}
.container .right {
  overflow: hidden; /* 触发 BFC，不会环绕浮动元素 */
  /* 自动占剩下的宽度 */
}
```
:::

---

## 2. Q: 水平垂直居中的 5 种实现方式？

### A: 以下是 5 种常用实现：

### 方案 1：Flex 布局（推荐，最简单）

```css
.parent {
  display: flex;
  justify-content: center; /* 水平居中 */
  align-items: center;     /* 垂直居中 */
  
  /* 必须给父容器高度 */
  height: 500px;
}
.child {
  /* 子元素不需要特殊处理 */
  width: 100px;
  height: 100px;
}
```

**优点**：代码简洁，响应式好，支持不定宽高  
**缺点**：IE10 及以下不兼容

---

### 方案 2：Grid 布局（现代推荐）

```css
.parent {
  display: grid;
  place-items: center; /* 简写：center center */
  /* place-items = align-items + justify-items */
  height: 500px;
}
.child {
  /* 子元素无需处理 */
}
```

或者：

```css
.parent {
  display: grid;
  height: 500px;
}
.child {
  margin: auto; /* 自动居中 */
}
```

**优点**：更简洁，现代浏览器原生支持  
**缺点**：兼容性不如 flex

---

### 方案 3：absolute + transform（不定宽高推荐）

```css
.parent {
  position: relative;
  height: 500px;
}
.child {
  position: absolute;
  top: 50%;
  left: 50%;
  /* 负 margin 需要知道子元素宽高，transform 不需要 */
  transform: translate(-50%, -50%);
}
```

如果知道子元素宽高，也可以用负 margin：

```css
.child {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100px;
  height: 100px;
  margin-top: -50px;   /* 高度一半 */
  margin-left: -50px;  /* 宽度一半 */
}
```

**优点**：兼容 IE9+，支持不定宽高  
**缺点**：脱离文档流

---

### 方案 4：table-cell 方式（传统兼容性方案）

```css
.parent {
  display: table-cell;
  vertical-align: middle; /* 垂直居中 */
  text-align: center;     /* 水平居中 */
  width: 500px;  /* 需要设置宽 */
  height: 500px; /* 需要设置高 */
}
.child {
  display: inline-block;  /* 让子元素可以被 text-align 居中 */
}
```

**优点**：兼容性好（IE8 都支持）  
**缺点**：改变了元素显示模式，需要额外处理

---

### 方案 5：line-height 单行文字居中

```css
/* 只适用于单行文字 */
.text {
  height: 50px;
  line-height: 50px; /* line-height = height 垂直居中 */
  text-align: center; /* 水平居中 */
}
```

**优点**：最简单，专门用于单行文字  
**缺点**：只适用于单行，多行文字会溢出

::: summary 方案对比

| 方案 | 不定宽高 | 兼容性 | 代码简洁度 | 适用场景 |
|------|----------|--------|------------|----------|
| Flex | ✅ 支持 | IE11+ | ⭐⭐⭐⭐⭐ | 绝大多数场景，推荐 |
| Grid | ✅ 支持 | IE11- 不支持 | ⭐⭐⭐⭐⭐ | 现代浏览器，推荐 |
| absolute + transform | ✅ 支持 | IE9+ | ⭐⭐⭐⭐ | 弹窗/定位场景 |
| table-cell | ✅ 支持 | IE8+ | ⭐⭐⭐ | 需要兼容古老浏览器 |
| line-height | ❌ 仅单行 | 全兼容 | ⭐⭐⭐⭐⭐ | 单行文字居中 |
:::

---

## 3. Q: 清除浮动的方法有哪些？各自优缺点？

### A: 浮动带来的问题

当父元素**没有设置高度**，且所有子元素都浮动时，父元素高度会塌陷为 0，影响后续布局。清除浮动就是为了解决这个问题。

### 方法 1：额外标签法（隔墙法）

```html
<div class="parent">
  <div class="float-left">子元素 1</div>
  <div class="float-left">子元素 2</div>
  <!-- 额外增加一个清浮动标签 -->
  <div style="clear: both;"></div>
</div>
```

**优点**：简单易懂  
**缺点**：增加多余 HTML 标签，语义化差，不推荐

---

### 方法 2：父元素触发 BFC（overflow 法）

```css
.parent {
  overflow: hidden; /* 触发 BFC，包含浮动元素 */
}
```

**优点**：代码非常少，简单  
**缺点**：如果子元素有定位弹出（如下拉菜单），溢出部分会被裁切

---

### 方法 3：伪元素清除浮动（推荐，最常用）

```css
.clearfix::after {
  content: '';        /* 必须有 content */
  display: block;     /* 转为块级元素 */
  height: 0;          /* 不占高度 */
  clear: both;        /* 核心：清除左右浮动 */
  visibility: hidden; /* 隐藏，但占位置 */
}

/* 兼容 IE6/IE7 */
.clearfix {
  *zoom: 1;
}
```

使用方式：

```html
<div class="parent clearfix">
  <div class="float-left">子元素</div>
</div>
```

**优点**：符合语义化，不增加额外标签，效果稳定  
**缺点**：需要多写几行代码，现代开发可以用 CSS 预处理器混入

---

### 方法 4：双伪元素清除浮动

```css
.clearfix::before,
.clearfix::after {
  content: '';
  display: table;  /* 触发 BFC，同时解决 margin 折叠 */
}
.clearfix::after {
  clear: both;
}
.clearfix {
  *zoom: 1;
}
```

**优点**：同时解决了 margin 折叠问题  
**缺点**：比单伪元素多几行

::: tip 总结
- 现在项目中**伪元素清除浮动**是主流方案
- 简单快速可以用 `overflow: hidden`，但要注意内容裁切问题
- 额外标签法语义化差，基本淘汰
:::

---

## 4. Q: 三栏布局的 5 种实现（中间自适应，两边固定）？

### A: 需求：左右两栏固定宽度，中间栏自适应宽度。

### 方案 1：Flex 实现（最简单推荐）

```html
<div class="container">
  <div class="left">左侧</div>
  <div class="center">中间自适应</div>
  <div class="right">右侧</div>
</div>
```

```css
.container {
  display: flex;
}
.left {
  width: 200px;
  flex-shrink: 0; /* 禁止压缩 */
}
.center {
  flex: 1; /* 自动占满剩余空间 */
}
.right {
  width: 200px;
  flex-shrink: 0;
}
```

**优点**：代码简洁，顺序无关，易维护  
**缺点**：IE10+ 支持，现代项目无需担心

---

### 方案 2：Grid 实现（现代最佳）

```css
.container {
  display: grid;
  grid-template-columns: 200px 1fr 200px;
  /* 1fr = 一份剩余空间，自动自适应 */
  gap: 10px; /* 间距 */
}
```

**优点**：代码最少，语义清晰，原生支持  
**缺点**：较新，IE 不支持，现代浏览器没问题

---

### 方案 3：Float 浮动实现

```html
<div class="container">
  <div class="left">左侧</div>
  <div class="right">右侧</div>
  <div class="center">中间（必须放最后）</div>
</div>
```

```css
.left {
  float: left;
  width: 200px;
}
.right {
  float: right;
  width: 200px;
}
.center {
  /* 中间触发 BFC 不环绕浮动 */
  overflow: hidden;
  margin: 0 210px; /* 留出左右边距 */
}
```

**优点**：兼容性好，原理易懂  
**缺点**：中间必须放最后，SEO 不如圣杯/双飞翼

---

### 方案 4：圣杯布局

```html
<div class="container">
  <div class="center">中间（放最前，优先渲染）</div>
  <div class="left">左侧</div>
  <div class="right">右侧</div>
</div>
```

```css
.container {
  padding: 0 200px; /* 左右留出padding */
  overflow: hidden;
}
.center {
  float: left;
  width: 100%; /* 占满父容器宽度 */
}
.left {
  float: left;
  width: 200px;
  margin-left: -100%; /* 负margin拉到左边 */
  position: relative;
  left: -200px;
}
.right {
  float: left;
  width: 200px;
  margin-left: -200px; /* 负margin拉到右边 */
  position: relative;
  right: -200px;
}
```

**核心原理**：
1. 中间栏 `width: 100%` 占满一行
2. 左右栏用负 margin 拉到同一行
3. 父容器左右 padding 给左右栏留出位置
4. 用相对定位把左右栏放到正确位置

**优点**：中间栏优先渲染，SEO 好  
**缺点**：理解难度大，需要负 margin 和相对定位，代码复杂

---

### 方案 5：双飞翼布局（圣杯改进版）

```html
<div class="container">
  <div class="center">
    <div class="center-inner">中间内容</div>
  </div>
  <div class="left">左侧</div>
  <div class="right">右侧</div>
</div>
```

```css
.center {
  float: left;
  width: 100%;
}
/* 内层设置margin留出位置 */
.center-inner {
  margin: 0 200px;
}
.left {
  float: left;
  width: 200px;
  margin-left: -100%; /* 拉到左边 */
}
.right {
  float: left;
  width: 200px;
  margin-left: -200px; /* 拉到右边 */
}
```

**对比圣杯布局**：
- 双飞翼不使用相对定位，原理更简单
- 额外多了一层 DOM，但结构更清晰
- 解决了圣杯布局中 padding 可能导致的问题

::: summary 五种方案对比

| 方案 | 代码量 | 复杂度 | DOM 顺序 | 兼容性 | 推荐指数 |
|------|--------|--------|----------|--------|----------|
| Flex | 极少 | 低 | 任意 | IE11+ | ⭐⭐⭐⭐⭐ |
| Grid | 最少 | 极低 | 任意 | 现代浏览器 | ⭐⭐⭐⭐⭐ |
| Float + BFC | 少 | 低 | 中间放最后 | 全兼容 | ⭐⭐⭐⭐ |
| 圣杯布局 | 多 | 高 | 中间优先 | 全兼容 | ⭐⭐⭐ |
| 双飞翼布局 | 多 | 中 | 中间优先 | 全兼容 | ⭐⭐⭐ |

::: warning 面试提示
面试中问三栏布局，先答 flex/grid，再答浮动方案，最后说圣杯双飞翼，能体现知识广度。
:::

---

## 5. Q: 两栏布局（左边固定，右边自适应）实现方案？

### A: 常见的几种实现：

### 方案 1：Flex（推荐）

```css
.container {
  display: flex;
}
.left {
  width: 200px;
  flex-shrink: 0;
}
.right {
  flex: 1;
}
```

---

### 方案 2：Grid（推荐）

```css
.container {
  display: grid;
  grid-template-columns: 200px 1fr;
}
```

---

### 方案 3：Float + BFC

```css
.left {
  float: left;
  width: 200px;
}
.right {
  overflow: hidden; /* 触发 BFC，不环绕浮动 */
}
```

这是非常经典的实现，利用了 BFC 不会环绕浮动元素的特性。

---

### 方案 4：绝对定位

```css
.container {
  position: relative;
}
.left {
  position: absolute;
  top: 0;
  left: 0;
  width: 200px;
}
.right {
  margin-left: 200px;
}
```

**优点**：简单直接  
**缺点**：脱离文档流，可能有高度问题

---

### 方案 5：calc 计算宽度

```css
.left {
  float: left;
  width: 200px;
  margin-right: 10px;
}
.right {
  float: left;
  width: calc(100% - 210px);
}
```

需要用 calc 减去左边固定宽度和间距。

---

## 6. Q: Flex: 1 代表什么？flex-grow、flex-shrink、flex-basis 详解？

### A: flex 是三个属性的简写：

```css
/* 完整写法 */
.item {
  flex: <flex-grow> <flex-shrink> <flex-basis>;
}
```

### 各属性含义详解

| 属性 | 作用 | 默认值 |
|------|------|--------|
| `flex-grow` | 放大比例：如果有剩余空间，是否放大 | `0`（不放大） |
| `flex-shrink` | 缩小比例：空间不足时，是否缩小 | `1`（允许缩小） |
| `flex-basis` | 基准宽度：分配剩余空间前，项目占据的空间 | `0%`（当 flex 只有一个数值时） |

### 常见简写对照表

```css
flex: 1;
/* 等价于 */
flex-grow: 1; flex-shrink: 1; flex-basis: 0%;
/* 意思：允许放大，允许缩小，基准宽度为 0，所有空间按比例分配 */
```

```css
flex: auto;
/* 等价于 */
flex-grow: 1; flex-shrink: 1; flex-basis: auto;
/* 基准宽度是内容本身宽度 */
```

```css
flex: none;
/* 等价于 */
flex-grow: 0; flex-shrink: 0; flex-basis: auto;
/* 不放大不缩小，保持原宽度 */
```

```css
flex: 0 auto;
/* 等价于 */
flex-grow: 0; flex-shrink: 1; flex-basis: auto;
/* 默认值：不放大，允许缩小，宽度由内容决定 */
```

### `flex: 1` 的实际意义

当多个子元素都设置 `flex: 1` 时，它们会**平分父容器的剩余空间**：

```css
.container {
  display: flex;
  width: 300px;
}
.item1 { flex: 1; } /* 占 100px */
.item2 { flex: 1; } /* 占 100px */
.item3 { flex: 1; } /* 占 100px */
```

如果比例不同：

```css
.item1 { flex: 1; } /* 占 1/4 */
.item2 { flex: 2; } /* 占 2/4 */
.item3 { flex: 1; } /* 占 1/4 */
```

::: danger 容易混淆点
- `flex-basis: 0%` 表示基准尺寸为 0，所有空间都拿出来按比例分配
- `flex-basis: auto` 表示先把内容宽度算出来，剩余空间再分配
- `flex: 1` 最终能占满剩余空间，就是因为 `flex-basis: 0%`
:::

### flex-shrink 计算规则

空间不足时，缩小的计算方式：

```css
.container {
  width: 500px;
  display: flex;
}
.item1 {
  width: 300px;
  flex-shrink: 1; /* 缩小系数 1 */
}
.item2 {
  width: 300px;
  flex-shrink: 2; /* 缩小系数 2 */
}
/* 总超出宽度 = 300 + 300 - 500 = 100px */
/* 总缩小权重 = 300*1 + 300*2 = 900 */

/* item1 缩小宽度 = 100px * (300*1)/900 = 33.33px */
/* item2 缩小宽度 = 100px * (300*2)/900 = 66.67px */
/* 最终宽度：item1=266.67px, item2=233.33px */
```

---

## 7. Q: CSS 选择器优先级计算规则？

### A: 优先级从高到低：

```
!important > 内联样式 > ID 选择器 > 类选择器 / 属性选择器 / 伪类 > 标签选择器 > 通配符 > 继承
```

### 优先级计算方法（四位数分值）

| 选择器类型 | 分值 | 示例 |
|------------|------|------|
| !important | 无穷大 | `color: red !important;` |
| 内联样式 | 1000 | `<div style="color: red">` |
| ID 选择器 | 0100 | `#id` |
| 类选择器 | 0010 | `.class` |
| 属性选择器 | 0010 | `[type="text"]` |
| 伪类 | 0010 | `:hover`、`:nth-child()` |
| 标签选择器 | 0001 | `div`、`p` |
| 伪元素 | 0001 | `::before`、`::after` |
| 通配符 | 0000 | `*` |

计算方式：把各位加起来，分值越大优先级越高。

### 计算示例

```css
/* 1. #nav .list li a:link → ID(1) + 类(2) + 标签(2) + 伪类(1) = 0123 */
#nav .list li a:link {}

/* 2. #nav .current → ID(1) + 类(1) = 0110 */
#nav .current {}

/* 0123 > 0110，所以第一个优先级更高 */
```

```css
/* 1. div ul li → 标签×3 = 0003 */
div ul li {}

/* 2. .box div → 类×1 + 标签×1 = 0011 */
.box div {}

/* 0011 > 0003，第二个优先级更高 */
```

### 重要规则

1. **同位优先级，后来居上**：优先级相同，后面写的覆盖前面的
2. **!important 最高**：不管其他权重多少，!important 优先级最高（但不推荐滥用）
3. **继承的优先级最低**：继承过来的样式比分值 0 还低
4. **通配符优先级高于继承**：`* { margin: 0; }` 优先级比继承高

::: warning 高频考点
- `!important` 不要滥用，只在需要覆盖第三方样式时使用
- CSS 优先级是**具体优先**原则：越具体，优先级越高
- 伪类 `:hover` 算类选择器（10 分），伪元素 `::before` 算标签（1 分）
:::

---

## 8. Q: display:none、visibility:hidden、opacity:0 的区别？

### A: 核心区别对比表

| 特性 | `display: none` | `visibility: hidden` | `opacity: 0` |
|------|----------------|---------------------|--------------|
| 是否占据空间 | ❌ 不占据，元素彻底消失 | ✅ 占据原来空间 | ✅ 占据原来空间 |
| 是否影响布局 | ✅ 会改变布局 | ❌ 不影响布局 | ❌ 不影响布局 |
| 能否触发点击事件 | ❌ 不能，元素不存在 | ❌ 不能，元素不可见 | ✅ 能，透明但存在 |
| 是否会回流重绘 | ✅ 触发回流（reflow） | ❌ 不回流，只重绘 | ❌ 不回流，只重绘 |
| 子元素能否可见 | 父元素隐藏，子元素都隐藏 | 父元素隐藏，子元素设置 `visibility: visible` 可显示 | 父元素透明，子元素也透明 |
| CSS 过渡支持 | ❌ 不支持 transition | ✅ 支持从 v0 到 v1 | ✅ 完美支持 transition |

### 代码演示

```html
<style>
  .box {
    width: 100px;
    height: 100px;
    background: red;
    /* 对比三种效果 */
  }

  .display-none {
    display: none;      /* 整个元素消失，不占位 */
  }
  .visibility-hidden {
    visibility: hidden; /* 占位，看不见 */
  }
  .opacity-zero {
    opacity: 0;         /* 占位，透明，但能点击 */
  }
</style>
```

### 适用场景

- `display: none`：需要彻底移除元素，不占位置时用（如菜单收起、弹窗关闭）
- `visibility: hidden`：需要保持占位，只是暂时看不见时用
- `opacity: 0`：需要淡入淡出动画，或者透明占位时用

::: tip 回流重绘说明
- `display: none` 会让元素从渲染树中移除，所以触发回流
- `visibility: hidden` 元素还在渲染树中，只是不绘制，所以只重绘
- `opacity: 0` 元素依然存在，只是透明度为 0，所以也只重绘
- 性能方面：`display: none` > `visibility: hidden` > `opacity: 0`（通常情况）
:::

---

## 9. Q: em/rem/vw/vh 的区别和适用场景？

### A: 单位对比详解：

| 单位 | 相对于谁 | 特点 | 适用场景 |
|------|----------|------|----------|
| `em` | 父元素的字体大小 | 会继承，多级嵌套会放大 | 很少用，早期移动端适配 |
| `rem` | 根元素（html）的字体大小 | 基准固定，计算简单 | 移动端适配（主流） |
| `vw` | 视口宽度的 1% | 相对于视口，完全自适应 | 宽度适配，大屏适配 |
| `vh` | 视口高度的 1% | 相对于视口高度 | 高度适配，全屏布局 |

### 详细说明

**em**：
- `1em` = 父元素 `font-size` 的大小
- 如果父元素也用 em，会逐级继承放大，计算复杂
- 现在基本被 rem 取代，很少使用

```css
html { font-size: 16px; }
.parent { font-size: 1.5em; } /* 1.5 × 16 = 24px */
.child { font-size: 1.5em; }   /* 1.5 × 24 = 36px */
/* 嵌套会越来越大，不好控制 */
```

**rem**（root em）：
- `1rem` = html 根元素 `font-size` 的大小
- 不管嵌套多少层，基准都是根元素，计算简单
- 是目前移动端适配的主流方案

```css
/* 设计稿 750px，通常设置 html { font-size: 75px; } */
/* 这样 1rem = 75px，设计稿上量出来除以 75 就是rem值 */
html {
  font-size: 75px; /* 750px 视口下 */
}
.box {
  width: 2rem; /* 2 × 75 = 150px，和设计稿一致 */
}
/* 通过媒体查询或JS根据屏幕宽度动态修改html fontSize */
```

**vw/vh**（视口单位）：
- `1vw` = 视口宽度 ÷ 100 → 比如 375px 屏幕，1vw = 3.75px
- `1vh` = 视口高度 ÷ 100
- `vmin` = min(vw, vh)，`vmax` = max(vw, vh)

**适用场景**：
- 需要元素宽度占满屏幕一定比例：`width: 50vw`（半屏）
- 需要全屏布局：`height: 100vh`（占满整个视口高度）
- 实现自适应文字：`font-size: 5vw`（文字随屏幕大小变化）

::: tip 适配方案对比
- rem + 动态根字体：兼容好，技术成熟，适合中大型移动端项目
- vw 直接适配：代码更简单，现代浏览器支持好，越来越流行
- 现在很多项目用 `vw + rem` 结合：根字体用 vw 设置，组件用 rem 写
:::

---

## 10. Q: 移动端 1px 边框问题的解决方案？

### A: 问题原因

移动端高清屏（Retina）有**设备像素比 DPR**，CSS 写 `1px`，实际上在视网膜屏会被渲染成 `2px` 甚至 `3px`（因为 1 CSS 像素对应多个物理像素），看起来比设计稿粗。

### 解决方案 1：transform scale（推荐）

```css
/* 实现底部 1px 边框 */
.border-1px {
  position: relative;
}
.border-1px::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 1px;
  background: #e5e5e5;
  /* 根据 DPR 缩放 */
  transform: scaleY(1 / devicePixelRatio);
  transform-origin: 0 0;
}
```

针对不同 DPR 用媒体查询：

```css
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 2dppx) {
  .border-1px::after {
    transform: scaleY(0.5);
  }
}
@media (-webkit-min-device-pixel-ratio: 3), (min-resolution: 3dppx) {
  .border-1px::after {
    transform: scaleY(0.333333);
  }
}
```

**优点**：可以实现任意方向边框，圆角也支持  
**缺点**：需要额外伪元素，写法稍复杂

---

### 解决方案 2：viewport + rem 方案

通过 viewport 的 `viewport-fit` 和 scale 把 1px 变成物理像素：

```html
<!-- DPR=2 → scale=0.5 -->
<meta name="viewport" content="width=device-width, initial-scale=0.5, maximum-scale=0.5, minimum-scale=0.5">
```

然后通过 JavaScript 根据 DPR 动态设置 scale。

**优点**：原生实现，不需要特殊处理 CSS  
**缺点**：整体缩放，所有尺寸都要乘以 DPR 换算，限制大

---

### 解决方案 3：box-shadow 模拟

```css
.border-1px {
  box-shadow: 0 1px 0 0 #e5e5e5;
}
```

**优点**：简单，一行代码  
**缺点**：颜色不真实，会发虚，只能模拟单边框

---

::: tip 实际开发推荐
现在项目中最常用的是 **transform scale 方案**，灵活可控，支持圆角多边框，兼容性好。如果用 PostCSS，可以用 `postcss-px-to-viewport` 插件自动处理。
:::

---

## 11. Q: CSS 动画 transition 和 animation 的区别？

### A: 对比表

| 对比维度 | transition | animation (@keyframes) |
|----------|------------|-------------------------|
| 是否需要触发 | ✅ 需要触发（hover、click、class 变化） | ❌ 不需要触发，可以自动播放 |
| 循环播放 | ❌ 不能自动循环，需要手动触发 | ✅ 支持 infinite 无限循环 |
| 关键帧 | ❌ 只有开始和结束两个状态 | ✅ 支持多关键帧（0% / 50% / 100%） |
| 暂停播放 | 需要配合 JS 控制 | ✅ 原生支持暂停（animation-play-state） |
| 复杂度 | 简单过渡 | 复杂动画 |
| 事件回调 | 很少用，有 transitionend 事件 | 有 animationstart/animationend 事件 |

### 代码示例对比

**transition 示例**：需要 hover 触发

```css
.box {
  width: 100px;
  height: 100px;
  background: red;
  /* 定义过渡：属性 时长 时间函数 */
  transition: all 0.3s ease;
}
.box:hover {
  transform: scale(1.2);
  background: blue;
}
```

**animation 示例**：自动播放，多关键帧

```css
.box {
  width: 100px;
  height: 100px;
  background: red;
  animation: rotate 2s linear infinite;
}

@keyframes rotate {
  0% {
    transform: rotate(0deg) scale(1);
  }
  50% {
    transform: rotate(180deg) scale(1.5);
    background: blue;
  }
  100% {
    transform: rotate(360deg) scale(1);
    background: red;
  }
}
```

### 适用场景

- **transition**：简单的状态过渡（hover、展开收起、弹窗显隐）
- **animation**：复杂的帧动画、循环动画、自动播放动画（加载动画、轮播切换）

---

## 12. Q: 如何实现一个三角形（纯 CSS）？

### A: 核心原理：利用 border 的斜角特性

当一个元素宽高为 0，只给三个边框透明，一个边框有色，就会形成三角形。

### 基础实现（向下三角形）

```css
.triangle {
  width: 0;
  height: 0;
  border: 50px solid transparent; /* 三边透明 */
  border-top-color: red;         /* 上边有色，形成向下三角形 */
}
```

### 不同方向的三角形

```css
/* 向上三角形 */
.triangle-up {
  width: 0;
  height: 0;
  border: 50px solid transparent;
  border-bottom-color: red;
}

/* 向下三角形 */
.triangle-down {
  width: 0;
  height: 0;
  border: 50px solid transparent;
  border-top-color: red;
}

/* 向左三角形 */
.triangle-left {
  width: 0;
  height: 0;
  border: 50px solid transparent;
  border-right-color: red;
}

/* 向右三角形 */
.triangle-right {
  width: 0;
  height: 0;
  border: 50px solid transparent;
  border-left-color: red;
}
```

### 直角三角形实现

```css
/* 直角三角形：右下直角 */
.right-triangle {
  width: 0;
  height: 0;
  border-bottom: 50px solid red;
  border-left: 50px solid transparent;
}
```

### 带边框的三角形（气泡箭头）

用两个三角形叠加，一个黑色一个白色错位实现：

```css
/* 气泡框 + 三角形箭头 */
.bubble {
  position: relative;
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.bubble::before,
.bubble::after {
  content: '';
  position: absolute;
  top: -10px;
  left: 30px;
  border: 10px solid transparent;
  border-bottom-color: #fff;
}
/* 外层黑色边框 */
.bubble::before {
  top: -11px;
  border-bottom-color: #ccc; /* 边框颜色 */
}
```

::: tip 其他方式
也可以用 CSS clip-path 实现三角形：

```css
.triangle {
  width: 100px;
  height: 100px;
  background: red;
  clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
}
```
这种方式更灵活，可以画任意多边形，但兼容性稍差（IE 不支持）。
:::

---

## 总结

CSS 面试题整体偏向**布局原理和概念理解**，高频考点集中在：

1. **布局模型**：BFC、Flex、Grid、浮动定位
2. **单位适配**：rem/vw 移动端适配方案
3. **基础概念**：优先级、显示隐藏区别、CSS 动画区别
4. **实践问题**：1px 边框、三角形、水平垂直居中

面试回答时，不仅要说出方案，还要能对比不同方案的优缺点和适用场景，能展示出你解决实际问题的能力。
