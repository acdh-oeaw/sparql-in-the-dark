<script lang="ts" setup>
import { VueMarkdownIt } from "@f3ve/vue-markdown-it";
import type { QueriesCollectionItem } from "@nuxt/content";
import { PlayIcon } from "lucide-vue-next";

import CodeHighlighter from "@/components/code-highlighter.vue";
import ScrollSection from "@/components/scroll-section.vue";

const props = defineProps<{
	lessonData: QueriesCollectionItem["chapters"][0];
	isLast: boolean;
}>();
const t = useTranslations();
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

/** Only set when the code fence opts in via `playground` (see `getPlaygroundExample`). */
const playgroundLink = computed(() => {
	const { code, playground } = props.lessonData;
	if (!code || playground == null) return undefined;
	return getPlaygroundLink(code, playground);
});
const handleStepVisible = (id: number) => {
	activeStepId.value = id;
};
</script>

<template>
	<template v-if="lessonData && lessonData.code && lessonData.steps">
		<div
			class="mx-auto max-w-3xl py-20 text-justify text-lg leading-relaxed text-neutral-600 md:text-xl dark:text-slate-400"
		>
			<VueMarkdownIt :source="lessonData.intro ?? ''" />
		</div>
		<div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-24">
			<div className="hidden self-start lg:sticky lg:top-32 lg:block">
				<div className="mb-6 flex items-center gap-4">
					<span
						className="font-mono text-xs tracking-widest text-neutral-500 uppercase dark:text-slate-500"
						>Progress</span
					>
					<div
						className="h-1 flex-1 overflow-hidden rounded-full bg-neutral-950/10 dark:bg-white/10"
					>
						<div
							className="h-full bg-primary transition-all duration-500 ease-out"
							:style="{ width: `${progress}%` }"
						/>
					</div>
					<span className="font-mono text-xs text-amber-600 dark:text-primary"
						>{{ Math.round(progress) }}%</span
					>
				</div>

				<div
					className="overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50 shadow-2xl ring-1 shadow-neutral-950/10 ring-neutral-950/5 dark:border-white/10 dark:bg-[#151928] dark:shadow-black/50 dark:ring-white/5"
				>
					<div
						className="flex items-center justify-between border-b border-neutral-200 bg-neutral-100 px-4 py-3 dark:border-white/5 dark:bg-[#1a1f30]"
					>
						<div className="flex items-center gap-2">
							<div className="size-3 rounded-full border border-red-500/50 bg-red-500/20"></div>
							<div
								className="size-3 rounded-full border border-yellow-500/50 bg-yellow-500/20"
							></div>
							<div className="size-3 rounded-full border border-green-500/50 bg-green-500/20"></div>
						</div>
						<div class="flex items-center gap-4">
							<NuxtLink
								v-if="playgroundLink"
								class="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs text-neutral-700 transition-colors hover:border-primary/50 hover:text-neutral-950 dark:border-white/10 dark:bg-surface-dark/50 dark:text-slate-300 dark:hover:text-white"
								:to="playgroundLink"
							>
								<PlayIcon class="size-3" />
								{{t("Playground.run-in-playground")}}
							</NuxtLink>
							<div className="font-mono text-xs text-neutral-500 dark:text-slate-500">
								query.sparql
							</div>
						</div>
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
					className="relative max-h-[30vh] overflow-auto border-b border-neutral-200 bg-neutral-50 p-4 pl-0 dark:border-white/10 dark:bg-[#151928]"
				>
					<NuxtLink
						v-if="playgroundLink"
						aria-label="Run in playground"
						class="sticky top-0 z-10 float-right inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs text-neutral-700 transition-colors hover:border-primary/50 hover:text-neutral-950 dark:border-white/10 dark:bg-surface-dark dark:text-slate-300 dark:hover:text-white"
						:to="playgroundLink"
					>
						<PlayIcon class="size-3" />
						{{t("Playground.run")}}
					</NuxtLink>
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
				<div
					className="absolute top-0 bottom-0 left-8 w-px bg-neutral-950/5 lg:hidden dark:bg-white/5"
				></div>

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
	@apply text-4xl md:text-5xl font-bold mb-6 text-neutral-950 leading-tight dark:text-white;
}

:not(.prose) > .vue-md-it-wrapper h2 {
	@apply text-2xl md:text-3xl font-bold my-6 text-neutral-950 leading-tight dark:text-white;
}

:not(.prose) > .vue-md-it-wrapper strong,
.vue-md-it-wrapper a {
	@apply text-neutral-950 dark:text-white;
}

blockquote {
	@apply text-left p-6 border border-primary/50 bg-surface-light opacity-100 text-neutral-950 text-base m-4 dark:bg-surface-dark dark:text-white;
}

.vue-md-it-wrapper p code {
	@apply text-amber-600 dark:text-primary;
}

:where(code):not(:where([class~="not-prose"], [class~="not-prose"] *))::before,
:where(code):not(:where([class~="not-prose"], [class~="not-prose"] *))::after,
.vue-md-it-wrapper p code ::after,
.vue-md-it-wrapper p code ::before {
	content: none;
}
</style>
