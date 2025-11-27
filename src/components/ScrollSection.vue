<script setup lang="ts">
import { ref, onMounted, onUnmounted, defineProps, defineEmits } from 'vue'
import { VueMarkdownIt } from '@f3ve/vue-markdown-it'
import { ArrowLeft } from 'lucide-vue-next'

interface ScrollSectionProps {
  id: number
  content: string
  isActive: boolean
  isLast: boolean
}

const props = defineProps<ScrollSectionProps>()
const emit = defineEmits<{ (e: 'visible', id: number): void }>()
const refDiv = ref<HTMLElement | null>(null)

onMounted(() => {
  const observer = new window.IntersectionObserver(
    ([entry]) => {
      if (entry?.isIntersecting) {
        emit('visible', props.id)
      }
    },
    {
      root: null,
      rootMargin: '-40% 0px -40% 0px',
      threshold: 0,
    },
  )
  if (refDiv.value) {
    observer.observe(refDiv.value)
  }
  onUnmounted(() => {
    observer.disconnect()
  })
})

const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })
</script>

<template>
  <div
    ref="refDiv"
    :class="[
      'transition-all duration-500 min-h-[60vh] flex flex-col justify-center py-12 px-2',
      props.isLast ? 'pb-32' : '',
    ]"
  >
    <div
      :class="[
        'relative p-8 rounded-2xl border backdrop-blur-sm transition-all duration-500',
        props.isActive
          ? 'bg-surface-dark border-primary/50 shadow-lg shadow-primary/10 translate-x-0 opacity-100'
          : 'bg-surface-dark/50 border-white/5 opacity-40 translate-x-4 grayscale',
      ]"
    >
      <!-- Step Number Badge -->
      <div
        :class="[
          'absolute -top-4 -left-4 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-lg transition-colors duration-300',
          props.isActive ? 'bg-primary text-black' : 'bg-slate-700 text-slate-400',
        ]"
      >
        {{ props.id }}
      </div>
      <div class="prose prose-invert max-w-none">
        <VueMarkdownIt :source="props.content" />
      </div>
      <div
        v-if="props.isActive && props.isLast"
        class="mt-8 pt-4 border-t border-white/10 flex justify-center"
      >
        <button
          @click="scrollToTop"
          class="bg-primary hover:bg-primary/90 text-black font-medium py-2 px-6 rounded-full transition-colors flex items-center gap-2 group"
        >
          Restart Lesson
          <ArrowLeft class="size-4"></ArrowLeft>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Add any required styles here */
</style>
