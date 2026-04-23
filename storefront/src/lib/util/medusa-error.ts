export default function medusaError(error: any): never {
  console.error(error)

  // SDK v2 wraps fetch errors with a `status` and `body` (or `message`) property
  if (error?.status != null) {
    const body = error.body ?? {}
    const message: string =
      body.message ?? body.error ?? error.message ?? String(error)
    const capitalized = message.charAt(0).toUpperCase() + message.slice(1)
    throw new Error(capitalized.endsWith(".") ? capitalized : capitalized + ".")
  }

  // Fallback for unexpected error shapes
  throw new Error(error?.message ?? "An unexpected error occurred.")
}
