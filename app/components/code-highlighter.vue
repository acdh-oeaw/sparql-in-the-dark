<script setup lang="ts">
const props = defineProps<{
	code: string;
	activeLines: Array<number>;
}>();
const lines = computed(() => {
	return props.code.trim().split("\n");
});
function isHighlighted(line: number) {
	return props.activeLines.includes(line);
}
</script>

<template>
	<div className="overflow-x-auto font-mono text-sm leading-6">
		<div
			v-for="(line, index) in lines"
			:key="index"
			class="flex w-full px-1 py-0.5 transition-colors duration-300 lg:px-4"
			:class="
				isHighlighted(index)
					? 'border-l-2 border-primary bg-primary/20'
					: 'border-l-2 border-transparent hover:bg-white/5'
			"
		>
			<span className="mr-4 inline-block w-8 shrink-0 text-right text-slate-600 select-none">
				{{ index + 1 }}
			</span>
			<Shiki :code="line" language="sparql"></Shiki>
		</div>
	</div>
</template>

<style>
pre code.shiki {
	background-color: transparent !important;
}
</style>
