import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const country = defineCollection({
	loader: glob({ base: './src/content/country', pattern: '**/*.{md,mdx}' }),
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			tagline: z.string(),
			name: z.string(),
			badge: z
				.union([z.string(), z.array(z.string())])
				.optional()
				.transform((v) => (v === undefined ? undefined : Array.isArray(v) ? v : [v])),
			hide: z.boolean().optional(),
			mainImage: image().optional(),
			videoId: z.string().optional(),
			region: z.string().optional(),
			pinned: z.boolean().optional(),
			planned: z.boolean().optional(),
			score: z.number().int().optional(), // from 0 to 10
		}),
});

const itinerary = defineCollection({
	loader: glob({ base: './src/content/itinerary', pattern: '**/*.{md,mdx}' }),
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			tagline: z.string(),
			name: z.string(),
			country: z.string(),
			badge: z
				.union([z.string(), z.array(z.string())])
				.optional()
				.transform((v) => (v === undefined ? [] : Array.isArray(v) ? v : [v])),
			hide: z.boolean().optional(),
			order: z.number().int().optional(),
			mainImage: image(),
			videoId: z.string().optional()
		}),
});


export const collections = { country, itinerary };
