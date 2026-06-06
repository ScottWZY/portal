# Vue Router 路由

## ⭐ 面试重点速览

| 知识模块 | 重点内容 | 面试频率 |
|----------|----------|----------|
| 动态路由 | 动态参数匹配、正则约束、嵌套路由 children | 极高 |
| 导航守卫 | 全局守卫执行顺序、路由独享守卫、组件内守卫 | 极高 |
| 路由懒加载 | 动态 import、webpackChunkName、Vite 分包策略 | 高 |
| hash vs history | 原理差异、优缺点、服务器配置 | 极高 |
| 路由元信息 | meta 字段、权限控制实现 | 中高 |

---

## 一、动态路由匹配

### 1.1 动态参数

```js
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // 动态路由 —— :id 匹配 /user/123、/user/456 等
    {
      path: '/user/:id',
      component: () => import('@/views/User.vue')
    },

    // 多参数动态路由
    {
      path: '/blog/:category/:postId',
      component: () => import('@/views/BlogPost.vue')
    },

    // 可选参数 —— 使用 ? 修饰符（Vue Router 3.4+）
    {
      path: '/search/:keyword?',
      component: () => import('@/views/Search.vue')
    },

    // 正则约束 —— 限制参数格式
    {
      path: '/user/:id(\\d+)',       // id 只能是数字
      component: () => import('@/views/User.vue')
    },

    // 通配路由（catch-all）—— 404 页面
    {
      path: '/:pathMatch(.*)*',
      component: () => import('@/views/NotFound.vue')
    }
  ]
})
```

### 1.2 在组件中获取路由参数

```vue
<script setup>
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// 获取动态参数
console.log(route.params.id)       // 路径参数
console.log(route.query.page)      // 查询参数 ?page=1
console.log(route.hash)            // hash #section

// 注意：直接解构 route.params 会丢失响应式！
// 使用 computed 或 watch 来响应参数变化
import { watch, computed } from 'vue'

const userId = computed(() => route.params.id)

// 监听参数变化（同一组件复用时，路由参数变化不会触发组件重建）
watch(() => route.params.id, (newId) => {
  fetchUserData(newId)
})

// 路由跳转
router.push({ name: 'user', params: { id: '123' } })
router.push({ path: '/search', query: { q: 'vue' } })
router.replace({ name: 'home' })  // 替换当前路由（不产生历史记录）
router.go(-1)  // 后退
</script>
```

### 1.3 嵌套路由（children）

```js
const routes = [
  {
    path: '/user/:id',
    component: () => import('@/views/UserLayout.vue'),  // 父组件需要 <router-view>
    children: [
      // 空路径 —— 默认子路由
      {
        path: '',
        component: () => import('@/views/UserProfile.vue')
      },
      {
        path: 'posts',
        component: () => import('@/views/UserPosts.vue')
      },
      {
        path: 'settings',
        component: () => import('@/views/UserSettings.vue')
      }
    ]
  }
]
```

```vue
<!-- UserLayout.vue —— 父组件 -->
<template>
  <div class="user-layout">
    <nav>
      <router-link to="profile">个人资料</router-link>
      <router-link to="posts">文章</router-link>
      <router-link to="settings">设置</router-link>
    </nav>
    <!-- 子路由渲染位置 -->
    <router-view />
  </div>
</template>
```

---

## 二、导航守卫

### 2.1 导航守卫完整解析流程

```
导航触发
  │
  ├─ 1. 导航被触发
  │
  ├─ 2. 在失活的组件中调用 beforeRouteLeave 守卫
  │     （离开当前路由的组件）
  │
  ├─ 3. 调用全局 beforeEach 守卫
  │
  ├─ 4. 在重用的组件中调用 beforeRouteUpdate 守卫
  │     （同一组件复用时，如 /user/1 → /user/2）
  │
  ├─ 5. 调用路由独享的 beforeEnter 守卫
  │
  ├─ 6. 解析异步路由组件
  │
  ├─ 7. 在被激活的组件中调用 beforeRouteEnter 守卫
  │     （进入目标路由的组件，此时组件实例尚未创建）
  │
  ├─ 8. 调用全局 beforeResolve 守卫
  │     （导航被确认之前，所有组件内守卫和异步路由组件被解析之后）
  │
  ├─ 9. 导航被确认
  │
  ├─ 10. 调用全局 afterEach 钩子
  │
  └─ 11. 触发 DOM 更新
```

### 2.2 全局守卫（Global Guards）

