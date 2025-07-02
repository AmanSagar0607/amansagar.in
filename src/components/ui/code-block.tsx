"use client";

import { useState, useRef } from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from 'sonner';

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
        toast.success('Copied to clipboard!', { duration: 1500 });
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
        toast.success('Copied to clipboard!', { duration: 1500 });
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
      <pre
        ref={preRef}
        className={cn(
          "bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm",
          "pr-12",
          className
        )}
        {...props}
      >
        <code className="font-mono block">
          {children}
        </code>
      </pre>
      <button
        onClick={handleCopy}
        className={cn(
          "absolute top-4 right-4 z-10 p-1.5 rounded-md",
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
    </div>
  );
}