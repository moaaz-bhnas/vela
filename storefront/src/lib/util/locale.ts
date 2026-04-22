import { parseRouteLocale } from "@lib/i18n/locale-policy"

/**
 * Extracts the ISO-2 country code from a BCP 47 locale string.
 * e.g. "ar-EG" → "eg", "en-DK" → "dk"
 *
 * Safe to import from Client Components — no server-only APIs.
 */
export function getCountryCodeFromLocale(locale: string): string {
  const parsed = parseRouteLocale(locale)
  if (parsed) {
    return parsed.region
  }
  return locale.split("-")[1]?.toLowerCase() ?? locale.toLowerCase()
}
