import { defineRouting } from "next-intl/routing"

import { defaultRouteLocale, routeLocales } from "./generated-route-locales"

export const routing = defineRouting({
  locales: [...routeLocales],
  defaultLocale: defaultRouteLocale,
})

export type Locale = (typeof routeLocales)[number]
export const { defaultLocale } = routing
