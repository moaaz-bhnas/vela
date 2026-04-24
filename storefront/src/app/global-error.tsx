"use client"

import { useEffect } from "react"

import "styles/globals.css"

/**
 * Catches errors in the root `app/layout` and replaces the root layout.
 * Must include `html` and `body` (and cannot rely on [locale] / next-intl).
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="en">
      <body className="min-h-screen font-sans antialiased">
        <div className="flex flex-col gap-4 items-center justify-center min-h-screen px-4">
          <h2 className="text-[30px] leading-[48px] font-semibold text-ui-fg-base">
            Something went wrong
          </h2>
          <p className="text-xs leading-5 font-normal text-ui-fg-subtle text-center max-w-md">
            An unexpected error occurred. Please try again.
          </p>
          <button
            type="button"
            onClick={reset}
            className="text-ui-fg-interactive hover:text-ui-fg-interactive-hover underline text-xs leading-5 font-normal"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
