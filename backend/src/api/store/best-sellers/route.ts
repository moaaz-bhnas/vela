import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const query = req.scope.resolve("query");

  const { data: productSales, metadata } = await query.graph({
    entity: "product_sales",
    ...req.queryConfig,
    pagination: {
      ...req.queryConfig?.pagination,
      order: {
        selling_count: "DESC",
      },
    },
  });

  res.json({
    product_sales: productSales,
    count: metadata?.count ?? 0,
    limit: metadata?.take ?? 0,
    offset: metadata?.skip ?? 0,
  });
};
