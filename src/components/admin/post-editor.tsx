"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ActivityMarkdown } from "@/components/journey/activity-markdown";
import { MediaPicker } from "./media-picker";
import type { ManagedPost } from "@/lib/admin/content-types";

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
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(post.slug)) {
      setError("Use a lowercase slug with letters, numbers and hyphens.");
      return;
    }
    if (
      !post.title.trim() ||
      !post.description.trim() ||
      !post.content.trim()
    ) {
      setError("Title, description and content are required.");
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
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setPreview(!preview)}
            aria-pressed={preview}
          >
            {preview ? "Edit" : "Preview"}
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save post"}
          </Button>
        </div>
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
          Post saved.
        </p>
      )}
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <Card className="gap-0">
          <CardContent className="space-y-4">
            <label className="block text-sm font-medium">
              Title
              <input
                required
                maxLength={200}
                className={inputClass}
                value={post.title}
                onChange={(event) => change("title", event.target.value)}
              />
            </label>
            <label className="block text-sm font-medium">
              Slug
              <input
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
              <textarea
                required
                maxLength={1000}
                rows={3}
                className={inputClass}
                value={post.description}
                onChange={(event) => change("description", event.target.value)}
              />
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
                      <input
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
                  <input
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
                  <fieldset key={key} className="space-y-2">
                    <legend className="text-sm font-medium">{label}</legend>
                    {options.length ? (
                      options.map((option) => {
                        const selected = Array.isArray(post.frontmatter[key])
                          ? (post.frontmatter[key] as string[])
                          : [];
                        return (
                          <label
                            key={option.slug}
                            className="flex items-center gap-2 text-sm"
                          >
                            <input
                              type="checkbox"
                              checked={selected.includes(option.slug)}
                              onChange={(event) =>
                                change("frontmatter", {
                                  ...post.frontmatter,
                                  [key]: event.target.checked
                                    ? [...selected, option.slug]
                                    : selected.filter(
                                        (slug) => slug !== option.slug,
                                      ),
                                })
                              }
                            />
                            {option.title}
                          </label>
                        );
                      })
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
              <label
                htmlFor="post-content"
                className="block text-sm font-medium"
              >
                Content{" "}
                <span className="text-muted-foreground font-normal">
                  (Markdown)
                </span>
              </label>
              {preview ? (
                <div className="border-border mt-1 min-h-80 overflow-hidden rounded-md border p-4">
                  <ActivityMarkdown content={post.content} />
                </div>
              ) : (
                <textarea
                  id="post-content"
                  required
                  rows={20}
                  maxLength={100000}
                  className={`${inputClass} font-mono`}
                  value={post.content}
                  onChange={(event) => change("content", event.target.value)}
                />
              )}
            </div>
          </CardContent>
        </Card>
        <Card className="h-fit gap-0">
          <CardContent className="space-y-4">
            <h2 className="font-medium">Publishing</h2>
            <label className="block text-sm font-medium">
              Status
              <select
                className={inputClass}
                value={post.status}
                onChange={(event) =>
                  change("status", event.target.value as ManagedPost["status"])
                }
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </label>
            <label className="block text-sm font-medium">
              Visibility
              <select
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
              </select>
            </label>
            <label className="block text-sm font-medium">
              Publication date
              <input
                type="date"
                required
                className={inputClass}
                value={post.publishedAt.slice(0, 10)}
                onChange={(event) => change("publishedAt", event.target.value)}
              />
            </label>
            <label className="flex min-h-10 items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={post.sample === true}
                onChange={(event) => change("sample", event.target.checked)}
              />
              Sample content
            </label>
            <p className="text-muted-foreground text-xs leading-5">
              Only public, published posts whose publication date has arrived
              and which are not samples appear on the portfolio.
            </p>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
