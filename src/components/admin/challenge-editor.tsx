"use client";
import { Input as FormInput } from "@/components/ui/input";
import { FormSelect } from "@/components/ui/select";
import { Textarea as FormTextarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { isPublicActivity } from "@/lib/journey/logic";
import type { Activity, Challenge } from "@/lib/journey/types";
const inputClass =
  "border-input bg-background focus-visible:ring-ring mt-1 min-h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2";
export function ChallengeEditor({
  initial,
  activities,
  onSave,
  identifierLocked = false,
}: {
  initial: Challenge;
  activities: Activity[];
  onSave: (challenge: Challenge) => Promise<void>;
  identifierLocked?: boolean;
}) {
  const [item, setItem] = useState(initial);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  function change<K extends keyof Challenge>(key: K, value: Challenge[K]) {
    setItem((current) => ({ ...current, [key]: value }));
    setSaved(false);
  }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.id)) {
      setError("Enter a valid lowercase ID.");
      return;
    }
    if (!item.title.trim() || !item.category.trim()) {
      setError("Title and category are required.");
      return;
    }
    if (item.evidenceUrl) {
      try {
        if (!["http:", "https:"].includes(new URL(item.evidenceUrl).protocol))
          throw new Error();
      } catch {
        setError("Evidence must use an HTTP or HTTPS URL.");
        return;
      }
    }
    if (item.completedAt && !item.evidenceUrl && !item.activitySlug) {
      setError("A completed challenge needs evidence or a published activity.");
      return;
    }
    setSaving(true);
    try {
      await onSave(item);
      setSaved(true);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not save this challenge.",
      );
    } finally {
      setSaving(false);
    }
  }
  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">
            {initial.title ? "Edit challenge" : "New challenge"}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Record learning at your own pace with evidence of completion.
          </p>
        </div>
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save challenge"}
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
          Challenge saved.
        </p>
      )}
      <Card className="max-w-3xl gap-0">
        <CardContent className="space-y-4">
          <label className="block text-sm font-medium">
            ID
            <FormInput
              required
              maxLength={120}
              className={inputClass}
              readOnly={identifierLocked}
              value={item.id}
              onChange={(event) => change("id", event.target.value)}
            />
          </label>
          <label className="block text-sm font-medium">
            Title
            <FormInput
              required
              maxLength={500}
              className={inputClass}
              value={item.title}
              onChange={(event) => change("title", event.target.value)}
            />
          </label>
          <label className="block text-sm font-medium">
            Category
            <FormInput
              required
              maxLength={100}
              className={inputClass}
              value={item.category}
              onChange={(event) => change("category", event.target.value)}
            />
          </label>
          <label className="block text-sm font-medium">
            Description
            <FormTextarea
              rows={4}
              maxLength={2000}
              className={inputClass}
              value={item.description}
              onChange={(event) => change("description", event.target.value)}
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium">
              Planned date
              <FormInput
                type="date"
                className={inputClass}
                value={item.date?.slice(0, 10) || ""}
                onChange={(event) =>
                  change("date", event.target.value || undefined)
                }
              />
            </label>
            <label className="block text-sm font-medium">
              Completion date
              <FormInput
                type="date"
                className={inputClass}
                value={item.completedAt?.slice(0, 10) || ""}
                onChange={(event) =>
                  change("completedAt", event.target.value || undefined)
                }
              />
            </label>
          </div>
          <label className="block text-sm font-medium">
            Related published activity
            <FormSelect
              className={inputClass}
              value={item.activitySlug || ""}
              onChange={(event) =>
                change("activitySlug", event.target.value || undefined)
              }
            >
              <option value="">None</option>
              {activities.filter(isPublicActivity).map((a) => (
                <option key={a.slug} value={a.slug}>
                  {a.title}
                </option>
              ))}
            </FormSelect>
          </label>
          <label className="block text-sm font-medium">
            Evidence URL
            <FormInput
              type="url"
              className={inputClass}
              value={item.evidenceUrl || ""}
              onChange={(event) =>
                change("evidenceUrl", event.target.value || undefined)
              }
            />
          </label>
          <label className="block text-sm font-medium">
            Visibility
            <FormSelect
              className={inputClass}
              value={item.visibility}
              onChange={(event) =>
                change(
                  "visibility",
                  event.target.value as Challenge["visibility"],
                )
              }
            >
              <option value="private">Private</option>
              <option value="public">Public</option>
            </FormSelect>
          </label>
        </CardContent>
      </Card>
    </form>
  );
}
