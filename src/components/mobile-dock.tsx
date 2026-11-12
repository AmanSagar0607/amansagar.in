"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { IconBrandGithub, IconBrandX } from "@tabler/icons-react"
import { ArrowUpRight, ChevronDown, Menu, X } from "lucide-react"
import { CommandMenu } from "@/components/command-menu"
import { ThemeToggle } from "@/components/theme/theme-toggle"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import type { NavigationItem } from "@/lib/admin/site-settings"

type ExternalLinks = { github: string; x: string; resume: string }

export function MobileDock({
  items,
  externalLinks,
}: {
  items: NavigationItem[]
  externalLinks: ExternalLinks
}) {
  const [open, setOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const [tablet, setTablet] = useState(false)
  const pathname = usePathname()
  const dockRef = useRef<HTMLDivElement | null>(null)
  const visibleItems = items.filter((item) => tablet ? item.tablet : item.mobile)
  const primaryItems = visibleItems.filter((item) => item.placement === "primary")
  const moreItems = visibleItems.filter((item) => item.placement === "more")

  useEffect(() => {
    const media = window.matchMedia("(min-width: 640px) and (max-width: 1279px)")
    const update = () => setTablet(media.matches)
    update()
    media.addEventListener("change", update)
    return () => media.removeEventListener("change", update)
  }, [])

  useEffect(() => {
    if (!open) setMoreOpen(false)
  }, [open])

  useEffect(() => {
    if (!open) return
    const handlePointerDown = (event: PointerEvent) => {
      if (!dockRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener("pointerdown", handlePointerDown)
    return () => document.removeEventListener("pointerdown", handlePointerDown)
  }, [open])

  return (
    <div
      ref={dockRef}
      className="pointer-events-none fixed inset-x-0 bottom-4 z-50 px-4 xl:hidden"
    >
      <div className="pointer-events-auto relative mx-auto w-[min(15.5rem,calc(100vw-2rem))]">
        {open && (
          <Collapsible
            open={moreOpen}
            onOpenChange={setMoreOpen}
            className="bg-background/95 border-border absolute bottom-[calc(100%+0.5rem)] left-1/2 z-50 flex w-full -translate-x-1/2 flex-col overflow-hidden rounded-2xl border p-1.5 shadow-lg backdrop-blur-md transition-[height] duration-300 ease-out"
            style={{
              height: `min(${(primaryItems.length + (moreOpen ? moreItems.length : 0)) * 44 + (moreItems.length ? 60 : 12)}px, 72dvh, calc(100dvh - 6rem))`,
            }}
          >
            <ScrollArea
              id="mobile-site-navigation"
              className="min-h-0 w-full flex-1"
            >
              <nav aria-label="Site navigation" className="w-full space-y-1">
              {primaryItems.map((item) => {
                const external = item.external === true || !item.href.startsWith("/")
                const route = item.href.split(/[?#]/, 1)[0]
                const active = !external && (pathname === route || (route !== "/" && pathname.startsWith(`${route}/`)))
                const className = cn(
                  "flex min-h-10 w-full items-center justify-between gap-3 overflow-hidden rounded-lg px-3 py-2 text-[13px] font-medium transition-colors",
                  active ? "text-foreground bg-accent" : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                )
                const content = (
                  <>
                    <span className="min-w-0 truncate">{item.label}</span>
                    {external && <ArrowUpRight className="size-3.5 shrink-0" aria-hidden="true" />}
                  </>
                )

                if (external) {
                  return (
                    <a key={item.id} href={item.href} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)} className={className}>
                      {content}
                    </a>
                  )
                }
                if (item.href.startsWith("/#")) {
                  return <a key={item.id} href={item.href} onClick={() => setOpen(false)} className={className}>{content}</a>
                }
                return <Link key={item.id} href={item.href} onClick={() => setOpen(false)} className={className}>{content}</Link>
              })}
                {moreItems.length > 0 && (
                  <CollapsibleContent className="overflow-hidden data-[state=open]:animate-[mobile-nav-down_220ms_ease-out] data-[state=closed]:animate-[mobile-nav-up_180ms_ease-in]">
                    <div className="space-y-1 pt-1">
                      {moreItems.map((item) => {
                        const external = item.external === true || !item.href.startsWith("/")
                        const route = item.href.split(/[?#]/, 1)[0]
                        const active = !external && (pathname === route || (route !== "/" && pathname.startsWith(`${route}/`)))
                        const className = cn(
                          "flex min-h-10 w-full items-center justify-between gap-3 overflow-hidden rounded-lg px-3 py-2 text-[13px] font-medium transition-colors",
                          active ? "text-foreground bg-accent" : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                        )
                        const content = <><span className="min-w-0 truncate">{item.label}</span>{external && <ArrowUpRight className="size-3.5 shrink-0" aria-hidden="true" />}</>
                        if (external) return <a key={item.id} href={item.href} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)} className={className}>{content}</a>
                        if (item.href.startsWith("/#")) return <a key={item.id} href={item.href} onClick={() => setOpen(false)} className={className}>{content}</a>
                        return <Link key={item.id} href={item.href} onClick={() => setOpen(false)} className={className}>{content}</Link>
                      })}
                    </div>
                  </CollapsibleContent>
                )}
              </nav>
            </ScrollArea>
            {moreItems.length > 0 && (
              <CollapsibleTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  className="mt-1 flex min-h-10 w-full shrink-0 justify-between rounded-lg border-t px-3 pt-2 text-[13px] font-medium text-muted-foreground hover:text-foreground"
                  aria-label={moreOpen ? "View fewer navigation links" : "View more navigation links"}
                >
                  <span>{moreOpen ? "View less" : "View more"}</span>
                  <ChevronDown className={cn("size-4 transition-transform duration-200", moreOpen && "rotate-180")} aria-hidden="true" />
                </Button>
              </CollapsibleTrigger>
            )}
          </Collapsible>
        )}

        <div className="bg-background/90 border-border flex w-full items-center justify-between gap-1 rounded-full border px-2 py-1.5 shadow-lg backdrop-blur-md">
          <a
            href={externalLinks.x}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors"
            aria-label="X (Twitter)"
          >
            <IconBrandX className="h-4 w-4" />
          </a>
          <a
            href={externalLinks.github}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors"
            aria-label="GitHub"
          >
            <IconBrandGithub className="h-4 w-4" />
          </a>
          <CommandMenu
            triggerClassName="text-muted-foreground hover:text-foreground flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors"
            hideLabel
            hideShortcut
            externalLinks={externalLinks}
          />
          <ThemeToggle className="text-muted-foreground hover:text-foreground flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-0 bg-transparent transition-colors focus-visible:ring-0" />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setOpen((value) => !value)}
            className={cn(
              "text-muted-foreground hover:text-foreground flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors",
              open && "bg-accent text-foreground",
            )}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-site-navigation"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  )
}
