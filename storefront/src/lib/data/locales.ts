import "server-only"

import { sdk } from "@lib/config"
import { cache } from "react"

import type { HttpTypes } from "@medusajs/types"

export const listStoreLocales = cache(
  async function listStoreLocales(): Promise<HttpTypes.StoreLocale[]> {
    const { locales } = await sdk.store.locale.list()

    console.log("locales ✨✨", locales)
    return locales ?? []
  }
)
