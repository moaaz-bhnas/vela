"use client"

import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import NavSearchInput from "@modules/layout/components/nav-search-input"
import { useNavScroll } from "@modules/layout/components/nav-scroll-wrapper"
import { clx } from "@medusajs/ui"

type NavSecondBarProps = {
  categories: HttpTypes.StoreProductCategory[]
}

const NavSecondBar = ({ categories }: NavSecondBarProps) => {
  const isScrolled = useNavScroll()

  // Filter to only show parent categories (no parent_category)
  const parentCategories =
    categories?.filter((cat) => !cat.parent_category) || []

  return (
    <div
      className={clx(
        "border-b border-ui-border-base bg-white transition-all duration-200",
        isScrolled ? "hidden" : "block"
      )}
    >
      <nav className="content-container flex items-center justify-center h-12 overflow-x-auto">
        <div className="flex items-center gap-x-6 h-full w-full">
          {/* Desktop: Categories */}
          <div className="hidden lg:flex items-center gap-x-6 h-full">
            {parentCategories.map((category) => (
              <LocalizedClientLink
                key={category.id}
                href={`/categories/${category.handle}`}
                className="txt-compact-small hover:text-ui-fg-base whitespace-nowrap"
                data-testid="nav-category-link"
              >
                {category.name}
              </LocalizedClientLink>
            ))}
            <LocalizedClientLink
              href="/bestsellers"
              className="txt-compact-small hover:text-ui-fg-base whitespace-nowrap"
              data-testid="nav-bestsellers-link"
            >
              Bestsellers
            </LocalizedClientLink>
          </div>

          {/* Mobile: Search only */}
          <div className="flex lg:hidden items-center h-full w-full px-4">
            <NavSearchInput className="w-full" />
          </div>
        </div>
      </nav>
    </div>
  )
}

export default NavSecondBar
