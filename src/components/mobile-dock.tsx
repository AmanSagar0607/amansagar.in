"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { IconBrandGithub, IconBrandX } from "@tabler/icons-react"
import { Menu, X } from "lucide-react"
import { CommandMenu } from "@/components/command-menu"
import { ThemeToggle } from "@/components/theme/theme-toggle"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { NavigationItem } from "@/lib/admin/site-settings"

export function MobileDock({ items }: { items: NavigationItem[] }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const dockRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) {
      return
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!dockRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener("pointerdown", handlePointerDown)
    return () => document.removeEventListener("pointerdown", handlePointerDown)
  }, [open])

  return (
    <div
      ref={dockRef}
      className="fixed inset-x-0 bottom-4 z-50 flex justify-center px-4 [--mobile-dock-width:15.5rem] xl:hidden"
    >
      <div className="bg-background/90 border-border flex w-[var(--mobile-dock-width)] items-center justify-between gap-1 rounded-full border px-2 py-1.5 shadow-lg backdrop-blur-md">
        <Link
          href="/social/x"
          target="_blank"
          className="text-muted-foreground hover:text-foreground flex h-9 w-9 items-center justify-center rounded-full transition-colors"
          aria-label="X (Twitter)"
        >
          <IconBrandX className="h-4 w-4" />
        </Link>

        <Link
          href="/social/github"
          target="_blank"
          className="text-muted-foreground hover:text-foreground flex h-9 w-9 items-center justify-center rounded-full transition-colors"
          aria-label="GitHub"
        >
          <IconBrandGithub className="h-4 w-4" />
        </Link>

        <CommandMenu
          triggerClassName="text-muted-foreground hover:text-foreground flex h-9 w-9 items-center justify-center rounded-full transition-colors"
          hideLabel
          hideShortcut
        />

        <ThemeToggle className="text-muted-foreground hover:text-foreground flex h-9 w-9 items-center justify-center rounded-full border-0 bg-transparent transition-colors focus-visible:ring-0" />

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setOpen(!open)}
          className={cn(
            "text-muted-foreground hover:text-foreground flex h-9 w-9 items-center justify-center rounded-full transition-colors",
            open && "bg-accent text-foreground",
          )}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {open && (
        <ScrollArea className="bg-background/95 border-border absolute bottom-full left-1/2 mb-2 max-h-[65dvh] w-[var(--mobile-dock-width)] -translate-x-1/2 rounded-2xl border p-1.5 shadow-lg backdrop-blur-md">
          <nav aria-label="Site navigation" className="space-y-1">
          {items.filter((item) => item.mobile || item.tablet).map((item) => {
            const external = item.external === true || !item.href.startsWith("/")
            const isActive = !external && (pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}/`)))
            const deviceClass = cn(!item.mobile && "nav-hide-mobile", !item.tablet && "nav-hide-tablet")
            const classes = cn(
              "block rounded-lg px-3 py-2 text-[13px] font-medium transition-colors",
              deviceClass,
              isActive
                ? "text-foreground bg-accent"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
            )
            const content = <>{item.label}{external ? <span aria-hidden="true" className="float-right">↗</span> : null}</>
            if (item.href.startsWith("/#")) return (
              <a key={item.id} href={item.href} onClick={() => setOpen(false)} className={classes}>{content}</a>
            )
            return (
              <Link
                key={item.id}
                href={item.href}
                target={external ? "_blank" : undefined}
                rel={external ? "noopener noreferrer" : undefined}
                onClick={() => setOpen(false)}
                className={classes}
              >
                {content}
              </Link>
            )
          })}
          </nav>
        </ScrollArea>
      )}
    </div>
  )
}
