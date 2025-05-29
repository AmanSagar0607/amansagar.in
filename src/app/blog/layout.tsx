import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Container } from '@/components/container';

const inter = Inter({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-inter',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: 'Blog | Aman Sagar',
  description: 'Thoughts, stories and ideas about software development and more.',
  openGraph: {
    title: 'Blog | Aman Sagar',
    description: 'Thoughts, stories and ideas about software development and more.',
    type: 'website',
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`min-h-screen flex items-start justify-center ${inter.variable} font-sans`}>
      <Container className="min-h-screen py-8 px-4 md:px-12 pt-24">
        <main className="w-full">
          {children}
        </main>
      </Container>
    </div>
  );
}
