<script lang="ts">
  import { onMount } from 'svelte';

  interface NotePreview {
    slug: string;
    title: string;
    description: string;
    maturity: 'seedling' | 'budding' | 'evergreen';
  }

  let { notes = [] }: { notes: NotePreview[] } = $props();

  let preview = $state<NotePreview | null>(null);
  let visible = $state(false);
  let position = $state({ x: 0, y: 0, above: false, bottomOffset: 0 });
  let hoverTimeout: ReturnType<typeof setTimeout> | null = null;

  const maturityEmoji = {
    seedling: '🌱',
    budding: '🌿',
    evergreen: '🌲',
  };

  const maturityLabel = {
    seedling: 'Seedling',
    budding: 'Budding',
    evergreen: 'Evergreen',
  };

  function findNoteBySlug(slug: string): NotePreview | null {
    // Try exact match
    let note = notes.find(n => n.slug === slug);
    if (note) return note;

    // Try case-insensitive match
    const lowerSlug = slug.toLowerCase();
    note = notes.find(n => n.slug.toLowerCase() === lowerSlug);
    if (note) return note;

    return null;
  }

  function handleMouseEnter(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const link = target.closest('a[href^="/garden/"]') as HTMLAnchorElement | null;

    if (!link) return;

    // Extract slug from href
    const href = link.getAttribute('href');
    if (!href) return;

    const slug = href.replace('/garden/', '').replace(/\/$/, '');
    const note = findNoteBySlug(slug);

    if (!note) return;

    // Clear any existing timeout
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
    }

    // Set timeout for 300ms delay
    hoverTimeout = setTimeout(() => {
      preview = note;

      // Calculate position
      const rect = link.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const previewHeight = 160; // Approximate height

      // Position above if not enough space below
      const above = rect.bottom + previewHeight > viewportHeight - 20;

      position = {
        x: rect.left + rect.width / 2,
        y: above ? rect.top : rect.bottom,
        above,
        bottomOffset: above ? window.innerHeight - rect.top + 8 : 0,
      };

      visible = true;
    }, 300);
  }

  function handleMouseLeave(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const link = target.closest('a[href^="/garden/"]');

    if (!link) return;

    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      hoverTimeout = null;
    }

    visible = false;
    preview = null;
  }

  onMount(() => {
    // Use event delegation on the document
    document.addEventListener('mouseover', handleMouseEnter);
    document.addEventListener('mouseout', handleMouseLeave);

    return () => {
      document.removeEventListener('mouseover', handleMouseEnter);
      document.removeEventListener('mouseout', handleMouseLeave);
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
    };
  });
</script>

{#if visible && preview}
  <div
    class="preview-card"
    style="left: {position.x}px; {position.above ? `bottom: ${position.bottomOffset}px` : `top: ${position.y + 8}px`}; transform: translateX(-50%);"
  >
    <div class="flex items-center gap-2 mb-2">
      <span class="text-sm">{maturityEmoji[preview.maturity]}</span>
      <span class="text-text-tertiary text-xs">{maturityLabel[preview.maturity]}</span>
    </div>
    <h4 class="text-text-primary font-medium mb-1">{preview.title}</h4>
    {#if preview.description}
      <p class="text-text-tertiary text-sm line-clamp-2">{preview.description}</p>
    {/if}
  </div>
{/if}

<style>
  .preview-card {
    position: fixed;
    z-index: 100;
    width: 280px;
    padding: 12px 16px;
    background: rgba(28, 28, 28, 0.98);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(61, 58, 54, 0.5);
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
    pointer-events: none;
    animation: fadeIn 0.15s ease-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(4px);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }

  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
