import type { CollectionEntry } from 'astro:content';
import { getCollection } from 'astro:content';

export type ItineraryEntry = CollectionEntry<'itinerary'>;
export type CountryEntry = CollectionEntry<'country'>;


export function parseLangFromId(id: string) {
  const name = id.split('/').pop()!;
  const parts = name.split('_');
  return parts[1] ?? 'en';
}

export function stripLangFromId(id: string) {
	// catamarca_es.mdx → catamarca
	return id.replace(/_[a-z]{2}\.(md|mdx)$/, '');
}

export async function getItinerariesByCountry(
	country: string,
	lang: string
): Promise<ItineraryEntry[]> {
	const entries = await getCollection('itinerary');

	return entries
		.filter((e) =>
			e.data.country === country &&
			parseLangFromId(e.id) === lang &&
      !e.data.hide
		)
		.sort((a, b) => (a.data.order ?? 999) - (b.data.order ?? 999));
}

export async function getItinerariesByLang(
	lang: string
): Promise<ItineraryEntry[]> {
	const entries = await getCollection('itinerary');

	return entries
		.filter((e) => parseLangFromId(e.id) === lang)
		.sort((a, b) => (a.data.order ?? 999) - (b.data.order ?? 999));
}

export async function getItinerary(
	slug: string,
	lang: string
): Promise<ItineraryEntry | undefined> {
	const entries = await getCollection('itinerary');

	return entries.find(
		(e) =>
			e.data.name === slug &&
			parseLangFromId(e.id) === lang
	);
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

export async function getItinerariesGroupedByCountry(
  lang: string
): Promise<Record<string, ItineraryEntry[]>> {
  const itineraries = await getItinerariesByLang(lang);

  const result: Record<string, ItineraryEntry[]> = {};
  const countryTitleCache = new Map<string, string>();

  for (const it of itineraries) {
    const countrySlug = it.data.country;

    // resolve country title once per country
    let countryTitle = countryTitleCache.get(countrySlug);
    if (!countryTitle) {
      const country = await getCountryByName(countrySlug, lang);
      countryTitle = country.data.title;
      countryTitleCache.set(countrySlug, countryTitle);
    }

    result[countryTitle] ??= [];
    result[countryTitle].push(it);
  }

  return result;
}

export interface ItineraryWithCountry {
  itinerary: ItineraryEntry;
  country: CountryEntry;
}

export async function getItinerariesWithCountry(
  lang: string
): Promise<ItineraryWithCountry[]> {
  const itineraries = await getCollection("itinerary");
  const countries = await getCollection("country");

  // Index countries by slug + lang for fast lookup
  const countryIndex = new Map<string, CountryEntry>();

  for (const country of countries) {
    if (parseLangFromId(country.id) === lang) {
      countryIndex.set(country.data.name, country);
    }
  }

  const result: ItineraryWithCountry[] = [];

  for (const itinerary of itineraries) {
    if (parseLangFromId(itinerary.id) !== lang || itinerary.data.hide) continue;

    const countrySlug = itinerary.data.country;
    if (!countrySlug) continue;

    const country = countryIndex.get(countrySlug);
    if (!country) continue;

    result.push({ itinerary, country });
  }

  result.sort(
    (a, b) =>
      (a.itinerary.data.order ?? 9999) -
      (b.itinerary.data.order ?? 9999)
  );

  return result;
}
