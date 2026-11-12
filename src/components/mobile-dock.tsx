"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { IconBrandGithub, IconBrandX } from "@tabler/icons-react"
import { ArrowUpRight, Menu, X } from "lucide-react"
import { CommandMenu } from "@/components/command-menu"
import { ThemeToggle } from "@/components/theme/theme-toggle"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
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
  const pathname = usePathname()
  const dockRef = useRef<HTMLDivElement | null>(null)
  const visibleItems = items.filter((item) => item.mobile || item.tablet)

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
          <ScrollArea
            id="mobile-site-navigation"
            className="bg-background/95 border-border absolute bottom-[calc(100%+0.5rem)] left-1/2 z-50 max-h-[65dvh] w-full -translate-x-1/2 rounded-2xl border p-1.5 shadow-lg backdrop-blur-md"
            style={{ height: `${Math.min(visibleItems.length * 40 + 16, 520)}px` }}
          >
            <nav aria-label="Site navigation" className="w-full space-y-1">
              {visibleItems.map((item) => {
                const external = item.external === true || !item.href.startsWith("/")
                const route = item.href.split(/[?#]/, 1)[0]
                const active = !external && (pathname === route || (route !== "/" && pathname.startsWith(`${route}/`)))
                const deviceClass = cn(!item.mobile && "nav-hide-mobile", !item.tablet && "nav-hide-tablet")
                const className = cn(
                  "flex min-h-10 w-full items-center justify-between gap-3 overflow-hidden rounded-lg px-3 py-2 text-[13px] font-medium transition-colors",
                  deviceClass,
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
            </nav>
          </ScrollArea>
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
