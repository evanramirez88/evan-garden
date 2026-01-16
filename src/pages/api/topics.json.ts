import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';

const topicMeta = {
  systems: {
    title: 'Systems Thinking',
    description: 'Understanding how components interact, identifying leverage points for change, and seeing the whole rather than just the parts.',
    icon: '◎',
    color: '#D4A574',
  },
  hospitality: {
    title: 'Restaurant & Hospitality',
    description: 'Six years of lessons from The Chatham Squire, Toast POS mastery, and building hospitality systems that scale.',
    icon: '◇',
    color: '#C4725B',
  },
  horticulture: {
    title: 'Growing Things',
    description: 'From cannabis cultivation certification to understanding botanical systems — the science and art of helping things grow.',
    icon: '❋',
    color: '#7D8B75',
  },
  ai: {
    title: 'AI & Technology',
    description: 'Orchestrating AI systems, building with agents, and exploring the frontier of what becomes possible when humans and machines collaborate.',
    icon: '⬡',
    color: '#6B9BD2',
  },
  play: {
    title: 'Play & Analysis',
    description: 'NFL analysis, game theory, and the serious business of understanding complex competitive systems.',
    icon: '◈',
    color: '#9B8BD2',
  },
  meta: {
    title: 'Meta',
    description: 'Notes about the garden itself — how it works, why it exists, and the philosophy behind digital gardens.',
    icon: '✦',
    color: '#A0A0A0',
  },
};

export const GET: APIRoute = async () => {
  const allNotes = await getCollection('garden', ({ data }) => !data.draft);

  const topics = Object.entries(topicMeta).map(([key, meta]) => {
    const topicNotes = allNotes.filter(n => n.data.topic === key);

    return {
      slug: key,
      ...meta,
      noteCount: topicNotes.length,
      maturityBreakdown: {
        seedling: topicNotes.filter(n => n.data.maturity === 'seedling').length,
        budding: topicNotes.filter(n => n.data.maturity === 'budding').length,
        evergreen: topicNotes.filter(n => n.data.maturity === 'evergreen').length,
      },
      notes: topicNotes.map(n => ({
        slug: n.slug,
        title: n.data.title,
        maturity: n.data.maturity,
        href: `/garden/${n.slug}`,
      })),
    };
  });

  return new Response(JSON.stringify(topics), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
