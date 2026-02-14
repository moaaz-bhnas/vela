import { Suspense } from "react"

import { getProductsListWithSort } from "@lib/data/products"
import type { ProductFilters } from "@lib/util/filter-products"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

import PaginatedProducts from "./paginated-products"

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
  } = await getProductsListWithSort({
    page: pageNumber,
    queryParams: { limit: PRODUCT_LIMIT },
    sortBy: sort,
    filters,
    countryCode,
  })

  return (
    <div
      className="flex flex-col small:flex-row small:items-start py-6 content-container"
      data-testid="category-container"
    >
      <RefinementList
        sortBy={sort}
        availableOptions={availableOptions}
        optionValueCounts={optionValueCounts}
        filters={filters}
      />
      <div className="w-full">
        <div className="mb-8 text-2xl-semi">
          <h1 data-testid="store-page-title">All products</h1>
        </div>
        <Suspense fallback={<SkeletonProductGrid />}>
          <PaginatedProducts
            sortBy={sort}
            page={pageNumber}
            countryCode={countryCode}
            filters={filters}
          />
        </Suspense>
      </div>
    </div>
  )
}

export default StoreTemplate
