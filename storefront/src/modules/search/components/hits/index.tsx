import { Heading, clx } from "@medusajs/ui"
import React from "react"

import { ProductHit } from "../hit"

type HitsProps<THit> = React.ComponentProps<"div"> & {
  hits: THit[]
  title?: string
  hitComponent: (props: {
    hit: THit
    onHitClick?: (hit: THit) => void
  }) => JSX.Element
  onHitClick?: (hit: THit) => void
  titleTestId?: string
  resultsTestId?: string
}

const MAX_VISIBLE = 6
const MOBILE_VISIBLE = 3

const Hits = <THit extends ProductHit>({
  hits,
  title,
  hitComponent: Hit,
  onHitClick,
  className,
  titleTestId,
  resultsTestId = "search-results",
  ...rest
}: HitsProps<THit>) => {
  const displayHits = hits.slice(0, MAX_VISIBLE)

  if (displayHits.length === 0) {
    return null
  }

  return (
    <div className={clx("mb-4", className)} {...rest}>
      {title && (
        <div className="mb-3 px-1">
          <Heading
            level="h3"
            className="text-ui-fg-subtle text-[0.75rem] uppercase tracking-wide"
            data-testid={titleTestId}
          >
            {title}
          </Heading>
        </div>
      )}
      <div
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        data-testid={resultsTestId}
      >
        {displayHits.map((hit, index) => (
          <li
            key={(hit as ProductHit).id ?? index}
            className={clx("list-none", {
              "hidden sm:block": index >= MOBILE_VISIBLE,
            })}
          >
            <Hit hit={hit} onHitClick={onHitClick} />
          </li>
        ))}
      </div>
    </div>
  )
}

export default Hits
