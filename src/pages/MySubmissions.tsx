import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Calendar, Copy, ExternalLink, MapPin, Search, Rocket } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { bannerUrl } from "@/lib/banner";
import placeholder from "@/assets/hack-ai.jpg";

type StatusFilter = "all" | "pending" | "approved" | "rejected";

type Row = {
  id: string;
  event_name: string;
  organizer: string;
  location: string | null;
  banner_image: string | null;
  reference_id: string | null;
  status: string;
  created_at: string;
  rejection_reason: string | null;
  published_hackathon_id: string | null;
};

const PAGE_SIZE = 9;

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const statusStyles: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-600 border-amber-500/30",
  approved: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
  rejected: "bg-destructive/15 text-destructive border-destructive/30",
};

const MySubmissions = () => {
  const navigate = useNavigate();
  const [checkedAuth, setCheckedAuth] = useState(false);
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [visible, setVisible] = useState(PAGE_SIZE);

  useEffect(() => {
    document.title = "My Submissions | Hackverse";
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth?redirect=/my-submissions", { replace: true });
        return;
      }
      if (!mounted) return;
      setCheckedAuth(true);
      const { data, error } = await supabase
        .from("hackathon_submissions")
        .select("id,event_name,organizer,location,banner_image,reference_id,status,created_at,rejection_reason,published_hackathon_id")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });
      if (!mounted) return;
      if (error) setError(error.message);
      setRows((data as Row[]) ?? []);
    })();
    return () => { mounted = false; };
  }, [navigate]);

  const filtered = useMemo(() => {
    if (!rows) return [];
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (status !== "all" && r.status?.toLowerCase() !== status) return false;
      if (!q) return true;
      return (
        r.event_name.toLowerCase().includes(q) ||
        (r.reference_id ?? "").toLowerCase().includes(q)
      );
    });
  }, [rows, query, status]);

  const shown = filtered.slice(0, visible);

  useEffect(() => setVisible(PAGE_SIZE), [query, status]);

  const copyRef = async (ref: string) => {
    await navigator.clipboard.writeText(ref);
    toast({ title: "Reference copied", description: ref });
  };

  if (!checkedAuth) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container py-24" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-16 sm:py-24">
        <header className="mb-8">
          <div className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Your account
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            My <span className="gradient-text">Submissions</span>
          </h1>
          <p className="text-muted-foreground mt-3 max-w-xl">
            Track the status of every hackathon you've submitted for review.
          </p>
        </header>

        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title or reference ID…"
              className="h-12 pl-12 rounded-2xl bg-card border-2 focus-visible:border-primary"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {(["all", "pending", "approved", "rejected"] as StatusFilter[]).map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`px-4 h-12 rounded-2xl text-sm font-semibold capitalize whitespace-nowrap transition-all ${
                  status === s
                    ? "gradient-primary text-primary-foreground glow-primary"
                    : "bg-muted text-muted-foreground hover:bg-muted/70"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-destructive/40 bg-destructive/10 text-destructive p-4 mb-6">
            {error}
          </div>
        )}

        {rows === null ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
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
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 rounded-3xl border border-dashed border-border">
            <div className="text-6xl mb-4">🚀</div>
            <h2 className="text-2xl font-bold mb-2">
              {rows.length === 0 ? "No submissions yet" : "No matches"}
            </h2>
            <p className="text-muted-foreground mb-6">
              {rows.length === 0
                ? "Submit your first hackathon and it'll show up here."
                : "Try a different search or filter."}
            </p>
            {rows.length === 0 && (
              <Button asChild variant="hero">
                <Link to="/submit"><Rocket className="h-4 w-4 mr-2" />Submit Hackathon</Link>
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {shown.map((r) => {
                const st = (r.status || "pending").toLowerCase();
                return (
                  <article
                    key={r.id}
                    className="group bg-card rounded-3xl overflow-hidden border border-border hover:border-primary/30 hover-lift transition-all flex flex-col"
                  >
                    <div className="relative h-40 overflow-hidden bg-muted">
                      <img
                        src={bannerUrl(r.banner_image) || placeholder}
                        alt={r.event_name}
                        loading="lazy"
                        onError={(e) => ((e.currentTarget as HTMLImageElement).src = placeholder)}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                      <div className="absolute top-3 right-3">
                        <Badge className={`capitalize border ${statusStyles[st] ?? statusStyles.pending}`}>
                          {st}
                        </Badge>
                      </div>
                      <div className="absolute bottom-3 left-3 glass rounded-lg px-2.5 py-1 text-[11px] font-mono flex items-center gap-1.5">
                        <Calendar className="h-3 w-3 text-primary" />
                        {fmtDate(r.created_at)}
                      </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col">
                      <div className="text-xs text-muted-foreground mb-1">{r.organizer}</div>
                      <h2 className="font-bold text-lg leading-snug mb-2 line-clamp-2">
                        {r.event_name}
                      </h2>

                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                        <MapPin className="h-3.5 w-3.5 text-secondary" />
                        <span className="truncate">{r.location || "Location TBA"}</span>
                      </div>

                      {r.reference_id && (
                        <button
                          onClick={() => copyRef(r.reference_id!)}
                          className="flex items-center justify-between gap-2 mb-3 px-3 py-2 rounded-xl bg-muted/60 hover:bg-muted text-xs font-mono transition-colors"
                          title="Copy reference"
                        >
                          <span className="truncate">{r.reference_id}</span>
                          <Copy className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        </button>
                      )}

                      {st === "rejected" && r.rejection_reason && (
                        <div className="mb-3 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-xs text-destructive">
                          <div className="font-semibold mb-1">Rejection reason</div>
                          <p className="text-destructive/90">{r.rejection_reason}</p>
                        </div>
                      )}

                      <div className="mt-auto">
                        {st === "approved" && r.published_hackathon_id ? (
                          <Button variant="hero" size="sm" className="w-full" asChild>
                            <Link to={`/hackathon/${r.published_hackathon_id}`}>
                              <ExternalLink className="h-4 w-4 mr-2" />
                              View Public Hackathon
                            </Link>
                          </Button>
                        ) : (
                          <Button variant="outline" size="sm" className="w-full" disabled>
                            {st === "pending" ? "Awaiting review" : st === "approved" ? "Publishing soon" : "Not published"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {visible < filtered.length && (
              <div className="flex justify-center mt-10">
                <Button variant="outline" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
                  Load more ({filtered.length - visible} remaining)
                </Button>
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default MySubmissions;
