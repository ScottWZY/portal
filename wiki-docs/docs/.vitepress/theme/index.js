/**
 * VitePress 自定义主题入口
 * 扩展默认主题，注入 Mermaid 图表增强功能（基于 svg-pan-zoom）
 */
import DefaultTheme from 'vitepress/theme'
import './style/mermaid-enhance.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app, router }) {
    // 使用 Vue 的 onMounted 在组件挂载后初始化增强
    // 结合 router.afterEach 确保 SPA 导航时也能捕获新的 Mermaid 图表
    if (typeof window !== 'undefined') {
      // 首屏加载完成后初始化
      const initOnReady = () => {
        import('./utils/mermaid-enhance.js').then(m => m.enhanceMermaid())
      }
      
      if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(initOnReady, 500)
      } else {
        window.addEventListener('DOMContentLoaded', () => setTimeout(initOnReady, 500))
      }

      // SPA 路由切换时重新扫描（延迟足够长，确保新页面 DOM 已就绪）
      if (router && router.onAfterRouteChange) {
        router.onAfterRouteChange(() => {
          setTimeout(() => {
            import('./utils/mermaid-enhance.js').then(m => m.enhanceMermaid())
          }, 600)
        })
      }
    }
  }
}