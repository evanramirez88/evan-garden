<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  interface NoteData {
    slug: string;
    title: string;
    content: string;
    maturity: 'seedling' | 'budding' | 'evergreen';
    topic: string;
    description?: string;
  }

  let { currentSlug = '', currentTitle = '' }: { currentSlug: string; currentTitle: string } = $props();

  let additionalPanes: NoteData[] = $state([]);
  let notesCache: Record<string, NoteData> = {};
  let isLoading = $state(false);
  let isMobile = $state(false);
  let containerRef: HTMLDivElement;

  const maturityEmoji: Record<string, string> = {
    seedling: '🌱',
    budding: '🌿',
    evergreen: '🌲',
  };

  const topicLabels: Record<string, string> = {
    systems: 'Systems Thinking',
    hospitality: 'Restaurant & Hospitality',
    horticulture: 'Growing Things',
    ai: 'AI & Technology',
    play: 'Play & Analysis',
    meta: 'Meta',
  };

  async function loadNotesData() {
    if (Object.keys(notesCache).length > 0) return;

    try {
      const response = await fetch('/api/notes-rendered.json');
      notesCache = await response.json();
    } catch (e) {
      console.error('Failed to load notes data:', e);
    }
  }

  function checkMobile() {
    isMobile = window.innerWidth < 768;
  }

  function updateUrl() {
    if (additionalPanes.length === 0) {
      window.history.replaceState({}, '', `/garden/${currentSlug}`);
    } else {
      const slugs = [currentSlug, ...additionalPanes.map(p => p.slug)];
      window.history.replaceState({}, '', `/garden/${slugs.join('/')}`);
    }
  }

  async function openPane(slug: string, fromIndex: number = -1) {
    if (isMobile) {
      window.location.href = `/garden/${slug}`;
      return;
    }

    await loadNotesData();

    const noteData = notesCache[slug];
    if (!noteData) {
      window.location.href = `/garden/${slug}`;
      return;
    }

    // Close panes to the right of fromIndex
    if (fromIndex >= 0) {
      additionalPanes = additionalPanes.slice(0, fromIndex);
    }

    additionalPanes = [...additionalPanes, noteData];
    updateUrl();

    // Scroll to new pane
    requestAnimationFrame(() => {
      if (containerRef) {
        containerRef.scrollTo({
          left: containerRef.scrollWidth,
          behavior: 'smooth'
        });
      }
    });
  }

  function closePane(index: number) {
    additionalPanes = additionalPanes.slice(0, index);
    updateUrl();
  }

  function handleWikilinkClick(event: MouseEvent, paneIndex: number) {
    const target = event.target as HTMLElement;
    const link = target.closest('a[href^="/garden/"]') as HTMLAnchorElement;

    if (!link) return;

    const href = link.getAttribute('href');
    if (!href) return;

    // Don't intercept if modifier keys are pressed
    if (event.metaKey || event.ctrlKey) return;

    const slug = href.replace('/garden/', '').replace(/\/$/, '');

    // Don't open the same note again
    if (slug === currentSlug || additionalPanes.some(p => p.slug === slug)) {
      return;
    }

    event.preventDefault();
    openPane(slug, paneIndex);
  }

  function handleMainContentClick(event: MouseEvent) {
    handleWikilinkClick(event, -1);
  }

  function handlePaneClick(event: MouseEvent, index: number) {
    handleWikilinkClick(event, index);
  }

  function handleKeydown(event: KeyboardEvent) {
    if (additionalPanes.length === 0) return;

    if (event.key === 'Escape') {
      closePane(additionalPanes.length - 1);
    }
  }

  onMount(() => {
    checkMobile();
    window.addEventListener('resize', checkMobile);
    document.addEventListener('keydown', handleKeydown);

    // Pre-load notes data for faster pane opening
    loadNotesData();

    // Check URL for existing panes
    const pathParts = window.location.pathname.replace('/garden/', '').split('/').filter(Boolean);
    if (pathParts.length > 1) {
      // Load additional panes from URL
      const additionalSlugs = pathParts.slice(1);
      loadNotesData().then(() => {
        const panes = additionalSlugs
          .map(slug => notesCache[slug])
          .filter(Boolean);
        additionalPanes = panes;
      });
    }
  });

  onDestroy(() => {
    window.removeEventListener('resize', checkMobile);
    document.removeEventListener('keydown', handleKeydown);
  });
</script>

<!-- Main content click handler wrapper -->
<div
  class="main-content-wrapper"
  onclick={handleMainContentClick}
>
  <slot />
</div>

