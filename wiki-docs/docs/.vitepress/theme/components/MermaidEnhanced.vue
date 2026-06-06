<template>
  <div :class="props.class" ref="containerRef" @mouseenter="toolbarVisible = true" @mouseleave="onMouseLeave">
    <!-- Mermaid SVG 渲染区域 -->
    <div v-html="svgContent" ref="svgWrapperRef"></div>

    <!-- 内联工具栏 -->
    <div class="me-toolbar" :class="{ visible: toolbarVisible }">
      <button class="me-btn" @click.stop="zoomIn" title="放大">
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
        </svg>
      </button>
      <button class="me-btn" @click.stop="zoomOut" title="缩小">
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          <line x1="8" y1="11" x2="14" y2="11"/>
        </svg>
      </button>
      <button class="me-btn" @click.stop="resetZoom" title="重置">
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
        </svg>
      </button>
      <button class="me-btn" @click.stop="openFullscreen" title="全屏查看">
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/>
          <line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
        </svg>
      </button>
    </div>
  </div>

  <!-- 全屏模态框（Teleport 到 body 避免被父级裁剪） -->
  <Teleport to="body">
    <div
      v-if="fsVisible"
      class="me-fullscreen-overlay"
      :class="{ active: fsActive, closing: fsClosing }"
      @click.self="closeFullscreen"
    >
      <div class="me-fullscreen-toolbar">
        <div class="me-fs-toolbar-left">
          <button class="me-btn" @click="fsZoomIn" title="放大 (滚轮 / +)">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
            </svg>
          </button>
          <button class="me-btn" @click="fsZoomOut" title="缩小 (滚轮 / -)">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              <line x1="8" y1="11" x2="14" y2="11"/>
            </svg>
          </button>
          <span class="me-zoom-level">{{ fsZoomLabel }}</span>
          <button class="me-btn" @click="fsReset" title="重置 (0)">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
            </svg>
          </button>
        </div>
        <div class="me-fs-toolbar-right">
          <span class="me-fs-hint">拖拽平移 · 滚轮缩放 · Esc 关闭</span>
          <button class="me-btn me-btn-close" @click="closeFullscreen" title="关闭 (Esc)">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>
      <div class="me-fullscreen-content" ref="fsContentRef"></div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch, toRaw } from 'vue'
import mermaid from 'mermaid'
import svgPanZoom from 'svg-pan-zoom'
import { useData } from 'vitepress'

// ==================== Props ====================
const props = defineProps({
  graph: { type: String, required: true },
  id: { type: String, required: true },
  class: { type: String, default: 'mermaid' }
})

// ==================== 响应式状态 ====================
const containerRef = ref(null)
const svgWrapperRef = ref(null)
const svgContent = ref('')
const toolbarVisible = ref(false)
const pzInstance = ref(null)
let themeObserver = null

// 全屏状态
const fsVisible = ref(false)
const fsActive = ref(false)
const fsClosing = ref(false)
const fsContentRef = ref(null)
const fsZoomLabel = ref('100%')
let fsPzInstance = null
let fsKeyHandler = null

// 获取 VitePress 的 frontmatter（用于 mermaidTheme 配置）
const { page } = useData()

// ==================== 渲染 Mermaid ====================
async function renderChart() {
  try {
    const hasDark = document.documentElement.classList.contains('dark')
    const frontmatter = toRaw(page.value)?.frontmatter || {}
    const mermaidTheme = frontmatter.mermaidTheme || ''

    const config = {
      securityLevel: 'loose',
      startOnLoad: false
    }
    if (mermaidTheme) {
      config.theme = mermaidTheme
    } else if (hasDark) {
      config.theme = 'dark'
    }

    mermaid.initialize(config)
    const { svg } = await mermaid.render(props.id, decodeURIComponent(props.graph))

    // 添加随机 salt 强制 v-html 重渲染（与原始插件一致的处理方式）
    const salt = Math.random().toString(36).substring(7)
    svgContent.value = `${svg} <span style="display: none">${salt}</span>`

    // 等待 DOM 更新后初始化 svg-pan-zoom
    await nextTick()
    initPanZoom()
  } catch (e) {
    console.error('[MermaidEnhanced] 渲染失败:', e)
    svgContent.value = `<pre>Mermaid 渲染错误: ${e.message}</pre>`
  }
}

