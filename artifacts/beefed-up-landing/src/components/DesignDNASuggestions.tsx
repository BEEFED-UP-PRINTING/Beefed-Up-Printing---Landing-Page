import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Tag, Palette, ShoppingBag } from "lucide-react";

interface Suggestion {
  id: string;
  category: string;
  title: string;
  description: string;
  tags: string[];
  colourPalette: string[];
  createdAt: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  merch: "Merch Drop",
  sticker_pack: "Sticker Pack",
  poster: "Poster",
  hoodie: "Hoodie",
  cap: "Cap",
  tee: "Tee",
};

const CATEGORY_ICONS: Record<string, string> = {
  merch: "🧢",
  sticker_pack: "🎨",
  poster: "🖼️",
  hoodie: "🧥",
  cap: "🧢",
  tee: "👕",
};

interface Props {
  suggestions: Suggestion[];
  loading: boolean;
}

export default function DesignDNASuggestions({ suggestions, loading }: Props) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border border-zinc-800 bg-zinc-950/60 p-4 animate-pulse">
            <div className="h-3 w-20 bg-zinc-800 rounded mb-2" />
            <div className="h-4 w-3/4 bg-zinc-800 rounded mb-2" />
            <div className="h-10 w-full bg-zinc-800 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (suggestions.length === 0) {
    return (
      <div className="border border-dashed border-zinc-800 p-6 text-center">
        <Sparkles size={24} className="text-zinc-600 mx-auto mb-2" />
        <p className="text-zinc-500 text-sm font-sans">No concepts yet. Generate your first batch above.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-zinc-500 text-xs font-sans uppercase tracking-wider mb-3">
        AI-Generated Concepts — Based On Your DNA
      </p>
      <AnimatePresence>
        {suggestions.slice(0, 6).map((s, i) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="border border-zinc-800 bg-zinc-950/60 p-4 hover:border-zinc-700 transition-colors group"
          >
            {/* Category badge */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-display font-bold tracking-widest uppercase text-primary">
                {CATEGORY_ICONS[s.category] ?? "✦"} {CATEGORY_LABELS[s.category] ?? s.category}
              </span>
              {s.colourPalette.length > 0 && (
                <div className="flex gap-1">
                  {s.colourPalette.slice(0, 4).map((hex, idx) => (
                    <span
                      key={idx}
                      className="w-3.5 h-3.5 rounded-sm border border-zinc-700"
                      style={{ background: hex }}
                      title={hex}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Title */}
            <h4 className="font-display font-bold text-white text-sm tracking-wide mb-1.5 group-hover:text-primary transition-colors">
              {s.title}
            </h4>

            {/* Description */}
            <p className="text-zinc-400 text-xs font-sans leading-relaxed mb-3">
              {s.description}
            </p>

            {/* Tags */}
            {s.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {s.tags.map((t) => (
                  <span key={t} className="text-[10px] font-sans text-zinc-500 border border-zinc-800 px-1.5 py-0.5">
                    #{t}
                  </span>
                ))}
              </div>
            )}

            {/* Order CTA */}
            <a
              href="#contact"
              className="mt-3 flex items-center gap-1.5 text-[11px] font-display font-bold tracking-widest uppercase text-zinc-600 hover:text-primary transition-colors"
            >
              <ShoppingBag size={11} /> Order This Concept
            </a>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
