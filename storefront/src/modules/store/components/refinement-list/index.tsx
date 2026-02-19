"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
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
  "data-testid"?: string
}

const RefinementList = ({
  sortBy,
  availableOptions = {},
  optionValueCounts = {},
  priceBounds,
  filters,
  "data-testid": dataTestId,
}: RefinementListProps) => {
  const selectedOptions = filters?.options ?? {}
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const setQueryParams = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams)
      params.set(name, value)
      router.push(`${pathname}?${params.toString()}`)
    },
    [pathname, router, searchParams]
  )

  const updateParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams)
      for (const [key, val] of Object.entries(updates)) {
        if (val === undefined || val === "") params.delete(key)
        else params.set(key, val)
      }
      router.push(`${pathname}?${params.toString()}`)
    },
    [pathname, router, searchParams]
  )

  const setPriceRange = useCallback(
    (min?: number, max?: number) => {
      updateParams({
        priceMin: min != null ? String(min) : undefined,
        priceMax: max != null ? String(max) : undefined,
        page: "1",
      })
    },
    [updateParams]
  )

  const setOptionFilter = useCallback(
    (optionTitle: string, values: string[]) => {
      const paramValue = values.length > 0 ? values.join(",") : undefined
      updateParams({ [optionTitle]: paramValue, page: "1" })
    },
    [updateParams]
  )

  const handleOptionToggle = useCallback(
    (optionTitle: string, value: string) => {
      const current = selectedOptions[optionTitle] ?? []
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value]
      setOptionFilter(optionTitle, next)
    },
    [selectedOptions, setOptionFilter]
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
        setQueryParams={setQueryParams}
        data-testid={dataTestId}
      />

      <Divider className="m-0" />

      <FilterPriceRange
        priceMin={filters?.priceMin}
        priceMax={filters?.priceMax}
        priceBounds={priceBounds}
        onChange={setPriceRange}
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
