# evan.garden — Complete Implementation Plan

## Executive Summary: Current State vs. Vision

The foundation exists: Astro project structure, Tailwind design system, basic pages, Content Collections, and a functional D3 knowledge graph. The current implementation is **approximately 85% complete** relative to the vision outlined in the original documents. All critical path features are implemented, and most high-value features are complete.

What's built is a competent static site. What's envisioned is a **living, breathing digital organism** — a synthesis of Maggie Appleton's digital garden philosophy, Bruno Simon's experimental craft, and Rapha/Aesop's premium restraint. The gap is significant and exciting.

---

## Part I: Experimental & Generative Systems

### 1.1 Homepage Generative Background — Mycelium Network Visualization

**Vision**: The homepage should feel alive. A subtle, animated network visualization representing the interconnected nature of ideas — root systems, mycelium networks, feedback loops rendered as organic, breathing geometry.

**Technical Implementation**:

```
Component: src/components/GenerativeBackground.svelte
Technology: WebGL via regl or vanilla WebGL (lighter than Three.js for 2D)
Alternative: Canvas 2D with requestAnimationFrame for broader compatibility
Fallback: CSS-only animated gradient for reduced-motion or low-power devices
```

**Detailed Specifications**:

1. **Network Topology**
   - 80-150 nodes positioned using Poisson disk sampling for organic distribution
   - Nodes connected via Delaunay triangulation, filtered to max 3 connections per node
   - Node positions drift slowly using simplex noise (0.0005 frequency, 0.3 amplitude)
   - Connections rendered as curved bezier paths, not straight lines

2. **Visual Properties**
   - Node fill: `rgba(212, 165, 116, 0.15)` — amber at 15% opacity
   - Connection stroke: `rgba(61, 58, 54, 0.4)` — warm gray at 40%
   - Stroke width: 0.5px base, pulsing between 0.3-0.8px
   - Occasional "pulse" travels along connections (every 3-8 seconds per connection)

3. **Interaction Layer**
   - Mouse proximity causes nearby nodes to gently repel (50px influence radius)
   - Nodes near cursor brighten to 40% opacity
   - On mobile: accelerometer-based subtle parallax shift

4. **Performance Requirements**
   - Target: 60fps on modern devices, 30fps minimum on 5-year-old hardware
   - Use `will-change: transform` sparingly
   - Implement frame skipping when tab not visible
   - Total JS bundle for this component: <15KB gzipped

5. **Reduced Motion Handling**
   - When `prefers-reduced-motion: reduce` detected:
   - Static snapshot of network, no animation
   - Alternatively: single slow fade-in, then static

**File Structure**:
```
src/components/
├── GenerativeBackground.svelte     # Main component
├── shaders/
│   ├── network.vert               # Vertex shader (if WebGL)
│   └── network.frag               # Fragment shader (if WebGL)
└── utils/
    ├── poisson-disk.ts            # Poisson disk sampling
    ├── simplex-noise.ts           # Noise functions
    └── delaunay.ts                # Triangulation (or use d3-delaunay)
```

---

### 1.2 Three.js Systems Thinking Visualization

**Vision**: An optional, interactive 3D visualization demonstrating systems thinking concepts — feedback loops, stocks and flows, leverage points. Not for navigation, but for **conceptual demonstration** of expertise.

**Technical Implementation**:

```
Component: src/components/SystemsVisualization.svelte
Technology: Three.js via Threlte (Svelte-native Three.js, smaller than R3F)
Loading: client:visible with intersection observer, lazy-load all assets
```

**Detailed Specifications**:

1. **Scene Composition**
   - Dark void background matching `#121212`
   - Central "system" represented as interconnected orbital rings
   - 3-5 "stocks" (glowing spheres) connected by "flows" (animated particle streams)
   - Feedback loops visualized as orbiting rings with directional indicators

2. **Visual Language**
   - Spheres: Frosted glass material (transmission, roughness 0.3)
   - Flows: Instanced particles following bezier paths
   - Colors: Amber for reinforcing loops, terracotta for balancing loops
   - Subtle bloom post-processing (threshold 0.8, intensity 0.3)

3. **Interaction Model**
   - Auto-rotate slowly (0.001 rad/frame) when idle
   - Click-drag to orbit camera (OrbitControls, limited to 45° vertical)
   - Hover on elements reveals tooltip with systems concept name
   - Click element to expand inline explanation panel

4. **Performance Optimization**
   - Baked lighting, no real-time shadows
   - LOD (level of detail) for spheres based on camera distance
   - Particle count scales with device capability detection
   - Total asset budget: <500KB (models, textures, code)

5. **Placement Options**
   - Option A: Hero section background with content overlaid
   - Option B: Dedicated `/systems-visualization` page
   - Option C: Embedded within `/garden/systems-thinking-intro` note
   - Recommendation: Option C — contextual, not gratuitous

