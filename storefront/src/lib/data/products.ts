import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { cache } from "react"
import { getRegion } from "./regions"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { sortProducts } from "@lib/util/sort-products"
import {
  filterProducts,
  getOptionValueCounts,
  getPriceBounds,
  getAvailableCategories,
  type ProductFilters,
  type CategoryInfo,
} from "@lib/util/filter-products"
import { extractAvailableOptions } from "@lib/util/extract-product-options"

export const getProductsById = cache(async function ({
  ids,
  regionId,
}: {
  ids: string[]
  regionId: string
}) {
  return sdk.store.product
    .list(
      {
        id: ids,
        region_id: regionId,
        fields:
          "*variants.calculated_price,+variants.inventory_quantity,*variants.images,*categories",
      },
      { next: { tags: ["products"] } }
    )
    .then(({ products }) => products)
})

export const getProductByHandle = cache(async function (
  handle: string,
  regionId: string
) {
  return sdk.store.product
    .list(
      {
        handle,
        region_id: regionId,
        fields:
          "*variants.calculated_price,+variants.inventory_quantity,*variants.images,*categories",
      },
      { next: { tags: ["products"] } }
    )
    .then(({ products }) => products[0])
})

export const getProductsList = cache(async function ({
  pageParam = 1,
  queryParams,
  countryCode,
}: {
  pageParam?: number
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
  countryCode: string
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
}> {
  const limit = queryParams?.limit || 12
  const validPageParam = Math.max(pageParam, 1)
  const offset = (validPageParam - 1) * limit
  const region = await getRegion(countryCode)

  if (!region) {
    return {
      response: { products: [], count: 0 },
      nextPage: null,
    }
  }
  return sdk.store.product
    .list(
      {
        limit,
        offset,
        region_id: region.id,
        fields: "*variants.calculated_price,*categories,*product_sales",
        ...queryParams,
      },
      { next: { tags: ["products"] } }
    )
    .then(({ products, count }) => {
      const nextPage = count > offset + limit ? pageParam + 1 : null

      return {
        response: {
          products,
          count,
        },
        nextPage: nextPage,
        queryParams,
      }
    })
})

export type StoreProductsForClient = {
  products: HttpTypes.StoreProduct[]
  availableOptions: Record<string, string[]>
  optionValueCounts: Record<string, Record<string, number>>
  priceBounds: { min: number; max: number } | undefined
  availableCategories: CategoryInfo[]
}

export type GetProductsForClientOptions = {
  categoryId?: string
  collectionId?: string
  /** Product IDs to fetch (e.g. from search). When set, only these products are returned. */
  ids?: string[]
}

/**
 * Fetches the full product list and metadata once (no sort/filter/page).
 * For use with client-side filtering/sorting via nuqs.
 * Use categoryId and/or collectionId to scope to a category or collection; omit for the full store.
 */
export const getProductsForClient = cache(async function (
  countryCode: string,
  options?: GetProductsForClientOptions
): Promise<StoreProductsForClient> {
  const queryParams: HttpTypes.FindParams & HttpTypes.StoreProductParams = {
    limit: 1000,
    ...(options?.categoryId && { category_id: [options.categoryId] }),
    ...(options?.collectionId && { collection_id: [options.collectionId] }),
    ...(options?.ids?.length && { id: options.ids }),
  }

  const {
    response: { products },
  } = await getProductsList({
    pageParam: 1,
    queryParams,
    countryCode,
  })

  const availableOptions = extractAvailableOptions(products)
  const optionValueCounts = getOptionValueCounts(products, {})
  const priceBounds = getPriceBounds(products)
  const availableCategories = getAvailableCategories(products)

  return {
    products,
    availableOptions,
    optionValueCounts,
    priceBounds,
    availableCategories,
  }
})

/**
 * Builds StoreProductsForClient from a product array (e.g. for best-sellers or search results).
 */
export function buildStoreProductsForClient(
  products: HttpTypes.StoreProduct[]
): StoreProductsForClient {
  return {
    products,
    availableOptions: extractAvailableOptions(products),
    optionValueCounts: getOptionValueCounts(products, {}),
    priceBounds: getPriceBounds(products),
    availableCategories: getAvailableCategories(products),
  }
}

/**
 * Fetches products, then filters, sorts, and paginates. Returns filtered count and option metadata for the refinement UI.
 */
export const getProductsListWithSort = cache(async function ({
  page = 0,
  queryParams,
  sortBy = "popularity",
  filters,
  countryCode,
}: {
  page?: number
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
  sortBy?: SortOptions
  filters?: ProductFilters
  countryCode: string
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  availableOptions: Record<string, string[]>
  optionValueCounts: Record<string, Record<string, number>>
  priceBounds: { min: number; max: number } | undefined
  nextPage: number | null
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
}> {
  const limit = queryParams?.limit || 12

  const {
    response: { products: unfilteredProducts },
  } = await getProductsList({
    pageParam: 0,
    queryParams: {
      ...queryParams,
      limit: 1000,
    },
    countryCode,
  })

  const { products: filteredProducts, count } = filterProducts(
    unfilteredProducts,
    filters ?? {}
  )
  const sortedProducts = sortProducts(filteredProducts, sortBy)

  const pageParam = (page - 1) * limit
  const nextPage = count > pageParam + limit ? pageParam + limit : null
  const paginatedProducts = sortedProducts.slice(pageParam, pageParam + limit)

  const availableOptions = extractAvailableOptions(unfilteredProducts)
  const optionValueCounts = getOptionValueCounts(
    unfilteredProducts,
    filters ?? {}
  )
  const priceBounds = getPriceBounds(unfilteredProducts)

  return {
    response: {
      products: paginatedProducts,
      count,
    },
    availableOptions,
    optionValueCounts,
    priceBounds,
    nextPage,
    queryParams,
  }
})
