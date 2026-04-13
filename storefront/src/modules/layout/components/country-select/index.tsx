"use client"

import { Listbox, Transition } from "@headlessui/react"
import { Fragment, useEffect, useMemo, useState } from "react"
import ReactCountryFlag from "react-country-flag"

import { StateType } from "@lib/hooks/use-toggle-state"
import { useParams, usePathname } from "next/navigation"
import { updateRegion } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import { countryLocaleMap, defaultLocale } from "@/i18n/routing"
import { useTranslations } from "next-intl"

type CountryOption = {
  country: string
  region: string
  label: string
}

type CountrySelectProps = {
  toggleState: StateType
  regions: HttpTypes.StoreRegion[]
}

const CountrySelect = ({ toggleState, regions }: CountrySelectProps) => {
  const t = useTranslations("CountrySelect")
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

  useEffect(() => {
    if (locale) {
      // Match by locale — find the option whose country maps to the current locale
      const option = options?.find(
        (o) =>
          o?.country &&
          (countryLocaleMap[o.country] ?? defaultLocale) === locale
      )
      setCurrent(option)
    }
  }, [options, locale])

  const handleChange = (option: CountryOption) => {
    const targetLocale =
      (option.country && countryLocaleMap[option.country]) ?? defaultLocale
    updateRegion(targetLocale, currentPath)
    close()
  }

  return (
    <div>
      <Listbox
        as="span"
        onChange={handleChange}
        defaultValue={
          locale
            ? options?.find(
                (o) =>
                  o?.country &&
                  (countryLocaleMap[o.country] ?? defaultLocale) === locale
              )
            : undefined
        }
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
              className="absolute -bottom-[calc(100%-36px)] left-0 sm:left-auto sm:right-0 max-h-[442px] overflow-y-scroll z-[900] bg-white drop-shadow-md text-small-regular uppercase text-black no-scrollbar rounded-rounded w-full"
              static
            >
              {options?.map((o, index) => {
                return (
                  <Listbox.Option
                    key={index}
                    value={o}
                    className="py-2 hover:bg-gray-200 px-3 cursor-pointer flex items-center gap-x-2"
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
    </div>
  )
}

export default CountrySelect