**Dependencies**:
```json
{
  "@threlte/core": "^7.0.0",
  "@threlte/extras": "^8.0.0",
  "three": "^0.160.0"
}
```

---

### 1.3 GSAP ScrollTrigger Animation System

**Vision**: Scroll-driven reveals that feel premium and intentional. Content emerges as the reader progresses, creating a sense of discovery without being distracting.

**Technical Implementation**:

```
Utility: src/utils/scroll-animations.ts
Components: Animation wrapper components
Integration: Per-page initialization via Astro client directives
```

**Animation Taxonomy**:

1. **Fade Up (Primary — used 70% of time)**
   ```css
   Initial: opacity: 0; transform: translateY(30px);
   Final: opacity: 1; transform: translateY(0);
   Duration: 0.8s
   Ease: power2.out
   Trigger: top 85% of viewport
   ```

2. **Stagger Fade (For lists, card grids)**
   ```css
   Same as Fade Up, but:
   Stagger: 0.1s between items
   Max stagger group: 6 items (reset counter for larger lists)
   ```

3. **Line Reveal (For horizontal rules, borders)**
   ```css
   Initial: scaleX(0); transform-origin: left;
   Final: scaleX(1);
   Duration: 1.2s
   Ease: power3.inOut
   ```

4. **Character Split (Headlines only, sparingly)**
   ```css
   Initial: opacity: 0; transform: translateY(100%);
   Final: opacity: 1; transform: translateY(0);
   Stagger: 0.02s per character
   Ease: power4.out
   ```

5. **Parallax Depth (Background elements only)**
   ```css
   Speed: 0.3 (moves at 30% of scroll speed)
   Direction: Up (element moves up as page scrolls down)
   ```

**Implementation Pattern**:

```typescript
// src/utils/scroll-animations.ts
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initScrollAnimations() {
  // Respect reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  // Fade up elements
  gsap.utils.toArray('[data-animate="fade-up"]').forEach((el) => {
    gsap.from(el as Element, {
      y: 30,
      opacity: 0,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el as Element,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    });
  });

  // Stagger groups
  gsap.utils.toArray('[data-animate="stagger-parent"]').forEach((parent) => {
    const children = (parent as Element).querySelectorAll('[data-animate="stagger-child"]');
    gsap.from(children, {
      y: 30,
      opacity: 0,
      duration: 0.8,
      ease: 'power2.out',
      stagger: 0.1,
      scrollTrigger: {
        trigger: parent as Element,
        start: 'top 85%',
      },
    });
  });
}
```

**Usage in Astro Components**:
```astro
<section data-animate="fade-up">
  <h2>Section Title</h2>
</section>

<div data-animate="stagger-parent">
  <div data-animate="stagger-child">Card 1</div>
  <div data-animate="stagger-child">Card 2</div>
  <div data-animate="stagger-child">Card 3</div>
</div>
```

**Page Integration**:
```astro
<!-- In BaseLayout.astro or individual pages -->
<script>
  import { initScrollAnimations } from '../utils/scroll-animations';

  // Re-initialize on View Transition navigation
  document.addEventListener('astro:page-load', () => {
    initScrollAnimations();
  });
</script>
```

---

### 1.4 View Transitions Enhancement

**Current State**: Basic fade transition implemented.

**Enhanced Vision**: Named view transitions for specific elements, creating visual continuity when navigating between pages.

**Detailed Specifications**:

1. **Card-to-Page Transition**
   - When clicking a note card in the garden, the card expands to become the page
   - Uses `view-transition-name` on both card and destination header

