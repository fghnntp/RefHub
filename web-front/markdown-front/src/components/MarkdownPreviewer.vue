<template>
  <div class="markdown-previewer">
    <div id="vditor-preview" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useMarkdownStore, useRealMarkdownStore } from '../store'

// @ts-ignore
declare const Vditor: any

const store = useMarkdownStore()
const realStore = useRealMarkdownStore()

let vditorPreview: any = null

onMounted(() => {
  vditorPreview = new Vditor('vditor-preview', {
    height: window.innerHeight - 36,
    mode: 'ir',
    toolbar: [],
    cache: { enable: false },
    value: store.content,
    after: () => {},
    preview: { mode: 'both' },
    outline: { enable: true, position: 'left' },
    counter: { enable: true},
    hint: {
      emoji: true,
      math: true,
      mark: true,
      linkBase: '',
      footnotes: true,
      toc: true
    },
    input: (val: string) => {  realStore.setContent(val) },
  })
})

watch(
  () => store.content,
  (newVal) => {
    if (vditorPreview) {
      vditorPreview.setValue(newVal)
    }
  }
)
</script>

<style scoped>
.markdown-previewer-container {
  display: flex;
  height: 100%;
}
.markdown-previewer {
  flex: 1;
  padding: 24px;
  height: 100%;
  box-sizing: border-box;
}
#vditor-preview {
  flex: 1;
}

</style>