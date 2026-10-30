import { Skeleton } from "@/components/ui/skeleton";

export default function JourneyLoading() {
  return (
    <main
      className="page-shell space-y-6 p-4"
      aria-busy="true"
      aria-label="Loading journey"
    >
      <Skeleton className="h-12 w-48" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-48 w-full" />
      <Skeleton className="h-32 w-full" />
      <span className="sr-only" role="status">
        Loading journey…
      </span>
    </main>
  );
}
