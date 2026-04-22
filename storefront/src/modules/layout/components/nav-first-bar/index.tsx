"use client"

import Image from "next/image"

import { HttpTypes, StoreProductCategory, StoreRegion } from "@medusajs/types"
import { clx } from "@medusajs/ui"
import { AnimatePresence, motion } from "motion/react"
import Container from "@modules/common/components/container-section"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import SideMenu from "@modules/layout/components/side-menu"
import AccountIconButton from "@modules/layout/components/account-icon-button"
import NavSearchInput from "@modules/layout/components/nav-search-input"
import RegionLanguageSwitcher from "@modules/layout/components/region-language-switcher"
import { useNavScroll } from "@modules/layout/components/nav-scroll-wrapper"

type NavFirstBarProps = {
  regions: StoreRegion[]
  categories: StoreProductCategory[]
  logo?: { url?: string; alt?: string; width?: number; height?: number } | null
  siteTitle: string
  storeLocales: HttpTypes.StoreLocale[]
  children: React.ReactNode
}

const NavFirstBar = ({
  regions,
  categories,
  logo,
  siteTitle,
  storeLocales,
  children,
}: NavFirstBarProps) => {
  const isScrolled = useNavScroll()

  function renderDesktop() {
    return (
      <div className="flex items-center justify-between h-full">
        {/* Left: Menu and Logo */}
        <div className="flex items-center h-full">
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
                className="h-full flex items-center"
              >
                <SideMenu
                  regions={regions}
                  categories={categories}
                  storeLocales={storeLocales}
                />
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

        {/* Right: Region/language + Account + Cart */}
        <div className="flex items-center gap-x-2 h-full">
          <RegionLanguageSwitcher
            regions={regions}
            storeLocales={storeLocales}
          />
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
            <SideMenu
              regions={regions}
              categories={categories}
              storeLocales={storeLocales}
            />
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

        {/* Right: Region/language + Account + Cart */}
        <div className="flex items-center gap-x-2 h-full">
          <RegionLanguageSwitcher
            regions={regions}
            storeLocales={storeLocales}
          />
          <AccountIconButton />
          {children}
        </div>
      </div>
    )
  }

  return (
    <header className="relative mx-auto h-[var(--nav-first-bar-height)] border-b border-ui-border-base bg-ui-bg-base duration-200 z-10">
      <nav className="txt-xsmall-plus text-ui-fg-subtle text-xs leading-5 font-normal h-full">
        <Container noPadding className="h-full">
          <div className="hidden lg:block h-full">{renderDesktop()}</div>
          <div className="lg:hidden h-full">{renderMobile()}</div>
        </Container>
      </nav>
    </header>
  )
}

export default NavFirstBar
