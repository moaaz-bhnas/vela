import { model } from "@medusajs/framework/utils";
import { BrandingCarouselSlide } from "./branding-carousel-slide";

export const BrandingConfig = model.define("branding_config", {
  id: model.id().primaryKey(),

  site_title: model.text().translatable().nullable(),
  copyright_text: model.text().translatable().nullable(),

  // Logos stored as JSON: { main: { url, alt, width, height }, footer: {...}, favicon: {...} }
  logos: model.json().nullable(),

  // Social links stored as JSON array: [{ platform: string, url: string }]
  social_links: model.json().nullable(),

  // Contact info stored as JSON: { email: string, phone: string, address: string }
  contact_info: model.json().nullable(),

  // SEO defaults — flat columns so they can be individually translatable
  seo_site_tagline: model.text().translatable().nullable(),
  seo_meta_description_template: model.text().translatable().nullable(),
  seo_default_og_image_url: model.text().nullable(),

  // Carousel slides as a proper relation so each slide's text is translatable
  slides: model.hasMany(() => BrandingCarouselSlide, {
    mappedBy: "branding_config",
  }),
});
