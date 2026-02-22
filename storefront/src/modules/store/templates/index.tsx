import { getProductsForClient } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import ProductListWithFilters from "./product-list-with-filters"

const StoreTemplate = async ({ countryCode }: { countryCode: string }) => {
  const [initialData, region] = await Promise.all([
    getProductsForClient(countryCode),
    getRegion(countryCode),
  ])

  return (
    <ProductListWithFilters
      initialData={initialData}
      title="All products"
      titleTestId="store-page-title"
      containerTestId="store-container"
      currencyCode={region?.currency_code ?? "usd"}
    />
  )
}

export default StoreTemplate
