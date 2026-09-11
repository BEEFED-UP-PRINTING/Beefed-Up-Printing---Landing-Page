import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const WA_PRIMARY = "27796473406";
const WA_ALT = "27763549713";
const WA_MESSAGE = encodeURIComponent(
  "Hey BUP! 👊 I want to place a custom merch order. Can we chat?"
);
const WA_URL_PRIMARY = `https://wa.me/${WA_PRIMARY}?text=${WA_MESSAGE}`;
const WA_URL_ALT = `https://wa.me/${WA_ALT}?text=${WA_MESSAGE}`;

const APPEAR_DELAY_MS = 8_000;

export default function WhatsAppFloat() {
  const [visible, setVisible] = useState(false);
  const [showNudge, setShowNudge] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(true);
      setShowNudge(true);
      const h = setTimeout(() => setShowNudge(false), 7000);
      return () => clearTimeout(h);
    }, APPEAR_DELAY_MS);
    return () => clearTimeout(t);
  }, []);

  if (!visible) return null;

  return (
    <>
      {/* Nudge bubble */}
      <AnimatePresence>
        {showNudge && !dismissed && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 10, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-[76px] left-3 sm:left-5 z-40 flex items-end gap-2"
          >
            <div
              className="relative bg-zinc-950 border border-[#25D366]/40 rounded-xl px-4 py-3 max-w-[220px]"
              style={{ boxShadow: "0 0 20px rgba(37,211,102,0.15)" }}
            >
              <button
                onClick={() => setShowNudge(false)}
                className="absolute -top-2 -right-2 w-5 h-5 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-400 hover:text-white"
              >
                <X size={10} />
              </button>
              <p className="text-[12px] font-sans text-white leading-snug">
                <span className="text-[#25D366] font-bold">Quick order?</span>{" "}
                Chat with us on WhatsApp — we respond fast 🔥
              </p>
              {/* Triangle */}
              <div className="absolute -bottom-2 left-5 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-zinc-950" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* WhatsApp FAB */}
      <div className="fixed bottom-4 left-3 sm:left-5 z-50 flex flex-col gap-2">
        {/* Alt number chip */}
        <motion.a
          href={WA_URL_ALT}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ x: -40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 22 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 rounded-full pl-3 pr-4 py-1.5 text-[11px] font-sans text-zinc-400 hover:text-[#25D366] hover:border-[#25D366]/40 transition-all"
          style={{ boxShadow: "0 0 12px rgba(37,211,102,0.1)" }}
          onClick={() => setShowNudge(false)}
        >
          <svg width="14" height="14" viewBox="0 0 32 32" fill="currentColor"><path d="M16.003 2.667C8.637 2.667 2.667 8.637 2.667 16.003c0 2.358.626 4.573 1.718 6.49L2.667 29.333l7.042-1.692a13.29 13.29 0 0 0 6.294 1.596c7.367 0 13.337-5.97 13.337-13.337 0-7.366-5.97-13.233-13.337-13.233zm0 24.267a11.06 11.06 0 0 1-5.614-1.528l-.403-.24-4.179 1.004.993-4.075-.264-.418A11.023 11.023 0 0 1 4.98 16.003c0-6.07 4.953-11.023 11.023-11.023 6.07 0 11.022 4.953 11.022 11.023 0 6.07-4.952 11.11-11.022 11.11zm6.068-8.252c-.333-.167-1.97-.972-2.274-1.083-.304-.111-.525-.167-.747.167-.22.333-.857 1.083-1.05 1.304-.195.222-.39.25-.723.083-.334-.167-1.41-.52-2.685-1.657-.992-.886-1.662-1.98-1.857-2.314-.195-.333-.021-.514.146-.68.15-.147.334-.389.5-.583.168-.194.222-.333.334-.555.11-.222.055-.416-.028-.583-.084-.167-.748-1.804-1.025-2.47-.27-.647-.547-.56-.747-.57-.194-.01-.416-.012-.638-.012-.222 0-.583.083-.889.417-.305.333-1.165 1.138-1.165 2.774 0 1.637 1.193 3.22 1.36 3.44.167.222 2.35 3.59 5.694 5.035.796.344 1.417.549 1.9.703.799.254 1.527.218 2.102.132.641-.096 1.97-.806 2.249-1.584.277-.778.277-1.444.194-1.584-.083-.14-.305-.222-.638-.389z"/></svg>
          Alt: +27 76 354 9713
        </motion.a>

        <motion.a
          href={WA_URL_PRIMARY}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ y: 80, opacity: 0, scale: 0.6 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 22 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.92 }}
          aria-label="Chat on WhatsApp"
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center shadow-lg"
          style={{
            background: "#25D366",
            boxShadow: "0 0 22px rgba(37,211,102,0.45)",
          }}
          onClick={() => setShowNudge(false)}
        >
          <svg viewBox="0 0 32 32" width="28" height="28" fill="white" xmlns="http://www.w3.org/2000/svg">
            <path d="M16.003 2.667C8.637 2.667 2.667 8.637 2.667 16.003c0 2.358.626 4.573 1.718 6.49L2.667 29.333l7.042-1.692a13.29 13.29 0 0 0 6.294 1.596c7.367 0 13.337-5.97 13.337-13.337 0-7.366-5.97-13.233-13.337-13.233zm0 24.267a11.06 11.06 0 0 1-5.614-1.528l-.403-.24-4.179 1.004.993-4.075-.264-.418A11.023 11.023 0 0 1 4.98 16.003c0-6.07 4.953-11.023 11.023-11.023 6.07 0 11.022 4.953 11.022 11.023 0 6.07-4.952 11.11-11.022 11.11zm6.068-8.252c-.333-.167-1.97-.972-2.274-1.083-.304-.111-.525-.167-.747.167-.22.333-.857 1.083-1.05 1.304-.195.222-.39.25-.723.083-.334-.167-1.41-.52-2.685-1.657-.992-.886-1.662-1.98-1.857-2.314-.195-.333-.021-.514.146-.68.15-.147.334-.389.5-.583.168-.194.222-.333.334-.555.11-.222.055-.416-.028-.583-.084-.167-.748-1.804-1.025-2.47-.27-.647-.547-.56-.747-.57-.194-.01-.416-.012-.638-.012-.222 0-.583.083-.889.417-.305.333-1.165 1.138-1.165 2.774 0 1.637 1.193 3.22 1.36 3.44.167.222 2.35 3.59 5.694 5.035.796.344 1.417.549 1.9.703.799.254 1.527.218 2.102.132.641-.096 1.97-.806 2.249-1.584.277-.778.277-1.444.194-1.584-.083-.14-.305-.222-.638-.389z"/>
          </svg>
        </motion.a>
      </div>
    </>
  );
}
