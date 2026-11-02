"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";

type Repository = { name: string; defaultBranch: string; openIssues: number; stars: number; lastPush: string | null; archived: boolean };
export function GithubRepositoryCheck({ slug }: { slug: string }) {
  const [data, setData] = useState<Repository | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function check() {
    setLoading(true); setError("");
    try {
      const response = await fetch(`/api/admin/github?slug=${encodeURIComponent(slug)}`, { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "GitHub check failed.");
      setData(result);
    } catch (cause) { setData(null); setError(cause instanceof Error ? cause.message : "GitHub check failed."); }
    finally { setLoading(false); }
  }
  return <div className="space-y-2"><Button type="button" variant="outline" size="sm" onClick={check} disabled={loading}>{loading ? "Checking GitHub…" : "Check GitHub"}</Button>
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    {data && <div role="status" className="text-muted-foreground space-y-1 text-xs"><p>{data.name}{data.archived ? " · Archived" : ""}</p><p>Branch: {data.defaultBranch} · Open issues and PRs: {data.openIssues} · Stars: {data.stars}</p><p>Last push: {data.lastPush ? new Date(data.lastPush).toLocaleDateString() : "Unknown"}</p></div>}
  </div>;
}
