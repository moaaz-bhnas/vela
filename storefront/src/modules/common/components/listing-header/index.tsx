"use client"

import { clx, Heading } from "@medusajs/ui"

import FiltersMenu from "@modules/common/components/filters-menu"

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
  return (
    <div
      className={clx("flex w-full items-center gap-2", className)}
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
          <span className="text-small-regular text-ui-fg-subtle tabular-nums">
            ({count})
          </span>
        )}
      </div>

      <div className="small:hidden">
        {filterDrawerContent != null && (
          <FiltersMenu resultCount={count}>{filterDrawerContent}</FiltersMenu>
        )}
      </div>
    </div>
  )
}
