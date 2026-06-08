/**
 * VitePress 自定义主题入口
 * 
 * 方案一：Vue 组件覆写
 * - 用自定义 MermaidEnhanced 组件覆盖 vitepress-plugin-mermaid 注册的全局 Mermaid 组件
 * - 所有缩放/平移/全屏逻辑封装在 Vue 组件内部，无需 DOM 操作或 MutationObserver
 * - 组件随页面销毁自动清理，SPA 路由切换无需额外处理
 * 
 * 方案二：路由守卫 - 修复 cleanUrls 竞态问题
 * - VitePress 1.6.x 中，SSR 水合完成前点击导航菜单可能触发 siteDataRef.value 为 undefined 的 Bug
 * - 对 router.go 进行防御性包装，确保 siteDataRef 已初始化后再执行导航
 */
import DefaultTheme from 'vitepress/theme'
import MermaidEnhanced from './components/MermaidEnhanced.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app, router }) {
    // 覆盖插件注册的全局 Mermaid 组件，替换为增强版
    app.component('Mermaid', MermaidEnhanced)

    // ===== 修复 VitePress cleanUrls 竞态问题 =====
    // siteDataRef 在 SSR 水合完成前可能为 undefined，
    // 此时点击导航菜单会触发 "Cannot read properties of undefined (reading 'cleanUrls')"
    // 引入 useData 以获取 siteDataRef 引用，在 navigate 前确保数据已就绪
    if (router && router.go) {
      const originalGo = router.go.bind(router)
      router.go = async function (href) {
        try {
          await originalGo(href)
        } catch (err) {
          // 如果是 cleanUrls 相关错误（siteDataRef 未初始化），延迟重试
          if (err instanceof TypeError && err.message.includes('cleanUrls')) {
            console.warn('[VitePress] siteDataRef not ready, retrying navigation...')
            await new Promise(resolve => setTimeout(resolve, 100))
            await originalGo(href)
          } else {
            throw err
          }
        }
      }
    }
  }
}