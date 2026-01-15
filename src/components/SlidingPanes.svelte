<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  interface NoteData {
    slug: string;
    title: string;
    content: string;
    maturity: 'seedling' | 'budding' | 'evergreen';
    topic: string;
    created: string;
    updated?: string;
    description?: string;
  }

  interface Props {
    initialSlugs: string[];
    notesData: Record<string, NoteData>;
  }

  let { initialSlugs = [], notesData = {} }: Props = $props();

  let panes: string[] = $state([...initialSlugs]);
  let activeIndex: number = $state(initialSlugs.length - 1);
  let containerRef: HTMLDivElement;
  let isMobile = $state(false);

  const maturityEmoji: Record<string, string> = {
    seedling: '🌱',
    budding: '🌿',
    evergreen: '🌲',
  };

  function checkMobile() {
    isMobile = window.innerWidth < 768;
  }

  function updateUrl() {
    const path = '/garden/' + panes.join('/');
    window.history.replaceState({}, '', path);
  }

  function openPane(slug: string, fromIndex: number) {
    // Close all panes to the right of the clicked pane
    panes = [...panes.slice(0, fromIndex + 1), slug];
    activeIndex = panes.length - 1;
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
    if (index === 0) return; // Can't close first pane
    panes = panes.slice(0, index);
    activeIndex = panes.length - 1;
    updateUrl();
  }

  function handleWikilinkClick(event: MouseEvent, paneIndex: number) {
    const target = event.target as HTMLElement;
    const link = target.closest('a[href^="/garden/"]') as HTMLAnchorElement;

    if (!link) return;

    // Extract slug from href
    const href = link.getAttribute('href');
    if (!href) return;

    const slug = href.replace('/garden/', '').replace(/\/$/, '');

    // Check if note exists in our data
    if (!notesData[slug]) {
      // Let it navigate normally if we don't have the data
      return;
    }

    event.preventDefault();

    // If Cmd/Ctrl+Click or mobile, navigate normally
    if (event.metaKey || event.ctrlKey || isMobile) {
      window.location.href = href;
      return;
    }

    openPane(slug, paneIndex);
  }

  function handleKeydown(event: KeyboardEvent) {
    if (panes.length <= 1) return;

    switch (event.key) {
      case 'ArrowLeft':
        if (activeIndex > 0) {
          activeIndex--;
          scrollToPane(activeIndex);
        }
        break;
      case 'ArrowRight':
        if (activeIndex < panes.length - 1) {
          activeIndex++;
          scrollToPane(activeIndex);
        }
        break;
      case 'Escape':
        if (panes.length > 1) {
          closePane(panes.length - 1);
        }
        break;
    }
  }

  function scrollToPane(index: number) {
    const paneElements = containerRef?.querySelectorAll('.pane');
    if (paneElements && paneElements[index]) {
      paneElements[index].scrollIntoView({ behavior: 'smooth', inline: 'center' });
    }
  }

  function setActivePane(index: number) {
    activeIndex = index;
  }

  onMount(() => {
    checkMobile();
    window.addEventListener('resize', checkMobile);
    document.addEventListener('keydown', handleKeydown);

    // Scroll to last pane on mount
    if (containerRef && panes.length > 1) {
      requestAnimationFrame(() => {
        containerRef.scrollTo({ left: containerRef.scrollWidth, behavior: 'auto' });
      });
    }
  });

  onDestroy(() => {
    window.removeEventListener('resize', checkMobile);
    document.removeEventListener('keydown', handleKeydown);
  });
</script>

