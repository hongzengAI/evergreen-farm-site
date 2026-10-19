// Post-build checks on dist/ (runs as part of `npm run build`).
// Always: page basics and internal links. Production (PUBLIC_PREVIEW=false): also fail on any
// preview marker (data-pending = unconfirmed fact, missing required photo, sample data) or noindex.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const dist = new URL('../dist/', import.meta.url).pathname;
const preview = process.env.PUBLIC_PREVIEW !== 'false';
const base = (process.env.BASE_PATH || '/').replace(/\/?$/, '/');
const errors = [];
const pending = new Map();

const walk = (d) => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));
const pages = walk(dist).filter((f) => f.endsWith('.html'));

for (const file of pages) {
  const rel = '/' + relative(dist, file);
  const html = readFileSync(file, 'utf8');
  if (!html.includes('<html lang="en"')) errors.push(`${rel}: missing <html lang>`);
  if (!/<title>[^<]{5,}<\/title>/.test(html)) errors.push(`${rel}: missing <title>`);
  if (!/<meta name="description" content="[^"]{30,}"/.test(html)) errors.push(`${rel}: missing or short meta description`);
  const h1 = (html.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) errors.push(`${rel}: ${h1} <h1> elements, expected 1`);
  if (!preview && html.includes('name="robots" content="noindex') && !/inquire\/thanks|404/.test(rel)) errors.push(`${rel}: noindex in a production build`);

  for (const m of html.matchAll(/data-pending="([^"]+)"/g)) {
    for (const id of m[1].split(' ')) pending.set(id, (pending.get(id) || new Set()).add(rel));
  }
  for (const m of html.matchAll(/(?:href|src)="([^"#?]+)[^"]*"/g)) {
    const u = m[1];
    if (u.startsWith('//') || !u.startsWith(base)) continue;
    const target = join(dist, decodeURIComponent(u.slice(base.length)));
    const ok = existsSync(target) && (statSync(target).isFile() || existsSync(join(target, 'index.html')));
    if (!ok) errors.push(`${rel}: broken internal link ${u}`);
  }
}

const availability = JSON.parse(readFileSync(new URL('../src/data/availability.json', import.meta.url), 'utf8'));
if (!Array.isArray(availability.booked) || availability.booked.some((d) => !/^\d{4}-\d{2}-\d{2}$/.test(d))) {
  errors.push('src/data/availability.json: booked must be a list of YYYY-MM-DD dates');
}

if (pending.size) {
  const list = [...pending].sort().map(([id, where]) => `  - ${id} (${where.size} page${where.size > 1 ? 's' : ''})`).join('\n');
  if (preview) console.log(`check-site: preview build; ${pending.size} items to confirm before launch:\n${list}`);
  else errors.push(`production build still has ${pending.size} unconfirmed items:\n${list}`);
}

if (errors.length) {
  console.error(`check-site: ${errors.length} problem(s)\n${errors.join('\n')}`);
  process.exit(1);
}
console.log(`check-site: ${pages.length} pages OK (${preview ? 'preview' : 'production'}, base ${base})`);
