<template>
  <div class="meta-graph-root">
    <div ref="container" class="meta-graph-canvas"></div>
    <div v-if="hoverNode && preview" class="meta-graph-hover-preview">
      <img v-if="preview.type==='image'" :src="preview.value" />
      <a v-else-if="preview.type==='link'" :href="preview.value" target="_blank">{{ preview.value }}</a>
      <span v-else>{{ preview.value }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import MarkdownIt from 'markdown-it'
import { useMarkdownStore, useRealMarkdownStore } from '../store'
import { Network } from 'vis-network/standalone'

const props = defineProps<{ markdown?: string }>()
const store = useMarkdownStore()
const realStore = useRealMarkdownStore()

const mdSource = computed(() => props.markdown ?? store.content)

const container = ref<HTMLDivElement | null>(null)
let network: Network | null = null
const hoverNode = ref<string|number|null>(null)
const preview = ref<{type: string, value: string}|null>(null)

function traverse(tokens: any[], cb: (t: any) => void) {
  for (const t of tokens) {
    cb(t)
    if (t.children?.length) traverse(t.children, cb)
  }
}

function parseMeta(md: string) {
  const mdParser = new MarkdownIt({ linkify: true })
  const tokens = mdParser.parse(md, {})
  const images: {src: string, alt: string}[] = []
  const links: {href: string, title: string}[] = []
  const tables: number[] = []
  const footnotes: string[] = []

  traverse(tokens, t => {
    if (t.type === 'image') images.push({ src: t.attrGet('src') || '', alt: t.content || t.attrGet('alt') || '' })
    if (t.type === 'link_open') links.push({ href: t.attrGet('href') || '', title: '' })
    if (t.type === 'table_open') tables.push(t.map ? t.map[0] : 0)
    if (t.type === 'footnote_reference_open') footnotes.push(t.meta?.label || '')
  })
  return { images, links, tables, footnotes }
}

function buildGraph(md: string) {
  const meta = parseMeta(md)
  const nodes: any[] = [
    { id: 1, label: '文档', shape: 'ellipse', color: '#4186e0' }
  ]
  const edges: any[] = []

  meta.images.forEach((img, idx) => {
    nodes.push({
      id: `img-${idx}`,
      label: img.alt || img.src,
      title: img.src,
      shape: 'image',
      image: img.src,
      color: '#f7d674',
      metaType: 'image',
      metaValue: img.src
    })
    edges.push({ from: 1, to: `img-${idx}`, label: '图片', color: '#f7d674' })
  })
  meta.links.forEach((link, idx) => {
    nodes.push({
      id: `link-${idx}`,
      label: link.href,
      title: link.href,
      shape: 'box',
      color: '#93e489',
      metaType: 'link',
      metaValue: link.href
    })
    edges.push({ from: 1, to: `link-${idx}`, label: '链接', color: '#93e489' })
  })
  meta.tables.forEach((t, idx) => {
    nodes.push({
      id: `table-${idx}`,
      label: '表格',
      shape: 'database',
      color: '#87d5fa',
      metaType: 'table',
      metaValue: '表格'
    })
    edges.push({ from: 1, to: `table-${idx}`, label: '表格', color: '#87d5fa' })
  })
  meta.footnotes.forEach((f, idx) => {
    nodes.push({
      id: `footnote-${idx}`,
      label: `脚注: ${f}`,
      shape: 'note',
      color: '#fa87b6',
      metaType: 'footnote',
      metaValue: f
    })
    edges.push({ from: 1, to: `footnote-${idx}`, label: '脚注', color: '#fa87b6' })
  })
  return { nodes, edges }
}

function renderGraph(md: string) {
  if (!container.value) return
  const { nodes, edges } = buildGraph(md)
  if (network) network.destroy()
  if (nodes.length === 1) {
    container.value.innerHTML = '<div style="color:#bbb;text-align:center;padding:2em;">当前文档无引用元素</div>'
    return
  }
  network = new Network(container.value, { nodes, edges }, {
    nodes: { shadow: true, font: { size: 16 } },
    edges: { arrows: { to: false }, smooth: true, font: { size: 12 } },
    physics: false,
    interaction: { hover: true }
  })
  network.on('hoverNode', (params: any) => {
    hoverNode.value = params.node
    const node = nodes.find(n => n.id === params.node)
    if (node) {
      if (node.metaType === 'image') preview.value = { type: 'image', value: node.metaValue }
      else if (node.metaType === 'link') preview.value = { type: 'link', value: node.metaValue }
      else preview.value = { type: 'text', value: node.label }
    }
  })
  network.on('blurNode', () => {
    hoverNode.value = null
    preview.value = null
  })
  network.on('click', (params: any) => {
    if (params.nodes.length) {
      const node = nodes.find(n => n.id === params.nodes[0])
      if (node && node.metaType === 'link') {
        window.open(node.metaValue, '_blank')
      }
    }
  })
}

watch(mdSource, (val) => renderGraph(val))
watch(() => realStore.content, (val) => {
  if (mdSource.value !== val) {
    mdSource.value = val
    renderGraph(val)
  }
})
onMounted(() => renderGraph(mdSource.value))
onUnmounted(() => { if (network) network.destroy() })
</script>

<style scoped>
.meta-graph-root {
  position: relative;
  height: 100%;
  width: 100%;
}
.meta-graph-canvas {
  width: 100%;
  height: 100%;
  min-height: 320px;
  background: #fff;
  border-radius: 8px;
}
.meta-graph-hover-preview {
  position: absolute;
  left: 20px;
  top: 20px;
  background: #fff;
  border: 1px solid #eee;
  border-radius: 8px;
  box-shadow: 0 4px 24px #0002;
  padding: 10px;
  z-index: 10;
  min-width: 120px;
  min-height: 40px;
  max-width: 260px;
}
.meta-graph-hover-preview img {
  max-width: 220px;
  max-height: 120px;
}
</style>