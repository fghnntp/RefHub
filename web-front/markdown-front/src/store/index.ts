import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useMarkdownStore = defineStore('markdownStore', () => {
  // 当前选中的文档内容
  const content = ref<string>('# 欢迎使用三栏式 Markdown 编辑器\n\n请从左侧选择文档或在右侧快速输入区域录入内容。')
  const selectedFile = ref<{ name: string, ext: string } | null>(null)

  // 模拟：根据索引点击加载对应内容
  function setContent(newContent: string) {
    content.value = newContent
  }

  function setSelectedFile(filename: string | undefined | null) {
    if (typeof filename !== 'string' || !filename) {
      selectedFile.value = null
      return
    }
    console.log('setSelectedFile called with:', filename)
    const arr = filename.split('.')
    const ext = arr.length > 1 ? arr.pop()!.toLowerCase() : ''
    selectedFile.value = { name: filename, ext: ext }
  }

  return {
    content,
    selectedFile,
    setContent,
    setSelectedFile
  }
})

export const useRealMarkdownStore = defineStore('realMarkdownStore', () => {
  // 当前选中的文档内容
  const content = ref<string>('# 这是 RealMarkdownStore 的初始内容\n\n这里可以保存另一份 Markdown 文本。')

  // 切换文档时调用
  function setContent(newContent: string) {
    console.log('RealMarkdownStore setContent called with:', newContent)
    content.value = newContent
  }

  return {
    content,
    setContent,
  }
})