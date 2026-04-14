import { Metadata } from "next"
import { Heading, Text } from "@medusajs/ui"

import InteractiveLink from "@modules/common/components/interactive-link"

export const metadata: Metadata = {
  title: "404",
  description: "Something went wrong",
}

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)]">
      <Heading level="h1" className="text-ui-fg-base">
        Page not found
      </Heading>
      <Text className="text-ui-fg-base mt-2">
        The cart you tried to access does not exist. Clear your cookies and try
        again.
      </Text>
      <InteractiveLink href="/">Go to frontpage</InteractiveLink>
    </div>
  )
}
