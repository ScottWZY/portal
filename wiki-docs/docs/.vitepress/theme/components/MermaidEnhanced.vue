<template>
  <div
    :class="props.class"
    ref="containerRef"
    class="me-container"
    @mouseenter="toolbarVisible = true"
    @mouseleave="onMouseLeave"
    @wheel.prevent="onWheel"
    @mousedown="onMouseDown"
    @mousemove="onMouseMove"
    @mouseup="onMouseUp"
  >
    <!-- SVG 拖拽区域，绑定 transform -->
    <div
      ref="svgWrapperRef"
      class="me-svg-wrapper"
      :style="svgTransformStyle"
      v-html="svgContent"
    ></div>

    <!-- 内联工具栏，阻止拖拽事件冒泡 -->
    <div class="me-toolbar" :class="{ visible: toolbarVisible }" @mousedown.stop @mouseup.stop>
      <button class="me-btn" @click.stop="zoomIn" title="放大">
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
        </svg>
      </button>
      <button class="me-btn" @click.stop="zoomOut" title="缩小">
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          <line x1="8" y1="11" x2="14" y2="11"/>
        </svg>
      </button>
      <button class="me-btn" @click.stop="resetView" title="重置">
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
        </svg>
      </button>
      <span class="me-zoom-badge">{{ Math.round(scale * 100) }}%</span>
      <button class="me-btn" @click.stop="openFullscreen" title="全屏查看">
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/>
          <line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
        </svg>
      </button>
    </div>
  </div>

  <!-- 全屏模态框 -->
  <Teleport to="body">
    <div
      v-if="fsVisible"
      class="me-fullscreen-overlay"
      :class="{ active: fsActive, closing: fsClosing }"
      @click.self="closeFullscreen"
      @wheel.prevent="onFsWheel"
      @mousedown="onFsMouseDown"
      @mousemove="onFsMouseMove"
      @mouseup="onFsMouseUp"
      @mouseleave="onFsMouseUp"
    >
      <div class="me-fullscreen-toolbar" @mousedown.stop @mouseup.stop>
        <div class="me-fs-toolbar-left">
          <button class="me-btn" @click="fsZoomIn" title="放大 (滚轮 / +)">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
            </svg>
          </button>
          <button class="me-btn" @click="fsZoomOut" title="缩小 (滚轮 / -)">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              <line x1="8" y1="11" x2="14" y2="11"/>
            </svg>
          </button>
          <span class="me-zoom-level">{{ Math.round(fsScale * 100) }}%</span>
          <button class="me-btn" @click="fsReset" title="重置 (0)">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
            </svg>
          </button>
        </div>
        <div class="me-fs-toolbar-right">
          <span class="me-fs-hint">拖拽平移 · 滚轮缩放 · Esc 关闭</span>
          <button class="me-btn me-btn-close" @click="closeFullscreen" title="关闭 (Esc)">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>
      <div class="me-fullscreen-content" ref="fsContentWrapperRef">
        <div
          ref="fsSvgRef"
          class="me-fs-svg-wrapper"
          :style="fsTransformStyle"
          v-html="fsSvgContent"
        ></div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
/**
 * MermaidEnhanced.vue — 方案三：纯 Vue 响应式
 * 
 * 不使用 svg-pan-zoom 库，完全基于 Vue 3 响应式系统 + CSS transform 实现缩放/平移。
 * - 缩放：transform: scale(S)，通过滚轮或按钮调整
 * - 平移：transform: translate(X, Y)，通过鼠标拖拽实现
 * - 全屏：Teleport 到 body，复用相同的 transform 逻辑
 * - 缩放原点：以鼠标位置为中心，保持视觉连续性
 */
import { ref, computed, onMounted, onUnmounted, nextTick, toRaw } from 'vue'
import mermaid from 'mermaid'
import { useData } from 'vitepress'

// ==================== Props ====================
const props = defineProps({
  graph: { type: String, required: true },
  id: { type: String, required: true },
  class: { type: String, default: 'mermaid' }
})

// ==================== 内联模式状态 ====================
const containerRef = ref(null)
const svgWrapperRef = ref(null)
const svgContent = ref('')
const toolbarVisible = ref(false)

// 缩放/平移状态
const scale = ref(1)
const panX = ref(0)
const panY = ref(0)

