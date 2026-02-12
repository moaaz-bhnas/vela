import { ExecArgs } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils";
import { createProductsWorkflow } from "@medusajs/medusa/core-flows";

export type DemoCategoryName = "Shirts" | "Sweatshirts" | "Pants" | "Merch";

export type DemoProductArchetype =
  | "APPAREL_SIZE_COLOR"
  | "APPAREL_SIZE_ONLY"
  | "MERCH_COLOR_ONLY"
  | "ONE_SIZE_ACCESSORY";

export type ImageSetKey = "shirt" | "sweatshirt" | "pants" | "shorts";

export type PriceBand = {
  min: number;
  max: number;
};

export const CATEGORY_PRICE_BANDS: Record<DemoCategoryName, PriceBand> = {
  Shirts: { min: 1500, max: 4000 }, // 15–40 EUR
  Sweatshirts: { min: 2500, max: 6000 }, // 25–60 EUR
  Pants: { min: 2000, max: 5500 }, // 20–55 EUR
  Merch: { min: 500, max: 2500 }, // 5–25 EUR
};

export const SHARED_SIZES = ["S", "M", "L", "XL"] as const;

export const SHARED_COLORS = ["Black", "White", "Gray", "Navy"] as const;

export const IMAGE_SETS: Record<ImageSetKey, { url: string }[]> = {
  // Reuse Medusa demo images from the main seed script
  shirt: [
    {
      url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/tee-black-front.png",
    },
    {
      url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/tee-black-back.png",
    },
    {
      url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/tee-white-front.png",
    },
    {
      url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/tee-white-back.png",
    },
  ],
  sweatshirt: [
    {
      url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatshirt-vintage-front.png",
    },
    {
      url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatshirt-vintage-back.png",
    },
  ],
  pants: [
    {
      url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatpants-gray-front.png",
    },
    {
      url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatpants-gray-back.png",
    },
  ],
  shorts: [
    {
      url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/shorts-vintage-front.png",
    },
    {
      url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/shorts-vintage-back.png",
    },
  ],
};

export type DescriptionTemplateId =
  | "shirts_everyday"
  | "shirts_premium"
  | "sweatshirts_cozy"
  | "sweatshirts_vintage"
  | "pants_relaxed"
  | "pants_tapered"
  | "merch_minimal"
  | "merch_graphic";

export const DESCRIPTION_TEMPLATES: Record<DescriptionTemplateId, string> = {
  shirts_everyday:
    "An everyday cotton tee with a soft handfeel, designed for effortless layering and all-day comfort.",
  shirts_premium:
    "A premium-weight crewneck shirt crafted from dense cotton jersey, offering structure, drape, and a polished silhouette.",
  sweatshirts_cozy:
    "A cozy mid-weight sweatshirt with brushed fleece interior, made for cool evenings and relaxed weekends.",
  sweatshirts_vintage:
    "A vintage-inspired sweatshirt with a washed finish and classic rib trims, built to soften and age beautifully over time.",
  pants_relaxed:
    "Relaxed-fit pants with a straight leg and elastic waistband, perfect for unwinding at home or stepping out in comfort.",
  pants_tapered:
    "Tapered sweatpants with cuffed hems and a streamlined fit, ideal for everyday wear, commuting, or light training.",
  merch_minimal:
    "Minimal everyday merch with subtle branding and clean lines, designed to pair seamlessly with any wardrobe.",
  merch_graphic:
    "Graphic-led merch featuring bold artwork and contrasting details, made to stand out in any casual rotation.",
};

export function eurToUsd(amountEur: number): number {
  // Simple conversion for demo purposes (~1.1x) rounded to nearest integer
  return Math.round(amountEur * 1.1);
}

type CategoryConfig = {
  baseTitle: string;
  handlePrefix: string;
  skuPrefix: string;
  imageSetKey: keyof typeof IMAGE_SETS;
  descriptionTemplates: DescriptionTemplateId[];
  archetype: "APPAREL_SIZE_COLOR" | "APPAREL_SIZE_ONLY" | "MERCH_COLOR_ONLY";
};

const CATEGORY_CONFIGS: Record<DemoCategoryName, CategoryConfig> = {
  Shirts: {
    baseTitle: "Medusa Everyday Tee",
    handlePrefix: "demo-shirt",
    skuPrefix: "DEMO-TSHIRT",
    imageSetKey: "shirt",
    descriptionTemplates: ["shirts_everyday", "shirts_premium"],
    archetype: "APPAREL_SIZE_COLOR",
  },
  Sweatshirts: {
    baseTitle: "Medusa Fleece Sweatshirt",
    handlePrefix: "demo-sweatshirt",
    skuPrefix: "DEMO-SWEATSHIRT",
    imageSetKey: "sweatshirt",
    descriptionTemplates: ["sweatshirts_cozy", "sweatshirts_vintage"],
    archetype: "APPAREL_SIZE_ONLY",
  },
  Pants: {
    baseTitle: "Medusa Relaxed Pants",
    handlePrefix: "demo-pants",
    skuPrefix: "DEMO-PANTS",
    imageSetKey: "pants",
    descriptionTemplates: ["pants_relaxed", "pants_tapered"],
    archetype: "APPAREL_SIZE_ONLY",
  },
  Merch: {
    baseTitle: "Medusa Core Merch",
    handlePrefix: "demo-merch",
    skuPrefix: "DEMO-MERCH",
    imageSetKey: "shorts",
    descriptionTemplates: ["merch_minimal", "merch_graphic"],
    archetype: "MERCH_COLOR_ONLY",
  },
};

