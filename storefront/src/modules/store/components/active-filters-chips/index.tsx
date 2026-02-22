"use client"

import { useMemo } from "react"
import { XMarkMini } from "@medusajs/icons"
import { Badge, IconButton, clx } from "@medusajs/ui"

import type { ProductFilters } from "@lib/util/filter-products"
import type { CategoryInfo } from "@lib/util/filter-products"
import { convertToLocale } from "@lib/util/money"

export type ActiveFiltersChipsProps = {
  filters: ProductFilters
  /** Used to show category names in chips. */
  availableCategories?: CategoryInfo[]
  /** Currency code for formatting price chip (e.g. from region). */
  currencyCode?: string
  /** When false, category chips are hidden (e.g. on category pages). Defaults to true. */
  showCategoryChips?: boolean
  onClearPrice: () => void
  onClearOption: (optionTitle: string, value: string) => void
  onClearCategory: (categoryId: string) => void
}

export default function ActiveFiltersChips({
  filters,
  availableCategories = [],
  currencyCode = "usd",
  showCategoryChips = true,
  onClearPrice,
  onClearOption,
  onClearCategory,
}: ActiveFiltersChipsProps) {
  const optionChips = useMemo(() => {
    const opts = filters.options ?? {}
    return Object.entries(opts).flatMap(([optionTitle, values]) =>
      (values ?? []).map((value) => ({ optionTitle, value }))
    )
  }, [filters.options])

  const categoryChips = useMemo(() => {
    const ids = filters.categoryIds ?? []
    const byId = new Map(availableCategories.map((c) => [c.id, c.name]))
    return ids.map((id) => ({ id, name: byId.get(id) ?? id }))
  }, [filters.categoryIds, availableCategories])

  const priceChipLabel = useMemo(() => {
    const hasPriceFilter =
      filters.priceMin != null || filters.priceMax != null
    if (!hasPriceFilter) return ""
    const min =
      filters.priceMin != null
        ? convertToLocale({
            amount: filters.priceMin,
            currency_code: currencyCode,
          })
        : null
    const max =
      filters.priceMax != null
        ? convertToLocale({
            amount: filters.priceMax,
            currency_code: currencyCode,
          })
        : null
    if (min != null && max != null) return `Price: ${min} – ${max}`
    if (min != null) return `Price: ${min} –`
    if (max != null) return `Price: – ${max}`
    return ""
  }, [filters.priceMin, filters.priceMax, currencyCode])

  const hasPriceFilter = priceChipLabel.length > 0
  const hasActiveFilters =
    hasPriceFilter ||
    optionChips.length > 0 ||
    (showCategoryChips && categoryChips.length > 0)

  if (!hasActiveFilters) return null

  return (
    <div
      className="flex flex-wrap items-center gap-2"
      data-testid="active-filters"
    >
      {hasPriceFilter && (
        <Badge
          className={clx(
            "gap-1 pe-1 py-1 rounded-full",
            "bg-ui-bg-component border border-ui-border-base"
          )}
        >
          <span className="txt-compact-small-plus">{priceChipLabel}</span>
          <IconButton
            type="button"
            variant="transparent"
            size="small"
            className="rounded-full text-ui-fg-muted hover:text-ui-fg-base"
            onClick={onClearPrice}
            aria-label="Clear price filter"
          >
            <XMarkMini />
          </IconButton>
        </Badge>
      )}
      {showCategoryChips &&
        categoryChips.map(({ id, name }) => (
        <Badge
          key={`category-${id}`}
          className={clx(
            "gap-1 pe-1 py-1 rounded-full",
            "bg-ui-bg-component border border-ui-border-base"
          )}
        >
          <span className="txt-compact-small-plus">Category: {name}</span>
          <IconButton
            type="button"
            variant="transparent"
            size="small"
            className="rounded-full text-ui-fg-muted hover:text-ui-fg-base"
            onClick={() => onClearCategory(id)}
            aria-label={`Clear category ${name} filter`}
          >
            <XMarkMini />
          </IconButton>
        </Badge>
      ))}
      {optionChips.map(({ optionTitle, value }) => (
        <Badge
          key={`${optionTitle}-${value}`}
          className={clx(
            "gap-1 pe-1 py-1 rounded-full",
            "bg-ui-bg-component border border-ui-border-base"
          )}
        >
          <span className="txt-compact-small-plus">
            {optionTitle}: {value}
          </span>
          <IconButton
            type="button"
            variant="transparent"
            size="small"
            className="rounded-full text-ui-fg-muted hover:text-ui-fg-base"
            onClick={() => onClearOption(optionTitle, value)}
            aria-label={`Clear ${optionTitle} ${value} filter`}
          >
            <XMarkMini />
          </IconButton>
        </Badge>
      ))}
    </div>
  )
}
