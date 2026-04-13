import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { incrementProductSearchPopularityWorkflow } from "../../../workflows/increment-product-search-popularity";
import { PostSearchPopularitySchemaType } from "./validators";

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const query = req.scope.resolve("query");

  const { data: productSearchPopularity, metadata } = await query.graph({
    entity: "product_search_popularity",
    ...req.queryConfig,
    pagination: {
      ...req.queryConfig?.pagination,
      order: {
        click_count: "DESC",
      },
    },
  });

  res.json({
    product_search_popularity: productSearchPopularity,
    count: metadata?.count ?? 0,
    limit: metadata?.take ?? 0,
    offset: metadata?.skip ?? 0,
  });
};

export const POST = async (
  req: MedusaRequest<PostSearchPopularitySchemaType>,
  res: MedusaResponse
) => {
  const { result } = await incrementProductSearchPopularityWorkflow(
    req.scope
  ).run({
    input: { product_id: req.validatedBody.product_id! },
  });

  res.status(200).json(result);
};
