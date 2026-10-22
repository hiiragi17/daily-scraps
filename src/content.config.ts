import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
  // `_` で始まるファイル(_template.md)は対象外
  loader: glob({
    pattern: '**/[^_]*.{md,mdx}',
    base: './src/content/blog',
    // URL を変えないよう、ID は従来どおり拡張子なしのファイルパスにする
    generateId: ({ entry }) => entry.replace(/\.(md|mdx)$/, ''),
  }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    thumbnail: z.string().optional(),
    tags: z.array(z.string()).optional(),
    draft: z.boolean().optional().default(false),
    customSlug: z.string().optional(),
  }),
});

export const collections = { blog };
