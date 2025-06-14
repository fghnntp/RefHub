<template>
  <div class="container">
    <FastIndexPanel class="left-panel" />
    <MarkdownPreviewer class="center-panel" />
    <MetaReferenceGraph class="right-panel" />
  </div>
</template>

<script setup lang="ts">
import FastIndexPanel from './components/FastIndexPanel.vue'
import MarkdownPreviewer from './components/MarkdownPreviewer.vue'
import MetaReferenceGraph from './components/MetaReferenceGraph.vue'
</script>

<style scoped>
/* .container {
  display: flex;
  height: 100vh;
}
.left-panel {
  width: 280px;
  border-right: 1px solid #eee;
  background: #fafbfc;
  min-width: 220px;
  max-width: 350px;
  overflow: auto;
}
.center-panel {
  flex: 1;
  background: #fff;
  overflow: auto;
  min-width: 300px;
} */

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
  width: 320px;
  min-width: 220px;
  max-width: 400px;
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

</style>