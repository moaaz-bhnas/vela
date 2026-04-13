"use client"

import { UserMini } from "@medusajs/icons"
import { clx } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useTranslations } from "next-intl"

const AccountIconButton = () => {
  const t = useTranslations("Nav")

  return (
    <LocalizedClientLink
      href="/account"
      data-testid="nav-account-link"
      className={clx(
        "transition-fg relative inline-flex items-center justify-center overflow-hidden rounded-md outline-none",
        "disabled:bg-ui-bg-disabled disabled:shadow-buttons-neutral disabled:text-ui-fg-disabled disabled:after:hidden",
        "text-ui-fg-subtle bg-ui-button-transparent hover:bg-ui-button-transparent-hover active:bg-ui-button-transparent-pressed",
        "focus-visible:shadow-buttons-neutral-focus focus-visible:bg-ui-bg-base disabled:!bg-transparent disabled:!shadow-none",
        "h-8 w-8 p-1.5"
      )}
      aria-label={t("accountAria")}
    >
      <UserMini />
    </LocalizedClientLink>
  )
}

export default AccountIconButton
