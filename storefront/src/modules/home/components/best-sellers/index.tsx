import { HttpTypes } from "@medusajs/types"
import { Heading, Text } from "@medusajs/ui"
import ProductPreview from "@modules/products/components/product-preview"
import { getBestSellers } from "@lib/data/best-sellers"
import { getTranslations } from "next-intl/server"
import {
  getPersonalizationCategoryIds,
  getPersonalizationCollectionId,
} from "@lib/data/cookies"

type BestSellersProps = {
  region: HttpTypes.StoreRegion
}

export default async function BestSellers({ region }: BestSellersProps) {
  if (!region) return null

  const t = await getTranslations("Home")
  const categoryIds = await getPersonalizationCategoryIds()
  const collectionId = await getPersonalizationCollectionId()

  const products = await getBestSellers({
    category_ids: categoryIds.length > 0 ? categoryIds : undefined,
    collection_id: collectionId ?? undefined,
    regionId: region.id,
    limit: 12,
  })

  return (
    <div className="flex flex-col gap-section-inner sm:gap-section-inner-lg">
      <div className="flex flex-col gap-block-gap">
        <Heading
          level="h2"
          className="text-ui-fg-base font-heading text-2xl sm:text-4xl font-bold"
        >
          {t("bestSellers")}
        </Heading>
        <Text className="text-ui-fg-muted">
          {t("bestSellersSubtitle")}
        </Text>
      </div>
      <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-section-inner">
        {products.slice(0, 4).map((product) => (
          <li key={product.id}>
            <ProductPreview product={product} />
          </li>
        ))}
      </ul>
    </div>
  )
}
