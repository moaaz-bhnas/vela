import { getProductsForClient } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { getTranslations } from "next-intl/server"
import ProductListWithFilters from "../product-list-with-filters"

const StoreTemplate = async ({ countryCode }: { countryCode: string }) => {
  const [initialData, region, t] = await Promise.all([
    getProductsForClient(countryCode),
    getRegion(countryCode),
    getTranslations("Store"),
  ])

  return (
    <ProductListWithFilters
      initialData={initialData}
      title={t("allProducts")}
      titleTestId="store-page-title"
      containerTestId="store-container"
      currencyCode={region?.currency_code ?? "usd"}
    />
  )
}

export default StoreTemplate
