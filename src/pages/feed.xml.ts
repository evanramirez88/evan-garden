import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const notes = await getCollection('garden', ({ data }) => !data.draft);

  // Sort by updated/created date, newest first
  const sortedNotes = notes.sort((a, b) => {
    const dateA = a.data.updated || a.data.created;
    const dateB = b.data.updated || b.data.created;
    return dateB.getTime() - dateA.getTime();
  });

  return rss({
    title: 'evan.garden',
    description: 'The Grounded Generalist — A digital garden of interconnected ideas spanning systems thinking, restaurant tech, horticulture, and AI.',
    site: context.site!,
    items: sortedNotes.map((note) => ({
      title: note.data.title,
      pubDate: note.data.updated || note.data.created,
      description: note.data.description || `A ${note.data.maturity} note on ${note.data.title}`,
      link: `/garden/${note.slug}/`,
      categories: [note.data.topic, ...note.data.tags],
      customData: `<maturity>${note.data.maturity}</maturity>`,
    })),
    customData: `<language>en-us</language>`,
  });
}
