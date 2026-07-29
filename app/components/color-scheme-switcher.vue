<script lang="ts" setup>
import { ChevronDownIcon, MonitorIcon, MoonIcon, SunIcon } from "lucide-vue-next";

const t = useTranslations();

const colorMode = useColorMode();

const colorSchemes = ["system", "light", "dark"] as const;
</script>

<template>
	<ClientOnly>
		<label class="relative flex items-center">
			<span class="sr-only">{{ t("ColorSchemeToggle.change-color-scheme") }}</span>
			<component
				:is="
					colorMode.value === 'dark'
						? MoonIcon
						: colorMode.value === 'light'
							? SunIcon
							: MonitorIcon
				"
				aria-hidden="true"
				class="pointer-events-none absolute left-2.5 size-3.5 text-neutral-500 dark:text-slate-500"
			/>
			<select
				v-model="colorMode.preference"
				class="appearance-none rounded-full border border-neutral-950/10 bg-white/80 py-1.5 pr-7 pl-8 text-sm text-neutral-600 transition-colors outline-none hover:text-neutral-950 dark:border-white/10 dark:bg-neutral-950 dark:text-slate-400 dark:hover:text-white"
			>
				<option v-for="colorScheme of colorSchemes" :key="colorScheme" :value="colorScheme">
					{{ t(`ColorSchemeToggle.color-schemes.${colorScheme}`) }}
				</option>
			</select>
			<ChevronDownIcon
				aria-hidden="true"
				class="pointer-events-none absolute right-2 size-3.5 text-neutral-500 dark:text-slate-500"
			/>
		</label>
	</ClientOnly>
</template>