// ==================== svg-pan-zoom ====================
function initPanZoom() {
  // 销毁旧实例
  if (pzInstance.value) {
    try { pzInstance.value.destroy() } catch (e) { /* ignore */ }
    pzInstance.value = null
  }

  const svgEl = svgWrapperRef.value?.querySelector('svg')
  if (!svgEl) return

  // 移除 svg-pan-zoom 可能添加的旧属性
  svgEl.removeAttribute('style')
  svgEl.removeAttribute('width')
  svgEl.removeAttribute('height')

  pzInstance.value = svgPanZoom(svgEl, {
    zoomEnabled: true,
    panEnabled: true,
    controlIconsEnabled: false,
    dblClickZoomEnabled: true,
    mouseWheelZoomEnabled: true,
    preventMouseEventsDefault: true,
    zoomScaleSensitivity: 0.2,
    minZoom: 0.25,
    maxZoom: 5,
    fit: true,
    center: true,
    contain: false
  })
}

// ==================== 工具栏操作 ====================
function zoomIn() { pzInstance.value?.zoomIn() }
function zoomOut() { pzInstance.value?.zoomOut() }
function resetZoom() { pzInstance.value?.reset() }

function onMouseLeave() {
  // 延迟隐藏，避免鼠标快速移入移出时闪烁
  setTimeout(() => {
    if (!containerRef.value?.matches(':hover')) {
      toolbarVisible.value = false
    }
  }, 200)
}

// ==================== 全屏 ====================
/** 从 g 元素的 transform 矩阵读取实际缩放比例 */
function updateFsZoomLabel() {
  const gEl = fsContentRef.value?.querySelector('svg g')
  if (!gEl) return
  const t = gEl.getAttribute('transform') || ''
  const m = t.match(/matrix\(([^)]+)\)/)
  if (m) {
    const scale = parseFloat(m[1].split(/[,\s]+/)[0])
    fsZoomLabel.value = Math.round(Math.abs(scale) * 100) + '%'
  }
}

function openFullscreen() {
  const svgEl = svgWrapperRef.value?.querySelector('svg')
  if (!svgEl) return

  fsVisible.value = true
  fsZoomLabel.value = '100%'

  nextTick(() => {
    // 克隆 SVG，并重置内部变换避免继承已缩放的 transform
    const clone = svgEl.cloneNode(true)
    // 重置 svg-pan-zoom 添加的 g 元素变换
    const gEl = clone.querySelector('g')
    if (gEl) {
      gEl.removeAttribute('transform')
      if (gEl.style) gEl.style.transform = ''
    }
    clone.removeAttribute('style')
    clone.style.width = '100%'
    clone.style.height = '100%'
    fsContentRef.value.innerHTML = ''
    fsContentRef.value.appendChild(clone)

    // 初始化全屏 svg-pan-zoom
    fsPzInstance = svgPanZoom(clone, {
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
      onZoom: () => { updateFsZoomLabel() }
    })

    // 从 g 元素的 transform 矩阵读取实际缩放比例（比 getZoom() 更可靠）
    updateFsZoomLabel()

    // 入场动画
    requestAnimationFrame(() => { fsActive.value = true })

    // 键盘快捷键
    fsKeyHandler = (e) => {
      switch (e.key) {
        case 'Escape': closeFullscreen(); break
        case '+': case '=': e.preventDefault(); fsPzInstance?.zoomIn(); break
        case '-': e.preventDefault(); fsPzInstance?.zoomOut(); break
        case '0': e.preventDefault(); fsPzInstance?.reset(); fsPzInstance?.fit(); fsPzInstance?.center(); break
      }
    }
    document.addEventListener('keydown', fsKeyHandler)
  })
}

function closeFullscreen() {
  if (fsKeyHandler) {
    document.removeEventListener('keydown', fsKeyHandler)
    fsKeyHandler = null
  }
  fsClosing.value = true
  fsActive.value = false
  setTimeout(() => {
    if (fsPzInstance) {
      try { fsPzInstance.destroy() } catch (e) { /* ignore */ }
      fsPzInstance = null
    }
    fsVisible.value = false
    fsClosing.value = false
  }, 300)
}

function fsZoomIn() { fsPzInstance?.zoomIn() }
function fsZoomOut() { fsPzInstance?.zoomOut() }
function fsReset() {
  fsPzInstance?.reset()
  fsPzInstance?.fit()
  fsPzInstance?.center()
}

