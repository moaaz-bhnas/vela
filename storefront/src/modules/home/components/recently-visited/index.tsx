import { getProductsById } from "@lib/data/products"
import { getRecentProductIds } from "@lib/data/cookies"
import { HttpTypes } from "@medusajs/types"
import { Heading, Text } from "@medusajs/ui"
import ProductPreview from "@modules/products/components/product-preview"
import { getTranslations } from "next-intl/server"

type RecentlyVisitedProps = {
  region: HttpTypes.StoreRegion
}

export default async function RecentlyVisited({
  region,
}: RecentlyVisitedProps) {
  const t = await getTranslations("Home")
  const recentProductIds = await getRecentProductIds()

  const products = await (async function getProducts() {
    if (recentProductIds.length === 0) return []

    return await getProductsById({
      ids: recentProductIds.slice(0, 4),
      regionId: region.id,
    })
  })()

  if (products.length === 0) return null

  return (
    <div className="flex flex-col gap-section-inner sm:gap-section-inner-lg">
      <div className="flex flex-col gap-block-gap">
        <Heading
          level="h2"
          className="text-ui-fg-base font-heading text-2xl sm:text-4xl font-bold"
        >
          {t("recentlyViewedTitle")}
        </Heading>
        <Text className="text-ui-fg-muted">{t("pickUpWhere")}</Text>
      </div>
      <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-section-inner">
        {products.map((product) => (
          <li key={product.id}>
            <ProductPreview product={product} />
          </li>
        ))}
      </ul>
    </div>
  )
}
