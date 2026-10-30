"use client";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { listMedia, uploadMedia } from "@/lib/admin/client";
import type { MediaPage } from "@/lib/admin/media-service";
import { MediaLibrary } from "./media-library";

export function MediaPicker({ onSelect }: { onSelect: (url: string) => void }) {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState<MediaPage | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const requestId = useRef(0);
  async function load() {
    const id = ++requestId.current;
    setLoading(true);
    setError("");
    try {
      const result = await listMedia();
      if (requestId.current === id) setPage(result);
    } catch (cause) {
      if (requestId.current === id)
        setError(
          cause instanceof Error ? cause.message : "Could not load media.",
        );
    } finally {
      if (requestId.current === id) setLoading(false);
    }
  }
  function toggle(value: boolean) {
    setOpen(value);
    if (value) {
      setPage(null);
      void load();
    } else {
      requestId.current++;
      setLoading(false);
    }
  }
  return (
    <Dialog open={open} onOpenChange={toggle}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          Choose image
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-5xl">
        <DialogTitle>Choose an image</DialogTitle>
        <DialogDescription>
          Select an existing image or upload a new one.
        </DialogDescription>
        {loading && (
          <p role="status" className="text-muted-foreground py-8 text-sm">
            Loading media…
          </p>
        )}
        {error && (
          <div className="space-y-3">
            <p role="alert" className="text-sm text-red-500">
              {error}
            </p>
            <Button type="button" variant="outline" onClick={() => void load()}>
              Try again
            </Button>
          </div>
        )}
        {page && !loading && !error && (
          <MediaLibrary
            compact
            initial={page}
            actions={{
              list: (cursor) => listMedia(cursor),
              upload: uploadMedia,
            }}
            onSelect={(asset) => {
              onSelect(asset.url);
              toggle(false);
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
