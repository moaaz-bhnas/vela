"use client"

import { Dialog, Transition } from "@headlessui/react"
import { ArrowRightMini, BarsThree, XMark } from "@medusajs/icons"
import { Button, IconButton, Text, clx, useToggleState } from "@medusajs/ui"
import { Fragment, useState } from "react"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import NavSearchInput from "../nav-search-input"
import SideMenuCategories from "../side-menu-categories"
import CountrySelect from "../country-select"
import { HttpTypes } from "@medusajs/types"
import { useTranslations } from "next-intl"

type SideMenuProps = {
  regions: HttpTypes.StoreRegion[] | null
  categories: HttpTypes.StoreProductCategory[] | null
  storeLocales: HttpTypes.StoreLocale[]
}

const SideMenu = ({ regions, categories, storeLocales }: SideMenuProps) => {
  const t = useTranslations("Nav")
  const tFooter = useTranslations("Footer")
  const toggleState = useToggleState()
  const [open, setOpen] = useState(false)

  const parentCategories =
    categories?.filter((cat) => !cat.parent_category) ?? []

  return (
    <>
      <div className="relative flex h-full items-center">
        <IconButton
          type="button"
          variant="transparent"
          size="base"
          data-testid="nav-menu-button"
          aria-label={t("openMenu")}
          onClick={() => setOpen(true)}
          className="!overflow-auto min-h-11 min-w-11"
        >
          <BarsThree />
        </IconButton>
      </div>

      <Transition show={open} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => setOpen(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="transition ease-out duration-150"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-ui-bg-base/80 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <div className="pointer-events-none fixed inset-y-0 left-0 flex max-w-full pr-10 sm:pr-0 sm:max-w-[33.333%] 2xl:max-w-[25%] w-full">
                <Transition.Child
                  as={Fragment}
                  enter="transition ease-out duration-150"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="transition ease-in duration-150"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <Dialog.Panel className="pointer-events-auto w-full flex flex-col h-full text-sm bg-ui-bg-base shadow">
                    <div
                      data-testid="nav-menu-popup"
                      className="flex flex-col h-full"
                    >
                      {/* Scrollable area: close, search, categories, shipping, copyright */}
                      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col divide-y">
                        <div
                          className="flex justify-end py-2.5 px-2"
                          id="xmark"
                        >
                          <IconButton
                            type="button"
                            variant="transparent"
                            data-testid="close-menu-button"
                            aria-label={t("closeMenu")}
                            onClick={() => setOpen(false)}
                          >
                            <XMark />
                          </IconButton>
                        </div>

                        <div className="px-4 py-4">
                          <NavSearchInput onNavigate={() => setOpen(false)} />
                        </div>

                        {/* Categories */}
                        <SideMenuCategories
                          categories={parentCategories}
                          onLinkClick={() => setOpen(false)}
                        />

                        {/* Shipping to */}
                        <div
                          className="flex justify-between items-center px-4 py-3"
                          onMouseEnter={toggleState.open}
                          onMouseLeave={toggleState.close}
                        >
                          {regions && (
                            <CountrySelect
                              toggleState={toggleState}
                              regions={regions}
                              storeLocales={storeLocales}
                            />
                          )}
                          <ArrowRightMini
                            className={clx(
                              "transition-transform duration-150",
                              toggleState.state ? "-rotate-90" : ""
                            )}
                          />
                        </div>
                        <Text className="txt-compact-small text-ui-fg-muted px-4 py-3">
                          {tFooter("copyright", {
                            year: new Date().getFullYear(),
                          })}
                        </Text>
                      </div>

                      {/* Sticky footer: Shop all */}
                      <div className="flex-shrink-0 px-4 py-3 border-t">
                        <Button className="w-full" size="large" asChild>
                          <LocalizedClientLink
                            href="/store"
                            onClick={() => setOpen(false)}
                            data-testid="nav-menu-shop-all-link"
                          >
                            {t("shopAllShort")}
                          </LocalizedClientLink>
                        </Button>
                      </div>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}

export default SideMenu
