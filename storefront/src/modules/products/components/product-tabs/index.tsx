"use client"

import Back from "@modules/common/icons/back"
import FastDelivery from "@modules/common/icons/fast-delivery"
import Refresh from "@modules/common/icons/refresh"

import Accordion from "./accordion"
import { HttpTypes } from "@medusajs/types"
import { useTranslations } from "next-intl"

type ProductTabsProps = {
  product: HttpTypes.StoreProduct
}

const ProductInfoTab = ({ product }: ProductTabsProps) => {
  const t = useTranslations("Product")

  return (
    <div className="text-xs leading-5 font-normal py-8">
      <div className="grid grid-cols-2 gap-x-stack">
        <div className="flex flex-col gap-y-4">
          <div>
            <span className="font-semibold">{t("material")}</span>
            <p>{product.material ? product.material : "-"}</p>
          </div>
          <div>
            <span className="font-semibold">{t("countryOfOrigin")}</span>
            <p>{product.origin_country ? product.origin_country : "-"}</p>
          </div>
          <div>
            <span className="font-semibold">{t("type")}</span>
            <p>{product.type ? product.type.value : "-"}</p>
          </div>
        </div>
        <div className="flex flex-col gap-y-4">
          <div>
            <span className="font-semibold">{t("weight")}</span>
            <p>
              {product.weight
                ? t("weightGrams", { weight: String(product.weight) })
                : "-"}
            </p>
          </div>
          <div>
            <span className="font-semibold">{t("dimensions")}</span>
            <p>
              {product.length && product.width && product.height
                ? t("dimensionsLWH", {
                    length: String(product.length),
                    width: String(product.width),
                    height: String(product.height),
                  })
                : "-"}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

const ShippingInfoTab = () => {
  const t = useTranslations("Product")

  return (
    <div className="text-xs leading-5 font-normal py-8">
      <div className="grid grid-cols-1 gap-y-stack">
        <div className="flex items-start gap-x-2">
          <FastDelivery />
          <div>
            <span className="font-semibold">{t("fastDelivery")}</span>
            <p className="max-w-sm">{t("fastDeliveryDescription")}</p>
          </div>
        </div>
        <div className="flex items-start gap-x-2">
          <Refresh />
          <div>
            <span className="font-semibold">{t("simpleExchanges")}</span>
            <p className="max-w-sm">{t("simpleExchangesDescription")}</p>
          </div>
        </div>
        <div className="flex items-start gap-x-2">
          <Back />
          <div>
            <span className="font-semibold">{t("easyReturns")}</span>
            <p className="max-w-sm">{t("easyReturnsDescription")}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

const ProductTabs = ({ product }: ProductTabsProps) => {
  const t = useTranslations("Product")

  const tabs = [
    {
      label: t("tabProductInformation"),
      component: <ProductInfoTab product={product} />,
    },
    {
      label: t("tabShippingReturns"),
      component: <ShippingInfoTab />,
    },
  ]

  return (
    <div className="w-full">
      <Accordion type="multiple">
        {tabs.map((tab, i) => (
          <Accordion.Item
            key={i}
            title={tab.label}
            headingSize="medium"
            value={tab.label}
          >
            {tab.component}
          </Accordion.Item>
        ))}
      </Accordion>
    </div>
  )
}

export default ProductTabs
