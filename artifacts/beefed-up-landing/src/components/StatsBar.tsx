import { useEffect, useRef, useState } from "react";

interface Stat {
  value: number;
  suffix: string;
  label: string;
}

const STATS: Stat[] = [
  { value: 312, suffix: "+", label: "Orders completed" },
  { value: 48, suffix: "h", label: "Avg turnaround" },
  { value: 98, suffix: "%", label: "Satisfaction rate" },
  { value: 7, suffix: "", label: "Years on the block" },
];

function useCountUp(target: number, duration = 1600, started = false) {
  const [count, setCount] = useState(0);
  const raf = useRef<number>(0);

  useEffect(() => {
    if (!started) return;
    const start = performance.now();
    function tick(now: number) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) raf.current = requestAnimationFrame(tick);
    }
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration, started]);

  return count;
}

function StatItem({ stat, started }: { stat: Stat; started: boolean }) {
  const count = useCountUp(stat.value, 1400, started);
  return (
    <div className="flex flex-col items-center text-center px-6 py-5 border-r border-zinc-800 last:border-r-0 flex-1 min-w-[120px]">
      <span
        className="font-display font-black text-3xl sm:text-4xl text-white leading-none"
        style={{ textShadow: "0 0 20px rgba(249,115,22,0.4)" }}
      >
        {count}
        <span className="text-primary">{stat.suffix}</span>
      </span>
      <span className="text-zinc-500 text-[11px] font-sans uppercase tracking-widest mt-1.5">
        {stat.label}
      </span>
    </div>
  );
}

export default function StatsBar() {
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setStarted(true); obs.disconnect(); } },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className="border-y border-zinc-900 bg-zinc-950/60">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-wrap divide-x divide-zinc-800">
          {STATS.map((s) => (
            <StatItem key={s.label} stat={s} started={started} />
          ))}
        </div>
      </div>
    </div>
  );
}
