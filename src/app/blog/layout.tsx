import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Container } from '@/components/Container';

const inter = Inter({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-inter',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' }
  ],
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
      <Container className="min-h-[200vh] p-4 md:pt-24 pt-18 md:pb-10 pb-10 md:px-12 px-8">
        <main className="w-full">
          {children}
        </main>
      </Container>
    </div>
  );
}
