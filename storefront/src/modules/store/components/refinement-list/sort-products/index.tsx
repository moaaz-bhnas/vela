import FilterRadioGroup from "@modules/common/components/filter-radio-group"
import { useMemo } from "react"
import { useTranslations } from "next-intl"

export type SortOptions =
  | "price_asc"
  | "price_desc"
  | "created_at"
  | "popularity"

type SortProductsProps = {
  sortBy: SortOptions
  onSortChange: (value: SortOptions) => void
  "data-testid"?: string
}

const SortProducts = ({
  "data-testid": dataTestId,
  sortBy,
  onSortChange,
}: SortProductsProps) => {
  const t = useTranslations("Store")

  const sortOptions = useMemo(
    () => [
      { value: "popularity" as const, label: t("sortPopularity") },
      { value: "created_at" as const, label: t("sortLatestArrivals") },
      { value: "price_asc" as const, label: t("sortPriceLowHigh") },
      { value: "price_desc" as const, label: t("sortPriceHighLow") },
    ],
    [t]
  )

  const handleChange = (value: string) => {
    onSortChange(value as SortOptions)
  }

  return (
    <FilterRadioGroup
      title={t("sortBy")}
      items={sortOptions}
      value={sortBy}
      handleChange={handleChange}
      data-testid={dataTestId}
    />
  )
}

export default SortProducts
