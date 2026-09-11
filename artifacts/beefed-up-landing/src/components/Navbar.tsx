import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LogIn, LogOut, User, Dna } from "lucide-react";
import { useAuth } from "@workspace/replit-auth-web";

interface NavbarProps {
  onOpenDNA?: () => void;
}

export default function Navbar({ onOpenDNA }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isLoading, isAuthenticated, login, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "About", href: "#about" },
    { name: "Services", href: "#services" },
    { name: "Drops", href: "#drops" },
    { name: "Quote", href: "#quote" },
    { name: "Order", href: "#contact" },
  ];

  return (
    <>
      <nav 
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled 
            ? "bg-black/80 backdrop-blur-md border-b border-zinc-800 py-4 shadow-lg" 
            : "bg-transparent py-6"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">
          <a href="#" className="flex flex-col items-start leading-none gap-1 group">
            <span className="font-display font-bold text-xl sm:text-2xl md:text-3xl tracking-widest uppercase text-white">
              BEEFED UP<span className="text-primary transition-colors duration-300 group-hover:text-white">.</span>
            </span>
            <img
              src={`${import.meta.env.BASE_URL}tagline.png`}
              alt="Custom Designed Not Bought"
              className="h-4 sm:h-5 md:h-7 w-auto opacity-95 max-w-[180px] sm:max-w-none"
            />
          </a>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <a 
                key={link.name} 
                href={link.href}
                className="font-sans font-semibold text-sm tracking-widest uppercase text-zinc-300 hover:text-primary transition-colors relative group"
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
              </a>
            ))}

            {/* Design DNA button */}
            {isAuthenticated && (
              <button
                onClick={onOpenDNA}
                className="flex items-center gap-1.5 font-sans font-semibold text-sm tracking-widest uppercase text-zinc-300 hover:text-primary transition-colors relative group"
              >
                <Dna size={15} />
                My DNA
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
              </button>
            )}

            {/* Auth button */}
            {!isLoading && (
              isAuthenticated ? (
                <div className="flex items-center gap-3">
                  {user?.profileImageUrl ? (
                    <img
                      src={user.profileImageUrl}
                      alt={user.firstName ?? "Account"}
                      className="w-8 h-8 rounded-full border border-primary object-cover"
                    />
                  ) : (
                    <span className="w-8 h-8 rounded-full border border-primary flex items-center justify-center text-primary">
                      <User size={16} />
                    </span>
                  )}
                  <button
                    onClick={logout}
                    className="font-sans font-semibold text-sm tracking-widest uppercase text-zinc-300 hover:text-primary transition-colors flex items-center gap-1"
                  >
                    <LogOut size={14} />
                    Log out
                  </button>
                </div>
              ) : (
                <button
                  onClick={login}
                  className="font-sans font-semibold text-sm tracking-widest uppercase text-zinc-300 hover:text-primary transition-colors flex items-center gap-1"
                >
                  <LogIn size={14} />
                  Log in
                </button>
              )
            )}

            <a 
              href="#contact"
              className="bg-primary text-black font-display font-bold text-sm tracking-widest uppercase px-6 py-2 border border-primary hover:bg-transparent hover:text-primary transition-all box-glow"
            >
              Get Quote
            </a>
          </div>

          {/* Mobile Toggle */}
          <button 
            className="md:hidden text-white hover:text-primary transition-colors"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu size={28} />
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed inset-0 z-[60] bg-zinc-950 flex flex-col justify-center items-center px-6"
          >
            <button 
              className="absolute top-5 right-5 text-zinc-400 hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X size={36} />
            </button>
            
            <div className="flex flex-col items-center gap-6">
              {navLinks.map((link) => (
                <a 
                  key={link.name} 
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="font-display font-bold text-3xl uppercase text-white hover:text-primary hover:scale-110 transition-all"
                >
                  {link.name}
                </a>
              ))}

              {/* Mobile DNA */}
              {isAuthenticated && (
                <button
                  onClick={() => { setMobileMenuOpen(false); onOpenDNA?.(); }}
                  className="font-display font-bold text-2xl uppercase text-primary hover:scale-110 transition-all flex items-center gap-2"
                >
                  <Dna size={20} />
                  My DNA
                </button>
              )}

              {/* Mobile auth */}
              {!isLoading && (
                isAuthenticated ? (
                  <button
                    onClick={logout}
                    className="font-display font-bold text-2xl uppercase text-zinc-400 hover:text-primary hover:scale-110 transition-all flex items-center gap-2"
                  >
                    <LogOut size={20} />
                    Log out
                  </button>
                ) : (
                  <button
                    onClick={login}
                    className="font-display font-bold text-2xl uppercase text-zinc-400 hover:text-primary hover:scale-110 transition-all flex items-center gap-2"
                  >
                    <LogIn size={20} />
                    Log in
                  </button>
                )
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
