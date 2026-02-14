import { Suspense } from "react"

import { HttpTypes } from "@medusajs/types"
import { getProductsListWithSort } from "@lib/data/products"
import type { ProductFilters } from "@lib/util/filter-products"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import TrackCollectionVisit from "@modules/collections/components/track-collection-visit"

const PRODUCT_LIMIT = 12

export default async function CollectionTemplate({
  sortBy,
  collection,
  page,
  countryCode,
  filters,
}: {
  sortBy?: SortOptions
  collection: HttpTypes.StoreCollection
  page?: string
  countryCode: string
  filters?: ProductFilters
}) {
  const pageNumber = page ? parseInt(page, 10) : 1
  const sort = sortBy || "popularity"

  const queryParams = {
    limit: PRODUCT_LIMIT,
    collection_id: [collection.id],
  } as HttpTypes.FindParams & HttpTypes.StoreProductParams

  const { availableOptions, optionValueCounts } = await getProductsListWithSort(
    {
      page: pageNumber,
      queryParams,
      sortBy: sort,
      filters,
      countryCode,
    }
  )

  return (
    <>
      <TrackCollectionVisit collectionId={collection.id} />
      <div className="flex flex-col small:flex-row small:items-start py-6 content-container">
        <RefinementList
          sortBy={sort}
          availableOptions={availableOptions}
          optionValueCounts={optionValueCounts}
          filters={filters}
        />
        <div className="w-full">
          <div className="mb-8 text-2xl-semi">
            <h1>{collection.title}</h1>
          </div>
          <Suspense fallback={<SkeletonProductGrid />}>
            <PaginatedProducts
              sortBy={sort}
              page={pageNumber}
              collectionId={collection.id}
              countryCode={countryCode}
              filters={filters}
            />
          </Suspense>
        </div>
      </div>
    </>
  )
}
