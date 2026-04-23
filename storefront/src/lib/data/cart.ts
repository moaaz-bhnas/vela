"use server"

import { sdk } from "@lib/config"
import type {
  MutationResult,
  PlaceOrderResult,
  UpdateCartResult,
} from "@lib/util/action-result"
import { formatMedusaError } from "@lib/util/medusa-error"
import { HttpTypes } from "@medusajs/types"
import { omit } from "lodash"
import { revalidateTag } from "next/cache"
import { redirect } from "next/navigation"
import { defaultLocaleTagForCountry } from "@lib/i18n/locale-policy"
import { getCountryCodeFromLocale } from "@lib/util/locale"
import { defaultLocale } from "@/i18n/routing"
import {
  getAuthHeaders,
  getCartId,
  getMedusaLocale,
  removeCartId,
  setCartId,
} from "./cookies"
import { listStoreLocales } from "./locales"
import { getProductsById } from "./products"
import { getRegion } from "./regions"

export async function retrieveCart() {
  const cartId = await getCartId()

  if (!cartId) {
    return null
  }

  return await sdk.store.cart
    .retrieve(
      cartId,
      {},
      { next: { tags: ["cart"] }, ...(await getAuthHeaders()) }
    )
    .then(({ cart }) => cart)
    .catch(() => {
      return null
    })
}

async function resolveCartLocaleTag(countryCode: string) {
  const normalized = countryCode.toLowerCase()
  const cookieLocale = await getMedusaLocale()
  if (cookieLocale && getCountryCodeFromLocale(cookieLocale) === normalized) {
    return cookieLocale
  }
  const storeLocales = await listStoreLocales()
  return defaultLocaleTagForCountry(normalized, storeLocales)
}

export async function getOrSetCart(countryCode: string) {
  let cart = await retrieveCart()
  const region = await getRegion(countryCode)

  if (!region) {
    throw new Error(`Region not found for country code: ${countryCode}`)
  }

  const locale = await resolveCartLocaleTag(countryCode)

  if (!cart) {
    const cartResp = await sdk.store.cart.create({
      region_id: region.id,
      ...(locale ? { locale } : {}),
    })
    cart = cartResp.cart
    await setCartId(cart.id)
    revalidateTag("cart")
    return cart
  }

  if (cart.region_id !== region.id) {
    await sdk.store.cart.update(
      cart.id,
      {
        region_id: region.id,
        ...(locale ? { locale } : {}),
      },
      {},
      await getAuthHeaders()
    )
    revalidateTag("cart")
  } else if (
    locale &&
    (cart as HttpTypes.StoreCart & { locale?: string | null }).locale !== locale
  ) {
    await sdk.store.cart.update(cart.id, { locale }, {}, await getAuthHeaders())
    revalidateTag("cart")
  }

  return cart
}

export async function updateCart(
  data: HttpTypes.StoreUpdateCart
): Promise<UpdateCartResult> {
  const cartId = await getCartId()
  if (!cartId) {
    return {
      success: false,
      error: "No existing cart found, please create one before updating",
    }
  }

  try {
    const { cart } = await sdk.store.cart.update(
      cartId,
      data,
      {},
      await getAuthHeaders()
    )
    revalidateTag("cart")
    return { success: true, cart }
  } catch (e) {
    return { success: false, error: formatMedusaError(e) }
  }
}

export async function addToCart({
  variantId,
  quantity,
  countryCode,
}: {
  variantId: string
  quantity: number
  countryCode: string
}): Promise<MutationResult> {
  if (!variantId) {
    return { success: false, error: "Missing variant ID when adding to cart" }
  }

  try {
    const cart = await getOrSetCart(countryCode)
    if (!cart) {
      return { success: false, error: "Error retrieving or creating cart" }
    }

    await sdk.store.cart.createLineItem(
      cart.id,
      {
        variant_id: variantId,
        quantity,
      },
      {},
      await getAuthHeaders()
    )
    revalidateTag("cart")
    return { success: true }
  } catch (e) {
    return { success: false, error: formatMedusaError(e) }
  }
}

