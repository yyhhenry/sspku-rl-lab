<script setup lang="ts">
import hljs from 'highlight.js/lib/common'
import 'highlight.js/styles/github-dark.min.css'
import { computed } from 'vue'
import { toast } from 'vue-sonner'

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
  <div class="hljs pa-2" style="border-radius: 1em">
    <div class="d-flex align-center">
      <span class="pa-2">{{ lang }}</span>
      <v-spacer></v-spacer>
      <v-btn variant="plain" icon="mdi-content-copy" @click="onCopy"></v-btn>
    </div>
    <v-divider></v-divider>
    <pre
      class="p-1 overflow-x-auto"
    ><code :class="`language-${language}`" v-html="highlighted"></code></pre>
  </div>
</template>
