import { model } from "@medusajs/framework/utils";

export const ProductSearchPopularity = model
  .define("product_search_popularity", {
    id: model.id().primaryKey(),
    product_id: model.text().unique(),
    click_count: model.number().default(0),
  })
  .indexes([
    {
      on: ["product_id"],
      unique: true,
    },
  ]);

export default ProductSearchPopularity;
