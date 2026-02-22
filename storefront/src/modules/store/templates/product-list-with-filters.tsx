"use client"

import { useMemo, useCallback, type ReactNode } from "react"
import {
  useQueryStates,
  parseAsStringLiteral,
  parseAsInteger,
  parseAsString,
} from "nuqs"
import { HttpTypes } from "@medusajs/types"

import type { StoreProductsForClient } from "@lib/data/products"
import type { ProductFilters } from "@lib/util/filter-products"
import { filterProducts, getOptionValueCounts } from "@lib/util/filter-products"
import { sortProducts } from "@lib/util/sort-products"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import ActiveFiltersChips from "@modules/store/components/active-filters-chips"
import RefinementList from "@modules/store/components/refinement-list"
import ListingHeader from "@modules/common/components/listing-header"
import Container from "@modules/common/components/container-section"
import ProductPreview from "@modules/products/components/product-preview"
import { Pagination } from "@modules/store/components/pagination"

const PRODUCT_LIMIT = 12

const sortOptions = [
  "price_asc",
  "price_desc",
  "created_at",
  "popularity",
] as const

export const productListParsers = {
  sortBy: parseAsStringLiteral(sortOptions).withDefault("popularity"),
  page: parseAsInteger.withDefault(1),
  priceMin: parseAsInteger,
  priceMax: parseAsInteger,
  options: parseAsString,
}

export function parseOptionsOptions(
  value: string | null
): Record<string, string[]> {
  if (!value) return {}
  try {
    const parsed = JSON.parse(value) as unknown
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      const result: Record<string, string[]> = {}
      for (const [k, v] of Object.entries(parsed)) {
        if (typeof k === "string" && Array.isArray(v)) {
          result[k] = v.filter((x): x is string => typeof x === "string")
        }
      }
      return result
    }
  } catch {
    // ignore
  }
  return {}
}

export type ProductListWithFiltersProps = {
  initialData: StoreProductsForClient
  title: string
  titleTestId?: string
  containerTestId: string
  /** Rendered before the listing header (e.g. breadcrumbs). */
  headerExtra?: ReactNode
  /** Rendered after the listing header, before the product grid (e.g. description, child links). */
  contentAfterHeader?: ReactNode
  /** Currency code for formatting price filter chips (e.g. from region). Defaults to "usd". */
  currencyCode?: string
}

export default function ProductListWithFilters({
  initialData,
  title,
  titleTestId,
  containerTestId,
  headerExtra,
  contentAfterHeader,
  currencyCode = "usd",
}: ProductListWithFiltersProps) {
  const [queryState, setQueryState] = useQueryStates(productListParsers)

  const { sortBy, page, priceMin, priceMax, options: optionsStr } = queryState

  const filters: ProductFilters = useMemo(
    () => ({
      priceMin: priceMin ?? undefined,
      priceMax: priceMax ?? undefined,
      options: (() => {
        const opts = parseOptionsOptions(optionsStr)
        return Object.keys(opts).length > 0 ? opts : undefined
      })(),
    }),
    [priceMin, priceMax, optionsStr]
  )

  const { products: filteredProducts, count: filteredCount } = useMemo(
    () => filterProducts(initialData.products, filters),
    [initialData.products, filters]
  )

  const sortedProducts = useMemo(
    () => sortProducts([...filteredProducts], sortBy as SortOptions),
    [filteredProducts, sortBy]
  )

  const pageStart = (page - 1) * PRODUCT_LIMIT
  const paginatedProducts = useMemo(
    () => sortedProducts.slice(pageStart, pageStart + PRODUCT_LIMIT),
    [sortedProducts, pageStart]
  )

  const totalPages = Math.max(1, Math.ceil(filteredCount / PRODUCT_LIMIT))
  const optionValueCounts = useMemo(
    () => getOptionValueCounts(initialData.products, filters),
    [initialData.products, filters]
  )

  const onSortChange = useCallback(
    (value: SortOptions) => {
      setQueryState({ sortBy: value, page: 1 })
    },
    [setQueryState]
  )

  const onPriceRangeChange = useCallback(
    (min?: number, max?: number) => {
      setQueryState({
        priceMin: min ?? null,
        priceMax: max ?? null,
        page: 1,
      })
    },
    [setQueryState]
  )

  const onOptionFilterChange = useCallback(
    (optionTitle: string, values: string[]) => {
      const next = { ...parseOptionsOptions(optionsStr) }
      if (values.length > 0) {
        next[optionTitle] = values
      } else {
        delete next[optionTitle]
      }
      setQueryState({
        options: Object.keys(next).length > 0 ? JSON.stringify(next) : null,
        page: 1,
      })
    },
    [optionsStr, setQueryState]
  )

  const onPageChange = useCallback(
    (newPage: number) => {
      setQueryState({ page: newPage })
    },
    [setQueryState]
  )

  const refinementListProps = {
    sortBy: sortBy as SortOptions,
    availableOptions: initialData.availableOptions,
    optionValueCounts,
    priceBounds: initialData.priceBounds,
    filters,
    currencyCode,
    onSortChange,
    onPriceRangeChange,
    onOptionFilterChange,
  }

  return (
    <Container
      className="flex flex-col small:flex-row small:items-start gap-section-inner-lg pt-0 small:pt-section-y-lg"
      data-testid={containerTestId}
    >
      <div className="hidden small:block small:w-80">
        <RefinementList {...refinementListProps} />
      </div>
      <div className="w-full flex flex-col gap-section-inner sm:gap-section-inner-lg">
        {headerExtra}
        <ListingHeader
          title={title}
          count={filteredCount}
          titleTestId={titleTestId}
          filterDrawerContent={
            <RefinementList
              {...refinementListProps}
              data-testid="filter-sidebar-refinement-list"
            />
          }
        />
        {contentAfterHeader}
        <ActiveFiltersChips
          filters={filters}
          currencyCode={currencyCode}
          onClearPrice={() => onPriceRangeChange(undefined, undefined)}
          onClearOption={(optionTitle, value) => {
            const current =
              parseOptionsOptions(optionsStr)[optionTitle] ?? []
            onOptionFilterChange(
              optionTitle,
              current.filter((v) => v !== value)
            )
          }}
        />
        <ul
          className="grid grid-cols-2 w-full small:grid-cols-3 gap-x-6 gap-y-8"
          data-testid="products-list"
        >
          {paginatedProducts.map((p: HttpTypes.StoreProduct) => (
            <li key={p.id}>
              <ProductPreview product={p} />
            </li>
          ))}
        </ul>
        {totalPages > 1 && (
          <Pagination
            data-testid="product-pagination"
            page={page}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        )}
      </div>
    </Container>
  )
}
