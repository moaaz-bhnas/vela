export type MessageCatalog = "en" | "fr"

/**
 * Maps route locale (BCP 47, e.g. en-DK, fr-FR) to static message files (en.json / fr.json).
 */
export function getMessageCatalog(locale: string): MessageCatalog {
  if (locale.toLowerCase().startsWith("fr")) {
    return "fr"
  }
  return "en"
}
