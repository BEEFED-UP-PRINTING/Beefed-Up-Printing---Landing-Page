git clone https://x:art_v2_x_9415391fdead041dc8b07c8f43996ef2080764a0@31b91e7f9954ad8aa334d46f012bd8ed.artifacts.cloudflare.net/git/lee-production/lee-maggie-spray-can-update-14cb085b.git maggie-spray-can-updateparent border-t-orange-500/50" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spray can button */}
      <AnimatePresence>
        {visible && (
          <motion.button
            onClick={handleTap}
            initial={{ y: 80, opacity: 0, scale: 0.6 }}
            animate={{
              y: 0,
              opacity: 1,
              scale: 1,
              rotate: spraying ? [-2, -22, -22, -2] : 0,
            }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{
              y: { type: "spring", stiffness: 200, damping: 22 },
              opacity: { duration: 0.4 },
              scale: { duration: 0.4 },
              rotate: { duration: 1.0, ease: "easeInOut" },
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.92 }}
            aria-label={open ? "Close Maggie" : "Tap to spray Maggie"}
            className="fixed bottom-4 right-3 sm:right-5 z-50 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-zinc-950 border-2 border-primary shadow-[0_0_22px_rgba(249,115,22,0.5)] overflow-hidden"
            style={{ transformOrigin: "bottom right" }}
          >
            {open ? (
              <span className="flex items-center justify-center w-full h-full text-primary">
                <X size={22} />
              </span>
            ) : (
              <img
                src={canSrc}
                alt="Maggie spray can"
                className="w-full h-full object-cover"
                draggable={false}
              />
            )}
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
