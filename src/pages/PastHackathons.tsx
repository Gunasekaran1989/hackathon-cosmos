import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { HackathonListCard, type HackathonListRow } from "@/components/HackathonListCard";

type Row = HackathonListRow;

const today = () => new Date().toISOString().slice(0, 10);

const PastHackathons = () => {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Past Hackathons | Hackverse";
    (async () => {
      const { data, error } = await supabase
        .from("hackathons")
        .select("id,title,organizer,banner_image,country,city,start_date,end_date,prize_pool,tags")
        .eq("status", "approved")
        .lt("end_date", today())
        .order("start_date", { ascending: false });
      if (error) {
        console.error("[past-hackathons] fetch error:", error.message);
        setError("Unable to load past hackathons. Please try again later.");
      }
      setRows((data as Row[]) ?? []);
    })();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-16 sm:py-24">
        <header className="mb-10">
          <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
            <Link to="/hackathons"><ArrowLeft className="h-4 w-4 mr-2" /> Back to active hackathons</Link>
          </Button>
          <div className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Archive
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            <span className="gradient-text">Past Hackathons</span>
          </h1>
          <p className="text-muted-foreground mt-3 max-w-xl">
            Events that have already ended, preserved for reference and inspiration.
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
            <h2 className="text-2xl font-bold mb-2">No past hackathons yet</h2>
            <p className="text-muted-foreground mb-6">Once events end they will appear here.</p>
            <Button asChild variant="hero"><Link to="/hackathons">Explore active events</Link></Button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {rows.map((h) => (
              <HackathonListCard key={h.id} h={h} badge="past" />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default PastHackathons;
