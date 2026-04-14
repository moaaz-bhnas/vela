import { HttpTypes } from "@medusajs/types"

export const CHECKOUT_STEPS = ["address", "delivery", "payment", "review"] as const
export type CheckoutStep = (typeof CHECKOUT_STEPS)[number]

const STEP_ORDER: Record<CheckoutStep, number> = {
  address: 0,
  delivery: 1,
  payment: 2,
  review: 3,
}

function hasCompleteShippingAddress(cart: HttpTypes.StoreCart): boolean {
  const a = cart.shipping_address
  if (!a) return false
  return Boolean(
    a.first_name?.trim() &&
      a.last_name?.trim() &&
      a.address_1?.trim() &&
      a.city?.trim() &&
      a.postal_code?.trim() &&
      a.country_code?.trim()
  )
}

function hasShippingMethod(cart: HttpTypes.StoreCart): boolean {
  return (cart.shipping_methods?.length ?? 0) > 0
}

function paidByGiftcardOnly(cart: HttpTypes.StoreCart): boolean {
  const c = cart as HttpTypes.StoreCart & {
    gift_cards?: { length: number }[] | null
  }
  return Boolean(
    c.gift_cards && c.gift_cards.length > 0 && (cart.total ?? 0) === 0
  )
}

function hasPendingPaymentSession(cart: HttpTypes.StoreCart): boolean {
  const sessions = cart.payment_collection?.payment_sessions ?? []
  return sessions.some((s) => s.status === "pending")
}

function needsPaymentStep(cart: HttpTypes.StoreCart): boolean {
  if (paidByGiftcardOnly(cart)) return false
  return (cart.total ?? 0) > 0
}

/** Earliest checkout step that still needs action (guest-first linear flow). */
export function getFirstIncompleteCheckoutStep(
  cart: HttpTypes.StoreCart
): CheckoutStep {
  if (!hasCompleteShippingAddress(cart)) {
    return "address"
  }
  if (!hasShippingMethod(cart)) {
    return "delivery"
  }
  if (needsPaymentStep(cart) && !hasPendingPaymentSession(cart)) {
    return "payment"
  }
  return "review"
}

export function normalizeCheckoutStepParam(
  step: string | string[] | undefined
): CheckoutStep | undefined {
  const v = Array.isArray(step) ? step[0] : step
  if (!v || !CHECKOUT_STEPS.includes(v as CheckoutStep)) {
    return undefined
  }
  return v as CheckoutStep
}

/**
 * Resolves `?step=` for the URL: fills missing/invalid values and blocks skipping ahead
 * (users may still go back to earlier steps).
 */
export function resolveCheckoutStepParam(
  cart: HttpTypes.StoreCart,
  step: string | string[] | undefined
): CheckoutStep {
  const firstIncomplete = getFirstIncompleteCheckoutStep(cart)
  const normalized = normalizeCheckoutStepParam(step)
  if (!normalized) {
    return firstIncomplete
  }
  if (STEP_ORDER[normalized] > STEP_ORDER[firstIncomplete]) {
    return firstIncomplete
  }
  return normalized
}
