import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Code2, Loader2 } from "lucide-react";

const ResetPassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    document.title = "Set new password — hackverse";
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      return toast({ title: "Passwords don't match", variant: "destructive" });
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) return toast({ title: "Couldn't update password", description: error.message, variant: "destructive" });
    toast({ title: "Password updated", description: "You're signed in." });
    navigate("/profile", { replace: true });
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
          <h1 className="text-2xl font-bold text-center mb-1">Set a new password</h1>
          <p className="text-sm text-muted-foreground text-center mb-6">
            Choose a strong password you haven't used before.
          </p>

          {!ready ? (
            <p className="text-sm text-center text-muted-foreground">
              Open this page from the reset link in your email to continue.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rp-pw">New password</Label>
                <Input id="rp-pw" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rp-pw2">Confirm password</Label>
                <Input id="rp-pw2" type="password" required minLength={6} value={confirm} onChange={(e) => setConfirm(e.target.value)} />
              </div>
              <Button type="submit" variant="hero" className="w-full" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Update password
              </Button>
            </form>
          )}
        </Card>
      </div>
    </main>
  );
};

export default ResetPassword;
