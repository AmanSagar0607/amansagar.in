import { LoaderCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

/** Streamed while the protected layout verifies the server-side admin session. */
export function AdminSessionLoading() {
  return (
    <div
      className="dark min-h-screen bg-[#080809] text-foreground"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <header className="border-border flex h-16 items-center justify-between gap-4 border-b bg-[#0b0b0c] px-4 md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Skeleton className="size-8 shrink-0 rounded-lg" />
          <div className="min-w-0">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="mt-1 h-2 w-12" />
          </div>
        </div>
        <div className="text-muted-foreground flex min-w-0 items-center gap-2 text-xs sm:text-sm">
          <LoaderCircle className="size-4 shrink-0 animate-spin" aria-hidden />
          <span className="truncate">Verifying admin session…</span>
        </div>
      </header>
      <main className="mx-auto w-full max-w-screen-2xl p-4 md:p-8">
        <p className="sr-only">Checking your signed-in account.</p>
        <Skeleton className="h-8 w-56 max-w-full" />
        <Skeleton className="mt-3 h-4 w-80 max-w-full" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <section
              key={index}
              className="border-border space-y-4 rounded-xl border p-5"
              aria-hidden="true"
            >
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
