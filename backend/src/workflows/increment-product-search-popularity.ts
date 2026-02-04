import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { Modules } from "@medusajs/framework/utils";
import { LinkDefinition } from "@medusajs/framework/types";
import { PRODUCT_SEARCH_POPULARITY_MODULE } from "../modules/product-search-popularity";
import ProductSearchPopularityModuleService from "../modules/product-search-popularity/service";

type StepInput = {
  product_id: string;
};

const incrementProductSearchPopularityStep = createStep(
  "increment-product-search-popularity-step",
  async function incrementProductSearchPopularityHandler(
    { product_id }: StepInput,
    { container }
  ) {
    const logger = container.resolve("logger");
    const productSearchPopularityService: ProductSearchPopularityModuleService =
      container.resolve(PRODUCT_SEARCH_POPULARITY_MODULE);
    const link = container.resolve("link");

    if (!product_id?.trim()) {
      logger.warn("🟡 Skipping: missing product_id");
      return new StepResponse({ success: false }, null);
    }

    const existing =
      await productSearchPopularityService.listProductSearchPopularities(
        { product_id },
        { take: 1 }
      );

    let productSearchPopularityId: string;

    if (existing.length) {
      const current = existing[0];
      productSearchPopularityId = current.id;
      await productSearchPopularityService.updateProductSearchPopularities([
        {
          id: current.id,
          click_count: current.click_count + 1,
        },
      ]);
      logger.info(
        `🔵 Updated search popularity for product ${product_id}: ${current.click_count} -> ${current.click_count + 1}`
      );
    } else {
      const created =
        await productSearchPopularityService.createProductSearchPopularities({
          product_id,
          click_count: 1,
        });
      productSearchPopularityId = created.id;
      logger.info(
        `🔵 Created search popularity record for product ${product_id} with click_count 1`
      );
    }

    const productLink = createProductLink(
      product_id,
      productSearchPopularityId
    );
    await createLinkSafely(
      link,
      productLink,
      `product ${product_id} to product search popularity ${productSearchPopularityId}`,
      logger
    );

    return new StepResponse(
      {
        success: true,
        product_search_popularity_id: productSearchPopularityId,
      },
      { productSearchPopularityId, productLink }
    );
  },
  async function compensate(
    compensationData: {
      productSearchPopularityId: string;
      productLink: LinkDefinition;
    } | null,
    { container }
  ) {
    if (!compensationData?.productLink) return;

    const link = container.resolve("link");
    const logger = container.resolve("logger");
    try {
      await link.dismiss([compensationData.productLink]);
      logger.info("🔵 Dismissed product-search-popularity link on rollback");
    } catch (error) {
      logger.warn(
        `🟡 Compensation: dismiss link failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
);

function createProductLink(
  productId: string,
  productSearchPopularityId: string
): LinkDefinition {
  return {
    [Modules.PRODUCT]: {
      product_id: productId,
    },
    [PRODUCT_SEARCH_POPULARITY_MODULE]: {
      product_search_popularity_id: productSearchPopularityId,
    },
  };
}

async function createLinkSafely(
  link: any,
  linkDefinition: LinkDefinition,
  description: string,
  logger: any
): Promise<void> {
  try {
    await link.create([linkDefinition]);
    logger.info(`🔵 Linked ${description}`);
  } catch (error) {
    logger.warn(
      `🟡 Link ${description} may already exist: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

type WorkflowInput = {
  product_id: string;
};

export const incrementProductSearchPopularityWorkflow = createWorkflow(
  "increment-product-search-popularity",
  (input: WorkflowInput) => {
    const result = incrementProductSearchPopularityStep(input);
    return new WorkflowResponse(result);
  }
);
