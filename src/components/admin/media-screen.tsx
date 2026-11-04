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

/** The initial page is loaded by an authenticated server route. */
export function MediaScreen({
  initial,
  references = {},
}: {
  initial: MediaPage;
  references?: Record<string, string[]>;
}) {
  return (
    <Tabs defaultValue="images">
      <TabsList aria-label="Media types">
        <TabsTrigger value="images">Public images</TabsTrigger>
        <TabsTrigger value="documents">Private PDFs</TabsTrigger>
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
