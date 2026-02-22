import { Metadata } from "next"

import BestSellersTemplate from "@modules/store/templates/best-sellers"

export const metadata: Metadata = {
  title: "Bestsellers",
  description: "Shop our best-selling products.",
}

type Params = {
  params: { countryCode: string }
}

export default async function BestSellersPage({ params }: Params) {
  return <BestSellersTemplate countryCode={params.countryCode} />
}
