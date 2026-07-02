import LandingHeader from "../components/ui/LandingHeader";
import Footer from "../components/ui/Footer";
import ScrollToTopButton from "../components/ui/ScrollToTopButton";
import HeroSection from "../components/landing/HeroSection";
import AboutSection from "../components/landing/AboutSection";
import FeaturesSection from "../components/landing/FeaturesSection";
import HowItWorksSection from "../components/landing/HowItWorksSection";
import BenefitsSection from "../components/landing/BenefitsSection";
import CtaSection from "../components/landing/CtaSection";
import ContactSection from "../components/landing/ContactSection";

export default function LandingPage() {
  return (
    <div className="w-full min-h-screen flex flex-col bg-bg-main dark:bg-dark-bg">
      <LandingHeader />
      <main className="flex-1">
        <HeroSection />
        <AboutSection />
        <FeaturesSection />
        <HowItWorksSection />
        <BenefitsSection />
        <CtaSection />
        <ContactSection />
      </main>
      <Footer />
      <ScrollToTopButton />
    </div>
  );
}



