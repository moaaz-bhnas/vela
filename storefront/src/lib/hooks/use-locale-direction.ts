"use client"

import { useLocale } from "next-intl"

import { getDirectionForLocale } from "@lib/i18n/direction"

/**
 * Returns document flow direction for the active next-intl locale.
 */
export function useLocaleDirection(): "ltr" | "rtl" {
  const locale = useLocale()
  return getDirectionForLocale(locale)
}
