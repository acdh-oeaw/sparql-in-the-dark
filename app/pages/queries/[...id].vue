<script lang="ts" setup>
import { PlayIcon } from "lucide-vue-next";

import CodeHighlighter from "@/components/code-highlighter.vue";

const route = useRoute();
const { data: lessonData } = await useAsyncData(route.path, () => {
	return queryCollection("queries").path(route.path).first();
});
const t = useTranslations();
useSeoMeta({
	title: lessonData.value?.title,
	description: lessonData.value?.description,
});

const styles = {
	h1: "text-4xl md:text-5xl font-bold mb-6 text-neutral-950 leading-tight dark:text-white",
	h2: "text-3xl md:text-4xl font-bold mt-4 mb-2 text-neutral-950 leading-tight dark:text-white",
	p: "text-lg md:text-xl text-neutral-600 leading-relaxed dark:text-slate-400",
};

const children = computed(() => {
	//@ts-expect-error unknown property children
	return lessonData.value?.body.children;
});
</script>

<template>
	<MainContent>
		<template v-if="lessonData && lessonData.chapters">
			<Lesson
				v-for="(chapter, idx) in lessonData.chapters"
				:key="`lesson-${idx}`"
				:is-last="idx === lessonData.chapters.length - 1"
				:lesson-data="chapter"
			></Lesson>
		</template>
		<div v-else class="mx-auto max-w-3xl py-20">
			<!-- If the format does not match the One-codeblock-plus-explanation-schema -->
			<template v-for="(entry, idx) in children" :key="idx">
				<div
					v-if="entry.tag === 'pre'"
					className="my-3 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50 shadow-2xl ring-1 shadow-neutral-950/10 ring-neutral-950/5 dark:border-white/10 dark:bg-[#151928] dark:shadow-black/50 dark:ring-white/5"
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
								v-if="getPlaygroundExample(entry.props.meta ?? '') !== undefined"
								class="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs text-neutral-700 transition-colors hover:border-primary/50 hover:text-neutral-950 dark:border-white/10 dark:bg-surface-dark/50 dark:text-slate-300 dark:hover:text-white"
								:to="
									getPlaygroundLink(entry.props.code, getPlaygroundExample(entry.props.meta ?? ''))
								"
							>
								<PlayIcon class="size-3" />
								{{ t("Playground.run-in-playground") }}
							</NuxtLink>
							<div className="font-mono text-xs text-neutral-500 dark:text-slate-500">
								query.{{ entry.props.language }}
							</div>
						</div>
					</div>
					<div className="py-4">
						<CodeHighlighter :active-lines="[]" :code="entry.props.code" />
					</div>
				</div>
				<ContentRenderer v-else :class="styles[entry.tag as 'h1']" :value="entry"></ContentRenderer>
			</template>
		</div>
	</MainContent>
</template>
