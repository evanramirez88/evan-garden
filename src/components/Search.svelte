<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  let isOpen = $state(false);
  let query = $state('');
  let results = $state<any[]>([]);
  let selectedIndex = $state(0);
  let pagefind: any = null;
  let searchInput: HTMLInputElement;
  let debounceTimeout: ReturnType<typeof setTimeout>;

  async function loadPagefind() {
    if (pagefind) return;
    try {
      // @ts-ignore - Pagefind is loaded from the built assets
      pagefind = await import('/pagefind/pagefind.js');
      await pagefind.init();
    } catch (e) {
      console.warn('Pagefind not available (run build first):', e);
    }
  }

  async function search(searchQuery: string) {
    if (!searchQuery.trim() || !pagefind) {
      results = [];
      return;
    }

    const searchResults = await pagefind.search(searchQuery);
    const data = await Promise.all(
      searchResults.results.slice(0, 8).map((r: any) => r.data())
    );
    results = data;
    selectedIndex = 0;
  }

  function handleInput(e: Event) {
    const target = e.target as HTMLInputElement;
    query = target.value;

    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      search(query);
    }, 150);
  }

  function handleKeydown(e: KeyboardEvent) {
    if (!isOpen) {
      // Open with Cmd/Ctrl + K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        open();
      }
      return;
    }

    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        close();
        break;
      case 'ArrowDown':
        e.preventDefault();
        selectedIndex = Math.min(selectedIndex + 1, results.length - 1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        selectedIndex = Math.max(selectedIndex - 1, 0);
        break;
      case 'Enter':
        e.preventDefault();
        if (results[selectedIndex]) {
          navigateTo(results[selectedIndex].url);
        }
        break;
    }
  }

  function open() {
    isOpen = true;
    loadPagefind();
    // Focus input after DOM updates
    setTimeout(() => searchInput?.focus(), 10);
  }

  function close() {
    isOpen = false;
    query = '';
    results = [];
    selectedIndex = 0;
  }

  function navigateTo(url: string) {
    close();
    window.location.href = url;
  }

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      close();
    }
  }

  onMount(() => {
    document.addEventListener('keydown', handleKeydown);
  });

  onDestroy(() => {
    document.removeEventListener('keydown', handleKeydown);
    clearTimeout(debounceTimeout);
  });
</script>

<!-- Search Trigger Button -->
<button
  onclick={open}
  class="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-garden-border/50 text-text-secondary hover:text-text-primary hover:border-accent-amber/50 transition-colors text-small"
  aria-label="Search (Cmd+K)"
>
  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
  <span class="hidden sm:inline">Search</span>
  <kbd class="hidden sm:inline px-1.5 py-0.5 rounded bg-garden-surface text-xs">⌘K</kbd>
</button>

<!-- Search Modal -->
{#if isOpen}
  <div
    class="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4"
    onclick={handleBackdropClick}
    role="dialog"
    aria-modal="true"
    aria-label="Search"
  >
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-garden-black/80 backdrop-blur-sm"></div>

    <!-- Modal -->
    <div class="relative w-full max-w-xl bg-garden-charcoal/95 backdrop-blur-md rounded-xl border border-garden-border shadow-2xl overflow-hidden">
      <!-- Search Input -->
      <div class="flex items-center gap-3 px-4 border-b border-garden-border">
        <svg class="w-5 h-5 text-text-tertiary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          bind:this={searchInput}
          type="text"
          value={query}
          oninput={handleInput}
          placeholder="Search notes..."
          class="flex-1 py-4 bg-transparent text-text-primary placeholder:text-text-tertiary text-lg focus:outline-none"
        />
        <kbd class="px-2 py-1 rounded bg-garden-surface text-text-tertiary text-xs">ESC</kbd>
      </div>

      <!-- Results -->
      <div class="max-h-[60vh] overflow-y-auto">
        {#if results.length > 0}
          <ul class="py-2">
            {#each results as result, i}
              <li>
                <button
                  onclick={() => navigateTo(result.url)}
                  class="w-full px-4 py-3 text-left hover:bg-garden-surface/50 transition-colors {i === selectedIndex ? 'bg-garden-surface/50' : ''}"
                >
                  <div class="font-medium text-text-primary mb-1">
                    {@html result.meta?.title || 'Untitled'}
                  </div>
                  <div class="text-small text-text-secondary line-clamp-2">
                    {@html result.excerpt || ''}
                  </div>
                </button>
              </li>
            {/each}
          </ul>
        {:else if query.trim()}
          <div class="px-4 py-8 text-center text-text-tertiary">
            No results found for "{query}"
          </div>
        {:else}
          <div class="px-4 py-8 text-center text-text-tertiary">
            Start typing to search...
          </div>
        {/if}
      </div>

      <!-- Footer -->
      <div class="px-4 py-2 border-t border-garden-border flex items-center gap-4 text-xs text-text-tertiary">
        <span class="flex items-center gap-1">
          <kbd class="px-1.5 py-0.5 rounded bg-garden-surface">↑</kbd>
          <kbd class="px-1.5 py-0.5 rounded bg-garden-surface">↓</kbd>
          to navigate
        </span>
        <span class="flex items-center gap-1">
          <kbd class="px-1.5 py-0.5 rounded bg-garden-surface">↵</kbd>
          to select
        </span>
      </div>
    </div>
  </div>
{/if}

<style>
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
