"use client";

import { useState, useRef } from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CodeBlockProps extends React.HTMLAttributes<HTMLPreElement> {
  children?: React.ReactNode;
}

export function CodeBlock({ className, children, ...props }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const preRef = useRef<HTMLPreElement>(null);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
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
      <pre
        ref={preRef}
        className={cn(
          "bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm",
          "relative ", // Add relative positioning
          className
        )}
        {...props}
      >
        <button
          onClick={handleCopy}
          className={cn(
            "absolute right-6 top-6 p-1.5 rounded-md",
            "bg-gray-900 dark:bg-gray-700 backdrop-blur-sm",
            "text-white hover:text-white dark:text-gray-300 dark:hover:text-white",
            "transition-all duration-200",
            "flex items-center justify-center"
          )}
          aria-label="Copy code"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-white" />
          ) : (
            <Copy className="h-3.5 w-3.5 text-white" />
          )}
        </button>
        <code className="font-mono block">
          {children}
        </code>
      </pre>
    </div>
  );
}