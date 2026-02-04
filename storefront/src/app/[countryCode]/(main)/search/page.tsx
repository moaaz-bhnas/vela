import type { HttpTypes } from "@medusajs/types"

import SearchModal from "@modules/search/templates/search-modal"
import { getSearchHistoryProductIds } from "@lib/data/cookies"
import { getProductsById } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { sdk } from "@lib/config"
import { PopularityResponse } from "types/global"

export default async function SearchModalRoute({
  params,
}: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await params
  const region = await getRegion(countryCode)

  const popularProducts = await (async function getPopularProducts() {
    try {
      const data = await sdk.client.fetch<PopularityResponse>(
        "/store/search-popularity",
        { query: { limit: 3, order: "-click_count" } }
      )
      return data.product_search_popularity.map((item) => item.product)
    } catch {
      return []
    }
  })()

  const searchHistoryProducts = await (async function getSearchHistory() {
    if (!region) return []

    try {
      const searchHistoryIds = await getSearchHistoryProductIds()
      if (searchHistoryIds.length === 0) return []

      const productIdsToFetch = searchHistoryIds.slice(0, 3)
      const fetchedProducts = await getProductsById({
        ids: productIdsToFetch,
        regionId: region.id,
      })
      return productIdsToFetch
        .map((id) => fetchedProducts.find((p) => p.id === id))
        .filter(
          (product): product is HttpTypes.StoreProduct => product != undefined
        )
    } catch {
      return []
    }
  })()

  return (
    <SearchModal
      popularProducts={popularProducts}
      searchHistoryProducts={searchHistoryProducts}
    />
  )
}
