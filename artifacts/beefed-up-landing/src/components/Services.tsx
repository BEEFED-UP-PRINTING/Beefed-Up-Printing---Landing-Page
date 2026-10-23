import { motion } from "framer-motion";
import { Shirt, Layers, Flag, Tag, Box, Baby } from "lucide-react";

const services = [
  {
    id: "tshirts",
    title: "Custom T-Shirts",
    desc: "Premium tees with prints that hold up on the block. A4 placement as standard; bigger jobs quoted.",
    fromPrice: 160,
    priceNote: "From R160 · A4 single colour + tee",
    icon: Shirt,
  },
  {
    id: "hoodies",
    title: "Hoodies & Sweats",
    desc: "Heavyweight fleece for the streets. One-colour or full-colour A4 printable vinyl.",
    fromPrice: 290,
    priceNote: "From R290 · 1-colour · Full colour from R320",
    icon: Layers,
  },
  {
    id: "kids",
    title: "Kids & Onesies",
    desc: "Custom tees (2–4 years) and onesies. Bright, durable prints for the little ones.",
    fromPrice: 120,
    priceNote: "Onesies from R120 · Kids tees from R140",
    icon: Baby,
  },
  {
    id: "caps",
    title: "Caps & Headwear",
    desc: "Snapbacks, beanies, and bucket hats with embroidery or heat-applied graphics.",
    fromPrice: null,
    priceNote: "Quoted by style & placement",
    icon: Box,
  },
  {
    id: "stickers",
    title: "Stickers & Decals",
    desc: "Die-cut vinyl that lasts. Bumper, deck, wall — slap them anywhere.",
    fromPrice: null,
    priceNote: "Quoted by size & finish",
    icon: Tag,
  },
  {
    id: "banners",
    title: "Banners & Signs",
    desc: "Go big. High-visibility banners for events, gigs, and pop-ups.",
    fromPrice: null,
    priceNote: "Quoted by size",
    icon: Flag,
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
};

export default function Services() {
  const handleServiceClick = (serviceId: string) => {
    const element = document.getElementById("contact") || document.getElementById("quote");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => {
        const select = document.getElementById("service-select") as HTMLSelectElement;
        if (select) {
          select.value = serviceId;
          select.focus();
        }
      }, 800);
    }
  };

  return (
    <section id="services" className="py-24 bg-black relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-16 md:mb-24 flex flex-col items-center text-center">
          <span className="font-sans text-primary font-bold tracking-[0.2em] text-sm mb-4">THE ARSENAL</span>
          <h2 className="font-display text-5xl md:text-6xl text-white uppercase">
            What We <span className="text-primary border-b-4 border-primary pb-1">Drop</span>
          </h2>
          <p className="mt-4 text-zinc-500 text-sm font-sans max-w-md">
            Starter prices for standard A4 placements. Extra colours, larger prints, and bulk are quoted.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={service.title}
                custom={index}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                className="group relative bg-zinc-950 border border-zinc-800 p-8 transition-all duration-300 hover:border-primary hover:-translate-y-2 hover-box-glow flex flex-col h-full"
              >
                <div className="w-14 h-14 bg-zinc-900 border border-zinc-800 flex items-center justify-center text-primary mb-6 group-hover:scale-110 group-hover:bg-primary group-hover:text-black transition-all">
                  <Icon size={28} strokeWidth={1.5} />
                </div>

                <h3 className="font-display text-2xl text-white uppercase tracking-wide mb-3">
                  {service.title}
                </h3>

                <p className="font-sans text-zinc-400 leading-relaxed mb-4 flex-grow">
                  {service.desc}
                </p>

                <p className="font-display font-bold text-primary text-sm tracking-wide mb-6">
                  {service.fromPrice != null ? (
                    <>
                      <span className="text-white text-lg">From R{service.fromPrice}</span>
                      <span className="block text-zinc-500 font-sans font-normal text-[11px] tracking-normal mt-1">
                        {service.priceNote}
                      </span>
                    </>
                  ) : (
                    <span className="text-zinc-400 font-sans font-normal text-xs">{service.priceNote}</span>
                  )}
                </p>

                <button
                  onClick={() => handleServiceClick(service.id)}
                  className="font-display font-bold uppercase tracking-widest text-sm text-zinc-500 group-hover:text-primary transition-colors flex items-center gap-2 mt-auto w-fit"
                >
                  Order Now <span className="group-hover:translate-x-1 transition-transform">→</span>
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
