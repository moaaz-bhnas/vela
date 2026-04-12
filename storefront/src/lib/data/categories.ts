import { sdk } from "@lib/config"
import { cache } from "react"
import { getMedusaLocaleHeaders } from "@lib/util/medusa-locale-headers"

export const listCategories = cache(async function () {
  const localeHeaders = await getMedusaLocaleHeaders()
  return sdk.store.category
    .list(
      { fields: "+category_children", order: "rank" },
      { next: { tags: ["categories"] }, ...localeHeaders }
    )
    .then(({ product_categories }) => product_categories)
})

export const getCategoriesList = cache(async function (
  offset: number = 0,
  limit: number = 100,
  order: string = "rank"
) {
  const localeHeaders = await getMedusaLocaleHeaders()
  return sdk.store.category.list(
    // TODO: Look into fixing the type
    // @ts-ignore
    { limit, offset, order },
    { next: { tags: ["categories"] }, ...localeHeaders }
  )
})

export const getCategoryByHandle = cache(async function (
  categoryHandle: string[]
) {
  const localeHeaders = await getMedusaLocaleHeaders()
  return sdk.store.category.list(
    // TODO: Look into fixing the type
    // @ts-ignore
    { handle: categoryHandle },
    { next: { tags: ["categories"] }, ...localeHeaders }
  )
})
