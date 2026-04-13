import { getRequestConfig } from "next-intl/server"
import { defaultLocale } from "./routing"
import { getMessageCatalog } from "./messagesCatalog"

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = (await requestLocale) ?? defaultLocale
  const catalog = getMessageCatalog(locale)
  const messages = (await import(`../messages/${catalog}.json`)).default
  return { locale, messages }
})
