<script lang="ts" setup>
import { GithubIcon,SparklesIcon } from "lucide-vue-next";

// import type { NuxtLinkProps } from "#app";

// const t = useTranslations();

// const links = computed(() => {
// 	return {
// 		home: { href: { path: "/" }, label: t("AppHeader.links.home") },
// 	} satisfies Record<string, { href: NuxtLinkProps["href"]; label: string }>;
// });
</script>

<template>
	<header
		class="fixed top-0 right-0 left-0 z-50 flex h-16 items-center justify-between border-b border-white/5 bg-background-dark/80 px-6 backdrop-blur-md lg:px-12"
	>
		<NuxtLink class="flex items-center gap-3" to="/">
			<div class="flex size-8 items-center justify-center rounded-lg bg-transparent text-primary">
				<SparklesIcon class="size-4" />
			</div>

			<h1 class="inline text-lg font-bold tracking-tight">SPARQL in the Dark</h1>
		</NuxtLink>
		<div class="flex items-center gap-4">
			<a
				class="text-slate-400 transition-colors hover:text-white"
				href="https://github.com/acdh-oeaw/sparql-in-the-dark"
				rel="noreferrer"
				target="_blank"
			>
				<GithubIcon class="size-5" />
				<span class="sr-only">Check out our Github repository</span>
			</a>
		</div>
	</header>
</template>
