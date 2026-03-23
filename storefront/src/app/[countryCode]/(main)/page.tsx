import { Metadata } from "next"
import Carousel from "@modules/home/components/carousel"
import ShopByCategory from "@modules/home/components/shop-by-category"
import BestSellers from "@modules/home/components/best-sellers"
import RecentlyVisited from "@modules/home/components/recently-visited"
import { getCollectionsWithProducts } from "@lib/data/collections"
import { getRegion } from "@lib/data/regions"
import { getBrandingConfig } from "@lib/data/branding"
import { getPersonalizationCategoryIds } from "@lib/data/cookies"
import Container from "@modules/common/components/container-section"
import { getBrandingSeo } from "@lib/util/metadata"

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getBrandingSeo()

  return {
    title: "Home",
    description: seo.siteTagline || seo.defaultDescription,
    openGraph: {
      title: seo.siteTitle,
      description: seo.siteTagline || seo.defaultDescription,
      images: seo.defaultOgImage ? [seo.defaultOgImage] : [],
    },
  }
}

export default async function Home({
  params,
}: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await params
  const collections = await getCollectionsWithProducts(countryCode)
  const region = await getRegion(countryCode)
  const branding = await getBrandingConfig()

  if (!collections || !region) {
    return null
  }

  const carouselSlides =
    branding?.carousel_slides && branding.carousel_slides.length > 0
      ? branding.carousel_slides
      : null

  const categoryIds = await getPersonalizationCategoryIds()
  const hasPersonalizedCategories = categoryIds.length > 0

  return (
    <>
      <Container className="pt-8">
        {carouselSlides && <Carousel carouselSlides={carouselSlides} />}
      </Container>

      <Container>
        <RecentlyVisited region={region} />
      </Container>

      {hasPersonalizedCategories ? (
        <>
          <Container>
            <BestSellers region={region} />
          </Container>
          <Container>
            <ShopByCategory />
          </Container>
        </>
      ) : (
        <>
          <Container>
            <ShopByCategory />
          </Container>
          <Container>
            <BestSellers region={region} />
          </Container>
        </>
      )}
    </>
  )
}