```js
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [...]
})

/**
 * 全局前置守卫 —— beforeEach
 * 最常用的守卫，用于权限校验、登录检查
 */
router.beforeEach((to, from, next) => {
  // to: 即将进入的目标路由
  // from: 当前导航正要离开的路由
  // next: 必须调用 next() 才能继续导航

  // 登录检查
  const isAuthenticated = localStorage.getItem('token')
  if (to.meta.requiresAuth && !isAuthenticated) {
    // 未登录，重定向到登录页
    next({ name: 'login', query: { redirect: to.fullPath } })
  } else {
    next()  // 继续导航
  }
})

/**
 * 全局解析守卫 —— beforeResolve
 * 在导航被确认之前，所有组件内守卫和异步路由组件解析之后调用
 * 适合在组件解析完成后做最终检查
 */
router.beforeResolve(async (to) => {
  // 在组件解析完成后获取数据
  if (to.meta.requiresData) {
    await fetchRequiredData(to)
  }
})

/**
 * 全局后置钩子 —— afterEach
 * 导航完成后调用，不接受 next 函数，无法改变导航
 * 适合：页面标题更新、埋点统计、滚动行为
 */
router.afterEach((to, from) => {
  document.title = to.meta.title || '默认标题'
  // 埋点
  analytics.pageView(to.fullPath)
})
```

### 2.3 路由独享守卫（Per-Route Guard）

```js
const routes = [
  {
    path: '/admin',
    component: () => import('@/views/Admin.vue'),
    // 路由独享守卫 —— 只在进入该路由时触发
    beforeEnter: (to, from, next) => {
      const isAdmin = checkAdminPermission()
      if (!isAdmin) {
        next({ name: 'forbidden' })
      } else {
        next()
      }
    }
  }
]
```

### 2.4 组件内守卫（In-Component Guards）

```vue
<script setup>
import { onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router'

/**
 * 组件内守卫 —— 使用 Composition API
 * 注意：beforeRouteEnter 在 setup 中不可用
 * （因为此时组件实例尚未创建，但可以通过 next 回调获取实例）
 */

// 离开当前路由时触发 —— 防止用户未保存离开
onBeforeRouteLeave((to, from) => {
  if (hasUnsavedChanges.value) {
    const answer = window.confirm('有未保存的更改，确定离开吗？')
    if (!answer) return false  // 取消导航
  }
})

// 同一组件复用时触发（路由参数变化，组件不重建）
onBeforeRouteUpdate(async (to, from) => {
  // 例如：/user/1 → /user/2，组件复用
  // 在此重新获取用户数据
  await fetchUserData(to.params.id)
})
</script>
```

```vue
<script>
/**
 * 组件内守卫 —— Options API 写法
 */
export default {
  // beforeRouteEnter 在组件实例创建前调用，无法访问 this
  beforeRouteEnter(to, from, next) {
    // 通过 next 回调获取组件实例
    next(vm => {
      // vm 是组件实例
      vm.fetchData(to.params.id)
    })
  },
  beforeRouteUpdate(to, from) {
    // 可以访问 this
    this.fetchData(to.params.id)
  },
  beforeRouteLeave(to, from) {
    if (this.hasUnsavedChanges) {
      const answer = window.confirm('有未保存的更改，确定离开吗？')
      if (!answer) return false
    }
  }
}
</script>
```

---

## 三、路由懒加载

### 3.1 动态 import

```js
/**
 * 路由懒加载 —— 按需加载路由组件
 * 使用动态 import() 语法，构建工具会自动代码分割
 */
const routes = [
  {
    path: '/dashboard',
    // 基础写法：动态 import
    component: () => import('@/views/Dashboard.vue')
  },
  {
    path: '/settings',
    // Vite / Webpack 魔法注释：指定 chunk 名称
    component: () => import(/* webpackChunkName: "settings" */ '@/views/Settings.vue')
  },
  {
    path: '/reports',
    // 将多个路由打包到同一个 chunk
    component: () => import(/* webpackChunkName: "reports" */ '@/views/Reports.vue')
  },
  {
    path: '/analytics',
    component: () => import(/* webpackChunkName: "reports" */ '@/views/Analytics.vue')
  }
]
```

### 3.2 Vite 中的分包策略

```js
// vite.config.js —— 配置分包策略
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // 将 Vue 相关库单独打包
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          // 将 UI 库单独打包
          'ui-vendor': ['element-plus'],
          // 将工具库单独打包
          'utils-vendor': ['lodash-es', 'dayjs']
        }
      }
    }
  }
})
```

---

## 四、hash vs history 模式

### 4.1 原理对比

| 特性 | hash 模式 | history 模式 |
|------|-----------|-------------|
| URL 格式 | `http://example.com/#/user/123` | `http://example.com/user/123` |
| 实现原理 | 监听 `window.hashchange` 事件 | 使用 HTML5 History API（`pushState`/`replaceState`） |
| 兼容性 | 所有浏览器支持 | IE10+ |
| 服务端配置 | 无需配置 | 需要配置（Nginx/Apache） |
| SEO 友好 | 不友好（`#` 后的内容不会被搜索引擎索引） | 友好 |
| 锚点功能 | 冲突（`#` 被路由占用） | 不影响 |
| 打包部署 | 可部署到任何静态服务器 | 需要服务端配合处理路由回退 |

### 4.2 实现原理

