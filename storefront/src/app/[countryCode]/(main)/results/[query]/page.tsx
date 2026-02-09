import type { HttpTypes } from "@medusajs/types"
import { Metadata } from "next"

import SearchResultsTemplate from "@modules/search/templates/search-results-template"

import { search } from "@modules/search/actions"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { getRegion } from "@lib/data/regions"
import { sdk } from "@lib/config"
import { PopularityResponse } from "types/global"

export const metadata: Metadata = {
  title: "Search",
  description: "Explore all of our products.",
}

type Params = {
  params: Promise<{ query: string; countryCode: string }>
  searchParams: {
    sortBy?: SortOptions
    page?: string
  }
}

export default async function SearchResults({ params, searchParams }: Params) {
  const { query, countryCode } = await params
  const { sortBy, page } = searchParams

  const hits = await search(query).then((data) => data)

  const ids = hits
    .map((h) => h.objectID || h.id)
    .filter((id): id is string => {
      return typeof id === "string"
    })

  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  return (
    <SearchResultsTemplate
      query={query}
      ids={ids}
      sortBy={sortBy}
      page={page}
      countryCode={countryCode}
      region={region}
    />
  )
}
