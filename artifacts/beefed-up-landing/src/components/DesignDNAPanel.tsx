import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Dna, MessageCircle, Check, Copy } from "lucide-react";
import { useAuth } from "@workspace/replit-auth-web";
import DesignDNAOnboarding from "./DesignDNAOnboarding";
import DesignDNACard from "./DesignDNACard";
import DesignDNASuggestions from "./DesignDNASuggestions";

interface Profile {
  id: string;
  userId: string;
  favouriteColours: string[];
  musicGenres: string[];
  styleVibes: string[];
  designKeywords: string[];
  purchaseHistory: object[];
  projectHistory: object[];
  rawNotes?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Suggestion {
  id: string;
  userId: string;
  category: string;
  title: string;
  description: string;
  tags: string[];
  colourPalette: string[];
  dnaVersion: number;
  createdAt: string;
}

interface Props {
  onClose: () => void;
  onOpenMaggie?: () => void;
}

export default function DesignDNAPanel({ onClose, onOpenMaggie }: Props) {
  const { user, isAuthenticated, login } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchProfile = useCallback(async () => {
    setLoadingProfile(true);
    try {
      const res = await fetch("/api/dna/profile", { credentials: "include" });
      const data = await res.json();
      setProfile(data.profile);
      if (!data.profile) setShowOnboarding(true);
    } catch { /* ignore */ }
    setLoadingProfile(false);
  }, []);

  const fetchSuggestions = useCallback(async () => {
    setLoadingSuggestions(true);
    try {
      const res = await fetch("/api/dna/suggestions", { credentials: "include" });
      const data = await res.json();
      setSuggestions(data.suggestions ?? []);
    } catch { /* ignore */ }
    setLoadingSuggestions(false);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
      fetchSuggestions();
    } else {
      setLoadingProfile(false);
    }
  }, [isAuthenticated, fetchProfile, fetchSuggestions]);

