<script setup lang="ts">
import { VueMarkdownIt } from "@f3ve/vue-markdown-it";
import { ArrowLeftIcon } from "lucide-vue-next";
import { onMounted, onUnmounted, ref } from "vue";

interface ScrollSectionProps {
	id: number;
	content: string;
	isActive: boolean;
	isLast: boolean;
}

const props = defineProps<ScrollSectionProps>();
const emit = defineEmits<{ (e: "visible", id: number): void }>();
const refDiv = ref<HTMLElement | null>(null);

onMounted(() => {
	const observer = new window.IntersectionObserver(
		([entry]) => {
			if (entry?.isIntersecting) {
				emit("visible", props.id);
			}
		},
		{
			root: null,
			rootMargin: "-40% 0px -40% 0px",
			threshold: 0,
		},
	);
	if (refDiv.value) {
		observer.observe(refDiv.value);
	}
	onUnmounted(() => {
		observer.disconnect();
	});
});

// const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
</script>

<template>
	<div
		ref="refDiv"
		:class="[
			'flex min-h-[60vh] flex-col justify-center px-2 py-12 transition-all duration-500',
			props.isLast ? 'pb-32' : '',
		]"
	>
		<div
			:class="[
				'relative rounded-2xl border p-8 backdrop-blur-sm transition-all duration-500',
				props.isActive
					? 'translate-x-0 border-primary/50 bg-surface-dark opacity-100 shadow-lg shadow-primary/10'
					: 'translate-x-4 border-white/5 bg-surface-dark/50 opacity-40 grayscale',
			]"
		>
			<!-- Step Number Badge -->
			<div
				:class="[
					'absolute -top-4 -left-4 flex size-10 items-center justify-center rounded-full text-lg font-bold shadow-lg transition-colors duration-300',
					props.isActive ? 'bg-primary text-dark' : 'bg-slate-700 text-slate-400',
				]"
			>
				{{ props.id }}
			</div>
			<div class="prose max-w-none prose-invert">
				<VueMarkdownIt :source="props.content" />
			</div>
			<div
				v-if="props.isActive && props.isLast"
				class="mt-8 flex justify-center border-t border-white/10 pt-4"
			>
				<NuxtLink
					class="group flex items-center gap-2 rounded-full bg-primary px-6 py-2 font-medium text-dark transition-colors hover:bg-primary/90"
					to="/"
				>
					Back to overview
					<ArrowLeftIcon class="size-4"></ArrowLeftIcon>
				</NuxtLink>
			</div>
		</div>
	</div>
</template>
