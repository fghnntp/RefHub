<template>
  <div class="container">
    <FastIndexPanel class="left-panel" />
    <div class="center-panel">
      <MarkdownPreviewer v-if="fileType === 'md'" />
      <PdfPreviewer v-else-if="fileType === 'pdf'" :file="selectedFileObj" />
      <div v-else class="unsupported-type">暂不支持该文件类型</div>
    </div>
    <MetaReferenceGraph class="right-panel" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useMarkdownStore } from './store'
import MarkdownPreviewer from './components/MarkdownPreviewer.vue'
import PdfPreviewer from './components/PdfPreviewer.vue'
import FastIndexPanel from './components/FastIndexPanel.vue'
import MetaReferenceGraph from './components/MetaReferenceGraph.vue'

const store = useMarkdownStore()
const selectedFile = computed(() => store.selectedFile)
const fileType = computed(() => {
  if (store.selectedFile?.ext === 'pdf') return 'pdf'
  if (store.selectedFile?.ext === 'md') return 'md'
  return 'md'
})
const selectedFileObj = computed(() => ({
  name: selectedFile.value.name,
  ext: fileType.value
}))
</script>


<style scoped>
.container {
  display: flex;
  height: 100vh;
  background: #f4f6fa;
  gap: 16px;
  padding: 16px 0;
  box-sizing: border-box;
}

.left-panel, .center-panel, .right-panel {
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.06);
  margin: 0 8px;
  overflow: auto;
  transition: box-shadow 0.2s;
}

.left-panel {
  width: 280px;
  min-width: 220px;
  max-width: 350px;
  border: none;
}

.center-panel {
  flex: 1;
  min-width: 300px;
}

.right-panel {
  width: 440px;
  min-width: 340px;
  max-width: 540px;
}

.left-panel:hover, .center-panel:hover, .right-panel:hover {
  box-shadow: 0 4px 24px 0 rgba(0,0,0,0.12);
}

/* 优化滚动条 */
.left-panel::-webkit-scrollbar,
.center-panel::-webkit-scrollbar,
.right-panel::-webkit-scrollbar {
  width: 8px;
  background: #f0f0f0;
}
.left-panel::-webkit-scrollbar-thumb,
.center-panel::-webkit-scrollbar-thumb,
.right-panel::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 4px;
}

/* 右侧大图预览 */
.meta-graph-hover-preview img {
  max-width: 340px;
  max-height: 200px;
  border-radius: 8px;
  box-shadow: 0 4px 24px #0003;
  background: #f8f8f8;
  padding: 4px;
}
.meta-graph-hover-preview {
  position: absolute;
  left: 28px;
  top: 28px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  box-shadow: 0 6px 24px #0002;
  padding: 16px;
  z-index: 10;
  min-width: 180px;
  min-height: 80px;
  max-width: 380px;
}

</style>