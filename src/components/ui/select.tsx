import * as React from "react";
import { cn } from "@/lib/utils";

/** Native-backed select that follows shadcn field styling and remains form-native. */
function Select({ className, ...props }: React.ComponentProps<"select">) {
  return <select data-slot="select" className={cn("border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive flex h-10 w-full items-center justify-between rounded-md border px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50", className)} {...props} />;
}
export { Select };
