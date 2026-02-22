"use client"

import { useCallback } from "react"

import type { ProductFilters } from "@lib/util/filter-products"
import FilterOptionCheckboxes from "./filter-option-checkboxes"
import FilterPriceRange from "./filter-price-range"
import SortProducts, { SortOptions } from "./sort-products"
import Divider from "@modules/common/components/divider"

type RefinementListProps = {
  sortBy: SortOptions
  search?: boolean
  availableOptions?: Record<string, string[]>
  optionValueCounts?: Record<string, Record<string, number>>
  priceBounds?: { min: number; max: number }
  filters?: ProductFilters
  /** Currency code for the price range filter (e.g. from region). Defaults to "usd". */
  currencyCode?: string
  onSortChange: (value: SortOptions) => void
  onPriceRangeChange: (min?: number, max?: number) => void
  onOptionFilterChange: (optionTitle: string, values: string[]) => void
  "data-testid"?: string
}

const RefinementList = ({
  sortBy,
  availableOptions = {},
  optionValueCounts = {},
  priceBounds,
  filters,
  currencyCode = "usd",
  onSortChange,
  onPriceRangeChange,
  onOptionFilterChange,
  "data-testid": dataTestId,
}: RefinementListProps) => {
  const selectedOptions = filters?.options ?? {}

  const handleOptionToggle = useCallback(
    (optionTitle: string, value: string) => {
      const current = selectedOptions[optionTitle] ?? []
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value]
      onOptionFilterChange(optionTitle, next)
    },
    [selectedOptions, onOptionFilterChange]
  )

  const optionTitles = Object.keys(availableOptions).filter((title) => {
    const counts = optionValueCounts[title]
    const allValues = availableOptions[title] ?? []
    return allValues.some(
      (v) =>
        (counts?.[v] ?? 0) > 0 || (selectedOptions[title] ?? []).includes(v)
    )
  })

  const getValuesWithProducts = (title: string) => {
    const allValues = availableOptions[title] ?? []
    const counts = optionValueCounts[title]
    const selected = selectedOptions[title] ?? []
    return allValues.filter(
      (v) => (counts?.[v] ?? 0) > 0 || selected.includes(v)
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <SortProducts
        sortBy={sortBy}
        onSortChange={onSortChange}
        data-testid={dataTestId}
      />

      <Divider className="m-0" />

      <FilterPriceRange
        priceMin={filters?.priceMin}
        priceMax={filters?.priceMax}
        priceBounds={priceBounds}
        currencyCode={currencyCode}
        onChange={onPriceRangeChange}
        data-testid="filter-price-range"
      />
      {optionTitles.map((title) => (
        <FilterOptionCheckboxes
          key={title}
          optionTitle={title}
          values={getValuesWithProducts(title)}
          selectedValues={selectedOptions[title] ?? []}
          valueCounts={optionValueCounts[title]}
          onToggle={(value) => handleOptionToggle(title, value)}
          data-testid={`filter-options-${title}`}
        />
      ))}
    </div>
  )
}

export default RefinementList
