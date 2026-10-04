import type {Metadata} from 'next';
import { Inter } from 'next/font/google';
import { FluidProvider } from '@/lib/FluidContext';
import FluidBackground from '@/components/FluidBackground';
import TextLiquidFilter from '@/components/TextLiquidFilter';
import Cursor from '@/components/Cursor';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Yash Vardhan Singh | Builder, Founder & Engineer',
  description: 'Portfolio of Yash Vardhan Singh — CTO of Ashoka Ministry of Academic Affairs, founder of Bits&Bytes, and builder of AI-powered products, embedded systems, and developer tools.',
  keywords: ['Yash Vardhan Singh', 'Yash', 'Portfolio', 'AI Engineer', 'Embedded Systems', 'CTO Ashoka', 'Bits&Bytes', 'LISA', 'NextBench', 'Codiva', 'Next.js', 'React', 'Kotlin', 'ESP32'],
  authors: [{ name: 'Yash Vardhan Singh' }],
  creator: 'Yash Vardhan Singh',
  openGraph: {
    title: 'Yash Vardhan Singh | Builder, Founder & Engineer',
    description: 'Building AI-powered products, embedded systems, and developer tools. CTO of Ashoka Ministry of Academic Affairs.',
    url: 'https://yashvibe.codes',
    siteName: 'Yash Vardhan Singh Portfolio',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Yash Vardhan Singh | Builder, Founder & Engineer',
    description: 'Building AI-powered products, embedded systems, and developer tools. CTO of Ashoka Ministry of Academic Affairs.',
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
