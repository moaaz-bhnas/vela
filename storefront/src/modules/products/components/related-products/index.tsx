import { getRegion } from "@lib/data/regions"
import { getProductsList } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"
import { Heading, Text } from "@medusajs/ui"
import ProductPreview from "../product-preview"

type RelatedProductsProps = {
  product: HttpTypes.StoreProduct
  countryCode: string
}

type StoreProductParamsWithTags = HttpTypes.StoreProductParams & {
  collection_id?: string[]
  tags?: string[]
}

type StoreProductWithTags = HttpTypes.StoreProduct & {
  tags?: { value: string }[]
}

export default async function RelatedProducts({
  product,
  countryCode,
}: RelatedProductsProps) {
  const region = await getRegion(countryCode)

  // edit this function to define your related products logic
  const queryParams: StoreProductParamsWithTags = {}
  if (region?.id) {
    queryParams.region_id = region.id
  }
  if (product.collection_id) {
    queryParams.collection_id = [product.collection_id]
  }
  if (product.tags) {
    queryParams.tags = product.tags
      .map((t) => t.value)
      .filter(Boolean) as string[]
  }

  const products = await getProductsList({
    queryParams,
    countryCode,
  }).then(({ response }) => {
    return response.products.filter(
      (responseProduct) => responseProduct.id !== product.id
    )
  })

  if (!products.length) {
    return null
  }

  return (
    <div className="flex flex-col gap-section-inner sm:gap-section-inner-lg">
      <div className="flex flex-col gap-block-gap">
        <Heading
          level="h2"
          className="text-ui-fg-base font-heading text-2xl sm:text-4xl font-bold"
        >
          Related products
        </Heading>
        <Text className="text-ui-fg-muted">
          You might also want to check out these products.
        </Text>
      </div>

      <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-section-inner">
        {products.map((product) => (
          <li key={product.id}>
            <ProductPreview product={product} />
          </li>
        ))}
      </ul>
    </div>
  )
}