<!-- Additional panes -->
{#if additionalPanes.length > 0 && !isMobile}
  <div
    bind:this={containerRef}
    class="panes-overlay"
  >
    {#each additionalPanes as pane, index}
      <article class="pane">
        <button
          class="close-btn"
          onclick={() => closePane(index)}
          aria-label="Close pane"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <div class="pane-inner" onclick={(e) => handlePaneClick(e, index)}>
          <header class="mb-6">
            <div class="flex items-center gap-2 mb-3">
              <span>{maturityEmoji[pane.maturity]}</span>
              <span class="text-text-tertiary text-xs capitalize">{pane.maturity}</span>
              <span class="text-text-tertiary">·</span>
              <span class="text-text-secondary text-xs">{topicLabels[pane.topic] || pane.topic}</span>
            </div>
            <h2 class="text-h2 font-serif text-text-primary mb-2">{pane.title}</h2>
            {#if pane.description}
              <p class="text-small text-text-secondary">{pane.description}</p>
            {/if}
          </header>
          <div class="prose">
            {@html pane.content}
          </div>
        </div>

        <div class="pane-indicator">
          Pane {index + 2}
        </div>
      </article>
    {/each}
  </div>

  <!-- Keyboard hint -->
  <div class="keyboard-hint">
    <span><kbd>Esc</kbd> close pane</span>
    <span><kbd>⌘</kbd>+click to open in new tab</span>
  </div>
{/if}

<style>
  .main-content-wrapper {
    position: relative;
  }

  .panes-overlay {
    position: fixed;
    top: 4rem;
    right: 0;
    bottom: 0;
    display: flex;
    overflow-x: auto;
    overflow-y: hidden;
    z-index: 40;
    background: rgba(18, 18, 18, 0.5);
    backdrop-filter: blur(2px);
  }

  .panes-overlay::-webkit-scrollbar {
    height: 8px;
  }

  .panes-overlay::-webkit-scrollbar-track {
    background: #121212;
  }

  .panes-overlay::-webkit-scrollbar-thumb {
    background: #3D3A36;
    border-radius: 4px;
  }

  .pane {
    position: relative;
    flex: 0 0 auto;
    width: min(550px, 90vw);
    min-width: 380px;
    height: 100%;
    overflow-y: auto;
    background: #1C1C1C;
    border-left: 1px solid #3D3A36;
    box-shadow: -4px 0 20px rgba(0, 0, 0, 0.4);
  }

  .pane-inner {
    padding: 2rem;
    padding-top: 3rem;
  }

  .close-btn {
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(42, 39, 36, 0.9);
    border: 1px solid #3D3A36;
    border-radius: 6px;
    color: #A0A0A0;
    cursor: pointer;
    transition: all 0.2s;
    z-index: 10;
  }

  .close-btn:hover {
    background: #2A2724;
    color: #F5F0E8;
    border-color: #D4A574;
  }

  .pane-indicator {
    position: absolute;
    bottom: 1rem;
    right: 1rem;
    padding: 0.25rem 0.75rem;
    background: rgba(18, 18, 18, 0.9);
    border-radius: 4px;
    font-size: 0.75rem;
    color: #6B6B6B;
  }

  .keyboard-hint {
    position: fixed;
    bottom: 1.5rem;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 1.5rem;
    padding: 0.5rem 1rem;
    background: rgba(18, 18, 18, 0.95);
    border: 1px solid #3D3A36;
    border-radius: 8px;
    font-size: 0.75rem;
    color: #6B6B6B;
    z-index: 50;
  }

  .keyboard-hint kbd {
    display: inline-block;
    padding: 0.125rem 0.375rem;
    margin: 0 0.125rem;
    background: #2A2724;
    border-radius: 3px;
    font-family: inherit;
  }

  /* Prose styles for pane content */
  .prose :global(h2) {
    font-family: 'Instrument Serif', Georgia, serif;
    font-size: 1.25rem;
    color: #F5F0E8;
    margin-top: 1.5rem;
    margin-bottom: 0.75rem;
  }

  .prose :global(h3) {
    font-family: 'Instrument Serif', Georgia, serif;
    font-size: 1.1rem;
    color: #F5F0E8;
    margin-top: 1.25rem;
    margin-bottom: 0.5rem;
  }

  .prose :global(p) {
    margin-bottom: 0.75rem;
    color: #A0A0A0;
    line-height: 1.7;
    font-size: 0.9375rem;
  }

  .prose :global(a) {
    color: #D4A574;
    text-decoration: none;
    border-bottom: 1px solid rgba(212, 165, 116, 0.3);
    transition: border-color 0.2s;
  }

  .prose :global(a:hover) {
    border-color: #D4A574;
  }

  .prose :global(ul), .prose :global(ol) {
    margin-bottom: 0.75rem;
    padding-left: 1.25rem;
  }

  .prose :global(li) {
    margin-bottom: 0.25rem;
    color: #A0A0A0;
    font-size: 0.9375rem;
  }

  .prose :global(ul li) {
    list-style-type: disc;
  }

  .prose :global(ol li) {
    list-style-type: decimal;
  }

  .prose :global(blockquote) {
    border-left: 2px solid #D4A574;
    padding-left: 1rem;
    margin: 1rem 0;
    font-style: italic;
    color: #A0A0A0;
  }

  .prose :global(code) {
    background: #2A2724;
    padding: 0.125rem 0.375rem;
    border-radius: 3px;
    font-size: 0.875em;
    color: #D4A574;
  }

  .prose :global(pre) {
    background: #121212;
    padding: 1rem;
    border-radius: 6px;
    overflow-x: auto;
    margin: 1rem 0;
  }

  .prose :global(pre code) {
    background: none;
    padding: 0;
  }

  .prose :global(strong) {
    color: #F5F0E8;
    font-weight: 600;
  }

  .prose :global(em) {
    font-style: italic;
  }

  .prose :global(hr) {
    border: none;
    border-top: 1px solid #3D3A36;
    margin: 1.5rem 0;
  }
</style>
