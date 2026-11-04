"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles, Check, CircleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ActivityMarkdown } from "@/components/journey/activity-markdown";
import { articleHeadings, articleText } from "@/lib/article-content";
import type { ManagedPost } from "@/lib/admin/content-types";

const input =
  "border-input bg-background focus-visible:ring-ring min-h-11 w-full rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-2";
type Action = "improve" | "outline" | "seo" | "custom";

export function SeoAssistant({
  post,
  onContent,
  onSeo,
}: {
  post: ManagedPost;
  onContent: (content: string) => void;
  onSeo: (seo: { seoTitle: string; seoDescription: string }) => void;
}) {
  const text = articleText(post.content);
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const headings = articleHeadings(post.content);
  const seoTitle =
    typeof post.frontmatter.seoTitle === "string" && post.frontmatter.seoTitle
      ? post.frontmatter.seoTitle
      : post.title;
  const seoDescription =
    typeof post.frontmatter.seoDescription === "string" &&
    post.frontmatter.seoDescription
      ? post.frontmatter.seoDescription
      : post.description;
  const htmlImages = [...post.content.matchAll(/<img\b[^>]*>/gi)];
  const missingAlts =
    htmlImages.filter(
      ([tag]) =>
        !/\balt\s*=\s*["'][^"']\S?[^"']*["']/i.test(tag) ||
        /\balt\s*=\s*["']\s*["']/i.test(tag),
    ).length + [...post.content.matchAll(/!\[\s*\]\(/g)].length;
  const checks = [
    {
      ok: seoTitle.length >= 30 && seoTitle.length <= 60,
      label: `SEO title: ${seoTitle.length} characters`,
      detail: "Aim for a clear title around 30–60 characters.",
    },
    {
      ok: seoDescription.length >= 100 && seoDescription.length <= 160,
      label: `Description: ${seoDescription.length} characters`,
      detail: "Aim for a useful summary around 100–160 characters.",
    },
    {
      ok: headings.length > 0,
      label: headings.length
        ? `${headings.length} section headings`
        : "Add section headings",
      detail: "Clear headings help people and search tools follow the article.",
    },
    {
      ok: missingAlts === 0,
      label: missingAlts
        ? `${missingAlts} images need alternative text`
        : "Image alternatives checked",
      detail:
        "Describe informative images; an empty alt is appropriate for decorative images.",
    },
    {
      ok: !!post.frontmatter.image,
      label: post.frontmatter.image
        ? "Social cover image set"
        : "Add a social cover image",
      detail: "Choose an image in Metadata and related work.",
    },
  ];
  const [action, setAction] = useState<Action>("improve");
  const [instruction, setInstruction] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{
    text: string;
    action: Action;
    source: string;
    title: string;
  } | null>(null);
  const [applied, setApplied] = useState(false);
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);
  const stale =
    !!result && (result.source !== post.content || result.title !== post.title);
  let proposedSeo: { seoTitle: string; seoDescription: string } | null = null;
  if (result?.action === "seo") {
    try {
      const parsed = JSON.parse(
        result.text.replace(/^```(?:json)?\s*|\s*```$/g, ""),
      );
      if (
        typeof parsed.seoTitle === "string" &&
        parsed.seoTitle.trim() &&
        typeof parsed.seoDescription === "string" &&
        parsed.seoDescription.trim()
      )
        proposedSeo = {
          seoTitle: parsed.seoTitle.slice(0, 200),
          seoDescription: parsed.seoDescription.slice(0, 1000),
        };
    } catch {
      /* Invalid suggestions remain visible and cannot be applied. */
    }
  }
  async function generate() {
    setBusy(true);
    setError("");
    setResult(null);
    setApplied(false);
    const requestController = new AbortController();
    controller.current = requestController;
    try {
      const response = await fetch("/api/admin/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          content: post.content,
          title: post.title,
          instruction: action === "custom" ? instruction : undefined,
        }),
        signal: requestController.signal,
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "The writing assistant is unavailable.");
      if (typeof data.text !== "string" || !data.text.trim())
        throw new Error(
          "The assistant returned an empty suggestion. Try again.",
        );
      setResult({
        text: data.text,
        action,
        source: post.content,
        title: post.title,
      });
    } catch (cause) {
      if (!requestController.signal.aborted)
        setError(
          cause instanceof Error
            ? cause.message
            : "Could not generate a suggestion.",
        );
    } finally {
      if (controller.current === requestController) {
        controller.current = null;
        setBusy(false);
      }
    }
  }
  return (
    <>
      <section
        className="border-border bg-card space-y-4 rounded-xl border p-5"
        aria-labelledby="article-seo-heading"
      >
        <div className="flex items-center justify-between gap-2">
          <h2 id="article-seo-heading" className="font-medium">
            Search & readability
          </h2>
          <span className="text-muted-foreground text-xs">Live checks</span>
        </div>
        <div className="border-border flex items-baseline gap-5 border-b pb-4">
          <p>
            <span className="text-2xl font-semibold tabular-nums">
              {words.toLocaleString()}
            </span>
            <span className="text-muted-foreground ml-1 text-xs">words</span>
          </p>
          <p className="text-muted-foreground text-sm">
            {Math.max(1, Math.ceil(words / 200))} min read
          </p>
        </div>
        <ul className="space-y-3">
          {checks.map((check) => (
            <li
              key={check.label}
              className="flex items-start gap-2 text-xs leading-5"
            >
              {check.ok ? (
                <Check
                  aria-hidden="true"
                  className="text-foreground mt-0.5 size-4 shrink-0"
                />
              ) : (
                <CircleAlert
                  aria-hidden="true"
                  className="text-muted-foreground mt-0.5 size-4 shrink-0"
                />
              )}
              <div>
                <p className="font-medium">{check.label}</p>
                {!check.ok && (
                  <p className="text-muted-foreground">{check.detail}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
        <div className="border-border min-w-0 rounded-md border p-3">
          <p className="text-muted-foreground mb-2 text-[10px] font-medium tracking-wider uppercase">
            Search preview
          </p>
          <p className="text-muted-foreground text-xs break-all">
            amansagar.in › blog › {post.slug || "article-slug"}
          </p>
          <p className="mt-1 text-base leading-6 font-medium break-words">
            {seoTitle || "Your article title"}
          </p>
          <p className="text-muted-foreground mt-1 text-xs leading-5 break-words">
            {seoDescription || "A concise summary of what readers will learn."}
          </p>
        </div>
        <p className="text-muted-foreground text-xs leading-5">
          These are editorial suggestions, not a ranking score. Clear structure,
          accurate references and helpful content support discovery by search
          engines and AI tools.
        </p>
      </section>
      <section
        className="border-border bg-card space-y-4 rounded-xl border p-5"
        aria-labelledby="article-ai-heading"
      >
        <h2
          id="article-ai-heading"
          className="flex items-center gap-2 font-medium"
        >
          <Sparkles aria-hidden="true" className="size-4" />
          Writing assistant
        </h2>
        <p className="text-muted-foreground text-xs leading-5">
          Ask for a proposal, review it, then apply it to your draft. Clicking
          Generate sends this article and your instructions to OpenAI.
        </p>
        <label className="block space-y-1 text-sm">
          <span>Task</span>
          <select
            className={input}
            value={action}
            disabled={busy}
            onChange={(e) => {
              setAction(e.target.value as Action);
              setResult(null);
              setError("");
              setApplied(false);
            }}
          >
            <option value="improve">Improve clarity</option>
            <option value="outline">Create an outline</option>
            <option value="seo">Suggest SEO metadata</option>
            <option value="custom">Custom instruction</option>
          </select>
        </label>
        {action === "custom" && (
          <label className="block space-y-1 text-sm">
            <span>Your instruction</span>
            <textarea
              rows={3}
              maxLength={2000}
              className={input}
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="For example: add a practical example after the introduction."
            />
          </label>
        )}
        <Button
          type="button"
          variant="outline"
          className="min-h-11 w-full"
          disabled={
            busy ||
            !post.content.trim() ||
            (action === "custom" && !instruction.trim())
          }
          onClick={() => void generate()}
        >
          {busy ? "Preparing suggestion…" : "Generate suggestion"}
        </Button>
        {busy && (
          <Button
            type="button"
            variant="ghost"
            className="min-h-11 w-full"
            onClick={() => {
              controller.current?.abort();
              setBusy(false);
            }}
          >
            Cancel
          </Button>
        )}
        {error && (
          <p role="alert" className="text-destructive text-xs leading-5">
            {error}
          </p>
        )}
        {result && (
          <div className="border-border space-y-3 border-t pt-4">
            <p className="text-xs font-medium">Review proposal</p>
            <div className="border-border max-h-80 overflow-auto rounded-md border p-3 text-xs">
              {result.action === "seo" ? (
                proposedSeo ? (
                  <dl className="space-y-3">
                    <div>
                      <dt className="font-medium">SEO title</dt>
                      <dd className="text-muted-foreground mt-1 break-words">
                        {proposedSeo.seoTitle}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium">SEO description</dt>
                      <dd className="text-muted-foreground mt-1 break-words">
                        {proposedSeo.seoDescription}
                      </dd>
                    </div>
                  </dl>
                ) : (
                  <pre className="break-words whitespace-pre-wrap">
                    {result.text}
                  </pre>
                )
              ) : (
                <ActivityMarkdown content={result.text} />
              )}
            </div>
            {stale && !applied && (
              <p className="text-muted-foreground text-xs leading-5">
                The article changed after this request. Generate a new
                suggestion to apply it safely.
              </p>
            )}
            {result.action === "seo" && !proposedSeo && (
              <p role="alert" className="text-destructive text-xs">
                The metadata response has an invalid format. Please generate it
                again.
              </p>
            )}
            {!applied && (
              <Button
                type="button"
                className="min-h-11 w-full"
                disabled={stale || (result.action === "seo" && !proposedSeo)}
                onClick={() => {
                  if (result.action === "seo" && proposedSeo)
                    onSeo(proposedSeo);
                  else onContent(result.text);
                  setApplied(true);
                }}
              >
                {result.action === "seo"
                  ? "Apply SEO metadata"
                  : "Replace article with proposal"}
              </Button>
            )}
            {applied && (
              <p role="status" className="text-xs leading-5">
                Applied to the draft. Review your article, then save when ready.
              </p>
            )}
            <Button
              type="button"
              variant="ghost"
              className="min-h-11 w-full"
              onClick={() => setResult(null)}
            >
              Dismiss proposal
            </Button>
          </div>
        )}
      </section>
    </>
  );
}
