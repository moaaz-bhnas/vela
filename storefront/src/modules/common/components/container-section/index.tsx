// components/ContainerSection.tsx
import { clx } from "@medusajs/ui"
import { Children } from "react"

type ContainerProps = {
  children: React.ReactNode
  className?: string
  /** When true, no vertical padding (use for nav, custom layouts). Default: false = section padding. */
  noPadding?: boolean
}

export default function Container({
  children,
  className = "",
  noPadding = false,
}: ContainerProps) {
  // If all children are null/undefined, don't render container
  const hasContent = Children.toArray(children).some((child) => child != null)

  if (!hasContent) return null

  return (
    <div
      className={clx(
        "container",
        !noPadding && "container--section",
        className
      )}
    >
      {children}
    </div>
  )
}
