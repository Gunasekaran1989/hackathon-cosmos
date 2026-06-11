import { motion } from "framer-motion";
import { Calendar, MapPin, Trophy, Users } from "lucide-react";
import type { Hackathon } from "@/data/hackathons";
import { Countdown } from "./Countdown";
import { Button } from "@/components/ui/button";

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
const fmtNum = (n: number) =>
  n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : `${n}`;

interface Props {
  h: Hackathon;
  onHover?: (id: string | null) => void;
  active?: boolean;
}

export const HackathonCard = ({ h, onHover, active }: Props) => {
  const statusColor =
    h.status === "Open" ? "bg-accent/20 text-accent-foreground border-accent/40" :
    h.status === "Closing Soon" ? "bg-secondary/20 text-secondary border-secondary/40" :
    "bg-muted text-muted-foreground border-border";

  return (
    <motion.article
      onMouseEnter={() => onHover?.(h.id)}
      onMouseLeave={() => onHover?.(null)}
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className={`group relative bg-card rounded-3xl overflow-hidden border border-border hover:border-primary/30 transition-all hover-lift ${active ? "ring-2 ring-primary glow-primary" : ""}`}
    >
      {/* Banner */}
      <div className="relative h-44 overflow-hidden">
        <img src={h.banner} alt={h.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        {/* Date ribbon */}
        <div className="absolute top-4 left-4 glass rounded-xl px-3 py-1.5 text-xs font-mono font-semibold flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-primary" />
          {fmtDate(h.startDate)} – {fmtDate(h.endDate)}
        </div>

        {/* Prize badge */}
        <div className="absolute top-4 right-4 gradient-primary rounded-xl px-3 py-1.5 text-xs font-bold text-primary-foreground flex items-center gap-1.5 glow-primary">
          <Trophy className="h-3.5 w-3.5" />
          ${fmtNum(h.prizePool)}
        </div>

        {/* Tag */}
        {h.tag && (
          <div className="absolute bottom-4 left-4 bg-accent text-accent-foreground rounded-full px-3 py-1 text-[10px] uppercase tracking-widest font-bold">
            {h.tag}
          </div>
        )}

        {/* Organizer logo */}
        <div className="absolute -bottom-5 right-4 h-12 w-12 rounded-xl glass grid place-items-center font-bold text-sm shadow-lg">
          {h.organizerLogo}
        </div>
      </div>

      {/* Body */}
      <div className="p-5 pt-6">
        <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
          <span>{h.organizer}</span>
          <span>•</span>
          <span>{h.format}</span>
        </div>

        <h3 className="font-bold text-lg leading-snug mb-3 line-clamp-2 group-hover:gradient-text transition-all">
          {h.title}
        </h3>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {h.domain.slice(0, 3).map(d => (
            <span key={d} className="text-[10px] font-medium px-2 py-1 rounded-full bg-muted text-muted-foreground">
              {d}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs mb-4">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 text-secondary" />
            <span className="truncate">{h.location}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Users className="h-3.5 w-3.5 text-accent" />
            <span>{fmtNum(h.participants)} joined</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Starts in</div>
            <div className="font-mono font-bold text-sm text-foreground">
              <Countdown to={h.startDate} compact />
            </div>
          </div>
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${statusColor}`}>
            {h.status}
          </span>
        </div>

        <Button variant="hero" size="sm" className="w-full mt-4">View Details</Button>
      </div>
    </motion.article>
  );
};
