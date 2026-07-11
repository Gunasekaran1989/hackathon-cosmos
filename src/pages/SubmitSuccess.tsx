import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Code2, Copy, Check, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";
import { toast } from "@/hooks/use-toast";

const REDIRECT_SECONDS = 8;

const generateReferenceId = () => {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `HV-${ts}-${rand}`;
};

const SubmitSuccess = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [secondsLeft, setSecondsLeft] = useState(REDIRECT_SECONDS);
  const [copied, setCopied] = useState(false);
  const referenceId = useMemo(() => params.get("ref") || generateReferenceId(), [params]);

  useEffect(() => {
    trackEvent("submission_success_page_view", {
      path: "/submit/success",
      reference_id: referenceId,
    });
  }, [referenceId]);

  useEffect(() => {
    if (secondsLeft <= 0) {
      navigate("/", { replace: true });
      return;
    }
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft, navigate]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referenceId);
      setCopied(true);
      trackEvent("submission_reference_copy", { reference_id: referenceId });
      toast({ title: "Reference copied", description: referenceId });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "Copy failed",
        description: "Please select and copy the reference manually.",
        variant: "destructive",
      });
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
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Clock className="h-3.5 w-3.5" /> Pending review
            </div>
            <p className="text-muted-foreground">
              Thanks for sharing your event. Every submission is reviewed by our team before it's
              published — we'll email you within 48 hours once your hackathon goes live.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card/40 p-5 text-left space-y-2">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Your submission reference
            </p>
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <code className="font-mono text-lg sm:text-xl text-foreground break-all">
                {referenceId}
              </code>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopy}
                aria-label="Copy reference ID"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" /> Copy reference
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Keep this ID handy — include it in any follow-up emails so we can locate your event quickly.
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
