import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { cache } from "react"
import { getProductsById, type StoreProductsForClient } from "./products"
import { getRegion } from "./regions"
import {
  getOptionValueCounts,
  getPriceBounds,
  getAvailableCategories,
} from "@lib/util/filter-products"
import { extractAvailableOptions } from "@lib/util/extract-product-options"
import sortBy from "lodash/sortBy"
import some from "lodash/some"

export type ProductSales = {
  id: string
  product_id: string
  category_id?: string | null
  collection_id?: string | null
  selling_count: number
}

export type BestSellersResponse = {
  product_sales: ProductSales[]
  count?: number
  limit?: number
  offset?: number
}

export const getBestSellers = cache(async function ({
  category_ids,
  collection_id,
  regionId,
  limit = 100,
  offset = 0,
}: {
  category_ids?: string[]
  collection_id?: string
  regionId: string
  limit?: number
  offset?: number
}): Promise<HttpTypes.StoreProduct[]> {
  try {
    const response = await sdk.client.fetch<BestSellersResponse>(
      "/store/best-sellers",
      {
        query: { limit, offset },
        next: { tags: ["best-sellers"] },
      }
    )

    if (!response?.product_sales || response.product_sales.length === 0) {
      return []
    }

    // Extract product IDs and fetch products with variants and pricing
    const productIds = response.product_sales.map((ps) => ps.product_id)
    const products = await getProductsById({ ids: productIds, regionId })

    // Sort products by preferred category and collection
    const sortedProducts = sortBy(products, [
      function sortProducts(product) {
        const hasPreferredCategory =
          category_ids &&
          some(product.categories, (c) => category_ids.includes(c.id))
        if (hasPreferredCategory) {
          return 0
        }

        const hasPreferredCollection =
          collection_id && product.collection_id === collection_id
        if (hasPreferredCollection) {
          return 1
        }

        return 2
      },
    ])

    return sortedProducts
  } catch (error) {
    console.error("Error fetching best sellers:", error)
    return []
  }
})

/**
 * Fetches best-selling products and returns them in the same shape as getProductsForClient,
 * for use with ProductListWithFilters (client-side filtering, sorting, pagination).
 */
export const getBestSellersForClient = cache(async function (
  countryCode: string
): Promise<StoreProductsForClient> {
  const region = await getRegion(countryCode)
  const products =
    region?.id != null
      ? await getBestSellers({ regionId: region.id })
      : []

  return {
    products,
    availableOptions: extractAvailableOptions(products),
    optionValueCounts: getOptionValueCounts(products, {}),
    priceBounds: getPriceBounds(products),
    availableCategories: getAvailableCategories(products),
  }
})
