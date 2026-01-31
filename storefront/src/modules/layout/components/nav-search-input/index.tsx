"use client"

import { MagnifyingGlassMini } from "@medusajs/icons"
import { useRouter } from "next/navigation"
import { Button } from "@medusajs/ui"
import { clx } from "@medusajs/ui"

type NavSearchInputProps = {
    className?: string
    placeholder?: string
}

const NavSearchInput = ({ className, placeholder = "Search products..." }: NavSearchInputProps) => {
    const router = useRouter()

    const handleClick = () => {
        router.push("/search")
    }

    return (
        <Button
            variant="transparent"
            onClick={handleClick}
            className={clx(
                "w-full max-w-2xl flex items-center gap-x-2 px-4 py-2 bg-ui-bg-field hover:bg-ui-bg-field-hover border border-ui-border-base rounded-rounded text-ui-fg-subtle hover:text-ui-fg-base",
                className
            )}
            data-testid="nav-search-input"
        >
            <MagnifyingGlassMini />
            <span className="text-small-regular flex-1 text-left">{placeholder}</span>
        </Button>
    )
}

export default NavSearchInput

