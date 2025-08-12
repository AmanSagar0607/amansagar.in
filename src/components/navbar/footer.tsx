import React from "react";
import Link from "next/link";
import { Container } from "@/components/Container";

export const Footer = () => {
  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-3xl">
        <div className="flex items-center justify-between border-t border-neutral-100 px-6 py-3 dark:border-neutral-800">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Built with love by{" "}
            <a
              href="https://www.linkedin.com/in/amansagar0607/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-dotted underline-offset-2 transition-colors hover:text-neutral-700 dark:hover:text-neutral-300"
            >
              Aman Sagar
            </a>
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="https://calendly.com/amansagar0307/30min"
              className="group relative ml-4 flex items-center gap-2 rounded-full bg-neutral-600 px-4 py-1.5 pr-4 pl-3 text-sm font-medium text-white transition-colors hover:bg-neutral-700 dark:bg-neutral-700 dark:hover:bg-neutral-600"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite] rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              <span>Hire Me</span>
            </Link>
            {/* Medium */}
            {/* <Link
              href="https://medium.com/@amansagar0607"
              className="text-neutral-500 hover:text-neutral-300"
            >
              <svg viewBox="0 0 16 16" className="h-5 w-5" fill="currentColor">
                <path d="M9.025 8c0 2.485 -2.02 4.5 -4.513 4.5A4.506 4.506 0 0 1 0 8c0 -2.486 2.02 -4.5 4.512 -4.5A4.506 4.506 0 0 1 9.025 8m4.95 0c0 2.34 -1.01 4.236 -2.256 4.236S9.463 10.339 9.463 8c0 -2.34 1.01 -4.236 2.256 -4.236S13.975 5.661 13.975 8M16 8c0 2.096 -0.355 3.795 -0.794 3.795 -0.438 0 -0.793 -1.7 -0.793 -3.795 0 -2.096 0.355 -3.795 0.794 -3.795 0.438 0 0.793 1.699 0.793 3.795" />
              </svg>
            </Link> */}
            {/* Github */}
            {/* <Link href="https://github.com/amansagar0607">
            <IconBrandGithub className="size-5 text-neutral-500 hover:text-neutral-700" />
          </Link> */}
            {/* LinkedIn */}
            {/* <Link href="https://linkedin.com/in/amansagar0607">
            <IconBrandLinkedin className="size-5 text-neutral-500 hover:text-neutral-700" />
          </Link> */}
            {/* X */}
            {/* <Link href="https://x.com/amansagar0607">
            <IconBrandX className="size-5 text-neutral-500 hover:text-neutral-700" />
          </Link> */}
          </div>
        </div>
      </div>
    </div>
  );
};
