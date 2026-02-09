import { HttpTypes } from "@medusajs/types"
import { Heading, Text } from "@medusajs/ui"
import ProductPreview from "@modules/products/components/product-preview"
import { getBestSellers } from "@lib/data/best-sellers"
import {
  getPersonalizationCategoryIds,
  getPersonalizationCollectionId,
} from "@lib/data/cookies"

type BestSellersProps = {
  region: HttpTypes.StoreRegion
}

export default async function BestSellers({ region }: BestSellersProps) {
  if (!region) return null

  const categoryIds = await getPersonalizationCategoryIds()
  const collectionId = await getPersonalizationCollectionId()

  const products = await getBestSellers({
    category_ids: categoryIds.length > 0 ? categoryIds : undefined,
    collection_id: collectionId ?? undefined,
    regionId: region.id,
    limit: 12,
  })

  return (
    <div className="flex flex-col gap-6 sm:gap-10">
      <div className="flex flex-col gap-2">
        <Heading
          level="h2"
          className="text-ui-fg-base font-heading text-2xl sm:text-4xl font-bold"
        >
          Best Sellers
        </Heading>
        <Text className="text-ui-fg-muted">
          Discover our most popular products
        </Text>
      </div>
      <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <li key={product.id}>
            <ProductPreview product={product} region={region} isFeatured />
          </li>
        ))}
      </ul>
    </div>
  )
}
