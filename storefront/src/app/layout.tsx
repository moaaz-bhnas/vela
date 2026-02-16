import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import { Bricolage_Grotesque } from "next/font/google"
import "styles/globals.css"
import NProgressProvider from "@modules/common/components/progress-bar-provider"

const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage-grotesque",
})

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" data-mode="light" className={bricolageGrotesque.variable}>
      <body>
        <NProgressProvider>
          <main className="relative">{props.children}</main>
        </NProgressProvider>
      </body>
    </html>
  )
}
