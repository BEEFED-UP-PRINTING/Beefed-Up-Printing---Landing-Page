import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { DROP_PROJECTS } from "./dropsAssets";

const FILTERS = ["All", "Tees", "Hoodies", "Caps", "Stickers", "Posters"] as const;
type Filter = (typeof FILTERS)[number];

const WA = "27763549713";

export default function DropWall() {
  const [active, setActive] = useState<Filter>("All");
  const [hovered, setHovered] = useState<number | null>(null);
  const [lightbox, setLightbox] = useState<(typeof DROP_PROJECTS)[0] | null>(null);

  const filtered =
    active === "All"
      ? DROP_PROJECTS
      : DROP_PROJECTS.filter((p) => p.category === active);

  return (
    <section
      id="drops"
      className="relative py-24 px-4 sm:px-6 bg-black border-t border-zinc-900"
    >
      <div
        aria-label="Signed Dev The Dude"
        className="pointer-events-none absolute right-5 top-7 rotate-[-8deg] select-none text-right sm:right-10 sm:top-10"
      >
        <p className="font-graffiti text-lg leading-none text-orange-300/60 sm:text-xl">
          Dev The Dude
        </p>
        <p className="mt-1 font-display text-[7px] uppercase tracking-[0.35em] text-zinc-600">
          BUP wall mark
        </p>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <div>
            <p className="text-primary text-xs font-sans tracking-[0.3em] uppercase mb-2">The Wall</p>
            <h2 className="font-display font-black text-4xl sm:text-5xl md:text-6xl uppercase text-white leading-none">
              Drop
              <br />
              <span className="text-primary">History</span>
            </h2>
          </div>
          <p className="text-zinc-500 text-sm font-sans max-w-xs leading-relaxed">
            Real jobs off the press. Custom, intentional, built to last. More drops coming.
          </p>
        </div>

        <div className="flex gap-2 flex-wrap mb-8">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setActive(f)}
              className={`px-4 py-1.5 text-xs font-display font-bold tracking-widest uppercase transition-all border ${
                active === f
                  ? "border-primary bg-primary text-black"
                  : "border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="text-zinc-600 text-sm font-sans py-16 text-center">
            No pieces in this lane yet — check back soon or order custom.
          </p>
        ) : (
          <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            <AnimatePresence mode="popLayout">
              {filtered.map((p) => (
                <motion.button
                  key={p.id}
                  type="button"
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.25 }}
                  className="relative overflow-hidden group aspect-[4/5] border border-zinc-800 bg-zinc-950 text-left"
                  onMouseEnter={() => setHovered(p.id)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => setLightbox(p)}
                >
                  <img
                    src={p.image}
                    alt={p.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/15 to-transparent" />

                  <div className="absolute top-3 left-3">
                    <span className="text-[10px] font-display font-bold tracking-widest uppercase px-2 py-0.5 border border-primary/40 text-primary bg-black/50">
                      {p.category}
                    </span>
                  </div>

                  <div className="absolute inset-x-0 bottom-0 p-3 md:p-4">
                    <h3 className="font-display font-bold text-white text-sm md:text-base uppercase leading-tight mb-1">
                      {p.title}
                    </h3>
                    <p className="text-zinc-400 text-[10px] font-sans tracking-wide">{p.tag}</p>
                    <AnimatePresence>
                      {hovered === p.id && (
                        <motion.span
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-display font-bold tracking-widest uppercase text-primary"
                        >
                          <ShoppingBag size={11} /> Order similar
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        <div className="mt-12 text-center">
          <p className="text-zinc-500 text-sm font-sans mb-4">Your drop could be next.</p>
          <a
            href={`https://wa.me/${WA}?text=${encodeURIComponent("Hey BUP! 👊 I want something like the drops on the wall. Can we chat?")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-primary text-black font-display font-bold text-sm tracking-widest uppercase px-10 py-3 hover:bg-orange-400 transition-colors"
            style={{ boxShadow: "0 0 24px rgba(249,115,22,0.3)" }}
          >
            Order on WhatsApp
          </a>
        </div>
      </div>

      <AnimatePresence>
        {lightbox && (
          <motion.div
            className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative max-w-lg w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img src={lightbox.image} alt={lightbox.title} className="w-full rounded border border-zinc-700" />
              <div className="mt-3 flex items-center justify-between gap-3">
                <div>
                  <p className="font-display font-bold text-white uppercase">{lightbox.title}</p>
                  <p className="text-zinc-500 text-xs">{lightbox.tag}</p>
                </div>
                <a
                  href={`https://wa.me/${WA}?text=${encodeURIComponent(`Hey BUP! I like the "${lightbox.title}" style — can we do something similar?`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 bg-primary text-black font-display font-bold text-xs tracking-widest uppercase px-4 py-2"
                >
                  Order similar
                </a>
              </div>
              <button
                type="button"
                className="absolute -top-3 -right-3 w-9 h-9 rounded-full bg-zinc-800 text-white text-lg"
                onClick={() => setLightbox(null)}
              >
                ×
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
