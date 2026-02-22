import { Metadata } from "next"

import StoreTemplate from "@modules/store/templates"

export const metadata: Metadata = {
  title: "Store",
  description: "Explore all of our products.",
}

type Params = {
  params: { countryCode: string }
}

export default async function StorePage({ params }: Params) {
  return <StoreTemplate countryCode={params.countryCode} />
}
