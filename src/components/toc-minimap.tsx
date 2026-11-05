"use client"

import { useEffect, useMemo, useState } from "react"
import { usePathname } from "next/navigation"
import { motion } from "motion/react"
import { Bookmark, BookmarkCheck, ListTree } from "lucide-react"

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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

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
  const pathname = usePathname()
  const [hoveredHeading, setHoveredHeading] = useState<string | null>(null)
  const [bookmarkedHeading, setBookmarkedHeading] = useState<string | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [expandedTitles, setExpandedTitles] = useState<Set<string>>(() => new Set())
  const toggleTitle = (href: string) => {
    setExpandedTitles((current) => {
      const next = new Set(current)
      if (next.has(href)) next.delete(href)
      else next.add(href)
      return next
    })
  }

  const [play] = useSound(uMiniMapOpenSound, { volume: 0.3 })

  useEffect(() => {
    const storageKey = `article-bookmark:${pathname}`
    let saved: string | null = null
    try {
      saved = window.localStorage.getItem(storageKey)
    } catch {
      // Storage may be unavailable in private or restricted browser contexts.
    }
    if (!saved || !itemIds.includes(saved)) {
      setBookmarkedHeading(null)
      return
    }
    setBookmarkedHeading(saved)
    const timer = window.setTimeout(() => {
      const target = document.getElementById(saved)
      if (!target) return
      history.replaceState(null, "", `${pathname}#${saved}`)
      target.scrollIntoView({ behavior: "auto", block: "start" })
    }, 120)
    return () => window.clearTimeout(timer)
  }, [itemIds, pathname])

  const toggleBookmark = () => {
    if (!activeHeading) return
    const next = bookmarkedHeading === activeHeading ? null : activeHeading
    setBookmarkedHeading(next)
    try {
      const storageKey = `article-bookmark:${pathname}`
      if (next) window.localStorage.setItem(storageKey, next)
      else window.localStorage.removeItem(storageKey)
    } catch {
      // Keep this session's bookmark state even if persistent storage is blocked.
    }
  }

  const bookmarkControl = activeHeading ? (
    <div className="flex items-center justify-between gap-2 border-b px-3 py-2">
      <span className="min-w-0 truncate text-xs text-muted-foreground">
        {bookmarkedHeading === activeHeading ? "Bookmarked on this device" : "Save your place on this device"}
      </span>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 shrink-0"
            aria-label={bookmarkedHeading === activeHeading ? "Remove bookmark" : "Bookmark current section"}
            onClick={toggleBookmark}
          >
            {bookmarkedHeading === activeHeading ? <BookmarkCheck className="size-4" /> : <Bookmark className="size-4" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          {bookmarkedHeading === activeHeading
            ? "Remove this bookmark. Your saved place stays in this browser."
            : "Bookmark this section. This browser will return here when you revisit."}
        </TooltipContent>
      </Tooltip>
    </div>
  ) : null

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
          {bookmarkControl}
          <ScrollArea
            className="max-h-[55dvh] w-full min-w-0"
            style={{ height: `${Math.min(items.length * 40 + 24, 512)}px` }}
          >
            <LineNav
              className="gap-1 px-3 py-3"
              ariaLabel="Article table of contents"
              scrollActiveIntoView={false}
              showSeparators={false}
              expandedHrefs={expandedTitles}
              onToggleTitle={toggleTitle}
              items={items.map((item) => ({ title: String(item.title), href: item.url, depth: item.depth }))}
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
    <div className={cn("w-18 min-w-0", className)}>
      <HoverCard
        openDelay={0}
        closeDelay={0}
        onOpenChange={(open) => {
          if (open) play()
        }}
      >
        <HoverCardTrigger asChild>
          <div className="flex max-h-[70dvh] flex-col gap-[2px] overflow-hidden py-3 pl-6 opacity-100 transition-opacity duration-200 data-popup-open:opacity-0">
            {items.map((item) => (
              <a
                key={item.url}
                aria-label={`Go to ${String(item.title)}`}
                title={typeof item.title === "string" ? item.title : undefined}
                data-depth={item.depth}
                data-active={item.url === `#${activeHeading}`}
                className={cn(
                  "group/tick relative flex h-3 w-8 shrink-0 items-center after:absolute after:-inset-y-1 after:-left-2 after:right-0 after:content-['']",
                  "data-[depth=3]:ml-2 data-[depth=3]:w-3",
                  "data-[depth=4]:ml-4 data-[depth=4]:w-2",
                  "data-active:[&>span]:bg-foreground"
                )}
                href={item.url}
                onClick={(event) => {
                  event.preventDefault()
                  scrollToHeading(item.url)
                }}
                onMouseEnter={() => setHoveredHeading(item.url)}
                onMouseLeave={() => setHoveredHeading(null)}
                onFocus={() => setHoveredHeading(item.url)}
                onBlur={() => setHoveredHeading(null)}
              >
                <motion.span
                  className="h-px rounded-full bg-foreground/35 transition-colors group-hover/tick:bg-foreground group-focus-visible/tick:bg-foreground"
                  initial={false}
                  animate={{ width: item.url === `#${activeHeading}` || item.url === hoveredHeading ? 20 : 12 }}
                  transition={{ type: "spring", stiffness: 360, damping: 28 }}
                />
              </a>
            ))}
          </div>
        </HoverCardTrigger>

        <HoverCardContent
          className="w-[min(20rem,calc(100vw-2rem))] min-w-0 overflow-hidden p-0 duration-200 data-[side=left]:slide-in-from-right-3 data-[side=left]:slide-out-to-right-3 data-open:zoom-in-100 data-closed:zoom-out-100"
          align="start"
          alignOffset={0}
          side="left"
          sideOffset={-60}
        >
          {bookmarkControl}
          <ScrollArea
            className="toc-scrollbar max-h-[55dvh] w-full min-w-0 overscroll-contain"
            style={{ height: `${Math.min(items.length * 40 + 24, 512)}px` }}
          >
            <LineNav
              className="gap-1 px-3 py-3"
              ariaLabel="Article table of contents"
              scrollActiveIntoView={false}
              showSeparators={false}
              expandedHrefs={expandedTitles}
              onToggleTitle={toggleTitle}
              items={items.map((item) => ({ title: String(item.title), href: item.url, depth: item.depth }))}
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
