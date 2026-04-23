"use client"

import { deleteLineItem } from "@lib/data/cart"
import { Spinner, Trash } from "@medusajs/icons"
import { clx } from "@medusajs/ui"
import { useState } from "react"

import ErrorMessage from "@modules/checkout/components/error-message"

const DeleteButton = ({
  id,
  children,
  className,
  "data-testid": dataTestId,
}: {
  id: string
  children?: React.ReactNode
  className?: string
  "data-testid"?: string
}) => {
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async (lineId: string) => {
    setError(null)
    setIsDeleting(true)
    try {
      const result = await deleteLineItem(lineId)
      if (!result.success) {
        setError(result.error)
      }
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div
      className={clx(
        "flex flex-col items-end gap-0 text-xs leading-5 font-normal w-full",
        className
      )}
    >
      <div
        className={clx(
          "flex items-center justify-between w-full",
          !children && "justify-end"
        )}
      >
        <button
          type="button"
          className="flex gap-x-1 text-ui-fg-subtle hover:text-ui-fg-base cursor-pointer min-h-11 items-center"
          onClick={() => handleDelete(id)}
          disabled={isDeleting}
          aria-busy={isDeleting}
          data-testid={dataTestId}
        >
          {isDeleting ? <Spinner className="animate-spin" /> : <Trash />}
          {children}
        </button>
      </div>
      <ErrorMessage
        error={error}
        data-testid="line-item-delete-error"
      />
    </div>
  )
}

export default DeleteButton
