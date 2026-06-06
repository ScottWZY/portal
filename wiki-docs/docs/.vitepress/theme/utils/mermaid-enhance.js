/**
 * Mermaid 图表增强模块（基于 svg-pan-zoom）
 * 
 * 功能：
 * - 鼠标悬停显示工具栏（缩放/重置/全屏）
 * - 全屏模态框：拖拽平移 + 滚轮缩放 + 键盘快捷键
 * - 暗色/亮色主题自适应
 * - SPA 路由切换自适应
 */
import svgPanZoom from 'svg-pan-zoom'

// ==================== 常量 ====================
const MERMAID_SELECTOR = '.mermaid'
const ATTR_ENHANCED = 'data-mermaid-enhanced'

// ==================== 全屏工具栏 HTML ====================
const FULLSCREEN_TOOLBAR_HTML = `
<div class="me-fs-toolbar-left">
  <button class="me-btn me-btn-zoomin" title="放大 (滚轮 / +)">
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
      <circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
    </svg>
  </button>
  <button class="me-btn me-btn-zoomout" title="缩小 (滚轮 / -)">
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
      <circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      <line x1="8" y1="11" x2="14" y2="11"/>
    </svg>
  </button>
  <span class="me-zoom-level">100%</span>
  <button class="me-btn me-btn-reset" title="重置 (0)">
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
    </svg>
  </button>
</div>
<div class="me-fs-toolbar-right">
  <span class="me-fs-hint">拖拽平移 · 滚轮缩放 · Esc 关闭</span>
  <button class="me-btn me-btn-close" title="关闭 (Esc)">
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  </button>
</div>`

// ==================== 内联工具栏 HTML ====================
const INLINE_TOOLBAR_HTML = `
<button class="me-btn me-btn-zoomin" title="放大">
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
    <circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
  </svg>
</button>
<button class="me-btn me-btn-zoomout" title="缩小">
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
    <circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    <line x1="8" y1="11" x2="14" y2="11"/>
  </svg>
</button>
<button class="me-btn me-btn-reset" title="重置 (0)">
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
  </svg>
</button>
<button class="me-btn me-btn-fullscreen" title="全屏查看">
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/>
    <line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
  </svg>
</button>`

// ==================== 核心逻辑 ====================

let mo = null
let enhanceAttemptTimer = null
const processedSVGs = new WeakSet()

/**
 * 初始化增强：查找所有 Mermaid SVG 并增强
 * 包含重试机制——Mermaid 组件是异步渲染的
 */
function initEnhance() {
  clearTimeout(enhanceAttemptTimer)
  const containers = document.querySelectorAll(MERMAID_SELECTOR)
  let allReady = true

  containers.forEach(container => {
    const svg = container.querySelector('svg')
    if (svg && !processedSVGs.has(svg)) {
      processMermaid(container, svg)
    } else if (!svg) {
      allReady = false
    }
  })

  // 如果存在尚未渲染完成的 Mermaid 容器，延迟重试
  if (!allReady || containers.length === 0) {
    enhanceAttemptTimer = setTimeout(initEnhance, 800)
  }
}

/**
 * 增强单个 Mermaid 容器
 */
function processMermaid(container, svg) {
  processedSVGs.add(svg)
  container.setAttribute(ATTR_ENHANCED, 'true')

  // 确保容器为相对定位（工具栏需要）
  const pos = window.getComputedStyle(container).position
  if (pos === 'static') container.style.position = 'relative'

  // 应用 svg-pan-zoom
  // 注意：fit: true 确保首次加载时 SVG 缩放适配容器，避免"二次放大"问题
  const pzInstance = svgPanZoom(svg, {
    zoomEnabled: true,
    panEnabled: true,
    controlIconsEnabled: false,   // 使用自定义工具栏
    dblClickZoomEnabled: true,
    mouseWheelZoomEnabled: true,
    preventMouseEventsDefault: true,
    zoomScaleSensitivity: 0.2,
    minZoom: 0.25,
    maxZoom: 5,
    fit: true,
    center: true,
    contain: false  // 允许平移超出 SVG 边界
  })

  // 将实例挂到容器上便于后续访问
  container._pzInstance = pzInstance

  // 创建内联工具栏
  const toolbar = createInlineToolbar(container, svg, pzInstance)
  container.appendChild(toolbar)

  // 悬停显示工具栏
  container.addEventListener('mouseenter', () => toolbar.classList.add('visible'))
  container.addEventListener('mouseleave', () => {
    setTimeout(() => {
      if (!container.matches(':hover')) toolbar.classList.remove('visible')
    }, 200)
  })
}

/**
 * 创建内联工具栏
 */
