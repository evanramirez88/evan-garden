import { defineCollection, z } from 'astro:content';

// Garden notes collection - the core of the digital garden
const garden = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    maturity: z.enum(['seedling', 'budding', 'evergreen']).default('seedling'),
    topic: z.enum([
      'systems',      // Systems thinking
      'hospitality',  // Restaurant & hospitality
      'horticulture', // Growing things
      'ai',           // AI & technology
      'play',         // NFL analysis, games, fun
      'meta',         // About the garden itself
    ]),
    created: z.date(),
    updated: z.date().optional(),
    tags: z.array(z.string()).default([]),
    // For generating the knowledge graph
    relatedNotes: z.array(z.string()).default([]),
    // Featured notes appear on the homepage
    featured: z.boolean().default(false),
    // Draft notes are not published
    draft: z.boolean().default(false),
  }),
});

// Projects collection - portfolio pieces
const projects = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    thumbnail: z.string().optional(),
    status: z.enum(['active', 'completed', 'archived', 'concept']).default('active'),
    url: z.string().url().optional(),
    github: z.string().url().optional(),
    topics: z.array(z.string()).default([]),
    created: z.date(),
    updated: z.date().optional(),
    featured: z.boolean().default(false),
  }),
});

export const collections = {
  garden,
  projects,
};
