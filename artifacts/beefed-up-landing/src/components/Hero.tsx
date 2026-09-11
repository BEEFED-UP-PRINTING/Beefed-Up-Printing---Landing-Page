import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Music2 } from "lucide-react";
import TapToStart from "./TapToStart";

const INTRO_SEEN_KEY = "bup-intro-seen";

function hasSeenIntro() {
  try {
    return window.localStorage.getItem(INTRO_SEEN_KEY) === "true";
  } catch {
    return false;
  }
}

interface HeroProps {
  onJumpToPlaylist: () => void;
}

export default function Hero({ onJumpToPlaylist }: HeroProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [returningVisitor] = useState(hasSeenIntro);
  const [started, setStarted] = useState(returningVisitor);

  const muralSrc = `${import.meta.env.BASE_URL}mural.mp4`;

  useEffect(() => {
    if (!returningVisitor) return;

    // Returning visitors get the visual intro without another blocking tap.
    // Keep it muted because browsers only allow autoplay in that state.
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    v.play().catch(() => {});
  }, [returningVisitor]);

  const handleTap = () => {
    if (started) return;
    setStarted(true);

    try {
      window.localStorage.setItem(INTRO_SEEN_KEY, "true");
    } catch {}

    const v = videoRef.current;
    if (!v) return;

    try {
      v.currentTime = 0;
    } catch {}
    v.muted = false;
    v.volume = 1;
    v.play().catch(() => {});
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
  };

  return (
    <section className="relative w-full h-[100svh] bg-black overflow-hidden">
      <video
        ref={videoRef}
        src={muralSrc}
        loop
        playsInline
        preload="auto"
        onClick={started ? toggleMute : undefined}
        className="absolute inset-0 w-full h-full object-contain md:object-cover bg-black"
      />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, transparent 18%, transparent 78%, rgba(0,0,0,0.85) 100%)",
        }}
      />

      <AnimatePresence>
        {!started && <TapToStart onTap={handleTap} />}
      </AnimatePresence>

      <AnimatePresence>
        {returningVisitor && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ delay: 0.35, duration: 0.45 }}
            className="absolute top-24 left-1/2 z-20 -translate-x-1/2 px-4 sm:top-28"
          >
            <button
              type="button"
              onClick={onJumpToPlaylist}
              className="flex items-center gap-2 whitespace-nowrap border border-orange-400/60 bg-black/75 px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.18em] text-orange-300 shadow-[0_0_24px_rgba(249,115,22,0.18)] backdrop-blur-md transition-colors hover:border-orange-300 hover:bg-orange-500 hover:text-black"
            >
              <Music2 size={14} />
              Skip intro · Play playlist
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {started && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
          >
            <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-400 font-bold">
              Scroll
            </span>
            <a
              href="#about"
              className="text-zinc-400 hover:text-orange-400 transition-colors animate-bounce"
            >
              <ChevronDown size={28} />
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
