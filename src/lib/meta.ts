export function listToMetaString(value: unknown, opts: { max?: number } = {}) {
  const max = opts.max ?? 6;
  const list = Array.isArray(value) ? value : (value ? [value] : []);
  return list
    .map((v) => String(v ?? "").trim())
    .filter(Boolean)
    .slice(0, max)
    .join(", ");
}

export function buildMetaTail(
  badges: unknown,
  region?: unknown,
  opts: { maxBadges?: number } = {}
) {
  const badgeStr = listToMetaString(badges, { max: opts.maxBadges ?? 6 });
  const regionStr = listToMetaString(region, { max: 1 }); // region is usually single

  if (badgeStr && regionStr) return `${badgeStr} — ${regionStr}`;
  return badgeStr || regionStr || "";
}

export function buildMetaDescription(
  tagline: unknown,
  badges: unknown,
  opts: { maxBadges?: number; region?: unknown } = {}
) {
  const t = String(tagline ?? "").trim();
  const tail = buildMetaTail(badges, opts.region, { maxBadges: opts.maxBadges ?? 6 });

  if (!t) return tail;
  if (!tail) return t;

  const sep = /[.!?…]$/.test(t) ? " " : ", ";
  return `${t}${sep}${tail}`;
}