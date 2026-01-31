"use client"

import { HttpTypes } from "@medusajs/types"
import SideMenu from "../side-menu"
import { useNavScroll } from "../nav-scroll-wrapper"

type DesktopSideMenuProps = {
  regions: HttpTypes.StoreRegion[] | null
}

const DesktopSideMenu = ({ regions }: DesktopSideMenuProps) => {
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
