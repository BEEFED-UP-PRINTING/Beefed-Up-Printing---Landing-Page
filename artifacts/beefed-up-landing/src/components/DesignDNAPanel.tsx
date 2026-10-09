import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Dna, MessageCircle, ArrowRight } from "lucide-react";
import { useBupAuth } from "@/hooks/use-bup-auth";
import { bupApiFetch, clearSessionToken, getApiErrorMessage } from "@/lib/bup-api";
import DesignDNAOnboarding from "./DesignDNAOnboarding";
import DesignDNACard from "./DesignDNACard";
import DesignDNASuggestions from "./DesignDNASuggestions";

interface Profile {
  id?: string;
  userId?: string;
  favouriteColours: string[];
  musicGenres: string[];
  styleVibes: string[];
  designKeywords: string[];
  rawNotes?: string | null;
  createdAt?: string;
  updatedAt?: string;
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
  const { isAuthenticated, login } = useBupAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [requestError, setRequestError] = useState("");

  const fetchProfile = useCallback(async () => {
    setLoadingProfile(true);
    setRequestError("");
    try {
      const res = await bupApiFetch("/api/dna/profile");
      const data = await res.json().catch(() => ({})) as { profile?: Profile | null };
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) clearSessionToken();
        throw new Error(getApiErrorMessage(data, "Couldn't load your Design DNA."));
      }
      const nextProfile = data.profile
        ? {
            ...data.profile,
            favouriteColours: Array.isArray(data.profile.favouriteColours) ? data.profile.favouriteColours : [],
            musicGenres: Array.isArray(data.profile.musicGenres) ? data.profile.musicGenres : [],
            styleVibes: Array.isArray(data.profile.styleVibes) ? data.profile.styleVibes : [],
            designKeywords: Array.isArray(data.profile.designKeywords) ? data.profile.designKeywords : [],
          }
        : null;
      setProfile(nextProfile);
      if (!nextProfile) setShowOnboarding(true);
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : "Couldn't load your Design DNA.");
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  const fetchSuggestions = useCallback(async () => {
    setLoadingSuggestions(true);
    try {
      const res = await bupApiFetch("/api/dna/suggestions");
      const data = await res.json().catch(() => ({})) as { suggestions?: Suggestion[] };
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) clearSessionToken();
        throw new Error(getApiErrorMessage(data, "Couldn't load your saved concepts."));
      }
      setSuggestions(data.suggestions ?? []);
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : "Couldn't load your saved concepts.");
    } finally {
      setLoadingSuggestions(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
      fetchSuggestions();
    } else {
      setProfile(null);
      setSuggestions([]);
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
    setRequestError("");
    const res = await bupApiFetch("/api/dna/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json().catch(() => ({})) as { profile?: Profile };
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) clearSessionToken();
      throw new Error(getApiErrorMessage(json, "Couldn't save your Design DNA."));
    }
    if (!json.profile) throw new Error("The account service did not return the saved profile.");
    setProfile({
      ...json.profile,
      favouriteColours: Array.isArray(json.profile.favouriteColours) ? json.profile.favouriteColours : [],
      musicGenres: Array.isArray(json.profile.musicGenres) ? json.profile.musicGenres : [],
      styleVibes: Array.isArray(json.profile.styleVibes) ? json.profile.styleVibes : [],
      designKeywords: Array.isArray(json.profile.designKeywords) ? json.profile.designKeywords : [],
    });
    setShowOnboarding(false);
    await handleGenerate();
  }

  async function handleGenerate() {
    setGenerating(true);
    setRequestError("");
    try {
      const res = await bupApiFetch("/api/dna/suggestions", { method: "POST" });
      const data = await res.json().catch(() => ({})) as { suggestions?: Suggestion[] };
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) clearSessionToken();
        throw new Error(getApiErrorMessage(data, "Couldn't generate new concepts."));
      }
      if (Array.isArray(data.suggestions)) {
        setSuggestions((previous) => [...data.suggestions!, ...previous]);
      }
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : "Couldn't generate new concepts.");
    } finally {
      setGenerating(false);
    }
  }

  function handleChatWithMaggie() {
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
            {requestError && (
              <p role="alert" className="border border-red-900/70 bg-red-950/40 px-3 py-2 text-xs leading-relaxed text-red-300">
                {requestError}
              </p>
            )}
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
                    >
                      <div className="flex items-center gap-2.5">
                        <MessageCircle size={16} className="text-primary shrink-0" />
                        <div className="text-left">
                          <p className="font-display font-bold text-xs tracking-widest uppercase text-white group-hover:text-primary transition-colors">
                            Chat with Maggie about my DNA
                          </p>
                          <p className="text-zinc-600 text-[10px] font-sans mt-0.5">
                            Opens Maggie · she loads your saved DNA automatically
                          </p>
                        </div>
                      </div>
                      <ArrowRight size={14} className="text-zinc-600 group-hover:text-primary shrink-0 transition-colors" />
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
