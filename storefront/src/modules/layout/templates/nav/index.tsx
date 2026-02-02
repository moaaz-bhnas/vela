import { Suspense } from "react"
import { listRegions } from "@lib/data/regions"
import { listCategories } from "@lib/data/categories"
import { getBrandingConfig } from "@lib/data/branding"
import { formatPhone } from "@lib/util/format-phone"
import { StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import NavFirstBar from "@modules/layout/components/nav-first-bar"
import NavSecondBar from "@modules/layout/components/nav-second-bar"
import CartButton from "@modules/layout/components/cart-button"

export default async function Nav() {
  const regions = await listRegions().then((regions: StoreRegion[]) => regions)
  const categories = await listCategories()
  const branding = await getBrandingConfig()

  const logo = branding?.logos?.main
  const siteTitle = branding?.site_title || "Medusa Store"
  const phone = formatPhone(branding?.contact_info?.phone)

  return (
    <div className="pb-28">
      <div className="fixed top-0 inset-x-0 z-50 group">
        <NavFirstBar
          regions={regions}
          categories={categories || []}
          logo={logo}
          siteTitle={siteTitle}
          phone={phone}
        >
          <Suspense
            fallback={
              <LocalizedClientLink
                className="hover:text-ui-fg-base flex gap-2"
                href="/cart"
                data-testid="nav-cart-link"
              >
                Cart (0)
              </LocalizedClientLink>
            }
          >
            <CartButton />
          </Suspense>
        </NavFirstBar>
        <NavSecondBar categories={categories || []} />
      </div>
    </div>
  )
}
