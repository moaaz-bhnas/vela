"use client"

import { useCallback, useEffect, useState } from "react"
import useEmblaCarousel from "embla-carousel-react"
import { HttpTypes } from "@medusajs/types"
import Image from "next/image"
import { clx, Container } from "@medusajs/ui"
import { ChevronLeft, ChevronRight } from "@medusajs/icons"
import { IconButton } from "@medusajs/ui"
import { usePrevNextButtons } from "@lib/hooks/use-carousel"
import { useMediaQuery } from "@uidotdev/usehooks"

type ImageGalleryProps = {
  images: HttpTypes.StoreProductImage[]
}

function ProductGalleryThumb({
  image,
  selected,
  onClick,
  vertical,
}: {
  image: HttpTypes.StoreProductImage
  selected: boolean
  onClick: () => void
  vertical?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clx(
        "relative block w-20 aspect-[11/14] bg-ui-bg-subtle cursor-pointer rounded-rounded overflow-hidden border-2 transition-colors shrink-0",
        selected
          ? "border-ui-border-base ring-2 ring-ui-fg-interactive"
          : "border-transparent opacity-70 hover:opacity-100"
      )}
      aria-label="View image"
    >
      {image?.url ? (
        <Image
          src={image.url}
          alt=""
          fill
          className="object-cover select-none"
          sizes="80px"
          draggable={false}
        />
      ) : (
        <div className="absolute inset-0 bg-ui-bg-subtle" />
      )}
    </button>
  )
}

function ThumbsCarousel({
  slides,
  selectedIndex,
  onThumbClick,
  isDesktop,
}: {
  slides: HttpTypes.StoreProductImage[]
  selectedIndex: number
  onThumbClick: (index: number) => void
  isDesktop: boolean
}) {
  const [emblaThumbsRef, emblaThumbsApi] = useEmblaCarousel({
    axis: isDesktop ? "y" : "x",
    containScroll: "keepSnaps",
    dragFree: true,
    align: "start",
  })

  useEffect(() => {
    if (!emblaThumbsApi) return
    emblaThumbsApi.scrollTo(selectedIndex)
  }, [emblaThumbsApi, selectedIndex])

  return (
    <div
      className={clx("embla-thumbs__viewport overflow-hidden")}
      ref={emblaThumbsRef}
    >
      <div
        className={clx(
          "embla-thumbs__container flex gap-2 p-0.5",
          isDesktop ? "flex-col" : "flex-row"
        )}
      >
        {slides.map((image, index) => (
          <div key={image.id || index} className={clx("embla__slide")}>
            <ProductGalleryThumb
              image={image}
              selected={index === selectedIndex}
              onClick={() => onThumbClick(index)}
              vertical={isDesktop}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function ImageGallery({ images }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const isDesktop = useMediaQuery("(min-width: 1024px)") ?? false
  const [emblaMainRef, emblaMainApi] = useEmblaCarousel({
    loop: false,
    align: "start",
    duration: 25,
  })

  const {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick,
  } = usePrevNextButtons(emblaMainApi)

  const onThumbClick = useCallback(
    function handleThumbClick(index: number) {
      if (!emblaMainApi) return
      emblaMainApi.scrollTo(index)
    },
    [emblaMainApi]
  )

  const onSelect = useCallback(
    function handleSelect() {
      if (!emblaMainApi) return
      setSelectedIndex(emblaMainApi.selectedScrollSnap())
    },
    [emblaMainApi]
  )

  useEffect(() => {
    if (!emblaMainApi) return
    onSelect()
    emblaMainApi.on("select", onSelect).on("reInit", onSelect)
  }, [emblaMainApi, onSelect])

  const slides = images?.length ? images : []
  const hasSlides = slides.length > 0
  const showThumbnails = slides.length > 1
  const showControls = slides.length > 1

  if (!hasSlides) {
    return (
      <div className="relative aspect-[11/14] w-full overflow-hidden rounded-rounded bg-ui-bg-subtle" />
    )
  }

  return (
    <div
      className={clx(
        showThumbnails ? "flex gap-4 lg:gap-2 flex-col lg:flex-row" : ""
      )}
    >
      {/* Main carousel – first on mobile, right on desktop */}
      <Container className="relative p-0 order-1 lg:order-2">
        <div
          className="embla__viewport overflow-hidden rounded-rounded bg-ui-bg-subtle"
          ref={emblaMainRef}
        >
          <div className="embla__container flex touch-pan-y touch-pinch-zoom">
            {slides.map((image, index) => (
              <div
                key={image.id || index}
                className="embla__slide flex-[0_0_100%] relative"
              >
                <div className="relative aspect-[11/14] w-full overflow-hidden rounded-rounded bg-ui-bg-subtle">
                  {image?.url ? (
                    <Image
                      src={image.url}
                      priority={index <= 2}
                      className="absolute inset-0 rounded-rounded object-cover"
                      alt={`Product image ${index + 1}`}
                      fill
                      sizes="(max-width: 576px) 280px, (max-width: 768px) 360px, (max-width: 992px) 480px, 800px"
                      draggable={false}
                    />
                  ) : (
                    <div className="absolute inset-0 bg-ui-bg-subtle" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {showControls && (
          <div
            className="absolute inset-y-0 left-0 right-0 flex items-center px-2 pointer-events-none"
            aria-hidden
          >
            {!prevBtnDisabled && (
              <IconButton
                type="button"
                size="base"
                className="pointer-events-auto rounded-full h-9 w-9 me-auto"
                onClick={onPrevButtonClick}
                aria-label="Previous image"
              >
                <ChevronLeft className="text-ui-fg-base" />
              </IconButton>
            )}
            {!nextBtnDisabled && (
              <IconButton
                type="button"
                size="base"
                className="pointer-events-auto rounded-full h-9 w-9 ms-auto"
                onClick={onNextButtonClick}
                aria-label="Next image"
              >
                <ChevronRight className="text-ui-fg-base" />
              </IconButton>
            )}
          </div>
        )}
      </Container>

      {/* Thumbnails – below on mobile, vertical left on desktop */}
      {showThumbnails && (
        <div className="order-2 lg:order-1 min-h-0 lg:h-full">
          <ThumbsCarousel
            key={isDesktop ? "vertical" : "horizontal"}
            slides={slides}
            selectedIndex={selectedIndex}
            onThumbClick={onThumbClick}
            isDesktop={isDesktop}
          />
        </div>
      )}
    </div>
  )
}
