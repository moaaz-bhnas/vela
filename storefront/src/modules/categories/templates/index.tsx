import { notFound } from "next/navigation"
import { Suspense } from "react"

import { HttpTypes } from "@medusajs/types"
import { getProductsListWithSort } from "@lib/data/products"
import type { ProductFilters } from "@lib/util/filter-products"
import InteractiveLink from "@modules/common/components/interactive-link"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import TrackCategoryVisit from "@modules/categories/components/track-category-visit"

const PRODUCT_LIMIT = 12

export default async function CategoryTemplate({
  categories,
  sortBy,
  page,
  countryCode,
  filters,
}: {
  categories: HttpTypes.StoreProductCategory[]
  sortBy?: SortOptions
  page?: string
  countryCode: string
  filters?: ProductFilters
}) {
  const pageNumber = page ? parseInt(page, 10) : 1
  const sort = sortBy || "popularity"
  const category = categories[categories.length - 1]
  const parents = categories.slice(0, categories.length - 1)

  if (!category || !countryCode) notFound()

  const queryParams = {
    limit: PRODUCT_LIMIT,
    category_id: [category.id],
  } as HttpTypes.FindParams & HttpTypes.StoreProductParams

  const {
    availableOptions,
    optionValueCounts,
  } = await getProductsListWithSort({
    page: pageNumber,
    queryParams,
    sortBy: sort,
    filters,
    countryCode,
  })

  return (
    <>
      <TrackCategoryVisit categoryId={category.id} />
      <div
        className="flex flex-col small:flex-row small:items-start py-6 content-container"
        data-testid="category-container"
      >
        <RefinementList
          sortBy={sort}
          availableOptions={availableOptions}
          optionValueCounts={optionValueCounts}
          filters={filters}
          data-testid="sort-by-container"
        />
        <div className="w-full">
          <div className="flex flex-row mb-8 text-2xl-semi gap-4">
            {parents &&
              parents.map((parent) => (
                <span key={parent.id} className="text-ui-fg-subtle">
                  <LocalizedClientLink
                    className="mr-4 hover:text-black"
                    href={`/categories/${parent.handle}`}
                    data-testid="sort-by-link"
                  >
                    {parent.name}
                  </LocalizedClientLink>
                  /
                </span>
              ))}
            <h1 data-testid="category-page-title">{category.name}</h1>
          </div>
          {category.description && (
            <div className="mb-8 text-base-regular">
              <p>{category.description}</p>
            </div>
          )}
          {category.category_children && (
            <div className="mb-8 text-base-large">
              <ul className="grid grid-cols-1 gap-2">
                {category.category_children?.map((c) => (
                  <li key={c.id}>
                    <InteractiveLink href={`/categories/${c.handle}`}>
                      {c.name}
                    </InteractiveLink>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <Suspense fallback={<SkeletonProductGrid />}>
            <PaginatedProducts
              sortBy={sort}
              page={pageNumber}
              categoryId={category.id}
              countryCode={countryCode}
              filters={filters}
            />
          </Suspense>
        </div>
      </div>
    </>
  )
}
