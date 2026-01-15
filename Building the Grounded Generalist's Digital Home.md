# Building the Grounded Generalist's Digital Home

A personal website for a polymath must accomplish something rare: unify restaurant tech consulting, horticulture education, AI systems development, NFL analysis, and systems thinking into a coherent digital identity without fragmenting into confusion. **The solution lies in a digital garden architecture that treats diverse expertise as interconnected knowledge nodes**, combined with restrained premium aesthetics that signal sophistication without coldness, and selective experimental elements that demonstrate technical capability without sacrificing usability.

The recommended approach synthesizes Maggie Appleton's digital garden philosophy with Rapha/Aesop's warm minimalism, built on **Astro with Svelte islands deployed to Cloudflare Pages**. The domain **evan.garden** captures both literal horticultural expertise and the digital garden metaphor, while a hub-and-spoke information architecture allows visitors to enter from any direction and discover unexpected connections through systems thinking as the unifying lens.

---

## The digital garden model redefines what a portfolio can be

Traditional portfolios present finished work chronologically. Digital gardens present evolving ideas topographically, organized by contextual relationships rather than publication dates. Maggie Appleton articulates six defining patterns that apply directly to a polymath platform: topography over timelines, continuous growth, imperfection and learning in public, playful experimentation, content diversity, and independent ownership.

**Andy Matuschak's evergreen notes system provides the implementation blueprint**—atomic notes focused on single concepts, densely linked rather than categorized, and written for accumulation over time. His sliding panes interface allows readers to follow thought trails without losing context, with backlinks revealing how ideas connect across domains. For Evan, this means a note on "leverage points in restaurant operations" could link naturally to Donella Meadows' systems framework, Toast POS implementation strategies, and observations from six years at The Chatham Squire.

The maturity indicators pioneered by Appleton—**seedling, budding, and evergreen status**—solve a critical problem for polymaths: permission to publish incomplete thoughts. A seedling note on AI orchestration doesn't need the polish of an evergreen essay on hospitality collective concepts. Visitors understand they're seeing thinking in progress, which builds trust rather than undermining credibility.

Tom Critchlow demonstrates how consulting presence and digital garden coexist elegantly. His site maintains clear professional navigation while housing "wiki folders" of evolving ideas. The key insight: writing that exposes thinking process attracts aligned clients more effectively than polished case studies alone.

---

## Experimental design must serve discovery, not spectacle

Bruno Simon's portfolio—where visitors drive a toy car through a 3D world to discover information—represents the pinnacle of experimental web portfolios. It works because the spectacle serves the content rather than obscuring it. **Every interactive element lives within the physics simulation; the experience is unified rather than decorative.** His technical approach offers practical lessons: baked lighting rather than real-time calculations, primitive collision shapes separate from detailed visual models, and debug tools hidden at special URLs rather than cluttering the production experience.

Joshua Davis takes a different but equally instructive approach. His generative art process uses Processing with his HYPE Framework, creating rule-based randomized compositions. But critically, his portfolio site itself remains minimal—"layout as quiet vehicle for content." The lesson for Evan: the work should shine, while the interface stays out of the way. Save the generative flourishes for specific moments rather than overwhelming every page.

Lynn Fisher's annual redesigns demonstrate what CSS mastery enables. Her 2017 version changed layout every 100 pixels, proving sites needn't look identical across devices. Her 2021 version used Typetura.js to create animations triggered by browser resize—experimental but accessible, with visually-hidden descriptions for screen readers. **The pattern across all exemplary experimental portfolios: progressive enhancement, graceful degradation, and respect for user preferences including reduced motion.**

For Evan's platform, experimental elements should appear strategically—perhaps an interactive knowledge graph visualization, a generative background on the homepage, or animated transitions between pages using the View Transitions API. Three.js or React Three Fiber could power a 3D visualization of systems thinking concepts without requiring visitors to navigate in 3D space.

---

## Premium restraint creates warmth through deliberate choices

