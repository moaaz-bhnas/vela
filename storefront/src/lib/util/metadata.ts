import { getBrandingConfig } from "@lib/data/branding"
import { cache } from "react"

const DEFAULT_SITE_TITLE = "Store"
const DEFAULT_SITE_DESCRIPTION = "Discover products curated for you."

export const getBrandingSeo = cache(async function () {
  const branding = await getBrandingConfig()

  const siteTitle = branding?.site_title?.trim() || DEFAULT_SITE_TITLE
  const siteTagline = branding?.seo_defaults?.site_tagline?.trim()
  const metaDescriptionTemplate =
    branding?.seo_defaults?.meta_description_template?.trim()
  const defaultOgImage = branding?.seo_defaults?.default_og_image_url?.trim()
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
