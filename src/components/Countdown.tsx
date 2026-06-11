import { useEffect, useState } from "react";

function diff(target: Date) {
  const now = new Date();
  const ms = Math.max(0, target.getTime() - now.getTime());
  const d = Math.floor(ms / 86400000);
  const h = Math.floor((ms % 86400000) / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return { d, h, m, s };
}

export const Countdown = ({ to, compact = false }: { to: string; compact?: boolean }) => {
  const target = new Date(to);
  const [t, setT] = useState(() => diff(target));
  useEffect(() => {
    const id = setInterval(() => setT(diff(target)), 1000);
    return () => clearInterval(id);
  }, [to]);

  if (compact) {
    return (
      <span className="font-mono text-xs tabular-nums">
        {t.d}d {String(t.h).padStart(2, "0")}h {String(t.m).padStart(2, "0")}m
      </span>
    );
  }

  const items = [
    { v: t.d, l: "Days" },
    { v: t.h, l: "Hrs" },
    { v: t.m, l: "Min" },
    { v: t.s, l: "Sec" },
  ];
  return (
    <div className="flex gap-2 sm:gap-3">
      {items.map(({ v, l }) => (
        <div key={l} className="glass rounded-xl px-3 py-2 sm:px-4 sm:py-3 min-w-[60px] sm:min-w-[72px] text-center">
          <div className="font-mono text-2xl sm:text-3xl font-bold tabular-nums gradient-text">
            {String(v).padStart(2, "0")}
          </div>
          <div className="text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground">{l}</div>
        </div>
      ))}
    </div>
  );
};
