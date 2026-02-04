import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { incrementProductSearchPopularityWorkflow } from "../../../workflows/increment-product-search-popularity";

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const query = req.scope.resolve("query");

  const { data: productSearchPopularity, metadata } = await query.graph({
    entity: "product_search_popularity",
    pagination: {
      ...req.queryConfig?.pagination,
      order: {
        click_count: "DESC",
      },
    },
    ...req.queryConfig,
  });

  res.json({
    product_search_popularity: productSearchPopularity,
    count: metadata?.count,
    limit: metadata?.take,
    offset: metadata?.skip,
  });
};

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const { result } = await incrementProductSearchPopularityWorkflow(
    req.scope
  ).run({
    input: req.validatedBody as { product_id: string },
  });

  res.status(200).json(result);
};
