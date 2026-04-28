"use server"

import { revalidateTag } from "next/cache"
import { redirect } from "next/navigation"

import { getCountryCodeFromLocale } from "@lib/util/locale"

import { getCartId } from "./cookies"
import { updateCart } from "./cart"
import { getRegion } from "./regions"

/**
 * Updates the region for the current cart and redirects to the new locale path.
 * @param locale - BCP 47 locale string (e.g. "ar-EG")
 * @param currentPath - the current path without the locale prefix
 */
export async function updateRegion(
  locale: string,
  currentPath: string
): Promise<{ success: false; error: string } | void> {
  const cartId = await getCartId()
  const countryCode = getCountryCodeFromLocale(locale)
  const region = await getRegion(countryCode)

  if (!region) {
    return { success: false, error: `Region not found for locale: ${locale}` }
  }

  if (cartId) {
    const updateResult = await updateCart({
      region_id: region.id,
      locale,
    })
    if (!updateResult.success) {
      return { success: false, error: updateResult.error }
    }
    revalidateTag("cart")
  }

  revalidateTag("regions")
  revalidateTag("products")

  redirect(`/${locale}${currentPath}`)
}
