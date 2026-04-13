import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import { Bricolage_Grotesque } from "next/font/google"
import { NuqsAdapter } from "nuqs/adapters/next/app"
import "styles/globals.css"
import NProgressProvider from "@modules/common/components/progress-bar-provider"
import { getBrandingSeo } from "@lib/util/metadata"
import { getLocale } from "next-intl/server"

const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage-grotesque",
})

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getBrandingSeo()

  return {
    metadataBase: new URL(getBaseURL()),
    title: {
      default: seo.siteTitle,
      template: `%s | ${seo.siteTitle}`,
    },
    description: seo.defaultDescription,
    icons: [
      seo.faviconUrl
        ? { url: seo.faviconUrl }
        : { url: "/favicon.ico" },
    ],
    openGraph: {
      title: seo.siteTitle,
      description: seo.defaultDescription,
      siteName: seo.siteTitle,
      images: seo.defaultOgImage ? [seo.defaultOgImage] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: seo.siteTitle,
      description: seo.defaultDescription,
      images: seo.defaultOgImage ? [seo.defaultOgImage] : [],
    },
  }
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const locale = await getLocale()

  return (
    <html lang={locale} data-mode="light" className={bricolageGrotesque.variable}>
      <body>
        <NProgressProvider>
          <NuqsAdapter>
            <main className="relative">{props.children}</main>
          </NuqsAdapter>
        </NProgressProvider>
      </body>
    </html>
  )
}
