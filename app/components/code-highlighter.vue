<script setup lang="ts">
import "highlight.js/styles/stackoverflow-light.css";
import "highlightjs-sparql";

import hljsVuePlugin from "@highlightjs/vue-plugin";
import hljs from "highlight.js/lib/core";
import javascript from "highlight.js/lib/languages/javascript";

hljs.registerLanguage("javascript", javascript);

const HLJSComponent = hljsVuePlugin.component;

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
watch(
	() => props.code,
	() => {
		hljs.highlightAll();
	},
);
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
			<HLJSComponent :code="line" language="javascript"></HLJSComponent>
		</div>
	</div>
</template>

<style>
.hljs {
	background: unset;
	color: unset;
}

pre code.hljs {
	padding: 0;
}
</style>
