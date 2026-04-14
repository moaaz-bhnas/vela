import { sdk } from "@lib/config"
import { cache } from "react"
import { getProductsList } from "./products"
import { HttpTypes } from "@medusajs/types"
import { getMedusaLocaleHeaders } from "@lib/util/medusa-locale-headers"

export const retrieveCollection = cache(async function (id: string) {
  const localeHeaders = await getMedusaLocaleHeaders()
  return sdk.store.collection
    .retrieve(id, {}, { next: { tags: ["collections"] }, ...localeHeaders })
    .then(({ collection }) => collection)
})

export const getCollectionsList = cache(async function (
  offset: number = 0,
  limit: number = 100
): Promise<{ collections: HttpTypes.StoreCollection[]; count: number }> {
  const localeHeaders = await getMedusaLocaleHeaders()
  return sdk.store.collection
    .list(
      { limit, offset },
      { next: { tags: ["collections"] }, ...localeHeaders }
    )
    .then(({ collections, count }) => ({ collections, count }))
})

export const getCollectionByHandle = cache(async function (
  handle: string
): Promise<HttpTypes.StoreCollection> {
  const localeHeaders = await getMedusaLocaleHeaders()
  return sdk.store.collection
    .list({ handle }, { next: { tags: ["collections"] }, ...localeHeaders })
    .then(({ collections }) => collections[0])
})

export const getCollectionsWithProducts = cache(
  async (countryCode: string): Promise<HttpTypes.StoreCollection[] | null> => {
    const { collections } = await getCollectionsList(0, 3)

    if (!collections) {
      return null
    }

    const collectionIds = collections
      .map((collection) => collection.id)
      .filter(Boolean) as string[]

    const { response } = await getProductsList({
      queryParams: { collection_id: collectionIds } as any,
      countryCode,
    })

    const productsByCollection = new Map<string, HttpTypes.StoreProduct[]>()
    for (const product of response.products) {
      if (product.collection_id) {
        const existing = productsByCollection.get(product.collection_id) ?? []
        productsByCollection.set(product.collection_id, [...existing, product])
      }
    }

    return collections.map((collection) => ({
      ...collection,
      products: productsByCollection.get(collection.id) ?? [],
    })) as unknown as HttpTypes.StoreCollection[]
  }
)
