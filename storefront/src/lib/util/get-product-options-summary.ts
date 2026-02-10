import { HttpTypes } from "@medusajs/types"
import _ from "lodash"

type Product = HttpTypes.StoreProduct

export function getProductOptionsSummary(product: Product) {
  const options = product.options || []

  if (!options.length) {
    return null
  }

  const parts = options
    .map((option) => {
      const valuesArray = _.isArray(option.values) ? option.values : []
      const uniqueValues = _.uniqBy(valuesArray, "value")

      const count = uniqueValues.length

      if (count == 0) {
        return null
      }

      const baseLabel = option.title.toLowerCase()

      const label =
        count === 1
          ? baseLabel
          : baseLabel.endsWith("s")
          ? baseLabel
          : `${baseLabel}s`

      return { count, label }
    })
    .filter(Boolean) as { count: number; label: string }[]

  if (!parts.length) {
    return null
  }

  const segments = parts.map((p) => `${p.count} ${p.label}`)

  let listText: string

  if (segments.length === 1) {
    listText = segments[0]
  } else if (segments.length === 2) {
    listText = `${segments[0]} and ${segments[1]}`
  } else {
    listText =
      segments.slice(0, -1).join(", ") + " and " + segments[segments.length - 1]
  }

  return `Available in ${listText}`
}
