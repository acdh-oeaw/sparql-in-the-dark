<script setup lang="ts">
import { Github, Sparkles } from 'lucide-vue-next'
import ScrollSection from './components/ScrollSection.vue'
import CodeHighlighter from './components/CodeHighlighter.vue'
import { parseLessonMarkdown } from './utils/parser'

import introMd from '../public/queries/intro.md?raw'

const lessonData = parseLessonMarkdown(introMd)

const progress = ref(20)

const activeStep = computed(() => {
  return lessonData.steps.find((step) => step.id === activeStepId.value)
})
const activeStepId = ref(1)
const handleStepVisible = (id: number) => {
  activeStepId.value = id
}
</script>

<template>
  <div
    className="min-h-screen bg-background-dark text-white font-display selection:bg-primary/30 selection:text-white"
  >
    <header
      className="fixed top-0 left-0 right-0 z-50 bg-background-dark/80 backdrop-blur-md border-b border-white/5 h-16 flex items-center justify-between px-6 lg:px-12"
    >
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 bg-transparent text-primary rounded-lg flex items-center justify-center "
        >
          <Sparkles class="size-4" />
        </div>
        <h1 className="font-bold text-lg tracking-tight">SPARQL in the Dark</h1>
      </div>
      <div className="flex items-center gap-4">
        <a
          href="https://github.com/acdh-oeaw/sparql-in-the-dark"
          target="_blank"
          rel="noreferrer"
          className="text-slate-400 hover:text-white transition-colors"
        >
          <Github class="size-5" />
        </a>
      </div>
    </header>
    <main className="pt-24 pb-20 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center py-20 max-w-3xl mx-auto">
        <h2
          className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-slate-400 leading-tight"
        >
          {{ lessonData.title }}
        </h2>
        <p className="text-lg md:text-xl text-slate-400 leading-relaxed">
          {{ lessonData.description }}
        </p>
      </div>
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-start">
        <div className="hidden lg:block lg:sticky lg:top-32 self-start">
          <div className="mb-6 flex items-center gap-4">
            <span className="text-xs font-mono text-slate-500 uppercase tracking-widest"
              >Progress</span
            >
            <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500 ease-out"
                :style="{ width: `${progress}%` }"
              />
            </div>
            <span className="text-xs font-mono text-primary">{{ Math.round(progress) }}%</span>
          </div>

          <div
            className="rounded-xl overflow-hidden bg-[#151928] border border-white/10 shadow-2xl shadow-black/50 ring-1 ring-white/5"
          >
            <div
              className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-[#1a1f30]"
            >
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                <div
                  className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"
                ></div>
                <div
                  className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"
                ></div>
              </div>
              <div className="text-xs text-slate-500 font-mono">query.sparql</div>
            </div>
            <div className="py-4">
              <CodeHighlighter
                :code="lessonData.code"
                :activeLines="activeStep?.highlightLines ?? []"
              />
            </div>
          </div>
        </div>
        <!-- Mobile View -->
        <div className="lg:hidden sticky top-16 z-40 -mx-4 sm:mx-0 mb-8 shadow-2xl">
          <div
            className="bg-[#151928] border-b border-white/10 p-4 max-h-[30vh] overflow-auto custom-scrollbar"
          >
            <CodeHighlighter
              :code="lessonData.code"
              :activeLines="activeStep?.highlightLines ?? []"
            />
          </div>
          <div
            className="h-1 bg-primary transition-all duration-300"
            :style="{ width: `${progress}%` }"
          ></div>
        </div>

        <div className="relative">
          <div className="absolute left-8 top-0 bottom-0 w-px bg-white/5 lg:hidden"></div>

          <ScrollSection
            v-for="(step, index) in lessonData.steps"
            :key="step.id"
            :id="step.id"
            :content="step.content"
            :isActive="activeStepId === step.id"
            :onVisible="handleStepVisible"
            :isLast="index === lessonData.steps.length - 1"
          />
        </div>
      </div>
    </main>
  </div>
</template>