2. **Header Persistence**
   - Navigation header persists across transitions (doesn't fade)
   - `view-transition-name: header`

3. **Cross-fade Content Areas**
   - Main content area fades while new content fades in
   - Duration: 0.25s out, 0.35s in (asymmetric for snappier feel)

**Implementation**:

```astro
<!-- Card in garden listing -->
<a
  href={`/garden/${note.slug}`}
  style={`view-transition-name: note-${note.slug};`}
>
  <h3>{note.data.title}</h3>
</a>

<!-- Header on destination page -->
<h1 style={`view-transition-name: note-${slug};`}>
  {entry.data.title}
</h1>
```

```css
/* Custom transition timing */
::view-transition-old(note-*) {
  animation: scale-down 0.25s ease-in forwards;
}

::view-transition-new(note-*) {
  animation: scale-up 0.35s ease-out forwards;
}

@keyframes scale-down {
  to {
    transform: scale(0.95);
    opacity: 0;
  }
}

@keyframes scale-up {
  from {
    transform: scale(1.05);
    opacity: 0;
  }
}
```

---

## Part II: Digital Garden Architecture

### 2.1 Andy Matuschak-style Sliding Panes

**Vision**: When clicking a wikilink within a note, the linked note opens in a new pane to the right, allowing readers to follow thought trails without losing context. Multiple panes can stack horizontally.

**Technical Implementation**:

```
Component: src/components/SlidingPanes.svelte
Route: /garden/[...path].astro (modified to support stacked routes)
State: URL-based (shareable pane states)
```

**Detailed Specifications**:

1. **URL Structure**
   ```
   /garden/note-one                    → Single pane
   /garden/note-one/note-two           → Two panes
   /garden/note-one/note-two/note-three → Three panes
   ```

2. **Pane Behavior**
   - Each pane: `min-width: 400px; max-width: 600px;`
   - Horizontal scroll container when panes exceed viewport
   - Most recent pane auto-scrolls into view
   - Clicking within a pane closes all panes to its right
   - Close button (×) on each pane except the first

3. **Visual Treatment**
   - Slight shadow on left edge of each subsequent pane
   - Active pane: full opacity
   - Background panes: 95% opacity, slight blur (1px)
   - Pane divider: 1px `garden-border` with subtle gradient fade

4. **Mobile Behavior**
   - Single pane mode only (standard navigation)
   - Breakpoint: `< 768px`

5. **State Management**
   ```typescript
   // Svelte store for pane state
   interface PaneState {
     slugs: string[];
     activeIndex: number;
   }

   // Derive from URL on load
   // Update URL on pane changes (replaceState for closing, pushState for opening)
   ```

6. **Keyboard Navigation**
   - `←` / `→`: Navigate between panes
   - `Escape`: Close rightmost pane
   - `Cmd/Ctrl + Click`: Open in new pane (instead of navigating)

**Integration with Existing Garden**:
- Existing `/garden/[...slug].astro` becomes the single-pane fallback
- New `/garden/[...path].astro` with Svelte island handles multi-pane
- Detect pane support with feature detection, progressive enhancement

---

### 2.2 Wikilink Processing System

**Vision**: Write `[[note-slug]]` or `[[note-slug|Display Text]]` in markdown, have it transformed to proper links at build time.

**Technical Implementation**:

```
Plugin: src/plugins/remark-wikilinks.ts
Integration: astro.config.mjs markdown.remarkPlugins
```

**Detailed Specifications**:

1. **Syntax Support**
   ```markdown
   [[note-slug]]                    → Link with auto-generated text from note title
   [[note-slug|Custom Text]]        → Link with custom display text
   [[note-slug#heading]]            → Link with anchor
   [[note-slug#heading|Custom]]     → Link with anchor and custom text
   ```

2. **Resolution Logic**
   ```typescript
   function resolveWikilink(slug: string, allNotes: Map<string, Note>) {
     // 1. Exact match
     if (allNotes.has(slug)) return allNotes.get(slug);

     // 2. Case-insensitive match
     const lower = slug.toLowerCase();
     for (const [key, note] of allNotes) {
       if (key.toLowerCase() === lower) return note;
     }

     // 3. Title match (slugified)
     for (const [key, note] of allNotes) {
       if (slugify(note.title) === lower) return note;
     }

     // 4. Not found — return broken link indicator
     return null;
   }
   ```

3. **Output HTML**
   ```html
   <!-- Resolved link -->
   <a href="/garden/note-slug" class="wikilink" data-note="note-slug">
     Display Text
   </a>

   <!-- Broken link -->
   <span class="wikilink wikilink-broken" title="Note not found: missing-note">
     Missing Note
   </span>
   ```

4. **Styling**
   ```css
   .wikilink {
     color: var(--accent-amber);
     border-bottom: 1px solid rgba(212, 165, 116, 0.3);
     text-decoration: none;
     transition: border-color 0.2s;
   }

   .wikilink:hover {
     border-color: var(--accent-amber);
   }

   .wikilink-broken {
     color: var(--accent-terracotta);
     border-bottom: 1px dashed;
     cursor: help;
   }
   ```

5. **Preview on Hover (Enhancement)**
   - On desktop, hovering a wikilink for 300ms shows preview card
   - Preview contains: title, maturity badge, first 100 chars of content
   - Positioned above/below link based on viewport space

**Remark Plugin Structure**:

```typescript
// src/plugins/remark-wikilinks.ts
import { visit } from 'unist-util-visit';
import type { Plugin } from 'unified';

interface Options {
  notesMap: Map<string, { title: string; slug: string }>;
  basePath: string;
}

export const remarkWikilinks: Plugin<[Options]> = (options) => {
  const { notesMap, basePath = '/garden' } = options;

  return (tree) => {
    visit(tree, 'text', (node, index, parent) => {
      const wikilinkRegex = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;
      // ... transform text nodes containing wikilinks
    });
  };
};
```

---

### 2.3 Backlink Enhancement

**Current State**: Basic backlinks calculated at page level.

**Enhanced Vision**: Contextual backlinks showing the sentence/paragraph where the link appears.

**Detailed Specifications**:

1. **Context Extraction**
   - For each backlink, extract the paragraph containing the link
   - Highlight the linked phrase within that paragraph
   - Truncate to ~150 characters with ellipsis if needed

2. **Display Format**
   ```
   Notes that link here (3)

   ┌─────────────────────────────────────────────┐
   │ 🌿 Leverage Points in Restaurant Operations │
   │ "...applying [[leverage-points-systems]]    │
   │ to daily operations reveals that..."        │
   └─────────────────────────────────────────────┘
   ```

3. **Implementation**
   - During build, scan each note's AST for wikilinks
   - Store `{ source, target, context }` tuples
   - Query at render time for notes linking to current slug

---

### 2.4 Pagefind Static Search

**Vision**: Instant, client-side search across all garden content without server costs.

**Technical Implementation**:

```
Technology: Pagefind (https://pagefind.app)
Integration: Post-build indexing, Svelte search component
```

**Detailed Specifications**:

1. **Index Configuration**
   ```javascript
   // pagefind.config.js
   export default {
     site: 'dist',
     glob: '**/*.html',
     excludeSelectors: ['nav', 'footer', '.no-index'],
   };
   ```

2. **Build Integration**
   ```json
   // package.json
   {
     "scripts": {
       "build": "astro build && pagefind --site dist"
     }
   }
   ```

3. **Search Component**
   ```
   Component: src/components/Search.svelte
   Trigger: Cmd/Ctrl + K, or click search icon
   UI: Modal overlay with input and results
   ```

4. **Search UX**
   - Debounced input (150ms)
   - Results grouped by topic
   - Maturity badge shown per result
   - Keyboard navigation (↑↓ to select, Enter to go)
   - Recent searches remembered (localStorage)

5. **Visual Design**
   ```css
   .search-modal {
     background: rgba(18, 18, 18, 0.95);
     backdrop-filter: blur(10px);
     border: 1px solid var(--garden-border);
     border-radius: 12px;
     max-width: 600px;
     max-height: 70vh;
   }

   .search-input {
     background: var(--garden-surface);
     border: none;
     font-size: 1.125rem;
     padding: 16px 20px;
   }

   .search-result {
     padding: 12px 20px;
     border-bottom: 1px solid var(--garden-border);
   }

   .search-result:hover,
   .search-result[data-selected] {
     background: var(--garden-surface);
   }
   ```

---

### 2.5 Topic Cluster Pages

**Vision**: Dedicated landing pages for each topic that aggregate all notes, provide topic overview, and suggest reading paths.

**Implementation**:

```
Routes:
/garden/systems       → Systems Thinking topic page
/garden/hospitality   → Restaurant & Hospitality topic page
/garden/horticulture  → Growing Things topic page
/garden/ai            → AI & Technology topic page
/garden/play          → Play & Analysis topic page
```

**Page Structure**:

1. **Hero Section**
   - Topic icon (large, animated on load)
   - Topic title and description
   - Note count and maturity breakdown

2. **Suggested Reading Path**
   - Curated order of 3-5 notes for newcomers
   - "Start here" → "Then read" → "Deep dive" progression

3. **All Notes Grid**
   - Grouped by maturity (Evergreen first, then Budding, then Seedling)
   - Within each group, sorted by last updated

4. **Related Topics**
   - Notes that span multiple topics
   - Cross-pollination suggestions

---

## Part III: Visual Language & Iconography

### 3.1 Custom Icon System

**Vision**: Minimal line drawings (1.5-2px stroke) with organic curves — hand-drawn quality meeting technical precision.

**Technical Implementation**:

```
Format: SVG sprites or inline SVG components
Style: Consistent stroke width, rounded linecaps, organic bezier curves
```

**Icon Set Specifications**:

1. **Domain Icons** (used in navigation, topic headers)
   - Systems: Interconnected circles with feedback arrows
   - Hospitality: Abstract plate/table setting with flow lines
   - Horticulture: Organic leaf with root network
   - AI: Neural network nodes with clean geometry
   - Play: Abstract game piece or dice with motion lines

2. **Maturity Icons** (already using emoji, consider custom)
   - Seedling: Minimal sprout, two leaves
   - Budding: Three-leaf plant with visible stem
   - Evergreen: Full tree silhouette, simplified

3. **UI Icons**
   - Search: Magnifying glass with organic handle curve
   - Menu: Three organic lines (not perfectly straight)
   - Close: X with slightly curved ends
   - Arrow: Flowing arrow with momentum curve
   - External link: Box with escaping arrow

**Design Constraints**:
- Viewbox: 24×24 standard
- Stroke: 1.5px default, 2px for emphasis
- Linecap: round
- Linejoin: round
- Fill: none (stroke only)
- Colors: currentColor (inherits from parent)

**Component Structure**:
```astro
<!-- src/components/Icon.astro -->
---
interface Props {
  name: 'systems' | 'hospitality' | 'horticulture' | 'ai' | 'play' | 'search' | 'menu' | 'close' | 'arrow' | 'external';
  size?: number;
  class?: string;
}

const { name, size = 24, class: className } = Astro.props;

const icons = {
  systems: `<path d="M12 4a3 3 0 100 6 3 3 0 000-6zM6 14a3 3 0 100 6 3 3 0 000-6zM18 14a3 3 0 100 6 3 3 0 000-6z"/><path d="M12 10v4M9 14l-3 2M15 14l3 2"/>`,
  // ... other icons
};
---

<svg
  width={size}
  height={size}
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="1.5"
  stroke-linecap="round"
  stroke-linejoin="round"
  class={className}
  set:html={icons[name]}
/>
```

---

### 3.2 Photography Treatment System

**Vision**: When images are used, they should harmonize with the dark palette through consistent treatment.

**Technical Implementation**:

```
Processing: Sharp (at build time) or CSS filters (runtime)
```

**Treatment Specifications**:

1. **Color Grading**
   - Reduce saturation by 20%
   - Warm color temperature shift (+10 on amber channel)
   - Slight fade (black point raised to #121212)
   - Contrast: +5%

2. **CSS Filter Fallback**
   ```css
   .treated-image {
     filter:
       saturate(0.8)
       sepia(0.1)
       contrast(1.05)
       brightness(0.95);
   }
   ```

3. **Build-time Processing** (preferred for performance)
   ```typescript
   // In Astro image processing pipeline
   import sharp from 'sharp';

   async function treatImage(inputPath: string): Promise<Buffer> {
     return sharp(inputPath)
       .modulate({
         saturation: 0.8,
         brightness: 0.95,
       })
       .tint({ r: 255, g: 245, b: 235 }) // Warm tint
       .toBuffer();
   }
   ```

4. **Image Container**
   - Rounded corners: 8px
   - Subtle border: 1px solid garden-border/30
   - On hover: slight scale (1.02) with shadow

---

### 3.3 Generative Topic Identities

**Vision**: Each topic cluster has a unique procedural visual identity, generated from shared parameters but with distinct outputs.

**Implementation**:

```
Component: src/components/TopicVisual.svelte
Parameters: topic-specific seed, shared color palette, shared animation timing
Output: Unique generative pattern per topic
```

**Per-Topic Specifications**:

1. **Systems** — Orbital Rings
   - Concentric ellipses rotating at different speeds
   - Occasional "pulse" traveling around rings
   - Colors: Amber primary

2. **Hospitality** — Flow Diagrams
   - Bezier curves suggesting service flow
   - Nodes at intersection points
   - Colors: Terracotta primary

3. **Horticulture** — Growth Simulation
   - L-system branching patterns
   - Subtle "breathing" animation (scale oscillation)
   - Colors: Sage primary

4. **AI** — Network Mesh
   - Geometric grid with triangulated connections
   - Data "packets" traveling along edges
   - Colors: Blue (#6B9BD2) primary

5. **Play** — Particle System
   - Loose, playful particle movement
   - Occasional clustering and dispersal
   - Colors: Purple (#9B8BD2) primary

---

## Part IV: Technical Infrastructure

### 4.1 Build-time Wikilink & Backlink Index

**Vision**: Pre-compute all note relationships at build time for instant access.

**Implementation**:

```typescript
// src/utils/build-note-index.ts

interface NoteRelations {
  slug: string;
  title: string;
  outgoingLinks: Array<{ target: string; context: string }>;
  incomingLinks: Array<{ source: string; context: string }>;
}

export async function buildNoteIndex(): Promise<Map<string, NoteRelations>> {
  const allNotes = await getCollection('garden');
  const index = new Map<string, NoteRelations>();

  // First pass: extract outgoing links
  for (const note of allNotes) {
    const outgoing = extractWikilinks(note.body);
    index.set(note.slug, {
      slug: note.slug,
      title: note.data.title,
      outgoingLinks: outgoing,
      incomingLinks: [],
    });
  }

  // Second pass: compute incoming links
  for (const [slug, relations] of index) {
    for (const link of relations.outgoingLinks) {
      const target = index.get(link.target);
      if (target) {
        target.incomingLinks.push({
          source: slug,
          context: link.context,
        });
      }
    }
  }

  return index;
}
```

**Integration**:
- Run at build start, cache result
- Inject into Astro pages via `Astro.locals` or import

---

### 4.2 Cloudflare Workers Contact Form

**Vision**: Serverless form handling with spam protection.

**Implementation**:

```
Worker: functions/contact.ts (Cloudflare Pages Functions)
```

**Specifications**:

1. **Request Handling**
   ```typescript
   export async function onRequestPost({ request, env }) {
     const formData = await request.formData();

     // Validate honeypot field
     if (formData.get('website')) {
       return new Response('OK', { status: 200 }); // Silent fail for bots
     }

     // Rate limiting via Cloudflare KV
     const ip = request.headers.get('CF-Connecting-IP');
     const rateLimitKey = `ratelimit:${ip}`;
     const submissions = await env.KV.get(rateLimitKey);

     if (submissions && parseInt(submissions) >= 3) {
       return new Response('Too many submissions', { status: 429 });
     }

     // Store submission
     await env.KV.put(rateLimitKey, String((parseInt(submissions) || 0) + 1), {
       expirationTtl: 3600, // 1 hour
     });

     // Send email via Resend/SendGrid/etc
     await sendEmail({
       to: 'evan@example.com',
       from: 'noreply@evan.garden',
       subject: `Contact: ${formData.get('subject')}`,
       text: `
         Name: ${formData.get('name')}
         Email: ${formData.get('email')}
         Subject: ${formData.get('subject')}

         Message:
         ${formData.get('message')}
       `,
     });

     return new Response(JSON.stringify({ success: true }), {
       headers: { 'Content-Type': 'application/json' },
     });
   }
   ```

2. **Client Integration**
   - Update contact form to POST to `/contact`
   - Handle success/error states
   - Show confirmation message

---

### 4.3 RSS Feed with Full Content

**Vision**: Full-content RSS for readers who prefer feeds, with proper formatting.

**Implementation**:

```astro
<!-- src/pages/feed.xml.ts -->
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import sanitizeHtml from 'sanitize-html';
import MarkdownIt from 'markdown-it';

const parser = new MarkdownIt();

export async function GET(context) {
  const notes = await getCollection('garden', ({ data }) => !data.draft);

  return rss({
    title: 'evan.garden',
    description: 'The Grounded Generalist — ideas in cultivation',
    site: context.site,
    items: notes.map((note) => ({
      title: note.data.title,
      pubDate: note.data.updated || note.data.created,
      description: note.data.description,
      content: sanitizeHtml(parser.render(note.body)),
      link: `/garden/${note.slug}/`,
      categories: [note.data.topic, ...note.data.tags],
    })),
    customData: `<language>en-us</language>`,
  });
}
```

---

### 4.4 SEO & Meta Automation

**Vision**: Comprehensive meta tags, OpenGraph, Twitter Cards, JSON-LD structured data.

**Implementation**:

```astro
<!-- src/components/SEO.astro -->
---
interface Props {
  title: string;
  description: string;
  image?: string;
  type?: 'website' | 'article';
  publishedTime?: Date;
  modifiedTime?: Date;
  tags?: string[];
}

const {
  title,
  description,
  image = '/og-default.png',
  type = 'website',
  publishedTime,
  modifiedTime,
  tags = [],
} = Astro.props;

const canonicalURL = new URL(Astro.url.pathname, Astro.site);
const imageURL = new URL(image, Astro.site);

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': type === 'article' ? 'Article' : 'WebSite',
  headline: title,
  description,
  image: imageURL.href,
  url: canonicalURL.href,
  ...(publishedTime && { datePublished: publishedTime.toISOString() }),
  ...(modifiedTime && { dateModified: modifiedTime.toISOString() }),
  author: {
    '@type': 'Person',
    name: 'Evan Ramirez',
    url: 'https://evan.garden',
  },
};
---

<!-- Primary -->
<title>{title} | evan.garden</title>
<meta name="description" content={description} />
<link rel="canonical" href={canonicalURL} />

<!-- Open Graph -->
<meta property="og:type" content={type} />
<meta property="og:url" content={canonicalURL} />
<meta property="og:title" content={title} />
<meta property="og:description" content={description} />
<meta property="og:image" content={imageURL} />
<meta property="og:site_name" content="evan.garden" />

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content={title} />
<meta name="twitter:description" content={description} />
<meta name="twitter:image" content={imageURL} />

<!-- Article specific -->
{publishedTime && <meta property="article:published_time" content={publishedTime.toISOString()} />}
{modifiedTime && <meta property="article:modified_time" content={modifiedTime.toISOString()} />}
{tags.map(tag => <meta property="article:tag" content={tag} />)}

<!-- JSON-LD -->
<script type="application/ld+json" set:html={JSON.stringify(jsonLd)} />
```

---

### 4.5 Cloudflare Web Analytics

**Vision**: Privacy-focused analytics without cookies.

**Implementation**:

```html
<!-- In BaseLayout.astro, before </body> -->
<script
  defer
  src='https://static.cloudflareinsights.com/beacon.min.js'
  data-cf-beacon='{"token": "YOUR_TOKEN"}'
></script>
```

---

## Part V: Polish & Accessibility

### 5.1 Accessibility Audit Checklist

**Automated Testing**:
- [ ] Run axe-core on all page templates
- [ ] Run Lighthouse accessibility audit (target: 100)
- [ ] Test with WAVE browser extension

**Manual Testing**:
- [ ] Full keyboard navigation test (Tab, Shift+Tab, Enter, Escape)
- [ ] Screen reader testing (VoiceOver on Mac, NVDA on Windows)
- [ ] Test at 200% zoom
- [ ] Test with Windows High Contrast mode
- [ ] Test with forced colors mode

**Specific Fixes Required**:

1. **Focus Management**
   - Visible focus rings on all interactive elements
   - Focus trap in modals (search, mobile menu)
   - Focus restoration after modal close

2. **ARIA Labels**
   - Navigation landmarks (`<nav aria-label="Main">`)
   - Search button: `aria-label="Search, press Command K"`
   - Mobile menu button: `aria-expanded` state
   - Knowledge graph: `role="img" aria-label="Knowledge graph visualization"`

3. **Color Contrast**
   - Verify all text meets WCAG AA (4.5:1 for body, 3:1 for large text)
   - Secondary text (#A0A0A0 on #1C1C1C) may need lightening

4. **Motion**
   - All animations respect `prefers-reduced-motion`
   - Auto-playing animations have pause controls
   - No content depends solely on animation to convey meaning

5. **Images**
   - All images have descriptive alt text
   - Decorative images have `alt=""`
   - Complex visualizations have text alternatives

---

### 5.2 Performance Optimization

**Targets**:
- Lighthouse Performance: 95+
- First Contentful Paint: <1.5s
- Largest Contentful Paint: <2.5s
- Cumulative Layout Shift: <0.1
- Total Blocking Time: <200ms

**Optimization Strategies**:

1. **Font Loading**
   ```css
   /* Preload critical fonts */
   <link rel="preload" href="/fonts/InstrumentSerif.woff2" as="font" type="font/woff2" crossorigin>

   /* Font-display swap */
   @font-face {
     font-family: 'Instrument Serif';
     src: url('/fonts/InstrumentSerif.woff2') format('woff2');
     font-display: swap;
   }
   ```

2. **Image Optimization**
   - Use Astro's `<Image>` component for automatic optimization
   - Serve WebP with JPEG fallback
   - Lazy-load below-fold images

3. **Code Splitting**
   - Svelte islands load only when visible (`client:visible`)
   - Three.js loads only on systems visualization page
   - GSAP loads only when animations needed

4. **Caching Strategy**
   ```
   # Cloudflare Pages _headers
   /assets/*
     Cache-Control: public, max-age=31536000, immutable

   /*.html
     Cache-Control: public, max-age=0, must-revalidate
   ```

---

### 5.3 Error States & Edge Cases

**404 Page**:
- Custom design matching site aesthetic
- Suggested links to popular content
- Search box prominently featured
- Subtle animation (lost in the garden metaphor)

**Empty States**:
- Garden with no notes in a topic: "Seeds planted here soon"
- Search with no results: "No notes found. Try a different search?"
- Project list empty: "Projects brewing. Check back soon."

**Loading States**:
- Skeleton loaders for content areas
- Spinner for search results
- Progressive image loading (blur-up technique)

---

## Part VI: Content & Copywriting

### 6.1 Voice & Tone Guidelines

**Core Attributes**:
- **Thoughtful**: Ideas are presented as considered, not rushed
- **Precise**: Language is specific, not vague
- **Warm**: Approachable, not clinical or cold
- **Confident**: Assertions made without hedging unnecessarily
- **Curious**: Questions valued as much as answers

**Examples**:

❌ "I think maybe systems thinking could possibly help with restaurants"
✅ "Systems thinking reveals leverage points in restaurant operations that intuition misses"

❌ "Welcome to my website! I do lots of things!"
✅ "Cultivating ideas across systems, hospitality, and growth"

---

### 6.2 Required Content Pieces

**Static Pages**:
- [x] Homepage
- [x] Start Here
- [x] About
- [x] Consulting
- [x] Contact
- [x] Colophon (how the site was built)
- [x] Now page (current focus, updated regularly)
- [x] Uses page (tools, setup, gear)

**Garden Notes (Minimum Viable Garden)**:
- [x] Leverage Points: Places to Intervene in a System (evergreen)
- [x] Leverage Points in Restaurant Operations (budding)
- [x] The CAMELOT Framework (evergreen)
- [x] Cannabis Cultivation Fundamentals (seedling)
- [x] Introduction to Systems Thinking (budding)
- [x] Toast POS Mastery (evergreen)
- [ ] System-of-One: AI-Augmented Solopreneurship (budding)
- [ ] Hospitality Collective Concept (seedling)
- [ ] Donella Meadows: An Appreciation (budding)
- [ ] Reading Restaurant Operations as System Dynamics (seedling)
- [ ] The Chatham Squire: Six Years of Lessons (budding)
- [ ] NFL as Complex Adaptive System (seedling)
- [ ] Orchestrating AI Agents: Patterns and Pitfalls (budding)

**Projects**:
- [x] CAMELOT Framework (active)
- [x] System-of-One (concept)
- [x] Hospitality Collective (concept)
- [ ] evan.garden itself (active, meta)

---

## Part VII: Implementation Priority Matrix

### Critical Path (Must Have)
1. [x] Wikilink processing plugin (content unusable without it)
2. [x] GSAP scroll animations (transforms static to premium)
3. [x] Search functionality (discovery essential)
4. [x] Topic cluster pages (navigation structure)
5. [x] RSS feed (content distribution)

### High Value (Should Have)
6. [ ] Sliding panes interface (signature feature)
7. [x] Generative homepage background (first impression)
8. [x] Contact form backend (functional requirement)
9. [x] Contextual backlinks (garden depth)
10. [x] Custom icon set (visual coherence)

### Enhancement (Nice to Have)
11. [ ] Three.js systems visualization
12. [x] Preview on wikilink hover
13. [ ] Generative topic identities
14. [ ] Photography treatment pipeline
15. [x] Now/Uses/Colophon pages

### Future (Defer)
16. Light mode toggle
17. Reading progress indicator
18. Note versioning/history
19. Comments/reactions system
20. API for external consumption

---

## Part VIII: File-by-File Implementation Checklist

### New Files to Create

```
src/
├── plugins/
│   └── remark-wikilinks.ts          # Wikilink processing
├── components/
│   ├── GenerativeBackground.svelte   # Homepage mycelium network
│   ├── SystemsVisualization.svelte   # Three.js visualization
│   ├── Search.svelte                  # Pagefind search modal
│   ├── SlidingPanes.svelte           # Multi-pane note reader
│   ├── Icon.astro                     # Custom icon system
│   ├── WikilinkPreview.svelte        # Hover preview cards
│   ├── TopicVisual.svelte            # Generative topic patterns
│   └── SEO.astro                      # Meta tag automation
├── utils/
│   ├── scroll-animations.ts          # GSAP initialization
│   ├── build-note-index.ts           # Pre-computed relationships
│   ├── poisson-disk.ts               # Generative sampling
│   └── simplex-noise.ts              # Noise functions
├── pages/
│   ├── feed.xml.ts                   # RSS feed
│   ├── 404.astro                     # Custom 404
│   ├── colophon.astro                # How site was built
│   ├── now.astro                     # Current focus
│   ├── uses.astro                    # Tools and setup
│   └── garden/
│       ├── systems.astro             # Topic cluster
│       ├── hospitality.astro         # Topic cluster
│       ├── horticulture.astro        # Topic cluster
│       ├── ai.astro                  # Topic cluster
│       └── play.astro                # Topic cluster
├── content/garden/
│   ├── system-of-one.md              # New note
│   ├── hospitality-collective.md     # New note
│   ├── donella-meadows.md            # New note
│   ├── reading-restaurant-systems.md # New note
│   ├── chatham-squire-lessons.md     # New note
│   ├── nfl-complex-systems.md        # New note
│   └── ai-agent-patterns.md          # New note
└── content/projects/
    └── evan-garden.md                 # Meta project

functions/
└── contact.ts                         # Cloudflare Worker

public/
├── fonts/
│   ├── InstrumentSerif.woff2         # Self-hosted fonts
│   └── DMSans.woff2
└── og-default.png                     # Default OG image
```

### Files to Modify

```
astro.config.mjs                       # Add remark plugin, RSS
package.json                           # Add dependencies
tailwind.config.mjs                    # Additional utilities
src/styles/global.css                  # Animation classes, new components
src/layouts/BaseLayout.astro           # SEO component, analytics
src/pages/index.astro                  # Generative background, animations
src/pages/garden/index.astro           # Search integration, animations
src/pages/garden/[...slug].astro       # Backlink context, sliding panes
src/components/Header.astro            # Search trigger, custom icons
src/components/Footer.astro            # RSS link, updated navigation
```

---

## Conclusion

This plan represents approximately **65% additional work** to complete the full vision. The current foundation is solid — the structure is right, the design system is in place, and the content architecture works. What remains is the craft: the generative elements that make the site feel alive, the interaction patterns that enable discovery, and the polish that signals premium quality.

The sliding panes interface is the signature feature that will differentiate this from typical portfolios. The generative background sets the tone from first visit. The GSAP animations transform the experience from static to premium. Together, these elements create what the original documents envisioned: a digital garden that is simultaneously a technical showcase, a personal wiki, and an embodiment of systems thinking made visible.

**Next session**: Begin with the remark-wikilinks plugin (unblocks content writing), then GSAP scroll animations (highest visual impact for effort), then generative homepage background (first impression optimization).
