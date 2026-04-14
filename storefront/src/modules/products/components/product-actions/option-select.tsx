import { HttpTypes } from "@medusajs/types"
import { clx } from "@medusajs/ui"
import React from "react"

type OptionSelectProps = {
  option: HttpTypes.StoreProductOption
  current: string | undefined
  updateOption: (title: string, value: string) => void
  title: string
  disabled: boolean
  "data-testid"?: string
}

const OptionSelect: React.FC<OptionSelectProps> = ({
  option,
  current,
  updateOption,
  title,
  "data-testid": dataTestId,
  disabled,
}) => {
  const filteredOptions = option.values?.map((v) => v.value)

  return (
    <div className="flex flex-col gap-y-3">
      <span className="text-sm">Select {title}</span>
      <div
        className="flex flex-wrap justify-between gap-2"
        data-testid={dataTestId}
      >
        {filteredOptions?.map((v) => {
          const selected = v === current
          return (
            <button
              type="button"
              onClick={() => updateOption(option.title ?? "", v ?? "")}
              key={v}
              className={clx(
                "border bg-ui-bg-subtle text-xs leading-5 font-normal min-h-11 rounded-rounded px-3 py-2 flex-1 text-center transition-shadow ease-in-out duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ui-fg-interactive focus-visible:ring-offset-2 focus-visible:ring-offset-ui-bg-base",
                {
                  "border-ui-fg-base border-2 shadow-sm": selected,
                  "border-ui-border-base": !selected,
                  "hover:shadow-elevation-card-rest": !selected && !disabled,
                  "opacity-50 cursor-not-allowed": disabled,
                }
              )}
              disabled={disabled}
              aria-pressed={selected}
              aria-label={`${title}: ${v}${selected ? ", selected" : ""}`}
              data-testid="option-button"
            >
              {v}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default OptionSelect
