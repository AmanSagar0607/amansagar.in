"use client";

import { listMedia, uploadMedia } from "@/lib/admin/client";
import type { MediaPage } from "@/lib/admin/media-service";
import { MediaLibrary } from "./media-library";

/** The initial page is loaded by an authenticated server route. */
export function MediaScreen({ initial }: { initial: MediaPage }) {
  return (
    <MediaLibrary
      initial={initial}
      actions={{ list: (cursor) => listMedia(cursor), upload: uploadMedia }}
    />
  );
}
