import { Link } from "react-router-dom";
import { Calendar, MapPin, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import BannerImage from "@/components/BannerImage";
import placeholder from "@/assets/hack-ai.jpg";

export type HackathonListRow = {
  id: string;
  title: string;
  organizer: string;
  banner_image: string | null;
  country: string | null;
  city: string | null;
  start_date: string;
  end_date: string | null;
  prize_pool: string | null;
  tags: string[] | null;
};

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const fmtMoney = (v: string | number | null) => {
  if (v == null || v === "") return "TBA";
  const n = typeof v === "number" ? v : Number(String(v).replace(/[^0-9.]/g, ""));
  if (!Number.isFinite(n) || n <= 0) return String(v);
  return n >= 1000 ? `$${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : `$${n}`;
};

interface Props {
  h: HackathonListRow;
  badge?: "past" | null;
}

export const HackathonListCard = ({ h, badge }: Props) => {
  return (
    <article className="group bg-card rounded-3xl overflow-hidden border border-border hover:border-primary/30 hover-lift transition-all">
      <div className="relative h-44 overflow-hidden">
        <BannerImage
          path={h.banner_image}
          alt={h.title}
          fallback={placeholder}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="absolute top-4 left-4 glass rounded-xl px-3 py-1.5 text-xs font-mono font-semibold flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-primary" />
          {fmtDate(h.start_date)}
        </div>
        <div className="absolute top-4 right-4 gradient-primary rounded-xl px-3 py-1.5 text-xs font-bold text-primary-foreground flex items-center gap-1.5 glow-primary">
          <Trophy className="h-3.5 w-3.5" />
          {fmtMoney(h.prize_pool)}
        </div>
        {badge === "past" && (
          <div className="absolute bottom-4 left-4 bg-muted text-muted-foreground rounded-full px-3 py-1 text-[10px] uppercase tracking-widest font-bold">
            Past event
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="text-xs text-muted-foreground mb-2">{h.organizer}</div>
        <h2 className="font-bold text-lg leading-snug mb-3 line-clamp-2 group-hover:gradient-text transition-all">
          {h.title}
        </h2>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
          <MapPin className="h-3.5 w-3.5 text-secondary" />
          <span className="truncate">
            {[h.city, h.country].filter(Boolean).join(", ") || "Location TBA"}
          </span>
        </div>

        {h.tags && h.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {h.tags.slice(0, 4).map((t) => (
              <span
                key={t}
                className="text-[10px] font-medium px-2 py-1 rounded-full bg-muted text-muted-foreground"
              >
                {t}
              </span>
            ))}
          </div>
        )}

        <Button variant="hero" size="sm" className="w-full" asChild>
          <Link to={`/hackathon/${h.id}`}>View Details</Link>
        </Button>
      </div>
    </article>
  );
};
