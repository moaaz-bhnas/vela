import { MedusaService } from "@medusajs/framework/utils";
import ProductSearchPopularity from "./models/product-search-popularity";

class ProductSearchPopularityModuleService extends MedusaService({
  ProductSearchPopularity,
}) {}

export default ProductSearchPopularityModuleService;
