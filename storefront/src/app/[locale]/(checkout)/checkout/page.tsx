import { Metadata } from "next"
import { notFound, redirect } from "next/navigation"

import Container from "@modules/common/components/container-section"
import Wrapper from "@modules/checkout/components/payment-wrapper"
import CheckoutForm from "@modules/checkout/templates/checkout-form"
import CheckoutSummary from "@modules/checkout/templates/checkout-summary"
import { enrichLineItems, retrieveCart } from "@lib/data/cart"
import {
  normalizeCheckoutStepParam,
  resolveCheckoutStepParam,
} from "@lib/util/checkout-step"
import { HttpTypes } from "@medusajs/types"
import { getCustomer } from "@lib/data/customer"

export const metadata: Metadata = {
  title: "Checkout",
}

const fetchCart = async () => {
  const cart = await retrieveCart()
  if (!cart) {
    return notFound()
  }

  if (cart?.items?.length) {
    const enrichedItems = await enrichLineItems(cart?.items, cart?.region_id!)
    cart.items = enrichedItems as HttpTypes.StoreCartLineItem[]
  }

  return cart
}

export default async function Checkout({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ step?: string | string[] }>
}) {
  const { locale } = await params
  const sp = await searchParams
  const cart = await fetchCart()
  const resolved = resolveCheckoutStepParam(cart, sp.step)
  const normalized = normalizeCheckoutStepParam(sp.step)
  if (normalized !== resolved) {
    redirect(`/${locale}/checkout?step=${resolved}`)
  }
  const customer = await getCustomer()

  return (
    <Container
      noPadding
      className="grid grid-cols-1 lg:grid-cols-[1fr_416px] gap-x-8 lg:gap-x-40 gap-y-stack py-content-y"
    >
      <div className="order-2 min-w-0 lg:order-1">
        <Wrapper cart={cart}>
          <CheckoutForm cart={cart} customer={customer} />
        </Wrapper>
      </div>
      <div className="order-1 lg:order-2">
        <CheckoutSummary cart={cart} />
      </div>
    </Container>
  )
}