function randomPriceForCategory(category: DemoCategoryName): {
  eur: number;
  usd: number;
} {
  const band = CATEGORY_PRICE_BANDS[category];
  const eur =
    Math.floor(Math.random() * (band.max - band.min + 1)) + band.min;
  const usd = eurToUsd(eur);
  return { eur, usd };
}

export default async function seedDemoProducts({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT);
  const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL);

  logger.info("Seeding additional demo products...");

  // Ensure we have a default sales channel and shipping profile, assuming main seed ran first.
  const [defaultSalesChannel] =
    await salesChannelModuleService.listSalesChannels({
      name: "Default Sales Channel",
    });

  if (!defaultSalesChannel) {
    throw new Error(
      "Default Sales Channel not found. Please run the main seed script first."
    );
  }

  const [shippingProfile] = await fulfillmentModuleService.listShippingProfiles(
    {
      type: "default",
    }
  );

  if (!shippingProfile) {
    throw new Error(
      "Default Shipping Profile not found. Please run the main seed script first."
    );
  }

  // Fetch existing categories created by the main seed.
  const { data: categories } = await query.graph({
    entity: "product_category",
    fields: ["id", "name"],
  });

  const getCategoryId = (name: DemoCategoryName): string => {
    const match = (categories as { id: string; name: string }[]).find(
      (c) => c.name === name
    );
    if (!match) {
      throw new Error(
        `Category '${name}' not found. Please ensure the main seed script has run.`
      );
    }
    return match.id;
  };

  const categoryNames: DemoCategoryName[] = [
    "Shirts",
    "Sweatshirts",
    "Pants",
    "Merch",
  ];

  const products = categoryNames.flatMap((categoryName) => {
    const cfg = CATEGORY_CONFIGS[categoryName];
    const categoryId = getCategoryId(categoryName);

    return Array.from({ length: 50 }).map((_, index) => {
      const productIndex = index + 1;
      const { eur, usd } = randomPriceForCategory(categoryName);
      const descriptionTemplateId =
        cfg.descriptionTemplates[index % cfg.descriptionTemplates.length];
      const description = DESCRIPTION_TEMPLATES[descriptionTemplateId];

      const baseProduct: any = {
        title: `${cfg.baseTitle} ${productIndex}`,
        handle: `${cfg.handlePrefix}-${productIndex}`,
        description,
        weight: 400,
        status: ProductStatus.PUBLISHED,
        category_ids: [categoryId],
        shipping_profile_id: shippingProfile.id,
        images: IMAGE_SETS[cfg.imageSetKey],
        sales_channels: [
          {
            id: defaultSalesChannel.id,
          },
        ],
      };

      if (cfg.archetype === "APPAREL_SIZE_COLOR") {
        const sizes = [...SHARED_SIZES];
        const colors = ["Black", "White"] as const;

        baseProduct.options = [
          {
            title: "Size",
            values: sizes,
          },
          {
            title: "Color",
            values: colors as unknown as string[],
          },
        ];

        baseProduct.variants = sizes.flatMap((size) =>
          colors.map((color) => ({
            title: `${size} / ${color}`,
            sku: `${cfg.skuPrefix}-${productIndex}-${size}-${color.toUpperCase()}`,
            options: {
              Size: size,
              Color: color,
            },
            prices: [
              {
                amount: eur,
                currency_code: "eur",
              },
              {
                amount: usd,
                currency_code: "usd",
              },
            ],
          }))
        );
      } else if (cfg.archetype === "APPAREL_SIZE_ONLY") {
        const sizes = [...SHARED_SIZES];

        baseProduct.options = [
          {
            title: "Size",
            values: sizes,
          },
        ];

        baseProduct.variants = sizes.map((size) => ({
          title: size,
          sku: `${cfg.skuPrefix}-${productIndex}-${size}`,
          options: {
            Size: size,
          },
          prices: [
            {
              amount: eur,
              currency_code: "eur",
            },
            {
              amount: usd,
              currency_code: "usd",
            },
          ],
        }));
      } else if (cfg.archetype === "MERCH_COLOR_ONLY") {
        const colors = SHARED_COLORS.slice(0, 3); // a few key colors

        baseProduct.options = [
          {
            title: "Color",
            values: colors as unknown as string[],
          },
        ];

        baseProduct.variants = colors.map((color) => ({
          title: color,
          sku: `${cfg.skuPrefix}-${productIndex}-${color.toUpperCase()}`,
          options: {
            Color: color,
          },
          prices: [
            {
              amount: eur,
              currency_code: "eur",
            },
            {
              amount: usd,
              currency_code: "usd",
            },
          ],
        }));
      }

      return baseProduct;
    });
  });

  await createProductsWorkflow(container).run({
    input: {
      products,
    },
  });

  logger.info(
    `Finished seeding ${products.length} additional demo products across 4 categories.`
  );
}

