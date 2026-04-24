/**
 * Medusa JS SDK v2: fetch errors expose `status` and `body` (or `message`).
 * Use this for non-throwing server action results; use `medusaError` when a throw is still required.
 */
export function formatMedusaError(error: unknown): string {
  const e = error as { status?: number; body?: { message?: string; error?: string }; message?: string }

  if (e?.status != null) {
    const body = e.body ?? {}
    const message: string =
      body.message ?? body.error ?? e.message ?? String(error)
    const capitalized = message.charAt(0).toUpperCase() + message.slice(1)
    return capitalized.endsWith(".") ? capitalized : capitalized + "."
  }

  if (error instanceof Error) {
    return error.message
  }
  if (error != null && typeof error !== "object") {
    return String(error)
  }
  return "An unexpected error occurred."
}

/** Logs and rethrows a normalized `Error` (legacy call sites, server-only fetch helpers). */
export default function medusaError(error: unknown): never {
  console.error(error)
  throw new Error(formatMedusaError(error))
}
