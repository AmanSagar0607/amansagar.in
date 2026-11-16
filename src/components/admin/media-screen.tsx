"use client";

import {
  deleteMedia,
  listMedia,
  renameMedia,
  uploadMedia,
} from "@/lib/admin/client";
import type { MediaPage } from "@/lib/admin/media-service";
import { MediaLibrary } from "./media-library";
import { DocumentLibrary } from "./document-library";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Files, Image as ImageIcon, LockKeyhole } from "lucide-react";

/** The initial page is loaded by an authenticated server route. */
export function MediaScreen({
  initial,
  references = {},
}: {
  initial: MediaPage;
  references?: Record<string, string[]>;
}) {
  return (
    <Tabs defaultValue="images" className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b pb-5">
        <div>
          <p className="text-muted-foreground mb-1 text-xs font-medium tracking-widest uppercase">
            Your workspace / Assets
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">
            Media library
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage your public images and private documents in one place.
          </p>
        </div>
        <div className="text-muted-foreground flex items-center gap-2 text-xs">
          <LockKeyhole className="size-4" aria-hidden />
          Private PDFs require admin access
        </div>
      </div>
      <TabsList
        aria-label="Media types"
        className="h-auto w-full justify-start gap-1 rounded-lg p-1 sm:w-fit"
      >
        <TabsTrigger value="images" className="gap-2 px-4 py-2">
          <ImageIcon className="size-4" aria-hidden />
          Public images
        </TabsTrigger>
        <TabsTrigger value="documents" className="gap-2 px-4 py-2">
          <Files className="size-4" aria-hidden />
          Private PDFs
        </TabsTrigger>
      </TabsList>
      <TabsContent value="images">
        <MediaLibrary
          initial={initial}
          references={references}
          actions={{
            list: (cursor) => listMedia(cursor),
            upload: uploadMedia,
            rename: renameMedia,
            delete: deleteMedia,
          }}
        />
      </TabsContent>
      <TabsContent value="documents">
        <DocumentLibrary />
      </TabsContent>
    </Tabs>
  );
}
