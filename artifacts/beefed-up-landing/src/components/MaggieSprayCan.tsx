import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink } from "lucide-react";

const ASSISTANT_URL = "https://personal-ai-assistant.keegz1984.replit.app";
const APPEAR_DELAY_MS = 60_000;

interface Props {
  forceOpen?: boolean;
  onForceClose?: () => void;
}

export default function MaggieSprayCan({ forceOpen = false, onForceClose }: Props) {
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [spraying, setSpraying] = useState(false);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(true);
      setShowHint(true);
      const h = setTimeout(() => setShowHint(false), 6000);
      return () => clearTimeout(h);
    }, APPEAR_DELAY_MS);
    return () => clearTimeout(t);
  }, []);

  // When parent forces open (e.g. from DNA panel CTA)
  useEffect(() => {
    if (forceOpen && !open) {
      setVisible(true);
      setShowHint(false);
      setSpraying(true);
      setTimeout(() => {
        setOpen(true);
        setSpraying(false);
      }, 1100);
    }
  }, [forceOpen]);

  function handleClose() {
    setOpen(false);
    onForceClose?.();
  }

  const handleTap = () => {
    if (open) {
      handleClose();
      return;
    }
    setShowHint(false);
    setSpraying(true);
    setTimeout(() => {
      setOpen(true);
      setSpraying(false);
    }, 1100);
  };

  const canSrc = `${import.meta.env.BASE_URL}maggie-can.jpeg`;

  return (
    <>
      {/* Spray paint splash + MAGGIE tag */}
      <AnimatePresence>
        {spraying && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 pointer-events-none flex items-center justify-center"
          >
            {Array.from({ length: 24 }).map((_, i) => {
              const angle = (i / 24) * Math.PI * 2;
              const dist = 90 + Math.random() * 140;
              return (
                <motion.span
                  key={i}
                  initial={{ x: 0, y: 0, opacity: 0.9, scale: 0 }}
                  animate={{
                    x: Math.cos(angle) * dist,
                    y: Math.sin(angle) * dist,
                    opacity: 0,
                    scale: 1 + Math.random() * 1.4,
                  }}
                  transition={{ duration: 0.9, ease: "easeOut" }}
                  className="absolute block rounded-full"
                  style={{
                    width: 10 + Math.random() * 10,
                    height: 10 + Math.random() * 10,
                    background:
                      i % 3 === 0
                        ? "rgba(249,115,22,0.85)"
                        : i % 3 === 1
                        ? "rgba(239,68,68,0.75)"
                        : "rgba(255,255,255,0.65)",
                    filter: "blur(2px)",
                  }}
                />
              );
            })}

            <motion.div
              initial={{ scale: 0.6, opacity: 0, rotate: -8 }}
              animate={{ scale: 1, opacity: 1, rotate: -6 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.25, duration: 0.5, ease: "backOut" }}
              className="font-graffiti text-7xl sm:text-9xl text-orange-500 select-none"
              style={{
                textShadow:
                  "0 0 18px rgba(249,115,22,0.95), 0 0 36px rgba(239,68,68,0.7), 4px 6px 0 rgba(0,0,0,0.8)",
                WebkitTextStroke: "2px rgba(0,0,0,0.6)",
              }}
            >
              MAGGIE
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="chat-panel"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
            className="fixed inset-0 z-50 md:inset-auto md:bottom-24 md:right-6 flex flex-col overflow-hidden bg-black md:rounded-xl border-2 border-primary shadow-[0_0_40px_rgba(249,115,22,0.35)]"
            style={{
              width: "min(420px, calc(100vw - 24px))",
              height: "min(640px, calc(100svh - 24px))",
            }}
          >
            <div className="flex items-center justify-between bg-zinc-950 px-4 py-3 border-b border-zinc-800 flex-shrink-0 pt-[calc(env(safe-area-inset-top)+12px)] md:pt-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="font-display font-bold text-sm tracking-widest uppercase text-white">
                  Maggie · Custom Designs
                </span>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href={ASSISTANT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-500 hover:text-primary transition-colors"
                  title="Open in new tab"
                >
                  <ExternalLink size={16} />
                </a>
                <button
                  onClick={handleClose}
                  className="text-zinc-500 hover:text-primary transition-colors"
                  aria-label="Close chat"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* DNA clipboard nudge */}
            <AnimatePresence>
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-primary/10 border-b border-primary/20 px-4 py-2 overflow-hidden"
              >
                <p className="text-[10px] font-sans text-orange-300 leading-relaxed">
                  💡 If you came from your Design DNA, paste your brief into Maggie to get personalised concepts.
                </p>
              </motion.div>
            </AnimatePresence>

            <iframe
              src={ASSISTANT_URL}
              title="Maggie · Custom Design Advisor"
              className="flex-1 w-full bg-zinc-950"
              allow="microphone; clipboard-write"
              loading="lazy"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hint popup */}
      <AnimatePresence>
        {visible && showHint && !open && !spraying && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.35 }}
            className="fixed bottom-[78px] right-3 sm:right-5 z-40 max-w-[200px] pointer-events-none"
          >
            <div
              className="px-3 py-2 rounded-lg bg-zinc-950/95 backdrop-blur-sm border border-orange-500/50 text-[11px] uppercase tracking-wider font-bold text-orange-300"
              style={{
                textShadow: "0 0 8px rgba(249,115,22,0.6)",
                boxShadow: "0 0 14px rgba(249,115,22,0.3)",
              }}
            >
              Need help customising? <span className="text-white">Tap the can</span>
            </div>
            <div className="ml-auto mr-6 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-orange-500/50" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spray can button */}
      <AnimatePresence>
        {visible && (
          <motion.button
            onClick={handleTap}
            initial={{ y: 80, opacity: 0, scale: 0.6 }}
            animate={{
              y: 0,
              opacity: 1,
              scale: 1,
              rotate: spraying ? [-2, -22, -22, -2] : 0,
            }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{
              y: { type: "spring", stiffness: 200, damping: 22 },
              opacity: { duration: 0.4 },
              scale: { duration: 0.4 },
              rotate: { duration: 1.0, ease: "easeInOut" },
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.92 }}
            aria-label={open ? "Close Maggie" : "Tap to spray Maggie"}
            className="fixed bottom-4 right-3 sm:right-5 z-50 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-zinc-950 border-2 border-primary shadow-[0_0_22px_rgba(249,115,22,0.5)] overflow-hidden"
            style={{ transformOrigin: "bottom right" }}
          >
            {open ? (
              <span className="flex items-center justify-center w-full h-full text-primary">
                <X size={22} />
              </span>
            ) : (
              <img
                src={canSrc}
                alt="Maggie spray can"
                className="w-full h-full object-cover"
                draggable={false}
              />
            )}
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
