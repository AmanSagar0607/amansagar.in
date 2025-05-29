"use client";

import { Inter } from "next/font/google";
import "../../globals.css";
import { MDXProvider } from '@mdx-js/react';
import { useMDXComponents } from '@/components/mdx-components';
import { Container } from "@/components/container";
import { ReactNode } from 'react';

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
  display: "swap",
});

interface BlogLayoutProps {
  children: ReactNode;
}

export default function BlogLayout({ children }: BlogLayoutProps) {
  const components = useMDXComponents({});
  
  return (
    <div className={`${inter.variable} font-sans`}>
      <Container className="min-h-[200vh] p-4 px-12 md:pt-28 md:pb-10">
        <article className="prose prose-invert max-w-none">
          <MDXProvider components={components}>
            {children}
          </MDXProvider>
        </article>
      </Container>
    </div>
  );
}
