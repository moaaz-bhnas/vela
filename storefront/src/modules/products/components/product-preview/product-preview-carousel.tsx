"use client"

import { useCallback } from "react"
import useEmblaCarousel from "embla-carousel-react"
import Fade from "embla-carousel-fade"
import { Container, clx, IconButton } from "@medusajs/ui"
import { ChevronLeft, ChevronRight } from "@medusajs/icons"
import Image from "next/image"
import { useCarouselIndex, usePrevNextButtons } from "@lib/hooks/use-carousel"
import PlaceholderImage from "@modules/common/icons/placeholder-image"
import { useMediaQuery } from "@uidotdev/usehooks"

type ProductPreviewCarouselProps = {
  thumbnail?: string | null
  images?: { url?: string }[] | null
  isFeatured?: boolean
  size?: "small" | "medium" | "large" | "full" | "square"
}

function buildSlideUrls(
  thumbnail: string | null | undefined,
  images: { url?: string }[] | null | undefined
): string[] {
  const urls: string[] = []
  if (thumbnail) urls.push(thumbnail)
  const imageUrls = (images ?? [])
    .map((img) => img?.url)
    .filter((url): url is string => Boolean(url))
  for (const url of imageUrls) {
    if (!urls.includes(url)) urls.push(url)
  }
  return urls
}

export default function ProductPreviewCarousel({
  thumbnail,
  images,
  isFeatured,
  size = "full",
}: ProductPreviewCarouselProps) {
  const MAX_SLIDES = 6
  const slideUrls = buildSlideUrls(thumbnail, images)
  const hasSlides = slideUrls.length > 0
  const displayUrls = hasSlides ? slideUrls.slice(0, MAX_SLIDES) : [""]
  const showControls = displayUrls.length > 1
  const totalSlides = displayUrls.length
  const isDesktop = useMediaQuery("(min-width: 768px)") ?? false

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, duration: 30, watchDrag: !isDesktop },
    [Fade()]
  )

  const { currentSlide } = useCarouselIndex(emblaApi)
  const {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick,
  } = usePrevNextButtons(emblaApi)

  const handlePrev = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      onPrevButtonClick()
    },
    [onPrevButtonClick]
  )

  const handleNext = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      onNextButtonClick()
    },
    [onNextButtonClick]
  )

  const handleDotClick = useCallback(
    (index: number) => (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      emblaApi?.scrollTo(index)
    },
    [emblaApi]
  )

  return (
    <Container
      className={clx(
        "relative w-full overflow-hidden p-4 bg-ui-bg-subtle shadow-elevation-card-rest rounded-large group-hover:shadow-elevation-card-hover transition-shadow ease-in-out duration-150",
        {
          "aspect-[11/14]": isFeatured,
          "aspect-[9/16]": !isFeatured && size !== "square",
          "aspect-[1/1]": size === "square",
          "w-[180px]": size === "small",
          "w-[290px]": size === "medium",
          "w-[440px]": size === "large",
          "w-full": size === "full",
        }
      )}
      data-testid="product-preview-carousel"
    >
      <div
        className="embla__viewport overflow-hidden absolute inset-0"
        ref={emblaRef}
      >
        <div className="embla__container flex h-full touch-pan-y touch-pinch-zoom">
          {displayUrls.map((url, index) => (
            <div
              key={url || index}
              className="embla__slide flex-[0_0_100%] min-w-0 relative h-full w-full"
            >
              {url ? (
                <Image
                  src={url}
                  alt=""
                  className="block h-full w-full object-cover object-center select-none"
                  draggable={false}
                  quality={50}
                  sizes="(max-width: 576px) 280px, (max-width: 768px) 360px, (max-width: 992px) 480px, 800px"
                  fill
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <PlaceholderImage size={24} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {showControls && (
        <>
          {/* Side-centered arrows, no background container */}
          <div
            className={clx(
              "pointer-events-none absolute inset-y-0 left-0 right-0 hidden md:flex items-center justify-between px-2 z-10 transition-opacity",
              "opacity-100 md:opacity-0 md:group-hover:opacity-100"
            )}
            aria-label="Carousel navigation"
            data-prevent-progress="true"
          >
            <IconButton
              type="button"
              variant="transparent"
              size="base"
              className="pointer-events-auto rounded-full h-9 w-9 shadow-none border-0 bg-transparent"
              onClick={handlePrev}
              disabled={prevBtnDisabled}
              aria-label="Previous image"
            >
              <ChevronLeft className="text-ui-fg-muted" />
            </IconButton>
            <IconButton
              type="button"
              variant="transparent"
              size="base"
              className="pointer-events-auto rounded-full h-9 w-9 shadow-none border-0 bg-transparent"
              onClick={handleNext}
              disabled={nextBtnDisabled}
              aria-label="Next image"
            >
              <ChevronRight className="text-ui-fg-muted" />
            </IconButton>
          </div>

          {/* Bottom-centered dots */}
          <div
            className={clx(
              "absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center z-10 transition-opacity",
              "opacity-100 md:opacity-0 md:group-hover:opacity-100"
            )}
            aria-label="Carousel pagination"
            data-prevent-progress="true"
          >
            {displayUrls.map((_, slideIndex) => (
              <button
                key={slideIndex}
                type="button"
                onClick={handleDotClick(slideIndex)}
                aria-label={`Go to image ${slideIndex + 1}`}
                aria-current={slideIndex === currentSlide ? "true" : undefined}
                className={clx(
                  "rounded-full w-3.5 h-3.5 p-1 flex items-center justify-center"
                )}
              >
                <span
                  className={clx(
                    "rounded-full w-full h-full bg-ui-button-inverted opacity-40 transition-opacity",
                    slideIndex === currentSlide ? "opacity-100" : ""
                  )}
                />
              </button>
            ))}
          </div>
        </>
      )}
    </Container>
  )
}
