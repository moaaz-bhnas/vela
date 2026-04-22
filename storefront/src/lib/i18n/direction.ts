/**
 * BCP-47 route locales (e.g. ar-EG, en-FR) — derive text direction from language subtag.
 */
const RTL_LANGUAGE_SUBTAGS = new Set([
  "ar",
  "he",
  "fa",
  "ur",
  "ckb", // Sorani
])

/**
 * Returns true if the primary language in the locale should use right-to-left layout.
 */
export function isRtlLocale(locale: string): boolean {
  const subtag = locale.split("-")[0]?.toLowerCase() ?? "en"
  return RTL_LANGUAGE_SUBTAGS.has(subtag)
}

export function getDirectionForLocale(
  locale: string
): "rtl" | "ltr" {
  return isRtlLocale(locale) ? "rtl" : "ltr"
}
