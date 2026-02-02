"use client"

import { Disclosure } from "@headlessui/react"
import { ChevronDownMini } from "@medusajs/icons"
import { clx } from "@medusajs/ui"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"

type SideMenuCategoriesProps = {
  categories: HttpTypes.StoreProductCategory[]
  onLinkClick?: () => void
}

const SideMenuCategories = ({
  categories,
  onLinkClick,
}: SideMenuCategoriesProps) => {
  return (
    <ul className="flex flex-col py-1">
      {categories.map((category) => {
        const hasChildren = category.category_children?.length > 0
        if (!hasChildren) {
          return (
            <li key={category.id}>
              <LocalizedClientLink
                href={`/categories/${category.handle}`}
                className="block hover:bg-ui-bg-base-hover px-4 py-3 text-base font-medium"
                onClick={onLinkClick}
                data-testid="nav-menu-category-link"
              >
                {category.name}
              </LocalizedClientLink>
            </li>
          )
        }
        return (
          <li key={category.id} className="w-full">
            <Disclosure>
              {({ open: disclosureOpen }) => (
                <>
                  <Disclosure.Button
                    className={clx(
                      "flex items-center justify-between w-full text-base hover:bg-ui-bg-base-hover px-4 py-3 font-medium"
                    )}
                  >
                    <span>{category.name}</span>
                    <ChevronDownMini
                      className={clx(
                        "transition-transform duration-150",
                        disclosureOpen && "-rotate-180"
                      )}
                    />
                  </Disclosure.Button>
                  <Disclosure.Panel className="flex flex-col">
                    <LocalizedClientLink
                      href={`/categories/${category.handle}`}
                      className="text-base hover:bg-ui-bg-base-hover px-4 py-3"
                      onClick={onLinkClick}
                      data-testid="nav-menu-category-link"
                    >
                      All {category.name}
                    </LocalizedClientLink>
                    {category.category_children?.map((child) => (
                      <LocalizedClientLink
                        key={child.id}
                        href={`/categories/${category.handle}/${child.handle}`}
                        className="text-base hover:bg-ui-bg-base-hover px-4 py-3"
                        onClick={onLinkClick}
                        data-testid="nav-menu-category-link"
                      >
                        {child.name}
                      </LocalizedClientLink>
                    ))}
                  </Disclosure.Panel>
                </>
              )}
            </Disclosure>
          </li>
        )
      })}
    </ul>
  )
}

export default SideMenuCategories
