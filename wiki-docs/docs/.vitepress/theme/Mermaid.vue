<template>
  <div class="mermaid-wrapper">
    <div ref="container" class="mermaid-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'

const props = defineProps({
  id: { type: String, default: '' }
})

const container = ref(null)

onMounted(async () => {
  await nextTick()
  if (!container.value) return

  // 从 DOM 中读取原始 mermaid 代码（通过 v-pre 保护）
  const rawEl = document.getElementById(props.id)
  if (!rawEl) {
    console.error('Mermaid 源元素未找到:', props.id)
    return
  }

  const graph = rawEl.textContent.trim()
  if (!graph) return

  const mermaid = (await import('mermaid')).default

  mermaid.initialize({
    startOnLoad: false,
    theme: 'default',
    securityLevel: 'loose',
    fontFamily: '"Noto Sans SC", "Microsoft YaHei", sans-serif'
  })

  try {
    const { svg } = await mermaid.render(
      'mermaid-' + Math.random().toString(36).substring(2, 9),
      graph
    )
    container.value.innerHTML = svg
  } catch (err) {
    console.error('Mermaid 渲染失败:', err)
    container.value.innerHTML = `<pre style="color:red;white-space:pre-wrap">${err.message}</pre>`
  }
})
</script>

<style scoped>
.mermaid-wrapper {
  margin: 1.5rem 0;
}
.mermaid-container {
  text-align: center;
}
.mermaid-container :deep(svg) {
  max-width: 100%;
  height: auto;
}
</style>