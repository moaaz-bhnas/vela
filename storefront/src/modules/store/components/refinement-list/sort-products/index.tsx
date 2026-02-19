"use client"

import { useTransition } from "react"

import FilterRadioGroup from "@modules/common/components/filter-radio-group"

export type SortOptions =
  | "price_asc"
  | "price_desc"
  | "created_at"
  | "popularity"

type SortProductsProps = {
  sortBy: SortOptions
  setQueryParams: (name: string, value: SortOptions) => void
  "data-testid"?: string
}

const sortOptions = [
  {
    value: "popularity",
    label: "Popularity",
  },
  {
    value: "created_at",
    label: "Latest Arrivals",
  },
  {
    value: "price_asc",
    label: "Price: Low -> High",
  },
  {
    value: "price_desc",
    label: "Price: High -> Low",
  },
]

const SortProducts = ({
  "data-testid": dataTestId,
  sortBy,
  setQueryParams,
}: SortProductsProps) => {
  const [isPending, startTransition] = useTransition()

  const handleChange = (value: string) => {
    startTransition(() => {
      setQueryParams("sortBy", value as SortOptions)
    })
  }

  console.log("[sort-products] isPending", isPending)

  return (
    <FilterRadioGroup
      title="Sort by"
      items={sortOptions}
      value={sortBy}
      handleChange={handleChange}
      isLoading={isPending}
      data-testid={dataTestId}
    />
  )
}

export default SortProducts
