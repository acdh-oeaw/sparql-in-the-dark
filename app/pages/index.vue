<script setup lang="ts">
useSeoMeta({
	title: "SPARQL in the Dark",
	description: "Patterns for Exploring Uncharted DH Knowledge Graphs",
});

const { data: allLessons } = await useAsyncData(() => {
	return queryCollection("queries").all();
});

const {data: intro} = await useAsyncData(() => {
	return queryCollection("content").first()
})

</script>

<template>
	<MainContent class="mx-auto max-w-3xl py-20">
		<div v-if="intro" id="intro" class="prose px-6 py-15 text-white lg:prose-lg">

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

	@reference "tailwindcss";

	#intro h1{
		@apply text-4xl leading-tight font-bold text-white text-center
	}

	#intro h1+p{
		@apply  text-center mb-6
	}

	#intro h2{
		@apply mb-4 text-2xl leading-tight font-bold text-white text-center
	}

	#intro strong, #intro a {
		@apply text-white
	}

</style>
