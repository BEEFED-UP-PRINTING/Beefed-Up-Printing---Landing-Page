import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calculator, ChevronRight, ChevronLeft, CheckCircle2, MessageSquare } from "lucide-react";

const PRODUCTS = [
  { id: "tee", label: "T-Shirt", icon: "👕", desc: "Standard or oversized fit" },
  { id: "hoodie", label: "Hoodie", icon: "🧥", desc: "Pullover or zip-up" },
  { id: "cap", label: "Cap / Hat", icon: "🧢", desc: "Snapback, dad cap, bucket" },
  { id: "sticker", label: "Sticker Pack", icon: "🎨", desc: "Die-cut, holographic, vinyl" },
  { id: "poster", label: "Poster", icon: "🖼️", desc: "A1, A2, A3 — gloss or matte" },
];

const METHODS: Record<string, { id: string; label: string; desc: string }[]> = {
  tee: [
    { id: "screen", label: "Screen Print", desc: "Best for bold, solid designs. Most cost-effective at volume." },
    { id: "dtf", label: "DTF Transfer", desc: "Full colour. Photorealistic. Perfect for detailed artwork." },
    { id: "embroidery", label: "Embroidery", desc: "Premium textured feel. Logos and text only." },
  ],
  hoodie: [
    { id: "screen", label: "Screen Print", desc: "Bold front/back prints at scale." },
    { id: "dtf", label: "DTF Transfer", desc: "Full colour, photographic detail." },
    { id: "embroidery", label: "Embroidery", desc: "Premium chest logo or sleeve branding." },
  ],
  cap: [
    { id: "embroidery", label: "Embroidery", desc: "Classic structured logo stitching." },
    { id: "dtf", label: "DTF Patch", desc: "Full colour patch heat-applied to cap." },
    { id: "screen", label: "Screen Print", desc: "Flat graphic on panels." },
  ],
  sticker: [
    { id: "diecut", label: "Die-Cut Vinyl", desc: "Custom shape cut around your design." },
    { id: "holographic", label: "Holographic", desc: "Eye-catching foil effect. Premium finish." },
    { id: "digital", label: "Digital Print", desc: "Rectangle/circle. Full colour. Fast turnaround." },
  ],
  poster: [
    { id: "digital", label: "Digital Print", desc: "Vibrant CMYK. Gloss or matte finish." },
    { id: "screen", label: "Screen Print", desc: "Risograph-style. Limited colour. Collector feel." },
  ],
};

const PRICING: Record<string, Record<string, Record<string, number>>> = {
  tee: {
    screen:     { "1-9": 320, "10-24": 240, "25-49": 185, "50-99": 155, "100+": 130 },
    dtf:        { "1-9": 280, "10-24": 220, "25-49": 175, "50-99": 148, "100+": 125 },
    embroidery: { "1-9": 380, "10-24": 300, "25-49": 250, "50-99": 210, "100+": 180 },
  },
  hoodie: {
    screen:     { "1-9": 480, "10-24": 380, "25-49": 310, "50-99": 270, "100+": 230 },
    dtf:        { "1-9": 450, "10-24": 360, "25-49": 295, "50-99": 255, "100+": 215 },
    embroidery: { "1-9": 550, "10-24": 440, "25-49": 365, "50-99": 315, "100+": 270 },
  },
  cap: {
    embroidery: { "1-9": 280, "10-24": 220, "25-49": 175, "50-99": 148, "100+": 120 },
    dtf:        { "1-9": 240, "10-24": 185, "25-49": 150, "50-99": 125, "100+": 105 },
    screen:     { "1-9": 220, "10-24": 170, "25-49": 138, "50-99": 115, "100+": 95 },
  },
  sticker: {
    diecut:      { "1-9": 35, "10-24": 25, "25-49": 18, "50-99": 14, "100+": 10 },
    holographic: { "1-9": 50, "10-24": 38, "25-49": 28, "50-99": 22, "100+": 17 },
    digital:     { "1-9": 22, "10-24": 16, "25-49": 12, "50-99": 9,  "100+": 7  },
  },
  poster: {
    digital: { "1-9": 95, "10-24": 72, "25-49": 58, "50-99": 46, "100+": 38 },
    screen:  { "1-9": 140, "10-24": 105, "25-49": 82, "50-99": 65, "100+": 52 },
  },
};

