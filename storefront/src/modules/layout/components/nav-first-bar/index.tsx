import { Suspense } from "react"
import Image from "next/image"

import { StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import SideMenu from "@modules/layout/components/side-menu"
import DesktopSideMenu from "@modules/layout/components/desktop-side-menu"
import AccountIconButton from "@modules/layout/components/account-icon-button"
import NavSearchInput from "@modules/layout/components/nav-search-input"

type NavFirstBarProps = {
  regions: StoreRegion[]
  logo?: { url?: string; alt?: string; width?: number; height?: number } | null
  siteTitle: string
}

const NavFirstBar = ({ regions, logo, siteTitle }: NavFirstBarProps) => {
  function renderDesktop() {
    return (
      <div className="flex items-center justify-between h-16">
        {/* Left: Menu and Logo */}
        <div className="flex items-center h-full gap-x-4">
          {/* Desktop: Show menu icon only when scrolled */}
          <DesktopSideMenu regions={regions} />
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

        {/* Center: Search */}
        <div className="flex-1 flex justify-center px-4">
          <NavSearchInput />
        </div>

        {/* Right: Account and Cart */}
        <div className="flex items-center gap-x-4 h-full">
          <AccountIconButton />
          <Suspense
            fallback={
              <LocalizedClientLink
                className="hover:text-ui-fg-base flex gap-2"
                href="/cart"
                data-testid="nav-cart-link"
              >
                Cart (0)
              </LocalizedClientLink>
            }
          >
            <CartButton />
          </Suspense>
        </div>
      </div>
    )
  }

  function renderMobile() {
    return (
      <div className="flex items-center justify-between h-16">
        {/* Left: Menu (on scroll desktop / always mobile) and Logo */}
        <div className="flex items-center h-full gap-x-4">
          <div className="h-full flex items-center lg:hidden">
            <SideMenu regions={regions} />
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

        {/* Right: Account and Cart */}
        <div className="flex items-center gap-x-4 h-full">
          <AccountIconButton />
          <Suspense
            fallback={
              <LocalizedClientLink
                className="hover:text-ui-fg-base flex gap-2"
                href="/cart"
                data-testid="nav-cart-link"
              >
                Cart (0)
              </LocalizedClientLink>
            }
          >
            <CartButton />
          </Suspense>
        </div>
      </div>
    )
  }

  return (
    <header className="relative mx-auto border-b duration-200 bg-white border-ui-border-base">
      <nav className="content-container txt-xsmall-plus text-ui-fg-subtle text-small-regular">
        <div className="hidden lg:block">{renderDesktop()}</div>
        <div className="lg:hidden">{renderMobile()}</div>
      </nav>
    </header>
  )
}

export default NavFirstBar
