<script lang="ts">
  import { onMount } from 'svelte';

  let { slug = '' }: { slug: string } = $props();

  let mounted = $state(false);
  let theme = $state<'dark' | 'light'>('dark');

  onMount(() => {
    // Get current theme
    theme = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    mounted = true;

    // Listen for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-theme') {
          const newTheme = document.documentElement.getAttribute('data-theme');
          theme = newTheme === 'light' ? 'light' : 'dark';

          // Update Giscus theme
          const iframe = document.querySelector<HTMLIFrameElement>('iframe.giscus-frame');
          if (iframe?.contentWindow) {
            iframe.contentWindow.postMessage(
              { giscus: { setConfig: { theme: newTheme === 'light' ? 'light' : 'dark_dimmed' } } },
              'https://giscus.app'
            );
          }
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });

    return () => observer.disconnect();
  });
</script>

{#if mounted}
  <div class="comments-section">
    <h3 class="text-h3 font-serif mb-6" style="color: var(--color-text-primary);">
      Discussion
    </h3>
    <p class="text-small mb-6" style="color: var(--color-text-tertiary);">
      Share your thoughts on this note. Requires a GitHub account.
    </p>
    <script
      src="https://giscus.app/client.js"
      data-repo="evanramirez88/evan-garden"
      data-repo-id=""
      data-category="Garden Discussions"
      data-category-id=""
      data-mapping="specific"
      data-term={slug}
      data-strict="0"
      data-reactions-enabled="1"
      data-emit-metadata="0"
      data-input-position="top"
      data-theme={theme === 'light' ? 'light' : 'dark_dimmed'}
      data-lang="en"
      data-loading="lazy"
      crossorigin="anonymous"
      async
    ></script>
  </div>
{/if}

<style>
  .comments-section {
    margin-top: 3rem;
    padding-top: 2rem;
    border-top: 1px solid var(--color-border);
  }

  .comments-section :global(.giscus) {
    max-width: 100%;
  }

  .comments-section :global(.giscus-frame) {
    width: 100%;
    border: none;
  }
</style>
