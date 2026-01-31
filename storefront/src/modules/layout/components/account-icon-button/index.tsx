import { UserMini } from "@medusajs/icons"
import { IconButton } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const AccountIconButton = () => {
  return (
    <LocalizedClientLink href="/account" data-testid="nav-account-link">
      <IconButton variant="transparent" size="base" aria-label="Account">
        <UserMini />
      </IconButton>
    </LocalizedClientLink>
  )
}

export default AccountIconButton
