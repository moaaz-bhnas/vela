import { notFound } from "next/navigation"
import { Suspense } from "react"

import { HttpTypes } from "@medusajs/types"
import { getProductsListWithSort } from "@lib/data/products"
import type { ProductFilters } from "@lib/util/filter-products"
import InteractiveLink from "@modules/common/components/interactive-link"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import ListingHeader from "@modules/common/components/listing-header"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import TrackCategoryVisit from "@modules/categories/components/track-category-visit"
import Container from "@modules/common/components/container-section"

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
      <TrackCategoryVisit categoryId={category.id} />
      <Container
        className="flex flex-col small:flex-row small:items-start py-0 small:py-6 gap-10"
        data-testid="category-container"
      >
        <div className="hidden small:block small:w-80">
          <RefinementList
            sortBy={sort}
            availableOptions={availableOptions}
            optionValueCounts={optionValueCounts}
            priceBounds={priceBounds}
            filters={filters}
            data-testid="sort-by-container"
          />
        </div>
        <div className="w-full">
          {parents && parents.length > 0 && (
            <div className="flex flex-row flex-wrap items-center mb-4 gap-4">
              {parents.map((parent) => (
                <span
                  key={parent.id}
                  className="text-ui-fg-subtle text-2xl-semi"
                >
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
            </div>
          )}
          <ListingHeader
            title={category.name}
            count={count}
            titleTestId="category-page-title"
            className="mb-8"
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
      </Container>
    </>
  )
}
