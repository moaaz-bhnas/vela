import Container from "@modules/common/components/container-section"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ChevronDown from "@modules/common/icons/chevron-down"
import MedusaCTA from "@modules/layout/components/medusa-cta"
import { getBrandingSeo } from "@lib/util/metadata"
import { getTranslations } from "next-intl/server"

export default async function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const seo = await getBrandingSeo()
  const t = await getTranslations("Checkout")

  return (
    <div className="w-full bg-ui-bg-base relative lg:min-h-screen">
      <div className="h-16 bg-ui-bg-base border-b border-ui-border-base">
        <nav className="flex h-full items-center justify-between">
          <Container
            noPadding
            className="flex h-full items-center justify-between w-full"
          >
            <LocalizedClientLink
              href="/cart"
              className="text-xs leading-5 font-semibold text-ui-fg-base flex items-center gap-x-2 uppercase flex-1 basis-0"
              data-testid="back-to-cart-link"
            >
              <ChevronDown className="rotate-90" size={16} />
              <span className="mt-px hidden lg:block txt-compact-plus text-ui-fg-subtle hover:text-ui-fg-base ">
                {t("backToCart")}
              </span>
              <span className="mt-px block lg:hidden txt-compact-plus text-ui-fg-subtle hover:text-ui-fg-base">
                {t("back")}
              </span>
            </LocalizedClientLink>
            <LocalizedClientLink
              href="/"
              className="txt-compact-xlarge-plus text-ui-fg-subtle hover:text-ui-fg-base uppercase"
              data-testid="store-link"
            >
              {seo.siteTitle}
            </LocalizedClientLink>
            <div className="flex-1 basis-0" />
          </Container>
        </nav>
      </div>
      <div className="relative" data-testid="checkout-container">
        {children}
      </div>
      <div className="py-4 w-full flex items-center justify-center">
        <MedusaCTA />
      </div>
    </div>
  )
}
