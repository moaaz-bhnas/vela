import { z } from "@medusajs/framework/zod";

// Logo schema
const LogoSchema = z.object({
  url: z.string().url().optional(),
  alt: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
});

// Social link schema
const SocialLinkSchema = z.object({
  platform: z.string(),
  url: z.string().url(),
});

// Contact info schema
const ContactInfoSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

// Carousel slide schema — id is present for existing slides (preserves translation records)
const CarouselSlideSchema = z.object({
  id: z.string().optional(),
  image_url: z.string().url().optional().or(z.literal("")),
  title: z.string().optional(),
  description: z.string().optional(),
  link_url: z.string().url().optional().or(z.literal("")),
  link_text: z.string().optional(),
  sort_order: z.coerce.number().optional(),
});

// Logos object schema
const LogosSchema = z.object({
  main: LogoSchema.optional(),
  footer: LogoSchema.optional(),
  favicon: LogoSchema.optional(),
});

export const PostAdminUpdateBranding = z.object({
  site_title: z.string().optional(),
  copyright_text: z.string().optional(),
  logos: LogosSchema.optional().nullable(),
  social_links: z.array(SocialLinkSchema).optional(),
  contact_info: ContactInfoSchema.optional().nullable(),
  // Carousel slides as a proper relation
  slides: z.array(CarouselSlideSchema).optional(),
  // SEO defaults as flat columns
  seo_site_tagline: z.string().optional().nullable(),
  seo_meta_description_template: z.string().optional().nullable(),
  seo_default_og_image_url: z.string().url().optional().or(z.literal("")).nullable(),
});

export type PostAdminUpdateBrandingType = z.infer<
  typeof PostAdminUpdateBranding
>;
