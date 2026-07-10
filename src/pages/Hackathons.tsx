import { useEffect, useState } from "react";
import { Calendar, MapPin, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import placeholder from "@/assets/hack-ai.jpg";
import { bannerUrl } from "@/lib/banner";

type Row = {
  id: string;
  title: string;
  organizer: string;
  banner_image: string | null;
  country: string | null;
  city: string | null;
  start_date: string;
  end_date: string | null;
  prize_pool: number | null;
  tags: string[] | null;
};

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
const fmtMoney = (n: number | null) =>
  n == null ? "TBA" : n >= 1000 ? `$${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : `$${n}`;

const Hackathons = () => {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Hackathons | Hackverse";
    (async () => {
      const { data, error } = await supabase
        .from("hackathons")
        .select("id,title,organizer,banner_image,country,city,start_date,end_date,prize_pool,tags")
        .order("start_date", { ascending: true });
      if (error) setError(error.message);
      setRows((data as Row[]) ?? []);
    })();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-16 sm:py-24">
        <header className="mb-10">
          <div className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            All events
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            <span className="gradient-text">Hackathons</span>
          </h1>
          <p className="text-muted-foreground mt-3 max-w-xl">
            Every event on Hackverse, sorted by soonest start date.
          </p>
        </header>

        {error && (
          <div className="rounded-2xl border border-destructive/40 bg-destructive/10 text-destructive p-4 mb-6">
            {error}
          </div>
        )}

        {rows === null ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-3xl border border-border overflow-hidden">
                <Skeleton className="h-44 w-full rounded-none" />
                <div className="p-5 space-y-3">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-6 w-4/5" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-9 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div className="text-center py-24 rounded-3xl border border-dashed border-border">
            <div className="text-6xl mb-4">🛰️</div>
            <h2 className="text-2xl font-bold mb-2">No hackathons yet</h2>
            <p className="text-muted-foreground mb-6">Be the first to put one on the map.</p>
            <Button asChild variant="hero"><a href="/submit">Submit an event</a></Button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {rows.map((h) => (
              <article
                key={h.id}
                className="group bg-card rounded-3xl overflow-hidden border border-border hover:border-primary/30 hover-lift transition-all"
              >
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={h.banner_image || placeholder}
                    alt={h.title}
                    loading="lazy"
                    onError={(e) => ((e.currentTarget as HTMLImageElement).src = placeholder)}
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
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Hackathons;
