import { getRegion } from "@lib/data/regions"
import { getBestSellers } from "@lib/data/best-sellers"
import { buildStoreProductsForClient } from "@lib/data/products"
import ProductListWithFilters from "./product-list-with-filters"

const BestSellersTemplate = async ({ countryCode }: { countryCode: string }) => {
  const region = await getRegion(countryCode)
  const products = await getBestSellers({
    regionId: region?.id ?? "",
  })

  const initialData = buildStoreProductsForClient(products)

  return (
    <ProductListWithFilters
      initialData={initialData}
      title="Bestsellers"
      titleTestId="bestsellers-page-title"
      containerTestId="bestsellers-container"
      currencyCode={region?.currency_code ?? "usd"}
      showSortOptions={false}
    />
  )
}

export default BestSellersTemplate
