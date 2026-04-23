"use client"

import { Button } from "@medusajs/ui"
import { HttpTypes } from "@medusajs/types"
import { useParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { useEffect, useMemo, useRef, useState } from "react"

import { addToCart } from "@lib/data/cart"
import { useInView } from "@lib/hooks/use-in-view"
import { useProductOptions } from "@lib/hooks/use-product-options"
import { getCountryCodeFromLocale } from "@lib/util/locale"

import ErrorMessage from "@modules/checkout/components/error-message"
import Divider from "@modules/common/components/divider"
import OptionSelect from "@modules/products/components/product-actions/option-select"

import MobileActions from "./mobile-actions"
import ProductPrice from "../product-price"

type ProductActionsProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  disabled?: boolean
}

export default function ProductActions({
  product,
  region,
  disabled,
}: ProductActionsProps) {
  const t = useTranslations("Product")
  const { options, setOptionValue, selectedVariant } =
    useProductOptions(product)
  const [isAdding, setIsAdding] = useState(false)
  const [addToCartError, setAddToCartError] = useState<string | null>(null)
  const locale = useParams().locale as string
  const countryCode = getCountryCodeFromLocale(locale)

  // If there is only 1 variant, preselect all its options via URL on mount
  useEffect(
    () =>
      function preselectOptions() {
        if (
          product.variants?.length === 1 &&
          Object.values(options).every((v) => v == null)
        ) {
          const singleVariant = product.variants[0]
          ;(singleVariant.options ?? []).forEach((opt) => {
            const title = opt.option?.title
            const value = opt.value
            if (title && value) setOptionValue(title, value)
          })
        }
        // Only run once on mount
        // eslint-disable-next-line react-hooks/exhaustive-deps
      },
    []
  )

  // check if the selected variant is in stock
  const inStock = useMemo(() => {
    // If we don't manage inventory, we can always add to cart
    if (selectedVariant && !selectedVariant.manage_inventory) {
      return true
    }

    // If we allow back orders on the variant, we can add to cart
    if (selectedVariant?.allow_backorder) {
      return true
    }

    // If there is inventory available, we can add to cart
    if (
      selectedVariant?.manage_inventory &&
      (selectedVariant?.inventory_quantity || 0) > 0
    ) {
      return true
    }

    // Otherwise, we can't add to cart
    return false
  }, [selectedVariant])

  const actionsRef = useRef<HTMLDivElement>(null)

  const inView = useInView(actionsRef, "0px")

  useEffect(
    function clearAddToCartErrorOnVariantChange() {
      setAddToCartError(null)
    },
    [selectedVariant?.id]
  )

  // add the selected variant to the cart
  const handleAddToCart = async () => {
    if (!selectedVariant?.id) return null

    setAddToCartError(null)
    setIsAdding(true)
    try {
      await addToCart({
        variantId: selectedVariant.id,
        quantity: 1,
        countryCode,
      })
    } catch (err: unknown) {
      const message =
        err instanceof Error && err.message
          ? err.message
          : t("addToCartError")
      setAddToCartError(message)
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <>
      <div className="flex flex-col gap-y-2" ref={actionsRef}>
        <div>
          {(product.variants?.length ?? 0) > 1 && (
            <div className="flex flex-col gap-y-4">
              {(product.options || []).map((option) => {
                return (
                  <div key={option.id}>
                    <OptionSelect
                      option={option}
                      current={
                        options[(option.title ?? "").toLowerCase()] ?? undefined
                      }
                      updateOption={setOptionValue}
                      title={option.title ?? ""}
                      data-testid="product-options"
                      disabled={!!disabled || isAdding}
                    />
                  </div>
                )
              })}
              <Divider />
            </div>
          )}
        </div>

        <ProductPrice product={product} variant={selectedVariant} />

        <Button
          onClick={handleAddToCart}
          disabled={!inStock || !selectedVariant || !!disabled || isAdding}
          variant="primary"
          className="w-full h-10"
          isLoading={isAdding}
          data-testid="add-product-button"
        >
          {!selectedVariant
            ? t("selectVariant")
            : !inStock
            ? t("outOfStock")
            : t("addToCart")}
        </Button>
        <ErrorMessage
          error={addToCartError}
          data-testid="add-to-cart-error-message"
        />
        <MobileActions
          product={product}
          variant={selectedVariant}
          options={options}
          updateOptions={setOptionValue}
          inStock={inStock}
          handleAddToCart={handleAddToCart}
          isAdding={isAdding}
          show={!inView}
          optionsDisabled={!!disabled || isAdding}
        />
      </div>
    </>
  )
}
