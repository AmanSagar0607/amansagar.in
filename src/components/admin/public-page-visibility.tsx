"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { manageablePages, type SiteSettings } from "@/lib/admin/site-settings";
import { saveContent } from "@/lib/admin/client";

export function PublicPageVisibility({ initial }: { initial: SiteSettings }) {
  const [hidden, setHidden] = useState<string[]>(initial.hiddenPages ?? []);
  const [savedHidden, setSavedHidden] = useState<string[]>(initial.hiddenPages ?? []);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const value = initial.hiddenPages ?? [];
    setHidden(value);
    setSavedHidden(value);
  }, [initial.hiddenPages]);

  const dirty = hidden.length !== savedHidden.length || hidden.some((path) => !savedHidden.includes(path));

  async function save() {
    setSaving(true);
    try {
      const result = await saveContent<SiteSettings>("settings", { ...initial, hiddenPages: hidden }, "site");
      const saved = result.record.hiddenPages ?? [];
      setHidden(saved);
      setSavedHidden(saved);
      toast.success("Page visibility saved.");
      if (!result.revalidated) toast.warning("Saved, but the public page cache could not be refreshed.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save page visibility.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="space-y-3 rounded-xl border p-4" aria-labelledby="public-page-visibility-heading">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="public-page-visibility-heading" className="font-semibold">Public page visibility</h2>
          <p className="text-muted-foreground mt-1 text-sm">Hidden sections disappear from menus and search indexing. Their routes, including detail pages, return not found to visitors. You can turn them back on any time.</p>
        </div>
        <Button type="button" disabled={!dirty || saving} onClick={() => void save()}>{saving ? "Saving…" : "Save visibility"}</Button>
      </div>
      <div className="grid gap-x-5 gap-y-1 sm:grid-cols-2">
        {manageablePages.map((page) => (
          <label key={page.path} className="flex min-h-11 items-center gap-2 text-sm">
            <Checkbox checked={!hidden.includes(page.path)} onCheckedChange={(checked) => setHidden((current) => checked === true ? current.filter((path) => path !== page.path) : [...current, page.path])} />
            Show {page.label}
          </label>
        ))}
      </div>
      <p className="text-muted-foreground text-xs">Private blog posts, projects, journey entries, and custom pages can also be hidden individually from their own editor.</p>
    </section>
  );
}
