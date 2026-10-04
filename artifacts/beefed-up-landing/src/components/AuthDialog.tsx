import { useEffect, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LogIn, UserPlus, X } from "lucide-react";
import {
  AUTH_OPEN_EVENT,
  bupApiFetch,
  getApiError,
  setSessionToken,
} from "@/lib/bup-api";

export default function AuthDialog() {
  const [open, setOpen] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const show = () => {
      setError("");
      setOpen(true);
    };
    window.addEventListener(AUTH_OPEN_EVENT, show);
    return () => window.removeEventListener(AUTH_OPEN_EVENT, show);
  }, []);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !submitting) setOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open, submitting]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setError("");
    try {
      const response = await bupApiFetch(registering ? "/api/register" : "/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
          ...(registering ? { firstName: firstName.trim(), lastName: lastName.trim() } : {}),
        }),
      });

      if (!response.ok) {
        throw new Error(await getApiError(response, "Sign-in failed. Please try again."));
      }

      const data = await response.json() as { token?: unknown };
      if (typeof data.token !== "string" || !data.token) {
        throw new Error("The account service did not return a sign-in session. Please try again.");
      }

      setSessionToken(data.token);
      setPassword("");
      setOpen(false);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Sign-in failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function close() {
    if (!submitting) setOpen(false);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-center justify-center px-4 py-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            aria-label="Close sign-in dialog"
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={close}
          />
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-labelledby="bup-auth-title"
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            className="relative w-full max-w-md border border-zinc-800 bg-zinc-950 p-6 shadow-2xl"
            style={{ boxShadow: "0 0 40px rgba(249,115,22,0.16)" }}
          >
            <button
              type="button"
              onClick={close}
              disabled={submitting}
              aria-label="Close"
              className="absolute right-4 top-4 text-zinc-500 transition-colors hover:text-primary disabled:opacity-40"
            >
              <X size={20} />
            </button>

            <div className="mb-6 pr-8">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.25em] text-primary">Beefed Up Printing</p>
              <h2 id="bup-auth-title" className="font-display text-xl font-bold uppercase tracking-widest text-white">
                {registering ? "Create your account" : "Welcome back"}
              </h2>
              <p className="mt-2 text-sm text-zinc-400">
                {registering ? "Save your Design DNA and keep your concepts close." : "Sign in to open your Design DNA profile."}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {registering && (
                <div className="grid grid-cols-2 gap-3">
                  <label className="block text-xs font-medium text-zinc-400">
                    First name <span className="text-zinc-600">(optional)</span>
                    <input
                      value={firstName}
                      onChange={(event) => setFirstName(event.target.value)}
                      autoComplete="given-name"
                      className="mt-1.5 w-full border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-sm text-white outline-none transition-colors focus:border-primary"
                    />
                  </label>
                  <label className="block text-xs font-medium text-zinc-400">
                    Last name <span className="text-zinc-600">(optional)</span>
                    <input
                      value={lastName}
                      onChange={(event) => setLastName(event.target.value)}
                      autoComplete="family-name"
                      className="mt-1.5 w-full border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-sm text-white outline-none transition-colors focus:border-primary"
                    />
                  </label>
                </div>
              )}

              <label className="block text-xs font-medium text-zinc-400">
                Email
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  required
                  className="mt-1.5 w-full border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-sm text-white outline-none transition-colors focus:border-primary"
                />
              </label>

              <label className="block text-xs font-medium text-zinc-400">
                Password
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete={registering ? "new-password" : "current-password"}
                  minLength={registering ? 6 : undefined}
                  required
                  className="mt-1.5 w-full border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-sm text-white outline-none transition-colors focus:border-primary"
                />
              </label>

              {error && (
                <p role="alert" className="border border-red-900/70 bg-red-950/40 px-3 py-2 text-sm text-red-300">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 bg-primary px-4 py-3 font-display text-sm font-bold uppercase tracking-widest text-black transition-colors hover:bg-orange-400 disabled:cursor-wait disabled:opacity-60"
              >
                {registering ? <UserPlus size={16} /> : <LogIn size={16} />}
                {submitting ? "Please wait..." : registering ? "Create account" : "Log in"}
              </button>
            </form>

            <button
              type="button"
              disabled={submitting}
              onClick={() => {
                setRegistering((value) => !value);
                setError("");
              }}
              className="mt-5 w-full text-center text-xs text-zinc-500 transition-colors hover:text-primary disabled:opacity-40"
            >
              {registering ? "Already have an account? Log in" : "New to BUP? Create an account"}
            </button>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}