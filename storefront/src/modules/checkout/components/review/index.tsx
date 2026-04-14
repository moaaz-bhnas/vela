"use client"

import { Heading, Text, clx } from "@medusajs/ui"
import { HttpTypes } from "@medusajs/types"

import PaymentButton from "../payment-button"
import { useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"

const Review = ({ cart }: { cart: HttpTypes.StoreCart }) => {
  const t = useTranslations("Checkout")
  const searchParams = useSearchParams()

  const isOpen = searchParams.get("step") === "review"

  const cartWithGiftcards = cart as HttpTypes.StoreCart & {
    gift_cards?: { length: number }[] | null
  }
  const paidByGiftcard =
    cartWithGiftcards.gift_cards &&
    cartWithGiftcards.gift_cards.length > 0 &&
    cart?.total === 0

  const previousStepsCompleted =
    cart.shipping_address &&
    (cart.shipping_methods?.length ?? 0) > 0 &&
    (cart.payment_collection || paidByGiftcard)

  return (
    <div className="bg-ui-bg-base">
      <div className="flex flex-row items-center justify-between mb-6">
        <Heading
          level="h2"
          className={clx(
            "flex flex-row text-[32px] leading-[44px] font-normal gap-x-2 items-baseline",
            {
              "opacity-50 pointer-events-none select-none": !isOpen,
            }
          )}
        >
          {t("review")}
        </Heading>
      </div>
      {isOpen && previousStepsCompleted && (
        <>
          <div className="flex items-start gap-x-1 w-full mb-6">
            <div className="w-full">
              <Text className="text-sm leading-6 text-ui-fg-subtle mb-4 [&_a]:text-ui-fg-interactive [&_a]:underline [&_a]:underline-offset-2 [&_a]:hover:text-ui-fg-interactive-hover">
                {t("placeOrderLegal")}
              </Text>
            </div>
          </div>
          <div className="w-full max-w-md">
            <PaymentButton cart={cart} data-testid="submit-order-button" />
          </div>
        </>
      )}
    </div>
  )
}

export default Review
