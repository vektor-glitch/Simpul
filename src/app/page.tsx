import Navbar from '@/components/ui/navbar';
import HeroSection from '@/components/section/herosection';
import SolutionSection from '@/components/section/solutionsection';
import ProductsSection from '@/components/section/productssection';
import PoolsSection from '@/components/section/poolssection';
import Testimonials from '@/components/section/testimonialssection';
import AboutSection from '@/components/section/aboutsection';
import FAQSection from '@/components/section/faqsection';
import CTASection from '@/components/section/ctasection';
import FooterSection from '@/components/section/footersection';
import FadeUp from '@/components/ui/fadeup';

export default function LandingPage() {
  return (
    <div id='/LandingPage' className="min-h-screen bg-white text-gray-800 font-sans overflow-hidden">
      <Navbar />

      <FadeUp delay={100}>
        <HeroSection />
      </FadeUp>

      <FadeUp delay={200}>
        <SolutionSection />
      </FadeUp>

      <FadeUp delay={200}>
        <ProductsSection />
      </FadeUp>

      <FadeUp delay={200}>
        <PoolsSection />
      </FadeUp>

      <FadeUp delay={200}>
        <Testimonials />
      </FadeUp>

      <FadeUp delay={200}>
        <AboutSection />
      </FadeUp>

      <FadeUp delay={200}>
        <FAQSection />
      </FadeUp>

      <FadeUp delay={200}>
        <CTASection />
      </FadeUp>

      <FooterSection />

    </div>
  );
}