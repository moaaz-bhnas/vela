import { HttpTypes } from "@medusajs/types"

type Props = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
}

export default function ProductJsonLd({ product, region }: Props) {
  const cheapestVariant = product.variants
    ?.filter((v) => v.calculated_price?.calculated_amount != null)
    .sort(
      (a, b) =>
        (a.calculated_price!.calculated_amount ?? Infinity) -
        (b.calculated_price!.calculated_amount ?? Infinity)
    )[0]

  const price = cheapestVariant?.calculated_price?.calculated_amount
  const currency = cheapestVariant?.calculated_price?.currency_code?.toUpperCase()
  const inStock =
    !cheapestVariant ||
    (cheapestVariant.inventory_quantity ?? 1) > 0 ||
    cheapestVariant.allow_backorder

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description ?? undefined,
    image: product.images?.map((img) => img.url) ?? (product.thumbnail ? [product.thumbnail] : undefined),
    sku: product.handle,
    brand: product.collection?.title
      ? { "@type": "Brand", name: product.collection.title }
      : undefined,
  }

  if (price != null && currency) {
    schema.offers = {
      "@type": "Offer",
      priceCurrency: currency,
      price: price,
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: `/${region.countries?.[0]?.iso_2 ?? ""}/products/${product.handle}`,
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
