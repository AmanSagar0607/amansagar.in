"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input as FormInput } from "@/components/ui/input";
import { FormSelect } from "@/components/ui/select";
import { Textarea as FormTextarea } from "@/components/ui/textarea";
import { ActivityMarkdown } from "@/components/journey/activity-markdown";
import type { ManagedPage } from "@/lib/admin/content-types";
import { MediaPicker } from "./media-picker";

const RichPostEditor = dynamic(() => import("./rich-post-editor"), {
  ssr: false,
  loading: () => <p role="status" className="text-muted-foreground p-6 text-sm">Loading page editor…</p>,
});

const fieldClass = "mt-1 min-h-10 w-full";
function slugFromTitle(value: string) {
  return value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 120);
}

export function PageEditor({
  initial,
  onSave,
  identifierLocked = false,
}: {
  initial: ManagedPage;
  onSave: (page: ManagedPage) => Promise<void>;
  identifierLocked?: boolean;
}) {
  const [page, setPage] = useState(initial);
  const [preview, setPreview] = useState(false);
  const [slugEdited, setSlugEdited] = useState(Boolean(initial.slug));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  function change<K extends keyof ManagedPage>(key: K, value: ManagedPage[K]) {
    setPage((current) => ({ ...current, [key]: value }));
    setSaved(false);
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(page.slug)) {
      setError("Use a lowercase URL slug with letters, numbers and hyphens.");
      return;
    }
    if (page.status === "published" && !page.content.trim()) {
      setError("Add page content before publishing.");
      return;
    }
    setSaving(true);
    try {
      await onSave({ ...page, updatedAt: new Date().toISOString() });
      setSaved(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save this page.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{initial.title ? "Edit page" : "New page"}</h1>
          <p className="text-muted-foreground mt-1 text-sm">Create a page with rich text, images, links and SEO settings.</p>
          {initial.version && <p className="text-muted-foreground mt-2 text-xs">Version {initial.version} · Last edited {new Date(initial.updatedAt).toLocaleString()}</p>}
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" aria-pressed={preview} onClick={() => setPreview((value) => !value)}>{preview ? "Edit" : "Preview"}</Button>
          <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save page"}</Button>
        </div>
      </div>

      {error && <p role="alert" className="rounded-md border border-destructive/40 px-4 py-3 text-sm text-destructive">{error}</p>}
      {saved && <p role="status" className="text-muted-foreground text-sm">Page saved.</p>}

      <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-5">
          <Card><CardContent className="space-y-4">
            <label className="block text-sm font-medium">Page title
              <FormInput required maxLength={200} className={fieldClass} value={page.title} onChange={(event) => {
                const title = event.target.value;
                setPage((current) => ({ ...current, title, ...(!slugEdited && !identifierLocked ? { slug: slugFromTitle(title) } : {}) }));
                setSaved(false);
              }} />
            </label>
            <label className="block text-sm font-medium">URL slug
              <span className="text-muted-foreground mt-1 block text-xs font-normal">Your page will be available at /{page.slug || "your-page"}.</span>
              <FormInput required maxLength={120} pattern="[a-z0-9]+(-[a-z0-9]+)*" className={fieldClass} value={page.slug} disabled={identifierLocked} onChange={(event) => { setSlugEdited(true); change("slug", slugFromTitle(event.target.value)); }} />
            </label>
            <label className="block text-sm font-medium">Short description
              <FormTextarea maxLength={1000} rows={3} className="mt-1 w-full" value={page.description} onChange={(event) => change("description", event.target.value)} />
            </label>
          </CardContent></Card>

          <section className="min-w-0 space-y-2" aria-labelledby="page-body-heading">
            <h2 id="page-body-heading" className="text-sm font-medium">Page content</h2>
            {preview ? <div className="article-content min-h-80 rounded-lg border p-5"><h1>{page.title || "Untitled page"}</h1><ActivityMarkdown content={page.content} /></div> : <RichPostEditor value={page.content} onChange={(content) => change("content", content)} />}
          </section>
        </div>

        <aside className="min-w-0 space-y-5" aria-label="Page publishing and search settings">
          <Card><CardContent className="space-y-4">
            <h2 className="font-medium">Publishing</h2>
            <label className="block text-sm font-medium">Status
              <FormSelect className={fieldClass} value={page.status} onChange={(event) => change("status", event.target.value as ManagedPage["status"])}>
                <option value="draft">Draft</option><option value="published">Published</option>
              </FormSelect>
            </label>
            <label className="block text-sm font-medium">Visibility
              <FormSelect className={fieldClass} value={page.visibility} onChange={(event) => change("visibility", event.target.value as ManagedPage["visibility"])}>
                <option value="private">Hidden from visitors</option><option value="public">Visible to visitors</option>
              </FormSelect>
            </label>
            <p className="text-muted-foreground text-xs">Hidden pages are removed from public navigation and search listings, and their URL returns not found. Admin access remains available.</p>
            <label className="flex min-h-11 items-center gap-2 text-sm">
              <Checkbox checked={page.showInNavigation === true} onCheckedChange={(checked) => change("showInNavigation", checked === true)} />
              Show in More navigation
            </label>
            <label className="block text-sm font-medium">Navigation label
              <FormInput maxLength={80} className={fieldClass} value={page.navigationTitle ?? ""} placeholder={page.title || "Use page title"} onChange={(event) => change("navigationTitle", event.target.value)} />
            </label>
          </CardContent></Card>

          <Card><CardContent className="space-y-4">
            <h2 className="font-medium">Search preview</h2>
            <label className="block text-sm font-medium">SEO title
              <FormInput maxLength={200} className={fieldClass} value={page.seoTitle ?? ""} placeholder={page.title || "Use page title"} onChange={(event) => change("seoTitle", event.target.value)} />
            </label>
            <label className="block text-sm font-medium">SEO description
              <FormTextarea maxLength={200} rows={3} className="mt-1 w-full" value={page.seoDescription ?? ""} placeholder={page.description || "Use short description"} onChange={(event) => change("seoDescription", event.target.value)} />
            </label>
            <label className="block text-sm font-medium">Social image URL
              <span className="mt-1 flex flex-wrap gap-2">
                <FormInput type="url" maxLength={2048} className="min-w-0 flex-1" value={page.image ?? ""} placeholder="https://…" onChange={(event) => change("image", event.target.value)} />
                <MediaPicker onSelect={(url) => change("image", url)} />
              </span>
            </label>
          </CardContent></Card>
        </aside>
      </div>
    </form>
  );
}
