import { vitePreprocess } from '@astrojs/svelte';

export default {
  preprocess: vitePreprocess(),
  compilerOptions: {
    // Svelte 5 runes mode is default, but explicitly set for clarity
    runes: true,
  },
};
