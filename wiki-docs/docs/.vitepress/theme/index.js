/**
 * VitePress 自定义主题入口
 * 
 * 方案一：Vue 组件覆写
 * - 用自定义 MermaidEnhanced 组件覆盖 vitepress-plugin-mermaid 注册的全局 Mermaid 组件
 * - 所有缩放/平移/全屏逻辑封装在 Vue 组件内部，无需 DOM 操作或 MutationObserver
 * - 组件随页面销毁自动清理，SPA 路由切换无需额外处理
 */
import DefaultTheme from 'vitepress/theme'
import MermaidEnhanced from './components/MermaidEnhanced.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    // 覆盖插件注册的全局 Mermaid 组件，替换为增强版
    app.component('Mermaid', MermaidEnhanced)
  }
}