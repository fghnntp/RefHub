import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useMarkdownStore = defineStore('markdownStore', () => {
  // 当前选中的文档内容
  const content = ref<string>('# 欢迎使用三栏式 Markdown 编辑器\n\n请从左侧选择文档或在右侧快速输入区域录入内容。')

  // 模拟：根据索引点击加载对应内容
  function setContent(newContent: string) {
    content.value = newContent
  }

  return {
    content,
    setContent,
  }
})