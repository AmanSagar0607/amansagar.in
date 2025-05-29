'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type CopyButtonProps = {
  value: string;
  className?: string;
};

export function CopyButton({ value, className }: CopyButtonProps) {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const Icon = isCopied ? Check : Copy;

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={cn(
        'h-8 w-8 p-0 hover:bg-muted-foreground/10',
        className
      )}
      onClick={copyToClipboard}
      aria-label={isCopied ? 'Copied!' : 'Copy to clipboard'}
    >
      <Icon className="h-4 w-4" />
    </Button>
  );
}
