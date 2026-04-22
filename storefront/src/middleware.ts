import { HttpTypes } from "@medusajs/types"
import createIntlMiddleware from "next-intl/middleware"
import { NextRequest, NextResponse } from "next/server"
import {
  canonicalizeRouteLocale,
  defaultLocaleTagForCountry,
  isLocaleRouteAllowed,
  parseRouteLocale,
} from "./lib/i18n/locale-policy"
import { defaultLocale, routing } from "./i18n/routing"

const intlMiddleware = createIntlMiddleware(routing)

const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
const PUBLISHABLE_API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
const DEFAULT_REGION = process.env.NEXT_PUBLIC_DEFAULT_REGION || "us"

type StoreLocaleCode = { code: string }

type RegionData = {
  regionMap: Map<string, HttpTypes.StoreRegion>
  regions: HttpTypes.StoreRegion[]
  updated: number
}

const regionDataCache: RegionData = {
  regionMap: new Map<string, HttpTypes.StoreRegion>(),
  regions: [],
  updated: 0,
}

const storeLocalesCache = {
  locales: [] as StoreLocaleCode[],
  updated: 0,
}

async function getRegionData(): Promise<RegionData> {
  const { regionMap, regions, updated } = regionDataCache

  if (!regions.length || updated < Date.now() - 3600 * 1000) {
    const { regions: fetched } = await fetch(`${BACKEND_URL}/store/regions`, {
      headers: {
        "x-publishable-api-key": PUBLISHABLE_API_KEY!,
      },
      next: {
        revalidate: 3600,
        tags: ["regions"],
      },
    }).then((res) => res.json())

    if (!fetched?.length) {
      if (process.env.NODE_ENV === "development") {
        console.error(
          "Middleware: No regions returned from Medusa. Check Admin and NEXT_PUBLIC_MEDUSA_BACKEND_URL."
        )
      }
      regionDataCache.regionMap.clear()
      regionDataCache.regions = []
      regionDataCache.updated = Date.now()
      return regionDataCache
    }

    regionDataCache.regionMap.clear()
    fetched.forEach((region: HttpTypes.StoreRegion) => {
      region.countries?.forEach((c) => {
        regionDataCache.regionMap.set((c.iso_2 ?? "").toLowerCase(), region)
      })
    })
    regionDataCache.regions = fetched
    regionDataCache.updated = Date.now()
  }

  return regionDataCache
}

async function getStoreLocales(): Promise<StoreLocaleCode[]> {
  if (
    !storeLocalesCache.locales.length ||
    storeLocalesCache.updated < Date.now() - 3600 * 1000
  ) {
    const { locales } = await fetch(`${BACKEND_URL}/store/locales`, {
      headers: {
        "x-publishable-api-key": PUBLISHABLE_API_KEY!,
      },
      next: {
        revalidate: 3600,
        tags: ["locales"],
      },
    }).then((res) => res.json())

    storeLocalesCache.locales = locales ?? []
    storeLocalesCache.updated = Date.now()
  }

  return storeLocalesCache.locales
}

/**
 * Resolves the best locale for the request.
 * - If the URL path starts with a valid locale (language + region), use it when allowed.
 * - Otherwise fall back to Vercel geo-IP → DEFAULT_REGION → first region.
 */
