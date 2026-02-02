import { parsePhoneNumberWithError } from "libphonenumber-js"

export type FormattedPhone = {
  display: string
  href: string
}

/**
 * Formats a raw phone number for display and returns display string + tel: href.
 * Returns null if input is empty or invalid.
 */
export function formatPhone(
  raw: string | null | undefined
): FormattedPhone | null {
  if (!raw || typeof raw !== "string") {
    return null
  }
  const trimmed = raw.trim()
  if (!trimmed) {
    return null
  }
  try {
    const parsed = parsePhoneNumberWithError(trimmed)
    return {
      display: parsed.formatInternational(),
      href: `tel:${parsed.number}`,
    }
  } catch {
    return {
      display: trimmed,
      href: `tel:${trimmed.replace(/\s/g, "")}`,
    }
  }
}
