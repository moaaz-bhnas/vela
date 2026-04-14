import { clx, IconButton } from '@medusajs/ui'
import { PauseSolid, PlaySolid } from '@medusajs/icons'
import React, { forwardRef } from 'react'
import CarouselPager from '@modules/common/components/carousel-pager'



type CarouselControlsProps = {
    currentIndex: number
    totalSlides: number
    onPrev: () => void
    onNext: () => void
    isPrevDisabled: boolean
    isNextDisabled: boolean
    isPlaying: boolean
    showAutoplayProgress: boolean
    toggleAutoplay: () => void
    showAutoplayToggle?: boolean
}


const CarouselControls = forwardRef<HTMLDivElement, CarouselControlsProps>(({ currentIndex, totalSlides, onPrev, onNext, isPrevDisabled, isNextDisabled, isPlaying, showAutoplayProgress, toggleAutoplay, showAutoplayToggle = true }, progressRef) => {
    return (
        <div className="flex gap-2 sm:gap-4 min-h-11 items-center">
            {/* Previous and Next Buttons */}
            <CarouselPager
                currentIndex={currentIndex}
                totalSlides={totalSlides}
                onPrev={onPrev}
                onNext={onNext}
                isPrevDisabled={isPrevDisabled}
                isNextDisabled={isNextDisabled}
            />

            {/* Autoplay Button — hidden when user prefers reduced motion */}
            {showAutoplayToggle ? (
            <IconButton
                type='button'
                size='base'
                className='rounded-full h-11 w-11 min-h-11 min-w-11 shrink-0 relative shadow focus-visible:ring-2 focus-visible:ring-ui-fg-interactive focus-visible:ring-offset-2 focus-visible:ring-offset-ui-bg-base'
                onClick={toggleAutoplay}
                aria-label={isPlaying ? "Pause slideshow" : "Play slideshow"}
            >
                <div style={{
                    animationName: "time-loader",
                    animationTimingFunction: "linear",
                    animationIterationCount: 1,
                    ...(showAutoplayProgress ? {} : { animationPlayState: "paused" }),
                }} className={clx("absolute inset-0.5 rounded-full border-[16px] border-ui-fg-interactive/30 rotate-45 animate-time-loader motion-reduce:animate-none transition-opacity", showAutoplayProgress ? "" : "opacity-0")} ref={progressRef} />

                <div className="relative">
                    {isPlaying ? <PauseSolid /> : <PlaySolid />}
                </div>
            </IconButton>
            ) : null}
        </div>
    )
})

CarouselControls.displayName = "CarouselControls"

export default CarouselControls