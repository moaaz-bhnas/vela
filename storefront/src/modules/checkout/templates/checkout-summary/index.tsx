import { Heading } from "@medusajs/ui"
import { HttpTypes } from "@medusajs/types"
import { getTranslations } from "next-intl/server"

import ItemsPreviewTemplate from "@modules/cart/templates/preview"
import DiscountCode from "@modules/checkout/components/discount-code"
import CartTotals from "@modules/common/components/cart-totals"
import Divider from "@modules/common/components/divider"

const CheckoutSummary = async ({ cart }: { cart: HttpTypes.StoreCart }) => {
  const t = await getTranslations("Checkout")

  return (
    <div className="sticky top-0 flex flex-col-reverse lg:flex-col gap-y-stack py-stack lg:py-0 ">
      <div className="w-full bg-ui-bg-base flex flex-col">
        <Divider className="my-6 lg:hidden" />
        <Heading
          level="h2"
          className="flex flex-row text-[32px] leading-[44px] font-normal items-baseline"
        >
          {t("inYourCart")}
        </Heading>
        <Divider className="my-6" />
        <CartTotals totals={cart} />
        <ItemsPreviewTemplate items={cart?.items} />
        <div className="my-6">
          <DiscountCode cart={cart} />
        </div>
      </div>
    </div>
  )
}

export default CheckoutSummary
