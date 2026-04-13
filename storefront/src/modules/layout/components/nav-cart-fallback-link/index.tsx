"use client"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useTranslations } from "next-intl"

export default function NavCartFallbackLink() {
  const t = useTranslations("Nav")

  return (
    <LocalizedClientLink
      className="hover:text-ui-fg-base flex gap-2"
      href="/cart"
      data-testid="nav-cart-link"
    >
      {t("cartFallback")}
    </LocalizedClientLink>
  )
}
