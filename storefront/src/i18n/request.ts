import { getRequestConfig } from "next-intl/server"
import { defaultLocale } from "./routing"

async function loadMessages(locale: string) {
  const language = locale.split("-")[0]?.toLowerCase() || "en"

  try {
    return (await import(`../messages/${language}.json`)).default
  } catch {
    return (await import("../messages/en.json")).default
  }
}

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = (await requestLocale) ?? defaultLocale
  const messages = await loadMessages(locale)
  return { locale, messages }
})
