import { listRegions } from "@lib/data/regions"
import { listCategories } from "@lib/data/categories"
import { getBrandingConfig } from "@lib/data/branding"
import { StoreRegion } from "@medusajs/types"
import NavFirstBar from "@modules/layout/components/nav-first-bar"
import NavSecondBar from "@modules/layout/components/nav-second-bar"

export default async function Nav() {
  const regions = await listRegions().then((regions: StoreRegion[]) => regions)
  const categories = await listCategories()
  const branding = await getBrandingConfig()

  const logo = branding?.logos?.main
  const siteTitle = branding?.site_title || "Medusa Store"

  return (
    <div className="sticky top-0 inset-x-0 z-50 group">
      <NavFirstBar regions={regions} logo={logo} siteTitle={siteTitle} />
      <NavSecondBar categories={categories || []} />
    </div>
  )
}
