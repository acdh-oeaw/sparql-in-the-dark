<script setup lang="ts">
useSeoMeta({
	title: "SPARQL in the Dark",
	description: "Patterns for Exploring Uncharted DH Knowledge Graphs",
});

const { data: allLessons } = await useAsyncData(() => {
	return queryCollection("queries").all();
});
</script>

<template>
	<MainContent class="mx-auto max-w-3xl py-20">
		<div className="py-20 text-center">
			<h1 className="mb-6 text-4xl leading-tight font-bold text-white md:text-5xl">
				SPARQL in the Dark
			</h1>

			<div className="text-left text-lg leading-relaxed text-slate-400 md:text-xl">
				<p>
					SPARQL in the Dark is a collection of practical SPARQL patterns and strategies for
					exploring unknown Knowledge Graphs.
				</p>
				<p>
					The patterns presented here treat SPARQL as a discovery tool for incrementally (and often
					maieutically) revealing Knowledge Graph structure, entities, relationships, and modelling
					conventions - i.e. the data shapes manifested in a given graph.
				</p>
				<p>
					This repository provides reusable SPARQL query templates, methodological notes, as well as
					examples and query strategies drawn from Digital Humanities datasets, but the patterns
					generalize to any unfamiliar RDF graph.
				</p>
			</div>
		</div>
		<ul>
			<li v-for="lesson in allLessons" :key="lesson.id" class="mb-8">
				<MenuCard :value="lesson" />
			</li>
		</ul>
	</MainContent>
</template>
