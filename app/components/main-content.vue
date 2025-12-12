<script lang="ts" setup>
const id = "main-content";
</script>

<template>
	<main :id="id" className="mx-auto max-w-[1600px] px-4 pt-24 pb-20 sm:px-6 lg:px-8" tabindex="-1">
		<slot />
	</main>
</template>
