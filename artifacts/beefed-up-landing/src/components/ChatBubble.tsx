import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink } from "lucide-react";

const ASSISTANT_URL = "https://personal-ai-assistant.keegz1984.replit.app";

export default function ChatBubble() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            key="chat-panel"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
            className="fixed inset-0 z-50 md:inset-auto md:bottom-24 md:left-6 flex flex-col overflow-hidden bg-black md:rounded-xl border-2 border-primary shadow-[0_0_40px_rgba(249,115,22,0.35)]"
            style={{ width: "min(420px, calc(100vw - 24px))", height: "min(640px, calc(100svh - 24px))" }}
          >
            <div className="flex items-center justify-between bg-zinc-950 px-4 py-3 border-b border-zinc-800 flex-shrink-0 pt-[calc(env(safe-area-inset-top)+12px)] md:pt-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="font-display font-bold text-sm tracking-widest uppercase text-white">
                  Design Advisor
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
                  onClick={() => setOpen(false)}
                  className="text-zinc-500 hover:text-primary transition-colors"
                  aria-label="Close chat"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <iframe
              src={ASSISTANT_URL}
              title="Beefed Up Design Advisor"
              className="flex-1 w-full bg-zinc-950"
              allow="microphone; clipboard-write"
              loading="lazy"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setOpen((v) => !v)}
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.4, type: "spring", stiffness: 200, damping: 22 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        aria-label={open ? "Close Design Advisor" : "Open Design Advisor"}
        className="fixed bottom-6 left-6 z-50 w-14 h-14 rounded-full bg-zinc-950 border-2 border-primary shadow-[0_0_24px_rgba(249,115,22,0.4)] flex items-center justify-center overflow-hidden"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.span
              key="x"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="text-primary"
            >
              <X size={22} />
            </motion.span>
          ) : (
            <motion.span
              key="bull"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="text-2xl leading-none select-none"
            >
              🐂
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </>
  );
}