  async function handleSaveProfile(data: {
    favouriteColours: string[];
    musicGenres: string[];
    styleVibes: string[];
    designKeywords: string[];
    rawNotes: string;
  }) {
    const res = await fetch("/api/dna/profile", {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    setProfile(json.profile);
    setShowOnboarding(false);
    handleGenerate();
  }

  async function handleGenerate() {
    setGenerating(true);
    try {
      const res = await fetch("/api/dna/suggestions", {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (data.suggestions) setSuggestions((prev) => [...data.suggestions, ...prev]);
    } catch { /* ignore */ }
    setGenerating(false);
  }

  function buildDNABrief(): string {
    if (!profile) return "";
    const name = (user as any)?.name ?? "a BUP customer";
    const lines = [
      `Hey Maggie! I'm ${name} and here's my Design DNA:`,
      profile.favouriteColours.length ? `🎨 Colours: ${profile.favouriteColours.join(", ")}` : "",
      profile.musicGenres.length ? `🎵 Music: ${profile.musicGenres.join(", ")}` : "",
      profile.styleVibes.length ? `🔥 Style vibes: ${profile.styleVibes.join(", ")}` : "",
      profile.designKeywords.length ? `✍️ Design keywords: ${profile.designKeywords.join(", ")}` : "",
      profile.rawNotes ? `📝 Notes: ${profile.rawNotes}` : "",
      "",
      "Can you help me design some merch that matches my vibe?",
    ];
    return lines.filter(Boolean).join("\n");
  }

  async function handleChatWithMaggie() {
    const brief = buildDNABrief();
    if (brief) {
      try {
        await navigator.clipboard.writeText(brief);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      } catch { /* clipboard may be blocked */ }
    }
    onClose();
    setTimeout(() => onOpenMaggie?.(), 300);
  }

  return (
    <>
      <div className="fixed inset-0 z-[70] flex">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

        {/* Slide-in panel */}
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "tween", duration: 0.3 }}
          className="relative ml-auto w-full max-w-sm h-full bg-zinc-950 border-l border-zinc-800 flex flex-col overflow-hidden"
          style={{ boxShadow: "-20px 0 60px rgba(0,0,0,0.8)" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 shrink-0">
            <div className="flex items-center gap-2">
              <Dna size={20} className="text-primary" />
              <div>
                <h2 className="font-display font-bold text-base tracking-widest uppercase text-white">Design DNA</h2>
                <p className="text-zinc-500 text-[11px] font-sans">Your personalised merch profile</p>
              </div>
            </div>
            <button onClick={onClose} className="text-zinc-500 hover:text-primary transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
            {!isAuthenticated ? (
              <div className="text-center py-10">
                <Dna size={36} className="text-zinc-700 mx-auto mb-3" />
                <p className="text-zinc-400 text-sm font-sans mb-4">
                  Log in to unlock your Design DNA — a style profile that gets smarter every time you order.
                </p>
                <button
                  onClick={login}
                  className="bg-primary text-black font-display font-bold text-xs tracking-widest uppercase px-6 py-2.5 hover:bg-orange-400 transition-colors"
                >
                  Log In To Continue
                </button>
              </div>
            ) : loadingProfile ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-32 bg-zinc-900 rounded" />
                <div className="h-24 bg-zinc-900 rounded" />
              </div>
            ) : (
              <>
                {profile ? (
                  <>
                    <DesignDNACard
                      profile={profile}
                      onEdit={() => setShowOnboarding(true)}
                      onGenerate={handleGenerate}
                      generating={generating}
                    />

                    {/* Maggie × DNA CTA */}
                    <button
                      onClick={handleChatWithMaggie}
                      className="w-full flex items-center justify-between gap-3 border border-zinc-800 hover:border-primary/50 bg-zinc-900/50 hover:bg-primary/5 px-4 py-3 transition-all group"
                      style={{ boxShadow: copied ? "0 0 16px rgba(249,115,22,0.2)" : "none" }}
                    >
                      <div className="flex items-center gap-2.5">
                        <MessageCircle size={16} className="text-primary shrink-0" />
                        <div className="text-left">
                          <p className="font-display font-bold text-xs tracking-widest uppercase text-white group-hover:text-primary transition-colors">
                            Chat with Maggie about my DNA
                          </p>
                          <p className="text-zinc-600 text-[10px] font-sans mt-0.5">
                            Opens Maggie · your brief is copied to clipboard
                          </p>
                        </div>
                      </div>
                      {copied ? (
                        <Check size={14} className="text-primary shrink-0" />
                      ) : (
                        <Copy size={12} className="text-zinc-600 shrink-0" />
                      )}
                    </button>
                  </>
                ) : (
                  <div className="border border-dashed border-zinc-700 p-6 text-center">
                    <Dna size={28} className="text-zinc-600 mx-auto mb-2" />
                    <p className="text-zinc-400 text-sm font-sans mb-3">
                      You haven't set up your Design DNA yet.
                    </p>
                    <button
                      onClick={() => setShowOnboarding(true)}
                      className="bg-primary text-black font-display font-bold text-xs tracking-widest uppercase px-5 py-2 hover:bg-orange-400 transition-colors"
                    >
                      Build My DNA
                    </button>
                  </div>
                )}

                <DesignDNASuggestions
                  suggestions={suggestions}
                  loading={loadingSuggestions}
                />
              </>
            )}
          </div>

          {/* Footer watermark */}
          <div className="px-5 py-3 border-t border-zinc-900 shrink-0">
            <p className="text-zinc-700 text-[10px] font-sans text-center tracking-widest uppercase">
              Powered by BUP AI · Gets smarter with every order
            </p>
          </div>
        </motion.div>
      </div>

      {/* Onboarding modal */}
      <AnimatePresence>
        {showOnboarding && (
          <DesignDNAOnboarding
            onClose={() => setShowOnboarding(false)}
            onSave={handleSaveProfile}
          />
        )}
      </AnimatePresence>
    </>
  );
}
