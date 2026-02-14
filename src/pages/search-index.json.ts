import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async () => {
  const posts = await getCollection('blog', ({ data }) => !data.draft);

  const index = posts.map(post => ({
    title: post.data.title,
    description: post.data.description,
    tags: post.data.tags || [],
    pubDate: post.data.pubDate.toISOString(),
    slug: post.data.customSlug || post.id.replace(/\.(md|mdx)$/, ''),
  }));

  return new Response(JSON.stringify(index), {
    headers: { 'Content-Type': 'application/json' },
  });
};
