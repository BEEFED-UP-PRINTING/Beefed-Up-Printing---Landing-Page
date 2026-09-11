import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface BoomboxModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BoomboxModal({ isOpen, onClose }: BoomboxModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isOpen && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    } else if (!isOpen && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex items-center justify-center"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 30 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="relative z-10 w-[92vw] max-w-3xl rounded-2xl overflow-hidden border-2 border-primary shadow-[0_0_60px_rgba(249,115,22,0.5)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header bar */}
            <div className="flex items-center justify-between bg-zinc-950 px-5 py-3 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🎙️</span>
                <div>
                  <p className="text-white font-bold text-sm uppercase tracking-wider">Now Playing</p>
                  <p className="text-primary text-xs font-medium">Beefed Up Printing — Street Culture Vibes</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-zinc-400 hover:text-white transition-colors p-1 rounded-full hover:bg-zinc-800"
                aria-label="Close video"
              >
                <X size={22} />
              </button>
            </div>

            {/* Video */}
            <div className="bg-black aspect-video">
              <video
                ref={videoRef}
                src={`${import.meta.env.BASE_URL}video.mp4`}
                className="w-full h-full object-contain"
                controls
                playsInline
                loop
              />
            </div>

            {/* Footer */}
            <div className="bg-zinc-950 px-5 py-3 flex items-center gap-2">
              <div className="flex gap-[3px] items-end h-4">
                {[1,2,3,4,5].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ height: ["20%","100%","50%","80%","20%"] }}
                    transition={{ repeat: Infinity, duration: 0.6 + i * 0.12, ease: "easeInOut" }}
                    className="w-1 bg-primary rounded-t-sm"
                  />
                ))}
              </div>
              <span className="text-zinc-400 text-xs ml-2 font-mono tracking-widest uppercase">Live from the block</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
