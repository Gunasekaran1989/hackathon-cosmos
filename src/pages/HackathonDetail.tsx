import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Calendar, MapPin, Trophy, Tag, ArrowLeft, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import placeholder from "@/assets/hack-ai.jpg";
import { trackEvent } from "@/lib/analytics";
import { bannerUrl } from "@/lib/banner";

// Row subset for the detail page
type HackathonDetail = {
  id: string;
  title: string;
  description: string | null;
  organizer: string;
  banner_image: string | null;
  country: string | null;
  city: string | null;
  start_date: string;
  end_date: string | null;
  prize_pool: string | null;
  tags: string[] | null;
  website_url: string | null;
};

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
const fmtMoney = (v: string | number | null) => {
  if (v == null || v === "") return "TBA";
  const n = typeof v === "number" ? v : Number(String(v).replace(/[^0-9.]/g, ""));
  if (!Number.isFinite(n) || n <= 0) return String(v);
  return n >= 1000 ? `$${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : `$${n}`;
};


const HackathonDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [hackathon, setHackathon] = useState<HackathonDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    document.title = "Hackathon | Hackverse";

    (async () => {
      const { data, error } = await supabase
        .from("hackathons")
        .select(
          "id,title,description,organizer,banner_image,country,city,start_date,end_date,prize_pool,tags,website_url"
        )
        .eq("id", id)
        .single();

      if (error) {
        setError(error.message);
        return;
      }

      setHackathon(data as HackathonDetail);
      document.title = `${data.title} | Hackverse`;

      trackEvent("hackathon_detail_view", { id: data.id, title: data.title });
    })();
  }, [id]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-10 sm:py-16">
        <Link
          to="/hackathons"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Hackathons
        </Link>

        {error && (
          <div className="rounded-2xl border border-destructive/40 bg-destructive/10 text-destructive p-4 mb-6">
            {error}
          </div>
        )}

        {!hackathon && !error ? (
          <div className="rounded-3xl border border-border overflow-hidden">
            <Skeleton className="h-64 sm:h-80 w-full rounded-none" />
            <div className="p-6 sm:p-10 space-y-4">
              <Skeleton className="h-8 w-2/3" />
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        ) : hackathon ? (
          <article className="rounded-3xl border border-border overflow-hidden bg-card shadow-sm">
            {/* Banner */}
            <div className="relative h-64 sm:h-80 md:h-96 overflow-hidden">
              <img
                src={bannerUrl(hackathon.banner_image) || placeholder}
                alt={hackathon.title}
                loading="eager"
                onError={(e) => ((e.currentTarget as HTMLImageElement).src = placeholder)}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
                <div className="flex flex-wrap gap-2 mb-3">
                  {hackathon.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-primary/90 text-primary-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight max-w-4xl">
                  {hackathon.title}
                </h1>
                <div className="text-white/80 mt-2 text-sm sm:text-base font-medium">
                  {hackathon.organizer}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 sm:p-10 grid md:grid-cols-[1fr_360px] gap-10">
              <div>
                <h2 className="text-2xl font-bold mb-4">About the event</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {hackathon.description || "No description provided."}
                </p>
              </div>

              <aside className="space-y-6">
                <div className="rounded-2xl border border-border p-6 bg-background/50">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-xl gradient-primary grid place-items-center text-primary-foreground">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wider text-muted-foreground">Date</div>
                      <div className="font-semibold text-sm">
                        {fmtDate(hackathon.start_date)}
                        {hackathon.end_date && hackathon.end_date !== hackathon.start_date && (
                          <> – {fmtDate(hackathon.end_date)}</>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-xl bg-secondary/20 text-secondary grid place-items-center">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wider text-muted-foreground">Location</div>
                      <div className="font-semibold text-sm">
                        {[hackathon.city, hackathon.country].filter(Boolean).join(", ") || "Location TBA"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-accent/20 text-accent grid place-items-center">
                      <Trophy className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wider text-muted-foreground">Prize Pool</div>
                      <div className="font-semibold text-sm">{fmtMoney(hackathon.prize_pool)}</div>
                    </div>
                  </div>
                </div>

                <Button
                  variant="hero"
                  size="lg"
                  className="w-full"
                  asChild
                >
                  <a
                    href={hackathon.website_url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() =>
                      trackEvent("hackathon_register_click", {
                        id: hackathon.id,
                        title: hackathon.title,
                        url: hackathon.website_url,
                      })
                    }
                  >
                    Register Now
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>

                {participation === "completed" ? (
                  <p className="text-sm text-center font-medium text-primary">You completed this hackathon 🎉</p>
                ) : participation ? (
                  <Button variant="outline" size="lg" className="w-full" disabled={joining} onClick={handleComplete}>
                    {joining && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Mark as completed
                  </Button>
                ) : (
                  <Button variant="outline" size="lg" className="w-full" disabled={joining} onClick={handleJoin}>
                    {joining && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    <UserPlus className="h-4 w-4 mr-2" />Track my participation
                  </Button>
                )}

                {!hackathon.website_url && (
                  <p className="text-xs text-muted-foreground text-center">
                    Registration link unavailable for this event.
                  </p>
                )}

              </aside>
            </div>
          </article>
        ) : null}
      </main>
      <Footer />
    </div>
  );
};

export default HackathonDetail;
