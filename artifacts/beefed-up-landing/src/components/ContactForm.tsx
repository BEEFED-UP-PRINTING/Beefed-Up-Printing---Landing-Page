import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useSubmitContact, type ContactInput, contactSchema } from "@/hooks/use-contact";

export default function ContactForm() {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema)
  });
  
  const { mutate, isPending } = useSubmitContact();

  const onSubmit = (data: ContactInput) => {
    mutate(data, {
      onSuccess: () => {
        reset();
      }
    });
  };

  return (
    <section id="contact" className="py-24 md:py-32 bg-zinc-950 relative border-t border-zinc-900">
      {/* Right side graphical glow */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="border-2 border-zinc-800 bg-black p-8 md:p-14 relative shadow-2xl"
        >
          {/* Industrial / Gritty Accents */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
          <div className="absolute -top-3 -left-3 w-6 h-6 border-t-2 border-l-2 border-primary" />
          <div className="absolute -bottom-3 -right-3 w-6 h-6 border-b-2 border-r-2 border-primary" />

          <div className="mb-10">
            <h2 className="font-display text-4xl md:text-5xl text-white uppercase leading-tight">
              Get A <span className="text-primary">Quote</span>
            </h2>
            <p className="font-sans text-zinc-400 mt-2">Hit us up with your requirements and we'll link up.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block font-sans text-xs uppercase tracking-widest text-zinc-500 mb-2">Name / Crew</label>
                <input 
                  {...register("name")} 
                  className="w-full bg-zinc-900 border border-zinc-800 text-white px-4 py-3.5 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-sans placeholder:text-zinc-700" 
                  placeholder="WHAT DO WE CALL YOU?" 
                />
                {errors.name && <p className="text-red-500 text-xs mt-1.5">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block font-sans text-xs uppercase tracking-widest text-zinc-500 mb-2">Email</label>
                <input 
                  {...register("email")} 
                  className="w-full bg-zinc-900 border border-zinc-800 text-white px-4 py-3.5 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-sans placeholder:text-zinc-700" 
                  placeholder="WHERE DO WE SEND THE INVOICE?" 
                />
                {errors.email && <p className="text-red-500 text-xs mt-1.5">{errors.email.message}</p>}
              </div>
            </div>

            <div>
              <label className="block font-sans text-xs uppercase tracking-widest text-zinc-500 mb-2">The Merch</label>
              <div className="relative">
                <select 
                  id="service-select"
                  {...register("service")} 
                  className="w-full bg-zinc-900 border border-zinc-800 text-white px-4 py-3.5 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-sans appearance-none"
                >
                  <option value="">SELECT GEAR</option>
                  <option value="tshirts">Custom T-Shirts</option>
                  <option value="hoodies">Hoodies & Sweats</option>
                  <option value="caps">Caps & Headwear</option>
                  <option value="stickers">Stickers & Decals</option>
                  <option value="banners">Banners & Signs</option>
                  <option value="other">Other / Custom Hustle</option>
                </select>
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-zinc-500">
                  ▼
                </div>
              </div>
              {errors.service && <p className="text-red-500 text-xs mt-1.5">{errors.service.message}</p>}
            </div>

            <div>
              <label className="block font-sans text-xs uppercase tracking-widest text-zinc-500 mb-2">The Details</label>
              <textarea 
                {...register("message")} 
                rows={5} 
                className="w-full bg-zinc-900 border border-zinc-800 text-white px-4 py-3.5 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-sans resize-none placeholder:text-zinc-700" 
                placeholder="TELL US ABOUT THE VISION, QUANTITIES, SIZES..." 
              />
              {errors.message && <p className="text-red-500 text-xs mt-1.5">{errors.message.message}</p>}
            </div>

            <button 
              disabled={isPending} 
              type="submit" 
              className="w-full bg-primary text-black font-display font-bold text-xl uppercase py-5 mt-4 hover:bg-white hover:text-black transition-all box-glow hover:box-glow flex justify-center items-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed group"
            >
              {isPending ? (
                <>
                  <Loader2 className="animate-spin" size={24} />
                  PROCESSING...
                </>
              ) : (
                <>
                  Send It <span className="group-hover:translate-x-1 transition-transform">→</span>
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
