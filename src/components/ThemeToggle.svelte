<script lang="ts">
  import { onMount } from 'svelte';

  let theme = $state<'light' | 'dark'>('dark');
  let mounted = $state(false);

  function getSystemTheme(): 'light' | 'dark' {
    if (typeof window === 'undefined') return 'dark';
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }

  function getStoredTheme(): 'light' | 'dark' | null {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem('theme');
    if (stored === 'light' || stored === 'dark') return stored;
    return null;
  }

  function setTheme(newTheme: 'light' | 'dark') {
    theme = newTheme;
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  }

  function toggleTheme() {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }

  onMount(() => {
    // Get initial theme: stored preference > system preference > dark default
    const stored = getStoredTheme();
    const initial = stored ?? getSystemTheme();
    theme = initial;
    document.documentElement.setAttribute('data-theme', initial);
    mounted = true;

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
    const handleChange = (e: MediaQueryListEvent) => {
      // Only update if no stored preference
      if (!getStoredTheme()) {
        setTheme(e.matches ? 'light' : 'dark');
      }
    };
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  });
</script>

<button
  onclick={toggleTheme}
  class="theme-toggle"
  aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
  title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
>
  {#if mounted}
    {#if theme === 'dark'}
      <!-- Sun icon for switching to light -->
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="5"/>
        <line x1="12" y1="1" x2="12" y2="3"/>
        <line x1="12" y1="21" x2="12" y2="23"/>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
        <line x1="1" y1="12" x2="3" y2="12"/>
        <line x1="21" y1="12" x2="23" y2="12"/>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
      </svg>
    {:else}
      <!-- Moon icon for switching to dark -->
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
      </svg>
    {/if}
  {:else}
    <!-- Placeholder while loading -->
    <div class="w-5 h-5"></div>
  {/if}
</button>

<style>
  .theme-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 8px;
    background: transparent;
    border: 1px solid var(--color-border);
    color: var(--color-text-secondary);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .theme-toggle:hover {
    border-color: var(--color-accent-amber);
    color: var(--color-accent-amber);
  }

  .theme-toggle:focus-visible {
    outline: 2px solid var(--color-accent-amber);
    outline-offset: 2px;
  }
</style>
