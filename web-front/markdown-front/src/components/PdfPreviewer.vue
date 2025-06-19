<template>
  <div class="pdf-previewer">
    <div v-if="loading" class="loading">正在加载 PDF...</div>
    <div v-if="error" class="error">{{ error }}</div>
    
    <div v-show="!loading && !error" class="pdf-container">
      <!-- 目录侧栏 -->
      <div class="pdf-outline" v-if="outline && outline.length">
        <div class="outline-title">目录</div>
        <ul>
          <template v-for="item in outline" :key="item.title">
            <li>
              <a href="javascript:;" @click="jumpToOutline(item)">{{ item.title }}</a>
              <ul v-if="item.items && item.items.length">
                <template v-for="sub in item.items" :key="sub.title">
                  <li>
                    <a href="javascript:;" @click="jumpToOutline(sub)">{{ sub.title }}</a>
                  </li>
                </template>
              </ul>
            </li>
          </template>
        </ul>
      </div>
      <div class="pdf-main">
        <!-- 缩放控制 -->
        <div class="pdf-zoom">
          <button @click="zoomOut" :disabled="scale <= 0.5">-</button>
          <span>{{ Math.round(scale * 100) }}%</span>
          <button @click="zoomIn" :disabled="scale >= 3">+</button>
        </div>
      
        <canvas ref="canvasEl"></canvas>
        <div v-if="pageCount > 1" class="pdf-controls">
          <button @click="prevPage" :disabled="pageNum <= 1">上一页</button>
          <span>第 {{ pageNum }} / {{ pageCount }} 页</span>
          <button @click="nextPage" :disabled="pageNum >= pageCount">下一页</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
const props = defineProps<{ file: { name: string, ext: string } }>()

const canvasEl = ref<HTMLCanvasElement | null>(null)
const loading = ref(true)
const error = ref('')
const pageNum = ref(1)
const pageCount = ref(1)
const scale = ref(1.5)
let pdfDoc: any = null
const outline = ref<any[]>([])
const pdfUrl = ref<string>()

import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf'
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'
import { getPdfUrl } from '../api/markdown'


let renderTask: any = null
let lastRenderPromise: Promise<any> = Promise.resolve()

async function renderPage(num: number) {
  // 串行化渲染，等待上一次渲染彻底完成
  lastRenderPromise = lastRenderPromise.then(async () => {
    loading.value = true
    error.value = ''
    // 取消上一次渲染
    if (renderTask && renderTask.cancel) {
      try {
        renderTask.cancel()
        await renderTask.promise.catch((e: any) => {
          if (e && e.name !== 'RenderingCancelledException') throw e
        })
      } catch {}
    }
    try {
      const page = await pdfDoc.getPage(num)
      const viewport = page.getViewport({ scale: scale.value })
      const canvas = canvasEl.value!
      const context = canvas.getContext('2d')!
      canvas.height = viewport.height
      canvas.width = viewport.width
      renderTask = page.render({ canvasContext: context, viewport })
      await renderTask.promise
      loading.value = false
    } catch (e: any) {
      if (e && e.name === 'RenderingCancelledException') {
        // 忽略取消异常
      } else {
        error.value = 'PDF 渲染失败: ' + e
      }
      loading.value = false
    }
  })
  // 等待本次渲染完成再返回
  await lastRenderPromise
}

async function loadPdf() {
  loading.value = true
  error.value = ''
  pageNum.value = 1
  outline.value = []
  try {
    pdfUrl.value = await getPdfUrl(props.file.name)
    pdfDoc = await pdfjsLib.getDocument(pdfUrl.value).promise
    pageCount.value = pdfDoc.numPages
    // 获取目录
    const o = await pdfDoc.getOutline()
    outline.value = o || []
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
function zoomIn() {
  if (scale.value < 3) {
    scale.value += 0.2
    renderPage(pageNum.value)
  }
}
function zoomOut() {
  if (scale.value > 0.5) {
    scale.value -= 0.2
    renderPage(pageNum.value)
  }
}

// 跳转到目录对应的页码
async function jumpToOutline(item: any) {
  if (item.dest) {
    let dest = item.dest
    if (typeof dest === 'string') {
      dest = await pdfDoc.getDestination(dest)
    }
    const pageIndex = await pdfDoc.getPageIndex(dest[0])
    pageNum.value = pageIndex + 1
    renderPage(pageNum.value)
  }
}

watch(() => props.file.name, () => {
  loadPdf()
})

watch(scale, () => {
  renderPage(pageNum.value)
})

onMounted(() => {
  loadPdf()
})
</script>

<style scoped>
.pdf-previewer {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  height: 100%;
  width: 100%;
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

.pdf-container {
  display: flex;
  width: 100%;
  height: 100%;
}
.pdf-outline {
  width: 200px;
  background: #f3f4f6;
  border-right: 1px solid #eee;
  overflow-y: auto;
  padding: 8px 12px;
}
.outline-title {
  font-weight: bold;
  margin-bottom: 8px;
}
.pdf-outline ul {
  padding-left: 16px;
}
.pdf-outline a {
  color: #409eff;
  text-decoration: none;
  cursor: pointer;
  font-size: 14px;
}
.pdf-outline a:hover {
  text-decoration: underline;
}
.pdf-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.pdf-zoom {
  display: flex;
  align-items: center;
  margin: 10px 0 0 0;
  gap: 6px;
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