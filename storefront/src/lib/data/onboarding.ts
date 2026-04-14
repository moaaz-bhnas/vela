"use server"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

const ADMIN_URL =
  process.env.NEXT_PUBLIC_MEDUSA_ADMIN_URL || "http://localhost:7001"

export async function resetOnboardingState(orderId: string) {
  const cookieStore = await cookies()
  cookieStore.set("_medusa_onboarding", "false", { maxAge: -1 })
  redirect(`${ADMIN_URL}/a/orders/${orderId}`)
}
