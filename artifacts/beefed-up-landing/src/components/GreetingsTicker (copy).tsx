const GREETINGS = [
  { word: "Sawubona",   lang: "isiZulu"     },
  { word: "Howzit",     lang: "SA English"  },
  { word: "Molo",       lang: "isiXhosa"    },
  { word: "Dumela",     lang: "Sesotho"     },
  { word: "Hallo",      lang: "Afrikaans"   },
  { word: "Avuxeni",    lang: "Xitsonga"    },
  { word: "Ndaa",       lang: "Tshivenḓa"  },
  { word: "Lotjhani",   lang: "isiNdebele"  },
  { word: "Sanibonani", lang: "isiZulu"     },
  { word: "Molweni",    lang: "isiXhosa"    },
  { word: "Dumela",     lang: "Setswana"    },
  { word: "Dumela",     lang: "Sepedi"      },
];

// Separator glyph between each greeting
const SEP = (
  <span className="mx-6 text-orange-500 text-2xl select-none" aria-hidden>✦</span>
);

export default function GreetingsTicker() {
  // Duplicate for seamless infinite loop
  const items = [...GREETINGS, ...GREETINGS];

  return (
    <div
      id="greetings"
      className="relative w-full overflow-hidden bg-zinc-950 border-y border-zinc-800 py-3 select-none"
      aria-label="Greetings in South Africa's 11 official languages"
    >
      {/* Fade masks on the edges */}
      <div className="absolute left-0 top-0 h-full w-16 z-10 pointer-events-none"
        style={{ background: "linear-gradient(to right, #080808, transparent)" }} />
      <div className="absolute right-0 top-0 h-full w-16 z-10 pointer-events-none"
        style={{ background: "linear-gradient(to left, #080808, transparent)" }} />

      <div className="flex w-max animate-ticker">
        {items.map((g, i) => (
          <span key={i} className="flex items-baseline gap-2 whitespace-nowrap">
            {SEP}
            <span
              className="font-graffiti text-3xl md:text-4xl text-glow"
              style={{ color: i % 4 === 0 ? "#f97316" : i % 4 === 1 ? "#fbbf24" : i % 4 === 2 ? "#fb923c" : "#fcd34d" }}
            >
              {g.word}
            </span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold pb-1">
              {g.lang}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
