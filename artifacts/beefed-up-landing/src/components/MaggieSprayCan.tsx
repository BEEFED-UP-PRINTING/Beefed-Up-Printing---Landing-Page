import { useEffect, useRef, useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send } from "lucide-react";
import { bupApiFetch, clearSessionToken, getApiErrorMessage } from "@/lib/bup-api";
import { useBupAuth } from "@/hooks/use-bup-auth";
const APPEAR_DELAY_MS = 60_000;
const INITIAL_GREETING = "I'm Maggie. Tell me what you want to print, wear, or launch.";
type ChatMessage = { role: "user" | "assistant"; content: string; image?: string };
interface DesignDnaProfile {
  favouriteColours?: string[] | null;
  musicGenres?: string[] | null;
  styleVibes?: string[] | null;
  designKeywords?: string[] | null;
  rawNotes?: string | null;
}
interface Props {
  forceOpen?: boolean;
  onForceClose?: () => void;
  onOpenDNA?: () => void;
}
function buildDnaBrief(profile: DesignDnaProfile, firstName: string | null | undefined): string {
  const list = (value: string[] | null | undefined) =>
    Array.isArray(value) ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0) : [];
  const lines = [
    `Customer first name: ${firstName?.trim() || "not provided"}`,
    "Saved Design DNA:",
    list(profile.favouriteColours).length ? `Favourite colours: ${list(profile.favouriteColours).join(", ")}` : "",
    list(profile.musicGenres).length ? `Music genres: ${list(profile.musicGenres).join(", ")}` : "",
    list(profile.styleVibes).length ? `Style vibes: ${list(profile.styleVibes).join(", ")}` : "",
    list(profile.designKeywords).length ? `Design keywords: ${list(profile.designKeywords).join(", ")}` : "",
    profile.rawNotes?.trim() ? `Customer notes: ${profile.rawNotes.trim()}` : "",
  ];
  return lines.filter(Boolean).join("\n");
}

