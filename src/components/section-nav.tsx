"use client"

import { useState, useEffect, useCallback } from "react"
import { usePathname } from "next/navigation"
import { LineNav, type LineNavItem } from "@/components/line-nav"

type SectionNavProps = {
  items: LineNavItem[]
  className?: string
}

export function SectionNav({ items, className }: SectionNavProps) {
  const pathname = usePathname()
  const [activeHref, setActiveHref] = useState(items[0]?.href ?? "")

  useEffect(() => {
    if (pathname !== "/") {
      setActiveHref("")
    } else {
      setActiveHref(items[0]?.href ?? "")
    }
  }, [items, pathname])

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          setActiveHref(`#${entry.target.id}`)
        }
      }
    },
    []
  )

  useEffect(() => {
    if (pathname !== "/") {
      return
    }

    const observer = new IntersectionObserver(handleIntersection, {
      rootMargin: "-20% 0px -70% 0px",
      threshold: 0,
    })

    for (const item of items) {
      const id = item.href.replace("#", "")
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    }

    return () => observer.disconnect()
  }, [items, handleIntersection, pathname])

  if (pathname !== "/") {
    return null
  }

  return (
    <div className={`fixed right-8 top-1/2 z-40 hidden -translate-y-1/2 xl:block ${className ?? ""}`}>
      <LineNav
        className="w-48"
        items={items}
        activeHref={activeHref}
        scrollActiveIntoView={false}
      />
    </div>
  )
}
