import { Text } from "@medusajs/ui"

import { getProductPrice } from "@lib/util/get-product-price"
import { getProductOptionsSummary } from "@lib/util/get-product-options-summary"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "../thumbnail"
import PreviewPrice from "./price"
import { getProductsById } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"

export default async function ProductPreview({
  product,
  isFeatured,
  region,
}: {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  region: HttpTypes.StoreRegion
}) {
  const [pricedProduct] = await getProductsById({
    ids: [product.id!],
    regionId: region.id,
  })

  if (!pricedProduct) {
    return null
  }

  const { cheapestPrice } = getProductPrice({
    product: pricedProduct,
  })

  const optionsSummary = getProductOptionsSummary(product)

  return (
    <LocalizedClientLink href={`/products/${product.handle}`} className="group">
      <div data-testid="product-wrapper" className="space-y-4">
        <Thumbnail
          thumbnail={product.thumbnail}
          images={product.images}
          size="full"
          isFeatured={isFeatured}
        />
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
