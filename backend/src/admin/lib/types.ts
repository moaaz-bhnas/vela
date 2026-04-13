// Branding configuration types

export type Logo = {
  url: string;
  alt: string;
  width: number;
  height: number;
};

export type Logos = {
  main?: Logo;
  footer?: Logo;
  favicon?: Logo;
};

export type SocialLink = {
  platform: string;
  url: string;
};

export type ContactInfo = {
  email?: string;
  phone?: string;
  address?: string;
};

export type CarouselSlide = {
  id?: string;
  image_url?: string;
  title?: string;
  description?: string;
  link_url?: string;
  link_text?: string;
  sort_order?: number;
};

export type BrandingConfig = {
  id: string;
  site_title?: string | null;
  copyright_text?: string | null;
  logos?: Logos | null;
  social_links?: SocialLink[] | null;
  contact_info?: ContactInfo | null;
  slides?: CarouselSlide[] | null;
  seo_site_tagline?: string | null;
  seo_meta_description_template?: string | null;
  seo_default_og_image_url?: string | null;
};

export type BrandingResponse = {
  branding: BrandingConfig;
};
