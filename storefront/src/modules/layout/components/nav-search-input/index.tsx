"use client"

import { MagnifyingGlassMini } from "@medusajs/icons"
import { useRouter } from "next/navigation"
import { Button } from "@medusajs/ui"
import { clx } from "@medusajs/ui"
import { useTranslations } from "next-intl"

type NavSearchInputProps = {
  className?: string
  placeholder?: string
  onNavigate?: () => void
}

const NavSearchInput = ({
  className,
  placeholder,
  onNavigate,
}: NavSearchInputProps) => {
  const t = useTranslations("Nav")
  const resolvedPlaceholder = placeholder ?? t("searchPlaceholder")
  const router = useRouter()

  const handleClick = () => {
    onNavigate?.()
    router.push("/search")
  }

  return (
    <Button
      variant="transparent"
      onClick={handleClick}
      className={clx(
        "w-full lg:max-w-2xl flex items-center gap-x-2 px-4 py-2 bg-ui-bg-field hover:bg-ui-bg-field-hover border border-ui-border-base rounded-rounded text-ui-fg-subtle hover:text-ui-fg-base",
        className
      )}
      data-testid="nav-search-input"
    >
      <MagnifyingGlassMini />
      <span className="text-small-regular flex-1 text-left">
        {resolvedPlaceholder}
      </span>
    </Button>
  )
}

export default NavSearchInput
