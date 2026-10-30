"use client";

import { useState } from "react";
import Image from "next/image";
import { Clipboard, ImagePlus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { MediaAsset, MediaPage } from "@/lib/admin/media-service";

type MediaActions = {
  list: (cursor: string) => Promise<MediaPage>;
  upload: (file: File) => Promise<MediaAsset>;
};
/** Displays the authenticated provider's assets. Network operations are supplied by the protected route. */
export function MediaLibrary({
  initial,
  actions,
  onSelect,
  compact = false,
}: {
  initial: MediaPage;
  actions: MediaActions;
  onSelect?: (asset: MediaAsset) => void;
  compact?: boolean;
}) {
  const [assets, setAssets] = useState(initial.assets);
  const [cursor, setCursor] = useState(initial.nextCursor);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const filtered = assets.filter((asset) =>
    asset.publicId
      .toLocaleLowerCase()
      .includes(query.trim().toLocaleLowerCase()),
  );
  async function loadMore() {
    if (!cursor) return;
    setBusy(true);
    setError("");
    try {
      const page = await actions.list(cursor);
      setAssets((current) => [
        ...current,
        ...page.assets.filter(
          (asset) => !current.some((existing) => existing.id === asset.id),
        ),
      ]);
      setCursor(page.nextCursor);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not load more media.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function upload(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const asset = await actions.upload(file);
      setAssets((current) => [
        asset,
        ...current.filter((existing) => existing.id !== asset.id),
      ]);
      setMessage("Image uploaded.");
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not upload this image.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function copy(asset: MediaAsset) {
    setError("");
    setMessage("");
    try {
      await navigator.clipboard.writeText(asset.url);
      setMessage("Image URL copied.");
    } catch {
      setError(
        "Could not copy the image URL. You can open the image and copy its address.",
      );
    }
  }
  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          {compact ? (
            <h2 className="text-lg font-semibold">Media library</h2>
          ) : (
            <h1 className="text-2xl font-semibold">Media library</h1>
          )}
          <p className="text-muted-foreground mt-1 text-sm">
            Images from the portfolio media folder.
          </p>
        </div>
        <label className="bg-primary text-primary-foreground hover:bg-primary/90 focus-within:ring-ring inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-md px-4 text-sm font-medium focus-within:ring-2">
          <ImagePlus className="size-4" aria-hidden />
          Upload image
          <input
            className="sr-only"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
            disabled={busy}
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              void upload(file);
            }}
          />
        </label>
      </div>
      <p className="text-muted-foreground text-xs">
        Images uploaded here are publicly accessible. JPEG, PNG, WebP, GIF or
        AVIF; maximum 4 MB.
      </p>
      {error && (
        <p
          role="alert"
          className="rounded-md border border-red-500/50 px-4 py-3 text-sm text-red-500"
        >
          {error}
        </p>
      )}
      {message && (
        <p role="status" className="text-muted-foreground text-sm">
          {message}
        </p>
      )}
      <label className="relative block max-w-sm">
        <span className="sr-only">Search loaded media</span>
        <Search
          aria-hidden
          className="text-muted-foreground absolute top-3 left-3 size-4"
        />
        <input
          type="search"
          className="border-input bg-background focus-visible:ring-ring min-h-10 w-full rounded-md border py-2 pr-3 pl-10 text-sm focus-visible:ring-2 focus-visible:outline-none"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search loaded media"
        />
      </label>
      {filtered.length ? (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((asset) => (
            <li key={asset.id}>
              <Card className="h-full gap-0 overflow-hidden py-0">
                <div className="bg-muted relative aspect-video">
                  <Image
                    src={asset.url}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
                    className="object-cover"
                  />
                </div>
                <CardContent className="space-y-3 p-4">
                  <p
                    className="truncate text-sm font-medium"
                    title={asset.publicId}
                  >
                    {asset.publicId.split("/").at(-1)}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {asset.format.toUpperCase()} ·{" "}
                    {(asset.bytes / 1024).toFixed(0)} KB
                    {asset.width && asset.height
                      ? ` · ${asset.width} × ${asset.height}`
                      : ""}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => void copy(asset)}
                    >
                      <Clipboard />
                      Copy URL
                    </Button>
                    {onSelect && (
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => onSelect(asset)}
                      >
                        Select
                      </Button>
                    )}
                    <Button asChild size="sm" variant="ghost">
                      <a
                        href={asset.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View<span className="sr-only"> {asset.publicId}</span>
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted-foreground rounded-lg border border-dashed px-4 py-10 text-center text-sm">
          {query
            ? "No loaded media matches your search."
            : "No images in the portfolio media folder yet."}
        </p>
      )}
      {cursor && (
        <Button
          type="button"
          variant="outline"
          disabled={busy}
          onClick={() => void loadMore()}
        >
          {busy ? "Loading…" : "Load more"}
        </Button>
      )}
    </section>
  );
}
