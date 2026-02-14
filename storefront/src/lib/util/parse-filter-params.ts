import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import type { ProductFilters } from "./filter-products"

/** Reserved query keys for store/collection/category list pages. Option filters use any other key (e.g. Size, Color). */
export type StoreSearchParams = {
  sortBy?: SortOptions
  page?: string
  priceMin?: string
  priceMax?: string
  [key: string]: string | string[] | undefined
}

const RESERVED_PARAMS = new Set(["sortBy", "page", "priceMin", "priceMax"])

/**
 * Parses URL searchParams into ProductFilters for store/collection/category pages and getProductsListWithSort.
 */
export function searchParamsToProductFilters(
  searchParams: StoreSearchParams
): ProductFilters {
  const selectedOptions: Record<string, string[]> = {}
  const priceMin = parsePrice(searchParams.priceMin)
  const priceMax = parsePrice(searchParams.priceMax)

  // Extract option filters (any params not in RESERVED_PARAMS)
  for (const [key, value] of Object.entries(searchParams)) {
    if (RESERVED_PARAMS.has(key)) continue

    const optionValues = parseOptionValues(value)
    if (optionValues.length > 0) {
      selectedOptions[key] = optionValues
    }
  }

  return {
    priceMin,
    priceMax,
    options:
      Object.keys(selectedOptions).length > 0 ? selectedOptions : undefined,
  }
}

function parsePrice(value: string | string[] | undefined): number | undefined {
  if (value == null) return undefined

  const numberString = typeof value === "string" ? value : value[0]
  const parsed = Number(numberString)

  return Number.isFinite(parsed) ? parsed : undefined
}

function parseOptionValues(value: string | string[] | undefined): string[] {
  const raw = typeof value === "string" ? value : value?.[0]
  if (!raw) return []

  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
}
