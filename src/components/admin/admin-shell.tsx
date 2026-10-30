"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Award,
  BookOpen,
  CalendarCheck,
  ChevronRight,
  FileText,
  FolderKanban,
  Image,
  LayoutDashboard,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const groups = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", href: "/admin", icon: LayoutDashboard }],
  },
  {
    label: "Content management",
    items: [
      { label: "Blog posts", href: "/admin/posts", icon: FileText },
      { label: "Projects", href: "/admin/projects", icon: FolderKanban },
      { label: "Journey", href: "/admin/activities", icon: BookOpen },
      { label: "Learning tracks", href: "/admin/tracks", icon: BookOpen },
      {
        label: "Daily challenges",
        href: "/admin/challenges",
        icon: CalendarCheck,
      },
      { label: "Achievements", href: "/admin/achievements", icon: Award },
      { label: "Media library", href: "/admin/media", icon: Image },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Settings", href: "/admin/settings", icon: Settings },
      { label: "Profile", href: "/admin/profile", icon: UserRound },
    ],
  },
];
const allItems = groups.flatMap((group) => group.items);

function Navigation({
  collapsed,
  onNavigate,
}: {
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin navigation" className="space-y-6 p-3">
      {groups.map((group) => (
        <div key={group.label}>
          {!collapsed && (
            <h2 className="text-muted-foreground px-3 pb-2 text-xs font-medium">
              {group.label}
            </h2>
          )}
          <ul className="space-y-1">
            {group.items.map((item) => {
              const active =
                item.href === "/admin"
                  ? pathname === item.href
                  : pathname === item.href ||
                    pathname.startsWith(item.href + "/");
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    title={collapsed ? item.label : undefined}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "focus-visible:ring-ring flex min-h-10 items-center gap-3 rounded-md px-3 text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none",
                      active
                        ? "bg-accent text-foreground font-medium"
                        : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                      collapsed && "justify-center px-0",
                    )}
                  >
                    <Icon aria-hidden className="size-4 shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                    {collapsed && <span className="sr-only">{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

/** The server must authenticate before rendering this shell and its children. */
export function AdminShell({
  children,
  email,
  signOut,
}: {
  children: React.ReactNode;
  email: string;
  signOut: () => Promise<void>;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const current =
    allItems.find((item) => item.href === pathname) ||
    allItems.find(
      (item) => item.href !== "/admin" && pathname.startsWith(item.href + "/"),
    );
  return (
    <div className="bg-background text-foreground min-h-screen md:flex">
      <aside
        className={cn(
          "border-border hidden min-h-screen shrink-0 border-r transition-[width] md:block",
          collapsed ? "w-16" : "w-60",
        )}
      >
        <div
          className={cn(
            "border-border flex h-16 items-center border-b px-4",
            collapsed && "justify-center px-0",
          )}
        >
          <Link href="/admin" className="font-semibold">
            {collapsed ? "A" : "Aman Sagar"}
          </Link>
        </div>
        <Navigation collapsed={collapsed} />
      </aside>
      <div className="min-w-0 flex-1">
        <header className="bg-background border-border sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b px-4 md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:inline-flex"
              onClick={() => setCollapsed(!collapsed)}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-expanded={!collapsed}
            >
              {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
            </Button>
            <Dialog open={mobileOpen} onOpenChange={setMobileOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  aria-label="Open admin navigation"
                >
                  <Menu />
                </Button>
              </DialogTrigger>
              <DialogContent className="fixed inset-y-0 top-0 left-0 h-dvh w-72 max-w-[85vw] translate-x-0 translate-y-0 overflow-y-auto rounded-none p-0">
                <DialogTitle className="px-6 pt-6">
                  Admin navigation
                </DialogTitle>
                <DialogDescription className="sr-only">
                  Navigate between content management pages.
                </DialogDescription>
                <Navigation onNavigate={() => setMobileOpen(false)} />
              </DialogContent>
            </Dialog>
            <nav
              aria-label="Breadcrumb"
              className="text-muted-foreground flex min-w-0 items-center gap-2 text-sm"
            >
              <Link href="/admin" className="hover:text-foreground">
                Admin
              </Link>
              {current && current.href !== "/admin" && (
                <>
                  <ChevronRight aria-hidden className="size-3" />
                  <span className="text-foreground truncate">
                    {current.label}
                  </span>
                </>
              )}
            </nav>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="max-w-48"
                aria-label="Account menu"
              >
                <UserRound />
                <span className="hidden truncate sm:inline">{email}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel className="max-w-64 truncate">
                {email}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/admin/profile">
                  <UserRound />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <form action={signOut}>
                  <button
                    className="flex w-full items-center gap-2 text-left"
                    type="submit"
                  >
                    <LogOut className="size-4" />
                    Sign out
                  </button>
                </form>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main
          id="admin-main"
          className="mx-auto w-full max-w-screen-2xl p-4 md:p-6"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
