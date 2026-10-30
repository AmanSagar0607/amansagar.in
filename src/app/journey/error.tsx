"use client";

import { Button } from "@/components/ui/button";

export default function JourneyError({ reset }: { reset: () => void }) {
  return (
    <main className="page-shell space-y-4 px-4 py-12">
      <h1 className="text-2xl font-medium">Journey could not be loaded.</h1>
      <p className="text-muted-foreground text-sm">
        Please try again in a moment.
      </p>
      <Button variant="outline" onClick={reset}>
        Try again
      </Button>
    </main>
  );
}
