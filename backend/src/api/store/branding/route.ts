import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { DEFAULT_BRANDING_CONFIG } from "../../../modules/branding/service";

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const query = req.scope.resolve("query");

  const { data: configs } = await query.graph(
    {
      entity: "branding_config",
      fields: [
        "id",
        "site_title",
        "copyright_text",
        "logos",
        "social_links",
        "contact_info",
        "seo_site_tagline",
        "seo_meta_description_template",
        "seo_default_og_image_url",
        "slides.id",
        "slides.image_url",
        "slides.title",
        "slides.description",
        "slides.link_url",
        "slides.link_text",
        "slides.sort_order",
      ],
    },
    { locale: req.locale }
  );

  const config = configs[0] ?? DEFAULT_BRANDING_CONFIG;
  res.json({ branding: config });
};
