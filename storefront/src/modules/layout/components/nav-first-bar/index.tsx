"use client"

import Image from "next/image"

import { Phone } from "@medusajs/icons"
import { StoreProductCategory, StoreRegion } from "@medusajs/types"
import { clx } from "@medusajs/ui"
import { AnimatePresence, motion } from "motion/react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import SideMenu from "@modules/layout/components/side-menu"
import AccountIconButton from "@modules/layout/components/account-icon-button"
import NavSearchInput from "@modules/layout/components/nav-search-input"
import { useNavScroll } from "@modules/layout/components/nav-scroll-wrapper"
import type { FormattedPhone } from "@lib/util/format-phone"
import { Headphones, Headset } from "lucide-react"

type NavFirstBarProps = {
  regions: StoreRegion[]
  categories: StoreProductCategory[]
  logo?: { url?: string; alt?: string; width?: number; height?: number } | null
  siteTitle: string
  phone?: FormattedPhone | null
  children: React.ReactNode
}

const NavFirstBar = ({
  regions,
  categories,
  logo,
  siteTitle,
  phone,
  children,
}: NavFirstBarProps) => {
  const isScrolled = useNavScroll()

  function renderDesktop() {
    return (
      <div className="flex items-center justify-between h-full">
        {/* Left: Menu and Logo */}
        <div className="flex items-center h-full">
          {/* Desktop: Show menu icon only when scrolled */}
          <AnimatePresence>
            {isScrolled && (
              <motion.div
                key="side-menu"
                initial={{ opacity: 0, width: 0, marginRight: 0 }}
                animate={{ opacity: 1, width: "auto", marginRight: 8 }}
                exit={{ opacity: 0, width: 0, marginRight: 0 }}
                transition={{
                  duration: 0.2,
                }}
                className="h-full flex items-center overflow-hidden"
              >
                <SideMenu regions={regions} categories={categories} />
              </motion.div>
            )}
          </AnimatePresence>

          <LocalizedClientLink
            href="/"
            className="hover:text-ui-fg-base"
            data-testid="nav-store-link"
          >
            {logo?.url ? (
              <Image
                src={logo.url}
                alt={logo.alt || siteTitle}
                width={logo.width || 120}
                height={logo.height || 40}
                className="h-10 w-auto object-contain"
                priority
              />
            ) : (
              <span className="txt-compact-xlarge-plus uppercase">
                {siteTitle}
              </span>
            )}
          </LocalizedClientLink>
        </div>

        {/* Center: Search */}
        <div className="flex-1 flex justify-center px-4">
          <NavSearchInput />
        </div>

        {/* Right: Contact phone (if set) + Account + Cart */}
        <div className="flex items-center gap-x-2 h-full">
          {phone && (
            <a
              href={phone.href}
              className={clx(
                "inline-flex items-center gap-x-1.5 rounded-md px-2 py-1.5",
                "text-ui-fg-subtle hover:text-ui-fg-base bg-ui-bg-subtle-hover",
                "transition-fg focus-visible:shadow-borders-interactive-with-active focus-visible:outline-none",
                "border border-transparent hover:border-ui-border-base"
              )}
              aria-label={`Call us: ${phone.display}`}
              data-testid="nav-phone-link"
            >
              <Headphones className="size-4" />
              <span className="hidden sm:inline txt-compact-small font-medium">
                {phone.display}
              </span>
            </a>
          )}
          <AccountIconButton />
          {children}
        </div>
      </div>
    )
  }

  function renderMobile() {
    return (
      <div className="flex items-center justify-between h-full">
        {/* Left: Menu (on scroll desktop / always mobile) and Logo */}
        <div className="flex items-center h-full gap-x-2">
          <div className="h-full flex items-center lg:hidden">
            <SideMenu regions={regions} categories={categories} />
          </div>
          <div className="flex items-center h-full">
            <LocalizedClientLink
              href="/"
              className="hover:text-ui-fg-base"
              data-testid="nav-store-link"
            >
              {logo?.url ? (
                <Image
                  src={logo.url}
                  alt={logo.alt || siteTitle}
                  width={logo.width || 120}
                  height={logo.height || 40}
                  className="h-10 w-auto object-contain"
                  priority
                />
              ) : (
                <span className="txt-compact-xlarge-plus uppercase">
                  {siteTitle}
                </span>
              )}
            </LocalizedClientLink>
          </div>
        </div>

        {/* Right: Contact phone (if set) + Account + Cart */}
        <div className="flex items-center gap-x-2 h-full">
          {phone && (
            <a
              href={phone.href}
              className={clx(
                "inline-flex items-center gap-x-1.5 rounded-md p-1.5 min-w-[2rem] justify-center",
                "text-ui-fg-subtle hover:text-ui-fg-base hover:bg-ui-bg-subtle-hover",
                "transition-fg focus-visible:shadow-borders-interactive-with-active focus-visible:outline-none"
              )}
              aria-label={`Call us: ${phone.display}`}
              data-testid="nav-phone-link"
            >
              <Headphones className="size-4" />
            </a>
          )}
          <AccountIconButton />
          {children}
        </div>
      </div>
    )
  }

  return (
    <header className="relative mx-auto border-b duration-200 bg-ui-bg-base border-ui-border-base h-16 z-10">
      <nav className="content-container txt-xsmall-plus text-ui-fg-subtle text-small-regular h-full">
        <div className="hidden lg:block h-full">{renderDesktop()}</div>
        <div className="lg:hidden h-full">{renderMobile()}</div>
      </nav>
    </header>
  )
}

export default NavFirstBar
