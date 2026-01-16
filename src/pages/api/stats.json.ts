import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  const allNotes = await getCollection('garden', ({ data }) => !data.draft);
  const allProjects = await getCollection('projects');

  // Count notes by maturity
  const maturityCounts = {
    seedling: 0,
    budding: 0,
    evergreen: 0,
  };

  // Count notes by topic
  const topicCounts: Record<string, number> = {};

  // Collect all tags
  const tagCounts: Record<string, number> = {};

  // Calculate total word count
  let totalWordCount = 0;

  for (const note of allNotes) {
    // Maturity
    maturityCounts[note.data.maturity]++;

    // Topic
    topicCounts[note.data.topic] = (topicCounts[note.data.topic] || 0) + 1;

    // Tags
    for (const tag of note.data.tags) {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    }

    // Word count (rough estimate)
    totalWordCount += note.body.split(/\s+/).length;
  }

  // Find most recent note
  const sortedByDate = [...allNotes].sort((a, b) => {
    const dateA = a.data.updated || a.data.created;
    const dateB = b.data.updated || b.data.created;
    return dateB.getTime() - dateA.getTime();
  });

  const mostRecent = sortedByDate[0];

  const stats = {
    notes: {
      total: allNotes.length,
      byMaturity: maturityCounts,
      byTopic: topicCounts,
    },
    projects: {
      total: allProjects.length,
    },
    tags: {
      total: Object.keys(tagCounts).length,
      popular: Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([tag, count]) => ({ tag, count })),
    },
    content: {
      totalWordCount,
      averageWordCount: Math.round(totalWordCount / allNotes.length),
    },
    lastUpdated: mostRecent ? {
      slug: mostRecent.slug,
      title: mostRecent.data.title,
      date: (mostRecent.data.updated || mostRecent.data.created).toISOString(),
    } : null,
    generatedAt: new Date().toISOString(),
  };

  return new Response(JSON.stringify(stats), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
