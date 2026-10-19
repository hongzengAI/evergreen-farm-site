// robots.txt allows crawling even in preview: noindex (in each page's <head>) is what keeps a
// preview out of search, and crawlers can only see it if they're allowed to fetch the page.
import type { APIRoute } from 'astro';

const preview = import.meta.env.PUBLIC_PREVIEW !== 'false';

export const GET: APIRoute = ({ site }) => {
  const sitemap = new URL(`${import.meta.env.BASE_URL.replace(/\/$/, '')}/sitemap-index.xml`, site).href;
  const body = `User-agent: *\nAllow: /\n${preview ? '' : `Sitemap: ${sitemap}\n`}`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
