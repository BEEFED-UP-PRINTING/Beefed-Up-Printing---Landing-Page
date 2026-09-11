import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Music, ChevronDown, ChevronUp } from "lucide-react";

const SPOTIFY_PLAYLIST_URL = "https://open.spotify.com/embed/playlist/5bcH6RFmzLSBhdrEhxB0lG";
const SPOTIFY_APP_URL = "https://open.spotify.com/playlist/5bcH6RFmzLSBhdrEhxB0lG";

interface BoomboxPlaylistProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function BoomboxPlaylist({
  open,
  onOpenChange,
}: BoomboxPlaylistProps) {
  const [internalExpanded, setInternalExpanded] = useState(false);
  const expanded = open ?? internalExpanded;
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const setExpanded = (nextOpen: boolean) => {
    setInternalExpanded(nextOpen);
    onOpenChange?.(nextOpen);
  };

  // Auto-close when user clicks a track inside the iframe — we detect clicks on the document
  useEffect(() => {
    if (!expanded) return;
    // Spotify iframe doesn't emit events we can listen to, so we use a heuristic:
    // after 3 seconds of being expanded, if the user clicks anywhere outside the
    // boombox container, we close it. Tapping inside keeps it open.
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const container = document.getElementById("boombox-container");
      if (container && !container.contains(target)) {
        setExpanded(false);
      }
    };
    // Delay so the initial click that opened it doesn't immediately close it
    const t = setTimeout(() => {
      document.addEventListener("click", onDocClick);
    }, 300);
    return () => {
      clearTimeout(t);
      document.removeEventListener("click", onDocClick);
    };
  }, [expanded]);

  return (
    <div id="boombox-container" className="relative max-w-md mx-auto">
      {/* Compact header — always visible */}
      <motion.button
        onClick={() => setExpanded(!expanded)}
        whileTap={{ scale: 0.98 }}
        className="w-full flex items-center gap-3 border border-zinc-800 bg-zinc-950 px-4 py-3 text-left"
        style={{ boxShadow: "0 0 20px rgba(249,115,22,0.05)" }}
      >
        {/* Mini speaker icon */}
        <div className="relative w-9 h-9 shrink-0">
          <div className="absolute inset-0 rounded-full border border-zinc-700" />
          <div className="absolute inset-1 rounded-full bg-zinc-900 flex items-center justify-center">
            <Music size={14} className="text-primary" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-white text-[11px] font-display font-bold tracking-wider uppercase truncate">
            BUP Studio Vibes
          </p>
          <p className="text-zinc-600 text-[10px] font-sans truncate">
            Tap to open playlist · Spotify
          </p>
        </div>

        <span className="text-zinc-500">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </motion.button>

      {/* Dropdown — compact Spotify embed */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-x border-b border-zinc-800 bg-black"
          >
            {/* Compact embed: 80px = mini player, 152 = list view */}
            <iframe
              ref={iframeRef}
              src={`${SPOTIFY_PLAYLIST_URL}?utm_source=generator&theme=0`}
              width="100%"
              height="152"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              className="border-0"
              style={{ background: "#000" }}
            />
            <div className="px-3 py-2 flex items-center justify-between border-t border-zinc-800">
              <p className="text-zinc-600 text-[9px] font-sans">
                Want your track featured? DM us — we rotate monthly.
              </p>
              <a
                href={SPOTIFY_APP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[9px] font-sans text-primary hover:text-orange-400 transition-colors shrink-0"
              >
                Open in Spotify →
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
