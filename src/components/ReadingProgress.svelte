<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  let progress = $state(0);
  let visible = $state(false);
  let rafId: number;

  function updateProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;

    if (docHeight <= 0) {
      progress = 0;
      visible = false;
      return;
    }

    progress = Math.min(100, (scrollTop / docHeight) * 100);
    visible = scrollTop > 100; // Only show after scrolling a bit
  }

  function handleScroll() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(updateProgress);
  }

  onMount(() => {
    updateProgress();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', updateProgress, { passive: true });
  });

  onDestroy(() => {
    window.removeEventListener('scroll', handleScroll);
    window.removeEventListener('resize', updateProgress);
    if (rafId) cancelAnimationFrame(rafId);
  });
</script>

<div
  class="reading-progress"
  class:visible
  style="--progress: {progress}%"
  role="progressbar"
  aria-valuenow={Math.round(progress)}
  aria-valuemin={0}
  aria-valuemax={100}
  aria-label="Reading progress"
>
  <div class="reading-progress-bar"></div>
</div>

<style>
  .reading-progress {
    position: fixed;
    top: 64px; /* Below header */
    left: 0;
    right: 0;
    height: 2px;
    background: var(--color-border);
    z-index: 49;
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
  }

  .reading-progress.visible {
    opacity: 1;
  }

  .reading-progress-bar {
    height: 100%;
    width: var(--progress);
    background: linear-gradient(90deg, var(--color-accent-amber), var(--color-accent-terracotta));
    transition: width 0.1s ease-out;
  }

  @media (prefers-reduced-motion: reduce) {
    .reading-progress-bar {
      transition: none;
    }
  }
</style>
