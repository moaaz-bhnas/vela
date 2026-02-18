import { Suspense } from "react"

import { HttpTypes } from "@medusajs/types"
import { getProductsListWithSort } from "@lib/data/products"
import type { ProductFilters } from "@lib/util/filter-products"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import ListingHeader from "@modules/common/components/listing-header"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import TrackCollectionVisit from "@modules/collections/components/track-collection-visit"
import Container from "@modules/common/components/container-section"

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

  const {
    availableOptions,
    optionValueCounts,
    priceBounds,
    response: { count },
  } = await getProductsListWithSort({
    page: pageNumber,
    queryParams,
    sortBy: sort,
    filters,
    countryCode,
  })

  return (
    <>
      <TrackCollectionVisit collectionId={collection.id} />
      <Container
        className="flex flex-col small:flex-row small:items-start gap-section-inner-lg pt-0 small:pt-section-y-lg"
        data-testid="collection-container"
      >
        <div className="hidden small:block small:w-80">
          <RefinementList
            sortBy={sort}
            availableOptions={availableOptions}
            optionValueCounts={optionValueCounts}
            priceBounds={priceBounds}
            filters={filters}
          />
        </div>
        <div className="w-full flex flex-col gap-section-inner sm:gap-section-inner-lg">
          <ListingHeader
            title={collection.title}
            count={count}
            filterDrawerContent={
              <RefinementList
                sortBy={sort}
                availableOptions={availableOptions}
                optionValueCounts={optionValueCounts}
                priceBounds={priceBounds}
                filters={filters}
                data-testid="filter-sidebar-refinement-list"
              />
            }
          />
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
      </Container>
    </>
  )
}
