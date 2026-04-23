import { HttpTypes } from "@medusajs/types"

/** Client-invoked server mutations: use `success` + `error` instead of throwing for API failures. */
export type MutationResult = { success: true } | { success: false; error: string }

export type UpdateCartResult =
  | { success: true; cart: HttpTypes.StoreCart }
  | { success: false; error: string }

export type PlaceOrderResult =
  | { success: true; cart: HttpTypes.StoreCart }
  | { success: false; error: string }

export type UpdateCustomerResult =
  | { success: true }
  | { success: false; error: string }

/** `updateRegion` only returns on failure; success calls `redirect()` (throws in Next.js). */
export type UpdateRegionResult = { success: false; error: string } | void