```js
/**
 * hash 模式 —— 监听 hashchange 事件
 */
class HashHistory {
  constructor(router) {
    // 监听 hash 变化
    window.addEventListener('hashchange', () => {
      const path = window.location.hash.slice(1) || '/'
      router.transitionTo(path)
    })
  }

  push(path) {
    window.location.hash = path
  }

  // 获取当前路径
  getCurrentLocation() {
    return window.location.hash.slice(1) || '/'
  }
}

/**
 * history 模式 —— 使用 History API + popstate 事件
 */
class HTML5History {
  constructor(router) {
    // 监听浏览器前进/后退
    window.addEventListener('popstate', () => {
      router.transitionTo(window.location.pathname)
    })
  }

  push(path) {
    // pushState 不会触发 popstate 事件
    history.pushState({}, '', path)
    // 手动触发路由跳转
    router.transitionTo(path)
  }

  replace(path) {
    history.replaceState({}, '', path)
    router.transitionTo(path)
  }
}
```

::: danger 关键区别：hashChange vs popState
- `hashchange`：hash 变化时触发，包括手动修改 URL 和 `location.hash = xxx`
- `popstate`：仅浏览器前进/后退时触发，**`pushState`/`replaceState` 不会触发** `popstate` 事件
- 因此 history 模式的路由跳转需要在 `pushState` 后手动调用路由转换
:::

### 4.3 history 模式 Nginx 配置

```nginx
server {
    listen 80;
    server_name example.com;

    root /var/www/dist;
    index index.html;

    location / {
        # 核心配置：所有路由请求都返回 index.html
        # Vue Router 在客户端接管路由匹配
        try_files $uri $uri/ /index.html;
    }

    # 静态资源缓存（优化）
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API 代理（如果有后端）
    location /api/ {
        proxy_pass http://backend:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

::: warning 为什么 history 模式需要服务端配置？
当用户访问 `http://example.com/user/123` 时：
1. 浏览器向服务器发送请求，请求路径为 `/user/123`
2. 服务器上并没有 `/user/123` 这个物理文件
3. 如果没有 `try_files` 配置，服务器返回 404
4. 配置 `try_files $uri $uri/ /index.html` 后，服务器在所有路径都返回 `index.html`
5. Vue Router 在客户端接管，根据 URL 匹配并渲染对应组件
:::

---

## ⭐ 面试高频问题

### Q1：导航守卫的完整执行顺序？

```
1. 导航触发
2. beforeRouteLeave（失活组件）
3. beforeEach（全局前置）
4. beforeRouteUpdate（复用组件，如果有）
5. beforeEnter（路由独享）
6. 解析异步路由组件
7. beforeRouteEnter（激活组件 —— 组件实例尚未创建）
8. beforeResolve（全局解析守卫）
9. 导航确认
10. afterEach（全局后置钩子）
11. DOM 更新
12. beforeRouteEnter 中 next() 的回调执行（此时组件实例已创建）
```

### Q2：`$route` 和 `$router` 的区别？

| 对象 | 说明 | 主要用法 |
|------|------|----------|
| `$route` (useRoute) | 当前路由信息对象（只读） | 获取 `params`、`query`、`path`、`meta` |
| `$router` (useRouter) | 路由器实例 | `push`、`replace`、`go`、`addRoute` |

### Q3：如何实现路由权限控制？

```js
/**
 * 路由权限控制 —— 基于 beforeEach + meta
 */
const routes = [
  {
    path: '/admin',
    component: () => import('@/views/Admin.vue'),
    meta: {
      requiresAuth: true,
      roles: ['admin']  // 需要的角色
    }
  },
  {
    path: '/editor',
    component: () => import('@/views/Editor.vue'),
    meta: {
      requiresAuth: true,
      roles: ['admin', 'editor']
    }
  }
]

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()

  // 1. 检查是否需要登录
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    return next({ name: 'login', query: { redirect: to.fullPath } })
  }

  // 2. 检查角色权限
  if (to.meta.roles && !to.meta.roles.includes(userStore.role)) {
    return next({ name: 'forbidden' })
  }

  next()
})

// 动态路由：根据权限动态添加路由
function addDynamicRoutes() {
  const userStore = useUserStore()
  const adminRoutes = [
    {
      path: '/admin',
      component: () => import('@/views/Admin.vue')
    }
  ]

  if (userStore.role === 'admin') {
    adminRoutes.forEach(route => router.addRoute(route))
  }
}
```

### Q4：Vue Router 如何实现 keep-alive 结合路由缓存？

```vue
<template>
  <!-- 基于路由的 keep-alive -->
  <router-view v-slot="{ Component, route }">
    <keep-alive :include="cachedViews">
      <component :is="Component" :key="route.fullPath" />
    </keep-alive>
  </router-view>
</template>

<script setup>
import { ref } from 'vue'

const cachedViews = ref(['UserList', 'Dashboard'])

// 路由配置中设置缓存
const routes = [
  {
    path: '/users',
    name: 'UserList',
    component: () => import('@/views/UserList.vue'),
    meta: { keepAlive: true }  // 标记需要缓存
  }
]
</script>
```