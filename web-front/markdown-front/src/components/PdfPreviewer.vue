<template>
  <div class="pdf-previewer">
    <div v-if="loading" class="loading">正在加载 PDF...</div>
    <div v-if="error" class="error">{{ error }}</div>
    <canvas v-show="!loading && !error" ref="canvasEl"></canvas>
    <div v-if="pageCount > 1" class="pdf-controls">
      <button @click="prevPage" :disabled="pageNum <= 1">上一页</button>
      <span>第 {{ pageNum }} / {{ pageCount }} 页</span>
      <button @click="nextPage" :disabled="pageNum >= pageCount">下一页</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'

// 传入 file: { name: string, ext: string }
const props = defineProps<{ file: { name: string, ext: string } }>()

const canvasEl = ref<HTMLCanvasElement | null>(null)
const loading = ref(true)
const error = ref('')
const pageNum = ref(1)
const pageCount = ref(1)
let pdfDoc: any = null

const pdfUrl = ref<string>()

import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf'
// 一定要写成下面这样，路径要和 public 里的保持一致
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'
import {getPdfUrl} from '../api/markdown'

// 渲染指定页
async function renderPage(num: number) {
  loading.value = true
  error.value = ''
  try {
    const page = await pdfDoc.getPage(num)
    const viewport = page.getViewport({ scale: 1.5 })
    const canvas = canvasEl.value!
    const context = canvas.getContext('2d')!
    canvas.height = viewport.height
    canvas.width = viewport.width
    await page.render({ canvasContext: context, viewport }).promise
    loading.value = false
  } catch (e: any) {
    error.value = 'PDF 渲染失败'
    loading.value = false
  }
}

async function loadPdf() {
  loading.value = true
  error.value = ''
  pageNum.value = 1
  try {
    console.log("Try to get pdf", props.file.name)
    pdfUrl.value = await getPdfUrl(props.file.name) // 应该返回 URL.createObjectURL(blob)
    pdfDoc = await pdfjsLib.getDocument(pdfUrl.value).promise
    pageCount.value = pdfDoc.numPages
    renderPage(pageNum.value)
  } catch (e: any) {
    error.value = 'PDF 加载失败'
    console.error('PDF 加载失败', e)
  } finally {
    loading.value = false
  }
}

function prevPage() {
  if (pageNum.value > 1) {
    pageNum.value--
    renderPage(pageNum.value)
  }
}
function nextPage() {
  if (pageNum.value < pageCount.value) {
    pageNum.value++
    renderPage(pageNum.value)
  }
}

watch(() => props.file.name, () => {
  console.log('File changed, reloading PDF:', props.file.name)
  loadPdf()
})

onMounted(() => {
  console.log('File Set, reloading PDF:', props.file.name)
  loadPdf()
})
</script>

<style scoped>
.pdf-previewer {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  height: 100%;
  width: 100%;
  position: relative;
  background: #f8fafc;
}
.loading {
  margin: 20px;
  color: #888;
}
.error {
  margin: 20px;
  color: #f56c6c;
}
canvas {
  margin: 24px auto 16px auto;
  max-width: 100%;
  background: #fff;
  border-radius: 6px;
  box-shadow: 0 1px 8px #0002;
}
.pdf-controls {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
}
button {
  border: none;
  background: #409eff;
  color: white;
  border-radius: 4px;
  padding: 4px 14px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}
button:disabled {
  background: #d3d3d3;
  color: #888;
  cursor: not-allowed;
}
</style>