import {
  createWorkflow,
  createStep,
  StepResponse,
} from "@medusajs/framework/workflows-sdk";
import { useQueryGraphStep } from "@medusajs/medusa/core-flows";
import { MedusaError, Modules } from "@medusajs/framework/utils";
import { PRODUCT_SALES_MODULE } from "../modules/product-sales";
import ProductSalesModuleService from "../modules/product-sales/service";
import {
  OrderDTO,
  LinkDefinition,
  Logger,
  OrderLineItemDTO,
  IOrderModuleService,
} from "@medusajs/framework/types";
import { Link } from "@medusajs/framework/modules-sdk";

type StepInput = {
  order: OrderDTO;
};

const updateProductSalesStep = createStep(
  "update-product-sales-step",
  async function updateProductSalesHandler(
    { order }: StepInput,
    { container },
  ) {
    const logger: Logger = container.resolve("logger");
    const orderModuleService: IOrderModuleService =
      container.resolve(Modules.ORDER);
    const productSalesService: ProductSalesModuleService =
      container.resolve(PRODUCT_SALES_MODULE);
    const link = container.resolve("link");

    // If this order has already contributed to product_sales, skip to keep the workflow idempotent.
    if (order.metadata?.product_sales_applied) {
      logger.info(
        `🟡 Skipping product sales update for order ${order.id}: already applied (metadata.product_sales_applied=true)`,
      );
      return new StepResponse(null);
    }

    logger.info(`🔵 Updating product sales for order ${order.id}`);

    const items = order.items || [];
    logger.info(`🔵 Processing ${items.length} items for order ${order.id}`);

    let processedCount = 0;
    let skippedCount = 0;

    for (const item of items) {
      try {
        const success = await processOrderItem(
          item,
          productSalesService,
          link,
          logger,
        );
        if (success) processedCount++;
        else skippedCount++;
      } catch (error) {
        logger.error(
          `🔴 Error updating product sales for product ${item.product_id}: ${error instanceof Error ? error.message : String(error)}`,
          error,
        );
        throw error;
      }
    }

    logger.info(
      `🟢 Completed product sales update for order ${order.id}: ${processedCount} processed, ${skippedCount} skipped`,
    );

    // Mark order as processed in metadata so we don't apply product sales twice.
    const existingMetadata = order.metadata || {};
    await orderModuleService.updateOrders(order.id, {
      metadata: {
        ...existingMetadata,
        product_sales_applied: true,
      },
    });

    return new StepResponse(null);
  },
);

type WorkflowInput = {
  order_id: string;
};

export const updateProductSalesWorkflow = createWorkflow(
  "update-product-sales-workflow",
  ({ order_id }: WorkflowInput) => {
    const { data: orders } = useQueryGraphStep({
      entity: "order",
      fields: ["id", "metadata", "items.*"],
      filters: {
        id: order_id,
      },
    });

    if (!orders[0]) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Order ${order_id} not found`,
      );
    }

    updateProductSalesStep({
      order: orders[0],
    } as StepInput);
  },
);

// Helper: Upsert product sales record
async function upsertProductSales(
  productSalesService: ProductSalesModuleService,
  productId: string,
  quantity: number,
  logger: Logger,
): Promise<string> {
  const existing = await productSalesService.listProductSales(
    { product_id: productId },
    { take: 1 },
  );

  if (existing.length) {
    const current = existing[0];
    const newCount = current.selling_count + quantity;
    const updateData = {
      id: current.id,
      selling_count: newCount,
    };

    await productSalesService.updateProductSales([updateData]);
    logger.info(
      `🔵 Updated product sales for product ${productId}: ${current.selling_count} -> ${newCount} (added ${quantity})`,
    );
    return current.id;
  } else {
    const created = await productSalesService.createProductSales({
      product_id: productId,
      selling_count: quantity,
    });
    logger.info(
      `🔵 Created new product sales record for product ${productId} with count ${quantity}`,
    );
    return created.id;
  }
}

// Helper: Process a single order item
async function processOrderItem(
  item: OrderLineItemDTO,
  productSalesService: ProductSalesModuleService,
  link: Link,
  logger: Logger,
): Promise<boolean> {
  const productId = item.product_id;
  const quantity = item.quantity || 0;

  // Validate item
  if (!productId || !quantity || quantity === 0) {
    logger.warn(
      `🟡 Skipping item ${item.id}: missing product_id or invalid quantity (product_id: ${productId}, quantity: ${quantity})`,
    );
    return false;
  }

  // Upsert product sales record
  const productSalesId = await upsertProductSales(
    productSalesService,
    productId,
    quantity,
    logger,
  );

  // Create link between product and product_sales (handle existing links gracefully)
  const linkDefinition: LinkDefinition = {
    [Modules.PRODUCT]: {
      product_id: productId,
    },
    [PRODUCT_SALES_MODULE]: {
      product_sales_id: productSalesId,
    },
  };

  try {
    await link.create([linkDefinition]);
    logger.info(
      `🔵 Linked product ${productId} to product sales ${productSalesId}`,
    );
  } catch (error) {
    logger.warn(
      `🟡 Link product ${productId} to product sales ${productSalesId} may already exist: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }

  return true;
}
