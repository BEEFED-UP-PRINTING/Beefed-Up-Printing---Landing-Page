import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft, Dna, Check } from "lucide-react";

const COLOUR_OPTIONS = [
  { label: "Neon Orange", hex: "#f97316" },
  { label: "Electric Red", hex: "#ef4444" },
  { label: "Gold", hex: "#eab308" },
  { label: "Forest Green", hex: "#22c55e" },
  { label: "Ice Blue", hex: "#38bdf8" },
  { label: "Deep Purple", hex: "#a855f7" },
  { label: "Chalk White", hex: "#f4f4f5" },
  { label: "Midnight Black", hex: "#09090b" },
  { label: "Chrome Silver", hex: "#a1a1aa" },
  { label: "Rust Brown", hex: "#92400e" },
];

const MUSIC_OPTIONS = [
  "Hip-Hop", "Gqom", "Amapiano", "Kwaito", "Trap", "Drill",
  "R&B", "Afrobeats", "Reggae", "Jazz", "House", "Punk",
];

const VIBE_OPTIONS = [
  "Street / Grunge", "Minimalist", "Bold & Loud", "Afrocentric",
  "Futuristic", "Vintage / Retro", "Luxury", "Underground",
  "Nature / Earthy", "Comic / Anime", "Spiritual", "Tech / Cyber",
];

const KEYWORD_OPTIONS = [
  "Graffiti", "Camo", "Typography", "Abstract", "Geometric",
  "Portraits", "Animals", "Flames", "Clouds", "Chains",
  "Crowns", "Maps", "Flags", "Symbols", "Patterns",
];

interface Props {
  onClose: () => void;
  onSave: (data: {
    favouriteColours: string[];
    musicGenres: string[];
    styleVibes: string[];
    designKeywords: string[];
    rawNotes: string;
  }) => Promise<void>;
}

const steps = ["Colours", "Music", "Vibes", "Keywords", "Notes"];

export default function DesignDNAOnboarding({ onClose, onSave }: Props) {
  const [step, setStep] = useState(0);
  const [colours, setColours] = useState<string[]>([]);
  const [music, setMusic] = useState<string[]>([]);
  const [vibes, setVibes] = useState<string[]>([]);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  function toggle<T>(arr: T[], val: T, set: (v: T[]) => void, max = 5) {
    if (arr.includes(val)) set(arr.filter((x) => x !== val));
    else if (arr.length < max) set([...arr, val]);
  }

  async function handleSave() {
    setSaving(true);
    await onSave({ favouriteColours: colours, musicGenres: music, styleVibes: vibes, designKeywords: keywords, rawNotes: notes });
    setSaving(false);
  }

  const canNext = [
    colours.length > 0,
    music.length > 0,
    vibes.length > 0,
    keywords.length > 0,
    true,
  ][step];

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-xl bg-zinc-950 border border-zinc-800 shadow-2xl overflow-hidden"
        style={{ boxShadow: "0 0 40px rgba(249,115,22,0.15)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <Dna size={22} className="text-primary" />
            <div>
              <h2 className="font-display font-bold text-lg tracking-widest uppercase text-white">Design DNA</h2>
              <p className="text-zinc-400 text-xs tracking-wide">Step {step + 1} of {steps.length} — {steps[step]}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-primary transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-zinc-800">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Step content */}
        <div className="px-6 py-6 min-h-[300px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {step === 0 && (
                <>
                  <p className="text-zinc-300 text-sm mb-4 font-sans">Pick up to 5 colours that represent your style.</p>
                  <div className="flex flex-wrap gap-2">
                    {COLOUR_OPTIONS.map((c) => {
                      const selected = colours.includes(c.label);
                      return (
                        <button
                          key={c.label}
                          onClick={() => toggle(colours, c.label, setColours)}
                          className={`flex items-center gap-2 px-3 py-2 border text-xs font-sans font-semibold tracking-wide transition-all ${selected ? "border-primary text-white" : "border-zinc-700 text-zinc-400 hover:border-zinc-500"}`}
                        >
                          <span className="w-3 h-3 rounded-full inline-block border border-zinc-700" style={{ background: c.hex }} />
                          {c.label}
                          {selected && <Check size={10} className="text-primary" />}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
              {step === 1 && (
                <>
                  <p className="text-zinc-300 text-sm mb-4 font-sans">What's always in your ears? Pick up to 5.</p>
                  <div className="flex flex-wrap gap-2">
                    {MUSIC_OPTIONS.map((m) => {
                      const selected = music.includes(m);
                      return (
                        <button
                          key={m}
                          onClick={() => toggle(music, m, setMusic)}
                          className={`px-4 py-2 border text-xs font-display font-bold tracking-widest uppercase transition-all ${selected ? "border-primary text-primary bg-primary/10" : "border-zinc-700 text-zinc-400 hover:border-zinc-500"}`}
                        >
                          {m}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
              {step === 2 && (
                <>
                  <p className="text-zinc-300 text-sm mb-4 font-sans">What's your aesthetic? Pick up to 4.</p>
                  <div className="flex flex-wrap gap-2">
                    {VIBE_OPTIONS.map((v) => {
                      const selected = vibes.includes(v);
                      return (
                        <button
                          key={v}
                          onClick={() => toggle(vibes, v, setVibes, 4)}
                          className={`px-4 py-2 border text-xs font-display font-bold tracking-widest uppercase transition-all ${selected ? "border-primary text-primary bg-primary/10" : "border-zinc-700 text-zinc-400 hover:border-zinc-500"}`}
                        >
                          {v}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
              {step === 3 && (
                <>
                  <p className="text-zinc-300 text-sm mb-4 font-sans">What design elements do you love? Pick up to 5.</p>
                  <div className="flex flex-wrap gap-2">
                    {KEYWORD_OPTIONS.map((k) => {
                      const selected = keywords.includes(k);
                      return (
                        <button
                          key={k}
                          onClick={() => toggle(keywords, k, setKeywords)}
                          className={`px-4 py-2 border text-xs font-display font-bold tracking-widest uppercase transition-all ${selected ? "border-primary text-primary bg-primary/10" : "border-zinc-700 text-zinc-400 hover:border-zinc-500"}`}
                        >
                          {k}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
              {step === 4 && (
                <>
                  <p className="text-zinc-300 text-sm mb-4 font-sans">Anything else BUP should know about your style? (optional)</p>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. I rep Soweto, love old school Kwaito vibes, always wear oversized fits..."
                    rows={5}
                    className="w-full bg-zinc-900 border border-zinc-700 text-white text-sm font-sans p-3 focus:outline-none focus:border-primary placeholder:text-zinc-600 resize-none"
                  />
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800">
          <button
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 0}
            className="flex items-center gap-1 text-zinc-500 hover:text-white transition-colors disabled:opacity-30 text-sm font-sans"
          >
            <ChevronLeft size={16} /> Back
          </button>
          {step < steps.length - 1 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              disabled={!canNext}
              className="flex items-center gap-1 bg-primary text-black font-display font-bold text-sm tracking-widest uppercase px-6 py-2 disabled:opacity-30 hover:bg-orange-400 transition-colors"
            >
              Next <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-primary text-black font-display font-bold text-sm tracking-widest uppercase px-6 py-2 hover:bg-orange-400 transition-colors disabled:opacity-60"
            >
              {saving ? "Saving..." : (
                <><Check size={16} /> Lock In My DNA</>
              )}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