async function resolveLocale(
  request: NextRequest,
  regionData: RegionData,
  storeLocales: StoreLocaleCode[]
): Promise<string | undefined> {
  try {
    const rawSeg = request.nextUrl.pathname.split("/")[1]

    if (rawSeg && rawSeg.includes("-")) {
      const parsed = parseRouteLocale(rawSeg)
      if (!parsed) {
        return undefined
      }
      if (!regionData.regionMap.has(parsed.region)) {
        return undefined
      }
      if (!isLocaleRouteAllowed(rawSeg, regionData.regions, storeLocales)) {
        return defaultLocaleTagForCountry(parsed.region, storeLocales)
      }
      return canonicalizeRouteLocale(rawSeg) ?? rawSeg
    }

    let countryCode: string | undefined

    const vercelCountryCode = request.headers
      .get("x-vercel-ip-country")
      ?.toLowerCase()

    if (vercelCountryCode && regionData.regionMap.has(vercelCountryCode)) {
      countryCode = vercelCountryCode
    } else if (regionData.regionMap.has(DEFAULT_REGION)) {
      countryCode = DEFAULT_REGION
    } else if (regionData.regionMap.keys().next().value) {
      countryCode = regionData.regionMap.keys().next().value as string
    }

    if (!countryCode) {
      return undefined
    }

    return defaultLocaleTagForCountry(countryCode, storeLocales)
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error(
        "Middleware.ts: Error resolving locale. Did you set up regions in your Medusa Admin and define a NEXT_PUBLIC_MEDUSA_BACKEND_URL environment variable?"
      )
    }
  }
}

/**
 * Middleware to handle locale selection (BCP 47) and cart/onboarding state.
 *
 * Strategy:
 * 1. Resolve the best locale for the request (from URL, geo-IP, or default).
 * 2. If the URL already has the correct locale, let next-intl middleware run
 *    so it sets the `x-next-intl-locale` header that `getRequestConfig` reads.
 * 3. Otherwise redirect to the locale-prefixed URL (our custom logic).
 * 4. Set our Medusa cookies on every response.
 */
export async function middleware(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const isOnboarding = searchParams.get("onboarding") === "true"
  const cartId = searchParams.get("cart_id")
  const checkoutStep = searchParams.get("step")
  const onboardingCookie = request.cookies.get("_medusa_onboarding")
  const cartIdCookie = request.cookies.get("_medusa_cart_id")

  const regionData = await getRegionData()
  const storeLocales = await getStoreLocales()

  let locale =
    regionData.regionMap.size > 0
      ? await resolveLocale(request, regionData, storeLocales)
      : undefined

  if (!locale) {
    locale = defaultLocale
  }

  const pathSegment = request.nextUrl.pathname.split("/")[1]
  const urlHasLocale =
    locale &&
    pathSegment &&
    pathSegment.includes("-") &&
    canonicalizeRouteLocale(pathSegment)?.toLowerCase() === locale.toLowerCase()

  function applyMedusaCookies(
    response: NextResponse,
    effectiveLocale: string | undefined | false
  ) {
    if (effectiveLocale) {
      response.cookies.set("_medusa_locale", effectiveLocale, {
        maxAge: 60 * 60 * 24 * 7,
      })
    }
    return response
  }

  if (
    urlHasLocale &&
    (!isOnboarding || onboardingCookie) &&
    (!cartId || cartIdCookie)
  ) {
    const response = intlMiddleware(request)
    return applyMedusaCookies(response, locale)
  }

  const redirectPath =
    request.nextUrl.pathname === "/" ? "" : request.nextUrl.pathname

  const queryString = request.nextUrl.search ? request.nextUrl.search : ""

  let redirectUrl = request.nextUrl.href
  let response = NextResponse.redirect(redirectUrl, 307)

  if (!urlHasLocale && locale) {
    redirectUrl = `${request.nextUrl.origin}/${locale}${redirectPath}${queryString}`
    response = NextResponse.redirect(`${redirectUrl}`, 307)
  }

  if (cartId && !checkoutStep) {
    const withStep = new URL(redirectUrl)
    withStep.searchParams.set("step", "address")
    redirectUrl = withStep.toString()
    response = NextResponse.redirect(redirectUrl, 307)
    response.cookies.set("_medusa_cart_id", cartId, { maxAge: 60 * 60 * 24 })
  }

  if (isOnboarding) {
    response.cookies.set("_medusa_onboarding", "true", { maxAge: 60 * 60 * 24 })
  }

  return applyMedusaCookies(response, locale)
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.gif|.*\\.svg).*)",
  ],
}
