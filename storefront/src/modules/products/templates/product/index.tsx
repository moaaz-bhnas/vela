import React, { Suspense } from "react"

import ImageGallery from "@modules/products/components/image-gallery"
import ProductActions from "@modules/products/components/product-actions"
import ProductOnboardingCta from "@modules/products/components/product-onboarding-cta"
import ProductTabs from "@modules/products/components/product-tabs"
import RelatedProducts from "@modules/products/components/related-products"
import ProductInfo from "@modules/products/templates/product-info"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
import { notFound } from "next/navigation"
import Container from "@modules/common/components/container-section"
import ProductActionsWrapper from "../product-actions-wrapper"
import { HttpTypes } from "@medusajs/types"
import TrackProductVisit from "@modules/products/components/track-product-visit"
import ProductJsonLd from "@modules/products/components/product-json-ld"

type ProductTemplateProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
}

const ProductTemplate: React.FC<ProductTemplateProps> = ({
  product,
  region,
  countryCode,
}) => {
  if (!product || !product.id) {
    return notFound()
  }

  return (
    <>
      <ProductJsonLd product={product} region={region} />
      <TrackProductVisit product={product} />

      <Container
        noPadding
        className="flex flex-col lg:flex-row lg:items-start py-stack relative gap-section-inner-lg"
        data-testid="product-container"
      >
        <div className="block w-full relative">
          <ImageGallery product={product} />
        </div>

        <div className="flex flex-col lg:sticky lg:top-24 lg:max-w-sm xl:max-w-md w-full gap-y-6">
          <ProductInfo product={product} />
          <ProductOnboardingCta />
          <Suspense
            fallback={
              <ProductActions
                disabled={true}
                product={product}
                region={region}
              />
            }
          >
            <ProductActionsWrapper id={product.id} region={region} />
          </Suspense>
          <ProductTabs product={product} />
        </div>
      </Container>

      <Container data-testid="related-products-container">
        <Suspense fallback={<SkeletonRelatedProducts />}>
          <RelatedProducts product={product} countryCode={countryCode} />
        </Suspense>
      </Container>
    </>
  )
}

export default ProductTemplate
