"use client"

import { Popover, Transition } from "@headlessui/react"
import { ShoppingBag } from "@medusajs/icons"
import { Button, Heading, Text, clx } from "@medusajs/ui"
import { Fragment } from "react"

import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import DeleteButton from "@modules/common/components/delete-button"
import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "@modules/products/components/thumbnail"
import { useTranslations } from "next-intl"

const CartDropdown = ({
  cart: cartState,
}: {
  cart?: HttpTypes.StoreCart | null
}) => {
  const t = useTranslations("CartDropdown")
  const tNav = useTranslations("Nav")

  const totalItems =
    cartState?.items?.reduce((acc, item) => {
      return acc + item.quantity
    }, 0) || 0

  const subtotal = cartState?.subtotal ?? 0

  const cartPanelId = "nav-cart-dropdown-panel"

  return (
    <div className="z-50 h-full">
      <Popover className="relative h-full flex items-center">
        {function renderPopover({
          open,
          close,
        }: {
          open: boolean
          close: () => void
        }) {
          return (
            <>
              <Popover.Button
                type="button"
                className={clx(
                  "transition-fg relative inline-flex items-center justify-center rounded-md outline-none",
                  "disabled:bg-ui-bg-disabled disabled:shadow-buttons-neutral disabled:text-ui-fg-disabled disabled:after:hidden",
                  "text-ui-fg-subtle bg-ui-button-transparent hover:bg-ui-button-transparent-hover active:bg-ui-button-transparent-pressed",
                  "focus-visible:shadow-buttons-neutral-focus focus-visible:bg-ui-bg-base disabled:!bg-transparent disabled:!shadow-none",
                  "min-h-11 min-w-11 p-2"
                )}
                data-testid="nav-cart-link"
                aria-label={tNav("cartAria", { count: totalItems })}
                aria-expanded={open}
                aria-haspopup="dialog"
                aria-controls={cartPanelId}
              >
                <ShoppingBag />
                {totalItems > 0 && (
                  <span
                    aria-live="polite"
                    aria-label={tNav("cartItemsCountAria", {
                      count: totalItems,
                    })}
                    className="absolute top-0.5 end-0.5 bg-ui-bg-interactive text-ui-fg-on-color text-xs rounded-full w-5 h-5 flex items-center justify-center border-2 border-ui-bg-base"
                  >
                    {totalItems}
                  </span>
                )}
              </Popover.Button>
              <Transition
                show={open}
                as={Fragment}
                enter="transition ease-out duration-200 motion-reduce:transition-none motion-reduce:duration-0"
                enterFrom="opacity-0 translate-y-1 motion-reduce:translate-y-0"
                enterTo="opacity-100 translate-y-0"
                leave="transition ease-in duration-150 motion-reduce:transition-none motion-reduce:duration-0"
                leaveFrom="opacity-100 translate-y-0"
                leaveTo="opacity-0 translate-y-1 motion-reduce:translate-y-0"
              >
                <Popover.Panel
                  static
                  id={cartPanelId}
                  role="dialog"
                  aria-label={t("title")}
                  className={clx(
                    "z-nav-dropdown overflow-hidden rounded-rounded border border-ui-border-base bg-ui-bg-base shadow-elevation-card-rest",
                    "max-lg:fixed max-lg:start-4 max-lg:end-4 max-lg:top-[calc(var(--nav-first-bar-height)+0.25rem)] max-lg:mt-0 max-lg:w-auto",
                    "lg:absolute lg:end-0 lg:top-full lg:mt-1 lg:w-[calc(100vw-2rem)] lg:max-w-nav-panel",
                    "text-ui-fg-base"
                  )}
                  data-testid="nav-cart-dropdown"
                >
                  <div className="relative flex max-h-nav-panel flex-col overflow-hidden">
                    <div className="shrink-0 p-4 flex items-center justify-center">
                      <Heading
                        level="h3"
                        className="text-base leading-6 font-semibold"
                      >
                        {t("title")}
                      </Heading>
                    </div>
                    {cartState && cartState.items?.length ? (
                      <>
                        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 grid grid-cols-1 gap-y-stack p-px">
                          {cartState.items
                            .sort((a, b) => {
                              return (a.created_at ?? "") > (b.created_at ?? "")
                                ? -1
                                : 1
                            })
                            .map((item) => (
                              <div
                                className="grid grid-cols-[minmax(0,122px)_minmax(0,1fr)] gap-x-4"
                                key={item.id}
                                data-testid="cart-item"
                              >
                                <LocalizedClientLink
                                  href={`/products/${item.variant?.product?.handle}`}
                                  className="w-24"
                                >
                                  <Thumbnail
                                    thumbnail={item.variant?.product?.thumbnail}
                                    images={item.variant?.product?.images}
                                    size="square"
                                  />
                                </LocalizedClientLink>
                                <div className="flex flex-col justify-between flex-1">
                                  <div className="flex flex-col flex-1">
                                    <div className="flex items-start justify-between gap-2 min-w-0">
                                      <div className="flex flex-col min-w-0 flex-1 me-2">
                                        <Text
                                          size="small"
                                          className="text-sm leading-6 font-normal line-clamp-2 break-words"
                                          asChild
                                        >
                                          <LocalizedClientLink
                                            href={`/products/${item.variant?.product?.handle}`}
                                            data-testid="product-link"
                                          >
                                            {item.title}
                                          </LocalizedClientLink>
                                        </Text>
                                        <LineItemOptions
                                          variant={item.variant}
                                          data-testid="cart-item-variant"
                                          data-value={item.variant}
                                        />
                                        <Text
                                          size="small"
                                          data-testid="cart-item-quantity"
                                          data-value={item.quantity}
                                        >
                                          {t("quantity", {
                                            count: item.quantity,
                                          })}
                                        </Text>
                                      </div>
                                      <div className="flex justify-end">
                                        <LineItemPrice
                                          item={item}
                                          style="tight"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                  <DeleteButton
                                    id={item.id}
                                    className="mt-1"
                                    data-testid="cart-item-remove-button"
                                  >
                                    {t("remove")}
                                  </DeleteButton>
                                </div>
                              </div>
                            ))}
                        </div>
                        <div className="shrink-0 p-4 flex flex-col gap-y-4 text-xs leading-5 font-normal border-t border-ui-border-base">
                          <div className="flex items-center justify-between">
                            <Text
                              size="small"
                              className="text-ui-fg-base font-semibold"
                            >
                              {t("subtotal")}{" "}
                              <Text
                                size="small"
                                className="font-normal"
                                asChild
                              >
                                <span>{t("exclTaxes")}</span>
                              </Text>
                            </Text>
                            <Text
                              size="small"
                              className="text-base leading-6 font-semibold"
                              data-testid="cart-subtotal"
                              data-value={subtotal}
                            >
                              {convertToLocale({
                                amount: subtotal,
                                currency_code: cartState.currency_code,
                              })}
                            </Text>
                          </div>
                          <LocalizedClientLink href="/cart" passHref>
                            <Button
                              className="w-full min-h-11"
                              size="large"
                              data-testid="go-to-cart-button"
                            >
                              {t("goToCart")}
                            </Button>
                          </LocalizedClientLink>
                        </div>
                      </>
                    ) : (
                      <div className="min-h-0 flex-1 overflow-y-auto">
                        <div className="flex py-16 flex-col gap-y-4 items-center justify-center px-4">
                          <div className="bg-ui-bg-component text-xs leading-5 font-normal flex items-center justify-center w-6 h-6 rounded-full">
                            <Text size="small">0</Text>
                          </div>
                          <Text size="small" className="text-ui-fg-base">
                            {t("bagEmpty")}
                          </Text>
                          <div>
                            <LocalizedClientLink href="/store">
                              <>
                                <span className="sr-only">
                                  {t("goToAllProductsSr")}
                                </span>
                                <Button onClick={close}>
                                  {t("exploreProducts")}
                                </Button>
                              </>
                            </LocalizedClientLink>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </Popover.Panel>
              </Transition>
            </>
          )
        }}
      </Popover>
    </div>
  )
}

export default CartDropdown
