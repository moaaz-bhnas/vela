import { HttpTypes } from "@medusajs/types"

/**
 * Extracts all unique option titles and their values from a product list.
 * Used to drive the refinement UI (which filters to show).
 */
export function extractAvailableOptions(
  products: HttpTypes.StoreProduct[]
): Record<string, string[]> {
  const byTitle = new Map<string, Set<string>>()

  for (const product of products) {
    const options = product.options ?? []
    for (const option of options) {
      const title = option.title
      if (!title) continue
      let set = byTitle.get(title)
      if (!set) {
        set = new Set<string>()
        byTitle.set(title, set)
      }
      const values = option.values ?? []
      for (const v of values) {
        const val = (v as { value?: string }).value
        if (val != null) set.add(val)
      }
    }
  }

  const result: Record<string, string[]> = {}
  Array.from(byTitle.entries()).forEach(([title, set]) => {
    result[title] = Array.from(set).sort()
  })
  return result
}
