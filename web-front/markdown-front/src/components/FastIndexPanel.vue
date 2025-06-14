<template>
  <div class="fast-index-panel">
    <el-tabs v-model="activeTab" class="top-tabs">
      <el-tab-pane label="目录模式" name="catalog"></el-tab-pane>
      <el-tab-pane label="图谱模式" name="graph"></el-tab-pane>
      <el-tab-pane label="网络图模式" name="network"></el-tab-pane>
    </el-tabs>
    <div class="tab-content">
      <template v-if="activeTab === 'catalog'">
        <el-tree
          :data="treeData"
          :props="treeProps"
          @node-click="onNodeClick"
          highlight-current
          style="background: transparent;"
        />
      </template>
      <template v-else-if="activeTab === 'graph'">
        <div class="placeholder">图谱模式内容区域（可扩展为知识图谱等）</div>
      </template>
      <template v-else-if="activeTab === 'network'">
        <div class="placeholder">网络图模式内容区域（可扩展为引用网络图等）</div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useMarkdownStore } from '../store'

const activeTab = ref('catalog')

const treeData = [
  { label: 'README.md', content: '# README\n\n这是项目简介内容。' },
  { label: '快速开始.md', content: '# 快速开始\n\n本节介绍如何快速上手。' },
  { label: '使用文档.md', content: '# 使用文档\n\n详细的使用说明。' }
]
const treeProps = { children: 'children', label: 'label' }

const store = useMarkdownStore()

function onNodeClick(node: any) {
  store.setContent(node.content)
}
</script>

<style scoped>
.fast-index-panel {
  padding: 0 8px;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.top-tabs {
  margin-bottom: 8px;
}
.tab-content {
  flex: 1;
  overflow-y: auto;
  padding-top: 8px;
}
.placeholder {
  color: #999;
  text-align: center;
  margin-top: 40px;
}
</style>