// components/ContainerSection.tsx
import { clx } from "@medusajs/ui"
import { Children } from "react"

export default function Container({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) {
  // If all children are null/undefined, don't render container
  const hasContent = Children.toArray(children).some((child) => child != null)

  if (!hasContent) return null

  return <div className={clx("container", className)}>{children}</div>
}
