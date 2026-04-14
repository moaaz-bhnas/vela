import { clx } from "@medusajs/ui"

import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"

export default function ProductPrice({
  product,
  variant,
}: {
  product: HttpTypes.StoreProduct
  variant?: HttpTypes.StoreProductVariant
}) {
  const { cheapestPrice, variantPrice } = getProductPrice({
    product,
    variantId: variant?.id,
  })

  const selectedPrice = variant ? variantPrice : cheapestPrice

  if (!selectedPrice) {
    return <div className="block w-32 h-9 bg-ui-bg-subtle animate-pulse" />
  }

  return (
    <div className="flex flex-col gap-1 text-ui-fg-base">
      <span
        className={clx("text-2xl leading-[36px] font-semibold", {
          "text-ui-fg-interactive": selectedPrice.price_type === "sale",
        })}
      >
        {!variant && "From "}
        <span
          data-testid="product-price"
          data-value={selectedPrice.calculated_price_number}
        >
          {selectedPrice.calculated_price}
        </span>
        {selectedPrice.price_type === "sale" && (
          <span className="sr-only">, sale price</span>
        )}
      </span>
      {selectedPrice.price_type === "sale" && (
        <p className="text-sm leading-5 text-ui-fg-subtle">
          <span className="sr-only">Originally </span>
          <span
            className="line-through"
            data-testid="original-product-price"
            data-value={selectedPrice.original_price_number}
          >
            {selectedPrice.original_price}
          </span>
          <span className="text-ui-fg-interactive ms-2" aria-label={`Save ${selectedPrice.percentage_diff} percent`}>
            −{selectedPrice.percentage_diff}%
          </span>
        </p>
      )}
    </div>
  )
}
