import { Dialog, Transition } from "@headlessui/react"
import { Button, clx } from "@medusajs/ui"
import { useTranslations } from "next-intl"
import React, { Fragment, useMemo } from "react"

import useToggleState from "@lib/hooks/use-toggle-state"
import ChevronDown from "@modules/common/icons/chevron-down"
import X from "@modules/common/icons/x"

import { getProductPrice } from "@lib/util/get-product-price"
import OptionSelect from "./option-select"
import { HttpTypes } from "@medusajs/types"

type MobileActionsProps = {
  product: HttpTypes.StoreProduct
  variant?: HttpTypes.StoreProductVariant
  options: Record<string, string | undefined>
  updateOptions: (title: string, value: string) => void
  inStock?: boolean
  handleAddToCart: () => void
  isAdding?: boolean
  show: boolean
  optionsDisabled: boolean
}

const MobileActions: React.FC<MobileActionsProps> = ({
  product,
  variant,
  options,
  updateOptions,
  inStock,
  handleAddToCart,
  isAdding,
  show,
  optionsDisabled,
}) => {
  const t = useTranslations("Product")
  const { state, open, close } = useToggleState()

  const price = getProductPrice({
    product: product,
    variantId: variant?.id,
  })

  const selectedPrice = useMemo(() => {
    if (!price) {
      return null
    }
    const { variantPrice, cheapestPrice } = price

    return variantPrice || cheapestPrice || null
  }, [price])

  return (
    <>
      <div
        className={clx("lg:hidden inset-x-0 bottom-0 fixed", {
          "pointer-events-none": !show,
        })}
      >
        <Transition
          as={Fragment}
          show={show}
          enter="ease-in-out duration-300 motion-reduce:transition-none motion-reduce:duration-0"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-300 motion-reduce:transition-none motion-reduce:duration-0"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div
            className="bg-ui-bg-base flex flex-col gap-y-3 justify-center items-center text-base leading-6 font-normal px-4 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] h-full w-full border-t border-ui-border-base"
            data-testid="mobile-actions"
          >
            <div className="flex items-center gap-x-2">
              <span data-testid="mobile-title">{product.title}</span>
              <span>—</span>
              {selectedPrice ? (
                <div className="flex items-end gap-x-2 text-ui-fg-base">
                  {selectedPrice.price_type === "sale" && (
                    <p>
                      <span className="line-through text-xs leading-5 font-normal">
                        {selectedPrice.original_price}
                      </span>
                    </p>
                  )}
                  <span
                    className={clx({
                      "text-ui-fg-interactive":
                        selectedPrice.price_type === "sale",
                    })}
                  >
                    {selectedPrice.calculated_price}
                  </span>
                </div>
              ) : (
                <div></div>
              )}
            </div>
            <div className="grid grid-cols-2 w-full gap-x-4">
              <Button
                onClick={open}
                variant="secondary"
                className="w-full min-h-11"
                data-testid="mobile-actions-button"
              >
                <div className="flex items-center justify-between w-full">
                  <span>
                    {variant
                      ? Object.values(options).join(" / ")
                      : t("selectOptions")}
                  </span>
                  <ChevronDown />
                </div>
              </Button>
              <Button
                onClick={handleAddToCart}
                disabled={!inStock || !variant}
                className="w-full min-h-11"
                isLoading={isAdding}
                data-testid="mobile-cart-button"
              >
                {!variant
                  ? t("selectVariant")
                  : !inStock
                  ? t("outOfStock")
                  : t("addToCart")}
              </Button>
            </div>
          </div>
        </Transition>
      </div>
      <Transition appear show={state} as={Fragment}>
        <Dialog as="div" className="relative z-[75]" onClose={close}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300 motion-reduce:transition-none motion-reduce:duration-0"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200 motion-reduce:transition-none motion-reduce:duration-0"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-ui-bg-base/80 backdrop-blur-sm motion-reduce:backdrop-blur-none" />
          </Transition.Child>

          <div className="fixed bottom-0 inset-x-0 pb-[env(safe-area-inset-bottom,0px)]">
            <div className="flex min-h-full h-full items-center justify-center text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300 motion-reduce:transition-none motion-reduce:duration-0"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200 motion-reduce:transition-none motion-reduce:duration-0"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Dialog.Panel
                  className="w-full h-full max-h-[100dvh] transform overflow-hidden overflow-y-auto text-left flex flex-col gap-y-3 outline-none"
                  data-testid="mobile-actions-modal"
                >
                  <div className="w-full flex justify-end pr-4 pt-2">
                    <button
                      type="button"
                      onClick={close}
                      className="bg-ui-bg-base min-h-12 min-w-12 h-12 w-12 rounded-full text-ui-fg-base flex justify-center items-center shadow-elevation-card-rest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ui-fg-interactive focus-visible:ring-offset-2"
                      data-testid="close-modal-button"
                      aria-label={t("closeOptions")}
                    >
                      <X />
                    </button>
                  </div>
                  <div className="bg-ui-bg-base px-6 py-content-y">
                    {(product.variants?.length ?? 0) > 1 && (
                      <div className="flex flex-col gap-y-6">
                        {(product.options || []).map((option) => {
                          return (
                            <div key={option.id}>
                              <OptionSelect
                                option={option}
                                current={options[(option.title ?? "").toLowerCase()]}
                                updateOption={updateOptions}
                                title={option.title ?? ""}
                                disabled={optionsDisabled}
                              />
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}

export default MobileActions
