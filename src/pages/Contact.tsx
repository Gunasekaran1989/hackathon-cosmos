import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Code2, Mail, MessageSquare, Building2, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { trackEvent } from "@/lib/analytics";

const channels = [
  { icon: Mail, title: "General", desc: "Questions, feedback, or anything else.", value: "hello@hackverse.dev" },
  { icon: Building2, title: "Organizers", desc: "List your hackathon on Hackverse.", value: "organizers@hackverse.dev" },
  { icon: Megaphone, title: "Press", desc: "Media inquiries and partnerships.", value: "press@hackverse.dev" },
  { icon: MessageSquare, title: "Support", desc: "Account or technical issues.", value: "support@hackverse.dev" },
];

const Contact = () => {
  const [submitting, setSubmitting] = useState(false);
  const formOpenedRef = useRef(false);
  const formFocusedRef = useRef(false);

  useEffect(() => {
    trackEvent("contact_page_view", { path: "/guides/contact" });
  }, []);

  const handleFormOpen = () => {
    if (formOpenedRef.current) return;
    formOpenedRef.current = true;
    trackEvent("contact_form_open");
  };

  const handleFormFocus = (e: React.FocusEvent<HTMLFormElement>) => {
    handleFormOpen();
    if (formFocusedRef.current) return;
    formFocusedRef.current = true;
    const target = e.target as HTMLInputElement | HTMLTextAreaElement;
    trackEvent("contact_form_focus", { field: target.name || target.id || "unknown" });
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    setSubmitting(true);
    const data = new FormData(form);
    const topic = String(data.get("topic") || "");
    const startedAt = performance.now();
    trackEvent("contact_form_submit", { topic });

    try {
      // Basic client-side validation beyond the native required checks
      const email = String(data.get("email") || "");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error("invalid_email");
      }

      setTimeout(() => {
        setSubmitting(false);
        form.reset();
        trackEvent("contact_form_success", {
          topic,
          duration_ms: Math.round(performance.now() - startedAt),
        });
        toast.success("Message sent — we'll get back to you within 2 business days.");
      }, 500);
    } catch (err) {
      setSubmitting(false);
      const reason = err instanceof Error ? err.message : "unknown";
      trackEvent("contact_form_error", {
        topic,
        reason,
        duration_ms: Math.round(performance.now() - startedAt),
      });
      toast.error("We couldn't send your message. Please check your details and try again.");
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
            <span>Guides</span>
            <span className="mx-2">/</span>
            <span className="text-foreground">Contact</span>
          </nav>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            Get in <span className="gradient-text">touch</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Whether you're organizing a hackathon, looking to partner, or just have a question — we read every
            message. Pick the channel that fits, or send us a note below.
          </p>
        </div>

        <section className="grid sm:grid-cols-2 gap-4">
          {channels.map(c => (
            <div key={c.title} className="glass rounded-2xl p-5">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl gradient-primary grid place-items-center glow-primary shrink-0">
                  <c.icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold">{c.title}</div>
                  <p className="text-sm text-muted-foreground mb-2">{c.desc}</p>
                  <a
                    href={`mailto:${c.value}`}
                    className="text-sm gradient-text font-medium break-all"
                    onClick={() => trackEvent("contact_email_click", { channel: c.title, email: c.value })}
                  >
                    {c.value}
                  </a>
                </div>
              </div>
            </div>
          ))}
        </section>

        <section className="glass rounded-2xl p-6 sm:p-8">
          <h2 className="text-2xl font-bold mb-1">Send a message</h2>
          <p className="text-sm text-muted-foreground mb-6">We typically respond within 2 business days.</p>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" required placeholder="Ada Lovelace" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required placeholder="you@example.com" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="topic">Topic</Label>
              <Input id="topic" name="topic" required placeholder="Organizing, partnership, support…" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea id="message" name="message" required rows={6} placeholder="Tell us what's on your mind." />
            </div>
            <Button type="submit" disabled={submitting} className="gradient-primary glow-primary">
              {submitting ? "Sending…" : "Send message"}
            </Button>
          </form>
        </section>
      </article>
    </main>
  );
};

export default Contact;
