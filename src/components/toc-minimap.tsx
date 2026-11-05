"use client"

import { useEffect, useMemo, useState } from "react"

import { uMiniMapOpenSound } from "@/lib/u-mini-map-open"
import { cn } from "@/lib/utils"
import { useSound } from "@/hooks/soundcn/use-sound"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { LineNav } from "@/components/line-nav"

export type TOCItemType = {
  title: React.ReactNode
  url: string
  depth: number
}

export type TOCMinimapProps = {
  /** @fumadocsHref #tocitemtype */
  items: TOCItemType[]
  className?: string
}

export function TOCMinimap({ items, className }: TOCMinimapProps) {
  const itemIds = useMemo(
    () => items.map((item) => item.url.replace("#", "")),
    [items]
  )

  const activeHeading = useActiveHeading(itemIds)

  const [play] = useSound(uMiniMapOpenSound, { volume: 0.3 })

  if (!items.length) {
    return null
  }

  return (
    <div className={cn("w-18", className)}>
      <HoverCard
        openDelay={0}
        closeDelay={0}
        onOpenChange={(open) => {
          if (open) play()
        }}
      >
        <HoverCardTrigger asChild>
          <div className="flex max-h-[50dvh] flex-col gap-3 overflow-hidden py-3 pl-6 opacity-100 transition-opacity duration-200 data-popup-open:opacity-0">
            {items.map((item) => (
              <div
                key={item.url}
                role="button"
                tabIndex={0}
                title={typeof item.title === "string" ? item.title : undefined}
                data-depth={item.depth}
                data-active={item.url === `#${activeHeading}`}
                className={cn(
                  "h-0.5 w-6 shrink-0 cursor-pointer rounded-xs bg-ring/50 transition-[background-color] duration-200 hover:bg-foreground",
                  "data-[depth=3]:ml-2 data-[depth=3]:w-4",
                  "data-[depth=4]:ml-4 data-[depth=4]:w-2",
                  "data-active:bg-foreground"
                )}
                onClick={() => scrollToHeading(item.url)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault()
                    scrollToHeading(item.url)
                  }
                }}
              />
            ))}
          </div>
        </HoverCardTrigger>

        <HoverCardContent
          className="w-56 overflow-hidden p-0 duration-200 data-[side=left]:slide-in-from-right-3 data-[side=left]:slide-out-to-right-3 data-open:zoom-in-100 data-closed:zoom-out-100"
          align="start"
          alignOffset={0}
          side="left"
          sideOffset={-60}
        >
          <ScrollArea className="toc-scrollbar max-h-[50dvh] overscroll-contain">
            <LineNav
              className="gap-2 px-4 py-4 [&>a]:h-auto [&>a]:min-h-8 [&>a]:items-start [&>a]:gap-2 [&>a]:py-1 [&>a]:after:p-2 [&>a>span:last-child]:whitespace-normal [&>a>span:last-child]:leading-5 [&>span]:ml-0"
              ariaLabel="Article table of contents"
              items={items.map((item) => ({
                title: `${item.depth > 2 ? "　" : ""}${String(item.title)}`,
                href: item.url,
              }))}
              activeHref={activeHeading ? `#${activeHeading}` : undefined}
              onItemClick={handleLineNavClick}
            />
          </ScrollArea>
        </HoverCardContent>
      </HoverCard>
    </div>
  )
}

export function useActiveHeading(itemIds: string[]) {
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        }
      },
      { rootMargin: "0% 0% -80% 0%", threshold: 0.98 }
    )

    for (const id of itemIds ?? []) {
      const element = document.getElementById(id)
      if (element) {
        observer.observe(element)
      }
    }

    return () => {
      for (const id of itemIds ?? []) {
        const element = document.getElementById(id)
        if (element) {
          observer.unobserve(element)
        }
      }
    }
  }, [itemIds])

  return activeId
}

function handleLineNavClick(
  item: { href: string; title: string },
  e: React.MouseEvent<HTMLAnchorElement>
) {
  e.preventDefault()
  scrollToHeading(item.href)
}

function scrollToHeading(url: string) {
  history.pushState(null, "", url)
  document.getElementById(url.replace("#", ""))?.scrollIntoView({
    behavior: "smooth",
  })
}
