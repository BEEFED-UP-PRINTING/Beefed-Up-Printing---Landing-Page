import Navigation from "@/components/navigation";
import HeroSection from "@/components/hero-section";
import ServicesSection from "@/components/services-section";
import PortfolioSection from "@/components/portfolio-section";
import TestimonialsSection from "@/components/testimonials-section";
import AboutSection from "@/components/about-section";
import ContactSection from "@/components/contact-section";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Quote, MessageCircle } from "lucide-react";
import { useState } from "react";

export default function Home() {
  const [showQuoteModal, setShowQuoteModal] = useState(false);

  const scrollToContact = () => {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const openWhatsApp = () => {
    window.open('https://wa.me/27796473406?text=Hi! I\'d like to get a quote for printing services.', '_blank');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main>
        <HeroSection />
        <ServicesSection />
        <PortfolioSection />
        <TestimonialsSection />
        <AboutSection />
        <ContactSection />
      </main>
      
      <Footer />
      
      {/* Floating CTA Buttons */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3">
        <Button
          onClick={openWhatsApp}
          className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl pulse"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
        <Button
          onClick={scrollToContact}
          className="bg-accent hover:bg-orange-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl pulse"
          size="icon"
        >
          <Quote className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}
