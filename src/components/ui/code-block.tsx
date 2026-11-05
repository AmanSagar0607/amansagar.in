"use client";

import { useEffect, useState, useRef } from "react";
import { Copy, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface CodeBlockProps extends React.HTMLAttributes<HTMLPreElement> {
  children?: React.ReactNode;
}

export function CodeBlock({ className, children, ...props }: CodeBlockProps) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");
  const preRef = useRef<HTMLPreElement>(null);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (resetTimer.current) clearTimeout(resetTimer.current);
  }, []);

  const copyToClipboard = async (text: string): Promise<boolean> => {
    if (typeof navigator !== "undefined" && navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch {
        // Try the selection-based fallback for browsers that deny clipboard access.
      }
    }

    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    try {
      textarea.focus();
      textarea.select();
      return document.execCommand("copy");
    } catch {
      return false;
    } finally {
      textarea.remove();
    }
  };

  const handleCopy = async () => {
    if (!preRef.current) return;
    const codeElement = preRef.current.querySelector("code");
    const codeToCopy = codeElement?.textContent ?? "";
    const copied = await copyToClipboard(codeToCopy);
    setCopyState(copied ? "copied" : "error");
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setCopyState("idle"), 2400);
  };

  return (
    <div className="relative">
      <ScrollArea className="w-full rounded-lg">
        <pre
          ref={preRef}
          className={cn(
            "border-border bg-muted/40 text-foreground w-max min-w-full rounded-lg border p-4 text-sm",
            "pr-12",
            className
          )}
          {...props}
        >
          <code className="font-mono block">
            {children}
          </code>
        </pre>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={() => void handleCopy()}
        className={cn(
          "absolute top-4 right-4 z-10 bg-background/90 text-muted-foreground hover:text-foreground backdrop-blur-sm",
        )}
        aria-label={copyState === "copied" ? "Code copied" : copyState === "error" ? "Copy failed" : "Copy code"}
      >
        {copyState === "copied" ? (
          <Check className="h-3.5 w-3.5" />
        ) : copyState === "error" ? (
          <X className="h-3.5 w-3.5" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
      </Button>
      <span className="sr-only" role="status" aria-live="polite">
        {copyState === "copied" ? "Code copied to clipboard." : copyState === "error" ? "Could not copy code to clipboard." : ""}
      </span>
    </div>
  );
}
