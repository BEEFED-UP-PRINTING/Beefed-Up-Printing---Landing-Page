import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag } from "lucide-react";

const FILTERS = ["All", "Tees", "Hoodies", "Caps", "Stickers", "Posters"] as const;
type Filter = (typeof FILTERS)[number];

interface Project {
  id: number;
  category: Exclude<Filter, "All">;
  title: string;
  client: string;
  gradient: string;
  accent: string;
  tag: string;
  span?: "wide" | "tall";
}

const PROJECTS: Project[] = [
  {
    id: 1,
    category: "Tees",
    title: "Soweto Finest Drop",
    client: "Self-initiated",
    gradient: "from-orange-900/80 via-zinc-950 to-zinc-950",
    accent: "#f97316",
    tag: "Screen Print · 120 units",
  },
  {
    id: 2,
    category: "Hoodies",
    title: "Township Royalty",
    client: "Private Client",
    gradient: "from-red-900/70 via-zinc-950 to-zinc-950",
    accent: "#ef4444",
    tag: "DTF Print · 50 units",
    span: "tall",
  },
  {
    id: 3,
    category: "Stickers",
    title: "Mzansi Pack Vol.1",
    client: "Retail Drop",
    gradient: "from-yellow-900/70 via-zinc-950 to-zinc-950",
    accent: "#eab308",
    tag: "Die-Cut · 500 packs",
  },
  {
    id: 4,
    category: "Caps",
    title: "Drip Season 6-Panel",
    client: "Brand Collab",
    gradient: "from-purple-900/70 via-zinc-950 to-zinc-950",
    accent: "#a855f7",
    tag: "Embroidery · 80 units",
  },
  {
    id: 5,
    category: "Posters",
    title: "Afro Futurism Series",
    client: "Gallery Event",
    gradient: "from-sky-900/70 via-zinc-950 to-zinc-950",
    accent: "#38bdf8",
    tag: "A2 Gloss · 200 prints",
    span: "wide",
  },
  {
    id: 6,
    category: "Tees",
    title: "Hustle Never Sleeps",
    client: "Street Brand",
    gradient: "from-emerald-900/60 via-zinc-950 to-zinc-950",
    accent: "#22c55e",
    tag: "Screen Print · 200 units",
  },
  {
    id: 7,
    category: "Hoodies",
    title: "Block By Block Crew",
    client: "Youth Collective",
    gradient: "from-orange-950/80 via-red-950 to-zinc-950",
    accent: "#f97316",
    tag: "Embroidery + DTF · 35 units",
  },
  {
    id: 8,
    category: "Stickers",
    title: "Graffiti Gods Pack",
    client: "Art Collective",
    gradient: "from-pink-900/60 via-zinc-950 to-zinc-950",
    accent: "#ec4899",
    tag: "Holographic · 300 packs",
    span: "tall",
  },
  {
    id: 9,
    category: "Caps",
    title: "Street Royalty Snapback",
    client: "Streetwear Label",
    gradient: "from-zinc-800/80 via-zinc-950 to-zinc-950",
    accent: "#a1a1aa",
    tag: "Flat Embroidery · 60 units",
  },
];

export default function DropWall() {
  const [active, setActive] = useState<Filter>("All");
  const [hovered, setHovered] = useState<number | null>(null);

  const filtered = active === "All" ? PROJECTS : PROJECTS.filter((p) => p.category === active);

  return (
    <section
      id="drops"
      className="relative py-24 px-4 sm:px-6 bg-black border-t border-zinc-900"
    >
      {/* A quiet signature in the wall — part of the artwork, not a credit banner. */}
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
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <div>
            <p className="text-primary text-xs font-sans tracking-[0.3em] uppercase mb-2">The Wall</p>
            <h2 className="font-display font-black text-4xl sm:text-5xl md:text-6xl uppercase text-white leading-none">
              Drop<br />
              <span className="text-primary">History</span>
            </h2>
          </div>
          <p className="text-zinc-500 text-sm font-sans max-w-xs leading-relaxed">
            Every piece that left our shop. Custom, intentional, built to last.
          </p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 flex-wrap mb-8">
          {FILTERS.map((f) => (
            <button
              key={f}
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

        {/* Grid */}
        <motion.div layout className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((p) => (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.25 }}
                className={`relative overflow-hidden cursor-pointer group ${
                  p.span === "tall" ? "row-span-2" : p.span === "wide" ? "col-span-2" : ""
                }`}
                style={{ minHeight: p.span === "tall" ? 360 : 180 }}
                onMouseEnter={() => setHovered(p.id)}
                onMouseLeave={() => setHovered(null)}
              >
                {/* Gradient background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${p.gradient}`} />

                {/* Corner accent line */}
                <div
                  className="absolute top-0 left-0 w-full h-0.5 transition-all duration-300"
                  style={{
                    background: hovered === p.id ? p.accent : "transparent",
                    boxShadow: hovered === p.id ? `0 0 12px ${p.accent}` : "none",
                  }}
                />

                {/* Category pill */}
                <div className="absolute top-3 left-3">
                  <span
                    className="text-[10px] font-display font-bold tracking-widest uppercase px-2 py-0.5 border"
                    style={{ color: p.accent, borderColor: `${p.accent}40`, background: `${p.accent}10` }}
                  >
                    {p.category}
                  </span>
                </div>

                {/* BUP watermark */}
                <div
                  className="absolute inset-0 flex items-center justify-center font-display font-black text-[80px] md:text-[100px] select-none pointer-events-none transition-opacity duration-300"
                  style={{
                    color: `${p.accent}08`,
                    opacity: hovered === p.id ? 1 : 0.4,
                  }}
                >
                  BUP
                </div>

                {/* Info overlay */}
                <div className="absolute inset-0 flex flex-col justify-end p-4">
                  <motion.div
                    animate={{ y: hovered === p.id ? 0 : 8, opacity: hovered === p.id ? 1 : 0.7 }}
                    transition={{ duration: 0.2 }}
                  >
                    <p className="text-zinc-400 text-[10px] font-sans mb-1">{p.client}</p>
                    <h3 className="font-display font-bold text-white text-sm md:text-base uppercase leading-tight mb-2">
                      {p.title}
                    </h3>
                    <p className="text-zinc-500 text-[10px] font-sans tracking-wide">{p.tag}</p>
                  </motion.div>

                  <AnimatePresence>
                    {hovered === p.id && (
                      <motion.a
                        href="#contact"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="mt-3 flex items-center gap-1.5 text-[11px] font-display font-bold tracking-widest uppercase"
                        style={{ color: p.accent }}
                      >
                        <ShoppingBag size={11} /> Order Similar
                      </motion.a>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <p className="text-zinc-500 text-sm font-sans mb-4">Your drop could be next.</p>
          <a
            href="#contact"
            className="inline-block bg-primary text-black font-display font-bold text-sm tracking-widest uppercase px-10 py-3 hover:bg-orange-400 transition-colors"
            style={{ boxShadow: "0 0 24px rgba(249,115,22,0.3)" }}
          >
            Start Your Order
          </a>
        </div>
      </div>
    </section>
  );
}
