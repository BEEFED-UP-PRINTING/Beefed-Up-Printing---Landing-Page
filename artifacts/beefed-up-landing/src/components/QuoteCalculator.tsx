import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calculator, ChevronRight, ChevronLeft, CheckCircle2, MessageSquare } from "lucide-react";

const WHATSAPP = "27763549713";

const PRODUCTS = [
  { id: "tee", label: "T-Shirt", icon: "👕", desc: "Adult tee · A4 placement standard" },
  { id: "hoodie", label: "Hoodie", icon: "🧥", desc: "Pullover · garment included" },
  { id: "kids", label: "Kids / Onesie", icon: "🧒", desc: "2–4y tees & onesies" },
  { id: "cap", label: "Cap / Hat", icon: "🧢", desc: "Snapback, dad cap, bucket" },
  { id: "sticker", label: "Sticker Pack", icon: "🎨", desc: "Die-cut, holographic, vinyl" },
  { id: "poster", label: "Poster", icon: "🖼️", desc: "A1, A2, A3 — gloss or matte" },
];

const METHODS: Record<string, { id: string; label: string; desc: string }[]> = {
  tee: [
    { id: "single", label: "A4 Single Colour (HTV)", desc: "One colour cut vinyl. Best entry price. Matches our R160 catalogue starter." },
    { id: "full", label: "A4 Full Colour (Printable HTV)", desc: "Full colour printable vinyl. Photorealistic detail. From R190 with tee." },
    { id: "embroidery", label: "Embroidery", desc: "Premium textured feel. Logos and text. Quoted if complex." },
  ],
  hoodie: [
    { id: "single", label: "A4 One Colour Vinyl", desc: "1-colour vinyl on hoodie. From R290 with garment." },
    { id: "full", label: "A4 Full Colour Printable", desc: "Full colour ink / printable vinyl. From R320 with hoodie." },
    { id: "embroidery", label: "Embroidery", desc: "Chest logo or sleeve branding. Premium finish." },
  ],
  kids: [
    { id: "onesie", label: "Onesie + Print", desc: "Kiddies onesie with custom print. From R120." },
    { id: "tee", label: "Kids Tee 2–4y + Print", desc: "Custom kids tee. From R140." },
  ],
  cap: [
    { id: "embroidery", label: "Embroidery", desc: "Classic structured logo stitching." },
    { id: "full", label: "Full Colour Patch", desc: "Heat-applied full colour graphic." },
  ],
  sticker: [
    { id: "diecut", label: "Die-Cut Vinyl", desc: "Custom shape cut around your design." },
    { id: "holographic", label: "Holographic", desc: "Foil effect. Premium finish." },
    { id: "digital", label: "Digital Print", desc: "Rectangle/circle. Full colour. Fast." },
  ],
  poster: [
    { id: "digital", label: "Digital Print", desc: "Vibrant CMYK. Gloss or matte." },
    { id: "screen", label: "Screen Print", desc: "Limited colour. Collector feel." },
  ],
};

