import { Badge, Text } from "@medusajs/ui"

import { getProductPrice } from "@lib/util/get-product-price"
import { getProductOptionsSummary } from "@lib/util/get-product-options-summary"
import { isProductNew } from "@lib/util/is-product-new"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ProductPreviewCarousel from "./product-preview-carousel"
import PreviewPrice from "./price"
import { getBestSellers } from "@lib/data/best-sellers"
import { getProductsById } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"

export default async function ProductPreview({
  product,
  region,
}: {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
}) {
  const [bestSellers, [pricedProduct]] = await Promise.all([
    getBestSellers({ regionId: region.id, limit: 10 }),
    getProductsById({ ids: [product.id!], regionId: region.id }),
  ])

  if (!pricedProduct) {
    return null
  }

  const { cheapestPrice } = getProductPrice({
    product: pricedProduct,
  })

  const badgeConfig = [
    {
      priority: 1,
      check() {
        return bestSellers.some((p) => p.id === product.id)
      },
      label: "BEST SELLER",
      color: "green" as const,
    },
    {
      priority: 2,
      check() {
        return cheapestPrice?.price_type === "sale"
      },
      label: "SALE",
      color: "red" as const,
    },
    {
      priority: 3,
      check() {
        return isProductNew(product)
      },
      label: "NEW",
      color: "blue" as const,
    },
  ]
  const badge = badgeConfig
    .filter((b) => b.check())
    .sort((a, b) => a.priority - b.priority)[0]

  const optionsSummary = getProductOptionsSummary(product)

  return (
    <LocalizedClientLink href={`/products/${product.handle}`} className="group">
      <div data-testid="product-wrapper" className="space-y-3">
        <div className="relative">
          {badge && (
            <Badge
              size="small"
              color={badge.color}
              className="absolute left-2 top-2 z-10"
            >
              {badge.label}
            </Badge>
          )}
          <ProductPreviewCarousel
            thumbnail={product.thumbnail}
            images={product.images}
            size="full"
          />
        </div>
        <div className="txt-compact-medium justify-between flex flex-col gap-y-0.5">
          <Text className="font-bold" data-testid="product-title">
            {product.title}
          </Text>
          <div className="flex items-center gap-x-2">
            {cheapestPrice && <PreviewPrice price={cheapestPrice} />}
          </div>
          {optionsSummary && (
            <Text className="text-ui-fg-subtle mt-2">{optionsSummary}</Text>
          )}
        </div>
      </div>
    </LocalizedClientLink>
  )
}
