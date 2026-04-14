"use client"

import { Text } from "@medusajs/ui"
import { useTranslations } from "next-intl"

import Medusa from "../../../common/icons/medusa"
import NextJs from "../../../common/icons/nextjs"

const MedusaCTA = () => {
  const t = useTranslations("MedusaCta")

  return (
    <Text className="flex gap-x-2 txt-compact-small-plus items-center text-ui-fg-muted">
      {t("poweredBy")}
      <a href="https://www.medusajs.com" target="_blank" rel="noreferrer">
        <Medusa color="currentColor" className="text-inherit" />
      </a>
      {t("and")}
      <a href="https://nextjs.org" target="_blank" rel="noreferrer">
        <NextJs color="currentColor" className="text-inherit" />
      </a>
    </Text>
  )
}

export default MedusaCTA
