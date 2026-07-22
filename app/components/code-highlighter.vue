<script setup lang="ts">
const props = withDefaults(
	defineProps<{
		code: string;
		activeLines?: Array<number>;
		editable?: boolean;
		language?: string;
	}>(),
	{
		activeLines: () => {
			return [];
		},
		editable: false,
		language: "sparql",
	},
);

const emit = defineEmits<{ "update:code": [value: string] }>();

const lines = computed(() => {
	// Keep the raw value while editing so the highlight layer stays aligned with
	// the textarea caret; trim only in the read-only presentation.
	return (props.editable ? props.code : props.code.trim()).split("\n");
});

function isHighlighted(line: number) {
	return props.activeLines.includes(line);
}

function onInput(event: Event) {
	emit("update:code", (event.target as HTMLTextAreaElement).value);
}

function onKeydown(event: KeyboardEvent) {
	if (event.key !== "Tab") return;
	// Insert two spaces instead of moving focus out of the editor.
	event.preventDefault();
	const textarea = event.target as HTMLTextAreaElement;
	const { selectionStart, selectionEnd, value } = textarea;
	emit("update:code", `${value.slice(0, selectionStart)}  ${value.slice(selectionEnd)}`);
	void nextTick(() => {
		textarea.selectionStart = textarea.selectionEnd = selectionStart + 2;
	});
}
</script>

<template>
	<div v-if="!editable" class="overflow-x-auto font-mono text-sm leading-6">
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
			<span class="mr-4 inline-block w-8 shrink-0 text-right text-slate-600 select-none">
				{{ index + 1 }}
			</span>
			<Shiki :code="line" :language="language" />
		</div>
	</div>

	<div v-else class="grid overflow-auto font-mono text-sm leading-6">
		<div aria-hidden="true" class="pointer-events-none col-start-1 row-start-1 select-none">
			<div v-for="(line, index) in lines" :key="index" class="flex w-full px-1 lg:px-4">
				<span class="mr-4 inline-block w-8 shrink-0 text-right text-slate-600 select-none">
					{{ index + 1 }}
				</span>
				<Shiki :code="line.length ? line : ' '" :language="language" />
			</div>
		</div>
		<textarea
			aria-label="Code editor"
			autocapitalize="off"
			autocomplete="off"
			class="col-start-1 row-start-1 w-full resize-none overflow-hidden bg-transparent pr-1 pl-13 leading-6 whitespace-pre text-transparent caret-white outline-none lg:pr-4 lg:pl-16"
			spellcheck="false"
			:value="code"
			wrap="off"
			@input="onInput"
			@keydown="onKeydown"
		></textarea>
	</div>
</template>

<style>
pre code.shiki {
	background-color: transparent !important;
}
</style>
