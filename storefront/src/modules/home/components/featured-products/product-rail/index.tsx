import { HttpTypes } from "@medusajs/types"
import { Text } from "@medusajs/ui"

import Container from "@modules/common/components/container-section"
import InteractiveLink from "@modules/common/components/interactive-link"
import ProductPreview from "@modules/products/components/product-preview"

export default function ProductRail({
  collection,
  region,
}: {
  collection: HttpTypes.StoreCollection
  region: HttpTypes.StoreRegion
}) {
  const { products } = collection

  if (!products) {
    return null
  }

  return (
    <Container>
      <div className="flex justify-between mb-8">
        <Text className="txt-xlarge">{collection.title}</Text>
        <InteractiveLink href={`/collections/${collection.handle}`}>
          View all
        </InteractiveLink>
      </div>
      <ul className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-24 lg:gap-y-36">
        {products &&
          products.map((product) => (
            <li key={product.id}>
              <ProductPreview product={product} />
            </li>
          ))}
      </ul>
    </Container>
  )
}
