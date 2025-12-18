import { defineCollection, defineContentConfig, z } from "@nuxt/content";

export default defineContentConfig({
	collections: {
		content: defineCollection({
			type: "page",
			source: "*.md",
		}),
		queries: defineCollection({
			type: "page",
			source: "queries/*.md",
			schema: z
				.object({
					steps: z
						.array(
							z.object({
								id: z.number(),
								content: z.string(),
								highlightLines: z.array(z.number()),
							}),
						)
						.optional(),
					code: z.string().optional(),
					title: z.string().nullable(),
					description: z.string().nullable(),
					rawbody: z.string(),
				})
				.passthrough(),
		}),
	},
});
