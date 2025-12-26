import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const country = defineCollection({
	loader: glob({ base: './src/content/country', pattern: '**/*.{md,mdx}' }),
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			tagline: z.string(),
			name: z.string(),
			badge: z.string().optional(),
			hide: z.boolean().optional(),
			order: z.number().int().optional(),
			mainImage: image().optional(),
			videoId: z.string().optional()
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
			hide: z.boolean().optional(),
			order: z.number().int().optional(),
			mainImage: image(),
			videoId: z.string().optional()
		}),
});


export const collections = { country, itinerary };