{#if isMobile || panes.length <= 1}
  <!-- Single pane mode for mobile or single note -->
  {#each panes.slice(-1) as slug}
    {@const note = notesData[slug]}
    {#if note}
      <article class="single-pane">
        <header class="mb-8">
          <div class="flex items-center gap-2 mb-4">
            <span class="text-lg">{maturityEmoji[note.maturity]}</span>
            <span class="text-text-tertiary text-small capitalize">{note.maturity}</span>
            <span class="text-text-tertiary">·</span>
            <span class="text-text-secondary text-small">{note.topic}</span>
          </div>
          <h1 class="text-h1 font-serif text-text-primary mb-4">{note.title}</h1>
          {#if note.description}
            <p class="text-body text-text-secondary">{note.description}</p>
          {/if}
        </header>
        <div
          class="prose"
          onclick={(e) => handleWikilinkClick(e, 0)}
        >
          {@html note.content}
        </div>
      </article>
    {/if}
  {/each}
{:else}
  <!-- Multi-pane mode -->
  <div
    bind:this={containerRef}
    class="panes-container"
  >
    {#each panes as slug, index}
      {@const note = notesData[slug]}
      {#if note}
        <article
          class="pane"
          class:active={index === activeIndex}
          class:background={index < activeIndex}
          onclick={() => setActivePane(index)}
        >
          <!-- Close button (not on first pane) -->
          {#if index > 0}
            <button
              class="close-btn"
              onclick={(e) => { e.stopPropagation(); closePane(index); }}
              aria-label="Close pane"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          {/if}

          <!-- Pane content -->
          <div class="pane-inner">
            <header class="mb-6">
              <div class="flex items-center gap-2 mb-3">
                <span>{maturityEmoji[note.maturity]}</span>
                <span class="text-text-tertiary text-xs capitalize">{note.maturity}</span>
              </div>
              <h2 class="text-h2 font-serif text-text-primary mb-2">{note.title}</h2>
              {#if note.description}
                <p class="text-small text-text-secondary">{note.description}</p>
              {/if}
            </header>
            <div
              class="prose prose-sm"
              onclick={(e) => handleWikilinkClick(e, index)}
            >
              {@html note.content}
            </div>
          </div>

          <!-- Pane indicator -->
          <div class="pane-indicator">
            {index + 1} / {panes.length}
          </div>
        </article>
      {/if}
    {/each}
  </div>

  <!-- Keyboard hint -->
  <div class="keyboard-hint">
    <span><kbd>←</kbd><kbd>→</kbd> navigate</span>
    <span><kbd>Esc</kbd> close</span>
  </div>
{/if}

<style>
  .single-pane {
    max-width: 48rem;
    margin: 0 auto;
    padding: 2rem 1.5rem;
  }

  .panes-container {
    display: flex;
    overflow-x: auto;
    overflow-y: hidden;
    height: calc(100vh - 4rem);
    scroll-snap-type: x mandatory;
    scroll-behavior: smooth;
  }

  .panes-container::-webkit-scrollbar {
    height: 8px;
  }

  .panes-container::-webkit-scrollbar-track {
    background: #121212;
  }

  .panes-container::-webkit-scrollbar-thumb {
    background: #3D3A36;
    border-radius: 4px;
  }

  .pane {
    position: relative;
    flex: 0 0 auto;
    width: min(550px, 85vw);
    min-width: 400px;
    height: 100%;
    overflow-y: auto;
    background: #1C1C1C;
    border-left: 1px solid #3D3A36;
    scroll-snap-align: start;
    transition: opacity 0.2s, filter 0.2s;
  }

  .pane:first-child {
    border-left: none;
  }

  .pane.background {
    opacity: 0.7;
    filter: blur(0.5px);
  }

  .pane.active {
    opacity: 1;
    filter: none;
    box-shadow: -4px 0 20px rgba(0, 0, 0, 0.3);
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
    background: rgba(42, 39, 36, 0.8);
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
    background: rgba(18, 18, 18, 0.8);
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
    background: rgba(18, 18, 18, 0.9);
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
    font-size: 1.25rem;
    margin-top: 1.5rem;
    margin-bottom: 0.75rem;
  }

  .prose :global(h3) {
    font-size: 1.1rem;
    margin-top: 1.25rem;
    margin-bottom: 0.5rem;
  }

  .prose :global(p) {
    margin-bottom: 0.75rem;
    color: #A0A0A0;
    line-height: 1.7;
  }

  .prose :global(a[href^="/garden/"]) {
    color: #D4A574;
    border-bottom: 1px solid rgba(212, 165, 116, 0.3);
    text-decoration: none;
    transition: border-color 0.2s;
  }

  .prose :global(a[href^="/garden/"]:hover) {
    border-color: #D4A574;
  }

  .prose :global(ul), .prose :global(ol) {
    margin-bottom: 0.75rem;
    padding-left: 1.25rem;
  }

  .prose :global(li) {
    margin-bottom: 0.25rem;
    color: #A0A0A0;
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
  }

  .prose-sm :global(p) {
    font-size: 0.9375rem;
  }
</style>
