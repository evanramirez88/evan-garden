# AGENTS.md - AI Assistant Documentation

This document provides guidance for AI coding assistants working on the evan.garden project.

## Project Overview

A personal digital garden / polymath portfolio website for Evan Ramirez ("The Grounded Generalist").
Built with Astro, Svelte, and Tailwind CSS, deployed to Cloudflare Pages.

## Tech Stack

- **Framework**: Astro 5.x (Islands Architecture)
- **UI Components**: Svelte 5.x (for interactive islands)
- **Styling**: Tailwind CSS 3.x
- **Animations**: GSAP with ScrollTrigger (when needed)
- **Visualization**: D3.js for knowledge graph
- **Language**: TypeScript (strict mode)
- **Hosting**: Cloudflare Pages

## Project Structure

```
├── src/
│   ├── components/       # Astro and Svelte components
│   ├── content/          # Content Collections (Markdown/MDX)
│   │   ├── garden/       # Digital garden notes
│   │   └── projects/     # Portfolio projects
│   ├── layouts/          # Page layouts
│   ├── pages/            # File-based routing
│   └── styles/           # Global CSS and design tokens
├── public/               # Static assets
├── astro.config.mjs      # Astro configuration
├── tailwind.config.mjs   # Tailwind configuration
└── tsconfig.json         # TypeScript configuration
```

## Content Collections

### Garden Notes (`src/content/garden/*.md`)

```yaml
---
title: "Note Title"
description: "Optional description"
maturity: seedling | budding | evergreen
topic: systems | hospitality | horticulture | ai | play | meta
created: 2024-01-15
updated: 2024-03-10  # optional
tags: ["tag1", "tag2"]
relatedNotes: ["other-note-slug"]  # for graph connections
featured: false
draft: false
---
```

### Projects (`src/content/projects/*.md`)

```yaml
---
title: "Project Name"
description: "Project description"
thumbnail: "/images/project.jpg"  # optional
status: active | completed | archived | concept
url: "https://..."  # optional
github: "https://github.com/..."  # optional
topics: ["topic1", "topic2"]
created: 2024-01-15
featured: false
---
```

## Design System

### Colors (defined in tailwind.config.mjs)

- **Backgrounds**: `garden-black` (#121212), `garden-charcoal` (#1C1C1C), `garden-surface` (#2A2724)
- **Text**: `text-primary` (#F5F0E8), `text-secondary` (#A0A0A0), `text-tertiary` (#6B6B6B)
- **Accents**: `accent-amber` (#D4A574), `accent-terracotta` (#C4725B), `accent-sage` (#7D8B75)

### Typography

- **Headlines**: `font-serif` (Instrument Serif)
- **Body**: `font-sans` (DM Sans)
- **Code**: `font-mono` (JetBrains Mono)

### Components

- `.card` / `.card-hover` - Card containers
- `.btn-primary` / `.btn-ghost` - Button variants
- `.container-narrow` / `.container-wide` - Layout containers
- `.section` - Section spacing

## Coding Guidelines

1. **Use Astro components by default**. Only use Svelte for interactive islands.
2. **TypeScript everywhere**. Enable strict mode.
3. **Prefer Tailwind utilities**. Extract components only when truly reusable.
4. **Respect the design system**. Use defined colors and typography.
5. **Progressive enhancement**. Core content works without JavaScript.
6. **Accessibility first**. Semantic HTML, focus states, reduced motion support.

## Wiki Links

Notes can use `[[note-slug]]` or `[[note-slug|Display Text]]` syntax.
These are processed at build time to create navigation and backlinks.

## Build Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

## Deployment

Automatic deployment via Cloudflare Pages on push to main branch.
Site URL: https://evan.garden (pending domain configuration)

## Common Tasks

### Adding a new garden note

1. Create `src/content/garden/my-note.md` with required frontmatter
2. Set appropriate `maturity` and `topic`
3. Add `relatedNotes` slugs for graph connections
4. Use `[[other-note]]` syntax for inline links

### Adding a new page

1. Create `src/pages/my-page.astro`
2. Import and use `BaseLayout`
3. Add navigation link in `Header.astro` if needed

### Creating an interactive component

1. Create `src/components/MyComponent.svelte`
2. Import in Astro page with `client:visible` or `client:load`
3. Keep bundle size minimal

## Performance Targets

- Lighthouse Performance: 95+
- No layout shift (CLS < 0.1)
- First Contentful Paint < 1.5s
- Zero JavaScript for static pages
