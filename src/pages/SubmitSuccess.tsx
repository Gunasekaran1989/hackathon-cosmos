import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { CheckCircle2, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";

const REDIRECT_SECONDS = 6;

const SubmitSuccess = () => {
  const navigate = useNavigate();
  const [secondsLeft, setSecondsLeft] = useState(REDIRECT_SECONDS);

  useEffect(() => {
    trackEvent("submission_success_page_view", { path: "/submit/success" });
  }, []);

  useEffect(() => {
    if (secondsLeft <= 0) {
      navigate("/", { replace: true });
      return;
    }
    const t = setTimeout(() => setSecondsLeft(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft, navigate]);

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
        </div>
      </header>

      <section className="container max-w-2xl py-24 sm:py-32">
        <div className="glass rounded-3xl p-10 sm:p-12 text-center space-y-6">
          <div className="mx-auto h-16 w-16 rounded-full gradient-primary grid place-items-center glow-primary">
            <CheckCircle2 className="h-8 w-8 text-primary-foreground" />
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Submission <span className="gradient-text">received</span>
            </h1>
            <p className="text-muted-foreground">
              Thanks for sharing your event. Our team reviews submissions within 48 hours and you'll
              get a confirmation email once it's live.
            </p>
          </div>

          <p className="text-sm text-muted-foreground" aria-live="polite">
            Redirecting to the homepage in <span className="text-foreground font-medium">{secondsLeft}s</span>…
          </p>

          <div className="flex items-center justify-center gap-3 pt-2">
            <Button asChild className="gradient-primary glow-primary">
              <Link to="/">Go home now</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/submit">Submit another</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
};

export default SubmitSuccess;
