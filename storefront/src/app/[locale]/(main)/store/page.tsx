import { Metadata } from "next"

import StoreTemplate from "@modules/store/templates"
import { getCountryCodeFromLocale } from "@lib/util/locale"

export const metadata: Metadata = {
  title: "Store",
  description: "Explore all of our products.",
}

type Params = {
  params: Promise<{ locale: string }>
}

export default async function StorePage({ params }: Params) {
  const { locale } = await params
  return <StoreTemplate countryCode={getCountryCodeFromLocale(locale)} />
}
