import { model } from "@medusajs/framework/utils";
import { BrandingConfig } from "./branding-config";

export const BrandingCarouselSlide = model.define("branding_carousel_slide", {
  id: model.id().primaryKey(),
  image_url: model.text().nullable(),
  title: model.text().translatable().nullable(),
  description: model.text().translatable().nullable(),
  link_url: model.text().nullable(),
  link_text: model.text().translatable().nullable(),
  sort_order: model.number().nullable(),
  branding_config: model.belongsTo(() => BrandingConfig, {
    mappedBy: "slides",
  }),
});
