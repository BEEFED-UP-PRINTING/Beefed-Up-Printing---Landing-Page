import { Instagram, Facebook, Mail, MapPin, Music, Phone } from "lucide-react";

const SOCIAL = {
  instagram: "#",      // TODO: replace with https://instagram.com/beefedup
  facebook: "#",        // TODO: replace with https://facebook.com/beefedup
  tiktok: "#",          // TODO: replace with https://tiktok.com/@beefedup
  email: "mailto:beefedupp@gmail.com",
};

export default function Footer() {
  return (
    <footer className="bg-black border-t border-zinc-900 py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">

        <div className="flex flex-col items-center md:items-start gap-2">
          <span className="font-display font-bold text-3xl tracking-widest uppercase text-white">
            Beefed Up<span className="text-primary">.</span>
          </span>
          <p className="font-sans text-zinc-500 text-sm tracking-wide uppercase">
            Street Culture Premium Merch
          </p>
          <div className="flex items-center gap-3 mt-1 text-zinc-600 text-xs font-sans">
            <Phone size={12} />
            <span>+27 79 647 3406</span>
            <span className="text-zinc-700">|</span>
            <span>+27 76 354 9713</span>
          </div>
        </div>

        <div className="flex flex-col items-center md:items-end gap-4">
          <div className="flex gap-6">
            <a
              href={SOCIAL.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-500 hover:text-primary transition-colors"
              title="Instagram"
            >
              <Instagram size={24} />
            </a>
            <a
              href={SOCIAL.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-500 hover:text-primary transition-colors"
              title="Facebook"
            >
              <Facebook size={24} />
            </a>
            <a
              href={SOCIAL.tiktok}
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-500 hover:text-primary transition-colors"
              title="TikTok"
            >
              {/* TikTok SVG */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
              </svg>
            </a>
            <a
              href={SOCIAL.email}
              className="text-zinc-500 hover:text-primary transition-colors"
              title="Email"
            >
              <Mail size={24} />
            </a>
          </div>
          <p className="font-sans text-zinc-600 text-xs flex items-center gap-2">
            <MapPin size={14} /> PROUDLY SOUTH AFRICAN
          </p>
        </div>

      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-zinc-900/50 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-sans text-zinc-600 uppercase tracking-widest">
        <p>&copy; {new Date().getFullYear()} Beefed Up Printing. All Rights Reserved.</p>
        <div className="flex gap-4">
          <a href="#" className="hover:text-primary transition-colors">Privacy</a>
          <a href="#" className="hover:text-primary transition-colors">Terms</a>
        </div>
      </div>
    </footer>
  );
}
