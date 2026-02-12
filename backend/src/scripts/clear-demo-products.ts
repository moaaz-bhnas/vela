import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";

export default async function clearDemoProducts({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const productModuleService = container.resolve(Modules.PRODUCT);
  const inventoryModuleService = container.resolve(Modules.INVENTORY);

  logger.info(
    "Hard-deleting demo products and inventory items with prefix 'DEMO-'...",
  );

  // 1. Remove inventory items whose SKU starts with DEMO-
  const { data: inventoryItems } = await query.graph({
    entity: "inventory_item",
    fields: ["id", "sku"],
  });

  const demoInventoryItems = (
    inventoryItems as { id: string; sku: string }[]
  ).filter((i) => i.sku?.startsWith("DEMO-"));

  if (demoInventoryItems.length) {
    const inventoryIds = demoInventoryItems.map((i) => i.id);

    await inventoryModuleService.deleteInventoryItems(inventoryIds);

    logger.info(`Hard-deleted ${demoInventoryItems.length} demo inventory items.`);
  } else {
    logger.info("No demo inventory items found to remove.");
  }

  // 2. Remove demo products by handle prefix
  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "handle"],
  });

  const demoProducts = (products as { id: string; handle: string }[]).filter(
    (p) => p.handle.startsWith("demo-"),
  );

  if (!demoProducts.length) {
    logger.info("No demo products found to remove.");
    return;
  }

  const productIds = demoProducts.map((p) => p.id);

  await productModuleService.deleteProducts(productIds);

  logger.info(
    `Hard-deleted ${demoProducts.length} demo products (and related data).`,
  );
}
