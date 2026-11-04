"use client";

import { useEffect, useState } from "react";
import { FileText, Pencil, Search, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  deleteDocument,
  listDocuments,
  previewDocument,
  renameDocument,
  uploadDocument,
  type AdminDocument,
} from "@/lib/admin/client";

const maxBytes = 4 * 1024 * 1024;
export function DocumentLibrary() {
  const [documents, setDocuments] = useState<AdminDocument[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [renameTarget, setRenameTarget] = useState<AdminDocument | null>(null);
  const [renameName, setRenameName] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<AdminDocument | null>(null);
  useEffect(() => {
    void listDocuments()
      .then(setDocuments)
      .catch((cause: unknown) =>
        setError(
          cause instanceof Error ? cause.message : "Could not load documents.",
        ),
      )
      .finally(() => setLoaded(true));
  }, []);
  const filtered = documents.filter((document) =>
    document.originalFilename
      .toLocaleLowerCase()
      .includes(query.trim().toLocaleLowerCase()),
  );
  async function upload(file?: File) {
    if (!file) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const added = await uploadDocument(file);
      setDocuments((items) => [
        added,
        ...items.filter((item) => item.id !== added.id),
      ]);
      setMessage("Private PDF uploaded.");
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not upload this PDF.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function preview(document: AdminDocument) {
    const target = window.open("about:blank", "_blank");
    if (target) target.opener = null;
    setError("");
    try {
      const url = await previewDocument(document.id);
      if (target) target.location.href = url;
      else setError("Allow pop-ups to preview this private PDF.");
    } catch (cause) {
      target?.close();
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not create a preview link.",
      );
    }
  }
  async function rename() {
    if (!renameTarget) return;
    setBusy(true);
    setError("");
    try {
      await renameDocument(renameTarget.id, renameName);
      setDocuments((items) =>
        items.map((item) =>
          item.id === renameTarget.id
            ? { ...item, originalFilename: renameName.trim() }
            : item,
        ),
      );
      setRenameTarget(null);
      setMessage("PDF renamed.");
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not rename this PDF.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function remove() {
    if (!deleteTarget) return;
    setBusy(true);
    setError("");
    try {
      await deleteDocument(deleteTarget.id);
      setDocuments((items) =>
        items.filter((item) => item.id !== deleteTarget.id),
      );
      setDeleteTarget(null);
      setMessage("Private PDF deleted.");
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not delete this PDF.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Private documents</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            PDFs live in private storage. Preview links expire after 60 seconds.
          </p>
        </div>
        <label className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-md px-4 text-sm font-medium focus-within:ring-2">
          <Upload className="size-4" aria-hidden />
          Upload PDF
          <Input
            className="sr-only"
            type="file"
            accept="application/pdf,.pdf"
            disabled={busy}
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (file && file.size > maxBytes) {
                setError("Choose a PDF up to 4 MB.");
                return;
              }
              void upload(file);
            }}
          />
        </label>
      </div>
      <p className="text-muted-foreground text-xs">
        PDFs are validated by content signature and are never publicly listed.
        Maximum 4 MB.
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
        <span className="sr-only">Search PDF files</span>
        <Search
          className="text-muted-foreground absolute top-3 left-3 size-4"
          aria-hidden
        />
        <Input
          type="search"
          className="min-h-10 pl-10"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search PDFs…"
        />
      </label>
      {!loaded ? (
        <p
          role="status"
          className="text-muted-foreground py-8 text-center text-sm"
        >
          Loading documents…
        </p>
      ) : filtered.length ? (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((document) => (
            <li key={document.id}>
              <Card>
                <CardContent className="flex items-start gap-3 p-4">
                  <FileText
                    className="text-muted-foreground mt-1 size-5 shrink-0"
                    aria-hidden
                  />
                  <div className="min-w-0 flex-1">
                    <p
                      className="truncate font-medium"
                      title={document.originalFilename}
                    >
                      {document.originalFilename}
                    </p>
                    <p className="text-muted-foreground mt-1 text-xs">
                      PDF · {(document.byteSize / 1024).toFixed(0)} KB ·{" "}
                      {new Date(document.createdAt).toLocaleDateString()}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => void preview(document)}
                      >
                        Preview
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setRenameTarget(document);
                          setRenameName(document.originalFilename);
                        }}
                      >
                        <Pencil />
                        Rename
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={() => setDeleteTarget(document)}
                      >
                        <Trash2 />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted-foreground rounded-lg border border-dashed px-4 py-10 text-center text-sm">
          {query
            ? "No PDFs match your search."
            : "No private PDFs uploaded yet."}
        </p>
      )}
      <Dialog
        open={!!renameTarget}
        onOpenChange={(open) => {
          if (!open && !busy) setRenameTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename PDF</DialogTitle>
            <DialogDescription>
              This changes the private document filename; its storage key
              remains private and unchanged.
            </DialogDescription>
          </DialogHeader>
          <label className="text-sm font-medium">
            Filename
            <Input
              value={renameName}
              maxLength={255}
              onChange={(event) => setRenameName(event.target.value)}
            />
          </label>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={() => setRenameTarget(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={busy || !renameName.trim()}
              onClick={() => void rename()}
            >
              {busy ? "Saving…" : "Save name"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open && !busy) setDeleteTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this PDF?</DialogTitle>
            <DialogDescription>
              <strong>{deleteTarget?.originalFilename}</strong> will be
              permanently removed from private storage. Existing signed preview
              links will stop working.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={() => setDeleteTarget(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={busy}
              onClick={() => void remove()}
            >
              {busy ? "Deleting…" : "Delete PDF"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
