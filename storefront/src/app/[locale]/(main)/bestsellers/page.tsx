import { Metadata } from "next"

import BestSellersTemplate from "@modules/store/templates/best-sellers"
import { getCountryCodeFromLocale } from "@lib/util/locale"

export const metadata: Metadata = {
  title: "Bestsellers",
  description: "Shop our best-selling products.",
}

type Params = {
  params: Promise<{ locale: string }>
}

export default async function BestSellersPage({ params }: Params) {
  const { locale } = await params
  return <BestSellersTemplate countryCode={getCountryCodeFromLocale(locale)} />
}
