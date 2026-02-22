"use client"

import { HttpTypes } from "@medusajs/types"
import Container from "@modules/common/components/container-section"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import NavSearchInput from "@modules/layout/components/nav-search-input"
import { useNavScroll } from "@modules/layout/components/nav-scroll-wrapper"
import { AnimatePresence, motion } from "motion/react"

type NavSecondBarProps = {
  categories: HttpTypes.StoreProductCategory[]
}

const NavSecondBar = ({ categories }: NavSecondBarProps) => {
  const isScrolled = useNavScroll()

  // Filter to only show parent categories (no parent_category), max 8
  const parentCategories = (
    categories?.filter((cat) => !cat.parent_category) || []
  ).slice(0, 8)

  return (
    <AnimatePresence>
      {!isScrolled ? (
        <motion.div
          initial={{
            y: "-100%",
            opacity: 0,
          }}
          animate={{
            y: "0%",
            opacity: 1,
          }}
          exit={{
            y: "-100%",
            opacity: 0,
          }}
          transition={{
            duration: 0.2,
          }}
          className="border-b border-ui-border-base bg-white h-12"
        >
          <nav className="flex items-center justify-center h-full overflow-x-auto">
            <Container
              noPadding
              className="flex items-center justify-center h-full overflow-x-auto"
            >
              <div className="flex items-center h-full w-full">
                {/* Desktop: Categories */}
                <div className="hidden lg:flex items-center gap-x-2 h-full text-ui-fg-subtle">
                  {parentCategories.map((category) => (
                    <LocalizedClientLink
                      key={category.id}
                      href={`/categories/${category.handle}`}
                      className="txt-compact-small hover:text-ui-fg-base whitespace-nowrap p-2"
                      data-testid="nav-category-link"
                    >
                      {category.name}
                    </LocalizedClientLink>
                  ))}
                  <span className="txt-compact-small text-ui-fg-subtle whitespace-nowrap p-2">
                    |
                  </span>
                  <LocalizedClientLink
                    href="/store"
                    className="txt-compact-small hover:text-ui-fg-base whitespace-nowrap p-2"
                    data-testid="nav-store-link"
                  >
                    Shop All
                  </LocalizedClientLink>
                  <LocalizedClientLink
                    href="/best-sellers"
                    className="txt-compact-small hover:text-ui-fg-base whitespace-nowrap p-2"
                    data-testid="nav-bestsellers-link"
                  >
                    Bestsellers
                  </LocalizedClientLink>
                </div>

                {/* Mobile: Search only */}
                <div className="flex lg:hidden items-center h-full w-full">
                  <NavSearchInput className="w-full" />
                </div>
              </div>
            </Container>
          </nav>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

export default NavSecondBar
