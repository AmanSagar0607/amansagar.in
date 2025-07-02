'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Link as LinkIcon, Twitter, Share2, Check } from 'lucide-react';

interface FloatingShareButtonProps {
  title: string;
  url: string;
}

export default function FloatingShareButton({ title, url }: FloatingShareButtonProps) {
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
      // Fallback for browsers that don't support clipboard API
      if (!navigator.clipboard) {
        fallbackCopyToClipboard(url);
        return;
      }
      
      await navigator.clipboard.writeText(url);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      closeDropdown();
    } catch (err) {
      console.error('Failed to copy:', err);
      // Try fallback method if clipboard API fails
      fallbackCopyToClipboard(url);
    }
  };

  // Fallback method for copying text
  const fallbackCopyToClipboard = (text: string) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    
    // Avoid scrolling to bottom
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand('copy');
      if (successful) {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } else {
        // If execCommand fails, show the text in a prompt
        window.prompt('Copy to clipboard: Ctrl+C, Enter', text);
      }
    } catch (err) {
      console.error('Fallback copy failed:', err);
      window.prompt('Copy to clipboard: Ctrl+C, Enter', text);
    }

    document.body.removeChild(textArea);
    closeDropdown();
  };

  return (
    <div className="fixed bottom-6 right-4 z-50 block md:hidden">
      <div className="relative">
        <button
          ref={buttonRef}
          onClick={toggleDropdown}
          className="flex items-center gap-2 rounded-full bg-neutral-800/90 px-4 py-3 text-sm font-medium text-white shadow-lg transition-all hover:bg-neutral-700/90 dark:bg-neutral-100/90 dark:text-neutral-900 dark:hover:bg-neutral-200/90 focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-800"
          aria-label="Share options"
          aria-expanded={isOpen}
        >
          <Share2 className="h-4 w-4" />
          <span>{isCopied ? 'Copied!' : 'Share'}</span>
        </button>
        
        {isOpen && (
          <div 
            ref={dropdownRef}
            className="absolute bottom-full right-0 mb-2 w-48 rounded-md shadow-lg bg-white/95 dark:bg-neutral-800/95 backdrop-blur-sm border border-neutral-200 dark:border-neutral-700 z-50"
          >
            <div className="py-1">
              <button
                onClick={shareOnTwitter}
                className="w-full text-left px-4 py-2 text-sm text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100/90 dark:hover:bg-neutral-700/90 transition-colors duration-150 flex items-center gap-2"
              >
                <Twitter className="h-4 w-4 text-blue-400" />
                <span>Share on Twitter (X)</span>
              </button>
              <button
                onClick={copyToClipboard}
                className="w-full text-left px-4 py-2 text-sm text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100/90 dark:hover:bg-neutral-700/90 transition-colors duration-150 flex items-center gap-2"
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
    </div>
  );
}
