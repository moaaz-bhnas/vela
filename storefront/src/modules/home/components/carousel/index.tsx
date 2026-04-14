"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"
import useEmblaCarousel from "embla-carousel-react"
import type { CarouselSlide } from "@lib/data/branding"
import Fade from "embla-carousel-fade"
import Autoplay from "embla-carousel-autoplay"
import {
  useAutoplay,
  useAutoplayProgress,
  useCarouselIndex,
  usePrevNextButtons,
} from "@lib/hooks/use-carousel"
import { usePrefersReducedMotion } from "@lib/hooks/use-prefers-reduced-motion"
import CarouselSlideContent from "./carousel-slide-content"
import CarouselControls from "./carousel-controls"

type CarouselProps = {
  carouselSlides: CarouselSlide[]
}

export default function Carousel({ carouselSlides }: CarouselProps) {
  const prefersReducedMotion = usePrefersReducedMotion()

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 30 }, [
    Fade(),
    Autoplay({ playOnInit: false, delay: 5000 }),
  ])

  useEffect(() => {
    const autoplay = emblaApi?.plugins()?.autoplay
    if (!emblaApi || !autoplay) return
    if (prefersReducedMotion) {
      autoplay.stop()
    } else {
      autoplay.play()
    }
  }, [emblaApi, prefersReducedMotion])

  const progressRef = useRef<HTMLDivElement>(null)
  const { showAutoplayProgress } = useAutoplayProgress(emblaApi, progressRef)

  const { autoplayIsPlaying, toggleAutoplay, onAutoplayButtonClick } =
    useAutoplay(emblaApi)

  const {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick,
  } = usePrevNextButtons(emblaApi)

  const { currentSlide } = useCarouselIndex(emblaApi)

  if (!carouselSlides || carouselSlides.length === 0) {
    return null
  }

  const sortedSlides = [...carouselSlides].sort(
    (a, b) => (a.sort_order || 0) - (b.sort_order || 0)
  )
  const hasMultipleSlides = sortedSlides.length > 1

  return (
    <div
      className="embla bg-ui-bg-base relative"
      style={{ "--slide-height": "75vh" } as React.CSSProperties}
    >
      <div
        className="embla__viewport overflow-hidden rounded-2xl"
        ref={emblaRef}
      >
        <div className="embla__container flex touch-pan-y touch-pinch-zoom">
          {sortedSlides.map((slide, index) => (
            <div
              key={index}
              className="embla__slide translate-x-0 flex-[0_0_100%] min-w-0 relative h-[60vh] sm:h-[75vh]"
            >
              {slide.image_url ? (
                <Image
                  src={slide.image_url}
                  alt={slide.title || `Slide ${index + 1}`}
                  fill
                  className="embla__slide__img object-cover select-none"
                  sizes="100vw"
                  priority={index === 0}
                  unoptimized
                />
              ) : (
                <div className="h-full w-full bg-ui-bg-subtle" />
              )}
              <div className="absolute inset-0 z-10">
                <CarouselSlideContent slide={slide} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {hasMultipleSlides && (
        <div className="absolute bottom-4 right-4">
          <CarouselControls
            ref={progressRef}
            currentIndex={currentSlide}
            totalSlides={carouselSlides.length}
            onPrev={() => onAutoplayButtonClick(onPrevButtonClick)}
            onNext={() => onAutoplayButtonClick(onNextButtonClick)}
            isPrevDisabled={prevBtnDisabled}
            isNextDisabled={nextBtnDisabled}
            isPlaying={autoplayIsPlaying}
            showAutoplayProgress={
              showAutoplayProgress && !prefersReducedMotion
            }
            toggleAutoplay={toggleAutoplay}
            showAutoplayToggle={!prefersReducedMotion}
          />
        </div>
      )}
    </div>
  )
}
