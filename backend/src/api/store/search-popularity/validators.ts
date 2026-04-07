import { z } from "@medusajs/framework/zod";
import { createFindParams } from "@medusajs/medusa/api/utils/validators";

export const GetSearchPopularitySchema = createFindParams();

export const PostSearchPopularitySchema = z.object({
  product_id: z.string().min(1),
});
