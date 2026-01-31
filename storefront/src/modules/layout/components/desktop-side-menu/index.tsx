"use client"

import { HttpTypes } from "@medusajs/types"
import SideMenu from "../side-menu"
import { useNavScroll } from "../nav-scroll-wrapper"

type MenuIconButtonProps = {
  regions: HttpTypes.StoreRegion[] | null
}

const DesktopSideMenu = ({ regions }: MenuIconButtonProps) => {
  const isScrolled = useNavScroll()

  return (
    <>
      {isScrolled && (
        <div className="h-full flex items-center">
          <SideMenu regions={regions} />
        </div>
      )}
    </>
  )
}

export default DesktopSideMenu
