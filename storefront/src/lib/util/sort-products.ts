import { HttpTypes } from "@medusajs/types"
import { SortOptions } from "@lib/types"

interface SortableProduct extends HttpTypes.StoreProduct {
  _minPrice?: number
  product_sales?: { selling_count: number } | null
}

/**
 * Helper function to sort products by price until the store API supports sorting by price
 * @param products
 * @param sortBy
 * @returns products sorted by price
 */
export function sortProducts(
  products: HttpTypes.StoreProduct[],
  sortBy: SortOptions
): HttpTypes.StoreProduct[] {
  const getMinPrice = (product: SortableProduct): number => {
    if (!product.variants?.length) return Infinity
    return Math.min(
      ...product.variants.map(
        (variant) => variant?.calculated_price?.calculated_amount || 0
      )
    )
  }

  const sorted = [...products] as SortableProduct[]

  if (sortBy === "price_asc") {
    sorted.sort((a, b) => getMinPrice(a) - getMinPrice(b))
  } else if (sortBy === "price_desc") {
    sorted.sort((a, b) => getMinPrice(b) - getMinPrice(a))
  } else if (sortBy === "created_at") {
    sorted.sort(
      (a, b) =>
        new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime()
    )
  } else if (sortBy === "popularity") {
    sorted.sort((a, b) => {
      const aSales = a.product_sales?.selling_count ?? 0
      const bSales = b.product_sales?.selling_count ?? 0
      return bSales - aSales
    })
  }

  return sorted
}
