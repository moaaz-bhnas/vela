import { sdk } from "./sdk";

export const categoryFetcher = async (categoryId: string) => {
  return await sdk.admin.productCategory.retrieve(categoryId, {
    fields: "+metadata",
  });
};
