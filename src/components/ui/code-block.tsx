"use client";

import { useState, useRef } from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface CodeBlockProps extends React.HTMLAttributes<HTMLPreElement> {
  children?: React.ReactNode;
}

export function CodeBlock({ className, children, ...props }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const preRef = useRef<HTMLPreElement>(null);

  const copyToClipboard = async (text: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        console.error('Failed to copy text');
      }
    } else {
      // Fallback for older browsers and mobile
      try {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed'; // Prevent scrolling to bottom of page in MS Edge.
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        alert('Copy to clipboard is not supported on this device/browser.');
      }
    }
  };

  const handleCopy = () => {
    if (preRef.current) {
      const codeElement = preRef.current.querySelector('code');
      const codeToCopy = codeElement ? codeElement.textContent || '' : '';
      copyToClipboard(codeToCopy);
    }
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
        onClick={handleCopy}
        className={cn(
          "absolute top-4 right-4 z-10 bg-background/90 text-muted-foreground hover:text-foreground backdrop-blur-sm",
        )}
        aria-label="Copy code"
      >
        {copied ? (
          <Check className="h-3.5 w-3.5" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
      </Button>
    </div>
  );
}