// 拖拽状态
let isDragging = false
let dragStartX = 0
let dragStartY = 0
let dragStartPanX = 0
let dragStartPanY = 0

// 主题监听
let themeObserver = null

// SVG 容器 transform 样式
const svgTransformStyle = computed(() => ({
  transform: `translate(${panX.value}px, ${panY.value}px) scale(${scale.value})`,
  transformOrigin: '0 0',
  cursor: isDragging ? 'grabbing' : 'grab'
}))

// ==================== 全屏模式状态 ====================
const fsVisible = ref(false)
const fsActive = ref(false)
const fsClosing = ref(false)
const fsContentWrapperRef = ref(null)
const fsSvgRef = ref(null)
const fsSvgContent = ref('')
const fsScale = ref(1)
const fsPanX = ref(0)
const fsPanY = ref(0)

let fsIsDragging = false
let fsDragStartX = 0
let fsDragStartY = 0
let fsDragStartPanX = 0
let fsDragStartPanY = 0
let fsKeyHandler = null

const fsTransformStyle = computed(() => ({
  transform: `translate(${fsPanX.value}px, ${fsPanY.value}px) scale(${fsScale.value})`,
  transformOrigin: '0 0',
  cursor: fsIsDragging ? 'grabbing' : 'grab'
}))

// ==================== 渲染 Mermaid ====================
const { page } = useData()

async function renderChart() {
  try {
    const hasDark = document.documentElement.classList.contains('dark')
    const frontmatter = toRaw(page.value)?.frontmatter || {}
    const mermaidTheme = frontmatter.mermaidTheme || ''

    const config = { securityLevel: 'loose', startOnLoad: false }
    if (mermaidTheme) config.theme = mermaidTheme
    else if (hasDark) config.theme = 'dark'

    mermaid.initialize(config)
    const { svg } = await mermaid.render(props.id, decodeURIComponent(props.graph))

    const salt = Math.random().toString(36).substring(7)
    svgContent.value = `${svg} <span style="display: none">${salt}</span>`

    await nextTick()
    // 渲染完成后重置视图
    resetView()
  } catch (e) {
    console.error('[MermaidEnhanced] 渲染失败:', e)
    svgContent.value = `<pre>Mermaid 渲染错误: ${e.message}</pre>`
  }
}

// ==================== 内联缩放与平移 ====================

/** 缩放（以容器中心为原点） */
function applyZoom(delta, centerX = 0, centerY = 0) {
  const oldScale = scale.value
  const newScale = Math.max(0.25, Math.min(5, oldScale * (1 + delta * 0.1)))

  // 以指定点为中心缩放：调整 pan 使该点在视觉上不动
  // 新 pan = 指定点 - (指定点 - 旧 pan) * (新 scale / 旧 scale)
  panX.value = centerX - (centerX - panX.value) * (newScale / oldScale)
  panY.value = centerY - (centerY - panY.value) * (newScale / oldScale)
  scale.value = newScale
}

function zoomIn() {
  const container = containerRef.value
  if (!container) return
  const rect = container.getBoundingClientRect()
  applyZoom(1, rect.width / 2, rect.height / 2)
}
function zoomOut() {
  const container = containerRef.value
  if (!container) return
  const rect = container.getBoundingClientRect()
  applyZoom(-1, rect.width / 2, rect.height / 2)
}
function resetView() {
  scale.value = 1
  panX.value = 0
  panY.value = 0
}

function onWheel(e) {
  const container = containerRef.value
  if (!container) return
  const rect = container.getBoundingClientRect()
  const delta = e.deltaY > 0 ? -1 : 1
  applyZoom(delta, e.clientX - rect.left, e.clientY - rect.top)
}

function onMouseDown(e) {
  if (e.button !== 0) return // 只响应左键
  isDragging = true
  dragStartX = e.clientX
  dragStartY = e.clientY
  dragStartPanX = panX.value
  dragStartPanY = panY.value
}

function onMouseMove(e) {
  if (!isDragging) return
  panX.value = dragStartPanX + (e.clientX - dragStartX)
  panY.value = dragStartPanY + (e.clientY - dragStartY)
}

function onMouseUp() {
  isDragging = false
}

function onMouseLeave() {
  setTimeout(() => {
    if (!containerRef.value?.matches(':hover')) {
      toolbarVisible.value = false
    }
  }, 200)
}

