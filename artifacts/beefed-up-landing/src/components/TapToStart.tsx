import { motion } from "framer-motion";

interface TapToStartProps {
  onTap: () => void;
}

export default function TapToStart({ onTap }: TapToStartProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-6 bg-black/85 backdrop-blur-sm select-none"
    >
      <motion.button
        type="button"
        onClick={onTap}
        aria-label="Tap the fist to activate the Beefed Up experience"
        whileTap={{ scale: 0.95 }}
        className="relative cursor-pointer rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-4 focus-visible:ring-offset-black"
        animate={{
          scale: [1, 1.08, 1],
          rotate: [0, -4, 0, 4, 0],
        }}
        transition={{
          duration: 1.6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          filter:
            "drop-shadow(0 0 18px rgba(249,115,22,0.85)) drop-shadow(0 0 36px rgba(249,115,22,0.5)) drop-shadow(0 8px 14px rgba(0,0,0,0.7))",
        }}
      >
        <img
          src={`${import.meta.env.BASE_URL}fist.png`}
          alt=""
          aria-hidden
          draggable={false}
          className="block w-[180px] sm:w-[240px] h-auto select-none"
          style={{ transform: "perspective(500px) rotateX(8deg)" }}
        />
      </motion.button>

      <motion.div
        initial={{ y: 14, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.25, duration: 0.6 }}
        className="px-6 text-center"
      >
        <div
          className="font-display text-2xl sm:text-3xl md:text-4xl uppercase tracking-wide text-white"
          style={{
            textShadow:
              "0 0 12px rgba(249,115,22,0.9), 0 0 24px rgba(249,115,22,0.5), 0 2px 0 #000",
          }}
        >
          Slat Here
        </div>
        <div
          className="mt-2 font-display text-base sm:text-lg md:text-xl uppercase tracking-[0.25em] text-orange-400"
          style={{
            textShadow: "0 0 10px rgba(249,115,22,0.7), 0 1px 0 #000",
          }}
        >
          If You Proud To Be From Mzansi
        </div>
      </motion.div>

      <motion.div
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.4, repeat: Infinity }}
        className="text-[10px] uppercase tracking-[0.35em] text-zinc-400 font-bold"
      >
        Tap Fist To Activate
      </motion.div>
    </motion.div>
  );
}
