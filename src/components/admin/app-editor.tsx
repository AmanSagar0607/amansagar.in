"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { ArrowUpRight, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormSelect } from "@/components/ui/select";
import { MediaPicker } from "./media-picker";
import type { ManagedApp, ManagedAppPage } from "@/lib/admin/content-types";

const RichPostEditor = dynamic(() => import("./rich-post-editor"), {
  ssr: false,
  loading: () => <p role="status" className="text-muted-foreground p-4 text-sm">Loading editor…</p>,
});

const fieldClass = "mt-1 min-h-10 w-full";
function slugFromTitle(value: string) {
  return value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 120);
}
function pagePathFromInput(value: string) {
  return value.split("/").map(slugFromTitle).join("/");
}
function emptyPage(): ManagedAppPage {
  return { slug: "", title: "", description: "", content: "", status: "draft", visibility: "private", updatedAt: new Date().toISOString() };
}

export function AppEditor({ initial, onSave, identifierLocked = false }: {
  initial: ManagedApp;
  onSave: (app: ManagedApp) => Promise<void>;
  identifierLocked?: boolean;
}) {
  const [app, setApp] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [deletePageIndex, setDeletePageIndex] = useState<number | null>(null);
  function change<K extends keyof ManagedApp>(key: K, value: ManagedApp[K]) {
    setApp((current) => ({ ...current, [key]: value }));
    setSaved(false);
  }
  function changePage(index: number, patch: Partial<ManagedAppPage>) {
    change("pages", app.pages.map((page, position) => position === index ? { ...page, ...patch } : page));
  }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await onSave({ ...app, updatedAt: new Date().toISOString() });
      setSaved(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save this app.");
    } finally {
      setSaving(false);
    }
  }
  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{initial.title ? "Edit app" : "New app"}</h1>
          <p className="text-muted-foreground mt-1 text-sm">Create a listing and manage its pages from one place.</p>
          {initial.version && <p className="text-muted-foreground mt-2 text-xs">Version {initial.version} · Last edited {new Date(initial.updatedAt).toLocaleString()}</p>}
        </div>
        <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save app"}</Button>
      </div>
      {error && <p role="alert" className="rounded-md border border-destructive/40 px-4 py-3 text-sm text-destructive">{error}</p>}
      {saved && <p role="status" className="text-muted-foreground text-sm">App and its pages saved.</p>}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-5">
          <Card><CardContent className="space-y-4">
            <h2 className="font-medium">App listing</h2>
            <label className="block text-sm font-medium">App name<Input required maxLength={200} className={fieldClass} value={app.title} onChange={(event) => {
              const title = event.target.value;
              setApp((current) => ({ ...current, title, ...(!identifierLocked ? { slug: slugFromTitle(title) } : {}) }));
              setSaved(false);
            }} /></label>
            <label className="block text-sm font-medium">URL slug<span className="text-muted-foreground mt-1 block text-xs font-normal">Public URL: /apps/{app.slug || "your-app"}</span><Input required maxLength={120} pattern="[a-z0-9]+(-[a-z0-9]+)*" className={fieldClass} value={app.slug} disabled={identifierLocked} onChange={(event) => change("slug", slugFromTitle(event.target.value))} /></label>
            <label className="block text-sm font-medium">Short pitch<Input required maxLength={240} className={fieldClass} value={app.tagline} placeholder="What does this app help people do?" onChange={(event) => change("tagline", event.target.value)} /></label>
            <label className="block text-sm font-medium">Directory description<Textarea required maxLength={1000} rows={3} className="mt-1 w-full" value={app.description} onChange={(event) => change("description", event.target.value)} /></label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium">Category<Input required maxLength={80} className={fieldClass} value={app.category} placeholder="Developer tools" onChange={(event) => change("category", event.target.value)} /></label>
              <label className="block text-sm font-medium">Platform<FormSelect className={fieldClass} value={app.platform} onChange={(event) => change("platform", event.target.value as ManagedApp["platform"])}><option value="web">Web app</option><option value="mobile">Mobile app</option><option value="desktop">Desktop app</option><option value="api">API</option><option value="other">Other</option></FormSelect></label>
            </div>
            <label className="block text-sm font-medium">Technologies (one per line)<Textarea rows={3} className="mt-1 w-full" value={app.technologies.join("\n")} onChange={(event) => change("technologies", event.target.value.split("\n").map((value) => value.trim()).filter(Boolean))} /></label>
            <label className="block text-sm font-medium">Overview and details</label>
            <RichPostEditor value={app.content} onChange={(content) => change("content", content)} />
          </CardContent></Card>

          <Card><CardContent className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2"><div><h2 className="font-medium">Pages for this app</h2><p className="text-muted-foreground mt-1 text-xs">These publish under /apps/{app.slug || "your-app"}/…</p></div><Button type="button" variant="outline" onClick={() => change("pages", [...app.pages, emptyPage()])}><Plus /> Add page</Button></div>
            {app.pages.length === 0 && <p className="text-muted-foreground rounded-lg border border-dashed p-5 text-sm">No app pages yet. Add documentation, pricing, privacy, or other supporting pages here.</p>}
            <div className="space-y-3">
              {app.pages.map((page, index) => (
                <details key={`${page.slug}-${index}`} className="group rounded-lg border p-3" open={app.pages.length === 1 && !page.title}>
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-medium"><span>{page.title || "New app page"}<span className="text-muted-foreground ml-2 font-normal">/apps/{app.slug || "your-app"}/{page.slug || "page-slug"}</span></span><span className="text-muted-foreground text-xs">{page.status === "published" && page.visibility === "public" ? "Published" : "Draft or hidden"}</span></summary>
                  <div className="mt-4 space-y-4 border-t pt-4">
                    <div className="flex flex-wrap items-center justify-end gap-2"><Button type="button" variant="ghost" size="sm" asChild disabled={!app.slug || !page.slug || page.status !== "published" || page.visibility !== "public"}><Link href={`/apps/${app.slug}/${page.slug}`} target="_blank">Preview page <ArrowUpRight /></Link></Button>{deletePageIndex === index ? <><span role="status" className="text-muted-foreground text-xs">Removal takes effect when you save.</span><Button type="button" variant="destructive" size="sm" onClick={() => { change("pages", app.pages.filter((_, position) => position !== index)); setDeletePageIndex(null); }}>Confirm remove</Button><Button type="button" variant="outline" size="sm" onClick={() => setDeletePageIndex(null)}>Cancel</Button></> : <Button type="button" variant="outline" size="sm" onClick={() => setDeletePageIndex(index)}><Trash2 /> Remove page</Button>}</div>
                    <label className="block text-sm font-medium">Page title<Input required maxLength={200} className={fieldClass} value={page.title} onChange={(event) => { const title = event.target.value; changePage(index, { title, ...(!page.slug ? { slug: slugFromTitle(title) } : {}) }); }} /></label>
                    <label className="block text-sm font-medium">Page path<span className="text-muted-foreground mt-1 block text-xs font-normal">/apps/{app.slug || "your-app"}/{page.slug || "page-path"} · use `/` to nest pages</span><Input required maxLength={300} pattern="[a-z0-9]+(-[a-z0-9]+)*(/[a-z0-9]+(-[a-z0-9]+)*)*" className={fieldClass} value={page.slug} onChange={(event) => changePage(index, { slug: pagePathFromInput(event.target.value) })} /></label>
                    <label className="block text-sm font-medium">Short description<Textarea maxLength={1000} rows={2} className="mt-1 w-full" value={page.description} onChange={(event) => changePage(index, { description: event.target.value })} /></label>
                    <label className="block text-sm font-medium">Page content</label><RichPostEditor value={page.content} onChange={(content) => changePage(index, { content })} />
                    <label className="block text-sm font-medium">Social preview image<span className="mt-1 flex gap-2"><Input type="text" inputMode="url" className="min-w-0 flex-1" value={page.image ?? ""} onChange={(event) => changePage(index, { image: event.target.value })} /><MediaPicker onSelect={(url) => changePage(index, { image: url })} /></span></label>
                    <div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-medium">Status<FormSelect className={fieldClass} value={page.status} onChange={(event) => changePage(index, { status: event.target.value as ManagedAppPage["status"] })}><option value="draft">Draft</option><option value="published">Published</option></FormSelect></label><label className="block text-sm font-medium">Visibility<FormSelect className={fieldClass} value={page.visibility} onChange={(event) => changePage(index, { visibility: event.target.value as ManagedAppPage["visibility"] })}><option value="private">Hidden from visitors</option><option value="public">Visible to visitors</option></FormSelect></label></div>
                    <div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-medium">SEO title<Input maxLength={200} className={fieldClass} value={page.seoTitle ?? ""} onChange={(event) => changePage(index, { seoTitle: event.target.value })} /></label><label className="block text-sm font-medium">SEO description<Input maxLength={200} className={fieldClass} value={page.seoDescription ?? ""} onChange={(event) => changePage(index, { seoDescription: event.target.value })} /></label></div>
                  </div>
                </details>
              ))}
            </div>
          </CardContent></Card>
        </div>

        <aside className="min-w-0 space-y-5" aria-label="App publishing and promotion">
          <Card><CardContent className="space-y-4">
            <h2 className="font-medium">Publish and promote</h2>
            <label className="block text-sm font-medium">Status<FormSelect className={fieldClass} value={app.status} onChange={(event) => change("status", event.target.value as ManagedApp["status"])}><option value="draft">Draft</option><option value="published">Published</option></FormSelect></label>
            <label className="block text-sm font-medium">Visibility<FormSelect className={fieldClass} value={app.visibility} onChange={(event) => change("visibility", event.target.value as ManagedApp["visibility"])}><option value="private">Hidden from visitors</option><option value="public">Visible to visitors</option></FormSelect></label>
            <label className="flex min-h-11 items-center gap-2 text-sm"><Checkbox checked={app.featured} onCheckedChange={(checked) => change("featured", checked === true)} />Feature this app at the top of /apps</label>
            <label className="block text-sm font-medium">Directory order<Input type="number" min={0} step={1} className={fieldClass} value={app.sortOrder} onChange={(event) => change("sortOrder", Math.max(0, Number(event.target.value) || 0))} /><span className="text-muted-foreground mt-1 block text-xs font-normal">Featured apps appear first, then this order.</span></label>
            <label className="block text-sm font-medium">Launch URL (HTTPS)<Input type="url" maxLength={2048} className={fieldClass} value={app.launchUrl ?? ""} placeholder="https://app.example.com" onChange={(event) => change("launchUrl", event.target.value)} /></label>
            <label className="block text-sm font-medium">Source or repository URL (HTTPS)<Input type="url" maxLength={2048} className={fieldClass} value={app.sourceUrl ?? ""} onChange={(event) => change("sourceUrl", event.target.value)} /></label>
          </CardContent></Card>
          <Card><CardContent className="space-y-4">
            <h2 className="font-medium">Images and search preview</h2>
            <label className="block text-sm font-medium">App icon URL<span className="mt-1 flex gap-2"><Input type="text" inputMode="url" className="min-w-0 flex-1" value={app.icon ?? ""} onChange={(event) => change("icon", event.target.value)} /><MediaPicker onSelect={(url) => change("icon", url)} /></span></label>
            <label className="block text-sm font-medium">Cover image URL<span className="mt-1 flex gap-2"><Input type="text" inputMode="url" className="min-w-0 flex-1" value={app.coverImage ?? ""} onChange={(event) => change("coverImage", event.target.value)} /><MediaPicker onSelect={(url) => change("coverImage", url)} /></span></label>
            <label className="block text-sm font-medium">Screenshots (one image URL per line)<Textarea rows={4} className="mt-1 w-full" value={app.screenshots.join("\n")} onChange={(event) => change("screenshots", event.target.value.split("\n").map((value) => value.trim()).filter(Boolean))} /></label>
            <label className="block text-sm font-medium">SEO title<Input maxLength={200} className={fieldClass} value={app.seoTitle ?? ""} onChange={(event) => change("seoTitle", event.target.value)} /></label>
            <label className="block text-sm font-medium">SEO description<Textarea maxLength={200} rows={3} className="mt-1 w-full" value={app.seoDescription ?? ""} onChange={(event) => change("seoDescription", event.target.value)} /></label>
          </CardContent></Card>
        </aside>
      </div>
    </form>
  );
}
