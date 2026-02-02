"use client"

import { useWindowScroll } from "@uidotdev/usehooks"
import _ from "lodash"
import { useEffect, useState } from "react"

export const useNavScroll = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [{ y }] = useWindowScroll()

  useEffect(
    function handleScroll() {
      if (_.isNumber(y)) {
        setIsScrolled(y > 0)
      }
    },
    [y]
  )

  return isScrolled
}
