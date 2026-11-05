"use client"

import { useEffect, useMemo, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { ListTree } from "lucide-react"

import { uMiniMapOpenSound } from "@/lib/u-mini-map-open"
import { cn } from "@/lib/utils"
import { useSound } from "@/hooks/soundcn/use-sound"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
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
  mobile?: boolean
}

export function TOCMinimap({ items, className, mobile = false }: TOCMinimapProps) {
  const itemIds = useMemo(
    () => items.map((item) => item.url.replace("#", "")),
    [items]
  )

  const activeHeading = useActiveHeading(itemIds)
  const [hoveredHeading, setHoveredHeading] = useState<string | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const previewHeading = items.find((item) => item.url === hoveredHeading)

  const [play] = useSound(uMiniMapOpenSound, { volume: 0.3 })

  if (!items.length) {
    return null
  }

  if (mobile) {
    return (
      <Popover open={mobileOpen} onOpenChange={setMobileOpen}>
        <PopoverTrigger asChild>
          <Button variant="secondary" size="sm" className="max-w-[min(18rem,calc(100vw-2rem))] gap-2 rounded-full shadow-lg">
            <ListTree className="size-4 shrink-0" aria-hidden="true" />
            <span className="truncate">{items.find((item) => item.url === `#${activeHeading}`)?.title ?? "On this page"}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" side="top" className="w-[min(20rem,calc(100vw-2rem))] p-0">
          <ScrollArea className="max-h-[55dvh]">
            <LineNav
              className="gap-2 px-4 py-4 [&>a]:min-h-8 [&>a]:items-start [&>a]:gap-2 [&>a]:py-1 [&>a]:after:p-2 [&>a>span:last-child]:whitespace-normal [&>a>span:last-child]:leading-5 [&>span]:ml-0"
              ariaLabel="Article table of contents"
              scrollActiveIntoView={false}
              items={items.map((item) => ({ title: `${item.depth > 2 ? "　" : ""}${String(item.title)}`, href: item.url }))}
              activeHref={activeHeading ? `#${activeHeading}` : undefined}
              onItemClick={(item, event) => {
                handleLineNavClick(item, event)
                setMobileOpen(false)
              }}
            />
          </ScrollArea>
        </PopoverContent>
      </Popover>
    )
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
          <div className="relative flex max-h-[50dvh] flex-col gap-3 overflow-hidden py-3 pl-6 opacity-100 transition-opacity duration-200 data-popup-open:opacity-0">
            {items.map((item) => (
              <div
                key={item.url}
                role="link"
                tabIndex={0}
                aria-label={`Go to ${String(item.title)}`}
                title={typeof item.title === "string" ? item.title : undefined}
                data-depth={item.depth}
                data-active={item.url === `#${activeHeading}`}
                className={cn(
                  "group/tick flex h-3 w-10 shrink-0 cursor-pointer items-center",
                  "data-[depth=3]:ml-2 data-[depth=3]:w-4",
                  "data-[depth=4]:ml-4 data-[depth=4]:w-2",
                  "data-active:[&>span]:bg-foreground"
                )}
                onClick={() => scrollToHeading(item.url)}
                onMouseEnter={() => setHoveredHeading(item.url)}
                onMouseLeave={() => setHoveredHeading(null)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault()
                    scrollToHeading(item.url)
                  }
                }}
              >
                <motion.span
                  className="h-px rounded-full bg-ring/45 transition-colors group-hover/tick:bg-foreground"
                  initial={false}
                  animate={{ width: item.url === `#${activeHeading}` || item.url === hoveredHeading ? 26 : 12 }}
                  transition={{ type: "spring", stiffness: 360, damping: 28 }}
                />
              </div>
            ))}
            <AnimatePresence>
              {previewHeading ? (
                <motion.div
                  key={previewHeading.url}
                  initial={{ opacity: 0, x: 10, scale: 0.98 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 8, scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 360, damping: 30 }}
                  className="pointer-events-none absolute right-12 z-10 w-64 -translate-y-1/2 rounded-xl border bg-popover/95 p-3 text-popover-foreground shadow-lg backdrop-blur"
                  style={{ top: `${12 + items.indexOf(previewHeading) * 24}px` }}
                >
                  <p className="line-clamp-3 text-sm font-medium leading-5">{previewHeading.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Click to jump to this section</p>
                </motion.div>
              ) : null}
            </AnimatePresence>
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
              scrollActiveIntoView={false}
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
    let frame = 0
    const updateActiveHeading = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const targetLine = window.innerHeight * 0.28
        const headings = itemIds
          .map((id) => document.getElementById(id))
          .filter((element): element is HTMLElement => Boolean(element))
        const current = headings.filter((heading) => heading.getBoundingClientRect().top <= targetLine).at(-1)
        setActiveId(current?.id ?? headings[0]?.id ?? null)
      })
    }

    updateActiveHeading()
    window.addEventListener("scroll", updateActiveHeading, { passive: true })
    window.addEventListener("resize", updateActiveHeading)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("scroll", updateActiveHeading)
      window.removeEventListener("resize", updateActiveHeading)
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
