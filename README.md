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
```

## Tech Stack

- **Framework**: Astro 5 with Islands Architecture
- **Interactive Components**: Svelte 5
- **Styling**: Tailwind CSS
- **Animations**: View Transitions API, GSAP
- **Visualization**: D3.js for knowledge graph
- **Hosting**: Cloudflare Pages

## Project Structure

```
src/
├── components/     # Astro and Svelte components
├── content/        # Content Collections
│   ├── garden/     # Digital garden notes
│   └── projects/   # Portfolio projects
├── layouts/        # Page layouts
├── pages/          # File-based routing
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

Content here...
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

## Deployment

Connected to Cloudflare Pages for automatic deployment on push to main.

## License

All rights reserved.
