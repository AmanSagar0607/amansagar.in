"use client";
import { Input as FormInput } from "@/components/ui/input";
import { FormSelect } from "@/components/ui/select";
import { Textarea as FormTextarea } from "@/components/ui/textarea";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { BadgeMetric, BadgeRule } from "@/lib/journey/types";

const inputClass =
  "border-input bg-background focus-visible:ring-ring mt-1 min-h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2";
const metrics: { value: BadgeMetric; label: string }[] = [
  { value: "learning", label: "Published learning activities" },
  { value: "research", label: "Published research activities" },
  { value: "building", label: "Completed building activities" },
  { value: "article", label: "Published articles" },
  { value: "active-days", label: "Distinct active days" },
  { value: "open-source", label: "Verified open-source milestones" },
  { value: "project-shipped", label: "Shipped project milestones" },
  { value: "track", label: "Completed learning tracks" },
];
export function AchievementEditor({
  initial,
  earned,
  onSave,
  identifierLocked = false,
}: {
  initial: BadgeRule;
  earned: boolean;
  onSave: (rule: BadgeRule) => Promise<void>;
  identifierLocked?: boolean;
}) {
  const [rule, setRule] = useState(initial);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  function change<K extends keyof BadgeRule>(key: K, value: BadgeRule[K]) {
    setRule((current) => ({ ...current, [key]: value }));
    setSaved(false);
  }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(rule.id)) {
      setError("Enter a valid lowercase ID.");
      return;
    }
    if (
      !rule.title.trim() ||
      !rule.description.trim() ||
      !rule.requirement.trim()
    ) {
      setError("Title, description and requirement are required.");
      return;
    }
    if (
      !Number.isInteger(rule.target) ||
      rule.target < 1 ||
      rule.target > 10000
    ) {
      setError("Target must be a whole number from 1 to 10000.");
      return;
    }
    setSaving(true);
    try {
      await onSave(rule);
      setSaved(true);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not save this achievement.",
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
            {initial.title ? "Edit achievement" : "New achievement"}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Achievements are awarded from recorded work.
          </p>
        </div>
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save achievement"}
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
          Achievement saved.
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
              value={rule.id}
              onChange={(event) => change("id", event.target.value)}
            />
          </label>
          <label className="block text-sm font-medium">
            Title
            <FormInput
              required
              maxLength={500}
              className={inputClass}
              value={rule.title}
              onChange={(event) => change("title", event.target.value)}
            />
          </label>
          <label className="block text-sm font-medium">
            Description
            <FormTextarea
              required
              maxLength={2000}
              rows={3}
              className={inputClass}
              value={rule.description}
              onChange={(event) => change("description", event.target.value)}
            />
          </label>
          <label className="block text-sm font-medium">
            Requirement shown to visitors
            <FormInput
              required
              maxLength={1000}
              className={inputClass}
              value={rule.requirement}
              onChange={(event) => change("requirement", event.target.value)}
            />
          </label>
          <label className="block text-sm font-medium">
            Completion criterion
            <FormSelect
              className={inputClass}
              value={rule.metric}
              onChange={(event) =>
                change("metric", event.target.value as BadgeMetric)
              }
            >
              {metrics.map((metric) => (
                <option key={metric.value} value={metric.value}>
                  {metric.label}
                </option>
              ))}
            </FormSelect>
          </label>
          <label className="block text-sm font-medium">
            Target
            <FormInput
              type="number"
              required
              min={1}
              max={10000}
              step={1}
              className={inputClass}
              value={rule.target}
              onChange={(event) => change("target", event.target.valueAsNumber)}
            />
          </label>
          <p className="text-muted-foreground text-xs leading-5">
            {earned
              ? "This achievement has already been earned; its award date remains in the history."
              : "This achievement unlocks automatically when the criterion is met."}
          </p>
        </CardContent>
      </Card>
    </form>
  );
}
