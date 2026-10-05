<script setup lang="ts">
useSeoMeta({
	title: "SPARQL in the Dark",
	description: "Patterns for Exploring Uncharted DH Knowledge Graphs",
});

const { data: allLessons } = await useAsyncData(() => {
	return queryCollection("queries").all();
});

const { data: intro } = await useAsyncData(() => {
	return queryCollection("content").first();
});
</script>

<template>
	<MainContent class="mx-auto max-w-3xl py-20">
		<div
			v-if="intro"
			id="intro"
			class="prose px-2 py-8 text-neutral-950 sm:px-6 sm:py-15 lg:prose-lg dark:text-white dark:prose-invert"
		>
			<ContentRenderer :value="intro"></ContentRenderer>
		</div>
		<ul>
			<li v-for="lesson in allLessons" :key="lesson.id" class="mb-8">
				<MenuCard :value="lesson" />
			</li>
		</ul>
	</MainContent>
</template>

<style>
@reference "../styles/index.css";

#intro h1 {
	@apply text-3xl sm:text-4xl leading-tight font-bold text-neutral-950 text-center dark:text-white;
}

#intro h1 + p {
	@apply text-center mb-6 text-neutral-950 dark:text-white;
}

#intro h2 {
	@apply mb-4 text-2xl leading-tight font-bold text-neutral-950 text-center dark:text-white;
}

#intro strong,
#intro a {
	@apply text-neutral-950 dark:text-white;
}
</style>
