<script setup lang="ts">
import hljs from 'highlight.js/lib/common'
import 'highlight.js/styles/github-dark.min.css'
import { computed } from 'vue'
import { toast } from 'vue-sonner'
import { Button } from './ui/button'
import { Separator } from './ui/separator'

const props = defineProps<{
  code: string
  lang: string
}>()
const language = computed(() => (hljs.getLanguage(props.lang) ? props.lang : 'plaintext'))
const highlighted = computed(() => hljs.highlight(props.code, { language: language.value }).value)
const onCopy = async () => {
  await navigator.clipboard.writeText(props.code)
  toast.success('Copied code to clipboard')
}
</script>
<template>
  <div class="hljs p-2 rounded-md border">
    <div class="flex items-center justify-between">
      <span class="p-2">{{ lang }}</span>
      <Button variant="ghost" @click="onCopy">Copy</Button>
    </div>
    <Separator class="my-2" />
    <pre
      class="p-1 overflow-x-auto"
    ><code :class="`language-${language}`" v-html="highlighted"></code></pre>
  </div>
</template>
