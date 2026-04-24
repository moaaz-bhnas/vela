"use client"

import { useEffect } from "react"
import { useTranslations } from "next-intl"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const t = useTranslations("ErrorPage")

  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col gap-4 items-center justify-center min-h-[calc(100vh-64px)] px-4">
      <h2
        className="text-[30px] leading-[48px] font-semibold text-ui-fg-base text-center"
        role="alert"
      >
        {t("title")}
      </h2>
      <p className="text-xs leading-5 font-normal text-ui-fg-subtle text-center max-w-md">
        {t("checkoutDescription")}
      </p>
      <button
        type="button"
        onClick={reset}
        className="text-ui-fg-interactive hover:text-ui-fg-interactive-hover underline text-xs leading-5 font-normal"
      >
        {t("tryAgain")}
      </button>
    </div>
  )
}
