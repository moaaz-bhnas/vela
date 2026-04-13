import { MedusaService } from "@medusajs/framework/utils";
import { BrandingConfig } from "./models/branding-config";
import { BrandingCarouselSlide } from "./models/branding-carousel-slide";
import type { PostAdminUpdateBrandingType } from "../../api/admin/branding/validators";

const DEFAULT_BRANDING_CONFIG = {
  site_title: "",
  copyright_text: "",
  logos: null,
  social_links: null,
  contact_info: null,
  seo_site_tagline: null,
  seo_meta_description_template: null,
  seo_default_og_image_url: null,
  slides: [],
};

class BrandingModuleService extends MedusaService({
  BrandingConfig,
  BrandingCarouselSlide,
}) {
  /**
   * Get or create the singleton branding config (eager-loads slides relation)
   */
  async getOrCreateConfig() {
    const configs = await this.listBrandingConfigs(
      {},
      { relations: ["slides"] }
    );

    if (configs.length === 0) {
      const { slides: _slides, ...configFields } = DEFAULT_BRANDING_CONFIG;
      const config = await this.createBrandingConfigs(configFields);
      return { ...config, slides: [] };
    }

    return configs[0];
  }

  /**
   * Get the singleton branding config (eager-loads slides relation)
   */
  async getConfig() {
    const configs = await this.listBrandingConfigs(
      {},
      { relations: ["slides"] }
    );
    return configs.length > 0 ? configs[0] : null;
  }

  /**
   * Get branding config or return default if none exists.
   * Used by storefront endpoints that should always return a config.
   */
  async getConfigOrDefault() {
    const config = await this.getConfig();
    return config ?? DEFAULT_BRANDING_CONFIG;
  }

  /**
   * Update the singleton branding config.
   * Handles slide upsert using a preserve-IDs strategy so existing
   * Translation Module records survive re-saves.
   */
  async updateConfig(data: PostAdminUpdateBrandingType) {
    const config = await this.getOrCreateConfig();

    const { slides, ...configData } = data;

    await this.updateBrandingConfigs([{ id: config.id, ...configData }]);

    if (slides !== undefined) {
      const existingSlides = await this.listBrandingCarouselSlides({
        branding_config_id: config.id,
      });

      const existingIdSet = new Set(existingSlides.map((s) => s.id));
      const incomingIdSet = new Set(
        slides.filter((s) => s.id).map((s) => s.id!)
      );

      // Delete slides that are no longer in the submitted list
      const idsToDelete = existingSlides
        .filter((s) => !incomingIdSet.has(s.id))
        .map((s) => s.id);

      if (idsToDelete.length > 0) {
        await this.deleteBrandingCarouselSlides(idsToDelete);
      }

      // Update existing slides (those whose id appears in both sets)
      const toUpdate = slides.filter((s) => s.id && existingIdSet.has(s.id));
      if (toUpdate.length > 0) {
        await this.updateBrandingCarouselSlides(
          toUpdate.map((s) => ({ ...s, id: s.id! }))
        );
      }

      // Create new slides (no id provided)
      const toCreate = slides
        .filter((s) => !s.id)
        .map((s) => ({ ...s, branding_config_id: config.id }));

      if (toCreate.length > 0) {
        await this.createBrandingCarouselSlides(toCreate);
      }
    }

    // Re-fetch with slides relation so the returned value is complete
    return (await this.getConfig())!;
  }

  /**
   * Delete the singleton branding config (and its slides via cascade)
   */
  async deleteConfig() {
    const config = await this.getConfig();
    if (config) {
      // Delete slides first (no cascade configured)
      const slides = await this.listBrandingCarouselSlides({
        branding_config_id: config.id,
      });
      if (slides.length > 0) {
        await this.deleteBrandingCarouselSlides(slides.map((s) => s.id));
      }
      await this.deleteBrandingConfigs([config.id]);
    }
  }
}

export default BrandingModuleService;
export { DEFAULT_BRANDING_CONFIG };
