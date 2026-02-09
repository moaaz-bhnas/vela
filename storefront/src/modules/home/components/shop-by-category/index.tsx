import { Heading, Text } from "@medusajs/ui"
import ShopByCategoryCard from "@modules/home/components/shop-by-category/shop-by-category-card"
import { getCategoriesList } from "@lib/data/categories"

export default async function ShopByCategorySection() {
  const { product_categories } = await getCategoriesList(0, 12)
  const topLevelCategories =
    product_categories?.filter((c) => c.parent_category_id === null) ?? []

  if (!topLevelCategories.length) {
    return null
  }

  return (
    <div className="flex flex-col gap-6 sm:gap-10">
      <div className="flex flex-col gap-2">
        <Heading
          level="h2"
          className="text-ui-fg-base font-heading text-2xl sm:text-4xl font-bold"
        >
          Shop by Category
        </Heading>
        <Text className="text-ui-fg-muted">
          Browse our curated collection of categories
        </Text>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {topLevelCategories.slice(0, 8).map((category) => {
          const href = `/categories/${category.handle}`
          const image = (
            category.metadata as
              | {
                  image?: {
                    url: string
                    alt?: string
                    width?: number
                    height?: number
                  }
                }
              | null
              | undefined
          )?.image

          return (
            <ShopByCategoryCard
              key={category.id}
              href={href}
              name={category.name}
              description={category.description}
              image={image}
            />
          )
        })}
      </div>
    </div>
  )
}
