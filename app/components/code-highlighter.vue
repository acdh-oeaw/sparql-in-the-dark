<script setup lang="ts">
type CodeLanguage = "json" | "sparql" | "turtle" | "xml";

const props = withDefaults(
	defineProps<{
		code: string;
		activeLines?: Array<number>;
		editable?: boolean;
		language?: CodeLanguage;
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
const root = useTemplateRef("root");

function getScrollParent(start: HTMLElement | null) {
	for (let element = start; element && element !== document.body; element = element.parentElement) {
		const { overflowY } = getComputedStyle(element);
		const isScrollable = overflowY === "auto" || overflowY === "scroll";
		if (isScrollable && element.scrollHeight > element.clientHeight) return element;
	}
	return null;
}
// can be simplified once scrollIntoView's `container` option has wider support: https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView#container
function scrollActiveLinesIntoView() {
	const activeLines = root.value?.querySelectorAll<HTMLElement>("[data-active]");
	const first = activeLines?.[0];
	const last = activeLines?.[activeLines.length - 1];
	if (!first || !last) return;
	const scrollParent = getScrollParent(root.value);
	if (!scrollParent) return;

	const padding = 16;
	const offset = scrollParent.getBoundingClientRect().top - scrollParent.scrollTop;
	const top = first.getBoundingClientRect().top - offset - padding;
	const bottom = last.getBoundingClientRect().bottom - offset + padding;
	const viewTop = scrollParent.scrollTop;
	const viewBottom = viewTop + scrollParent.clientHeight;

	let target: number;
	if (top < viewTop || bottom - top > scrollParent.clientHeight) target = top;
	else if (bottom > viewBottom) target = bottom - scrollParent.clientHeight;
	else return;
	scrollParent.scrollTo({ top: target, behavior: "smooth" });
}

watch(
	() => props.activeLines,
	() => {
		void nextTick(scrollActiveLinesIntoView);
	},
);
</script>

<template>
	<div v-if="!editable" ref="root" class="overflow-auto font-mono text-sm leading-6">
		<div
			v-for="(line, index) in lines"
			:key="index"
			class="flex w-full px-1 py-0.5 transition-colors duration-300 lg:px-4"
			:class="
				isHighlighted(index)
					? 'border-l-2 border-primary bg-primary/20'
					: 'border-l-2 border-transparent hover:bg-neutral-950/5 dark:hover:bg-white/5'
			"
			:data-active="isHighlighted(index) || undefined"
		>
			<span
				class="mr-4 inline-block w-8 shrink-0 text-right text-neutral-400 select-none dark:text-slate-600"
			>
				{{ index + 1 }}
			</span>
			<Shiki :code="line" :lang="language" />
		</div>
	</div>

	<div v-else class="grid overflow-auto font-mono text-sm leading-6">
		<div aria-hidden="true" class="pointer-events-none col-start-1 row-start-1 select-none">
			<div v-for="(line, index) in lines" :key="index" class="flex w-full px-1 lg:px-4">
				<span
					class="mr-4 inline-block w-8 shrink-0 text-right text-neutral-400 select-none dark:text-slate-600"
				>
					{{ index + 1 }}
				</span>
				<Shiki :code="line.length ? line : ' '" :language="language" />
			</div>
		</div>
		<textarea
			aria-label="Code editor"
			autocapitalize="off"
			autocomplete="off"
			class="col-start-1 row-start-1 w-full resize-none overflow-hidden bg-transparent pr-1 pl-13 leading-6 whitespace-pre text-transparent caret-neutral-950 outline-none lg:pr-4 lg:pl-16 dark:caret-white"
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
