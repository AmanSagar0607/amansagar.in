"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

/** One-time import of the existing portfolio after an authenticated admin signs in. */
export function AdminInitialize() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function initialize() {
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/admin/initialize", {
        method: "POST",
        credentials: "same-origin",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      if (!response.ok) throw new Error("Initialization failed.");
      router.refresh();
    } catch {
      setError("Could not import the existing portfolio. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="max-w-xl space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Initialize your CMS</h1>
        <p className="text-muted-foreground mt-2 text-sm leading-6">
          Import the existing posts, projects, Journey records, and site
          settings into the private CMS. This can only run once and never
          overwrites existing CMS content.
        </p>
      </div>
      {error && (
        <p
          role="alert"
          className="rounded-md border border-red-500/50 px-3 py-2 text-sm text-red-500"
        >
          {error}
        </p>
      )}
      <Button onClick={initialize} disabled={pending}>
        {pending ? "Importing…" : "Import existing portfolio"}
      </Button>
    </section>
  );
}
