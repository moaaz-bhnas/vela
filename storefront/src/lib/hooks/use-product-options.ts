"use client"

import { useMemo } from "react"
import { useQueryStates, parseAsString } from "nuqs"
import { isEqual } from "lodash"
import { HttpTypes } from "@medusajs/types"

export type ProductOptions = Record<string, string | undefined>

type StoreProduct = HttpTypes.StoreProduct
type StoreProductVariant = HttpTypes.StoreProductVariant

function buildParsers(product: StoreProduct) {
  return Object.fromEntries(
    (product.options ?? []).map((opt) => [
      (opt.title ?? "").toLowerCase(),
      parseAsString,
    ])
  ) as Record<string, typeof parseAsString>
}

function normalizeOptions(raw: Record<string, string | null>): ProductOptions {
  return Object.fromEntries(
    Object.entries(raw).map(([key, value]) => [key, value ?? undefined])
  )
}

function buildVariantOptionMap(
  variant: StoreProductVariant
): Record<string, string> {
  return Object.fromEntries(
    (variant.options ?? [])
      .filter((o) => o.option && o.value != null)
      .map((o) => [(o.option!.title ?? "").toLowerCase(), o.value])
  )
}

function getActiveOptions(options: ProductOptions): Record<string, string> {
  return Object.fromEntries(
    Object.entries(options).filter(([, val]) => val != null)
  ) as Record<string, string>
}

function findMatchingVariant(
  variants: StoreProductVariant[],
  options: ProductOptions
): StoreProductVariant | undefined {
  const activeOptions = getActiveOptions(options)
  return variants.find((variant) => {
    const variantMap = buildVariantOptionMap(variant)
    return isEqual(variantMap, activeOptions)
  })
}

export function useProductOptions(product: StoreProduct) {
  const parsers = useMemo(
    () => buildParsers(product),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [product.id]
  )

  const [rawOptions, setOptions] = useQueryStates(parsers, { shallow: true })

  const options = useMemo(() => normalizeOptions(rawOptions), [rawOptions])

  function setOptionValue(title: string, value: string) {
    void setOptions({ [title.toLowerCase()]: value })
  }

  const selectedVariant = useMemo(
    () => findMatchingVariant(product.variants ?? [], options),
    [product.variants, options]
  )

  return { options, setOptionValue, selectedVariant }
}
