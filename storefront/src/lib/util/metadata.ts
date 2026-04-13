import { getBrandingConfig } from "@lib/data/branding"
import { getLocale } from "next-intl/server"
import { cache } from "react"

const DEFAULT_SITE_TITLE = "Store"
const DEFAULT_SITE_DESCRIPTION = "Discover products curated for you."

export const getBrandingSeo = cache(async function () {
  const locale = await getLocale()
  const branding = await getBrandingConfig(locale)

  const siteTitle = branding?.site_title?.trim() || DEFAULT_SITE_TITLE
  const siteTagline = branding?.seo_site_tagline?.trim()
  const metaDescriptionTemplate = branding?.seo_meta_description_template?.trim()
  const defaultOgImage = branding?.seo_default_og_image_url?.trim()
  const faviconUrl = branding?.logos?.favicon?.url?.trim()

  return {
    siteTitle,
    siteTagline,
    metaDescriptionTemplate,
    defaultOgImage,
    faviconUrl,
    defaultDescription:
      metaDescriptionTemplate || siteTagline || DEFAULT_SITE_DESCRIPTION,
  }
})
