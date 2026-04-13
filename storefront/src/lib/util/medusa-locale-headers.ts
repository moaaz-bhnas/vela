import "server-only"

import { cookies } from "next/headers"

/**
 * Returns the x-medusa-locale header for the current request.
 * Reads the _medusa_locale cookie set by middleware.
 * Server-only — do not import from Client Components.
 */
export async function getMedusaLocaleHeaders(): Promise<
  Record<string, string>
> {
  try {
    const cookieStore = await cookies()
    const locale = cookieStore.get("_medusa_locale")?.value
    if (locale) {
      return { "x-medusa-locale": locale }
    }
    return {}
  } catch {
    return {}
  }
}
