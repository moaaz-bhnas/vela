import { Metadata } from "next"
import { notFound } from "next/navigation"

import ProductTemplate from "@modules/products/templates"
import { getRegion, listRegions } from "@lib/data/regions"
import { getProductByHandle, getProductsList } from "@lib/data/products"
import { getBrandingSeo } from "@lib/util/metadata"
import { getCountryCodeFromLocale } from "@lib/util/locale"
import { countryLocaleMap, defaultLocale } from "@/i18n/routing"

type Props = {
  params: { locale: string; handle: string }
}

export async function generateStaticParams() {
  const countryCodes = await listRegions().then(
    (regions) =>
      regions
        ?.map((r) => r.countries?.map((c) => c.iso_2))
        .flat()
        .filter(Boolean) as string[]
  )

  if (!countryCodes) {
    return null
  }

  const products = await Promise.all(
    countryCodes.map((countryCode) => {
      return getProductsList({ countryCode })
    })
  ).then((responses) =>
    responses.map(({ response }) => response.products).flat()
  )

  const staticParams = countryCodes
    ?.map((countryCode) => {
      const locale = countryLocaleMap[countryCode] ?? defaultLocale
      return products.map((product) => ({
        locale,
        handle: product.handle,
      }))
    })
    .flat()

  return staticParams
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const countryCode = getCountryCodeFromLocale(params.locale)
  const { handle } = params
  const region = await getRegion(countryCode)
  const seo = await getBrandingSeo()

  if (!region) {
    notFound()
  }

  const product = await getProductByHandle(handle, region.id)

  if (!product) {
    notFound()
  }

  return {
    title: product.title,
    description: product.description || seo.defaultDescription,
    alternates: {
      canonical: `/${params.locale}/products/${product.handle}`,
    },
    openGraph: {
      title: product.title,
      description: product.description || seo.defaultDescription,
      images: product.thumbnail ? [product.thumbnail] : [],
      type: "website",
    },
  }
}

export default async function ProductPage({ params }: Props) {
  const countryCode = getCountryCodeFromLocale(params.locale)
  const region = await getRegion(countryCode)

  if (!region) {
    notFound()
  }

  const pricedProduct = await getProductByHandle(params.handle, region.id)
  if (!pricedProduct) {
    notFound()
  }

  return (
    <ProductTemplate
      product={pricedProduct}
      region={region}
      countryCode={countryCode}
    />
  )
}
