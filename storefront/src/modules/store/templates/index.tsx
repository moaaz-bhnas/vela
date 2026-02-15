import { Suspense } from "react"

import { getProductsListWithSort } from "@lib/data/products"
import type { ProductFilters } from "@lib/util/filter-products"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

import PaginatedProducts from "./paginated-products"
import Container from "@modules/common/components/container-section"
import ListingHeader from "@modules/common/components/listing-header"

const PRODUCT_LIMIT = 12

const StoreTemplate = async ({
  sortBy,
  page,
  countryCode,
  filters,
}: {
  sortBy?: SortOptions
  page?: string
  countryCode: string
  filters?: ProductFilters
}) => {
  const pageNumber = page ? parseInt(page, 10) : 1
  const sort = sortBy || "popularity"

  const {
    availableOptions,
    optionValueCounts,
    priceBounds,
    response: { count },
  } = await getProductsListWithSort({
    page: pageNumber,
    queryParams: { limit: PRODUCT_LIMIT },
    sortBy: sort,
    filters,
    countryCode,
  })

  return (
    <Container
      className="flex flex-col small:flex-row small:items-start py-6 gap-6"
      data-testid="category-container"
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
      <div className="w-full space-y-8">
        <ListingHeader
          title="All products"
          count={count}
          titleTestId="store-page-title"
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
            countryCode={countryCode}
            filters={filters}
          />
        </Suspense>
      </div>
    </Container>
  )
}

export default StoreTemplate
