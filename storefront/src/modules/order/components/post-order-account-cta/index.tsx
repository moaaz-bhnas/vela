import { Button, Text } from "@medusajs/ui"
import { getTranslations } from "next-intl/server"

import { getCustomer } from "@lib/data/customer"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

/**
 * Shown on order confirmation for guests only — create account after purchase (guest-first checkout).
 */
export default async function PostOrderAccountCta() {
  const customer = await getCustomer()
  if (customer) {
    return null
  }

  const t = await getTranslations("Order")

  return (
    <div
      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-rounded border border-ui-border-base bg-ui-bg-subtle"
      data-testid="post-order-account-cta"
    >
      <div>
        <Text className="txt-medium text-ui-fg-base">
          {t("createAccountTitle")}
        </Text>
        <Text size="small" className="text-ui-fg-subtle mt-1">
          {t("createAccountSubtitle")}
        </Text>
      </div>
      <LocalizedClientLink href="/account">
        <Button variant="secondary" className="w-full sm:w-auto shrink-0">
          {t("createAccountCta")}
        </Button>
      </LocalizedClientLink>
    </div>
  )
}
