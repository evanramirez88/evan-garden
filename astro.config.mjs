import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import tailwind from '@astrojs/tailwind';
import remarkWikilinks from './src/plugins/remark-wikilinks';

// https://astro.build/config
export default defineConfig({
  site: 'https://evan.garden',
  integrations: [
    svelte(),
    tailwind()
  ],
  markdown: {
    shikiConfig: {
      theme: 'github-dark'
    },
    remarkPlugins: [
      [remarkWikilinks, { basePath: '/garden' }]
    ]
  },
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport'
  }
});
