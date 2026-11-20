import { useEffect, useRef, useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send } from "lucide-react";
import { bupApiFetch, clearSessionToken, getApiErrorMessage, getSessionToken } from "@/lib/bup-api";
import MaggieUploadShare from "./MaggieUploadShare";
import { useBupAuth } from "@/hooks/use-bup-auth";

const APPEAR_DELAY_MS = 60_000;
const INITIAL_GREETING = "I'm Maggie. Tell me what you want to print, wear, or launch.";

/** Quick style tags sent with generate requests (optional). */
const STYLE_CHIPS = [
  "Street",
  "Minimal",
  "Afro-futurism",
  "Typography",
  "Graffiti",
  "Luxury",
  "Y2K",
  "Sports",
] as const;

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  image?: string;
};

type MaggieIntentMode = "chat" | "edit" | "generate";

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
    Array.isArray(value)
      ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
      : [];

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

/**
 * Classifies whether the user is chatting/asking a question vs. requesting an image edit or new design.
 */
function classifyMaggieIntent(
  prompt: string,
  hasNewAttachment: boolean,
  hasPriorImageInThread: boolean
): MaggieIntentMode {
  if (hasNewAttachment) return "edit";

  const text = prompt.trim().toLowerCase();

  // Explicit non-generation / conversational / critique / explanation intents
  const chatOnlyPatterns = [
    /^(hi|hello|hey|howzit|yo|sup|awe|sharp|what'?s\s+cooking|what'?s\s+up)\b[!.?\s]*$/i,
    /\b(didn'?t|did not)\s+ask\s+(for\s+)?(a\s+)?(design|image|pic|picture|logo)\b/i,
    /\b(describe|explain|tell me about|why did you|what did you do|what'?s wrong|check\s*in)\b/i,
    /\bnormal\s+hello\b/i,
  ];

  if (chatOnlyPatterns.some((rx) => rx.test(text))) {
    return "chat";
  }

  // Explicit visual generation / redesign / variation requests
  const designActionPatterns = [
    /\b(generate|create|design|draw|make|mock\s*up|mockup|render|sketch|illustrate)\b/i,
    /\b(alternative\s+version|new\s+version|redesign|variation|concept|logo|badge|graphic|print|hoodie|tee|t-?shirt|cap|sticker)\b/i,
    /\b(keep(ing)?\s+the\s+(logo|design|style)|better\s+than\s+the\s+original|change\s+(the\s+)?colou?rs?|lock\s+the)\b/i,
  ];

  if (designActionPatterns.some((rx) => rx.test(text))) {
    return hasPriorImageInThread ? "edit" : "generate";
  }

  // Default to conversational text reply unless user asks for a visual
  return "chat";
}

export default function MaggieSprayCan({ forceOpen = false, onForceClose, onOpenDNA }: Props) {
  const { user, isAuthenticated, isLoading: authLoading, login } = useBupAuth();
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [spraying, setSpraying] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: "assistant", content: INITIAL_GREETING }]);
  const [input, setInput] = useState("");
  const [pendingAttachment, setPendingAttachment] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [activeDnaBrief, setActiveDnaBrief] = useState("");
  const [hasSavedDna, setHasSavedDna] = useState(false);
  const [useDna, setUseDna] = useState(false);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [dnaLoading, setDnaLoading] = useState(false);
  const [dnaLoadedForUser, setDnaLoadedForUser] = useState<string | null>(null);
  const [dnaError, setDnaError] = useState<string | null>(null);
  const [chatError, setChatError] = useState<string | null>(null);
  const conversationOwner = useRef<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const chatContextLoading =
    authLoading || (open && isAuthenticated && (dnaLoading || !user?.id || dnaLoadedForUser !== user.id));
  const dnaBriefForRequest = useDna && activeDnaBrief ? activeDnaBrief : "";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  function toggleStyleChip(chip: string) {
    setSelectedStyles((prev) =>
      prev.includes(chip) ? prev.filter((c) => c !== chip) : prev.length < 3 ? [...prev, chip] : prev
    );
  }

  function buildMaggieBody(
    prompt: string,
    mode: MaggieIntentMode,
    extra: Record<string, unknown> = {}
  ) {
    return {
      prompt,
      mode,
      generateImage: mode !== "chat",
      useDna: useDna && hasSavedDna,
      dnaBrief: dnaBriefForRequest,
      styleChips: mode === "chat" ? [] : selectedStyles,
      conceptCount: mode === "chat" ? 0 : 1,
      ...extra,
    };
  }

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
      setUseDna(false);
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
        const data = (await response.json().catch(() => ({}))) as { profile?: DesignDnaProfile | null };
        if (!response.ok) {
          if (response.status === 401 || response.status === 403) clearSessionToken();
          throw new Error(getApiErrorMessage(data, "Couldn't load your saved Design DNA."));
        }
        const profile = data.profile ?? null;
        if (cancelled) return;
        setHasSavedDna(!!profile);
        setActiveDnaBrief(profile ? buildDnaBrief(profile, currentUser.firstName) : "");
        setMessages((previous) => {
          if (
            previous.length !== 1 ||
            previous[0].role !== "assistant" ||
            previous[0].content !== INITIAL_GREETING
          ) {
            return previous;
          }
          const firstName = currentUser.firstName?.trim() || "there";
          return [
            {
              role: "assistant",
              content: profile
                ? `Hey ${firstName}! Your Design DNA is saved. Turn on "Use my Design DNA" if you want Maggie to lean on it — otherwise she designs from your prompt only.`
                : `Hey ${firstName}! Tell me what you want to print, wear, or launch.`,
            },
          ];
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
  }, [forceOpen, open, authLoading, isAuthenticated]);

  function handleClose() {
    setOpen(false);
    onForceClose?.();
  }

  /** Attach only — do NOT auto-generate. User must type what they want done with the image. */
  function handleImageSelected(imageBase64: string) {
    if (sending || chatContextLoading) return;
    setPendingAttachment(imageBase64);
    setChatError(null);
  }

  function clearPendingAttachment() {
    setPendingAttachment(null);
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
    if (sending || chatContextLoading) return;
    if (!content) return;

    if (pendingAttachment && content.length < 4) {
      setChatError(
        'Tell Maggie what to do with your image (e.g. "keep the JHB logo structure and style, give me a cleaner alternative").'
      );
      return;
    }

    const attached = pendingAttachment;

    // Find the original uploaded user image and the most recent generated image in this thread
    const originalUserImage = [...messages].find((m) => m.role === "user" && m.image)?.image;
    const lastAssistantImage = [...messages].reverse().find((m) => m.role === "assistant" && m.image)?.image;
    const activeReferenceImage = attached || originalUserImage || lastAssistantImage;

    const intentMode = classifyMaggieIntent(content, !!attached, !!activeReferenceImage);

    // Always pass recent conversation history (for both logged-in and guest users)
    const history = messages.slice(-12).map(({ role, content: c, image }) => ({
      role,
      content: image ? `${c}\n[Image attached in turn]` : c,
    }));

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content,
        ...(attached ? { image: attached } : {}),
      },
    ]);
    setInput("");
    setPendingAttachment(null);
    setSending(true);
    setChatError(null);

    try {
      const extra: Record<string, unknown> = {
        history,
      };

      if (attached) {
        extra.image = attached;
      } else if (intentMode === "edit" && activeReferenceImage) {
        extra.image = activeReferenceImage;
      }

      if (originalUserImage) {
        extra.originalImage = originalUserImage;
      }
      if (lastAssistantImage) {
        extra.lastGeneratedImage = lastAssistantImage;
      }

      const res = await bupApiFetch("/api/maggie", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildMaggieBody(content, intentMode, extra)),
      });

      const data = (await res.json().catch(() => ({}))) as { reply?: unknown; image?: unknown };
      if (!res.ok) throw new Error(getApiErrorMessage(data, "Maggie is temporarily unavailable."));
      if (typeof data.reply !== "string" || !data.reply.trim()) {
        throw new Error("Maggie returned an empty reply. Please try again.");
      }

      const validReturnedImage =
        intentMode !== "chat" && typeof data.image === "string" && data.image.startsWith("data:image/")
          ? data.image
          : undefined;

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content: data.reply as string,
          ...(validReturnedImage ? { image: validReturnedImage } : {}),
        },
      ]);
    } catch (error) {
      setChatError(error instanceof Error ? error.message : "Maggie is temporarily unavailable.");
    } finally {
      setSending(false);
    }
  }

  const canSrc = `${import.meta.env.BASE_URL}maggie-can.jpeg`;
  const lastAssistantImg = [...messages].reverse().find((m) => m.role === "assistant" && m.image)?.image;

  return (
    <>
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
              <button
                onClick={handleClose}
                className="text-zinc-500 hover:text-primary transition-colors"
                aria-label="Close chat"
              >
                <X size={18} />
              </button>
            </div>

            <div className="bg-primary/10 border-b border-primary/20 px-4 py-2">
              <div className="text-[10px] font-sans text-orange-300 leading-relaxed space-y-2">
                {authLoading || (isAuthenticated && dnaLoading) ? (
                  <p>Loading your Design DNA…</p>
                ) : dnaError ? (
                  <p>{dnaError}</p>
                ) : hasSavedDna ? (
                  <>
                    <p>
                      {useDna
                        ? "Design DNA is ON — Maggie biases toward your saved style."
                        : "Design DNA is OFF — Maggie designs from your prompt only."}
                    </p>
                    <label className="flex items-center gap-2 cursor-pointer select-none text-orange-200">
                      <input
                        type="checkbox"
                        checked={useDna}
                        onChange={(e) => setUseDna(e.target.checked)}
                        className="accent-orange-500"
                      />
                      <span className="font-bold uppercase tracking-wide">Use my Design DNA</span>
                    </label>
                  </>
                ) : isAuthenticated ? (
                  <p>
                    Build your Design DNA so Maggie can tailor merch ideas.{" "}
                    <button
                      type="button"
                      onClick={onOpenDNA}
                      className="font-bold underline underline-offset-2 hover:text-white"
                    >
                      Open Design DNA
                    </button>
                  </p>
                ) : (
                  <p>
                    <button
                      type="button"
                      onClick={login}
                      className="font-bold underline underline-offset-2 hover:text-white"
                    >
                      Log in
                    </button>{" "}
                    and build your Design DNA so Maggie can suggest merch from your style.
                  </p>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {messages.map((message, index) => (
                <div
                  key={message.role + "-" + index}
                  className={"flex " + (message.role === "user" ? "justify-end" : "justify-start")}
                >
                  <div
                    className={
                      "max-w-[88%] rounded-lg px-3 py-2 text-xs leading-relaxed " +
                      (message.role === "user" ? "bg-primary text-black" : "bg-zinc-900 text-zinc-200")
                    }
                  >
                    {message.image && message.role === "user" && (
                      <img
                        src={message.image}
                        alt="Uploaded reference"
                        className="mb-2 max-h-40 w-auto rounded border border-black/20"
                      />
                    )}
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    {message.image && message.role === "assistant" && (
                      <a href={message.image} download="maggie-design.jpg" className="mt-2 block">
                        <img
                          src={message.image}
                          alt="Design concept from Maggie"
                          className="w-full rounded border border-zinc-700"
                        />
                        <span className="mt-1 block text-[10px] text-orange-300 underline">Tap to save</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}
              {sending && <p className="text-zinc-500 text-xs">Maggie is thinking…</p>}
              {chatError && <p className="text-red-400 text-[11px] leading-relaxed">{chatError}</p>}
              <div ref={messagesEndRef} />
            </div>

            <div className="px-3 pt-2 border-t border-zinc-800">
              <p className="text-[9px] font-sans uppercase tracking-widest text-zinc-500 mb-1.5">
                Style chips · up to 3
              </p>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {STYLE_CHIPS.map((chip) => {
                  const on = selectedStyles.includes(chip);
                  return (
                    <button
                      key={chip}
                      type="button"
                      disabled={sending}
                      onClick={() => toggleStyleChip(chip)}
                      className={`px-2 py-0.5 border text-[10px] font-display font-bold uppercase tracking-wide transition-colors ${
                        on
                          ? "border-primary text-primary bg-primary/10"
                          : "border-zinc-700 text-zinc-500 hover:border-zinc-500"
                      }`}
                    >
                      {chip}
                    </button>
                  );
                })}
              </div>
              <p className="text-[9px] text-zinc-600 font-sans mb-2">Maggie returns up to 3 concepts per ask.</p>
              <MaggieUploadShare
                onImageSelected={handleImageSelected}
                lastImageBase64={lastAssistantImg}
                apiBase="https://api.beefedupp.co.za"
                authToken={getSessionToken()}
                disabled={sending}
              />
            </div>

            {pendingAttachment && (
              <div className="mx-3 mb-2 flex items-center gap-2 rounded border border-primary/40 bg-zinc-900/80 p-2">
                <img
                  src={pendingAttachment}
                  alt="Attached reference"
                  className="h-12 w-12 shrink-0 rounded object-cover border border-zinc-700"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-display font-bold uppercase tracking-wide text-primary">
                    Image attached
                  </p>
                  <p className="text-[10px] text-zinc-400 truncate">
                    Type what you want Maggie to keep or change
                  </p>
                </div>
                <button
                  type="button"
                  onClick={clearPendingAttachment}
                  className="text-zinc-400 hover:text-white p-1"
                  aria-label="Remove attached image"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            <form onSubmit={handleSend} className="flex items-center gap-2 p-3 border-t border-zinc-800 bg-zinc-950">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  pendingAttachment
                    ? "Tell Maggie what to keep or change on this image..."
                    : "Chat with Maggie or ask for a concept..."
                }
                disabled={sending || chatContextLoading}
                className="flex-1 bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-primary"
              />
              <button
                type="submit"
                disabled={sending || chatContextLoading || !input.trim()}
                className="bg-primary text-black px-3 py-2 rounded font-display font-bold text-xs uppercase tracking-wider hover:bg-orange-400 transition-colors disabled:opacity-40"
                aria-label="Send message"
              >
                <Send size={14} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {visible && (
        <div className="fixed bottom-5 right-5 z-40 flex items-center gap-2">
          {showHint && !open && (
            <span className="rounded-full bg-zinc-900/95 border border-primary/40 px-3 py-1.5 text-[11px] font-sans text-orange-200 shadow-lg">
              Tap Maggie to design 1-of-1
            </span>
          )}
          <button
            type="button"
            onClick={handleTap}
            className="h-14 w-14 rounded-full overflow-hidden border-2 border-primary shadow-[0_0_20px_rgba(249,115,22,0.5)] hover:scale-105 transition-transform bg-black"
            aria-label="Open Maggie AI"
          >
            <img src={canSrc} alt="Maggie Spray Can" className="h-full w-full object-cover" />
          </button>
        </div>
      )}
    </>
  );
}
