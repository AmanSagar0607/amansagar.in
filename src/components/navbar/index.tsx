"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CommandMenu } from "@/components/command-menu";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { IconArrowUpRight, IconBrandGithub } from "@tabler/icons-react";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { NavigationItem } from "@/lib/admin/site-settings";

export const Navbar = ({
  items,
}: {
  items: NavigationItem[];
}) => {
  const pathname = usePathname();
  const isActive = (href: string) => {
    if (href.includes("#")) return false;
    const route = href.split(/[?#]/, 1)[0];
    return route === "/" ? pathname === "/" : pathname === route || pathname.startsWith(`${route}/`);
  };

  const scrollToAnchor = (href: string) => {
    const id = href.split("#")[1];
    if (!id) return false;

    const element = document.getElementById(id);
    if (!element) return false;

    element.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.replaceState(null, "", href);
    return true;
  };

  const renderItem = (item: NavigationItem, className: string) => {
    const active = isActive(item.href);
    if (item.href.startsWith("/#")) {
      return (
        <a
          key={item.id}
          href={item.href}
          className={className}
          aria-current={active ? "page" : undefined}
          onClick={(event) => {
            event.preventDefault();
            if (pathname === "/" && scrollToAnchor(item.href)) return;
            window.location.href = item.href;
          }}
        >
          {item.label}
        </a>
      );
    }
    const external = item.external === true || !item.href.startsWith("/");
    return (
      <Link
        key={item.id}
        href={item.href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        className={className}
        aria-current={active ? "page" : undefined}
      >
        {item.label}
        {external ? <IconArrowUpRight className="text-muted-foreground h-3.5 w-3.5" /> : null}
      </Link>
    );
  };

  const primaryItems = items.filter((item) => item.desktop && item.placement === "primary");
  const moreItems = items.filter((item) => item.desktop && item.placement === "more");

  return (
    <header className="site-header animate-slide-in slide-in-from-top-10 sticky top-0 z-50 hidden xl:block">
      <div className="site-header-shell">
        <nav className="site-nav" aria-label="Primary navigation">
          {primaryItems.map((item) => renderItem(item, cn("site-nav-link", isActive(item.href) ? "text-foreground" : "text-muted-foreground")))}

          {moreItems.length > 0 && <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                className="site-more-trigger"
                aria-label="More navigation options"
              >
                more
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              sideOffset={10}
              className="border-border bg-card min-w-44 rounded-2xl border p-2 shadow-sm"
            >
              {moreItems.map((item) => (
                <DropdownMenuItem
                  key={item.id}
                  asChild
                  className="rounded-xl px-3 py-2 text-sm"
                >
                  {renderItem(item, "text-foreground flex w-full items-center justify-between gap-3")}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>}
        </nav>

        <div className="site-header-actions" aria-label="Header actions">
          <CommandMenu triggerClassName="site-action-button site-search-button" />
          <Link
            href="https://github.com/AmanSagar0607/amansagar.in"
            target="_blank"
            rel="noreferrer"
            className="site-action-button site-github-button"
            aria-label="GitHub profile"
          >
            <IconBrandGithub className="size-4" aria-hidden />
          </Link>
          <ThemeToggle className="site-action-button site-theme-button" />
        </div>
      </div>
    </header>
  );
};
