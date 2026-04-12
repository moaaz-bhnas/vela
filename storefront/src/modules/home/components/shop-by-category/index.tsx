import { Heading, Text } from "@medusajs/ui"
import ShopByCategoryCard from "@modules/home/components/shop-by-category/shop-by-category-card"
import { getCategoriesList } from "@lib/data/categories"
import { getTranslations } from "next-intl/server"

export default async function ShopByCategorySection() {
  const t = await getTranslations("Home")
  const { product_categories } = await getCategoriesList(0, 12)
  const topLevelCategories =
    product_categories?.filter((c) => c.parent_category_id === null) ?? []

  if (!topLevelCategories.length) {
    return null
  }

  return (
    <div className="flex flex-col gap-section-inner sm:gap-section-inner-lg">
      <div className="flex flex-col gap-block-gap">
        <Heading
          level="h2"
          className="text-ui-fg-base font-heading text-2xl sm:text-4xl font-bold"
        >
          {t("shopByCategory")}
        </Heading>
        <Text className="text-ui-fg-muted">
          {t("shopByCategorySubtitle")}
        </Text>
      </div>
      <div className="grid grid-cols-2 gap-section-inner md:grid-cols-3 lg:grid-cols-4">
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
