// Build-time settings. Every value is public (it ends up in the HTML), so they live in
// GitHub repository variables, not secrets. PREVIEW is on unless explicitly turned off.
const env = import.meta.env;

export const PREVIEW = env.PUBLIC_PREVIEW !== 'false';
export const INQUIRY_ENDPOINT = env.PUBLIC_INQUIRY_ENDPOINT || '';
export const TOUR_URL = env.PUBLIC_TOUR_URL || '';
export const GA4_ID = PREVIEW ? '' : env.PUBLIC_GA4_ID || '';

/** Prefix an absolute site path ("/weddings/") with the deploy base. */
export function url(path: string): string {
  const base = env.BASE_URL.replace(/\/$/, '');
  return `${base}${path}`;
}

export const nav = [
  { href: '/weddings/', label: 'Weddings' },
  { href: '/events/', label: 'Events' },
  { href: '/the-farm/', label: 'The Farm' },
  { href: '/gallery/', label: 'Gallery' },
  { href: '/faq/', label: 'FAQ' },
  { href: '/availability/', label: 'Availability' },
];

/** "Book a tour" goes to the Google Calendar booking page once it exists, else to the form. */
export const tourHref = TOUR_URL || url('/inquire/');
