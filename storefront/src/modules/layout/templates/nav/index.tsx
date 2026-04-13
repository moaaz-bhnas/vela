import { Suspense } from "react"
import { listRegions } from "@lib/data/regions"
import { listCategories } from "@lib/data/categories"
import { getBrandingConfig } from "@lib/data/branding"
import { formatPhone } from "@lib/util/format-phone"
import { StoreRegion } from "@medusajs/types"
import NavCartFallbackLink from "@modules/layout/components/nav-cart-fallback-link"
import NavFirstBar from "@modules/layout/components/nav-first-bar"
import NavSecondBar from "@modules/layout/components/nav-second-bar"
import CartButton from "@modules/layout/components/cart-button"
import { getTranslations } from "next-intl/server"

export default async function Nav() {
  const t = await getTranslations("Nav")
  const regions = await listRegions().then((regions: StoreRegion[]) => regions)
  const categories = await listCategories()
  const branding = await getBrandingConfig()

  const logo = branding?.logos?.main
  const siteTitle = branding?.site_title || t("defaultSiteTitle")
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
            fallback={<NavCartFallbackLink />}
          >
            <CartButton />
          </Suspense>
        </NavFirstBar>
        <NavSecondBar categories={categories || []} />
      </div>
    </div>
  )
}
