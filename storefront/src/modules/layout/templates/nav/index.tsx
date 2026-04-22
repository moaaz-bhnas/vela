import { Suspense } from "react"

import { listCategories } from "@lib/data/categories"
import { getBrandingConfig } from "@lib/data/branding"
import { listRegions } from "@lib/data/regions"
import { listStoreLocales } from "@lib/data/locales"
import { StoreRegion } from "@medusajs/types"
import NavCartFallbackLink from "@modules/layout/components/nav-cart-fallback-link"
import NavFirstBar from "@modules/layout/components/nav-first-bar"
import NavSecondBar from "@modules/layout/components/nav-second-bar"
import CartButton from "@modules/layout/components/cart-button"
import { getLocale, getTranslations } from "next-intl/server"

export default async function Nav() {
  const t = await getTranslations("Nav")
  const locale = await getLocale()
  const [regions, categories, storeLocales] = await Promise.all([
    listRegions().then((regions: StoreRegion[]) => regions),
    listCategories(),
    listStoreLocales(),
  ])
  const branding = await getBrandingConfig(locale)

  const logo = branding?.logos?.main
  const siteTitle = branding?.site_title || t("defaultSiteTitle")

  return (
    <div className="pb-[calc(7rem+env(safe-area-inset-top,0px))]">
      <div className="fixed top-0 inset-x-0 z-50 group pt-[env(safe-area-inset-top,0px)]">
        <NavFirstBar
          regions={regions}
          categories={categories || []}
          logo={logo}
          siteTitle={siteTitle}
          storeLocales={storeLocales}
        >
          <Suspense fallback={<NavCartFallbackLink />}>
            <CartButton />
          </Suspense>
        </NavFirstBar>
        <NavSecondBar categories={categories || []} />
      </div>
    </div>
  )
}