export async function updateLineItem({
  lineId,
  quantity,
}: {
  lineId: string
  quantity: number
}): Promise<MutationResult> {
  if (!lineId) {
    return { success: false, error: "Missing lineItem ID when updating line item" }
  }

  const cartId = await getCartId()
  if (!cartId) {
    return { success: false, error: "Missing cart ID when updating line item" }
  }

  try {
    await sdk.store.cart.updateLineItem(
      cartId,
      lineId,
      { quantity },
      {},
      await getAuthHeaders()
    )
    revalidateTag("cart")
    return { success: true }
  } catch (e) {
    return { success: false, error: formatMedusaError(e) }
  }
}

export async function deleteLineItem(lineId: string): Promise<MutationResult> {
  if (!lineId) {
    return { success: false, error: "Missing lineItem ID when deleting line item" }
  }

  const cartId = await getCartId()
  if (!cartId) {
    return { success: false, error: "Missing cart ID when deleting line item" }
  }

  try {
    await sdk.store.cart.deleteLineItem(cartId, lineId, {}, await getAuthHeaders())
    revalidateTag("cart")
    return { success: true }
  } catch (e) {
    return { success: false, error: formatMedusaError(e) }
  }
}

export async function enrichLineItems(
  lineItems:
    | HttpTypes.StoreCartLineItem[]
    | HttpTypes.StoreOrderLineItem[]
    | null,
  regionId: string
) {
  if (!lineItems) return []

  // Prepare query parameters
  const queryParams = {
    ids: lineItems.map((lineItem) => lineItem.product_id!),
    regionId: regionId,
  }

  // Fetch products by their IDs
  const products = await getProductsById(queryParams)
  // If there are no line items or products, return an empty array
  if (!lineItems?.length || !products) {
    return []
  }

  // Enrich line items with product and variant information
  const enrichedItems = lineItems.map((item) => {
    const product = products.find((p: any) => p.id === item.product_id)
    const variant = product?.variants?.find(
      (v: any) => v.id === item.variant_id
    )

    // If product or variant is not found, return the original item
    if (!product || !variant) {
      return item
    }

    // If product and variant are found, enrich the item
    return {
      ...item,
      variant: {
        ...variant,
        product: omit(product, "variants"),
      },
    }
  }) as HttpTypes.StoreCartLineItem[]

  return enrichedItems
}

export async function setShippingMethod({
  cartId,
  shippingMethodId,
}: {
  cartId: string
  shippingMethodId: string
}): Promise<MutationResult> {
  try {
    await sdk.store.cart.addShippingMethod(
      cartId,
      { option_id: shippingMethodId },
      {},
      await getAuthHeaders()
    )
    revalidateTag("cart")
    return { success: true }
  } catch (e) {
    return { success: false, error: formatMedusaError(e) }
  }
}

export async function initiatePaymentSession(
  cart: HttpTypes.StoreCart,
  data: {
    provider_id: string
    context?: Record<string, unknown>
  }
): Promise<
  | { success: true; data: Awaited<ReturnType<typeof sdk.store.payment.initiatePaymentSession>> }
  | { success: false; error: string }
> {
  try {
    const resp = await sdk.store.payment.initiatePaymentSession(
      cart,
      data,
      {},
      await getAuthHeaders()
    )
    revalidateTag("cart")
    return { success: true, data: resp }
  } catch (e) {
    return { success: false, error: formatMedusaError(e) }
  }
}

export async function applyPromotions(
  codes: string[]
): Promise<MutationResult> {
  const cartId = await getCartId()
  if (!cartId) {
    return { success: false, error: "No existing cart found" }
  }

  const result = await updateCart({ promo_codes: codes })
  if (!result.success) {
    return { success: false, error: result.error }
  }
  return { success: true }
}