export default function MaggieSprayCan({ forceOpen = false, onForceClose, onOpenDNA }: Props) {
  const { user, isAuthenticated, isLoading: authLoading, login } = useBupAuth();
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [spraying, setSpraying] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([{
    role: "assistant",
    content: INITIAL_GREETING,
  }]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [activeDnaBrief, setActiveDnaBrief] = useState("");
  const [hasSavedDna, setHasSavedDna] = useState(false);
  const [dnaLoading, setDnaLoading] = useState(false);
  const [dnaLoadedForUser, setDnaLoadedForUser] = useState<string | null>(null);
  const [dnaError, setDnaError] = useState<string | null>(null);
  const [chatError, setChatError] = useState<string | null>(null);
  const conversationOwner = useRef<string | null>(null);

  const chatContextLoading = authLoading
    || (open && isAuthenticated && (dnaLoading || !user?.id || dnaLoadedForUser !== user.id));

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(true);
      setShowHint(true);
      const h = setTimeout(() => setShowHint(false), 6000);
      return () => clearTimeout(h);
    }, APPEAR_DELAY_MS);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (authLoading) return;
    const nextOwner = isAuthenticated && user?.id ? `user:${user.id}` : "guest";
    if (conversationOwner.current && conversationOwner.current !== nextOwner) {
      setMessages([{ role: "assistant", content: INITIAL_GREETING }]);
      setActiveDnaBrief("");
      setHasSavedDna(false);
      setDnaLoadedForUser(null);
      setDnaError(null);
    }
    conversationOwner.current = nextOwner;
  }, [authLoading, isAuthenticated, user?.id]);

  useEffect(() => {
    if (!open) {
      if (!isAuthenticated) {
        setActiveDnaBrief("");
        setHasSavedDna(false);
        setDnaLoadedForUser(null);
        setDnaLoading(false);
        setDnaError(null);
      }
      return;
    }

    if (authLoading) {
      setDnaLoading(true);
      setDnaLoadedForUser(null);
      return;
    }

    if (!isAuthenticated || !user || !user.id) {
      setActiveDnaBrief("");
      setHasSavedDna(false);
      setDnaLoadedForUser(null);
      setDnaLoading(false);
      setDnaError(null);
      return;
    }

    const currentUser = user;
    const controller = new AbortController();
    let cancelled = false;
    setDnaLoading(true);
    setDnaLoadedForUser(null);
    setActiveDnaBrief("");
    setHasSavedDna(false);
    setDnaError(null);

    async function loadSavedDna() {
      try {
        const response = await bupApiFetch("/api/dna/profile", { signal: controller.signal });
        const data = await response.json().catch(() => ({})) as { profile?: DesignDnaProfile | null };
        if (!response.ok) {
          if (response.status === 401 || response.status === 403) clearSessionToken();
          throw new Error(getApiErrorMessage(data, "Couldn't load your saved Design DNA."));
        }

        const profile = data.profile ?? null;
        if (cancelled) return;
        setHasSavedDna(!!profile);
        setActiveDnaBrief(profile ? buildDnaBrief(profile, currentUser.firstName) : "");
        setMessages((previous) => {
          if (previous.length !== 1 || previous[0].role !== "assistant" || previous[0].content !== INITIAL_GREETING) {
            return previous;
          }
          const firstName = currentUser.firstName?.trim() || "there";
          return [{
            role: "assistant",
            content: profile
              ? `Hey ${firstName}! Maggie already knows your Design DNA and can suggest merch ideas from it. What would you like to create?`
              : `Hey ${firstName}! Tell me what you want to print, wear, or launch.`,
          }];
        });
      } catch (error) {
        if (cancelled) return;
        setActiveDnaBrief("");
        setHasSavedDna(false);
        setDnaError(error instanceof Error ? error.message : "Couldn't load your saved Design DNA.");
      } finally {
        if (!cancelled) {
          setDnaLoadedForUser(currentUser.id);
          setDnaLoading(false);
        }
      }
    }

    void loadSavedDna();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [open, authLoading, isAuthenticated, user?.id, user?.firstName]);

  // When parent forces open (e.g. from DNA panel CTA)
  useEffect(() => {
    if (forceOpen && !open) {
      setDnaError(null);
      setDnaLoadedForUser(null);
      setDnaLoading(authLoading || isAuthenticated);
      setActiveDnaBrief("");
      setHasSavedDna(false);
      setVisible(true);
      setShowHint(false);
      setSpraying(true);
      setTimeout(() => {
        setOpen(true);
        setSpraying(false);
      }, 1100);
    }
  }, [forceOpen]);

  function handleClose() {
    setOpen(false);
    onForceClose?.();
  }

  const handleTap = () => {
    if (open) {
      handleClose();
      return;
    }
    setDnaError(null);
    setDnaLoadedForUser(null);
    setDnaLoading(authLoading || isAuthenticated);
    setActiveDnaBrief("");
    setHasSavedDna(false);
    setShowHint(false);
    setSpraying(true);
    setTimeout(() => {
      setOpen(true);
      setSpraying(false);
    }, 1100);
  };

  async function handleSend(event: FormEvent) {
    event.preventDefault();
    const content = input.trim();
    if (!content || sending || chatContextLoading) return;
    const history = isAuthenticated ? undefined : messages.slice(-10).map(({ role, content }) => ({ role, content }));
    const history = isAuthenticated ? undefined : messages.slice(-10);
    const nextMessages: ChatMessage[] = [...messages, { role: "user", content }];
    setMessages(nextMessages);
    setInput("");
    setSending(true);
    setChatError(null);
    try {
      const res = await bupApiFetch("/api/maggie", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: content,
          dnaBrief: activeDnaBrief,
          ...(!isAuthenticated ? { history } : {}),
        }),
      });
      const data = await res.json().catch(() => ({})) as { reply?: unknown; image?: unknown };
      if (!res.ok) throw new Error(getApiErrorMessage(data, "Maggie is temporarily unavailable."));
      if (typeof data.reply !== "string" || !data.reply.trim()) {
        throw new Error("Maggie returned an empty reply. Please try again.");
            }
      setMessages((previous) => [...previous, { role: "assistant", content: data.reply as string, ...(typeof data.image === "string" && data.image.startsWith("data:image/") ? { image: data.image } : {}) }]);
      const data = await res.json().catch(() => ({})) as { reply?: unknown };
      if (!res.ok) throw new Error(getApiErrorMessage(data, "Maggie is temporarily unavailable."));
      if (typeof data.reply !== "string" || !data.reply.trim()) {
        throw new Error("Maggie returned an empty reply. Please try again.");
      }
      setMessages((previous) => [...previous, { role: "assistant", content: data.reply as string }]);

    } catch (error) {
      setChatError(error instanceof Error ? error.message : "Maggie is temporarily unavailable.");
    } finally {
      setSending(false);
    }
  }

  const canSrc = `${import.meta.env.BASE_URL}maggie-can.jpeg`;

  return (
    <>
      {/* Spray paint splash + MAGGIE tag */}
      <AnimatePresence>
        {spraying && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 pointer-events-none flex items-center justify-center"
          >
            {Array.from({ length: 24 }).map((_, i) => {
              const angle = (i / 24) * Math.PI * 2;
              const dist = 90 + Math.random() * 140;
              return (
                <motion.span
                  key={i}
                  initial={{ x: 0, y: 0, opacity: 0.9, scale: 0 }}
                  animate={{
                    x: Math.cos(angle) * dist,
                    y: Math.sin(angle) * dist,
                    opacity: 0,
                    scale: 1 + Math.random() * 1.4,
                  }}
                  transition={{ duration: 0.9, ease: "easeOut" }}
                  className="absolute block rounded-full"
                  style={{
                    width: 10 + Math.random() * 10,
                    height: 10 + Math.random() * 10,
                    background:
                      i % 3 === 0
                        ? "rgba(249,115,22,0.85)"
                        : i % 3 === 1
                        ? "rgba(239,68,68,0.75)"
                        : "rgba(255,255,255,0.65)",
                    filter: "blur(2px)",
                  }}
                />
              );
            })}

            <motion.div
              initial={{ scale: 0.6, opacity: 0, rotate: -8 }}
              animate={{ scale: 1, opacity: 1, rotate: -6 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.25, duration: 0.5, ease: "backOut" }}
              className="font-graffiti text-7xl sm:text-9xl text-orange-500 select-none"
              style={{
                textShadow:
                  "0 0 18px rgba(249,115,22,0.95), 0 0 36px rgba(239,68,68,0.7), 4px 6px 0 rgba(0,0,0,0.8)",
                WebkitTextStroke: "2px rgba(0,0,0,0.6)",
              }}
            >
              MAGGIE
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="chat-panel"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
            className="fixed inset-0 z-50 md:inset-auto md:bottom-24 md:right-6 flex flex-col overflow-hidden bg-black md:rounded-xl border-2 border-primary shadow-[0_0_40px_rgba(249,115,22,0.35)]"
            style={{
              width: "min(420px, calc(100vw - 24px))",
              height: "min(640px, calc(100svh - 24px))",
            }}
          >
            <div className="flex items-center justify-between bg-zinc-950 px-4 py-3 border-b border-zinc-800 flex-shrink-0 pt-[calc(env(safe-area-inset-top)+12px)] md:pt-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="font-display font-bold text-sm tracking-widest uppercase text-white">
                  Maggie · Custom Designs
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleClose}
                  className="text-zinc-500 hover:text-primary transition-colors"
                  aria-label="Close chat"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Design DNA status */}
            <AnimatePresence>
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-primary/10 border-b border-primary/20 px-4 py-2 overflow-hidden"
              >
                <p className="text-[10px] font-sans text-orange-300 leading-relaxed">
                  {authLoading || (isAuthenticated && dnaLoading) ? (
                    "Loading your Design DNA…"
                  ) : dnaError ? (
                    dnaError
                  ) : hasSavedDna ? (
                    "Maggie already knows your Design DNA and can suggest merch ideas from it."
                  ) : isAuthenticated ? (
                    <>
                      Build your Design DNA so Maggie can tailor merch ideas.{" "}
                      <button type="button" onClick={onOpenDNA} className="font-bold underline underline-offset-2 hover:text-white">
                        Open Design DNA
                      </button>
                    </>
                  ) : (
                    <>
                      <button type="button" onClick={login} className="font-bold underline underline-offset-2 hover:text-white">
                        Log in
                      </button>{" "}
                      and build your Design DNA so Maggie can suggest merch from your style.
                    </>
                  )}
                </p>
              </motion.div>
            </AnimatePresence>

                        <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {messages.map((message, index) => (
                <div key={message.role + "-" + index} className={"flex " + (message.role === "user" ? "justify-end" : "justify-start")}>
                  <div className={"max-w-[88%] rounded-lg px-3 py-2 text-xs leading-relaxed " + (message.role === "user" ? "bg-primary text-black" : "bg-zinc-900 text-zinc-200")}>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    {message.image && (
                      <a href={message.image} download="maggie-design.jpg" className="mt-2 block">
                        <img src={message.image} alt="Design concept from Maggie" className="w-full rounded border border-zinc-700" />
                        <span className="mt-1 block text-[10px] text-orange-300 underline">Tap to save</span>
                      </a>
                    )}
                  </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {messages.map((message, index) => (
                <div key={message.role + "-" + index} className={"flex " + (message.role === "user" ? "justify-end" : "justify-start")}>
                  <p className={"max-w-[88%] rounded-lg px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap " + (message.role === "user" ? "bg-primary text-black" : "bg-zinc-900 text-zinc-200")}>
                    {message.content}
                  </p>

                </div>
              ))}
              {sending && <p className="text-zinc-500 text-xs">Maggie is thinking…</p>}
              {chatError && <p className="text-red-400 text-[11px] leading-relaxed">{chatError}</p>}
            </div>
            <form onSubmit={handleSend} className="flex gap-2 border-t border-zinc-800 p-3">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask Maggie for a concept…"
                className="min-w-0 flex-1 bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs text-white outline-none focus:border-primary"
                aria-label="Message Maggie"
              />
              <button type="submit" disabled={sending || chatContextLoading || !input.trim()} className="shrink-0 rounded bg-primary px-3 text-black disabled:opacity-40" aria-label="Send message">
                <Send size={15} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hint popup */}
      <AnimatePresence>
        {visible && showHint && !open && !spraying && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.35 }}
            className="fixed bottom-[78px] right-3 sm:right-5 z-40 max-w-[200px] pointer-events-none"
          >
            <div
              className="px-3 py-2 rounded-lg bg-zinc-950/95 backdrop-blur-sm border border-orange-500/50 text-[11px] uppercase tracking-wider font-bold text-orange-300"
              style={{
                textShadow: "0 0 8px rgba(249,115,22,0.6)",
                boxShadow: "0 0 14px rgba(249,115,22,0.3)",
              }}
            >
              Need help customising? <span className="text-white">Tap the can</span>
            </div>
            <div className="ml-auto mr-6 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-orange-500/50" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spray can button */}
      <AnimatePresence>
        {visible && (
          <motion.button
            onClick={handleTap}
            initial={{ y: 80, opacity: 0, scale: 0.6 }}
            animate={{
              y: 0,
              opacity: 1,
              scale: 1,
              rotate: spraying ? [-2, -22, -22, -2] : 0,
            }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{
              y: { type: "spring", stiffness: 200, damping: 22 },
              opacity: { duration: 0.4 },
              scale: { duration: 0.4 },
              rotate: { duration: 1.0, ease: "easeInOut" },
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.92 }}
            aria-label={open ? "Close Maggie" : "Tap to spray Maggie"}
            className="fixed bottom-4 right-3 sm:right-5 z-50 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-zinc-950 border-2 border-primary shadow-[0_0_22px_rgba(249,115,22,0.5)] overflow-hidden"
            style={{ transformOrigin: "bottom right" }}
          >
            {open ? (
              <span className="flex items-center justify-center w-full h-full text-primary">
                <X size={22} />
              </span>
            ) : (
              <img
                src={canSrc}
                alt="Maggie spray can"
                className="w-full h-full object-cover"
                draggable={false}
              />
            )}
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}