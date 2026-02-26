import type { CollectionEntry } from "astro:content";
import { getCollection } from "astro:content";

export type ItineraryEntry = CollectionEntry<"itinerary">;
export type CountryEntry = CollectionEntry<"country">;

export interface ItineraryWithCountry {
  itinerary: ItineraryEntry;
  country: CountryEntry;
}

export function parseLangFromId(id: string) {
  const name = id.split("/").pop()!;
  const parts = name.split("_");
  return parts[1] ?? "en";
}

export function stripLangFromId(id: string) {
  // catamarca_es.mdx → catamarca
  return id.replace(/_[a-z]{2}\.(md|mdx)$/, "");
}

function localeForLang(lang: string) {
  if (lang === "es") return "es";
  if (lang === "ru") return "ru";
  return "en";
}

/**
 * Shared comparator for itineraries.
 * Rules:
 * 1) pinned=true first (A–Z inside pinned)
 * 2) then normal: score desc (missing => 0), tie A–Z
 * 3) planned=true last (A–Z inside planned)
 */
export function compareItineraries(lang: string) {
  const locale = localeForLang(lang);

  const titleAZ = (a: ItineraryEntry, b: ItineraryEntry) =>
    (a.data.title ?? "").localeCompare(b.data.title ?? "", locale, { sensitivity: "base" });

  const groupRank = (e: ItineraryEntry) => {
    if (e.data.pinned === true) return 0;   // top
    if (e.data.planned === true) return 2;  // bottom
    return 1;                               // normal
  };

  return (a: ItineraryEntry, b: ItineraryEntry) => {
    const ga = groupRank(a);
    const gb = groupRank(b);
    if (ga !== gb) return ga - gb;

    // pinned -> A–Z
    if (ga === 0) return titleAZ(a, b);

    // planned -> A–Z
    if (ga === 2) return titleAZ(a, b);

    // normal -> score desc, tie A–Z
    const sa = typeof a.data.score === "number" ? a.data.score : 0;
    const sb = typeof b.data.score === "number" ? b.data.score : 0;
    const sd = sb - sa;
    if (sd !== 0) return sd;

    return titleAZ(a, b);
  };
}

export function sortItineraries(itineraries: ItineraryEntry[], lang: string): ItineraryEntry[] {
  return [...itineraries].sort(compareItineraries(lang));
}

export async function getItinerariesByCountry(country: string, lang: string): Promise<ItineraryEntry[]> {
  const entries = await getCollection("itinerary");

  const filtered = entries.filter(
    (e) =>
      e.data.country === country &&
      parseLangFromId(e.id) === lang &&
      !e.data.hide
  );

  return sortItineraries(filtered, lang);
}

/**
 * For the global itineraries list page:
 * returns [{ itinerary, country }] in the given lang, sorted with the same rules.
 */
export async function getItinerariesWithCountry(lang: string): Promise<ItineraryWithCountry[]> {
  const itineraries = await getCollection("itinerary");
  const countries = await getCollection("country");

  // countryIndex: country "name" -> entry (same lang)
  const countryIndex = new Map<string, CountryEntry>();
  for (const c of countries) {
    if (c.data.hide) continue;
    if (parseLangFromId(c.id) !== lang) continue;
    countryIndex.set(c.data.name, c);
  }

  const pairs: ItineraryWithCountry[] = [];
  for (const it of itineraries) {
    if (it.data.hide) continue;
    if (parseLangFromId(it.id) !== lang) continue;

    const countryKey = it.data.country;
    if (!countryKey) continue;

    const country = countryIndex.get(countryKey);
    if (!country) continue;

    pairs.push({ itinerary: it, country });
  }

  // sort pairs by itinerary using the same comparator
  const cmp = compareItineraries(lang);
  pairs.sort((a, b) => cmp(a.itinerary, b.itinerary));

  return pairs;
}

export async function getCountryByName(
  slug: string,
  lang: string,
  fallbackLang = 'en'
): Promise<CountryEntry> {
  const entries = await getCollection('country');

  const exact = entries.find(
    e => e.data.name === slug && parseLangFromId(e.id) === lang
  );

  if (exact) return exact;

  const fallback = entries.find(
    e => e.data.name === slug && parseLangFromId(e.id) === fallbackLang
  );

  if (fallback) return fallback;

  throw new Error(
    `Country not found: name="${slug}", lang="${lang}", fallback="${fallbackLang}"`
  );
}
