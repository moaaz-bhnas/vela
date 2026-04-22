/**
 * Pure locale policy for BCP 47 route segments (e.g. fr-FR, en-DE).
 * Used by middleware, route generation, and storefront UI. Edge-safe (no Node-only APIs).
 */

export type StoreLocaleCode = { code: string }

export type RegionShape = {
  countries?: { iso_2?: string | null }[] | null
}

function parseLocaleCode(localeCode: string): {
  language: string
  region: string
} | null {
  try {
    const loc = new Intl.Locale(localeCode)
    if (!loc.region) {
      return null
    }
    return {
      language: loc.language.toLowerCase(),
      region: loc.region.toLowerCase(),
    }
  } catch {
    return null
  }
}

/**
 * Parse a route locale segment using Intl (handles zh-Hans-CN, etc.).
 */
export function parseRouteLocale(routeLocale: string): {
  language: string
  region: string
} | null {
  return parseLocaleCode(routeLocale)
}

export function buildLocaleTag(language: string, countryIso2: string): string {
  return `${language.toLowerCase()}-${countryIso2.toUpperCase()}`
}

export function collectCountriesFromRegions(regions: RegionShape[]): string[] {
  const set = new Set<string>()
  for (const r of regions) {
    r.countries?.forEach(function collect(c) {
      if (c.iso_2) {
        set.add(c.iso_2.toLowerCase())
      }
    })
  }
  return Array.from(set)
}

function parseStoreLocaleCode(code: string): {
  language: string
  region: string
} | null {
  return parseLocaleCode(code)
}

/**
 * Languages Medusa lists for this country (region subtag matches ISO-2).
 */
export function nativeLanguageSubtagsForCountry(
  countryIso2: string,
  storeLocales: StoreLocaleCode[]
): Set<string> {
  const cc = countryIso2.toLowerCase()
  const out = new Set<string>()
  for (const sl of storeLocales) {
    const parsed = parseStoreLocaleCode(sl.code)
    if (parsed && parsed.region === cc) {
      out.add(parsed.language)
    }
  }
  return out
}

/**
 * Allowed language subtags for URL + Medusa: store languages for the country plus global English,
 * except when the only store language is English (then English only).
 * If Medusa lists no locale for the country, only English is allowed (synthetic en-CC).
 */
export function allowedLanguageSubtagsForCountry(
  countryIso2: string,
  storeLocales: StoreLocaleCode[]
): string[] {
  const natives = nativeLanguageSubtagsForCountry(countryIso2, storeLocales)
  if (natives.size === 0) {
    return ["en"]
  }
  if (natives.size === 1 && natives.has("en")) {
    return ["en"]
  }
  const combined = new Set(natives)
  combined.add("en")
  const subtags = Array.from(combined)
  const defaultLang = parseStoreLocaleCode(
    defaultLocaleTagForCountry(countryIso2, storeLocales)
  )?.language
  if (defaultLang && subtags.includes(defaultLang)) {
    const rest = subtags
      .filter(function notDefault(s) {
        return s !== defaultLang
      })
      .sort(function sortRest(a, b) {
        return a.localeCompare(b)
      })
    return [defaultLang, ...rest]
  }
  return subtags.sort(function sortTags(a, b) {
    return a.localeCompare(b)
  })
}

export function computeAllowedRouteLocales(
  regions: RegionShape[],
  storeLocales: StoreLocaleCode[]
): string[] {
  const countries = collectCountriesFromRegions(regions)
  const tags = new Set<string>()
  for (const cc of countries) {
    const langs = allowedLanguageSubtagsForCountry(cc, storeLocales)
    for (const lang of langs) {
      tags.add(buildLocaleTag(lang, cc))
    }
  }
  return Array.from(tags).sort(function sortLocales(a, b) {
    return a.localeCompare(b)
  })
}

/**
 * Default locale when entering a country: first non-English store locale for that country, else en-CC.
 */
export function defaultLocaleTagForCountry(
  countryIso2: string,
  storeLocales: StoreLocaleCode[]
): string {
  const cc = countryIso2.toLowerCase()
  for (const sl of storeLocales) {
    const parsed = parseStoreLocaleCode(sl.code)
    if (parsed && parsed.region === cc && parsed.language !== "en") {
      return buildLocaleTag(parsed.language, cc)
    }
  }
  return buildLocaleTag("en", cc)
}

export function isLocaleRouteAllowed(
  routeLocale: string,
  regions: RegionShape[],
  storeLocales: StoreLocaleCode[]
): boolean {
  const parsed = parseRouteLocale(routeLocale)
  if (!parsed) {
    return false
  }
  const countries = new Set(collectCountriesFromRegions(regions))
  if (!countries.has(parsed.region)) {
    return false
  }
  const allowed = new Set(
    allowedLanguageSubtagsForCountry(parsed.region, storeLocales)
  )
  return allowed.has(parsed.language)
}

export function canonicalizeRouteLocale(routeLocale: string): string | null {
  const parsed = parseRouteLocale(routeLocale)
  if (!parsed) {
    return null
  }
  return buildLocaleTag(parsed.language, parsed.region)
}
