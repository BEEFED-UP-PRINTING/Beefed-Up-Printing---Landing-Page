import { motion } from "framer-motion";

export default function About() {
  return (
    <section id="about" className="py-24 md:py-32 bg-zinc-950 relative border-t border-zinc-900 overflow-hidden">
      {/* Background graphic element */}
      <div className="absolute -left-40 -top-40 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
        
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
           <h2 className="font-display text-5xl md:text-7xl text-white mb-4 uppercase leading-none">
             Born in the <span className="text-primary text-glow">Streets</span>.<br/>
           </h2>
           <h2 className="font-display text-5xl md:text-7xl text-white mb-8 uppercase leading-none flex items-center gap-4">
             Built for the 
             <span className="font-graffiti text-5xl md:text-8xl text-zinc-400 tracking-wider inline-block -rotate-6 mt-2 ml-2">Hustle</span>
           </h2>
           
           <div className="space-y-6">
             <p className="text-zinc-400 text-lg md:text-xl leading-relaxed font-sans font-medium">
               Beefed Up Printing is a South African custom print powerhouse bringing raw street culture to premium merchandise. We don't just print clothes; we forge armor for the urban jungle.
             </p>
             <p className="text-zinc-500 text-base leading-relaxed font-sans">
               Whether you're pushing your own brand, dropping a new mixtape, or outfitting your crew, we deliver bulletproof prints that speak the language of the streets. No half measures. Only the highest quality gear.
             </p>
           </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative"
        >
          {/* Gritty stylized container block */}
          <div className="bg-black border-2 border-zinc-800 p-8 md:p-12 relative -rotate-2 hover:rotate-0 transition-transform duration-500 hover-box-glow group">
            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-primary -translate-x-2 -translate-y-2 group-hover:-translate-x-3 group-hover:-translate-y-3 transition-transform" />
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-primary translate-x-2 translate-y-2 group-hover:translate-x-3 group-hover:translate-y-3 transition-transform" />
            
            <div className="flex flex-col gap-6">
              <h3 className="font-display text-2xl text-white uppercase tracking-widest border-b border-zinc-800 pb-4">
                Our Vibe
              </h3>
              <ul className="space-y-4 font-sans text-zinc-300 font-semibold tracking-wide uppercase text-sm">
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-primary rounded-full box-glow" /> Premium Quality Garments
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-primary rounded-full box-glow" /> Unapologetic Street Aesthetics
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-primary rounded-full box-glow" /> Custom Graphic Transfers
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-primary rounded-full box-glow" /> Proudly South African
                </li>
              </ul>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
