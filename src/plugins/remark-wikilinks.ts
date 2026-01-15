/**
 * Remark plugin to transform [[wikilinks]] into proper anchor tags
 *
 * Supports:
 * - [[slug]] - Links to /garden/slug, displays the slug (prettified)
 * - [[slug|Custom Text]] - Links with custom display text
 * - [[slug#heading]] - Links with anchor
 * - [[slug#heading|Custom Text]] - Links with anchor and custom text
 */

import { visit } from 'unist-util-visit';
import type { Root, Text, Link, Parent } from 'mdast';
import type { Plugin } from 'unified';

interface WikilinksOptions {
  /** Base path for garden links (default: /garden) */
  basePath?: string;
}

// Regex to match [[slug]] or [[slug|text]] or [[slug#anchor]] or [[slug#anchor|text]]
const WIKILINK_REGEX = /\[\[([^\]|#]+)(?:#([^\]|]+))?(?:\|([^\]]+))?\]\]/g;

/**
 * Convert a string to a URL-friendly slug
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Convert a slug to a human-readable title
 * e.g., "leverage-points-restaurant" -> "Leverage Points Restaurant"
 */
function prettifySlug(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Parse a text node and extract wikilinks
 */
function parseTextWithWikilinks(
  text: string,
  basePath: string
): (Text | Link)[] {
  const nodes: (Text | Link)[] = [];
  let lastIndex = 0;

  // Reset regex state
  WIKILINK_REGEX.lastIndex = 0;

  let match: RegExpExecArray | null;
  while ((match = WIKILINK_REGEX.exec(text)) !== null) {
    const [fullMatch, target, anchor, customText] = match;
    const matchIndex = match.index;

    // Add text before the match
    if (matchIndex > lastIndex) {
      nodes.push({
        type: 'text',
        value: text.slice(lastIndex, matchIndex),
      });
    }

    // Build the href
    let href = `${basePath}/${target}`;
    if (anchor) {
      href += `#${slugify(anchor)}`;
    }

    // Display text: use custom text if provided, otherwise prettify the slug
    const displayText = customText || prettifySlug(target);

    nodes.push({
      type: 'link',
      url: href,
      data: {
        hProperties: {
          className: ['wikilink'],
          'data-note': target,
        },
      },
      children: [{ type: 'text', value: displayText }],
    } as Link);

    lastIndex = matchIndex + fullMatch.length;
  }

  // Add remaining text after last match
  if (lastIndex < text.length) {
    nodes.push({
      type: 'text',
      value: text.slice(lastIndex),
    });
  }

  return nodes;
}

/**
 * Remark plugin for processing wikilinks
 */
export const remarkWikilinks: Plugin<[WikilinksOptions?], Root> = (options = {}) => {
  const { basePath = '/garden' } = options;

  return (tree: Root) => {
    // We need to track nodes to replace since we can't modify during visit
    const replacements: Array<{
      parent: Parent;
      index: number;
      nodes: (Text | Link)[];
    }> = [];

    visit(tree, 'text', (node: Text, index: number | undefined, parent: Parent | undefined) => {
      if (!parent || index === undefined) return;

      // Skip if no wikilinks in this text node
      if (!node.value.includes('[[')) return;

      const newNodes = parseTextWithWikilinks(node.value, basePath);

      // Only replace if we actually found wikilinks
      if (newNodes.length > 1 || (newNodes.length === 1 && newNodes[0].type !== 'text')) {
        replacements.push({ parent, index, nodes: newNodes });
      }
    });

    // Apply replacements in reverse order to maintain correct indices
    for (let i = replacements.length - 1; i >= 0; i--) {
      const { parent, index, nodes } = replacements[i];
      parent.children.splice(index, 1, ...nodes);
    }
  };
};

export default remarkWikilinks;
