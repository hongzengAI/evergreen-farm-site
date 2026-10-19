// Static build for GitHub Pages. SITE_URL and BASE_PATH come from actions/configure-pages in CI,
// so the same build serves https://<user>.github.io/<repo>/ now and the custom domain later.
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

const preview = process.env.PUBLIC_PREVIEW !== 'false';

export default defineConfig({
  site: process.env.SITE_URL || 'http://localhost:4321',
  base: process.env.BASE_PATH || '/',
  trailingSlash: 'always',
  compressHTML: true,
  integrations: preview ? [] : [sitemap({ filter: (page) => !page.includes('/inquire/thanks/') })],
});