const QTY_TIERS = ["1-9", "10-24", "25-49", "50-99", "100+"] as const;
type QtyTier = typeof QTY_TIERS[number];

const QTY_MID: Record<QtyTier, number> = {
  "1-9": 5, "10-24": 17, "25-49": 37, "50-99": 75, "100+": 150,
};

const steps = ["Product", "Print Method", "Quantity"] as const;

export default function QuoteCalculator() {
  const [step, setStep] = useState(0);
  const [product, setProduct] = useState<string | null>(null);
  const [method, setMethod] = useState<string | null>(null);
  const [qty, setQty] = useState<QtyTier | null>(null);

  const unitPrice = useMemo(() => {
    if (!product || !method || !qty) return null;
    return PRICING[product]?.[method]?.[qty] ?? null;
  }, [product, method, qty]);

  const totalPrice = useMemo(() => {
    if (!unitPrice || !qty) return null;
    return unitPrice * QTY_MID[qty];
  }, [unitPrice, qty]);

  const canNext = [!!product, !!method, !!qty][step];

  function reset() { setStep(0); setProduct(null); setMethod(null); setQty(null); }

  const methods = product ? METHODS[product] ?? [] : [];

  const whatsappMsg = useMemo(() => {
    if (!product || !method || !qty) return "";
    const prod = PRODUCTS.find((p) => p.id === product);
    const meth = methods.find((m) => m.id === method);
    return encodeURIComponent(
      `Hi BUP! I used the quote calculator:\nProduct: ${prod?.label}\nPrint: ${meth?.label}\nQuantity: ${qty}\nEstimated unit price: R${unitPrice}\n\nCan we talk about my order?`
    );
  }, [product, method, qty, unitPrice, methods]);

  return (
    <section id="quote" className="py-24 px-4 sm:px-6 bg-zinc-950 border-t border-zinc-900">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-primary text-xs font-sans tracking-[0.3em] uppercase mb-3">Instant Pricing</p>
          <h2 className="font-display font-black text-4xl sm:text-5xl uppercase text-white leading-none mb-4">
            Quote <span className="text-primary">Calculator</span>
          </h2>
          <p className="text-zinc-500 text-sm font-sans">
            Get an instant price estimate. No forms, no waiting. All prices in ZAR.
          </p>
        </div>

        <div className="border border-zinc-800 bg-black" style={{ boxShadow: "0 0 40px rgba(249,115,22,0.06)" }}>
          {/* Progress */}
          <div className="flex border-b border-zinc-800">
            {steps.map((s, i) => (
              <div
                key={s}
                className={`flex-1 py-3 text-center text-[10px] font-display font-bold tracking-widest uppercase transition-colors ${
                  i === step ? "text-primary border-b-2 border-primary -mb-px" :
                  i < step ? "text-zinc-400" : "text-zinc-700"
                }`}
              >
                {i < step ? "✓ " : ""}{s}
              </div>
            ))}
          </div>

          <div className="p-6 min-h-[280px]">
            <AnimatePresence mode="wait">
              {/* Step 0 — Product */}
              {step === 0 && (
                <motion.div key="s0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <p className="text-zinc-400 text-sm font-sans mb-5">What are you printing on?</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {PRODUCTS.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => { setProduct(p.id); setMethod(null); }}
                        className={`p-4 border text-left transition-all ${
                          product === p.id
                            ? "border-primary bg-primary/10"
                            : "border-zinc-800 hover:border-zinc-600"
                        }`}
                      >
                        <div className="text-2xl mb-2">{p.icon}</div>
                        <div className="font-display font-bold text-sm text-white tracking-wide">{p.label}</div>
                        <div className="text-zinc-500 text-[11px] font-sans mt-0.5">{p.desc}</div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Step 1 — Method */}
              {step === 1 && (
                <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <p className="text-zinc-400 text-sm font-sans mb-5">How do you want it printed?</p>
                  <div className="space-y-3">
                    {methods.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setMethod(m.id)}
                        className={`w-full p-4 border text-left transition-all flex items-start justify-between gap-3 ${
                          method === m.id
                            ? "border-primary bg-primary/10"
                            : "border-zinc-800 hover:border-zinc-600"
                        }`}
                      >
                        <div>
                          <div className="font-display font-bold text-sm text-white tracking-wide">{m.label}</div>
                          <div className="text-zinc-500 text-[11px] font-sans mt-0.5 leading-relaxed">{m.desc}</div>
                        </div>
                        {method === m.id && <CheckCircle2 size={18} className="text-primary shrink-0 mt-0.5" />}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Step 2 — Quantity + Price */}
              {step === 2 && (
                <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <p className="text-zinc-400 text-sm font-sans mb-5">How many units?</p>
                  <div className="flex flex-wrap gap-2 mb-8">
                    {QTY_TIERS.map((t) => {
                      const price = product && method ? PRICING[product]?.[method]?.[t] : null;
                      return (
                        <button
                          key={t}
                          onClick={() => setQty(t)}
                          className={`flex-1 min-w-[90px] py-3 border text-center transition-all ${
                            qty === t
                              ? "border-primary bg-primary/10"
                              : "border-zinc-800 hover:border-zinc-600"
                          }`}
                        >
                          <div className="font-display font-bold text-sm text-white">{t}</div>
                          {price && (
                            <div className="text-[10px] font-sans text-zinc-400 mt-0.5">R{price}/unit</div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Live price */}
                  <AnimatePresence>
                    {unitPrice && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border border-primary/30 bg-primary/5 p-5"
                        style={{ boxShadow: "0 0 20px rgba(249,115,22,0.1)" }}
                      >
                        <div className="flex items-end justify-between mb-3">
                          <div>
                            <p className="text-zinc-400 text-xs font-sans uppercase tracking-wider mb-1">Unit Price</p>
                            <p className="font-display font-black text-3xl text-primary">R{unitPrice}</p>
                          </div>
                          {totalPrice && (
                            <div className="text-right">
                              <p className="text-zinc-400 text-xs font-sans uppercase tracking-wider mb-1">Est. Total ({qty})</p>
                              <p className="font-display font-bold text-xl text-white">R{totalPrice.toLocaleString()}</p>
                            </div>
                          )}
                        </div>
                        <p className="text-zinc-600 text-[10px] font-sans mb-4">
                          * Estimates only. Final quote depends on artwork complexity, colours and delivery. VAT excluded.
                        </p>
                        <div className="flex gap-3">
                          <a
                            href="#contact"
                            className="flex-1 flex items-center justify-center gap-2 bg-primary text-black font-display font-bold text-xs tracking-widest uppercase py-3 hover:bg-orange-400 transition-colors"
                          >
                            <Calculator size={14} /> Get Formal Quote
                          </a>
                          <a
                            href={`https://wa.me/27000000000?text=${whatsappMsg}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 border border-zinc-700 text-zinc-300 hover:border-primary hover:text-primary font-display font-bold text-xs tracking-widest uppercase px-4 transition-colors"
                          >
                            <MessageSquare size={14} /> WhatsApp
                          </a>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer nav */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-900">
            <button
              onClick={step === 0 ? reset : () => setStep((s) => s - 1)}
              className="flex items-center gap-1 text-zinc-500 hover:text-white transition-colors text-sm font-sans disabled:opacity-30"
              disabled={step === 0}
            >
              <ChevronLeft size={16} /> Back
            </button>
            {step < 2 ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                disabled={!canNext}
                className="flex items-center gap-1 bg-primary text-black font-display font-bold text-xs tracking-widest uppercase px-6 py-2.5 hover:bg-orange-400 transition-colors disabled:opacity-30"
              >
                Next <ChevronRight size={16} />
              </button>
            ) : (
              <button
                onClick={reset}
                className="text-zinc-500 hover:text-primary transition-colors text-xs font-sans"
              >
                Start Over
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
