import { Link, useNavigate, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Code2, CheckCircle2, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { trackEvent } from "@/lib/analytics";
import BannerUpload from "@/components/BannerUpload";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

const perks = [
  "Free listing — organizers never pay to submit events.",
  "Reach a global network of builders, students, and pros.",
  "Reviewed within 48 hours before going live.",
];

const Submit = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [bannerPath, setBannerPath] = useState<string>("");
  const [eventName, setEventName] = useState<string>("");
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    trackEvent("submit_page_view", { path: "/submit" });
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
      setAuthChecked(true);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (authChecked && !user) {
    return <Navigate to="/auth?redirect=/submit" replace />;
  }

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = {
      event_name: String(data.get("event_name") || "").trim(),
      organizer: String(data.get("organizer") || "").trim(),
      email: String(data.get("email") || "").trim(),
      website: String(data.get("website") || "").trim(),
      format: String(data.get("format") || ""),
      start_date: String(data.get("start_date") || ""),
      end_date: String(data.get("end_date") || ""),
      location: String(data.get("location") || "").trim(),
      prize_pool: String(data.get("prize_pool") || "").trim(),
      description: String(data.get("description") || "").trim(),
    };
    const startedAt = performance.now();
    trackEvent("submission_form_submit", { format: payload.format });

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
      toast.error("Please enter a valid contact email.");
      return;
    }
    if (payload.website && !/^https?:\/\//i.test(payload.website)) {
      toast.error("Website must start with http:// or https://");
      return;
    }

    setSubmitting(true);
    const referenceId = `HV-${Date.now().toString(36).toUpperCase()}`;
    const { error } = await supabase.from("hackathon_submissions").insert({
      user_id: user.id,
      status: "pending",
      event_name: payload.event_name,
      organizer: payload.organizer,
      email: payload.email,
      website: payload.website || null,
      format: payload.format || null,
      location: payload.location || null,
      start_date: payload.start_date || null,
      end_date: payload.end_date || null,
      prize_pool: payload.prize_pool || null,
      description: payload.description,
      banner_image: bannerPath || null,
      reference_id: referenceId,
    });
    setSubmitting(false);

    if (error) {
      trackEvent("submission_form_error", {
        format: payload.format,
        reason: "submission_insert_failed",
        duration_ms: Math.round(performance.now() - startedAt),
      });
      console.error("[submit] insert error:", error.message);
      toast.error("We couldn't save your submission. Please try again.");
      return;
    }

    form.reset();
    setBannerPath("");
    setEventName("");
    trackEvent("submission_form_success", {
      format: payload.format,
      duration_ms: Math.round(performance.now() - startedAt),
    });
    toast.success("Submission received — we'll review before publishing.");
    navigate(`/submit/success?ref=${encodeURIComponent(referenceId)}`);
  };

  if (!authChecked) {
    return (
      <main className="min-h-screen grid place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl gradient-primary grid place-items-center glow-primary">
              <Code2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">hack<span className="gradient-text">verse</span></span>
          </Link>
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← Back to home</Link>
        </div>
      </header>

      <article className="container max-w-5xl py-16 sm:py-24 space-y-12">
        <div>
          <nav className="text-xs text-muted-foreground mb-4" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-foreground">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">Submit</span>
          </nav>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs font-medium mb-4">
            <Sparkles className="h-3.5 w-3.5" /> Free for organizers
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            Submission <span className="gradient-text">Form</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Tell us about your hackathon. Every submission is reviewed by our team before it's published to the
            public directory — you'll get an email once it's approved.
          </p>
        </div>

        <section className="grid sm:grid-cols-3 gap-4">
          {perks.map(p => (
            <div key={p} className="glass rounded-2xl p-5 flex gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">{p}</p>
            </div>
          ))}
        </section>

        <section className="glass rounded-2xl p-6 sm:p-8">
          <h2 className="text-2xl font-bold mb-1">Event details</h2>
          <p className="text-sm text-muted-foreground mb-6">
            All fields marked required. Your submission will be marked <strong>Pending</strong> and reviewed
            before publication (usually within 48 hours).
          </p>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="event_name">Event name *</Label>
                <Input id="event_name" name="event_name" required maxLength={120} placeholder="Hackverse Global 2026" value={eventName} onChange={(e) => setEventName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="organizer">Organizer / Company *</Label>
                <Input id="organizer" name="organizer" required maxLength={120} placeholder="Acme Labs" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Contact email *</Label>
                <Input id="email" name="email" type="email" required maxLength={255} placeholder="you@org.com" defaultValue={user?.email ?? ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Event website</Label>
                <Input id="website" name="website" type="url" maxLength={255} placeholder="https://…" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="format">Format *</Label>
                <select
                  id="format"
                  name="format"
                  required
                  defaultValue=""
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="" disabled>Select format</option>
                  <option value="online">Online</option>
                  <option value="in_person">In-person</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" name="location" maxLength={120} placeholder="City, Country or 'Global'" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="start_date">Start date *</Label>
                <Input id="start_date" name="start_date" type="date" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">End date *</Label>
                <Input id="end_date" name="end_date" type="date" required />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="prize_pool">Prize pool</Label>
                <Input id="prize_pool" name="prize_pool" maxLength={60} placeholder="$50,000 USD" />
              </div>
            </div>
            <BannerUpload
              value={bannerPath || null}
              onChange={setBannerPath}
              slugSource={eventName}
            />
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                name="description"
                required
                rows={6}
                maxLength={2000}
                placeholder="Themes, tracks, who should join, sponsors…"
              />
            </div>
            <div className="flex items-center justify-between gap-4 pt-2">
              <p className="text-xs text-muted-foreground">
                By submitting you agree to our review guidelines. No payment required.
              </p>
              <Button type="submit" disabled={submitting} className="gradient-primary glow-primary">
                {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {submitting ? "Submitting…" : "Submit for review"}
              </Button>
            </div>
          </form>
        </section>
      </article>
    </main>
  );
};

export default Submit;
