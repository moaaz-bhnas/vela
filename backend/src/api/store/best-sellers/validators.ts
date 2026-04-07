import { z } from "@medusajs/framework/zod";
import { createFindParams } from "@medusajs/medusa/api/utils/validators";

export const GetBestSellersSchema = createFindParams();
