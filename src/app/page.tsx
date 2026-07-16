import Navbar from '@/components/ui/navbar';
import HeroSection from '@/components/section/herosection';
import SolutionSection from '@/components/section/solutionsection';
import ProductsSection from '@/components/section/productssection';
import Testimonials from '@/components/section/testimonialssection';
import AboutSection from '@/components/section/aboutsection';
import FAQSection from '@/components/section/faqsection';
import CTASection from '@/components/section/ctasection';
import FooterSection from '@/components/section/footersection';

export default function LandingPage() {
  return (
    <div id='/LandingPage' className="min-h-screen bg-white text-gray-800 font-sans">
      <Navbar />

      <HeroSection />

      <SolutionSection />

      <ProductsSection />

      <Testimonials />

      <AboutSection />

      <FAQSection />

      <CTASection />

      <FooterSection />

    </div>
  );
}