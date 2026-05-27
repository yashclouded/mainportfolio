import type {Metadata} from 'next';
import { Inter } from 'next/font/google';
import { FluidProvider } from '@/lib/FluidContext';
import FluidBackground from '@/components/FluidBackground';
import TextLiquidFilter from '@/components/TextLiquidFilter';
import Cursor from '@/components/Cursor';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Yash | Builder, Founder & Engineer',
  description: 'Portfolio of Yash - Teenage founder, AI engineer, and systems thinker exploring the edges of internet culture, youth innovation, and next-generation interfaces.',
  keywords: ['Yash', 'Portfolio', 'AI Engineer', 'Founder', 'Web Development', 'Systems Thinker', 'Next.js', 'React', 'Frontend'],
  authors: [{ name: 'Yash' }],
  creator: 'Yash',
  openGraph: {
    title: 'Yash | Builder & Founder',
    description: 'Exploring the edges of AI, internet culture, and youth innovation.',
    url: 'https://yashsingh.dev', // Replace with actual domain later
    siteName: 'Yash Portfolio',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Yash | Builder & Founder',
    description: 'Exploring the edges of AI, internet culture, and youth innovation.',
    creator: '@yashclouded',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${inter.variable} antialiased scroll-smooth`}>
      <body className="font-sans bg-white text-black min-h-screen selection:bg-[#FF0000]/20 selection:text-[#FF0000] overflow-x-hidden" suppressHydrationWarning>
        <FluidProvider>
          <FluidBackground />
          <TextLiquidFilter />
          {/* No wrapper div — sections must be in the root stacking context
              so their .fluid-blend (mix-blend-mode:difference) can reach
              the fluid canvas at z-index:-1 */}
          {children}
          <Cursor />
        </FluidProvider>
      </body>
    </html>
  );
}
