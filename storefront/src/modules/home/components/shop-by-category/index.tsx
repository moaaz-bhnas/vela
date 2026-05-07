import { getCategoriesList } from "@lib/data/categories"
import { getProductsList } from "@lib/data/products"
import ShopByCategoryTabs from "./shop-by-category-tabs"

type Props = {
  countryCode: string
}

export default async function ShopByCategorySection({ countryCode }: Props) {
  const { product_categories } = await getCategoriesList(0, 12)
  const topLevelCategories =
    product_categories?.filter((c) => c.parent_category_id === null) ?? []

  if (!topLevelCategories.length) return null

  // Fetch up to 4 products for each top-level category in parallel
  const categoriesWithProducts = await Promise.all(
    topLevelCategories.slice(0, 6).map(async (category) => {
      const {
        response: { products },
      } = await getProductsList({
        queryParams: {
          // @ts-ignore – category_id accepted at runtime but missing from older type stubs
          category_id: [category.id],
          limit: 4,
        },
        countryCode,
      })
      return {
        id: category.id,
        name: category.name,
        handle: category.handle,
        products,
      }
    })
  )

  // Drop categories that have no products so every tab has content
  const nonEmptyCategories = categoriesWithProducts.filter(
    (c) => c.products.length > 0
  )

  if (!nonEmptyCategories.length) return null

  return <ShopByCategoryTabs categories={nonEmptyCategories} />
}
