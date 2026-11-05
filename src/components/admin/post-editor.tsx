"use client";
import { Input as FormInput } from "@/components/ui/input";
import { Select as FormSelect } from "@/components/ui/select";
import { Textarea as FormTextarea } from "@/components/ui/textarea";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { ActivityMarkdown } from "@/components/journey/activity-markdown";
import { MediaPicker } from "./media-picker";
import type { ManagedPost } from "@/lib/admin/content-types";
import { SeoAssistant } from "./seo-assistant";
import { articleText } from "@/lib/article-content";

const RichPostEditor = dynamic(() => import("./rich-post-editor"), {
  ssr: false,
  loading: () => (
    <p role="status" className="text-muted-foreground p-6 text-sm">
      Loading article editor…
    </p>
  ),
});

const inputClass =
  "border-input bg-background focus-visible:ring-ring mt-1 min-h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2";

type Option = { slug: string; title: string };
export function PostEditor({
  initial,
  onSave,
  identifierLocked = false,
  tracks = [],
  projects = [],
}: {
  initial: ManagedPost;
  onSave: (post: ManagedPost) => Promise<void>;
  identifierLocked?: boolean;
  tracks?: Option[];
  projects?: Option[];
}) {
  const [post, setPost] = useState(initial);
  const [preview, setPreview] = useState(false);
  const [sourcePending, setSourcePending] = useState(false);
  const [tags, setTags] = useState(() =>
    Array.isArray(initial.frontmatter.tags)
      ? initial.frontmatter.tags.join(", ")
      : "",
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  function change<K extends keyof ManagedPost>(key: K, value: ManagedPost[K]) {
    setPost((current) => ({ ...current, [key]: value }));
    setSaved(false);
  }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (sourcePending) {
      setError("Apply or cancel your source import before saving the post.");
      return;
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(post.slug)) {
      setError("Use a lowercase slug with letters, numbers and hyphens.");
      return;
    }
    if (
      !post.title.trim() ||
      !post.description.trim() ||
      (!articleText(post.content).trim() && !/<img\b/i.test(post.content))
    ) {
      setError("Title, description and content are required.");
      return;
    }
    if (post.content.length > 100000) {
      setError(
        "This article exceeds the 100,000 character content limit. Split it into multiple posts or reduce its length.",
      );
      return;
    }
    if (!Number.isFinite(Date.parse(post.publishedAt))) {
      setError("Enter a valid publication date.");
      return;
    }
    setSaving(true);
    try {
      await onSave({
        ...post,
        frontmatter: {
          ...post.frontmatter,
          tags: tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
        },
        updatedAt: new Date().toISOString(),
      });
      setSaved(true);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not save this post.",
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
            {initial.title ? "Edit post" : "New post"}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Write, preview and control when your article is visible.
          </p>
          {initial.updatedAt && <p className="text-muted-foreground mt-2 text-xs">Version {initial.version ?? 1} · Last edited {new Date(initial.updatedAt).toLocaleString()}</p>}
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setPreview(!preview)}
            aria-pressed={preview}
            disabled={sourcePending}
          >
            {preview ? "Edit" : "Preview"}
          </Button>
          <Button type="submit" disabled={saving || sourcePending}>
            {saving ? "Saving…" : "Save post"}
          </Button>
        </div>
      </div>
      {sourcePending && (
        <p
          role="status"
          className="text-muted-foreground border-border rounded-md border px-4 py-3 text-sm"
        >
          Source import has unapplied changes. Choose Apply source or Cancel
          import before previewing or saving.
        </p>
      )}
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
          Post saved.
        </p>
      )}
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <Card className="gap-0">
          <CardContent className="min-w-0 space-y-4">
            <label className="block text-sm font-medium">
              Title
              <FormInput
                required
                maxLength={200}
                className={inputClass}
                value={post.title}
                onChange={(event) => change("title", event.target.value)}
              />
              <span className="text-muted-foreground mt-1 block text-xs">
                {post.title.length}/200 characters
              </span>
            </label>
            <label className="block text-sm font-medium">
              Slug
              <FormInput
                required
                maxLength={120}
                className={inputClass}
                readOnly={identifierLocked}
                value={post.slug}
                onChange={(event) => change("slug", event.target.value)}
              />
            </label>
            <label className="block text-sm font-medium">
              Description
              <FormTextarea
                required
                maxLength={1000}
                rows={3}
                className={inputClass}
                value={post.description}
                onChange={(event) => change("description", event.target.value)}
              />
              <span className="text-muted-foreground mt-1 block text-xs">
                {post.description.length}/1000 characters · Keep it concise for search previews.
              </span>
            </label>
            <details className="border-border rounded-md border p-4">
              <summary className="cursor-pointer text-sm font-medium">
                Metadata and related work
              </summary>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {(
                  [
                    ["author", "Author"],
                    ["image", "Cover image URL or path"],
                    ["seoTitle", "SEO title"],
                    ["seoDescription", "SEO description"],
                  ] as const
                ).map(([key, label]) => (
                  <div key={key} className="space-y-2">
                    <label className="block text-sm font-medium">
                      {label}
                      <FormInput
                        className={inputClass}
                        value={
                          typeof post.frontmatter[key] === "string"
                            ? (post.frontmatter[key] as string)
                            : ""
                        }
                        onChange={(event) =>
                          change("frontmatter", {
                            ...post.frontmatter,
                            [key]: event.target.value,
                          })
                        }
                      />
                    </label>
                    {key === "image" && (
                      <MediaPicker
                        onSelect={(url) =>
                          change("frontmatter", {
                            ...post.frontmatter,
                            image: url,
                          })
                        }
                      />
                    )}
                  </div>
                ))}
                <label className="block text-sm font-medium sm:col-span-2">
                  Tags{" "}
                  <span className="text-muted-foreground font-normal">
                    (comma separated)
                  </span>
                  <FormInput
                    className={inputClass}
                    value={tags}
                    onChange={(event) => {
                      setTags(event.target.value);
                      setSaved(false);
                    }}
                  />
                </label>
                {(
                  [
                    ["trackSlugs", "Learning tracks", tracks],
                    ["projectSlugs", "Projects", projects],
                  ] as const
                ).map(([key, label, options]) => (
                  <fieldset key={key} className="min-w-0 space-y-2">
                    <legend className="text-sm font-medium">{label}</legend>
                    {options.length ? (
                      <ScrollArea className="mt-1 max-h-56 min-w-0 pr-1">
                        <div className="grid min-w-0 gap-1">
                          {options.map((option) => {
                            const selected = Array.isArray(post.frontmatter[key])
                              ? (post.frontmatter[key] as string[])
                              : [];
                            return (
                              <label
                                key={option.slug}
                                className="flex min-h-11 min-w-0 cursor-pointer items-start gap-2 rounded-md px-2 py-2 text-sm leading-5 hover:bg-muted/50"
                              >
                                <Checkbox
                                  className="mt-0.5"
                                  checked={selected.includes(option.slug)}
                                  onCheckedChange={(checked) =>
                                    change("frontmatter", {
                                      ...post.frontmatter,
                                      [key]: checked === true
                                        ? [...selected, option.slug]
                                        : selected.filter(
                                            (slug) => slug !== option.slug,
                                          ),
                                    })
                                  }
                                />
                                <span className="min-w-0 break-words">{option.title}</span>
                              </label>
                            );
                        })}
                        </div>
                      </ScrollArea>
                    ) : (
                      <p className="text-muted-foreground text-xs">
                        No options available.
                      </p>
                    )}
                  </fieldset>
                ))}
              </div>
            </details>
            <div>
              <h2 className="mb-2 text-sm font-medium">Content</h2>
              {preview ? (
                <div className="border-border mt-1 min-h-80 overflow-hidden rounded-md border p-4">
                  <ActivityMarkdown content={post.content} />
                </div>
              ) : (
                <RichPostEditor
                  value={post.content}
                  onChange={(content) => change("content", content)}
                  onPendingSourceChange={setSourcePending}
                />
              )}
            </div>
          </CardContent>
        </Card>
        <aside
          className="min-w-0 space-y-5"
          aria-label="Article publishing and assistance"
        >
          <Card className="h-fit gap-0">
            <CardContent className="space-y-4">
              <h2 className="font-medium">Publishing</h2>
              <label className="block text-sm font-medium">
                Status
                <FormSelect
                  className={inputClass}
                  value={post.status}
                  onChange={(event) =>
                    change(
                      "status",
                      event.target.value as ManagedPost["status"],
                    )
                  }
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </FormSelect>
              </label>
              <label className="block text-sm font-medium">
                Visibility
                <FormSelect
                  className={inputClass}
                  value={post.visibility}
                  onChange={(event) =>
                    change(
                      "visibility",
                      event.target.value as ManagedPost["visibility"],
                    )
                  }
                >
                  <option value="private">Private</option>
                  <option value="public">Public</option>
                </FormSelect>
              </label>
              <label className="block text-sm font-medium">
                Publication date
                <FormInput
                  type="date"
                  required
                  className={inputClass}
                  value={post.publishedAt.slice(0, 10)}
                  onChange={(event) =>
                    change("publishedAt", event.target.value)
                  }
                />
              </label>
              <label className="flex min-h-10 min-w-0 items-center gap-2 text-sm">
                <Checkbox
                  checked={post.sample === true}
                  onCheckedChange={(checked) => change("sample", checked === true)}
                />
                Sample content
              </label>
              <p className="text-muted-foreground text-xs leading-5">
                Only public, published posts whose publication date has arrived
                and which are not samples appear on the portfolio.
              </p>
            </CardContent>
          </Card>
          <fieldset disabled={sourcePending} className="min-w-0 space-y-5">
            <SeoAssistant
              post={post}
              onContent={(content) => change("content", content)}
              onSeo={(seo) =>
                change("frontmatter", { ...post.frontmatter, ...seo })
              }
            />
          </fieldset>
        </aside>
      </div>
    </form>
  );
}
