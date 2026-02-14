"use client"

import { Label, Checkbox, Text, clx } from "@medusajs/ui"

type FilterOptionCheckboxesProps = {
  optionTitle: string
  values: string[]
  selectedValues: string[]
  valueCounts?: Record<string, number>
  onToggle: (value: string) => void
  "data-testid"?: string
}

const FilterOptionCheckboxes = ({
  optionTitle,
  values,
  selectedValues,
  valueCounts,
  onToggle,
  "data-testid": dataTestId,
}: FilterOptionCheckboxesProps) => {
  return (
    <div
      className="flex gap-x-3 flex-col gap-y-3"
      data-testid={dataTestId ?? `filter-option-${optionTitle}`}
    >
      <Text className="txt-compact-small-plus text-ui-fg-muted">
        {optionTitle}
      </Text>
      <div className="flex flex-col gap-y-2">
        {values.map((value) => {
          const checked = selectedValues.includes(value)
          const count = valueCounts?.[value]
          const hasCount = count !== undefined
          const label = hasCount ? `${value} (${count})` : value
          const id = `filter-${optionTitle}-${value}`.replace(/\s+/g, "-")

          return (
            <div key={value} className="flex gap-x-2 items-center">
              <Checkbox
                id={id}
                checked={checked}
                onCheckedChange={() => onToggle(value)}
                className="flex items-center gap-x-2"
                data-testid={`option-checkbox-${value}`}
              />
              <Label
                htmlFor={id}
                className={clx(
                  "!txt-compact-small !transform-none cursor-pointer",
                  count === 0
                    ? "text-ui-fg-muted"
                    : "text-ui-fg-subtle hover:text-ui-fg-base"
                )}
                data-testid="option-label"
              >
                {label}
              </Label>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default FilterOptionCheckboxes
