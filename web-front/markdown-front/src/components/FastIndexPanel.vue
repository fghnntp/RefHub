<template>
  <div class="fast-index-panel">
    <div class="header-row">
      <span class="tab-title">目录模式</span>
      <el-button type="primary" icon="el-icon-plus" class="new-file-btn" @click="showCreateDialog = true">
        新建文件
      </el-button>
    </div>
    <div class="tab-content">
      <el-tree
        :data="fileTree"
        node-key="label"
        :props="treeProps"
        @node-click="onNodeClick"
        highlight-current
        :current-node-key="selectedFile"
        style="background: transparent; margin-top: 8px;"
      >
        <template #default="{ node, data }">
          <span class="file-item" :class="{selected: data.label === selectedFile}">
            <span @click.stop="onNodeClick(data)" class="file-label">{{ data.label }}</span>
            <el-dropdown @command="handleFileCommand($event, data)" trigger="click">
              <span class="file-actions">
                <el-icon><More /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="rename">重命名</el-dropdown-item>
                  <el-dropdown-item command="delete">删除</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </span>
        </template>
      </el-tree>
    </div>

    <!-- 新建文件对话框 -->
    <el-dialog v-model="showCreateDialog" title="新建Markdown文件" width="350px" @opened="focusInput">
      <el-input
        v-model="newFileName"
        placeholder="请输入文件名（如 example.md）"
        ref="newFileInput"
        autofocus
        @keyup.enter="createFile"
      />
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="createFile">创建</el-button>
      </template>
    </el-dialog>

    <!-- 重命名文件对话框 -->
    <el-dialog v-model="showRenameDialog" title="重命名文件" width="350px">
      <el-input v-model="renameFileName" placeholder="请输入新文件名（如 example.md）" />
      <template #footer>
        <el-button @click="showRenameDialog = false">取消</el-button>
        <el-button type="primary" @click="renameFile">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { More } from '@element-plus/icons-vue'
import { getFiles, getFile, saveFile, deleteFile } from '../api/markdown'
import { useMarkdownStore } from '../store'

const fileTree = ref<{ label: string }[]>([])
const treeProps = { children: 'children', label: 'label' }
const selectedFile = ref<string>('')

const showCreateDialog = ref(false)
const newFileName = ref('')
const newFileInput = ref<HTMLInputElement>()

const showRenameDialog = ref(false)
const renameFileName = ref('')
const renameTarget = ref<string>('')

const store = useMarkdownStore()

async function loadFiles() {
  fileTree.value = (await getFiles()).map(f => ({ label: f }))
}

async function onNodeClick(node: { label: string }) {
  selectedFile.value = node.label
  const content = await getFile(node.label)
  store.setContent(content)
}

function focusInput() {
  nextTick(() => {
    newFileInput.value?.focus()
  })
}

async function createFile() {
  const name = newFileName.value.trim()
  if (!name.endsWith('.md')) {
    ElMessage.warning('文件名必须以 .md 结尾')
    return
  }
  if (fileTree.value.some(f => f.label === name)) {
    ElMessage.error('文件名已存在')
    return
  }
  await saveFile(name, '')
  showCreateDialog.value = false
  newFileName.value = ''
  await loadFiles()
  await onNodeClick({ label: name })
}

async function removeFile(file: { label: string }) {
  await ElMessageBox.confirm(`确定要删除 ${file.label} 吗？`, '删除确认', { type: 'warning' })
  await deleteFile(file.label)
  await loadFiles()
  if (selectedFile.value === file.label) {
    const first = fileTree.value[0]
    if (first) await onNodeClick(first)
    else {
      selectedFile.value = ''
      store.setContent('')
    }
  }
}

function handleFileCommand(command: string, file: { label: string }) {
  if (command === 'rename') {
    renameTarget.value = file.label
    renameFileName.value = file.label
    showRenameDialog.value = true
  } else if (command === 'delete') {
    removeFile(file)
  }
}

async function renameFile() {
  const oldName = renameTarget.value
  const newName = renameFileName.value.trim()
  if (!newName.endsWith('.md')) {
    ElMessage.warning('文件名必须以 .md 结尾')
    return
  }
  if (oldName === newName) {
    showRenameDialog.value = false
    return
  }
  if (fileTree.value.some(f => f.label === newName)) {
    ElMessage.error('文件名已存在')
    return
  }
  const content = await getFile(oldName)
  await saveFile(newName, content)
  await deleteFile(oldName)
  showRenameDialog.value = false
  await loadFiles()
  await onNodeClick({ label: newName })
}


onMounted(async () => {
  await loadFiles()
  console.log('FastIndexPanel mounted, loading files...', fileTree.value)
  if (fileTree.value.length > 0) {
    // 直接取第一个文件名，获取内容并写入 store
    const firstFile = fileTree.value[0]
    selectedFile.value = firstFile.label
    const content = await getFile(firstFile.label)
    console.log('Loading content for:', content)
    store.setContent(content)
  } else {
    // 没有文件时清空 store
    selectedFile.value = ''
    store.setContent('')
  }
})


</script>

<style scoped>
.fast-index-panel {
  padding: 0 8px;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f8fafc;
}
.header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0 4px 0;
  margin-bottom: 0;
}
.tab-title {
  font-weight: bold;
  font-size: 15px;
  color: #3a3a3a;
  letter-spacing: 1px;
}
.new-file-btn {
  font-size: 13px;
  border-radius: 6px;
  padding: 3px 16px;
  box-shadow: 0 1px 3px #0001;
}
.tab-content {
  flex: 1;
  overflow-y: auto;
  padding-top: 4px;
}
.file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 32px;
  padding-right: 8px;
  font-size: 15px;
  border-radius: 4px;
  transition: background 0.15s;
}
.file-actions {
  margin-left: 8px;
  cursor: pointer;
  color: #bbb;
  font-size: 16px;
  visibility: hidden;
  transition: color 0.2s;
}
.file-item:hover .file-actions {
  visibility: visible;
  color: #409EFF;
}
.file-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.file-item.selected {
  font-weight: bold;
  color: #409EFF;
  background: #eaf4ff;
}
.el-tree {
  --el-tree-node-hover-bg-color: #f5f7fa;
  --el-tree-node-content-height: 32px;
}
</style>