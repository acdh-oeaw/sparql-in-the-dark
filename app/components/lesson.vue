<script lang="ts" setup>
import { VueMarkdownIt } from "@f3ve/vue-markdown-it";
import type { QueriesCollectionItem } from "@nuxt/content";

import CodeHighlighter from "@/components/code-highlighter.vue";
import ScrollSection from "@/components/scroll-section.vue";

const props = defineProps<{
	lessonData: QueriesCollectionItem["chapters"][0];
	isLast: boolean;
}>();

const progress = computed(() => {
	if (!props.lessonData || !props.lessonData.steps) return 0;
	const activeIndex = props.lessonData.steps.findIndex((step) => step.id === activeStepId.value);
	return (100 * (activeIndex + 1)) / props.lessonData.steps.length;
});

const activeStep = computed(() => {
	if (!props.lessonData || !props.lessonData.steps) return { highlightLines: null };
	return props.lessonData.steps.find((step) => step.id === activeStepId.value);
});
const activeStepId = ref(1);
const handleStepVisible = (id: number) => {
	activeStepId.value = id;
};
</script>

<template>
	<template v-if="lessonData && lessonData.code && lessonData.steps">
		<div
			class="mx-auto max-w-3xl py-20 text-center text-lg leading-relaxed text-slate-400 md:text-xl"
		>
			<VueMarkdownIt :source="lessonData.intro ?? ''" />
		</div>
		<div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-24">
			<div className="hidden self-start lg:sticky lg:top-32 lg:block">
				<div className="mb-6 flex items-center gap-4">
					<span className="font-mono text-xs tracking-widest text-slate-500 uppercase"
						>Progress</span
					>
					<div className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
						<div
							className="h-full bg-primary transition-all duration-500 ease-out"
							:style="{ width: `${progress}%` }"
						/>
					</div>
					<span className="font-mono text-xs text-primary">{{ Math.round(progress) }}%</span>
				</div>

				<div
					className="overflow-hidden rounded-xl border border-white/10 bg-[#151928] shadow-2xl ring-1 shadow-black/50 ring-white/5"
				>
					<div
						className="flex items-center justify-between border-b border-white/5 bg-[#1a1f30] px-4 py-3"
					>
						<div className="flex items-center gap-2">
							<div className="size-3 rounded-full border border-red-500/50 bg-red-500/20"></div>
							<div
								className="size-3 rounded-full border border-yellow-500/50 bg-yellow-500/20"
							></div>
							<div className="size-3 rounded-full border border-green-500/50 bg-green-500/20"></div>
						</div>
						<div className="font-mono text-xs text-slate-500">query.sparql</div>
					</div>
					<div v-if="lessonData.code" className="py-4">
						<CodeHighlighter
							:active-lines="activeStep?.highlightLines ?? []"
							:code="lessonData.code"
						/>
					</div>
				</div>
			</div>
			<!-- Mobile View -->
			<div className="sticky top-16 z-40 -mx-4 mb-8 shadow-2xl sm:mx-0 lg:hidden">
				<div
					v-if="lessonData.code"
					className="max-h-[30vh] overflow-auto border-b border-white/10 bg-[#151928] p-4 pl-0"
				>
					<CodeHighlighter
						:active-lines="activeStep?.highlightLines ?? []"
						:code="lessonData.code"
					/>
				</div>
				<div
					className="h-1 bg-primary transition-all duration-300"
					:style="{ width: `${progress}%` }"
				></div>
			</div>

			<div v-if="lessonData.steps" className="relative">
				<div className="absolute top-0 bottom-0 left-8 w-px bg-white/5 lg:hidden"></div>

				<ScrollSection
					v-for="(step, index) in lessonData.steps"
					:id="step.id"
					:key="step.id"
					:content="step.content"
					:is-active="activeStepId === step.id"
					:is-last="props.isLast && index === lessonData.steps.length - 1"
					@visible="handleStepVisible"
				/>
			</div>
		</div>
	</template>
</template>

<style>
@reference "../styles/index.css";

.vue-md-it-wrapper h1 {
	@apply text-4xl md:text-5xl font-bold mb-6 text-white leading-tight;
}

:not(.prose) > .vue-md-it-wrapper h2 {
	@apply text-2xl md:text-3xl font-bold my-6 text-white leading-tight;
}

:not(.prose) > .vue-md-it-wrapper strong,
.vue-md-it-wrapper a {
	@apply text-white;
}

blockquote {
	@apply text-left p-6 border border-primary/50 bg-surface-dark opacity-100 text-white text-base m-4;
}

.vue-md-it-wrapper p code {
	@apply text-primary;
}

:where(code):not(:where([class~="not-prose"], [class~="not-prose"] *))::before,
:where(code):not(:where([class~="not-prose"], [class~="not-prose"] *))::after,
.vue-md-it-wrapper p code ::after,
.vue-md-it-wrapper p code ::before {
	content: none;
}
</style>