function createInlineToolbar(container, svg, pz) {
  const toolbar = document.createElement('div')
  toolbar.className = 'me-toolbar'
  toolbar.innerHTML = INLINE_TOOLBAR_HTML

  toolbar.querySelector('.me-btn-zoomin').addEventListener('click', e => {
    e.stopPropagation(); pz.zoomIn()
  })
  toolbar.querySelector('.me-btn-zoomout').addEventListener('click', e => {
    e.stopPropagation(); pz.zoomOut()
  })
  toolbar.querySelector('.me-btn-reset').addEventListener('click', e => {
    e.stopPropagation(); pz.reset()
  })
  toolbar.querySelector('.me-btn-fullscreen').addEventListener('click', e => {
    e.stopPropagation(); openFullscreen(container, pz.getZoom())
  })

  return toolbar
}

/**
 * 打开全屏模态框
 */
function openFullscreen(container, currentZoom) {
  // 获取原始 SVG
  const originalSvg = container.querySelector('svg')
  if (!originalSvg) return

  // 创建全屏覆盖层
  const overlay = document.createElement('div')
  overlay.className = 'me-fullscreen-overlay'

  // 工具栏
  const toolbar = createFullscreenToolbar()
  overlay.appendChild(toolbar)

  // 内容容器
  const content = document.createElement('div')
  content.className = 'me-fullscreen-content'

  // 克隆 SVG（深拷贝）
  const svgClone = originalSvg.cloneNode(true)
  svgClone.removeAttribute('style')
  svgClone.style.width = '100%'
  svgClone.style.height = '100%'
  content.appendChild(svgClone)

  overlay.appendChild(content)
  document.body.appendChild(overlay)

  // 应用 svg-pan-zoom 到克隆的 SVG
  const fsPz = svgPanZoom(svgClone, {
    zoomEnabled: true,
    panEnabled: true,
    controlIconsEnabled: false,
    dblClickZoomEnabled: true,
    mouseWheelZoomEnabled: true,
    preventMouseEventsDefault: true,
    zoomScaleSensitivity: 0.2,
    minZoom: 0.1,
    maxZoom: 10,
    fit: true,
    center: true,
    onZoom: (newZoom) => {
      const label = toolbar.querySelector('.me-zoom-level')
      if (label) label.textContent = Math.round(newZoom * 100) + '%'
    }
  })

  const zoomLabel = toolbar.querySelector('.me-zoom-level')
  zoomLabel.textContent = Math.round(fsPz.getZoom() * 100) + '%'

  // ---- 按钮事件绑定 ----
  toolbar.querySelector('.me-btn-zoomin').addEventListener('click', () => fsPz.zoomIn())
  toolbar.querySelector('.me-btn-zoomout').addEventListener('click', () => fsPz.zoomOut())
  toolbar.querySelector('.me-btn-reset').addEventListener('click', () => {
    fsPz.reset(); fsPz.fit(); fsPz.center()
  })

  // 关闭函数
  const close = () => {
    document.removeEventListener('keydown', handleKeydown)
    overlay.classList.add('closing')
    setTimeout(() => {
      fsPz.destroy()
      overlay.remove()
    }, 300)
  }

  toolbar.querySelector('.me-btn-close').addEventListener('click', close)

  // 点击背景关闭
  overlay.addEventListener('click', e => {
    if (e.target === overlay) close()
  })

  // 键盘快捷键
  const handleKeydown = (e) => {
    switch (e.key) {
      case 'Escape': close(); break
      case '+': case '=': e.preventDefault(); fsPz.zoomIn(); break
      case '-': e.preventDefault(); fsPz.zoomOut(); break
      case '0': e.preventDefault(); fsPz.reset(); fsPz.fit(); fsPz.center(); break
    }
  }
  document.addEventListener('keydown', handleKeydown)

  // 入场动画
  requestAnimationFrame(() => overlay.classList.add('active'))
}

/**
 * 创建全屏工具栏
 */
function createFullscreenToolbar() {
  const toolbar = document.createElement('div')
  toolbar.className = 'me-fullscreen-toolbar'
  toolbar.innerHTML = FULLSCREEN_TOOLBAR_HTML
  return toolbar
}

// ==================== 启动 ====================

/**
 * 启动增强（幂等，多次调用安全）
 */
export function enhanceMermaid() {
  // 首次遍历
  initEnhance()

  // 初始化 MutationObserver（只初始化一次）
  if (!mo) {
    mo = new MutationObserver(() => {
      // 延迟触发，合并连续的变化
      clearTimeout(enhanceAttemptTimer)
      enhanceAttemptTimer = setTimeout(initEnhance, 300)
    })
    mo.observe(document.body, { childList: true, subtree: true })
  }
}

/**
 * 销毁
 */
export function destroyMermaidEnhance() {
  if (mo) { mo.disconnect(); mo = null }
  clearTimeout(enhanceAttemptTimer)
  const overlay = document.querySelector('.me-fullscreen-overlay')
  if (overlay) overlay.remove()
}