export async function submitPromotionForm(
  currentState: unknown,
  formData: FormData
) {
  const code = formData.get("code") as string
  const result = await applyPromotions([code])
  if (!result.success) {
    return result.error
  }
  return null
}

// TODO: Pass a POJO instead of a form entity here
export async function setAddresses(currentState: unknown, formData: FormData) {
  try {
    if (!formData) {
      throw new Error("No form data found when setting addresses")
    }
    const cartId = await getCartId()
    if (!cartId) {
      throw new Error("No existing cart found when setting addresses")
    }

    const data = {
      shipping_address: {
        first_name: formData.get("shipping_address.first_name"),
        last_name: formData.get("shipping_address.last_name"),
        address_1: formData.get("shipping_address.address_1"),
        address_2: "",
        company: formData.get("shipping_address.company"),
        postal_code: formData.get("shipping_address.postal_code"),
        city: formData.get("shipping_address.city"),
        country_code: formData.get("shipping_address.country_code"),
        province: formData.get("shipping_address.province"),
        phone: formData.get("shipping_address.phone"),
      },
      email: formData.get("email"),
    } as any

    const sameAsBilling = formData.get("same_as_billing")
    if (sameAsBilling === "on") data.billing_address = data.shipping_address

    if (sameAsBilling !== "on")
      data.billing_address = {
        first_name: formData.get("billing_address.first_name"),
        last_name: formData.get("billing_address.last_name"),
        address_1: formData.get("billing_address.address_1"),
        address_2: "",
        company: formData.get("billing_address.company"),
        postal_code: formData.get("billing_address.postal_code"),
        city: formData.get("billing_address.city"),
        country_code: formData.get("billing_address.country_code"),
        province: formData.get("billing_address.province"),
        phone: formData.get("billing_address.phone"),
      }
    const updateResult = await updateCart(data)
    if (!updateResult.success) {
      return updateResult.error
    }
  } catch (e) {
    return formatMedusaError(e)
  }

  const shippingCountryCode =
    (formData.get("shipping_address.country_code") as string)?.toLowerCase() ??
    ""
  const storeLocales = await listStoreLocales()
  const medusaLocale = await getMedusaLocale()
  const locale =
    medusaLocale ??
    (shippingCountryCode
      ? defaultLocaleTagForCountry(shippingCountryCode, storeLocales)
      : defaultLocale)
  redirect(`/${locale}/checkout?step=delivery`)
}

export async function placeOrder(): Promise<PlaceOrderResult> {
  const cartId = await getCartId()
  if (!cartId) {
    return {
      success: false,
      error: "No existing cart found when placing an order",
    }
  }

  let cartRes: Awaited<ReturnType<typeof sdk.store.cart.complete>>
  try {
    cartRes = await sdk.store.cart.complete(cartId, {}, await getAuthHeaders())
    revalidateTag("cart")
  } catch (e) {
    return { success: false, error: formatMedusaError(e) }
  }

  if (cartRes?.type === "order") {
    const countryCode =
      cartRes.order.shipping_address?.country_code?.toLowerCase() ?? ""
    const storeLocales = await listStoreLocales()
    const medusaLocale = await getMedusaLocale()
    const locale =
      medusaLocale ??
      (countryCode
        ? defaultLocaleTagForCountry(countryCode, storeLocales)
        : defaultLocale)
    await removeCartId()
    redirect(`/${locale}/order/confirmed/${cartRes?.order.id}`)
  }

  return { success: true, cart: cartRes.cart }
}

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
    const u = await updateCart({
      region_id: region.id,
      locale,
    })
    if (!u.success) {
      return { success: false, error: u.error }
    }
    revalidateTag("cart")
  }

  revalidateTag("regions")
  revalidateTag("products")

  redirect(`/${locale}${currentPath}`)
}
