import { defineRouting } from "next-intl/routing"

export const routing = defineRouting({
  locales: ["en-DK", "ar-EG", "en-US", "fr-FR"],
  defaultLocale: "en-DK",
})

export type Locale = (typeof routing.locales)[number]
export const { locales, defaultLocale } = routing

/**
 * Maps Medusa ISO-2 country codes to their default BCP 47 locale.
 * Keep this in sync with the regions configured in Medusa Admin.
 */
export const countryLocaleMap: Record<string, string> = {
  dk: "en-DK",
  eg: "ar-EG",
  us: "en-US",
  fr: "fr-FR",
}
