"use client"

import { Input, Text } from "@medusajs/ui"

type FilterPriceRangeProps = {
  priceMin?: number
  priceMax?: number
  onChange: (min?: number, max?: number) => void
  "data-testid"?: string
}

const FilterPriceRange = ({
  priceMin,
  priceMax,
  onChange,
  "data-testid": dataTestId,
}: FilterPriceRangeProps) => {
  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    const num = raw === "" ? undefined : Number(raw)
    onChange(Number.isFinite(num) ? num : undefined, priceMax)
  }

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    const num = raw === "" ? undefined : Number(raw)
    onChange(priceMin, Number.isFinite(num) ? num : undefined)
  }

  return (
    <div className="flex gap-x-3 flex-col gap-y-3" data-testid={dataTestId}>
      <Text className="txt-compact-small-plus text-ui-fg-muted">Price</Text>
      <div className="flex gap-2 items-center">
        <Input
          type="number"
          min={0}
          step={1}
          placeholder="Min"
          value={priceMin ?? ""}
          onChange={handleMinChange}
          size="small"
          className="w-full"
          aria-label="Minimum price"
        />
        <span className="txt-compact-small text-ui-fg-muted">–</span>
        <Input
          type="number"
          min={0}
          step={1}
          placeholder="Max"
          value={priceMax ?? ""}
          onChange={handleMaxChange}
          size="small"
          className="w-full"
          aria-label="Maximum price"
        />
      </div>
    </div>
  )
}

export default FilterPriceRange
