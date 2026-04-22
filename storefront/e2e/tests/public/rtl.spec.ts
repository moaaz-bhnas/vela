import { test, expect } from "../../index"

test.describe("Document direction (RTL / LTR)", () => {
  test("Arabic locale route sets html[dir=rtl]", async ({ page }) => {
    await page.goto("/ar-EG")
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl")
  })

  test("English locale route sets html[dir=ltr]", async ({ page }) => {
    await page.goto("/en-GB")
    await expect(page.locator("html")).toHaveAttribute("dir", "ltr")
  })
})
