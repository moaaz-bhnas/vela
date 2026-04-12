import { Container, Text } from "@medusajs/ui"
import { useHits, useSearchBox } from "react-instantsearch-hooks-web"

import InteractiveLink from "@modules/common/components/interactive-link"
import { useTranslations } from "next-intl"

const ShowAll = () => {
  const t = useTranslations("Search")
  const { hits } = useHits()
  const { query } = useSearchBox()
  const width = typeof window !== "undefined" ? window.innerWidth : 0

  if (query === "") return null
  if (hits.length > 0 && hits.length <= 6) return null
  if (hits.length === 0) return null

  const count = width > 640 ? 6 : 3

  return (
    <Container className="flex sm:flex-col lg:flex-row gap-2 justify-center items-center h-fit py-4 lg:py-2">
      <Text>{t("showingFirstResults", { count })}</Text>
      <InteractiveLink href={`/results/${query}`}>{t("viewAll")}</InteractiveLink>
    </Container>
  )
}

export default ShowAll
