import Container from "@modules/common/components/container-section"
import UnderlineLink from "@modules/common/components/interactive-link"

import AccountNav from "../../components/account-nav"
import { HttpTypes } from "@medusajs/types"
import { getTranslations } from "next-intl/server"

type AccountLayoutProps = {
  customer: HttpTypes.StoreCustomer | null
  children: React.ReactNode
}

export default async function AccountLayout({
  customer,
  children,
}: AccountLayoutProps) {
  const t = await getTranslations("Account")

  return (
    <div className="flex-1 lg:py-content-y" data-testid="account-page">
      <Container
        noPadding
        className="h-full max-w-5xl mx-auto bg-ui-bg-base flex flex-col"
      >
        <div className="grid grid-cols-1  lg:grid-cols-[240px_1fr] py-content-y">
          <div>{customer && <AccountNav customer={customer} />}</div>
          <div className="flex-1">{children}</div>
        </div>
        <div className="flex flex-col lg:flex-row items-end justify-between lg:border-t border-ui-border-base py-content-y gap-stack">
          <div>
            <h3 className="text-2xl leading-[36px] font-semibold mb-4">{t("gotQuestions")}</h3>
            <span className="txt-medium">{t("faqLine")}</span>
          </div>
          <div>
            <UnderlineLink href="/customer-service">
              {t("customerService")}
            </UnderlineLink>
          </div>
        </div>
      </Container>
    </div>
  )
}
