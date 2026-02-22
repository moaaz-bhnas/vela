import { HttpTypes } from "@medusajs/types"
import { getProductsForClient } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import TrackCollectionVisit from "@modules/collections/components/track-collection-visit"
import ProductListWithFilters from "@modules/store/templates/product-list-with-filters"

export default async function CollectionTemplate({
  collection,
  countryCode,
}: {
  collection: HttpTypes.StoreCollection
  countryCode: string
}) {
  const [initialData, region] = await Promise.all([
    getProductsForClient(countryCode, { collectionId: collection.id }),
    getRegion(countryCode),
  ])

  return (
    <>
      <TrackCollectionVisit collectionId={collection.id} />
      <ProductListWithFilters
        initialData={initialData}
        title={collection.title ?? ""}
        containerTestId="collection-container"
        currencyCode={region?.currency_code}
      />
    </>
  )
}
