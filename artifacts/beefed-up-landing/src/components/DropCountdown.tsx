import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bell, CheckCircle2 } from "lucide-react";

const DROP_DATE = new Date("2026-08-01T00:00:00+02:00"); // BUP Vol. 1 Drop Date

function getTimeLeft(target: Date) {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / 1000 / 60 / 60 / 24),
    hours: Math.floor((diff / 1000 / 60 / 60) % 24),
    minutes: Math.floor((diff / 1000 / 60) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function Digit({ value, label }: { value: number; label: string }) {
  const display = String(value).padStart(2, "0");
  return (
    <div className="flex flex-col items-center">
      <div
        className="w-16 sm:w-20 md:w-24 h-16 sm:h-20 md:h-24 flex items-center justify-center border border-zinc-800 bg-zinc-950 relative overflow-hidden"
        style={{ boxShadow: "inset 0 0 20px rgba(249,115,22,0.05)" }}
      >
        <span
          key={display}
          className="font-display font-black text-3xl sm:text-4xl md:text-5xl text-white tabular-nums"
          style={{ textShadow: "0 0 16px rgba(249,115,22,0.5)" }}
        >
          {display}
        </span>
        {/* Scanline */}
        <div className="absolute inset-x-0 top-1/2 h-px bg-zinc-800/60 pointer-events-none" />
      </div>
      <span className="text-zinc-600 text-[10px] font-sans uppercase tracking-widest mt-2">{label}</span>
    </div>
  );
}

export default function DropCountdown() {
  const [time, setTime] = useState(getTimeLeft(DROP_DATE));
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const t = setInterval(() => setTime(getTimeLeft(DROP_DATE)), 1000);
    return () => clearInterval(t);
  }, []);

  async function handleNotify(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/drops/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        setError("Something went wrong. Try again.");
      }
    } catch {
      setError("Something went wrong. Try again.");
    }
    setSubmitting(false);
  }

  return (
    <section
      id="next-drop"
      className="py-24 px-4 sm:px-6 relative overflow-hidden border-t border-zinc-900"
      style={{ background: "radial-gradient(ellipse at 50% 100%, rgba(249,115,22,0.06) 0%, transparent 70%)" }}
    >
      {/* Background text */}
      <div
        className="absolute inset-0 flex items-center justify-center font-display font-black text-[120px] sm:text-[180px] md:text-[220px] text-zinc-900/30 select-none pointer-events-none leading-none"
        aria-hidden
      >
        DROP
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 border border-primary/30 bg-primary/5 px-4 py-1.5 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-primary text-[11px] font-sans tracking-[0.25em] uppercase font-bold">Incoming</span>
          </div>
          <h2 className="font-display font-black text-4xl sm:text-5xl md:text-6xl uppercase text-white leading-none mb-4">
            BUP Vol.<span className="text-primary">1</span>
          </h2>
          <p className="text-zinc-400 font-sans text-sm max-w-md mx-auto">
            A limited collab drop. Street culture, printed proper. Be first — sign up to get notified the moment it drops.
          </p>
        </div>

        {/* Countdown */}
        <div className="flex items-center justify-center gap-3 sm:gap-4 mb-14">
          <Digit value={time.days} label="Days" />
          <span className="font-display font-black text-3xl text-primary pb-6">:</span>
          <Digit value={time.hours} label="Hours" />
          <span className="font-display font-black text-3xl text-primary pb-6">:</span>
          <Digit value={time.minutes} label="Mins" />
          <span className="font-display font-black text-3xl text-primary pb-6">:</span>
          <Digit value={time.seconds} label="Secs" />
        </div>

        {/* Email notify form */}
        <div className="max-w-md mx-auto">
          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-3 text-center border border-primary/30 bg-primary/5 px-6 py-6"
              style={{ boxShadow: "0 0 24px rgba(249,115,22,0.1)" }}
            >
              <CheckCircle2 size={28} className="text-primary" />
              <p className="font-display font-bold text-white tracking-widest uppercase text-sm">
                You're on the list
              </p>
              <p className="text-zinc-500 text-xs font-sans">
                We'll hit you up the moment BUP Vol.1 drops. Stay tuned.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleNotify} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 bg-zinc-950 border border-zinc-800 px-4 py-3 text-white placeholder-zinc-600 text-sm font-sans focus:outline-none focus:border-primary transition-colors"
              />
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center justify-center gap-2 bg-primary text-black font-display font-bold text-xs tracking-widest uppercase px-7 py-3 hover:bg-orange-400 transition-colors disabled:opacity-50 shrink-0"
                style={{ boxShadow: "0 0 20px rgba(249,115,22,0.3)" }}
              >
                <Bell size={14} />
                {submitting ? "Saving..." : "Notify Me"}
              </button>
            </form>
          )}
          {error && <p className="text-red-400 text-xs font-sans mt-2 text-center">{error}</p>}
          <p className="text-zinc-700 text-[10px] font-sans text-center mt-3 tracking-wide uppercase">
            No spam. Just the drop notification. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </section>
  );
}
