import { model } from "@medusajs/framework/utils";

export const ProductSales = model
    .define("product_sales", {
        id: model.id().primaryKey(),
        product_id: model.text().unique(),
        selling_count: model.number().default(0),
    })
    .indexes([
        {
            on: ["product_id"],
            unique: true,
        },
    ]);

export default ProductSales;

