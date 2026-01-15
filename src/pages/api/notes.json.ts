import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  const allNotes = await getCollection('garden', ({ data }) => !data.draft);

  const notesData: Record<string, any> = {};

  for (const note of allNotes) {
    const { Content, remarkPluginFrontmatter } = await note.render();

    notesData[note.slug] = {
      slug: note.slug,
      title: note.data.title,
      description: note.data.description || '',
      maturity: note.data.maturity,
      topic: note.data.topic,
      created: note.data.created.toISOString(),
      updated: note.data.updated?.toISOString(),
      tags: note.data.tags,
      // We'll use a simpler approach - store the raw body for client-side rendering
      body: note.body,
    };
  }

  return new Response(JSON.stringify(notesData), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
