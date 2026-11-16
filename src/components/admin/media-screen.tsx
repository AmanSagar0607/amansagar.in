"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FileText,
  FolderOpen,
  Grid2X2,
  HardDrive,
  ImageIcon,
  LayoutDashboard,
  List,
  LockKeyhole,
  Search,
} from "lucide-react";
import {
  deleteMedia,
  listDocuments,
  listMedia,
  renameMedia,
  uploadMedia,
  type AdminDocument,
} from "@/lib/admin/client";
import type { MediaPage } from "@/lib/admin/media-service";
import { MediaLibrary } from "./media-library";
import { DocumentLibrary } from "./document-library";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type View = "overview" | "images" | "documents";
type RecentFile = {
  id: string;
  name: string;
  kind: "image" | "pdf";
  bytes: number;
  createdAt: string;
  url: string;
};

const navigation = [
  { id: "overview" as const, label: "Overview", icon: LayoutDashboard },
  { id: "images" as const, label: "Public images", icon: ImageIcon },
  { id: "documents" as const, label: "Private PDFs", icon: FileText },
];

function formatSize(bytes: number) {
  if (bytes === 0) return "0 B";
  return bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/** Dedicated workspace backed by the existing public image and private PDF stores. */
export function MediaScreen({
  initial,
  references = {},
}: {
  initial: MediaPage;
  references?: Record<string, string[]>;
}) {
  const [view, setView] = useState<View>("overview");
  const [collapsed, setCollapsed] = useState(false);
  const [images, setImages] = useState(initial);
  const [documents, setDocuments] = useState<AdminDocument[]>([]);
  const [documentsStatus, setDocumentsStatus] = useState<
    "loading" | "loaded" | "error"
  >("loading");
  const [refreshError, setRefreshError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [query, setQuery] = useState("");
  const [display, setDisplay] = useState<"list" | "grid">("list");
  const [sort, setSort] = useState<"recent" | "name" | "size">("recent");
  const [preview, setPreview] = useState<RecentFile | null>(null);

  useEffect(() => {
    if (view !== "overview") return;
    let active = true;
    void listDocuments()
      .then((items) => {
        if (active) {
          setDocuments(items);
          setDocumentsStatus("loaded");
        }
      })
      .catch(() => {
        if (active) {
          setDocuments([]);
          setDocumentsStatus("error");
        }
      });
    void listMedia()
      .then((page) => {
        if (active) setImages(page);
      })
      .catch(() => {
        if (active)
          setRefreshError(
            "Could not refresh public images. Showing the previous page.",
          );
      });
    return () => {
      active = false;
    };
  }, [view, reloadKey]);

  const recent = useMemo<RecentFile[]>(
    () => [
      ...images.assets.map((asset) => ({
        id: asset.id,
        name: asset.displayName || asset.publicId,
        kind: "image" as const,
        bytes: asset.bytes,
        createdAt: asset.createdAt,
        url: asset.url,
      })),
      ...documents.map((document) => ({
        id: document.id,
        name: document.originalFilename,
        kind: "pdf" as const,
        bytes: document.byteSize,
        createdAt: document.createdAt,
        url: `/api/admin/documents/${encodeURIComponent(document.id)}/preview`,
      })),
    ],
    [documents, images],
  );
  const filtered = recent
    .filter((file) =>
      file.name.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()),
    )
    .sort((a, b) =>
      sort === "name"
        ? a.name.localeCompare(b.name)
        : sort === "size"
          ? b.bytes - a.bytes
          : Date.parse(b.createdAt) - Date.parse(a.createdAt),
    );
  const loadedBytes = recent.reduce((sum, file) => sum + file.bytes, 0);
  const navButton = (item: (typeof navigation)[number]) => {
    const Icon = item.icon;
    return (
      <button
        key={item.id}
        type="button"
        aria-current={view === item.id ? "page" : undefined}
        title={collapsed ? item.label : undefined}
        onClick={() => {
          if (item.id === "overview" && view !== "overview")
            setDocumentsStatus("loading");
          setView(item.id);
          setRefreshError("");
        }}
        className={cn(
          "flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:outline-none active:scale-[0.98] motion-reduce:transition-none",
          view === item.id
            ? "bg-[#efedff] text-[#4b43e3]"
            : "text-[#666875] hover:bg-[#f2f1fc] hover:text-[#2a2562]",
          collapsed && "justify-center px-2",
        )}
      >
        <Icon className="size-[18px] shrink-0" aria-hidden />
        {!collapsed && item.label}
        <span className="sr-only">{collapsed ? item.label : ""}</span>
      </button>
    );
  };

  return (
    <div className="drive-workspace min-h-dvh bg-[#f7f8fb] text-[#13122a] lg:flex">
      <aside
        className={cn(
          "border-[#e8e8f0] bg-white transition-[width] motion-reduce:transition-none lg:sticky lg:top-0 lg:flex lg:h-dvh lg:shrink-0 lg:flex-col lg:border-r",
          collapsed ? "lg:w-[76px]" : "lg:w-[232px]",
        )}
      >
        <div className="flex h-[76px] items-center justify-between gap-2 border-b border-[#e8e8f0] px-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#4b43e3] text-white shadow-[0_4px_16px_rgba(75,67,227,0.22)]">
              <FolderOpen className="size-[18px]" />
            </span>
            {!collapsed && (
              <span className="truncate text-[15px] font-semibold tracking-tight">
                Aman Drive
              </span>
            )}
          </div>
          <button
            type="button"
            aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
            onClick={() => setCollapsed(!collapsed)}
            className="hidden rounded-lg p-2 text-[#666875] hover:bg-[#f2f1fc] hover:text-[#2a2562] lg:block"
          >
            {collapsed ? (
              <ChevronRight className="size-4" />
            ) : (
              <ChevronLeft className="size-4" />
            )}
          </button>
        </div>
        <nav
          aria-label="File manager navigation"
          className="flex gap-1 overflow-x-auto p-3 lg:block lg:space-y-1"
        >
          {!collapsed && (
            <p className="hidden px-3 pt-3 pb-2 text-[10px] font-semibold tracking-[0.16em] text-[#717381] uppercase lg:block">
              Workspace
            </p>
          )}
          {navigation.map(navButton)}
        </nav>
        <div className="hidden flex-1 lg:block" />
        <div className="border-t border-[#e8e8f0] p-3">
          <Link
            href="/admin"
            title="Back to Studio"
            className={cn(
              "flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm text-[#666875] hover:bg-[#f2f1fc] hover:text-[#2a2562]",
              collapsed && "justify-center px-2",
            )}
          >
            <ArrowLeft className="size-[18px] shrink-0" />
            {!collapsed && "Back to Studio"}
            <span className="sr-only">{collapsed ? "Back to Studio" : ""}</span>
          </Link>
        </div>
      </aside>

      <main className="min-w-0 flex-1 px-4 py-7 sm:px-8 lg:px-10 lg:py-9 xl:px-12">
        <div className="mx-auto max-w-[1440px]">
          <header className="mb-8 flex flex-wrap items-end justify-between gap-5 rounded-2xl border border-[#e8e8f0] bg-white px-5 py-6 sm:px-8 sm:py-8">
            <div>
              <p className="mb-2 text-xs font-medium tracking-[0.14em] text-[#5b50dc] uppercase">
                Your personal workspace
              </p>
              <h1 className="text-3xl leading-tight font-semibold tracking-tight text-[#13122a] sm:text-[34px]">
                {view === "overview"
                  ? "Your files, in one place."
                  : view === "images"
                    ? "Public images"
                    : "Private documents"}
              </h1>
              <p className="mt-2 text-sm leading-6 text-[#666875]">
                {view === "overview"
                  ? "A clear view of the assets you use and the documents you keep private."
                  : view === "images"
                    ? "Manage images used across your portfolio."
                    : "Manage and preview PDFs available only to you."}
              </p>
              {view === "overview" && (
                <div className="mt-5 flex flex-wrap gap-2">
                  <button type="button" onClick={() => setView("documents")} className="rounded-lg bg-[#4b43e3] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#3832b5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8177e9] focus-visible:ring-offset-2">Browse documents</button>
                  <button type="button" onClick={() => setView("images")} className="rounded-lg border border-[#e3e1f0] bg-white px-4 py-2.5 text-sm font-medium text-[#2a2562] transition-colors hover:bg-[#f4f2ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8177e9] focus-visible:ring-offset-2">Browse images</button>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 rounded-full border border-[#e9e6fb] bg-[#f4f2ff] px-3 py-2 text-xs text-[#383281]">
              <LockKeyhole className="size-3.5 text-[#5b50dc]" /> Admin
              workspace
            </div>
          </header>

          {view === "overview" && (
            <div className="space-y-8">
              <div className="rounded-xl border border-[#e7e3f8] bg-[#f5f3ff] px-4 py-3 text-sm text-[#52555f]">
                R2 Standard includes 10 GB-month free. Loaded file sizes below
                are not account-wide usage; Cloudflare may charge beyond its
                free allowance.{" "}
                <a
                  className="font-medium text-[#4b43e3] underline underline-offset-2"
                  href="https://dash.cloudflare.com/?to=/:account/r2/overview"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Check R2 usage
                </a>
                .
              </div>
              {(refreshError || documentsStatus === "error") && (
                <div
                  role="alert"
                  className="flex flex-wrap items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700"
                >
                  <span>
                    {refreshError}{" "}
                    {documentsStatus === "error" &&
                      "Could not load private PDFs."}
                  </span>
                  <button
                    type="button"
                    className="font-semibold underline"
                    onClick={() => {
                      setDocumentsStatus("loading");
                      setRefreshError("");
                      setReloadKey((key) => key + 1);
                    }}
                  >
                    Retry
                  </button>
                </div>
              )}
              <section aria-labelledby="workspace-heading">
                <div className="mb-4 flex items-end justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium text-[#717381]">
                      Your library
                    </p>
                    <h2
                      id="workspace-heading"
                      className="mt-1 text-lg font-semibold"
                    >
                      Workspace overview
                    </h2>
                  </div>
                  <span className="text-xs text-[#717381]">
                    Loaded files only
                  </span>
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  <button
                    type="button"
                    onClick={() => setView("images")}
                    className="group rounded-2xl border border-[#e8e8f0] bg-white p-5 text-left transition-colors hover:border-[#b1a4e1] hover:bg-[#fcfbff] focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:outline-none active:scale-[0.99] motion-reduce:transition-none"
                  >
                    <span className="mb-5 grid size-11 place-items-center rounded-xl bg-[#eeedff] text-[#5149cf]">
                      <ImageIcon className="size-5" />
                    </span>
                    <span className="block text-xs font-medium text-[#666875]">
                      Public images
                    </span>
                    <span className="mt-2 block text-2xl font-semibold tracking-tight tabular-nums">
                      {images.assets.length}
                      {images.nextCursor ? "+" : ""}
                    </span>
                    <span className="mt-1 block text-xs text-[#666875]">
                      Loaded · Cloudinary
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setView("documents")}
                    className="group rounded-2xl border border-[#e8e8f0] bg-white p-5 text-left transition-colors hover:border-[#b1a4e1] hover:bg-[#fcfbff] focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:outline-none active:scale-[0.99] motion-reduce:transition-none"
                  >
                    <span className="mb-5 grid size-11 place-items-center rounded-xl bg-violet-400/15 text-[#5b50dc]">
                      <FileText className="size-5" />
                    </span>
                    <span className="block text-xs font-medium text-[#666875]">
                      Private PDFs
                    </span>
                    <span className="mt-2 block text-2xl font-semibold tracking-tight tabular-nums">
                      {documentsStatus === "loaded"
                        ? `${documents.length}${documents.length === 100 ? "+" : ""}`
                        : documentsStatus === "loading"
                          ? "Loading…"
                          : "Unavailable"}
                    </span>
                    <span className="mt-1 block text-xs text-[#666875]">
                      Loaded · Cloudflare R2
                    </span>
                  </button>
                  <div className="rounded-2xl border border-[#e8e8f0] bg-white p-5">
                    <span className="mb-5 grid size-11 place-items-center rounded-xl bg-[#eaf5ff] text-[#2875ad]">
                      <HardDrive className="size-5" />
                    </span>
                    <span className="block text-xs font-medium text-[#666875]">
                      Loaded file size
                    </span>
                    <span className="mt-2 block text-2xl font-semibold tracking-tight tabular-nums">
                      {formatSize(loadedBytes)}
                    </span>
                    <span className="mt-1 block text-xs text-[#666875]">
                      not total storage usage
                    </span>
                  </div>
                </div>
              </section>
              <section
                aria-labelledby="recent-heading"
                className="rounded-2xl border border-[#e8e8f0] bg-white p-4 sm:p-6"
              >
                <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 id="recent-heading" className="text-lg font-semibold">
                      Loaded files
                    </h2>
                    <p className="mt-1 text-xs text-[#666875]">
                      Images and PDFs loaded from your libraries.
                    </p>
                  </div>
                  <label className="relative w-full sm:w-64">
                    <Search
                      className="absolute top-3 left-3 size-4 text-[#717381]"
                      aria-hidden
                    />
                    <span className="sr-only">Search loaded files</span>
                    <Input
                      type="search"
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Search loaded files"
                      className="h-10 border-[#e1e2ea] bg-[#f8f9fc] pl-9 text-sm"
                    />
                  </label>
                </div>
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <label className="flex items-center gap-2 text-xs text-[#666875]">
                    Sort by
                    <select
                      value={sort}
                      onChange={(event) =>
                        setSort(event.target.value as typeof sort)
                      }
                      className="h-9 rounded-lg border border-[#e1e2ea] bg-[#f8f9fc] px-3 text-sm text-[#13122a]"
                    >
                      <option value="recent">Newest first</option>
                      <option value="name">Name</option>
                      <option value="size">Largest first</option>
                    </select>
                  </label>
                  <div
                    role="group"
                    aria-label="Display layout"
                    className="flex rounded-lg border border-[#e1e2ea] p-1"
                  >
                    <button
                      type="button"
                      aria-label="List view"
                      aria-pressed={display === "list"}
                      onClick={() => setDisplay("list")}
                      className={cn(
                        "rounded-md p-2",
                        display === "list"
                          ? "bg-[#ece9ff] text-[#4b43e3]"
                          : "text-[#666875]",
                      )}
                    >
                      <List className="size-4" />
                    </button>
                    <button
                      type="button"
                      aria-label="Grid view"
                      aria-pressed={display === "grid"}
                      onClick={() => setDisplay("grid")}
                      className={cn(
                        "rounded-md p-2",
                        display === "grid"
                          ? "bg-[#ece9ff] text-[#4b43e3]"
                          : "text-[#666875]",
                      )}
                    >
                      <Grid2X2 className="size-4" />
                    </button>
                  </div>
                </div>
                {filtered.length ? (
                  <ul
                    className={
                      display === "grid"
                        ? "grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                        : "divide-y divide-[#efeff4]"
                    }
                  >
                    {filtered.map((file) => (
                      <li key={`${file.kind}-${file.id}`}>
                        <button
                          type="button"
                          onClick={() => setPreview(file)}
                          className={cn(
                            "w-full rounded-lg text-left hover:bg-[#f7f6ff] focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:outline-none",
                            display === "grid"
                              ? "flex h-full min-h-36 flex-col items-start gap-3 border border-[#ecebf2] p-4"
                              : "flex items-center gap-3 py-3",
                          )}
                        >
                          <span
                            className={cn(
                              "grid size-10 shrink-0 place-items-center rounded-lg",
                              file.kind === "pdf"
                                ? "bg-violet-400/15 text-[#5b50dc]"
                                : "bg-[#eeedff] text-[#5149cf]",
                            )}
                          >
                            {file.kind === "pdf" ? (
                              <FileText className="size-4" />
                            ) : (
                              <ImageIcon className="size-4" />
                            )}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium">
                              {file.name}
                            </span>
                            <span className="mt-0.5 block text-xs text-[#666875]">
                              {file.kind === "pdf"
                                ? "Private PDF"
                                : "Public image"}{" "}
                              · {new Date(file.createdAt).toLocaleDateString()}
                            </span>
                          </span>
                          <span className="shrink-0 text-xs text-[#666875] tabular-nums">
                            {formatSize(file.bytes)}
                          </span>
                          {display === "list" && (
                            <ChevronRight className="size-4 shrink-0 text-[#717381]" />
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p
                    role={documentsStatus === "loading" ? "status" : undefined}
                    className="py-10 text-center text-sm text-[#666875]"
                  >
                    {documentsStatus === "loading"
                      ? "Loading private PDFs…"
                      : query
                        ? "No loaded files match your search."
                        : documentsStatus === "error"
                          ? "Private PDFs are unavailable. Retry to load them."
                          : "No files loaded yet. Upload an image or PDF to get started."}
                  </p>
                )}
              </section>
            </div>
          )}
          {view === "images" && (
            <MediaLibrary
              initial={images}
              references={references}
              actions={{
                list: (cursor) => listMedia(cursor),
                upload: uploadMedia,
                rename: renameMedia,
                delete: deleteMedia,
              }}
            />
          )}
          {view === "documents" && <DocumentLibrary />}
        </div>
      </main>
      <Dialog
        open={!!preview}
        onOpenChange={(open) => {
          if (!open) setPreview(null);
        }}
      >
        <DialogContent className="flex max-h-[92dvh] w-[calc(100%-2rem)] flex-col overflow-hidden rounded-2xl sm:max-w-5xl">
          <DialogHeader className="pr-8">
            <DialogTitle className="truncate">{preview?.name}</DialogTitle>
            <DialogDescription>
              {preview?.kind === "pdf"
                ? "Private PDF · Admin access required."
                : "Public image"}{" "}
              · {preview && formatSize(preview.bytes)}
            </DialogDescription>
          </DialogHeader>
          {preview &&
            (preview.kind === "pdf" ? (
              <iframe
                title={`Preview: ${preview.name}`}
                src={preview.url}
                className="bg-muted h-[60dvh] w-full rounded-lg border"
              />
            ) : (
              <div className="bg-muted relative h-[60dvh] overflow-hidden rounded-lg">
                <Image
                  src={preview.url}
                  alt={preview.name}
                  fill
                  sizes="(max-width: 768px) 90vw, 900px"
                  className="object-contain"
                />
              </div>
            ))}
          {preview && (
            <div>
              <Button variant="outline" asChild>
                <a href={preview.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink /> Open in new tab
                </a>
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
