// Read-only view of business.json, which is exported from the evergreenAI business SSOT by
// scripts/export_site_data.rb. Never edit business.json by hand; change the SSOT and re-export.
import business from './business.json';

export { business };

export type Fact = { en: string | null; confirmed: boolean; ask_zh?: string };

const facts = business.facts as Record<string, Fact>;

/** Look up a fact; an unknown id fails the build so copy can't cite a fact that doesn't exist. */
export function fact(id: string): Fact {
  const f = facts[id];
  if (!f) throw new Error(`Unknown fact id "${id}" — add it to facts.yaml in evergreenAI and re-export`);
  return f;
}

export const confirmed = (...ids: string[]) => ids.every((id) => fact(id).confirmed);

export const usd = (n: number) => `$${n.toLocaleString('en-US')}`;

export const maxGuests = business.max_guests;
export const [weddingMin, weddingMax] = business.price_range_usd.wedding;
export const packages = business.packages;

export const place = {
  short: `${business.business.location.city}, Virginia`,
  confirmed: business.business.location.confirmed,
};

export const howHeardLabels: Record<string, string> = {
  google: 'Google search or Maps',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  youtube: 'YouTube',
  vrbo: 'Vrbo',
  friend_or_vendor: 'A friend or a vendor',
  other: 'Somewhere else',
};

type Band = [number, number | null];

/** Budget bands from spec.intake; the value format is "<min>-<max|up>". */
export function bandOptions(stream: 'wedding' | 'small_event') {
  const bands = business.intake.budget_bands_usd[stream] as Band[];
  return bands.map(([min, max]) => ({
    value: `${min}-${max ?? 'up'}`,
    label: min === 0 ? `Under ${usd(max!)}` : max === null ? `${usd(min)} or more` : `${usd(min)}–${usd(max)}`,
  }));
}
