<script setup lang="ts">
import 'highlight.js/styles/stackoverflow-light.css'
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import hljsVuePlugin from '@highlightjs/vue-plugin'

import 'highlightjs-sparql'

hljs.registerLanguage('javascript', javascript)

const HLJSComponent = hljsVuePlugin.component

const props = defineProps<{
  code: string
  activeLines: Array<number>
}>()
const lines = computed(() => {
  return props.code.trim().split('\n')
})
function isHighlighted(line: number) {
  return props.activeLines.includes(line)
}
watch(
  () => props.code,
  () => {
    hljs.highlightAll()
  },
)
</script>
<template>
  <div className="font-mono text-sm leading-6 overflow-x-auto custom-scrollbar">
    <div
      v-for="(line, index) in lines"
      :key="index"
      class="px-4 py-0.5 w-full transition-colors duration-300 flex"
      :class="
        isHighlighted(index)
          ? 'bg-primary/20 border-l-2 border-primary'
          : 'border-l-2 border-transparent hover:bg-white/5'
      "
    >
      <span className="inline-block w-8 text-right mr-4 text-slate-600 select-none flex-shrink-0">
        {{ index + 1 }}
      </span>
      <HLJSComponent :code="line" language="javascript"></HLJSComponent>
    </div>
  </div>
</template>

<style>
.hljs {
  color: unset;
  background: unset;
}
pre code.hljs {
  padding: 0;
}
</style>
