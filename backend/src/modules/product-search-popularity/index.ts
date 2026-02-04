import { Module } from "@medusajs/framework/utils";
import ProductSearchPopularityModuleService from "./service";

export const PRODUCT_SEARCH_POPULARITY_MODULE = "product_search_popularity";

export default Module(PRODUCT_SEARCH_POPULARITY_MODULE, {
  service: ProductSearchPopularityModuleService,
});
