import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Activity as ActivityIcon, Award, CalendarClock, CheckCircle2, Clock, ExternalLink,
  FileText, Loader2, MapPin, Rocket, Users, XCircle,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge as UIBadge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BadgeCard from "@/components/BadgeCard";
import { useAuthUser } from "@/hooks/useAuthUser";
import {
  ACTIVITY_LABELS, loadDashboardData, profileCompletion, type DashboardData,
} from "@/lib/userData";

const PAGE_SIZE = 6;

const fmtDate = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "TBA";

const statusTone = (s: string) => {
  const v = s.toLowerCase();
  if (v === "approved" || v === "completed") return "bg-primary/10 text-primary border-primary/20";
  if (v === "rejected" || v === "cancelled") return "bg-destructive/10 text-destructive border-destructive/20";
  return "bg-muted text-muted-foreground border-border";
};

function StatCard({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: number }) {
  return (
    <Card className="p-4 sm:p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-muted grid place-items-center shrink-0">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="text-2xl font-bold leading-none">{value}</p>
          <p className="text-xs text-muted-foreground mt-1 truncate">{label}</p>
        </div>
      </div>
    </Card>
  );
}

function EmptyState({ title, action }: { title: string; action?: { to: string; label: string } }) {
  return (
    <Card className="p-10 text-center">
      <p className="text-muted-foreground">{title}</p>
      {action && (
        <Button asChild variant="hero" size="sm" className="mt-4">
          <Link to={action.to}>{action.label}</Link>
        </Button>
      )}
    </Card>
  );
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { userId, loading: authLoading } = useAuthUser();
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [partPage, setPartPage] = useState(1);
  const [subPage, setSubPage] = useState(1);

  useEffect(() => {
    document.title = "Your dashboard — hackverse";
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!userId) {
      navigate("/auth?redirect=/dashboard", { replace: true });
      return;
    }
    let mounted = true;
    loadDashboardData(userId)
      .then((d) => mounted && setData(d))
      .catch((e) => mounted && setError(e?.message ?? "Could not load your dashboard"));
    return () => { mounted = false; };
  }, [userId, authLoading, navigate]);

  const earnedMap = useMemo(() => {
    const m = new Map<string, string>();
    data?.earned.forEach((e) => m.set(e.badge_id, e.awarded_at));
    return m;
  }, [data]);

  const completion = profileCompletion(data?.profile ?? null);
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = (data?.participations ?? []).filter(
    (p) => p.hackathons?.start_date && p.hackathons.start_date >= today && p.participation_status !== "cancelled",
  );

  if (authLoading || (!data && !error)) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container py-24 space-y-4">
          <Skeleton className="h-10 w-64" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
          <Skeleton className="h-64 rounded-xl" />
        </main>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container py-32 text-center">
          <p className="text-destructive">{error}</p>
        </main>
      </div>
    );
  }

  const { stats, participations, submissions, badges, activity, profile } = data;
  const partSlice = participations.slice(0, partPage * PAGE_SIZE);
  const subSlice = submissions.slice(0, subPage * PAGE_SIZE);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container pt-24 pb-16 sm:pt-28">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
              Welcome back{profile?.full_name || profile?.display_name ? `, ${profile.full_name || profile.display_name}` : ""}
            </h1>
            <p className="text-muted-foreground mt-1">Your hackathon activity at a glance.</p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm"><Link to="/hackathons">Discover hackathons</Link></Button>
            <Button asChild variant="hero" size="sm"><Link to="/submit">Submit event</Link></Button>
          </div>
        </div>

        {completion.pct < 100 && (
          <Card className="p-5 mb-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-sm">Profile completion</p>
                  <span className="text-sm font-bold">{completion.pct}%</span>
                </div>
                <Progress value={completion.pct} className="h-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  Missing: {completion.missing.slice(0, 4).join(", ")}
                  {completion.missing.length > 4 ? ` +${completion.missing.length - 4} more` : ""}
                </p>
              </div>
              <Button asChild size="sm" variant="outline"><Link to="/profile">Complete profile</Link></Button>
            </div>
          </Card>
        )}

        <Tabs defaultValue="overview">
          <TabsList className="mb-6 flex-wrap h-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="participations">My participations</TabsTrigger>
            <TabsTrigger value="submissions">My submissions</TabsTrigger>
            <TabsTrigger value="badges">My badges</TabsTrigger>
            <TabsTrigger value="activity">Recent activity</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
              <StatCard icon={Users} label="Hackathons participated" value={stats.participations} />
              <StatCard icon={FileText} label="Hackathons submitted" value={stats.submissions} />
              <StatCard icon={CheckCircle2} label="Approved submissions" value={stats.approved} />
              <StatCard icon={Clock} label="Pending submissions" value={stats.pending} />
              <StatCard icon={XCircle} label="Rejected submissions" value={stats.rejected} />
              <StatCard icon={Award} label="Badges earned" value={stats.badges} />
              <StatCard icon={CalendarClock} label="Upcoming hackathons" value={stats.upcoming} />
              <StatCard icon={Rocket} label="Completed hackathons" value={stats.completed} />
            </div>

            <section>
              <h2 className="text-xl font-bold mb-4">Upcoming events</h2>
              {upcoming.length === 0 ? (
                <EmptyState title="No upcoming hackathons you're registered for." action={{ to: "/hackathons", label: "Discover hackathons" }} />
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {upcoming.slice(0, 6).map((p) => (
                    <Card key={p.id} className="p-5">
                      <p className="font-semibold truncate">{p.hackathons?.title}</p>
                      <p className="text-sm text-muted-foreground truncate">{p.hackathons?.organizer}</p>
                      <p className="text-sm mt-2 flex items-center gap-1"><CalendarClock className="h-4 w-4 text-primary" />{fmtDate(p.hackathons?.start_date)}</p>
                      <Button asChild variant="outline" size="sm" className="mt-4 w-full">
                        <Link to={`/hackathon/${p.hackathon_id}`}>View hackathon</Link>
                      </Button>
                    </Card>
                  ))}
                </div>
              )}
            </section>
          </TabsContent>

          <TabsContent value="participations">
            {participations.length === 0 ? (
              <EmptyState title="You haven't joined any hackathons yet." action={{ to: "/hackathons", label: "Discover hackathons" }} />
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {partSlice.map((p) => (
                    <Card key={p.id} className="p-5 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold truncate">{p.hackathons?.title ?? "Hackathon"}</p>
                        <UIBadge variant="outline" className={statusTone(p.participation_status)}>{p.participation_status}</UIBadge>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{p.hackathons?.organizer}</p>
                      <p className="text-sm flex items-center gap-1"><CalendarClock className="h-4 w-4 text-primary" />{fmtDate(p.hackathons?.start_date)}</p>
                      <p className="text-sm flex items-center gap-1 text-muted-foreground">
                        <MapPin className="h-4 w-4" />{p.hackathons?.location || p.hackathons?.mode || "—"}
                      </p>
                      <Button asChild variant="outline" size="sm" className="w-full mt-2">
                        <Link to={`/hackathon/${p.hackathon_id}`}>View hackathon</Link>
                      </Button>
                    </Card>
                  ))}
                </div>
                {partSlice.length < participations.length && (
                  <div className="text-center mt-6">
                    <Button variant="outline" onClick={() => setPartPage((p) => p + 1)}>Load more</Button>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="submissions">
            {submissions.length === 0 ? (
              <EmptyState title="You haven't submitted a hackathon yet." action={{ to: "/submit", label: "Submit a hackathon" }} />
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  {subSlice.map((s) => (
                    <Card key={s.id} className="p-5 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold truncate">{s.event_name}</p>
                        <UIBadge variant="outline" className={statusTone(s.status)}>{s.status}</UIBadge>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{s.organizer}</p>
                      <dl className="text-sm grid grid-cols-2 gap-x-4 gap-y-1 pt-1">
                        <dt className="text-muted-foreground">Submitted</dt><dd>{fmtDate(s.created_at)}</dd>
                        <dt className="text-muted-foreground">Reviewed</dt><dd>{s.reviewed_at ? fmtDate(s.reviewed_at) : "—"}</dd>
                        {s.reference_id && (<><dt className="text-muted-foreground">Reference</dt><dd className="font-mono text-xs">{s.reference_id}</dd></>)}
                      </dl>
                      {s.rejection_reason && (
                        <p className="text-sm text-destructive bg-destructive/5 rounded-lg p-2">{s.rejection_reason}</p>
                      )}
                      <div className="flex flex-wrap gap-2 pt-2">
                        <Button asChild variant="outline" size="sm"><Link to="/my-submissions">View submission</Link></Button>
                        {s.published_hackathon_id && (
                          <Button asChild variant="hero" size="sm">
                            <Link to={`/hackathon/${s.published_hackathon_id}`}>
                              View published hackathon <ExternalLink className="h-3.5 w-3.5 ml-1" />
                            </Link>
                          </Button>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
                {subSlice.length < submissions.length && (
                  <div className="text-center mt-6">
                    <Button variant="outline" onClick={() => setSubPage((p) => p + 1)}>Load more</Button>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="badges">
            {stats.badges === 0 && (
              <p className="text-muted-foreground mb-4">Start participating and contributing to earn your first badge.</p>
            )}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {badges.map((b) => (
                <BadgeCard key={b.id} badge={b} earnedAt={earnedMap.get(b.id)} stats={stats} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="activity">
            {activity.length === 0 ? (
              <EmptyState title="No activity yet — register for or submit a hackathon to get started." action={{ to: "/hackathons", label: "Discover hackathons" }} />
            ) : (
              <Card className="divide-y divide-border">
                {activity.map((a) => {
                  const meta = (a.metadata ?? {}) as Record<string, unknown>;
                  const name = (meta.title ?? meta.event_name ?? meta.name ?? "") as string;
                  return (
                    <div key={a.id} className="p-4 flex items-start gap-3">
                      <div className="h-8 w-8 rounded-lg bg-muted grid place-items-center shrink-0">
                        <ActivityIcon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium">
                          {ACTIVITY_LABELS[a.activity_type] ?? a.activity_type}
                          {name ? <span className="text-muted-foreground font-normal"> — {name}</span> : null}
                        </p>
                        <p className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                  );
                })}
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
