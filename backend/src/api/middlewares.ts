import {
  defineMiddlewares,
  validateAndTransformBody,
  validateAndTransformQuery,
} from "@medusajs/framework/http";
import { PostAdminUpdateBranding } from "./admin/branding/validators";
import { GetBestSellersSchema } from "./store/best-sellers/validators";
import {
  GetSearchPopularitySchema,
  PostSearchPopularitySchema,
} from "./store/search-popularity/validators";

export default defineMiddlewares({
  routes: [
    {
      matcher: "/admin/branding",
      method: "POST",
      middlewares: [validateAndTransformBody(PostAdminUpdateBranding)],
    },
    {
      matcher: "/store/best-sellers",
      method: "GET",
      middlewares: [
        validateAndTransformQuery(GetBestSellersSchema, {
          defaults: ["id", "product_id", "selling_count"],
          isList: true,
        }),
      ],
    },
    {
      matcher: "/store/search-popularity",
      method: "GET",
      middlewares: [
        validateAndTransformQuery(GetSearchPopularitySchema, {
          defaults: ["id", "product_id", "click_count", "product.*"],
          isList: true,
        }),
      ],
    },
    {
      matcher: "/store/search-popularity",
      method: "POST",
      middlewares: [validateAndTransformBody(PostSearchPopularitySchema)],
    },
  ],
});