// Unit prices in ZAR — aligned to WhatsApp catalogue floors for 1–9, then volume breaks
const PRICING: Record<string, Record<string, Record<string, number>>> = {
  tee: {
    single:     { "1-9": 160, "10-24": 145, "25-49": 130, "50-99": 115, "100+": 100 },
    full:       { "1-9": 190, "10-24": 175, "25-49": 155, "50-99": 140, "100+": 120 },
    embroidery: { "1-9": 220, "10-24": 195, "25-49": 170, "50-99": 150, "100+": 130 },
  },
  hoodie: {
    single:     { "1-9": 290, "10-24": 270, "25-49": 250, "50-99": 230, "100+": 210 },
    full:       { "1-9": 320, "10-24": 300, "25-49": 275, "50-99": 255, "100+": 230 },
    embroidery: { "1-9": 350, "10-24": 320, "25-49": 295, "50-99": 270, "100+": 245 },
  },
  kids: {
    onesie: { "1-9": 120, "10-24": 110, "25-49": 100, "50-99": 90, "100+": 80 },
    tee:    { "1-9": 140, "10-24": 125, "25-49": 115, "50-99": 100, "100+": 90 },
  },
  cap: {
    embroidery: { "1-9": 180, "10-24": 155, "25-49": 135, "50-99": 115, "100+": 100 },
    full:       { "1-9": 160, "10-24": 140, "25-49": 120, "50-99": 105, "100+": 90 },
  },
  sticker: {
    diecut:      { "1-9": 35, "10-24": 25, "25-49": 18, "50-99": 14, "100+": 10 },
    holographic: { "1-9": 50, "10-24": 38, "25-49": 28, "50-99": 22, "100+": 17 },
    digital:     { "1-9": 22, "10-24": 16, "25-49": 12, "50-99": 9, "100+": 7 },
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

  function reset() {
    setStep(0);
    setProduct(null);
    setMethod(null);
    setQty(null);
  }

  const methods = product ? METHODS[product] ?? [] : [];

  const whatsappMsg = useMemo(() => {
    if (!product || !method || !qty) return "";
    const prod = PRODUCTS.find((p) => p.id === product);
    const meth = methods.find((m) => m.id === method);
    return encodeURIComponent(
      `Hi BUP! Quote calculator:\nProduct: ${prod?.label}\nPrint: ${meth?.label}\nQuantity: ${qty}\nFrom (unit): R${unitPrice}\n\nCan we finalise my order?`
    );
  }, [product, method, qty, unitPrice, methods]);

  return (
    <section id="quote" className="py-24 px-4 sm:px-6 bg-zinc-950 border-t border-zinc-900">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-primary text-xs font-sans tracking-[0.3em] uppercase mb-3">Starter prices</p>
          <h2 className="font-display font-black text-4xl sm:text-5xl uppercase text-white leading-none mb-4">
            Quote <span className="text-primary">Calculator</span>
          </h2>
          <p className="text-zinc-500 text-sm font-sans max-w-lg mx-auto">
            From prices for standard A4 placements — same bands as our WhatsApp catalogue.
            Extra prints, bigger sizes, and complex jobs are quoted separately.
          </p>
        </div>

        <div className="border border-zinc-800 bg-black" style={{ boxShadow: "0 0 40px rgba(249,115,22,0.06)" }}>
          <div className="flex border-b border-zinc-800">
            {steps.map((s, i) => (
              <div
                key={s}
                className={`flex-1 py-3 text-center text-[10px] font-display font-bold tracking-widest uppercase transition-colors ${
                  i === step
                    ? "text-primary border-b-2 border-primary -mb-px"
                    : i < step
                      ? "text-zinc-400"
                      : "text-zinc-700"
                }`}
              >
                {i < step ? "✓ " : ""}
                {s}
              </div>
            ))}
          </div>

          <div className="p-6 min-h-[280px]">
            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.div key="s0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <p className="text-zinc-400 text-sm font-sans mb-5">What are you printing on?</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {PRODUCTS.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setProduct(p.id);
                          setMethod(null);
                        }}
                        className={`p-4 border text-left transition-all ${
                          product === p.id ? "border-primary bg-primary/10" : "border-zinc-800 hover:border-zinc-600"
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

              {step === 1 && (
                <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <p className="text-zinc-400 text-sm font-sans mb-5">Print type (standard A4 unless noted)</p>
                  <div className="space-y-3">
                    {methods.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setMethod(m.id)}
                        className={`w-full p-4 border text-left transition-all flex items-start justify-between gap-3 ${
                          method === m.id ? "border-primary bg-primary/10" : "border-zinc-800 hover:border-zinc-600"
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

              {step === 2 && (
                <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <p className="text-zinc-400 text-sm font-sans mb-5">How many units?</p>
                  <div className="flex flex-wrap gap-2 mb-8">
                    {QTY_TIERS.map((t) => {
                      const price = product && method ? PRICING[product]?.[method]?.[t] : null;
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setQty(t)}
                          className={`flex-1 min-w-[90px] py-3 border text-center transition-all ${
                            qty === t ? "border-primary bg-primary/10" : "border-zinc-800 hover:border-zinc-600"
                          }`}
                        >
                          <div className="font-display font-bold text-sm text-white">{t}</div>
                          {price != null && (
                            <div className="text-[10px] font-sans text-zinc-400 mt-0.5">From R{price}/unit</div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <AnimatePresence>
                    {unitPrice != null && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border border-primary/30 bg-primary/5 p-5"
                        style={{ boxShadow: "0 0 20px rgba(249,115,22,0.1)" }}
                      >
                        <div className="flex items-end justify-between mb-3">
                          <div>
                            <p className="text-zinc-400 text-xs font-sans uppercase tracking-wider mb-1">From (per unit)</p>
                            <p className="font-display font-black text-3xl text-primary">R{unitPrice}</p>
                          </div>
                          {totalPrice != null && (
                            <div className="text-right">
                              <p className="text-zinc-400 text-xs font-sans uppercase tracking-wider mb-1">
                                Est. mid-range ({qty})
                              </p>
                              <p className="font-display font-bold text-xl text-white">R{totalPrice.toLocaleString()}</p>
                            </div>
                          )}
                        </div>
                        <p className="text-zinc-500 text-[11px] font-sans mb-4 leading-relaxed">
                          Starter price for standard A4 placement + garment where listed. Extra colours, larger prints,
                          multi-placement, and bulk complexity are quoted. VAT may apply.
                        </p>
                        <div className="flex gap-3 flex-wrap">
                          <a
                            href={`https://wa.me/${WHATSAPP}?text=${whatsappMsg}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-2 bg-primary text-black font-display font-bold text-xs tracking-widest uppercase py-3 hover:bg-orange-400 transition-colors min-w-[140px]"
                          >
                            <MessageSquare size={14} /> WhatsApp this quote
                          </a>
                          <a
                            href="#contact"
                            className="flex items-center gap-2 border border-zinc-700 text-zinc-300 hover:border-primary hover:text-primary font-display font-bold text-xs tracking-widest uppercase px-4 transition-colors"
                          >
                            <Calculator size={14} /> Formal quote
                          </a>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-900">
            <button
              type="button"
              onClick={step === 0 ? reset : () => setStep((s) => s - 1)}
              className="flex items-center gap-1 text-zinc-500 hover:text-white transition-colors text-sm font-sans disabled:opacity-30"
              disabled={step === 0}
            >
              <ChevronLeft size={16} /> Back
            </button>
            {step < 2 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s + 1)}
                disabled={!canNext}
                className="flex items-center gap-1 bg-primary text-black font-display font-bold text-xs tracking-widest uppercase px-6 py-2.5 hover:bg-orange-400 transition-colors disabled:opacity-30"
              >
                Next <ChevronRight size={16} />
              </button>
            ) : (
              <button type="button" onClick={reset} className="text-zinc-500 hover:text-primary transition-colors text-xs font-sans">
                Start Over
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
