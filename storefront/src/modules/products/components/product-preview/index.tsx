import { Badge, Text } from "@medusajs/ui"
import { HttpTypes } from "@medusajs/types"

import { getProductPrice } from "@lib/util/get-product-price"
import { getProductOptionsSummary } from "@lib/util/get-product-options-summary"
import { isProductNew } from "@lib/util/is-product-new"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import PreviewPrice from "./price"
import ProductPreviewCarousel from "./product-preview-carousel"

export default function ProductPreview({
  product,
  isBestSeller,
}: {
  product: HttpTypes.StoreProduct
  isBestSeller?: boolean
}) {
  const { cheapestPrice } = getProductPrice({ product })
  const optionsSummary = getProductOptionsSummary(product)
  const isNew = isProductNew(product)

  const showSale = cheapestPrice?.price_type === "sale"
  const badge = isBestSeller
    ? { label: "BEST SELLER", color: "green" as const }
    : showSale
    ? { label: "SALE", color: "red" as const }
    : isNew
    ? { label: "NEW", color: "blue" as const }
    : null

  return (
    <LocalizedClientLink href={`/products/${product.handle}`} className="group">
      <div data-testid="product-wrapper" className="space-y-3">
        <div className="relative">
          {badge && (
            <Badge
              size="small"
              color={badge.color}
              className="absolute start-2 top-2 z-10"
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
