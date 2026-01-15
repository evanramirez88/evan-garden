import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';
import { marked } from 'marked';

// Configure marked for wikilinks
const renderer = new marked.Renderer();
const originalLink = renderer.link.bind(renderer);

renderer.link = function(href: string, title: string | null, text: string) {
  // Check if it's a wikilink pattern that wasn't processed
  if (href.startsWith('/garden/')) {
    return `<a href="${href}" class="wikilink">${text}</a>`;
  }
  return originalLink(href, title, text);
};

marked.setOptions({
  renderer,
  gfm: true,
  breaks: false,
});

// Simple wikilink processor
function processWikilinks(markdown: string): string {
  // Process [[slug]] and [[slug|text]] patterns
  return markdown.replace(
    /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g,
    (match, slug, text) => {
      const displayText = text || slug.split('-').map((w: string) =>
        w.charAt(0).toUpperCase() + w.slice(1)
      ).join(' ');
      return `[${displayText}](/garden/${slug})`;
    }
  );
}

export const GET: APIRoute = async () => {
  const allNotes = await getCollection('garden', ({ data }) => !data.draft);

  const notesData: Record<string, any> = {};

  for (const note of allNotes) {
    // Process wikilinks in markdown, then render to HTML
    const processedMarkdown = processWikilinks(note.body);
    const htmlContent = marked.parse(processedMarkdown);

    notesData[note.slug] = {
      slug: note.slug,
      title: note.data.title,
      description: note.data.description || '',
      maturity: note.data.maturity,
      topic: note.data.topic,
      created: note.data.created.toISOString(),
      updated: note.data.updated?.toISOString(),
      tags: note.data.tags,
      content: htmlContent,
    };
  }

  return new Response(JSON.stringify(notesData), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
