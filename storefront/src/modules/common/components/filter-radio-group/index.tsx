import { useLocaleDirection } from "@/lib/hooks/use-locale-direction"
import { Label, RadioGroup, Text, clx } from "@medusajs/ui"

type FilterRadioGroupProps = {
  title: string
  items: {
    value: string
    label: string
  }[]
  value: string
  handleChange: (value: string) => void
  "data-testid"?: string
}

const FilterRadioGroup = ({
  title,
  items,
  value,
  handleChange,
  "data-testid": dataTestId,
}: FilterRadioGroupProps) => {
  const direction = useLocaleDirection()

  return (
    <div className="flex flex-col gap-y-3">
      <Text className="txt-compact-small-plus text-ui-fg-muted">{title}</Text>
      <RadioGroup
        value={value}
        onValueChange={handleChange}
        data-testid={dataTestId}
        dir={direction}
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
