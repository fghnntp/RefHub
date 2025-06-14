<template>
  <div class="markdown-previewer">
    <div id="vditor-preview" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useMarkdownStore } from '../store'

// @ts-ignore
declare const Vditor: any

const store = useMarkdownStore()
let vditorPreview: any = null

onMounted(() => {
  vditorPreview = new Vditor('vditor-preview', {
    height: window.innerHeight - 36,
    mode: 'sv',
    toolbar: [],
    cache: { enable: false },
    value: store.content,
    after: () => {},
    preview: { mode: 'both' },
    input: (val: string) => { /* 禁止编辑 */ }
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

<!-- <style scoped>
.markdown-previewer {
  padding: 24px;
  height: 100%;
  box-sizing: border-box;
}
</style> -->

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