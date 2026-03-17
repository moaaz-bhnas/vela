import React from "react"
import { IconButton } from "@medusajs/ui"
import { ChevronLeft, ChevronRight } from "@medusajs/icons"

type CarouselPagerProps = {
  currentIndex: number
  totalSlides: number
  onPrev: () => void
  onNext: () => void
  isPrevDisabled: boolean
  isNextDisabled: boolean
}

const CarouselPager: React.FC<CarouselPagerProps> = ({
  currentIndex,
  totalSlides,
  onPrev,
  onNext,
  isPrevDisabled,
  isNextDisabled,
}) => {
  return (
    <div className="rounded-full flex divide-x bg-ui-bg-base h-full overflow-hidden shadow border border-ui-border-base">
      <IconButton
        type="button"
        variant="transparent"
        size="base"
        className="rounded-none h-full w-9"
        onClick={onPrev}
        disabled={isPrevDisabled}
      >
        <ChevronLeft className="text-ui-fg-muted" />
      </IconButton>
      <span className="w-10 flex items-center justify-center text-small-semi text-ui-fg-muted">
        {currentIndex + 1}/{totalSlides}
      </span>
      <IconButton
        type="button"
        variant="transparent"
        size="base"
        className="rounded-none h-full w-9"
        onClick={onNext}
        disabled={isNextDisabled}
      >
        <ChevronRight className="text-ui-fg-muted" />
      </IconButton>
    </div>
  )
}

export default CarouselPager

