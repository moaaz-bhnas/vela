"use client"

import { clx, Heading, Text } from "@medusajs/ui"

import FiltersMenu from "@modules/common/components/filters-menu"
import { useNavScroll } from "@modules/layout/components/nav-scroll-wrapper"

type ListingHeaderProps = {
  title: React.ReactNode
  count?: number
  className?: string
  titleTestId?: string
  /** When provided, shows the filter button and a right-side drawer with this content. */
  filterDrawerContent?: React.ReactNode
}

export default function ListingHeader({
  title,
  count,
  className,
  titleTestId,
  filterDrawerContent,
}: ListingHeaderProps) {
  const isScrolled = useNavScroll()

  return (
    <div
      className={clx(
        "sticky lg:static top-16 z-40 -mx-6 px-6 py-4 lg:py-0 border-b lg:border-b-0 transition",
        isScrolled
          ? "bg-ui-bg-base border-ui-border-base"
          : "border-transparent",
        className
      )}
    >
      <div
        className="flex w-full items-center gap-2"
        data-testid="listing-header"
      >
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Heading
            className="text-2xl sm:text-4xl font-bold font-heading"
            level="h2"
            data-testid={titleTestId}
          >
            {title}
          </Heading>
          {count != null && (
            <Text
              size="small"
              className="text-ui-fg-subtle tabular-nums"
            >
              ({count})
            </Text>
          )}
        </div>

        <div className="lg:hidden">
          {filterDrawerContent != null && (
            <FiltersMenu resultCount={count}>{filterDrawerContent}</FiltersMenu>
          )}
        </div>
      </div>
    </div>
  )
}
