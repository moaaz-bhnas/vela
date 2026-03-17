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
}


const CarouselControls = forwardRef<HTMLDivElement, CarouselControlsProps>(({ currentIndex, totalSlides, onPrev, onNext, isPrevDisabled, isNextDisabled, isPlaying, showAutoplayProgress, toggleAutoplay }, progressRef) => {
    return (
        <div className="flex gap-2 sm:gap-4 h-9">
            {/* Previous and Next Buttons */}
            <CarouselPager
                currentIndex={currentIndex}
                totalSlides={totalSlides}
                onPrev={onPrev}
                onNext={onNext}
                isPrevDisabled={isPrevDisabled}
                isNextDisabled={isNextDisabled}
            />

            {/* Autoplay Button */}
            <IconButton
                type='button'
                size='base'
                className='rounded-full h-9 w-9 relative shadow'
                onClick={toggleAutoplay}
            >
                <div style={{
                    animationName: "time-loader",
                    animationTimingFunction: "linear",
                    animationIterationCount: 1,
                    ...(showAutoplayProgress ? {} : { animationPlayState: "paused" }),
                }} className={clx("absolute inset-0.5 rounded-full border-[16px] border-ui-fg-interactive/30 rotate-45 animate-time-loader transition-opacity", showAutoplayProgress ? "" : "opacity-0")} ref={progressRef} />

                <div className="relative">
                    {isPlaying ? <PauseSolid /> : <PlaySolid />}
                </div>
            </IconButton>
        </div>
    )
})

CarouselControls.displayName = "CarouselControls"

export default CarouselControls