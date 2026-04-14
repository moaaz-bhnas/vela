import { HttpTypes } from "@medusajs/types"
import createIntlMiddleware from "next-intl/middleware"
import { notFound } from "next/navigation"
import { NextRequest, NextResponse } from "next/server"
import { countryLocaleMap, defaultLocale, routing } from "./i18n/routing"

const intlMiddleware = createIntlMiddleware(routing)

const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
const PUBLISHABLE_API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
const DEFAULT_REGION = process.env.NEXT_PUBLIC_DEFAULT_REGION || "us"

const regionMapCache = {
  regionMap: new Map<string, HttpTypes.StoreRegion>(),
  regionMapUpdated: Date.now(),
}

async function getRegionMap() {
  const { regionMap, regionMapUpdated } = regionMapCache

  if (
    !regionMap.keys().next().value ||
    regionMapUpdated < Date.now() - 3600 * 1000
  ) {
    // Fetch regions from Medusa. We can't use the JS client here because middleware is running on Edge and the client needs a Node environment.
    const { regions } = await fetch(`${BACKEND_URL}/store/regions`, {
      headers: {
        "x-publishable-api-key": PUBLISHABLE_API_KEY!,
      },
      next: {
        revalidate: 3600,
        tags: ["regions"],
      },
    }).then((res) => res.json())

    if (!regions?.length) {
      notFound()
    }

    // Create a map of country codes to regions.
    regions.forEach((region: HttpTypes.StoreRegion) => {
      region.countries?.forEach((c) => {
        regionMapCache.regionMap.set(c.iso_2 ?? "", region)
      })
    })

    regionMapCache.regionMapUpdated = Date.now()
  }

  return regionMapCache.regionMap
}

/**
 * Extracts the ISO-2 country code from a BCP 47 locale string.
 * e.g. "ar-EG" → "eg"
 */
function getCountryFromLocale(locale: string): string {
  return locale.split("-")[1]?.toLowerCase() ?? locale.toLowerCase()
}

/**
 * Resolves the best locale for the request.
 * - If the URL path starts with a valid locale (e.g. /ar-EG/...), use it.
 * - Otherwise fall back to Vercel geo-IP → DEFAULT_REGION → first region.
 */
async function getLocale(
  request: NextRequest,
  regionMap: Map<string, HttpTypes.StoreRegion | number>
): Promise<string | undefined> {
  try {
    const pathSegment = request.nextUrl.pathname.split("/")[1]?.toLowerCase()

    // Check if the path segment is already a valid locale (e.g. ar-EG, en-DK)
    if (pathSegment && pathSegment.includes("-")) {
      const countryCode = getCountryFromLocale(pathSegment)
      if (regionMap.has(countryCode)) {
        // Return with original casing from URL to preserve locale exactly
        return request.nextUrl.pathname.split("/")[1]
      }
    }

    // Resolve via geo-IP or default
    let countryCode: string | undefined

    const vercelCountryCode = request.headers
      .get("x-vercel-ip-country")
      ?.toLowerCase()

    if (vercelCountryCode && regionMap.has(vercelCountryCode)) {
      countryCode = vercelCountryCode
    } else if (regionMap.has(DEFAULT_REGION)) {
      countryCode = DEFAULT_REGION
    } else if (regionMap.keys().next().value) {
      countryCode = regionMap.keys().next().value as string
    }

    if (!countryCode) return undefined

    // Map country code to its BCP 47 locale, falling back to defaultLocale
    return countryLocaleMap[countryCode] ?? defaultLocale
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

  const regionMap = await getRegionMap()

  const locale = regionMap && (await getLocale(request, regionMap))

  const pathSegment = request.nextUrl.pathname.split("/")[1]
  const urlHasLocale =
    locale &&
    pathSegment?.toLowerCase() === locale.toLowerCase()

  // Helper: copy our Medusa cookies onto any response object
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

  // If the URL already has the correct locale and no pending redirects,
  // delegate to next-intl middleware so it sets x-next-intl-locale.
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

  // If no locale in the URL, redirect to the correct locale prefix
  if (!urlHasLocale && locale) {
    redirectUrl = `${request.nextUrl.origin}/${locale}${redirectPath}${queryString}`
    response = NextResponse.redirect(`${redirectUrl}`, 307)
  }

  // If a cart_id is in the params, set it as a cookie and redirect to address step
  if (cartId && !checkoutStep) {
    redirectUrl = `${redirectUrl}&step=address`
    response = NextResponse.redirect(`${redirectUrl}`, 307)
    response.cookies.set("_medusa_cart_id", cartId, { maxAge: 60 * 60 * 24 })
  }

  // Set onboarding cookie
  if (isOnboarding) {
    response.cookies.set("_medusa_onboarding", "true", { maxAge: 60 * 60 * 24 })
  }

  return applyMedusaCookies(response, locale)
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.gif|.*\\.svg).*)",
  ], // prevents redirecting on static files
}
