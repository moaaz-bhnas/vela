"use client"

import { useEffect } from "react"
import { setCategoryCookie } from "@lib/util/personalization-cookies"

type TrackCategoryVisitProps = {
    categoryId: string
}

export default function TrackCategoryVisit({ categoryId }: TrackCategoryVisitProps) {
    useEffect(function trackCategoryVisit() {
        if (categoryId) {
            setCategoryCookie(categoryId)
        }
    }, [categoryId])

    return null
}

