import { Label, RadioGroup, Text, clx } from "@medusajs/ui"

import Spinner from "@modules/common/icons/spinner"

type FilterRadioGroupProps = {
  title: string
  items: {
    value: string
    label: string
  }[]
  value: string
  handleChange: (value: string) => void
  /** When true, shows a loading spinner next to the title. */
  isLoading?: boolean
  "data-testid"?: string
}

const FilterRadioGroup = ({
  title,
  items,
  value,
  handleChange,
  isLoading = false,
  "data-testid": dataTestId,
}: FilterRadioGroupProps) => {
  return (
    <div className="flex flex-col gap-y-3" aria-busy={isLoading}>
      <div className="flex items-center gap-x-2">
        <Text className="txt-compact-small-plus text-ui-fg-muted">{title}</Text>
        {isLoading && <Spinner size="16" aria-hidden />}
      </div>
      <RadioGroup
        value={value}
        onValueChange={handleChange}
        data-testid={dataTestId}
        disabled={isLoading}
      >
        {items?.map((i) => (
          <div key={i.value} className="flex items-center gap-x-3">
            <RadioGroup.Item value={i.value} id={i.value} />
            <Label
              htmlFor={i.value}
              className={clx(
                "cursor-pointer",
                i.value === value ? "text-ui-fg-base" : "text-ui-fg-subtle"
              )}
              data-testid="radio-label"
            >
              {i.label}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  )
}

export default FilterRadioGroup
