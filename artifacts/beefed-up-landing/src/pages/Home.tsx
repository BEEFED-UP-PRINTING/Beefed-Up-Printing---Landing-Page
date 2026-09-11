import { useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import GreetingsTicker from "@/components/GreetingsTicker";
import BoomboxPlaylist from "@/components/BoomboxPlaylist";
import About from "@/components/About";
import Services from "@/components/Services";
import StatsBar from "@/components/StatsBar";
import DropWall from "@/components/DropWall";
import DropCountdown from "@/components/DropCountdown";
import QuoteCalculator from "@/components/QuoteCalculator";
import ContactForm from "@/components/ContactForm";
import Footer from "@/components/Footer";
import MaggieSprayCan from "@/components/MaggieSprayCan";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import DesignDNAPanel from "@/components/DesignDNAPanel";
import CursorTrail from "@/components/CursorTrail";

export default function Home() {
  const [dnaOpen, setDnaOpen] = useState(false);
  const [maggieForceOpen, setMaggieForceOpen] = useState(false);
  const [playlistOpen, setPlaylistOpen] = useState(false);
  const playlistRef = useRef<HTMLDivElement>(null);

  const jumpToPlaylist = () => {
    setPlaylistOpen(true);
    requestAnimationFrame(() => {
      playlistRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  };

  return (
    <div className="bg-background min-h-screen text-foreground relative">
      <CursorTrail />
      <Navbar onOpenDNA={() => setDnaOpen(true)} />

      <main>
        <Hero onJumpToPlaylist={jumpToPlaylist} />
        <GreetingsTicker />
        <div ref={playlistRef} className="py-6 bg-zinc-950 border-b border-zinc-900">
          <BoomboxPlaylist open={playlistOpen} onOpenChange={setPlaylistOpen} />
        </div>
        <StatsBar />
        <About />
        <Services />
        <DropWall />
        <DropCountdown />
        <QuoteCalculator />
        <ContactForm />
      </main>

      <Footer />

      <WhatsAppFloat />

      <MaggieSprayCan
        forceOpen={maggieForceOpen}
        onForceClose={() => setMaggieForceOpen(false)}
      />

      <AnimatePresence>
        {dnaOpen && (
          <DesignDNAPanel
            onClose={() => setDnaOpen(false)}
            onOpenMaggie={() => setMaggieForceOpen(true)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
