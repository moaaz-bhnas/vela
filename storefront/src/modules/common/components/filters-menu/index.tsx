"use client"

import { Dialog, Transition } from "@headlessui/react"
import { Adjustments, XMark } from "@medusajs/icons"
import { Button, Heading, IconButton } from "@medusajs/ui"
import { Fragment, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useTranslations } from "next-intl"

type FiltersMenuProps = {
  /** Product count for the "View (n)" button. */
  resultCount?: number
  children: React.ReactNode
}

export default function FiltersMenu({
  resultCount,
  children,
}: FiltersMenuProps) {
  const t = useTranslations("FiltersMenu")
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const handleClearAll = () => {
    router.push(pathname)
  }

  return (
    <>
      <div className="relative flex h-full items-center shrink-0">
        <IconButton
          type="button"
          variant="transparent"
          size="small"
          data-testid="filter-sidebar-button"
          aria-label={t("openFilters")}
          onClick={() => setOpen(true)}
        >
          <Adjustments />
        </IconButton>
      </div>

      <Transition show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => setOpen(false)}>
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
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-0 sm:w-96 w-full justify-end">
              <Transition.Child
                as={Fragment}
                enter="transition ease-out duration-150"
                enterFrom="translate-x-full opacity-0"
                enterTo="translate-x-0 opacity-100"
                leave="transition ease-in duration-150"
                leaveFrom="translate-x-0 opacity-100"
                leaveTo="translate-x-full opacity-0"
              >
                <Dialog.Panel className="pointer-events-auto w-full flex flex-col h-full text-sm bg-ui-bg-base shadow">
                  <div
                    data-testid="filter-sidebar"
                    className="flex flex-col h-full"
                  >
                    {/* Header (stays at top) */}
                    <div className="flex-shrink-0 flex items-center justify-between py-2.5 ps-4 pe-2 border-b bg-ui-bg-base">
                      <Heading level="h3" className="font-heading">
                        {t("sortAndFilter")}
                      </Heading>
                      <IconButton
                        type="button"
                        variant="transparent"
                        data-testid="close-filter-sidebar-button"
                        aria-label={t("closeFilters")}
                        onClick={() => setOpen(false)}
                      >
                        <XMark />
                      </IconButton>
                    </div>

                    {/* Scrollable area: filters */}
                    <div className="flex-1 min-h-0 overflow-y-auto">
                      <div className="px-4 py-4">{children}</div>
                    </div>

                    {/* Sticky footer: Clear all + View (n) */}
                    <div className="flex-shrink-0 px-4 py-3 border-t flex gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        size="small"
                        className="flex-1"
                        onClick={handleClearAll}
                      >
                        {t("clearAll")}
                      </Button>
                      <Button
                        type="button"
                        size="small"
                        className="flex-1"
                        onClick={() => setOpen(false)}
                      >
                        {resultCount != null
                          ? t("viewCount", { count: resultCount })
                          : t("view")}
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
