"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import useEmblaCarousel from "embla-carousel-react"
import { HttpTypes } from "@medusajs/types"
import Image from "next/image"
import { IconButton } from "@medusajs/ui"
import { XMark } from "@medusajs/icons"
import { usePrevNextButtons } from "@lib/hooks/use-carousel"
import { useLocaleDirection } from "@lib/hooks/use-locale-direction"
import CarouselPager from "@modules/common/components/carousel-pager"

type FullscreenLightboxProps = {
  images: HttpTypes.StoreProductImage[]
  startIndex: number
  onClose: () => void
}

export default function FullscreenLightbox({
  images,
  startIndex,
  onClose,
}: FullscreenLightboxProps) {
  const direction = useLocaleDirection()
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    startIndex,
    duration: 20,
    direction,
  })
  const [currentIndex, setCurrentIndex] = useState(startIndex)
  const containerRef = useRef<HTMLDivElement>(null)

  const {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick,
  } = usePrevNextButtons(emblaApi)

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setCurrentIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  const preventScroll = useCallback(() => {
    document.body.style.overflow = "hidden"
  }, [])

  const allowScroll = useCallback(() => {
    document.body.style.overflow = ""
  }, [])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on("select", onSelect).on("reInit", onSelect)
  }, [emblaApi, onSelect])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
      // Map physical arrows to Embla prev/next; with direction "rtl" Embla inverts flow.
      if (e.key === "ArrowLeft") emblaApi?.scrollPrev()
      if (e.key === "ArrowRight") emblaApi?.scrollNext()
    }
    document.addEventListener("keydown", handleKeyDown)
    preventScroll()
    containerRef.current?.focus()
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      allowScroll()
    }
  }, [emblaApi, onClose, preventScroll, allowScroll])

  return createPortal(
    <div
      ref={containerRef}
      tabIndex={-1}
      className="fixed inset-0 z-[9999] flex flex-col bg-ui-bg-base outline-none"
      role="dialog"
      aria-modal="true"
      aria-label="Image lightbox"
    >
      {/* Close button */}
      <div className="absolute end-4 top-4 z-10">
        <IconButton
          type="button"
          className="rounded-full"
          onClick={onClose}
          aria-label="Close lightbox"
        >
          <XMark />
        </IconButton>
      </div>

      {/* Carousel area */}
      <div className="relative flex-1 min-h-0 flex items-center h-full">
        <div
          className="embla__viewport w-full h-full overflow-hidden"
          ref={emblaRef}
        >
          <div className="embla__container flex h-full touch-pan-y touch-pinch-zoom">
            {images.map((image, index) => (
              <div
                key={image.id || index}
                className="embla__slide flex-[0_0_100%] flex items-center justify-center"
              >
                {image?.url ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={image.url}
                      alt={`Product image ${index + 1}`}
                      fill
                      className="object-contain select-none"
                      sizes="100vw"
                      priority={index === startIndex}
                      draggable={false}
                    />
                  </div>
                ) : (
                  <div className="w-full h-full bg-ui-bg-subtle rounded-rounded" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Navigation controls */}
        {images.length > 1 && (
          <div className="absolute inset-x-0 bottom-6 flex justify-center z-10 h-9">
            <CarouselPager
              currentIndex={currentIndex}
              totalSlides={images.length}
              onPrev={onPrevButtonClick}
              onNext={onNextButtonClick}
              isPrevDisabled={prevBtnDisabled}
              isNextDisabled={nextBtnDisabled}
            />
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}

