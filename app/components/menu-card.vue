<script setup lang="ts">
import type { QueriesCollectionItem } from "@nuxt/content";

const props = defineProps<{ value: QueriesCollectionItem }>();
</script>

<template>
	<NuxtLink
		class="relative block rounded-2xl border border-neutral-950/5 bg-surface-light p-8 opacity-100 shadow-lg/20 shadow-primary/10 backdrop-blur-sm transition-all duration-200 hover:border-primary/50 hover:bg-neutral-50 dark:border-white/5 dark:bg-surface-dark/50 dark:hover:bg-surface-dark"
		:to="props.value.path"
	>
		<div class="prose max-w-none dark:prose-invert">
			<h2>{{ props.value.title }}</h2>
			<p>{{ props.value.description }}</p>
		</div>
	</NuxtLink>
</template>
