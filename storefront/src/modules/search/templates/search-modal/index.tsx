"use client"

import {
  InstantSearch,
  useHits,
  useSearchBox,
} from "react-instantsearch-hooks-web"
import { useRouter } from "next/navigation"
import { MagnifyingGlassMini } from "@medusajs/icons"
import { clx, Container, Text } from "@medusajs/ui"

import { addSearchHistoryProduct } from "@lib/util/personalization-cookies"
import { sdk } from "@lib/config"
import { SEARCH_INDEX_NAME, searchClient } from "@lib/search-client"
import Hit, { ProductHit } from "@modules/search/components/hit"
import Hits from "@modules/search/components/hits"
import SearchBox from "@modules/search/components/search-box"
import ShowAll from "@modules/search/components/show-all"
import { useEffect, useRef } from "react"
import { HttpTypes } from "@medusajs/types"
import { useTranslations } from "next-intl"

type SearchModalProps = {
  popularProducts: HttpTypes.StoreProduct[]
  searchHistoryProducts?: HttpTypes.StoreProduct[]
}

function SearchModalContent({
  searchHistoryHits,
  popularHits,
}: {
  searchHistoryHits: ProductHit[]
  popularHits: ProductHit[]
}) {
  const t = useTranslations("Search")
  const { query } = useSearchBox()
  const { hits } = useHits()

  function handleHitClick(hit: ProductHit) {
    addSearchHistoryProduct(hit.id)
    sdk.client
      .fetch("/store/search-popularity", {
        method: "POST",
        body: { product_id: hit.id },
      })
      .catch(() => {})
  }

  const isEmptyQuery = !query
  const hasSearchHistoryHits = searchHistoryHits.length > 0
  const hasPopularHits = popularHits.length > 0
  const hasSearchHits = hits.length > 0
  const isVisible =
    (isEmptyQuery && (hasSearchHistoryHits || hasPopularHits)) || !isEmptyQuery

  return (
    <div
      className={clx(
        "transition-[height,max-height,opacity] duration-300 ease-in-out w-full sm:w-[50vw] mb-1 p-px flex flex-col gap-4",
        {
          "max-h-full opacity-100": isVisible,
          "max-h-0 opacity-0": !isVisible,
        }
      )}
    >
      {!isEmptyQuery && !hasSearchHits && (
        <Container
          className="text-center"
          data-testid="no-search-results-container"
        >
          <Text>{t("noResults", { query })}</Text>
        </Container>
      )}
      {(isEmptyQuery || !hasSearchHits) && hasSearchHistoryHits && (
        <Hits
          hits={searchHistoryHits}
          title={t("searchHistory")}
          hitComponent={Hit}
          onHitClick={handleHitClick}
          titleTestId="search-history-title"
          resultsTestId="search-history-results"
        />
      )}
      {(isEmptyQuery || !hasSearchHits) && hasPopularHits && (
        <Hits
          hits={popularHits}
          title={t("popularSearches")}
          hitComponent={Hit}
          onHitClick={handleHitClick}
          titleTestId="search-popular-title"
          resultsTestId="search-results"
        />
      )}
      {!isEmptyQuery && hasSearchHits && (
        <Hits
          hits={hits as unknown as ProductHit[]}
          hitComponent={Hit}
          onHitClick={handleHitClick}
          resultsTestId="search-results"
        />
      )}
      <ShowAll />
    </div>
  )
}

export default function SearchModal({
  popularProducts,
  searchHistoryProducts = [],
}: SearchModalProps) {
  const router = useRouter()
  const searchRef = useRef(null)
  const searchHistoryHits = productToProductHit(searchHistoryProducts)
  const popularHits = productToProductHit(popularProducts)

  const handleOutsideClick = (event: MouseEvent) => {
    if (event.target === searchRef.current) {
      router.back()
    }
  }

  useEffect(() => {
    window.addEventListener("click", handleOutsideClick)
    // cleanup
    return () => {
      window.removeEventListener("click", handleOutsideClick)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // // disable scroll on body when modal is open
  // useEffect(() => {
  //   document.body.style.overflow = "hidden"
  //   return () => {
  //     document.body.style.overflow = "unset"
  //   }
  // }, [])

  // on escape key press, close modal
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        router.back()
      }
    }
    window.addEventListener("keydown", handleEsc)

    // cleanup
    return () => {
      window.removeEventListener("keydown", handleEsc)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="relative z-[75]">
      <div className="fixed inset-0 bg-opacity-75 backdrop-blur-md opacity-100" />
      <div className="fixed inset-0 px-5 sm:p-0 overflow-auto" ref={searchRef}>
        <div className="flex flex-col justify-start w-full h-fit transform p-5 items-center text-left align-middle transition-all max-h-[75vh] bg-transparent shadow-none">
          <InstantSearch
            indexName={SEARCH_INDEX_NAME}
            searchClient={searchClient}
          >
            <div
              className="flex absolute flex-col h-fit w-full sm:w-fit"
              data-testid="search-modal-container"
            >
              <div className="w-full flex items-center gap-x-2 p-4 bg-[rgba(3,7,18,0.5)] text-ui-fg-on-color backdrop-blur-2xl rounded-rounded">
                <MagnifyingGlassMini />
                <SearchBox />
              </div>
              <div className="flex-1 mt-6">
                <SearchModalContent
                  searchHistoryHits={searchHistoryHits}
                  popularHits={popularHits}
                />
              </div>
            </div>
          </InstantSearch>
        </div>
      </div>
    </div>
  )
}

function productToProductHit(products: HttpTypes.StoreProduct[]): ProductHit[] {
  return products.map((product) => ({
    id: product.id,
    title: product.title,
    handle: product.handle,
    description: product.description ?? null,
    thumbnail: product.thumbnail ?? null,
    variants: (product.variants ?? []) as HttpTypes.StoreProductVariant[],
    collection_handle: product.collection?.handle ?? null,
    collection_id: product.collection?.id ?? null,
  }))
}
