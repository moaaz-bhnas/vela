"use client"

import { useCallback, useEffect, useState } from "react"
import useEmblaCarousel from "embla-carousel-react"
import { HttpTypes } from "@medusajs/types"
import Image from "next/image"
import { clx, Container } from "@medusajs/ui"
import { ChevronLeft, ChevronRight } from "@medusajs/icons"
import { IconButton } from "@medusajs/ui"
import { usePrevNextButtons } from "@lib/hooks/use-carousel"
import { useLocaleDirection } from "@lib/hooks/use-locale-direction"
import { useProductOptions } from "@lib/hooks/use-product-options"
import { useMediaQuery } from "@uidotdev/usehooks"
import FullscreenLightbox from "./fullscreen-lightbox"

type ImageGalleryProps = {
  product: HttpTypes.StoreProduct
}

function getVariantImages(
  variant: HttpTypes.StoreProductVariant | undefined,
  fallback: HttpTypes.StoreProductImage[]
): HttpTypes.StoreProductImage[] {
  const images = variant?.images
  if (images && images.length > 0) return images
  return fallback
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
  direction,
}: {
  slides: HttpTypes.StoreProductImage[]
  selectedIndex: number
  onThumbClick: (index: number) => void
  isDesktop: boolean
  direction: "ltr" | "rtl"
}) {
  const [emblaThumbsRef, emblaThumbsApi] = useEmblaCarousel({
    axis: isDesktop ? "y" : "x",
    containScroll: "keepSnaps",
    dragFree: true,
    align: "start",
    direction,
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

export default function ImageGallery({ product }: ImageGalleryProps) {
  const { selectedVariant } = useProductOptions(product)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const isDesktop = useMediaQuery("(min-width: 1024px)") ?? false
  const direction = useLocaleDirection()
  const isRtl = direction === "rtl"
  const [emblaMainRef, emblaMainApi] = useEmblaCarousel({
    loop: false,
    align: "start",
    duration: 25,
    direction,
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

  const slides = getVariantImages(selectedVariant, product.images ?? [])
  const hasSlides = slides.length > 0
  const showThumbnails = slides.length > 1
  const showControls = slides.length > 1

  // Keep user position across variants, but clamp if next variant has fewer images.
  useEffect(
    function clampSelectedIndexOnVariantChange() {
      if (!emblaMainApi || slides.length === 0) return

      const nextIndex = Math.min(selectedIndex, slides.length - 1)

      if (nextIndex === selectedIndex) return

      emblaMainApi.scrollTo(nextIndex)
      setSelectedIndex(nextIndex)
    },
    [emblaMainApi, selectedVariant?.id, selectedIndex, slides.length]
  )

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
                <button
                  type="button"
                  onClick={() => setLightboxOpen(true)}
                  className="relative aspect-[11/14] w-full overflow-hidden rounded-rounded bg-ui-bg-subtle block cursor-zoom-in group"
                  aria-label={`View image ${index + 1} fullscreen`}
                >
                  {image?.url ? (
                    <Image
                      src={image.url}
                      priority={index <= 2}
                      className="absolute inset-0 rounded-rounded object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                      alt={`Product image ${index + 1}`}
                      fill
                      sizes="(max-width: 576px) 280px, (max-width: 768px) 360px, (max-width: 992px) 480px, 800px"
                      draggable={false}
                    />
                  ) : (
                    <div className="absolute inset-0 bg-ui-bg-subtle" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

        {showControls && (
          <div
            className="absolute inset-y-0 inset-x-0 flex items-center px-2 pointer-events-none"
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
                {isRtl ? (
                  <ChevronRight className="text-ui-fg-base" />
                ) : (
                  <ChevronLeft className="text-ui-fg-base" />
                )}
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
                {isRtl ? (
                  <ChevronLeft className="text-ui-fg-base" />
                ) : (
                  <ChevronRight className="text-ui-fg-base" />
                )}
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
            direction={direction}
          />
        </div>
      )}

      {lightboxOpen && (
        <FullscreenLightbox
          images={slides}
          startIndex={selectedIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  )
}
