"use client"

import { Listbox, Transition } from "@headlessui/react"
import { Fragment, useEffect, useMemo, useState } from "react"
import ReactCountryFlag from "react-country-flag"

import { StateType } from "@lib/hooks/use-toggle-state"
import { unstable_rethrow, useParams, usePathname } from "next/navigation"
import { updateRegion } from "@lib/data/cart"
import {
  buildLocaleTag,
  defaultLocaleTagForCountry,
  parseRouteLocale,
} from "@lib/i18n/locale-policy"
import { HttpTypes } from "@medusajs/types"
import { useTranslations } from "next-intl"

import ErrorMessage from "@modules/checkout/components/error-message"

type CountryOption = {
  country: string
  region: string
  label: string
}

type CountrySelectProps = {
  toggleState: StateType
  regions: HttpTypes.StoreRegion[]
  storeLocales: HttpTypes.StoreLocale[]
}

const CountrySelect = ({
  toggleState,
  regions,
  storeLocales,
}: CountrySelectProps) => {
  const t = useTranslations("CountrySelect")
  const [updateError, setUpdateError] = useState<string | null>(null)
  const [current, setCurrent] = useState<
    | { country: string | undefined; region: string; label: string | undefined }
    | undefined
  >(undefined)

  const { locale } = useParams()
  const currentPath = usePathname().split(`/${locale}`)[1]

  const { state, close } = toggleState

  const options = useMemo(() => {
    return regions
      ?.map((r) => {
        return r.countries?.map((c) => ({
          country: c.iso_2,
          region: r.id,
          label: c.display_name,
        }))
      })
      .flat()
      .sort((a, b) => (a?.label ?? "").localeCompare(b?.label ?? ""))
  }, [regions])

  useEffect(
    function syncCurrentCountry() {
      if (!locale || typeof locale !== "string") {
        return
      }
      const parsed = parseRouteLocale(locale)
      const cc = parsed?.region
      const option = options?.find(
        (o) => o?.country && o.country.toLowerCase() === cc
      )
      setCurrent(option)
    },
    [options, locale]
  )

  const handleChange = async (option: CountryOption) => {
    if (!option.country || typeof locale !== "string") {
      return
    }
    const parsed = parseRouteLocale(locale)
    const lang = parsed?.language
    const targetLocale = lang
      ? buildLocaleTag(lang, option.country)
      : defaultLocaleTagForCountry(option.country, storeLocales)
    setUpdateError(null)
    try {
      const result = await updateRegion(targetLocale, currentPath)
      if (result && !result.success) {
        setUpdateError(result.error)
        return
      }
    } catch (e) {
      unstable_rethrow(e)
    }
    close()
  }

  const defaultOption =
    locale && typeof locale === "string"
      ? options?.find((o) => {
          const parsed = parseRouteLocale(locale)
          return (
            o?.country &&
            o.country.toLowerCase() === parsed?.region
          )
        })
      : undefined

  return (
    <div>
      <Listbox
        as="span"
        onChange={handleChange}
        defaultValue={defaultOption}
      >
        <Listbox.Button className="py-1 w-full">
          <div className="txt-compact-small flex items-start gap-x-2">
            <span>{t("shippingTo")}</span>
            {current && (
              <span className="txt-compact-small flex items-center gap-x-2">
                <ReactCountryFlag
                  svg
                  style={{
                    width: "16px",
                    height: "16px",
                  }}
                  countryCode={current.country ?? ""}
                />
                {current.label}
              </span>
            )}
          </div>
        </Listbox.Button>
        <div className="flex relative w-full min-w-[320px]">
          <Transition
            show={state}
            as={Fragment}
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options
              className="absolute -bottom-[calc(100%-36px)] start-0 sm:start-auto sm:end-0 max-h-[442px] overflow-y-scroll z-nav-dropdown bg-ui-bg-base shadow-elevation-card-rest text-xs leading-5 font-normal uppercase text-ui-fg-base no-scrollbar rounded-rounded border border-ui-border-base w-full"
              static
            >
              {options?.map((o, index) => {
                return (
                  <Listbox.Option
                    key={index}
                    value={o}
                    className="py-2 hover:bg-ui-bg-subtle px-3 cursor-pointer flex items-center gap-x-2"
                  >
                    <ReactCountryFlag
                      svg
                      style={{
                        width: "16px",
                        height: "16px",
                      }}
                      countryCode={o?.country ?? ""}
                    />{" "}
                    {o?.label}
                  </Listbox.Option>
                )
              })}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
      <ErrorMessage
        error={updateError}
        data-testid="country-select-region-error"
      />
    </div>
  )
}

export default CountrySelect
