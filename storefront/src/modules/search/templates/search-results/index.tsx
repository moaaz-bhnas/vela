import type { HttpTypes } from "@medusajs/types"
import { Heading, Text } from "@medusajs/ui"
import { getProductsForClient } from "@lib/data/products"
import ProductListWithFilters from "@modules/store/templates/product-list-with-filters"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Divider from "@modules/common/components/divider"
import BestSellers from "@modules/home/components/best-sellers"
import ShopByCategory from "@modules/home/components/shop-by-category"
import Container from "@modules/common/components/container-section"

type SearchResultsTemplateProps = {
  query: string
  ids: string[]
  countryCode: string
  region: HttpTypes.StoreRegion
}

const SearchResultsTemplate = async ({
  query,
  ids,
  countryCode,
  region,
}: SearchResultsTemplateProps) => {
  const isEmpty = ids.length === 0

  if (isEmpty) {
    return (
      <>
        <Container className="flex justify-between w-full items-center">
          <div className="flex flex-col items-start">
            <Heading>No results for {decodeURI(query)}</Heading>
            <Text className="text-ui-fg-muted mt-1">
              Try one of the suggestions below or browse by category.
            </Text>
          </div>
          <LocalizedClientLink
            href="/store"
            className="txt-medium text-ui-fg-subtle hover:text-ui-fg-base"
          >
            Clear
          </LocalizedClientLink>
        </Container>

        <Container className="!py-0">
          <Divider />
        </Container>

        <Container>
          <BestSellers region={region} />
        </Container>
        <Container>
          <ShopByCategory />
        </Container>
      </>
    )
  }

  const initialData = await getProductsForClient(countryCode, { ids })

  return (
    <ProductListWithFilters
      initialData={initialData}
      title={`Search: ${decodeURI(query)}`}
      titleTestId="search-results-title"
      containerTestId="search-results-container"
    />
  )
}

export default SearchResultsTemplate
