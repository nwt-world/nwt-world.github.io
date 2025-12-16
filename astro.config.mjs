// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import svelte from '@astrojs/svelte';
import { defineConfig } from 'astro/config';

export default defineConfig({
	site: 'https://nwt-world.github.io',
	integrations: [mdx(), svelte()],
});