// ==================== 生命周期 ====================
onMounted(async () => {
  await renderChart()

  // 监听主题切换（dark class 变化）
  themeObserver = new MutationObserver(() => {
    renderChart()
  })
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
})

onUnmounted(() => {
  if (themeObserver) {
    themeObserver.disconnect()
    themeObserver = null
  }
  if (pzInstance.value) {
    try { pzInstance.value.destroy() } catch (e) { /* ignore */ }
    pzInstance.value = null
  }
  // 清理全屏（如果组件销毁时全屏还开着）
  closeFullscreen()
})
</script>

<style>
/* ============================================
   Mermaid 图表增强样式（me- 前缀）
   ============================================ */

/* ---------- 内联工具栏 ---------- */
.me-toolbar {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 2px;
  padding: 4px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  opacity: 0;
  transform: translateY(-4px);
  transition: opacity 0.2s ease, transform 0.2s ease;
  pointer-events: none;
  z-index: 10;
  backdrop-filter: blur(8px);
}

.me-toolbar.visible {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}

/* 按钮通用样式 */
.me-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  padding: 0;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #555;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
  outline: none;
}

.me-btn:hover {
  background: rgba(0, 0, 0, 0.06);
  color: #1a1a1a;
}

.me-btn:active {
  background: rgba(0, 0, 0, 0.1);
  transform: scale(0.95);
}

/* 确保按钮内的 SVG 不拦截点击事件 */
.me-btn svg {
  pointer-events: none;
}

/* ---------- 全屏模态框 ---------- */
.me-fullscreen-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  opacity: 0;
  transition: opacity 0.3s ease, background 0.3s ease;
  pointer-events: none;
}

.me-fullscreen-overlay.active {
  opacity: 1;
  background: rgba(0, 0, 0, 0.85);
  pointer-events: auto;
}

.me-fullscreen-overlay.closing {
  opacity: 0;
  background: rgba(0, 0, 0, 0);
}

.me-fullscreen-content {
  display: flex;
  align-items: center;
  justify-content: center;
  width: calc(100% - 80px);
  height: calc(100% - 100px);
  overflow: hidden;
}

.me-fullscreen-content svg {
  max-width: 100%;
  max-height: 100%;
}

/* ---------- 全屏工具栏 ---------- */
.me-fullscreen-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: calc(100% - 80px);
  height: 48px;
  padding: 0 16px;
  margin-bottom: 8px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(12px);
}

.me-fs-toolbar-left,
.me-fs-toolbar-right {
  display: flex;
  align-items: center;
  gap: 4px;
}

.me-fullscreen-toolbar .me-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  color: #444;
}

.me-fullscreen-toolbar .me-btn:hover {
  background: rgba(0, 0, 0, 0.06);
  color: #111;
}

.me-zoom-level {
  font-size: 13px;
  font-weight: 600;
  color: #555;
  min-width: 48px;
  text-align: center;
  user-select: none;
  font-variant-numeric: tabular-nums;
}

.me-fs-hint {
  font-size: 12px;
  color: #999;
  margin-right: 8px;
  user-select: none;
}

.me-btn-close {
  margin-left: 4px;
}

.me-btn-close:hover {
  background: rgba(220, 38, 38, 0.1) !important;
  color: #dc2626 !important;
}

/* ---------- 暗色主题适配 ---------- */
html.dark .me-toolbar {
  background: rgba(30, 30, 30, 0.92);
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.4);
}

html.dark .me-btn {
  color: #aaa;
}

html.dark .me-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #eee;
}

html.dark .me-btn:active {
  background: rgba(255, 255, 255, 0.12);
}

html.dark .me-fullscreen-toolbar {
  background: rgba(30, 30, 30, 0.95);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
}

html.dark .me-fullscreen-toolbar .me-btn {
  color: #bbb;
}

html.dark .me-fullscreen-toolbar .me-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}

html.dark .me-zoom-level {
  color: #bbb;
}

html.dark .me-fs-hint {
  color: #777;
}

html.dark .me-btn-close:hover {
  background: rgba(239, 68, 68, 0.15) !important;
  color: #f87171 !important;
}

/* ---------- 响应式适配 ---------- */
@media (max-width: 768px) {
  .me-fullscreen-content,
  .me-fullscreen-toolbar {
    width: calc(100% - 32px);
  }

  .me-fs-hint { display: none; }

  .me-toolbar {
    opacity: 0.85;
    transform: translateY(0);
  }
}
</style>