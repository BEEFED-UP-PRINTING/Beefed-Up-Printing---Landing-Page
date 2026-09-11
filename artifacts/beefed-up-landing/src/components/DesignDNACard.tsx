import { Dna, Edit2, Sparkles, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

interface Profile {
  id: string;
  favouriteColours: string[];
  musicGenres: string[];
  styleVibes: string[];
  designKeywords: string[];
  rawNotes?: string | null;
  updatedAt: string;
}

interface Props {
  profile: Profile;
  onEdit: () => void;
  onGenerate: () => void;
  generating: boolean;
}

const COLOUR_MAP: Record<string, string> = {
  "Neon Orange": "#f97316",
  "Electric Red": "#ef4444",
  "Gold": "#eab308",
  "Forest Green": "#22c55e",
  "Ice Blue": "#38bdf8",
  "Deep Purple": "#a855f7",
  "Chalk White": "#f4f4f5",
  "Midnight Black": "#09090b",
  "Chrome Silver": "#a1a1aa",
  "Rust Brown": "#92400e",
};

export default function DesignDNACard({ profile, onEdit, onGenerate, generating }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-zinc-800 bg-zinc-950/80 p-5"
      style={{ boxShadow: "0 0 30px rgba(249,115,22,0.08)" }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <Dna size={18} className="text-primary" />
          <span className="font-display font-bold text-sm tracking-widest uppercase text-white">Your Design DNA</span>
        </div>
        <button
          onClick={onEdit}
          className="flex items-center gap-1 text-zinc-500 hover:text-primary transition-colors text-xs font-sans"
        >
          <Edit2 size={12} /> Edit
        </button>
      </div>

      {/* Colours */}
      {profile.favouriteColours.length > 0 && (
        <div className="mb-3">
          <p className="text-zinc-500 text-xs font-sans mb-1.5 uppercase tracking-wider">Colours</p>
          <div className="flex gap-1.5 flex-wrap">
            {profile.favouriteColours.map((c) => (
              <span
                key={c}
                className="w-6 h-6 rounded-sm border border-zinc-700 inline-block"
                style={{ background: COLOUR_MAP[c] ?? "#888" }}
                title={c}
              />
            ))}
          </div>
        </div>
      )}

      {/* Music */}
      {profile.musicGenres.length > 0 && (
        <div className="mb-3">
          <p className="text-zinc-500 text-xs font-sans mb-1.5 uppercase tracking-wider">Music</p>
          <div className="flex flex-wrap gap-1.5">
            {profile.musicGenres.map((g) => (
              <span key={g} className="text-xs font-display font-bold tracking-wide text-primary border border-primary/30 bg-primary/5 px-2 py-0.5">
                {g}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Vibes */}
      {profile.styleVibes.length > 0 && (
        <div className="mb-3">
          <p className="text-zinc-500 text-xs font-sans mb-1.5 uppercase tracking-wider">Vibes</p>
          <div className="flex flex-wrap gap-1.5">
            {profile.styleVibes.map((v) => (
              <span key={v} className="text-xs font-sans text-zinc-300 border border-zinc-700 px-2 py-0.5">
                {v}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Keywords */}
      {profile.designKeywords.length > 0 && (
        <div className="mb-4">
          <p className="text-zinc-500 text-xs font-sans mb-1.5 uppercase tracking-wider">Design Elements</p>
          <div className="flex flex-wrap gap-1.5">
            {profile.designKeywords.map((k) => (
              <span key={k} className="text-xs font-sans text-zinc-400 border border-zinc-800 px-2 py-0.5">
                {k}
              </span>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={onGenerate}
        disabled={generating}
        className="w-full flex items-center justify-center gap-2 bg-primary text-black font-display font-bold text-xs tracking-widest uppercase py-2.5 hover:bg-orange-400 transition-colors disabled:opacity-60"
      >
        {generating ? (
          <><RefreshCw size={14} className="animate-spin" /> Generating...</>
        ) : (
          <><Sparkles size={14} /> Generate New Concepts</>
        )}
      </button>
    </motion.div>
  );
}
