"use client";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../../globals.css";
import { MDXProvider } from '@mdx-js/react';
import { useMDXComponents } from '../../../../mdx-components';
import { Container } from "@/components/container";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
  display: "swap",
});

const metadata = {
  title: "AWS S3 Buckets Guide",
  description: "A comprehensive guide to AWS S3 Buckets",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${inter.variable} font-sans`}>
      <MDXProvider components={useMDXComponents({})}>
        <Container className="min-h-[200vh] p-4 md:pt-28 md:pb-10 px-12">
          <article className="prose prose-invert max-w-none">
            {children}
          </article>
        </Container>
      </MDXProvider>
    </div>
  );
}
