"use client"

import * as Slider from "@radix-ui/react-slider"
import { CurrencyInput, Text } from "@medusajs/ui"

type FilterPriceRangeProps = {
  priceMin?: number
  priceMax?: number
  /** Min/max from product data; when set, shows the range slider. */
  priceBounds?: { min: number; max: number }
  /** Currency for the inputs (e.g. "usd"). Defaults to "usd". */
  currencyCode?: string
  /** Currency symbol for the inputs (e.g. "$"). Defaults to "$". */
  symbol?: string
  onChange: (min?: number, max?: number) => void
  "data-testid"?: string
}

const FilterPriceRange = ({
  priceMin,
  priceMax,
  priceBounds,
  currencyCode = "usd",
  symbol = "$",
  onChange,
  "data-testid": dataTestId,
}: FilterPriceRangeProps) => {
  const hasBounds =
    priceBounds != null &&
    Number.isFinite(priceBounds.min) &&
    Number.isFinite(priceBounds.max) &&
    priceBounds.min <= priceBounds.max

  const toDisplayValue = (amount: number | undefined): string | undefined =>
    amount != null ? String(amount) : undefined

  const fromDisplayValue = (value: string | undefined): number | undefined => {
    if (value === undefined || value === "") return undefined
    const num = parseFloat(value)
    return Number.isFinite(num) ? num : undefined
  }

  const handleMinChange = (value: string | undefined) => {
    onChange(fromDisplayValue(value) ?? undefined, priceMax)
  }

  const handleMaxChange = (value: string | undefined) => {
    onChange(priceMin, fromDisplayValue(value) ?? undefined)
  }

  const sliderMin = hasBounds ? priceBounds.min : 0
  const sliderMax = hasBounds ? priceBounds.max : 100
  const sliderValue: [number, number] = [
    priceMin ?? sliderMin,
    priceMax ?? sliderMax,
  ]

  const handleSliderChange = (value: number[]) => {
    const [min, max] = value
    onChange(
      min > sliderMin ? min : undefined,
      max < sliderMax ? max : undefined
    )
  }

  return (
    <div className="flex flex-col gap-y-3" data-testid={dataTestId}>
      <Text className="txt-compact-small-plus text-ui-fg-muted">Price</Text>

      {hasBounds && (
        <Slider.Root
          className="relative flex w-full touch-none select-none items-center"
          min={sliderMin}
          max={sliderMax}
          step={1}
          value={sliderValue}
          onValueChange={handleSliderChange}
          minStepsBetweenThumbs={0}
          aria-label="Price range"
        >
          <Slider.Track className="relative h-2 w-full grow rounded-full bg-ui-bg-component">
            <Slider.Range className="absolute h-full rounded-full bg-ui-fg-base" />
          </Slider.Track>
          <Slider.Thumb className="block h-4 w-4 rounded-full border border-ui-border-base bg-ui-bg-base shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-ui-fg-interactive" />
          <Slider.Thumb className="block h-4 w-4 rounded-full border border-ui-border-base bg-ui-bg-base shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-ui-fg-interactive" />
        </Slider.Root>
      )}

      <div className="flex gap-2 items-center">
        <CurrencyInput
          symbol={symbol}
          code={currencyCode}
          size="small"
          value={toDisplayValue(priceMin) ?? ""}
          onValueChange={handleMinChange}
          min={hasBounds ? sliderMin : undefined}
          max={hasBounds ? sliderMax : undefined}
          aria-label="Minimum price"
        />
        <span className="txt-compact-small text-ui-fg-muted">–</span>
        <CurrencyInput
          symbol={symbol}
          code={currencyCode}
          size="small"
          value={toDisplayValue(priceMax) ?? ""}
          onValueChange={handleMaxChange}
          min={hasBounds ? sliderMin : undefined}
          max={hasBounds ? sliderMax : undefined}
          aria-label="Maximum price"
        />
      </div>
    </div>
  )
}

export default FilterPriceRange
