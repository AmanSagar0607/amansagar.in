"use client"

import { memo, useEffect, useRef } from "react"
import { motion } from "motion/react"
import { ChevronDown, ChevronUp } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const lineVariants = {
  normal: { width: 24 },
  active: { width: 40 },
  hover: { width: 40 },
}

export type LineNavItem = {
  title: string
  href: string
  depth?: number
}

export type LineNavProps = {
  className?: string
  /** @fumadocsHref #linenavitem */
  items: LineNavItem[]
  /** Href of the active item. */
  activeHref?: string
  /** Scroll the active item into view on mount. */
  scrollActiveIntoView?: boolean
  ariaLabel?: string
  showSeparators?: boolean
  expandedHrefs?: ReadonlySet<string>
  onToggleTitle?: (href: string) => void
  /** Called when an item is clicked. */
  onItemClick?: (
    item: LineNavItem,
    event: React.MouseEvent<HTMLAnchorElement>
  ) => void
}

export function LineNav({
  className,
  items,
  activeHref,
  scrollActiveIntoView = true,
  ariaLabel = "Article sections",
  showSeparators = true,
  expandedHrefs,
  onToggleTitle,
  onItemClick,
}: LineNavProps) {
  const activeItemRef = useRef<HTMLAnchorElement | null>(null)

  useEffect(() => {
    if (scrollActiveIntoView) {
      activeItemRef.current?.scrollIntoView({ block: "center" })
    }
  }, [scrollActiveIntoView])

  return (
    <nav
      aria-label={ariaLabel}
      className={cn("flex flex-col gap-2 py-5.25", className)}
    >
      {items.map((item, index) => {
        const isActive = item.href === activeHref

        return (
          <LineNavItem
            key={item.href}
            ref={isActive ? activeItemRef : undefined}
            title={item.title}
            href={item.href}
            depth={item.depth}
            active={isActive}
            isLast={index === items.length - 1}
            showSeparator={showSeparators}
            expanded={expandedHrefs?.has(item.href) ?? false}
            onToggleTitle={onToggleTitle ? () => onToggleTitle(item.href) : undefined}
            onClick={
              onItemClick ? (event) => onItemClick(item, event) : undefined
            }
          />
        )
      })}
    </nav>
  )
}

const LineNavItem = memo(function LineNavItem({
  ref,
  title,
  href,
  depth,
  active = false,
  isLast = false,
  showSeparator = true,
  expanded = false,
  onToggleTitle,
  onClick,
}: {
  ref?: React.Ref<HTMLAnchorElement>
  title: string
  href: string
  depth?: number
  active?: boolean
  isLast?: boolean
  showSeparator?: boolean
  expanded?: boolean
  onToggleTitle?: () => void
  onClick?: React.MouseEventHandler<HTMLAnchorElement>
}) {
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-x-1">
      {/*
        Rendered as a plain anchor to stay framework-agnostic. For client-side
        navigation in Next.js, swap `motion.a` for `motion.create(Link)`
        (import Link from "next/link").
      */}
      <motion.a
        ref={ref}
        aria-current={active ? "location" : undefined}
        data-depth={depth}
        className="group relative flex min-h-8 min-w-0 flex-1 items-center gap-2 py-1 after:absolute after:top-1/2 after:left-0 after:size-full after:-translate-y-1/2 after:p-3.5 data-[depth=3]:pl-2 data-[depth=4]:pl-4"
        href={href}
        initial={false}
        animate={active ? "active" : "normal"}
        whileHover="hover"
        onClick={onClick}
      >
        <motion.span
          className="block h-px shrink-0 bg-foreground/20 transition-[background-color] ease-out group-hover:bg-foreground group-aria-[current=location]:bg-foreground"
          variants={lineVariants}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        />
        <span className={cn("block min-w-0 flex-1 text-sm text-muted-foreground transition-[color] ease-out group-hover:text-foreground group-aria-[current=location]:text-foreground", !expanded && "truncate", expanded && "whitespace-normal break-words")}>
          {title}
        </span>
      </motion.a>

      {onToggleTitle && title.trim().length > 44 ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="relative z-10 size-7 shrink-0 rounded-full text-muted-foreground hover:text-foreground"
          aria-label={expanded ? `Collapse section title: ${title}` : `Expand section title: ${title}`}
          aria-expanded={expanded}
          onClick={onToggleTitle}
        >
          {expanded ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
        </Button>
      ) : null}

      {!isLast && showSeparator && (
        <>
          <span className="block h-px w-6 basis-full bg-foreground/10" />
        </>
      )}
    </div>
  )
})
