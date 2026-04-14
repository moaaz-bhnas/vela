import { Metadata } from "next"
import { notFound } from "next/navigation"

import {
  getCollectionByHandle,
  getCollectionsList,
} from "@lib/data/collections"
import { listRegions } from "@lib/data/regions"
import { StoreCollection, StoreRegion } from "@medusajs/types"
import CollectionTemplate from "@modules/collections/templates"
import { getBrandingSeo } from "@lib/util/metadata"
import { getCountryCodeFromLocale } from "@lib/util/locale"
import { countryLocaleMap, defaultLocale } from "@/i18n/routing"

type Props = {
  params: Promise<{ handle: string; locale: string }>
}

export async function generateStaticParams() {
  const { collections } = await getCollectionsList()

  if (!collections) {
    return []
  }

  const countryCodes = await listRegions().then(
    (regions: StoreRegion[]) =>
      regions
        ?.map((r) => r.countries?.map((c) => c.iso_2))
        .flat()
        .filter(Boolean) as string[]
  )

  const collectionHandles = collections.map(
    (collection: StoreCollection) => collection.handle
  )

  const staticParams = countryCodes
    ?.map((countryCode: string) => {
      const locale = countryLocaleMap[countryCode] ?? defaultLocale
      return collectionHandles.map((handle: string | undefined) => ({
        locale,
        handle,
      }))
    })
    .flat()

  return staticParams ?? []
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, handle } = await params
  const seo = await getBrandingSeo()
  const collection = await getCollectionByHandle(handle)

  if (!collection) {
    notFound()
  }

  return {
    title: collection.title,
    description: collection.metadata?.description?.toString() || `${collection.title} collection`,
    alternates: {
      canonical: `/${locale}/collections/${collection.handle}`,
    },
    openGraph: {
      title: collection.title,
      description:
        collection.metadata?.description?.toString() ||
        `${collection.title} collection`,
      images: seo.defaultOgImage ? [seo.defaultOgImage] : [],
    },
  }
}

export default async function CollectionPage({ params }: Props) {
  const { locale, handle } = await params
  const collection = await getCollectionByHandle(handle)

  if (!collection) {
    notFound()
  }

  return (
    <CollectionTemplate
      collection={collection}
      countryCode={getCountryCodeFromLocale(locale)}
    />
  )
}
