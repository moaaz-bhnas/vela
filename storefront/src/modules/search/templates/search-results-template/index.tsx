import type { HttpTypes } from "@medusajs/types"
import { Heading, Text } from "@medusajs/ui"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Divider from "@modules/common/components/divider"
import BestSellers from "@modules/home/components/best-sellers"
import ShopByCategory from "@modules/home/components/shop-by-category"
import Container from "@modules/common/components/container-section"

type SearchResultsTemplateProps = {
  query: string
  ids: string[]
  sortBy?: SortOptions
  page?: string
  countryCode: string
  region: HttpTypes.StoreRegion
}

const SearchResultsTemplate = ({
  query,
  ids,
  sortBy,
  page,
  countryCode,
  region,
}: SearchResultsTemplateProps) => {
  const pageNumber = page ? parseInt(page) : 1
  const isEmpty = ids.length === 0

  return (
    <>
      <Container className="flex justify-between w-full items-center">
        <div className="flex flex-col items-start">
          {isEmpty ? (
            <>
              <Heading>No results for {decodeURI(query)}</Heading>
              <Text className="text-ui-fg-muted mt-1">
                Try one of the suggestions below or browse by category.
              </Text>
            </>
          ) : (
            <>
              <Text className="text-ui-fg-muted">Search Results for:</Text>
              <Heading>
                {decodeURI(query)} ({ids.length})
              </Heading>
            </>
          )}
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

      {isEmpty ? (
        <>
          <Container>
            <BestSellers region={region} />
          </Container>
          <Container>
            <ShopByCategory />
          </Container>
        </>
      ) : (
        <Container className="flex flex-col small:flex-row small:items-start">
          <RefinementList sortBy={sortBy || "created_at"} search />
          <PaginatedProducts
            productsIds={ids}
            sortBy={sortBy}
            page={pageNumber}
            countryCode={countryCode}
          />
        </Container>
      )}
    </>
  )
}

export default SearchResultsTemplate
