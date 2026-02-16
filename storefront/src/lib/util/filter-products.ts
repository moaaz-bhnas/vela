import { HttpTypes } from "@medusajs/types"

export type ProductFilters = {
  priceMin?: number
  priceMax?: number
  options?: Record<string, string[]>
}

type VariantOption = {
  option?: { title?: string }
  value?: string
}

/**
 * Returns the minimum variant price for a product (for filtering/sorting).
 */
export function getProductMinPrice(
  product: HttpTypes.StoreProduct
): number | undefined {
  if (!product.variants?.length) return undefined

  const prices = product.variants.map(
    (variant) => variant?.calculated_price?.calculated_amount ?? Infinity
  )
  const minPrice = Math.min(...prices)

  return minPrice === Infinity ? undefined : minPrice
}

/**
 * Returns the maximum variant price for a product.
 */
export function getProductMaxPrice(
  product: HttpTypes.StoreProduct
): number | undefined {
  if (!product.variants?.length) return undefined

  const prices = product.variants.map(
    (variant) => variant?.calculated_price?.calculated_amount ?? -Infinity
  )
  const maxPrice = Math.max(...prices)

  return maxPrice === -Infinity ? undefined : maxPrice
}

/**
 * Returns the min and max price across all products (for price range filter UI).
 */
export function getPriceBounds(
  products: HttpTypes.StoreProduct[]
): { min: number; max: number } | undefined {
  let min = Infinity
  let max = -Infinity

  for (const product of products) {
    const pMin = getProductMinPrice(product)
    const pMax = getProductMaxPrice(product)
    if (pMin != null && pMin < min) min = pMin
    if (pMax != null && pMax > max) max = pMax
  }

  if (min === Infinity || max === -Infinity || min > max) return undefined
  return { min, max }
}

function productMatchesOptions(
  product: HttpTypes.StoreProduct,
  optionsFilter: Record<string, string[]>
): boolean {
  const activeFilters = Object.entries(optionsFilter).filter(
    ([, values]) => values.length > 0
  )
  if (activeFilters.length === 0) return true

  const hasMatchingVariant = product.variants?.some((variant) => {
    const variantOptions = buildVariantOptionsMap(variant.options ?? [])

    return activeFilters.every(([optionTitle, selectedValues]) => {
      const variantValue = variantOptions.get(optionTitle)
      return variantValue != null && selectedValues.includes(variantValue)
    })
  })

  return Boolean(hasMatchingVariant)
}

function buildVariantOptionsMap(options: unknown[]): Map<string, string> {
  const optionMap = new Map<string, string>()

  for (const option of options as VariantOption[]) {
    const title = option.option?.title
    const value = option.value

    if (title != null && value != null) {
      optionMap.set(title, value)
    }
  }

  return optionMap
}

function productMatchesPriceRange(
  product: HttpTypes.StoreProduct,
  filters: ProductFilters
): boolean {
  const minPrice = getProductMinPrice(product)

  if (
    filters.priceMin != null &&
    (minPrice == null || minPrice < filters.priceMin)
  ) {
    return false
  }

  if (
    filters.priceMax != null &&
    (minPrice == null || minPrice > filters.priceMax)
  ) {
    return false
  }

  return true
}

/**
 * Filters products by price range and option values (e.g. size, color).
 * Pure: does not mutate products. Count = filtered length.
 */
export function filterProducts<T extends HttpTypes.StoreProduct>(
  products: T[],
  filters: ProductFilters
): { products: T[]; count: number } {
  const hasOptionFilters =
    filters.options && Object.keys(filters.options).length > 0
  const hasAnyFilters =
    filters.priceMin != null || filters.priceMax != null || hasOptionFilters

  if (!hasAnyFilters) {
    return { products: [...products], count: products.length }
  }

  const filtered = products.filter((product) => {
    if (!productMatchesPriceRange(product, filters)) return false
    if (hasOptionFilters && !productMatchesOptions(product, filters.options!))
      return false
    return true
  })

  return { products: filtered, count: filtered.length }
}

/**
 * Returns result counts per option value for the current filters.
 * Count = number of products that match filters and have at least one variant with that value.
 */
export function getOptionValueCounts(
  products: HttpTypes.StoreProduct[],
  filters: ProductFilters
): Record<string, Record<string, number>> {
  const { products: filtered } = filterProducts(products, filters)
  const counts: Record<string, Record<string, number>> = {}

  for (const product of filtered) {
    const productOptionsSeen = new Map<string, Set<string>>()

    for (const variant of product.variants ?? []) {
      for (const option of variant.options ?? []) {
        const title = option.option?.title
        const value = option.value

        if (title == null || value == null) continue

        // Initialize counts structure if needed
        if (!counts[title]) counts[title] = {}

        // Only count each option value once per product
        const seenValues = productOptionsSeen.get(title)
        if (!seenValues?.has(value)) {
          if (!productOptionsSeen.has(title)) {
            productOptionsSeen.set(title, new Set())
          }
          productOptionsSeen.get(title)!.add(value)
          counts[title][value] = (counts[title][value] ?? 0) + 1
        }
      }
    }
  }

  return counts
}
