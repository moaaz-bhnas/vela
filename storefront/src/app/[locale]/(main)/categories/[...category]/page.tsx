import { Metadata } from "next"
import { notFound } from "next/navigation"

import { getCategoryByHandle, listCategories } from "@lib/data/categories"
import { listRegions } from "@lib/data/regions"
import { StoreProductCategory, StoreRegion } from "@medusajs/types"
import CategoryTemplate from "@modules/categories/templates"
import { getBrandingSeo } from "@lib/util/metadata"
import { getCountryCodeFromLocale } from "@lib/util/locale"
import { countryLocaleMap, defaultLocale } from "@/i18n/routing"

type Props = {
  params: { category: string[]; locale: string }
}

export async function generateStaticParams() {
  const product_categories = await listCategories()

  if (!product_categories) {
    return []
  }

  const countryCodes = await listRegions().then((regions: StoreRegion[]) =>
    regions
      ?.map((r) => r.countries?.map((c) => c.iso_2))
      .flat()
      .filter(Boolean) as string[]
  )

  const categoryHandles = product_categories.map((category) => category.handle)

  const staticParams = countryCodes
    ?.map((countryCode: string) => {
      const locale = countryLocaleMap[countryCode] ?? defaultLocale
      return categoryHandles.map((handle) => ({
        locale,
        category: [handle],
      }))
    })
    .flat()

  return staticParams ?? []
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const seo = await getBrandingSeo()
    const { product_categories } = await getCategoryByHandle(params.category)

    const title = product_categories
      .map((category: StoreProductCategory) => category.name)
      .join(" | ")

    const description =
      product_categories[product_categories.length - 1].description ??
      `${title} category.`

    return {
      title,
      description: description || seo.defaultDescription,
      alternates: {
        canonical: `/${params.locale}/categories/${params.category.join("/")}`,
      },
    }
  } catch {
    notFound()
  }
}

export default async function CategoryPage({ params }: Props) {
  const { product_categories } = await getCategoryByHandle(params.category)

  if (!product_categories) {
    notFound()
  }

  return (
    <CategoryTemplate
      categories={product_categories}
      countryCode={getCountryCodeFromLocale(params.locale)}
    />
  )
}
