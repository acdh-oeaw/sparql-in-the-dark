<script lang="ts" setup>
import CodeHighlighter from "@/components/code-highlighter.vue";

const route = useRoute();
const { data: lessonData } = await useAsyncData(route.path, () => {
	return queryCollection("queries").path(route.path).first();
});
console.log(lessonData);
useSeoMeta({
	title: lessonData.value?.title,
	description: lessonData.value?.description,
});

const styles = {
	h1: "text-4xl md:text-5xl font-bold mb-6 text-white leading-tight",
	h2: "text-3xl md:text-4xl font-bold mt-4 mb-2 text-white leading-tight",
	p: "text-lg md:text-xl text-slate-400 leading-relaxed",
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
					className="my-3 overflow-hidden rounded-xl border border-white/10 bg-[#151928] shadow-2xl ring-1 shadow-black/50 ring-white/5"
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
						<div className="font-mono text-xs text-slate-500">query.{{ entry.props.language }}</div>
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
