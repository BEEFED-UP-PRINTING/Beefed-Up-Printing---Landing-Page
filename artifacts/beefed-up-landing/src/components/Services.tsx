import { motion } from "framer-motion";
import { Shirt, Layers, Flag, Tag, Box } from "lucide-react";

const services = [
  { 
    id: "tshirts",
    title: "Custom T-Shirts", 
    desc: "Premium quality tees with bulletproof prints that won't fade or crack on the block.", 
    icon: Shirt 
  },
  { 
    id: "hoodies",
    title: "Hoodies & Sweats", 
    desc: "Heavyweight fleece and hoodies designed for the streets. Thick, warm, and loud.", 
    icon: Layers 
  },
  { 
    id: "caps",
    title: "Caps & Headwear", 
    desc: "Snapbacks, beanies, and bucket hats detailed with precise embroidery.", 
    icon: Box 
  },
  { 
    id: "stickers",
    title: "Stickers & Decals", 
    desc: "Die-cut vinyl stickers that last. Slap them on a bumper, a deck, or a wall.", 
    icon: Tag 
  },
  { 
    id: "banners",
    title: "Banners & Signs", 
    desc: "Go big. High visibility banners for events, gigs, and pop-up shops.", 
    icon: Flag 
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" }
  })
};

export default function Services() {
  const handleServiceClick = (serviceId: string) => {
    // Navigate to contact section and we could prefill state, 
    // but a simple scroll is best for this UX flow.
    const element = document.getElementById("contact");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      // Minor delay to allow scroll, then try to focus the select
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
                
                <p className="font-sans text-zinc-400 leading-relaxed mb-8 flex-grow">
                  {service.desc}
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