Rapha commissioned custom typefaces from Commercial Type: Rapha Sans (based on 1870s Caslon Doric No. 4) and Rapha Serif (inspired by William Caslon's 1734 Great Primer). This investment in bespoke typography exemplifies how restraint reads as confidence. **Hours poured into hairline details, documentary-style imagery showing authentic struggle, strong connection to heritage—these choices communicate luxury more effectively than visual maximalism.**

Aesop's approach centers on "un-selling"—matte black and white brochures rather than glossy, Japanese wabi-sabi aesthetics emphasizing intelligent beauty, and clean lines with neutral colors. Their 256-page brand book covers everything from typography to art direction to social media, ensuring every touchpoint reinforces the same sensibility. The signature amber/brown tones, appearing in both product bottles and digital presence, create warmth that feels artisanal rather than sterile.

For dark themes that feel inviting rather than cold, the key is avoiding pure black (#000000) in favor of warm near-blacks like #1C1C1C with subtle brown undertones. Text should be warm white (#F5F0E8) rather than stark white. **Amber accents (#D4A574) and terracotta secondary tones (#C4725B) create the hospitality warmth Evan's identity requires** while maintaining the premium feel essential for consulting credibility.

The whitespace philosophy matters equally: luxury brands use empty space to signal that content deserves its own stage. Studies show websites with generous whitespace achieve **35-45% higher visual attention** on focal elements. The premium aesthetic comes not from adding elements but from confidently subtracting them.

---

## The technical stack should prioritize content and AI-assisted development

**Astro emerges as the clear framework choice** for this specific combination of requirements. Its islands architecture ships zero JavaScript by default, adding interactivity only where needed. Its Content Collections API provides type-safe content management with Zod schemas and automatic frontmatter validation—perfect for digital garden organization. Most importantly, Astro's simple, predictable file structure works exceptionally well with AI coding agents.

The framework-agnostic nature means using the best tool for each job: Svelte islands for smooth animations (smaller bundles than React), React only where Three.js integration via React Three Fiber is needed, and vanilla JavaScript or Web Components for simpler interactions. GSAP with ScrollTrigger handles complex timeline animations across any framework, while the View Transitions API—now in Astro with excellent integration—enables cross-page animations previously impossible without single-page application complexity.

**Cloudflare Pages wins for hosting** due to unlimited bandwidth (critical for creative portfolios with 3D assets), 300+ edge locations for global performance, free R2 storage for textures and models, and zero-configuration Astro adapter support. The combination provides enterprise-level infrastructure at zero cost for typical personal site traffic.

For the digital garden's bidirectional linking, the remark-wiki-link plugin processes [[wikilinks]] syntax during build, while a custom plugin generates backlinks by scanning all markdown files and building a link index. D3-force powers the knowledge graph visualization, rendering in an Astro island with client:visible to lazy-load only when scrolled into view.

Graph visualization should use D3-force for under 500 nodes (sufficient for most digital gardens), with Cytoscape.js or vis-network for larger collections. The graph serves as a discovery tool rather than primary navigation—optional but powerful for demonstrating interconnected expertise.

---

## Domain naming should embrace the garden metaphor

The **evan.garden** domain captures multiple layers of meaning simultaneously: literal horticulture expertise from teaching at Northeastern Institute of Cannabis, the digital garden knowledge management philosophy, and the cultivation metaphor that spans all of Evan's domains—cultivating restaurant operations, cultivating AI systems, cultivating ideas. The .garden TLD costs approximately $25-35/year and remains distinctive without feeling gimmicky.

Alternative strong options include **evan.systems** (directly invoking the Donella Meadows systems thinking influence) and **grounded.garden** (connecting the "Grounded Generalist" identity with the cultivation concept). The .systems TLD signals technical credibility while .garden signals the personal, exploratory nature of the platform.

The domain should work when spoken aloud—an increasingly important consideration for voice search and verbal sharing. "Evan dot garden" passes this test cleanly, memorable without requiring spelling clarification.

---

## Site architecture uses hub-and-spoke with digital garden navigation

The information architecture balances professional credibility with exploratory discovery through a hub-and-spoke model with rhizomatic internal connections:

- **Homepage as hub**: Clear identity as "The Grounded Generalist," brief positioning statement, and navigation spokes to major areas
- **Start Here page**: Essential for polymaths—segmented entry points based on visitor intent (consulting inquiry, learning about systems thinking, exploring horticulture, general curiosity)
- **Consulting section**: Professional presentation with clear service offerings, approach description, and contact pathway—kept distinct from exploratory content
- **Garden/Notes section**: The digital garden organized by topic clusters (Restaurant & Hospitality, Growing Things, Systems & AI, Play & Analysis) with maturity indicators and bidirectional backlinks
- **Projects**: Portfolio pieces and current work including CAMELOT and System-of-One frameworks

Navigation remains minimal and persistent—Home, Start Here, Consulting, Garden, About—with topic clusters and search enabling deeper exploration within the garden. A footer provides comprehensive site map for those who prefer structured navigation.

The unifying lens is systems thinking: restaurant operations as systems, gardens as ecosystems, AI orchestration as system design, NFL analysis as game system understanding. This framing positions breadth as strength rather than scattered interests.

---

## The design system balances warmth with technical sophistication

**Color palette** built on warm dark mode principles:

The foundation uses near-black (#121212) elevated to warm charcoal (#1C1C1C) for depth hierarchy, with surfaces gaining subtle brown undertones (#2A2724). Text appears in warm white (#F5F0E8)—cream-tinted rather than stark—with secondary text at #A0A0A0. The primary accent amber (#D4A574) and secondary terracotta (#C4725B) invoke hospitality warmth, while sage green (#7D8B75) provides occasional horticulture references.

**Typography** pairs high-contrast serif headlines with humanist sans-serif body text:

For headlines, **Instrument Serif** or **Playfair Display** (variable font) provides editorial sophistication without stuffiness. For body text, **DM Sans** or **Source Sans Pro** offers warmth and readability. Variable fonts reduce payload while enabling smooth weight animations—a single 100KB file replaces 500KB+ of static font files.

**Spacing** follows an 8px base unit with generous section margins (48-120px), card padding at 24-32px, and line height at 1.5-1.75em. The premium feel comes from confident whitespace rather than dense layouts.

**Motion principles** respect user preferences (prefers-reduced-motion media query), use View Transitions API for page changes, apply GSAP ScrollTrigger for scroll-driven reveals, and reserve intensive animations for optional enhancements that lazy-load when visible.

---

## Visual motifs unify disparate expertise through organic networks

The visual language draws from concepts spanning all of Evan's domains: **root systems, mycelium networks, and feedback loops**. In gardening, these represent literal biological networks. In technology, they visualize system architectures and data flows. In Donella Meadows' framework, they illustrate interconnected feedback mechanisms. In hospitality, they show service delivery connections.

Iconography should use minimal line drawings (1.5-2px stroke) with organic curves—hand-drawn quality meeting technical precision. Avoid overly literal representations; abstract network motifs work across all contexts without forcing category associations.

Photography treatment uses subtle desaturation and contrast adjustment to harmonize with the dark palette, with warm lighting and texture focus (soil, materials, interfaces). Images should include negative space for typography overlay, creating editorial compositions rather than stock photography aesthetics.

Generative elements—perhaps procedural backgrounds using WASM for performance—could create unique visual identities for each garden topic cluster while maintaining cohesive style through shared parameters (color palette, line weights, animation timing).

---

## Implementation roadmap for AI-assisted development

**Phase 1: Foundation (Weeks 1-2)**
Establish Astro project with Content Collections, configure Cloudflare Pages deployment with automatic builds from Git, create AGENTS.md documentation for AI assistants, and implement basic MDX content structure with frontmatter schemas for garden notes.

**Phase 2: Digital Garden (Weeks 3-4)**
Build Obsidian → Astro synchronization workflow using obsidian-git plugin, implement bidirectional linking via remark-wiki-link and custom backlink generator, create knowledge graph visualization with D3-force in lazy-loaded Svelte island, and add Pagefind static search.

**Phase 3: Creative Features (Weeks 5-6)**
Implement View Transitions API for cross-page animations, add GSAP scroll-driven reveals for key sections, build React Three Fiber visualization for systems thinking concepts (optional hero element), and optimize performance through lazy loading and code splitting.

**Phase 4: Polish (Weeks 7-8)**
Complete consulting section with contact form via Cloudflare Workers, implement RSS feed with full MDX rendering, optimize for SEO and add meta tag automation, configure Cloudflare Web Analytics (privacy-focused, no cookies), and conduct accessibility audit and remediation.

The AGENTS.md file should document the tech stack explicitly (Astro 5.x, Tailwind CSS, GSAP, Svelte for animations, React for R3F only), build commands, code guidelines (TypeScript everywhere, Astro components as default), and file structure conventions. AI agents work best with predictable patterns and clear documentation.

---

## Reference sites exemplify each design dimension

For digital garden architecture, study **maggieappleton.com** (visual taxonomy, growth metaphors, topic organization), **notes.andymatuschak.org** (sliding panes, dense linking, evergreen note principles), and **tomcritchlow.com** (consulting plus garden integration, wiki folders, multi-project identity).

For experimental web design, analyze **bruno-simon.com** (3D portfolio done right, performance optimization, unified physics world), **lynnandtonic.com** (annual CSS experiments, progressive enhancement, accessibility in experimental contexts), and **joshuadavis.com** (minimal interface, generative work showcase, HYPE Framework approach).

For premium restraint aesthetics, reference **rapha.cc** (custom typography, documentary photography, cycling heritage meets modern design) and **aesop.com** (amber warmth, un-selling philosophy, consistent brand system).

For technical implementation, consult the **Astro documentation** (Content Collections, View Transitions integration), **threejs-journey.com** (Bruno Simon's Three.js learning resource), and **gsap.com** examples (ScrollTrigger patterns, timeline animations).

---

## Conclusion: Systems thinking as the unifying principle

The strongest insight emerging from this research is that Evan's diverse expertise isn't a branding problem to solve—it's an advantage to showcase. The digital garden model exists precisely because knowledge doesn't fit neatly into categories. Systems thinking provides the narrative thread: all of Evan's domains involve understanding how components interact, identifying leverage points for change, and cultivating growth over time.

The technical and design choices support this narrative. **Astro's islands architecture mirrors systems thinking**—discrete components interacting without monolithic coupling. The warm dark palette with amber accents creates hospitality warmth appropriate for someone teaching cannabis cultivation and planning cocktail bar concepts. The bidirectional linking in the digital garden demonstrates interconnected thinking in practice.

The evan.garden domain works because cultivation is the common thread: cultivating restaurant operations excellence, cultivating plant growth, cultivating AI systems, cultivating analytical frameworks, cultivating a consulting practice. This isn't scattered expertise—it's applied systems thinking across multiple domains, made visible through thoughtful information architecture and restrained, premium design.