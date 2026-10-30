"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { saveContent } from "@/lib/admin/client";
import type { SiteSettings } from "@/lib/admin/site-settings";
const inputClass =
  "border-input bg-background focus-visible:ring-ring mt-1 min-h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2";
export function SettingsScreen({ initial }: { initial: SiteSettings }) {
  const [settings, setSettings] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  function change<K extends keyof SiteSettings>(
    key: K,
    value: SiteSettings[K],
  ) {
    setSettings((current) => ({ ...current, [key]: value }));
    setSaved(false);
  }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const result = await saveContent("settings", settings, "site");
      setSettings(result.record);
      setSaved(true);
      if (!result.revalidated)
        toast.warning(
          "Settings saved, but public pages could not be refreshed.",
        );
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not save settings.",
      );
    } finally {
      setSaving(false);
    }
  }
  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Settings</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Update the public site&apos;s basic information.
          </p>
        </div>
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save settings"}
        </Button>
      </div>
      {error && (
        <p
          role="alert"
          className="rounded-md border border-red-500/50 px-4 py-3 text-sm text-red-500"
        >
          {error}
        </p>
      )}
      {saved && (
        <p role="status" className="text-muted-foreground text-sm">
          Settings saved.
        </p>
      )}
      <Card className="max-w-3xl gap-0">
        <CardContent className="space-y-4">
          <label className="block text-sm font-medium">
            Site title
            <input
              required
              maxLength={120}
              className={inputClass}
              value={settings.siteTitle}
              onChange={(event) => change("siteTitle", event.target.value)}
            />
          </label>
          <label className="block text-sm font-medium">
            Site description
            <textarea
              required
              maxLength={320}
              rows={4}
              className={inputClass}
              value={settings.siteDescription}
              onChange={(event) =>
                change("siteDescription", event.target.value)
              }
            />
          </label>
          <label className="block text-sm font-medium">
            Public contact email
            <input
              required
              type="email"
              maxLength={320}
              className={inputClass}
              value={settings.contactEmail}
              onChange={(event) => change("contactEmail", event.target.value)}
            />
          </label>
        </CardContent>
      </Card>
    </form>
  );
}
