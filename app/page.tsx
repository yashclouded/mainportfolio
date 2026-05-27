import LandingSection from '@/components/LandingSection';
import IdentitySection from '@/components/IdentitySection';
import HighlightsSection from '@/components/HighlightsSection';
import InteractiveSection from '@/components/InteractiveSection';
import FooterSection from '@/components/FooterSection';

export default function Home() {
  return (
    <main className="min-h-screen">
      <LandingSection />
      <IdentitySection />
      <HighlightsSection />
      <InteractiveSection />
      <FooterSection />
    </main>
  );
}
