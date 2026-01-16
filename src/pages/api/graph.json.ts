import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';

interface GraphNode {
  id: string;
  title: string;
  topic: string;
  maturity: string;
  href: string;
}

interface GraphLink {
  source: string;
  target: string;
}

export const GET: APIRoute = async () => {
  const allNotes = await getCollection('garden', ({ data }) => !data.draft);

  const nodes: GraphNode[] = allNotes.map(note => ({
    id: note.slug,
    title: note.data.title,
    topic: note.data.topic,
    maturity: note.data.maturity,
    href: `/garden/${note.slug}`,
  }));

  const slugSet = new Set(allNotes.map(n => n.slug));
  const links: GraphLink[] = [];

  // Extract links from wikilinks and relatedNotes
  for (const note of allNotes) {
    // From relatedNotes frontmatter
    if (note.data.relatedNotes) {
      for (const targetSlug of note.data.relatedNotes) {
        if (slugSet.has(targetSlug)) {
          links.push({ source: note.slug, target: targetSlug });
        }
      }
    }

    // From wikilinks in content
    const wikilinkMatches = note.body.matchAll(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g);
    for (const match of wikilinkMatches) {
      const targetSlug = match[1].toLowerCase().replace(/\s+/g, '-');
      if (slugSet.has(targetSlug) && targetSlug !== note.slug) {
        // Avoid duplicate links
        const exists = links.some(
          l => (l.source === note.slug && l.target === targetSlug) ||
               (l.source === targetSlug && l.target === note.slug)
        );
        if (!exists) {
          links.push({ source: note.slug, target: targetSlug });
        }
      }
    }
  }

  return new Response(JSON.stringify({ nodes, links }), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
