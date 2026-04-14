"use client"

import { useEffect } from "react"

export default function Error({
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
    <div className="flex flex-col gap-4 items-center justify-center min-h-[calc(100vh-64px)]">
      <h2 className="text-2xl-semi text-ui-fg-base">Something went wrong</h2>
      <p className="text-small-regular text-ui-fg-subtle">
        An unexpected error occurred during checkout. Please try again.
      </p>
      <button
        onClick={reset}
        className="text-ui-fg-interactive hover:text-ui-fg-interactive-hover underline text-small-regular"
      >
        Try again
      </button>
    </div>
  )
}
