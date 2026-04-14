import { Button, Container, Text } from "@medusajs/ui"
import { cookies } from "next/headers"

const ADMIN_ONBOARDING_PATH =
  "/a/orders?onboarding_step=create_order_nextjs"

function getAdminOnboardingUrl(): string {
  const base =
    process.env.NEXT_PUBLIC_MEDUSA_ADMIN_URL ?? "http://localhost:7001"
  const normalized = base.replace(/\/$/, "")
  return `${normalized}${ADMIN_ONBOARDING_PATH}`
}

const ProductOnboardingCta = async () => {
  const cookieStore = await cookies()
  const isOnboarding = cookieStore.get("_medusa_onboarding")?.value === "true"

  if (!isOnboarding) {
    return null
  }

  const adminUrl = getAdminOnboardingUrl()

  return (
    <Container className="max-w-4xl h-full bg-ui-bg-subtle w-full p-8">
      <div className="flex flex-col gap-y-4 center">
        <Text className="text-ui-fg-base text-xl">
          Your demo product was successfully created.
        </Text>
        <Text className="text-ui-fg-subtle text-xs leading-5 font-normal">
          You can now continue setting up your store in the admin.
        </Text>
        <a href={adminUrl}>
          <Button className="w-full">Continue setup in admin</Button>
        </a>
      </div>
    </Container>
  )
}

export default ProductOnboardingCta
