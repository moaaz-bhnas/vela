import { defineLink } from "@medusajs/framework/utils";
import ProductSearchPopularityModule from "../modules/product-search-popularity";
import ProductModule from "@medusajs/medusa/product";

export default defineLink(ProductModule.linkable.product, {
  linkable: ProductSearchPopularityModule.linkable.productSearchPopularity,
  deleteCascade: true,
});
