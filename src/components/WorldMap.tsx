import { useState } from "react";
import { hackathons } from "@/data/hackathons";

const cities = [
  { name: "San Francisco", lat: 37.77, lng: -122.42 },
  { name: "Berlin", lat: 52.52, lng: 13.4 },
  { name: "Singapore", lat: 1.35, lng: 103.81 },
  { name: "London", lat: 51.5, lng: -0.12 },
  { name: "Tokyo", lat: 35.68, lng: 139.69 },
  { name: "São Paulo", lat: -23.55, lng: -46.63 },
  { name: "Lagos", lat: 6.52, lng: 3.38 },
  { name: "Sydney", lat: -33.86, lng: 151.21 },
  { name: "Seattle", lat: 47.6, lng: -122.33 },
  { name: "Paris", lat: 48.85, lng: 2.35 },
  { name: "Mumbai", lat: 19.07, lng: 72.87 },
  { name: "New York", lat: 40.71, lng: -74.0 },
];

// Equirectangular projection -> percent
const project = (lat: number, lng: number) => ({
  x: ((lng + 180) / 360) * 100,
  y: ((90 - lat) / 180) * 100,
});

interface Props {
  activeId?: string | null;
  onSelect?: (id: string | null) => void;
}

export const WorldMap = ({ activeId, onSelect }: Props) => {
  const [hovered, setHovered] = useState<string | null>(null);

  // Group by city
  const groups = cities.map(c => ({
    ...c,
    items: hackathons.filter(h => Math.abs(h.coords.lat - c.lat) < 1 && Math.abs(h.coords.lng - c.lng) < 1),
  })).filter(c => c.items.length);

  return (
    <div className="relative w-full aspect-[2/1] rounded-3xl overflow-hidden glass">
      {/* gradient background */}
      <div className="absolute inset-0 gradient-mesh opacity-60" />
      <div className="absolute inset-0 grid-pattern opacity-50" />

      {/* dotted world map silhouette */}
      <svg viewBox="0 0 100 50" className="absolute inset-0 w-full h-full opacity-40" preserveAspectRatio="none">
        <defs>
          <pattern id="dots" width="1.2" height="1.2" patternUnits="userSpaceOnUse">
            <circle cx="0.6" cy="0.6" r="0.18" fill="hsl(var(--primary))" opacity="0.5" />
          </pattern>
        </defs>
        {/* rough continent shapes */}
        <path d="M10,15 Q15,10 25,12 L30,20 Q28,28 22,30 L12,28 Z" fill="url(#dots)" />
        <path d="M42,12 Q50,8 58,12 L60,22 Q55,28 48,26 L42,22 Z" fill="url(#dots)" />
        <path d="M55,18 Q70,15 82,20 L85,32 Q78,38 68,36 L58,30 Z" fill="url(#dots)" />
        <path d="M22,30 Q26,32 28,40 L24,45 Q18,42 18,36 Z" fill="url(#dots)" />
        <path d="M50,28 Q56,30 58,38 L54,44 Q48,42 48,36 Z" fill="url(#dots)" />
        <path d="M82,36 Q88,38 90,42 L86,46 Q82,44 80,40 Z" fill="url(#dots)" />
      </svg>

      {/* Markers */}
      {groups.map(c => {
        const { x, y } = project(c.lat, c.lng);
        const isActive = c.items.some(i => i.id === activeId) || hovered === c.name;
        const total = c.items.reduce((s, i) => s + i.participants, 0);
        return (
          <div
            key={c.name}
            className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
            style={{ left: `${x}%`, top: `${y}%` }}
            onMouseEnter={() => { setHovered(c.name); onSelect?.(c.items[0].id); }}
            onMouseLeave={() => { setHovered(null); onSelect?.(null); }}
          >
            <span className={`absolute inset-0 rounded-full gradient-primary ${isActive ? "animate-ping" : ""}`} style={{ width: 28, height: 28, left: -14, top: -14 }} />
            <div className={`relative rounded-full gradient-primary text-primary-foreground font-bold text-xs grid place-items-center transition-all glow-primary ${isActive ? "scale-150" : "scale-100"}`}
                 style={{ width: 28, height: 28 }}>
              {c.items.length}
            </div>
            {isActive && (
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 glass rounded-xl px-3 py-2 whitespace-nowrap text-xs shadow-lg z-10">
                <div className="font-bold">{c.name}</div>
                <div className="text-muted-foreground">{c.items.length} events · {(total / 1000).toFixed(1)}k devs</div>
              </div>
            )}
          </div>
        );
      })}

      {/* Stats overlay */}
      <div className="absolute top-4 left-4 glass rounded-2xl p-4 max-w-[200px]">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Live Globally</div>
        <div className="text-2xl font-bold gradient-text">{hackathons.length} events</div>
        <div className="text-xs text-muted-foreground mt-1">across {groups.length} cities</div>
      </div>
    </div>
  );
};
