"use client"

import { Fragment, useEffect, useId, useMemo, useState } from "react"

import { Popover, Transition } from "@headlessui/react"
import { Text, clx } from "@medusajs/ui"
import { HttpTypes } from "@medusajs/types"
import {
  unstable_rethrow,
  useParams,
  usePathname,
} from "next/navigation"
import { useTranslations } from "next-intl"

import { updateRegion } from "@lib/data/cart"
import {
  allowedLanguageSubtagsForCountry,
  buildLocaleTag,
  defaultLocaleTagForCountry,
  parseRouteLocale,
} from "@lib/i18n/locale-policy"

import { CountryFlagIcon } from "./country-flag-icon"

type CountryOption = {
  country: string
  regionId: string
  label: string
}

type RegionLanguageSwitcherProps = {
  regions: HttpTypes.StoreRegion[]
  storeLocales: HttpTypes.StoreLocale[]
}

function languageDisplayName(languageCode: string, displayLocale: string) {
  try {
    return (
      new Intl.DisplayNames([displayLocale], { type: "language" }).of(
        languageCode
      ) ?? languageCode
    )
  } catch {
    return languageCode
  }
}

export default function RegionLanguageSwitcher({
  regions,
  storeLocales,
}: RegionLanguageSwitcherProps) {
  const t = useTranslations("Nav")
  const languageGroupLabelId = useId()
  const regionGroupLabelId = useId()

  const { locale: routeLocale } = useParams<{ locale: string }>()
  const pathname = usePathname()

  const currentPath = pathname.split(`/${routeLocale}`)[1] ?? ""

  const countryOptions = useMemo(
    function buildCountryOptions() {
      const byCountry = new Map<string, CountryOption>()
      for (const r of regions) {
        for (const c of r.countries ?? []) {
          const country = (c.iso_2 ?? "").toLowerCase()
          if (!country) {
            continue
          }
          if (!byCountry.has(country)) {
            byCountry.set(country, {
              country,
              regionId: r.id,
              label: c.display_name ?? c.iso_2 ?? "",
            })
          }
        }
      }
      return Array.from(byCountry.values()).sort((a, b) =>
        a.label.localeCompare(b.label)
      )
    },
    [regions]
  )

  const parsed = useMemo(
    function parseCurrent() {
      return parseRouteLocale(routeLocale as string)
    },
    [routeLocale]
  )

  const uiLang = parsed?.language ?? "en"

  const [country, setCountry] = useState(parsed?.region ?? "")
  const [language, setLanguage] = useState(parsed?.language ?? "en")
  const [updateError, setUpdateError] = useState<string | null>(null)

  useEffect(
    function syncFromRoute() {
      if (parsed) {
        setCountry(parsed.region)
        setLanguage(parsed.language)
      }
    },
    [parsed]
  )

  useEffect(
    function clearErrorOnLocaleChange() {
      setUpdateError(null)
    },
    [routeLocale]
  )

  const languageChoices = useMemo(
    function choices() {
      if (!country) {
        return [] as string[]
      }
      return allowedLanguageSubtagsForCountry(country, storeLocales)
    },
    [country, storeLocales]
  )

  const languageLabelsByCode = useMemo(
    function buildLanguageLabels() {
      const map = new Map<string, string>()
      try {
        const formatter = new Intl.DisplayNames([uiLang], { type: "language" })
        for (const code of languageChoices) {
          map.set(code, formatter.of(code) ?? code)
        }
      } catch {
        for (const code of languageChoices) {
          map.set(code, code)
        }
      }
      return map
    },
    [languageChoices, uiLang]
  )

  const triggerLanguageName = useMemo(
    function buildTriggerLanguageName() {
      if (!parsed) {
        return ""
      }
      return languageDisplayName(parsed.language, routeLocale as string)
    },
    [parsed, routeLocale]
  )

  const currentCountryLabel =
    countryOptions.find((o) => o.country === country)?.label ?? country

  const triggerLabel = parsed
    ? `${triggerLanguageName} · ${currentCountryLabel}`
    : t("regionLanguageAria")

  async function applyLocale(next: string, close: () => void) {
    if (next.toLowerCase() === (routeLocale as string).toLowerCase()) {
      close()
      return
    }
    setUpdateError(null)
    try {
      const result = await updateRegion(next, currentPath)
      if (result && !result.success) {
        setUpdateError(result.error)
      }
    } catch (e) {
      unstable_rethrow(e)
    }
  }

  async function handleSelectLanguage(lang: string, close: () => void) {
    if (!country) {
      return
    }
    const next = buildLocaleTag(lang, country)
    setLanguage(lang)
    await applyLocale(next, close)
  }

  async function handleSelectRegion(opt: CountryOption, close: () => void) {
    const allowed = allowedLanguageSubtagsForCountry(opt.country, storeLocales)
    const next = allowed.includes(language)
      ? buildLocaleTag(language, opt.country)
      : defaultLocaleTagForCountry(opt.country, storeLocales)
    const parsedNext = parseRouteLocale(next)
    if (parsedNext) {
      setCountry(parsedNext.region)
      setLanguage(parsedNext.language)
    }
    await applyLocale(next, close)
  }

  return (
    <Popover className="relative flex h-full items-center">
      {function renderPopover({
        open,
        close,
      }: {
        open: boolean
        close: (el?: HTMLElement) => void
      }) {
        return (
          <>
            <Popover.Button
              className={clx(
                "transition-fg inline-flex items-center rounded-md py-1.5 outline-none",
                "justify-center gap-0 px-0",
                "text-ui-fg-subtle hover:text-ui-fg-base hover:bg-ui-bg-subtle-hover",
                "focus-visible:shadow-borders-interactive-with-active min-h-11 min-w-11",
                "sm:justify-start sm:gap-x-2 sm:px-3.5 sm:min-w-0",
                open && "bg-ui-bg-subtle-hover text-ui-fg-base"
              )}
              aria-label={triggerLabel}
              data-testid="nav-region-language-trigger"
            >
              {country ? (
                <CountryFlagIcon countryCode={country} loading="eager" />
              ) : (
                <span
                  className="inline-flex size-4 shrink-0 rounded-full border border-ui-border-base bg-ui-bg-subtle"
                  aria-hidden
                />
              )}
              <span
                className="hidden max-w-40 truncate text-xs font-medium sm:inline"
                aria-hidden
              >
                {triggerLabel}
              </span>
            </Popover.Button>
            <Transition
              show={open}
              as={Fragment}
              enter="transition ease-out duration-200 motion-reduce:transition-none motion-reduce:duration-0"
              enterFrom="opacity-0 translate-y-1 motion-reduce:translate-y-0"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-150 motion-reduce:transition-none motion-reduce:duration-0"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-1 motion-reduce:translate-y-0"
            >
              <Popover.Panel
                static
                className={clx(
                  "z-nav-dropdown overflow-hidden rounded-rounded border border-ui-border-base bg-ui-bg-base shadow-elevation-card-rest",
                  "max-lg:fixed max-lg:start-4 max-lg:end-4 max-lg:top-[calc(var(--nav-first-bar-height)+0.25rem)] max-lg:mt-0 max-lg:w-auto",
                  "lg:absolute lg:end-0 lg:top-full lg:mt-1 lg:w-[calc(100vw-2rem)] lg:max-w-nav-panel"
                )}
                data-testid="nav-region-language-panel"
              >
                <div className="flex max-h-nav-panel flex-col overflow-hidden">
                  {updateError ? (
                    <div
                      role="alert"
                      className="shrink-0 border-b border-ui-border-base bg-ui-bg-subtle px-4 py-2 text-xs font-normal leading-5 text-ui-fg-error"
                    >
                      {updateError}
                    </div>
                  ) : null}
                  <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,0.55fr)_minmax(0,1.45fr)] sm:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)]">
                    <div
                      role="group"
                      aria-labelledby={languageGroupLabelId}
                      className="flex min-h-0 flex-col border-e border-ui-border-base"
                    >
                      <div
                        id={languageGroupLabelId}
                        className="shrink-0 px-3 pt-3 pb-2.5 sm:px-4"
                      >
                        <Text
                          size="small"
                          className="block uppercase tracking-wide text-ui-fg-subtle"
                        >
                          {t("language")}
                        </Text>
                      </div>
                      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-1.5 pb-3 pt-1 sm:px-3">
                        {!country ? (
                          <p className="px-2 py-2.5 text-sm text-ui-fg-muted sm:px-1">
                            {t("languageEmptySelectRegion")}
                          </p>
                        ) : languageChoices.length === 0 ? (
                          <p className="px-2 py-2.5 text-sm text-ui-fg-muted sm:px-1">
                            {t("languageEmptyNone")}
                          </p>
                        ) : (
                          languageChoices.map(function languageItem(lang) {
                            const selected = lang === language
                            return (
                              <button
                                key={lang}
                                type="button"
                                aria-current={selected ? "true" : undefined}
                                className={clx(
                                  "flex w-full min-h-11 min-w-0 items-center rounded-md px-2 py-2.5 text-start text-sm sm:px-3",
                                  "text-ui-fg-base transition-fg",
                                  "hover:bg-ui-bg-subtle-hover",
                                  "focus-visible:outline-none focus-visible:shadow-borders-interactive-with-active",
                                  selected &&
                                    "bg-ui-bg-subtle-hover font-medium text-ui-fg-base"
                                )}
                                onClick={function onPickLanguage() {
                                  handleSelectLanguage(lang, close)
                                }}
                              >
                                <span className="min-w-0 truncate">
                                  {languageLabelsByCode.get(lang) ?? lang}
                                </span>
                              </button>
                            )
                          })
                        )}
                      </div>
                    </div>
                    <div
                      role="group"
                      aria-labelledby={regionGroupLabelId}
                      className="flex min-h-0 flex-col ps-1"
                    >
                      <div
                        id={regionGroupLabelId}
                        className="shrink-0 px-4 pt-3 pb-2.5"
                      >
                        <Text
                          size="small"
                          className="block uppercase tracking-wide text-ui-fg-base"
                        >
                          {t("region")}
                        </Text>
                      </div>
                      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 pb-3 pt-1 sm:px-3">
                        {countryOptions.map(function regionItem(o) {
                          const selected = o.country === country
                          return (
                            <button
                              key={`${o.regionId}-${o.country}`}
                              type="button"
                              aria-current={selected ? "true" : undefined}
                              className={clx(
                                "flex w-full min-h-11 items-center gap-2.5 rounded-md px-3 py-2.5 text-start text-sm",
                                "text-ui-fg-base transition-fg",
                                "hover:bg-ui-bg-subtle-hover",
                                "focus-visible:outline-none focus-visible:shadow-borders-interactive-with-active",
                                selected &&
                                  "bg-ui-bg-subtle-hover font-medium text-ui-fg-base"
                              )}
                              onClick={function onPickRegion() {
                                handleSelectRegion(o, close)
                              }}
                            >
                              <CountryFlagIcon countryCode={o.country} />
                              <span className="min-w-0 flex-1 leading-snug">
                                {o.label}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </Popover.Panel>
            </Transition>
          </>
        )
      }}
    </Popover>
  )
}
