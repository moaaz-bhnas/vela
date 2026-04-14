"use client"

import { useCallback, useMemo } from "react"

import type { ProductFilters } from "@lib/util/filter-products"
import type { CategoryInfo } from "@lib/util/filter-products"
import FilterOptionCheckboxes from "./filter-option-checkboxes"
import FilterPriceRange from "./filter-price-range"
import SortProducts, { SortOptions } from "./sort-products"
import Divider from "@modules/common/components/divider"
import { Text, Label, Checkbox, clx } from "@medusajs/ui"

type RefinementListProps = {
  sortBy: SortOptions
  /** When false, the sort dropdown is hidden (e.g. on best sellers). Defaults to true. */
  showSortOptions?: boolean
  search?: boolean
  availableOptions?: Record<string, string[]>
  optionValueCounts?: Record<string, Record<string, number>>
  priceBounds?: { min: number; max: number }
  availableCategories?: CategoryInfo[]
  categoryCounts?: Record<string, number>
  filters?: ProductFilters
  /** Currency code for the price range filter (e.g. from region). Defaults to "usd". */
  currencyCode?: string
  onSortChange: (value: SortOptions) => void
  onPriceRangeChange: (min?: number, max?: number) => void
  onOptionFilterChange: (optionTitle: string, values: string[]) => void
  onCategoryFilterChange: (categoryIds: string[]) => void
  "data-testid"?: string
}

const RefinementList = ({
  sortBy,
  showSortOptions = true,
  availableOptions = {},
  optionValueCounts = {},
  priceBounds,
  availableCategories = [],
  categoryCounts = {},
  filters,
  currencyCode = "usd",
  onSortChange,
  onPriceRangeChange,
  onOptionFilterChange,
  onCategoryFilterChange,
  "data-testid": dataTestId,
}: RefinementListProps) => {
  const selectedOptions = useMemo(
    () => filters?.options ?? {},
    [filters]
  )
  const selectedCategoryIds = useMemo(
    () => filters?.categoryIds ?? [],
    [filters]
  )

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

  const handleCategoryToggle = useCallback(
    (categoryId: string) => {
      const next = selectedCategoryIds.includes(categoryId)
        ? selectedCategoryIds.filter((id) => id !== categoryId)
        : [...selectedCategoryIds, categoryId]
      onCategoryFilterChange(next)
    },
    [selectedCategoryIds, onCategoryFilterChange]
  )

  const categoriesToShow = availableCategories.filter(
    (c) => (categoryCounts[c.id] ?? 0) > 0 || selectedCategoryIds.includes(c.id)
  )

  return (
    <div className="flex flex-col gap-stack">
      {showSortOptions && (
        <>
          <SortProducts
            sortBy={sortBy}
            onSortChange={onSortChange}
            data-testid={dataTestId}
          />
          <Divider className="m-0" />
        </>
      )}
      <FilterPriceRange
        priceMin={filters?.priceMin}
        priceMax={filters?.priceMax}
        priceBounds={priceBounds}
        currencyCode={currencyCode}
        onChange={onPriceRangeChange}
        data-testid="filter-price-range"
      />
      {categoriesToShow.length > 0 && (
        <>
          <Divider className="m-0" />
          <div
            className="flex gap-x-3 flex-col gap-y-3"
            data-testid="filter-categories"
          >
            <Text className="txt-compact-small-plus text-ui-fg-muted">
              Category
            </Text>
            <div className="flex flex-col gap-y-2">
              {categoriesToShow.map((category) => {
                const checked = selectedCategoryIds.includes(category.id)
                const count = categoryCounts[category.id]
                const hasCount = count !== undefined
                const label = hasCount
                  ? `${category.name} (${count})`
                  : category.name
                const id = `filter-category-${category.id}`

                return (
                  <div key={category.id} className="flex gap-x-2 items-center">
                    <Checkbox
                      id={id}
                      checked={checked}
                      onCheckedChange={() => handleCategoryToggle(category.id)}
                      className="flex items-center gap-x-2"
                      data-testid={`category-checkbox-${category.id}`}
                    />
                    <Label
                      htmlFor={id}
                      className={clx(
                        "!txt-compact-small !transform-none cursor-pointer",
                        count === 0
                          ? "text-ui-fg-muted"
                          : "text-ui-fg-subtle hover:text-ui-fg-base"
                      )}
                      data-testid="category-label"
                    >
                      {label}
                    </Label>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}
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