// ==================== 全屏 ====================
function openFullscreen() {
  const svgEl = svgWrapperRef.value?.querySelector('svg')
  if (!svgEl) return

  fsVisible.value = true
  fsScale.value = 1
  fsPanX.value = 0
  fsPanY.value = 0

  nextTick(() => {
    const clone = svgEl.cloneNode(true)
    fsSvgContent.value = clone.outerHTML
    fsActive.value = true

    fsKeyHandler = (e) => {
      switch (e.key) {
        case 'Escape': closeFullscreen(); break
        case '+': case '=': e.preventDefault(); fsZoomIn(); break
        case '-': e.preventDefault(); fsZoomOut(); break
        case '0': e.preventDefault(); fsReset(); break
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
    fsVisible.value = false
    fsClosing.value = false
  }, 300)
}

// 全屏缩放（以全屏容器中心为原点）
function fsApplyZoom(delta, centerX = 0, centerY = 0) {
  const oldScale = fsScale.value
  const newScale = Math.max(0.1, Math.min(10, oldScale * (1 + delta * 0.1)))
  fsPanX.value = centerX - (centerX - fsPanX.value) * (newScale / oldScale)
  fsPanY.value = centerY - (centerY - fsPanY.value) * (newScale / oldScale)
  fsScale.value = newScale
}

function fsZoomIn() {
  const wrapper = fsContentWrapperRef.value
  if (!wrapper) return
  const rect = wrapper.getBoundingClientRect()
  fsApplyZoom(1, rect.width / 2, rect.height / 2)
}
function fsZoomOut() {
  const wrapper = fsContentWrapperRef.value
  if (!wrapper) return
  const rect = wrapper.getBoundingClientRect()
  fsApplyZoom(-1, rect.width / 2, rect.height / 2)
}
function fsReset() {
  fsScale.value = 1
  fsPanX.value = 0
  fsPanY.value = 0
}

function onFsWheel(e) {
  const wrapper = fsContentWrapperRef.value
  if (!wrapper) return
  const rect = wrapper.getBoundingClientRect()
  const delta = e.deltaY > 0 ? -1 : 1
  fsApplyZoom(delta, e.clientX - rect.left, e.clientY - rect.top)
}

function onFsMouseDown(e) {
  if (e.button !== 0) return
  fsIsDragging = true
  fsDragStartX = e.clientX
  fsDragStartY = e.clientY
  fsDragStartPanX = fsPanX.value
  fsDragStartPanY = fsPanY.value
}

function onFsMouseMove(e) {
  if (!fsIsDragging) return
  fsPanX.value = fsDragStartPanX + (e.clientX - fsDragStartX)
  fsPanY.value = fsDragStartPanY + (e.clientY - fsDragStartY)
}

function onFsMouseUp() {
  fsIsDragging = false
}

// ==================== 生命周期 ====================
onMounted(async () => {
  await renderChart()

  themeObserver = new MutationObserver(() => { renderChart() })
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
})

onUnmounted(() => {
  if (themeObserver) {
    themeObserver.disconnect()
    themeObserver = null
  }
  closeFullscreen()
})
</script>

<style>
/* ============================================
   Mermaid 图表增强样式（me- 前缀）
   ============================================ */

/* ---------- 内联容器 ---------- */
.me-container {
  position: relative;
  overflow: hidden;
  user-select: none;
}

.me-svg-wrapper {
  transform-origin: 0 0;
  transition: none; /* 拖拽时不需要过渡 */
}

/* 确保按钮内的 SVG 不拦截点击事件 */
.me-btn svg {
  pointer-events: none;
}

/* ---------- 内联工具栏 ---------- */
.me-toolbar {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  align-items: center;
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

/* 缩放百分比徽章 */
.me-zoom-badge {
  font-size: 12px;
  font-weight: 600;
  color: #555;
  min-width: 40px;
  text-align: center;
  user-select: none;
  font-variant-numeric: tabular-nums;
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
  width: calc(100% - 80px);
  height: calc(100% - 100px);
  overflow: hidden;
  user-select: none;
}

.me-fs-svg-wrapper {
  transform-origin: 0 0;
}

.me-fs-svg-wrapper svg {
  max-width: none;
  max-height: none;
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

html.dark .me-zoom-badge {
  color: #bbb;
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