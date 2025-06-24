'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Link as LinkIcon, Twitter, Share2 } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface ShareButtonProps {
  title: string;
  slug: string;
  className?: string;
}

export default function ShareButton({ title, slug, className }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Handle click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        closeDropdown();
      }
    };

    // Use capture phase to ensure we catch the event before it bubbles up
    document.addEventListener('click', handleClickOutside, { capture: true });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeDropdown();
    });

    return () => {
      document.removeEventListener('click', handleClickOutside, { capture: true });
      document.removeEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeDropdown();
      });
    };
  }, [isOpen, closeDropdown]);

  const toggleDropdown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(prev => !prev);
  }, []);

  const url = typeof window !== 'undefined' 
    ? `${window.location.origin}/blog/${slug}`
    : '';

  const shareOnTwitter = (e: React.MouseEvent) => {
    e.stopPropagation();
    const tweetText = `Check out "${title}" by @AmanSagar0607`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank', 'noopener,noreferrer');
    closeDropdown();
  };

  const copyToClipboard = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(url);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className={cn('relative inline-block', className)}>
      <Button
        ref={buttonRef}
        variant="outline"
        size="icon"
        onClick={toggleDropdown}
        className="rounded-full w-7 h-7 p-0 flex items-center justify-center border border-border hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 cursor-pointer"
        aria-label="Share options"
        aria-expanded={isOpen}
      >
        <Share2 className="h-3.5 w-3.5" />
      </Button>
      
      {isOpen && (
        <div 
          ref={dropdownRef}
          className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 border border-border z-50"
        >
          <div className="py-1">
            <button
              onClick={shareOnTwitter}
              className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150 flex items-center gap-2"
            >
              <Twitter className="h-4 w-4 text-blue-400" />
              <span>Share on Twitter (X)</span>
            </button>
            <button
              onClick={copyToClipboard}
              className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150 flex items-center gap-2"
            >
              {isCopied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <LinkIcon className="h-4 w-4" />
              )}
              <span>{isCopied ? 'Copied!' : 'Copy link'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Check icon component
const Check = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 6 9 17l-5-5" />
  </svg>
);
