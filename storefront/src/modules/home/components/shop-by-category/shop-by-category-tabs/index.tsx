"use client"

import { useState } from "react"
import { HttpTypes } from "@medusajs/types"
import { Heading, Text } from "@medusajs/ui"
import { useTranslations } from "next-intl"
import ProductPreview from "@modules/products/components/product-preview"
import InteractiveLink from "@modules/common/components/interactive-link"

export type CategoryWithProducts = {
  id: string
  name: string
  handle: string
  products: HttpTypes.StoreProduct[]
}

type Props = {
  categories: CategoryWithProducts[]
}

export default function ShopByCategoryTabs({ categories }: Props) {
  const [activeIndex, setActiveIndex] = useState(0)
  const t = useTranslations("Home")

  const activeCategory = categories[activeIndex]

  if (!activeCategory) return null

  return (
    <div className="flex flex-col gap-section-inner sm:gap-section-inner-lg">
      {/* Header row: heading + "View all" link */}
      <div className="flex items-start justify-between gap-4">
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
        <div className="shrink-0 pt-1 sm:pt-2">
          <InteractiveLink href={`/categories/${activeCategory.handle}`}>
            {t("viewAll")}
          </InteractiveLink>
        </div>
      </div>

      {/* Category tab pills */}
      <div
        role="tablist"
        aria-label={t("shopByCategory")}
        className="flex gap-2 overflow-x-auto no-scrollbar"
      >
        {categories.map((cat, i) => (
          <button
            key={cat.id}
            role="tab"
            aria-selected={i === activeIndex}
            onClick={() => setActiveIndex(i)}
            className={
              i === activeIndex
                ? "px-4 py-1.5 rounded-circle border border-ui-border-base bg-ui-bg-subtle text-ui-fg-base text-sm font-medium whitespace-nowrap transition-colors duration-150 cursor-default"
                : "px-4 py-1.5 rounded-circle text-ui-fg-subtle text-sm font-medium whitespace-nowrap transition-colors duration-150 hover:text-ui-fg-base hover:bg-ui-bg-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ui-border-interactive"
            }
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Product grid */}
      {activeCategory.products.length > 0 ? (
        <ul
          role="tabpanel"
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-section-inner"
        >
          {activeCategory.products.map((product) => (
            <li key={product.id}>
              <ProductPreview product={product} />
            </li>
          ))}
        </ul>
      ) : (
        <div role="tabpanel" className="py-12 text-center">
          <Text className="text-ui-fg-muted">{t("noCategoryProducts")}</Text>
        </div>
      )}
    </div>
  )
}
