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
    <div
      className="rounded-full flex divide-x bg-ui-bg-base h-11 min-h-11 overflow-hidden shadow border border-ui-border-base"
      role="group"
      aria-label="Slide navigation"
    >
      <IconButton
        type="button"
        variant="transparent"
        size="base"
        className="rounded-none h-11 min-h-11 min-w-11 focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ui-fg-interactive"
        onClick={onPrev}
        disabled={isPrevDisabled}
        aria-label="Previous slide"
      >
        <ChevronLeft className="text-ui-fg-muted" />
      </IconButton>
      <span className="w-10 flex items-center justify-center text-xs leading-5 font-semibold text-ui-fg-muted">
        {currentIndex + 1}/{totalSlides}
      </span>
      <IconButton
        type="button"
        variant="transparent"
        size="base"
        className="rounded-none h-11 min-h-11 min-w-11 focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ui-fg-interactive"
        onClick={onNext}
        disabled={isNextDisabled}
        aria-label="Next slide"
      >
        <ChevronRight className="text-ui-fg-muted" />
      </IconButton>
    </div>
  )
}

export default CarouselPager

