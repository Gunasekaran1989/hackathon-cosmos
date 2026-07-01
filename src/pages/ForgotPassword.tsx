import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Code2, Loader2, ArrowLeft } from "lucide-react";

const ForgotPassword = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    document.title = "Reset password — hackverse";
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) return toast({ title: "Couldn't send reset email", description: error.message, variant: "destructive" });
    setSent(true);
    toast({ title: "Check your inbox", description: "We sent a password reset link." });
  };

  return (
    <main className="min-h-screen grid place-items-center px-4 py-16 bg-gradient-to-b from-background to-muted/30">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8 group">
          <div className="relative h-10 w-10 rounded-xl gradient-primary grid place-items-center glow-primary group-hover:scale-110 transition-transform">
            <Code2 className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-2xl tracking-tight">
            hack<span className="gradient-text">verse</span>
          </span>
        </Link>

        <Card className="p-6 md:p-8">
          <h1 className="text-2xl font-bold text-center mb-1">Forgot your password?</h1>
          <p className="text-sm text-muted-foreground text-center mb-6">
            Enter your email and we'll send you a link to reset it.
          </p>

          {sent ? (
            <div className="text-center space-y-4">
              <p className="text-sm">
                If an account exists for <span className="font-medium">{email}</span>, a reset link is on its way.
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link to="/auth"><ArrowLeft className="h-4 w-4 mr-2" />Back to sign in</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fp-email">Email</Label>
                <Input id="fp-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <Button type="submit" variant="hero" className="w-full" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Send reset link
              </Button>
              <div className="text-center">
                <Link to="/auth" className="text-sm text-muted-foreground hover:text-foreground">
                  Back to sign in
                </Link>
              </div>
            </form>
          )}
        </Card>
      </div>
    </main>
  );
};

export default ForgotPassword;
