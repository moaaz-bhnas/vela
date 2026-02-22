import type { HttpTypes } from "@medusajs/types"
import { Metadata } from "next"

import SearchResultsTemplate from "@modules/search/templates/search-results-template"

import { search } from "@modules/search/actions"
import { getRegion } from "@lib/data/regions"

export const metadata: Metadata = {
  title: "Search",
  description: "Explore all of our products.",
}

type Params = {
  params: Promise<{ query: string; countryCode: string }>
}

export default async function SearchResults({ params }: Params) {
  const { query, countryCode } = await params

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
      countryCode={countryCode}
      region={region}
    />
  )
}
