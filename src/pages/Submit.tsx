import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Code2, CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { trackEvent } from "@/lib/analytics";
import BannerUpload from "@/components/BannerUpload";

const perks = [
  "Free listing — organizers never pay to submit events.",
  "Reach a global network of builders, students, and pros.",
  "Edit anytime, get analytics on views and signups.",
];

const Submit = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [bannerPath, setBannerPath] = useState<string>("");
  const [eventName, setEventName] = useState<string>("");

  useEffect(() => {
    trackEvent("submit_page_view", { path: "/submit" });
  }, []);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = {
      event_name: String(data.get("event_name") || ""),
      organizer: String(data.get("organizer") || ""),
      email: String(data.get("email") || ""),
      website: String(data.get("website") || ""),
      format: String(data.get("format") || ""),
      start_date: String(data.get("start_date") || ""),
      end_date: String(data.get("end_date") || ""),
      location: String(data.get("location") || ""),
      prize_pool: String(data.get("prize_pool") || ""),
      description: String(data.get("description") || ""),
    };
    setSubmitting(true);
    const startedAt = performance.now();
    trackEvent("submission_form_submit", { format: payload.format });

    try {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
        throw new Error("invalid_email");
      }
      if (payload.website && !/^https?:\/\//i.test(payload.website)) {
        throw new Error("invalid_website");
      }

      setTimeout(() => {
        setSubmitting(false);
        form.reset();
        trackEvent("submission_form_success", {
          format: payload.format,
          duration_ms: Math.round(performance.now() - startedAt),
        });
        toast.success("Submission received — we'll review and publish within 48 hours.");
        navigate("/submit/success");
      }, 600);
    } catch (err) {
      setSubmitting(false);
      const reason = err instanceof Error ? err.message : "unknown";
      trackEvent("submission_form_error", {
        format: payload.format,
        reason,
        duration_ms: Math.round(performance.now() - startedAt),
      });
      toast.error("Please check your details and try again.");
    }
  };

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
            Organizers submit events for free. Tell us about your hackathon and we'll publish it to thousands of
            builders.
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
          <p className="text-sm text-muted-foreground mb-6">All fields marked required. Review takes up to 48h.</p>
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
                <Input id="email" name="email" type="email" required maxLength={255} placeholder="you@org.com" />
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
                {submitting ? "Submitting…" : "Submit event"}
              </Button>
            </div>
          </form>
        </section>
      </article>
    </main>
  );
};

export default Submit;
