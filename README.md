# evan.garden

The Grounded Generalist — A digital garden and polymath portfolio.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Tech Stack

- **Framework**: Astro 5 with Islands Architecture
- **Interactive Components**: Svelte 5
- **Styling**: Tailwind CSS
- **Animations**: GSAP ScrollTrigger, View Transitions API
- **Visualization**: D3.js for knowledge graph, Canvas 2D for generative backgrounds
- **Markdown**: Custom remark-wikilinks plugin for `[[internal links]]`
- **Hosting**: Cloudflare Pages

## Features

- **Wikilinks**: Use `[[note-slug]]` or `[[note-slug|Custom Text]]` in markdown
- **Scroll Animations**: Add `data-animate="fade-up"` to elements for scroll-triggered animations
- **Generative Background**: Mycelium network visualization on homepage
- **Knowledge Graph**: Interactive D3.js visualization of note connections
- **Dark Theme**: Premium dark design system with amber accents

## Project Structure

```
src/
├── components/     # Astro and Svelte components
├── content/        # Content Collections
│   ├── garden/     # Digital garden notes
│   └── projects/   # Portfolio projects
├── layouts/        # Page layouts
├── pages/          # File-based routing
├── plugins/        # Custom remark plugins
├── utils/          # Utility functions
└── styles/         # Global CSS
```

## Adding Content

### Garden Notes

Create a new file in `src/content/garden/`:

```md
---
title: "Note Title"
maturity: seedling | budding | evergreen
topic: systems | hospitality | horticulture | ai | play | meta
created: 2024-01-15
tags: ["tag1", "tag2"]
---

Content here with [[wikilinks]] to other notes...
```

### Projects

Create a new file in `src/content/projects/`:

```md
---
title: "Project Name"
description: "Description"
status: active | completed | concept
topics: ["topic1"]
created: 2024-01-15
---

Content here...
```

## Animation System

Add scroll animations to any element:

```html
<!-- Fade up animation -->
<div data-animate="fade-up">Content</div>

<!-- Stagger children -->
<div data-animate="stagger-parent">
  <div data-animate="stagger-child">Item 1</div>
  <div data-animate="stagger-child">Item 2</div>
</div>

<!-- Line reveal -->
<hr data-animate="line-reveal" />
```

## Deployment

### Cloudflare Pages Setup

1. Create a new GitHub repository
2. Push this code to the repository
3. In Cloudflare Pages:
   - Connect to your GitHub account
   - Select the repository
   - Build settings:
     - Build command: `npm run build`
     - Build output directory: `dist`
     - Node.js version: `18` or higher
4. Add custom domain: `evan.garden`

### Manual Deployment

```bash
# Build the site
npm run build

# The output is in the `dist` folder
```

## License

All rights reserved.
