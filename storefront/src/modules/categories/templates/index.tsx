import { notFound } from "next/navigation"

import { HttpTypes } from "@medusajs/types"
import { getProductsForClient } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import TrackCategoryVisit from "@modules/categories/components/track-category-visit"
import InteractiveLink from "@modules/common/components/interactive-link"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ProductListWithFilters from "@modules/store/templates/product-list-with-filters"

export default async function CategoryTemplate({
  categories,
  countryCode,
}: {
  categories: HttpTypes.StoreProductCategory[]
  countryCode: string
}) {
  const category = categories[categories.length - 1]
  const parents = categories.slice(0, categories.length - 1)

  if (!category || !countryCode) notFound()

  const [initialData, region] = await Promise.all([
    getProductsForClient(countryCode, { categoryId: category.id }),
    getRegion(countryCode),
  ])

  const headerExtra =
    parents.length > 0 ? (
      <div className="flex flex-row flex-wrap items-center gap-4">
        {parents.map((parent) => (
          <span key={parent.id} className="text-ui-fg-subtle text-2xl-semi">
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
    ) : undefined

  const contentAfterHeader = (
    <>
      {category.description && (
        <div className="text-base-regular">
          <p>{category.description}</p>
        </div>
      )}
      {category.category_children && category.category_children.length > 0 && (
        <div className="text-base-large">
          <ul className="grid grid-cols-1 gap-block-gap">
            {category.category_children.map((c) => (
              <li key={c.id}>
                <InteractiveLink href={`/categories/${c.handle}`}>
                  {c.name}
                </InteractiveLink>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  )

  return (
    <>
      <TrackCategoryVisit categoryId={category.id} />
      <ProductListWithFilters
        initialData={initialData}
        title={category.name ?? ""}
        titleTestId="category-page-title"
        containerTestId="category-container"
        headerExtra={headerExtra}
        contentAfterHeader={contentAfterHeader}
        currencyCode={region?.currency_code}
        showCategoryFilter={false}
      />
    </>
  )
}
