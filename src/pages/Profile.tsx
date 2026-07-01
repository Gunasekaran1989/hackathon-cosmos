import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Code2, Loader2, LogOut, ArrowLeft } from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    document.title = "Your profile — hackverse";
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) navigate("/auth", { replace: true });
    });
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth", { replace: true });
        return;
      }
      setUser(user);
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, avatar_url")
        .eq("id", user.id)
        .maybeSingle();
      setDisplayName(profile?.display_name ?? "");
      setAvatarUrl(profile?.avatar_url ?? "");
      setLoading(false);
    })();
    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName, avatar_url: avatarUrl || null })
      .eq("id", user.id);
    setSaving(false);
    if (error) return toast({ title: "Couldn't save profile", description: error.message, variant: "destructive" });
    toast({ title: "Profile updated" });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/", { replace: true });
  };

  const initials = (displayName || user?.email || "?").slice(0, 2).toUpperCase();

  return (
    <main className="min-h-screen px-4 py-16 bg-gradient-to-b from-background to-muted/30">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative h-10 w-10 rounded-xl gradient-primary grid place-items-center glow-primary group-hover:scale-110 transition-transform">
              <Code2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-2xl tracking-tight">
              hack<span className="gradient-text">verse</span>
            </span>
          </Link>
          <Button asChild variant="ghost" size="sm">
            <Link to="/"><ArrowLeft className="h-4 w-4 mr-1" />Home</Link>
          </Button>
        </div>

        <Card className="p-6 md:p-8">
          {loading ? (
            <div className="grid place-items-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="flex items-center gap-4 mb-8">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={avatarUrl} alt={displayName} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <h1 className="text-2xl font-bold truncate">{displayName || "Your profile"}</h1>
                  <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
                </div>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="p-name">Display name</Label>
                  <Input id="p-name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="p-avatar">Avatar URL</Label>
                  <Input id="p-avatar" type="url" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://…" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={user?.email ?? ""} disabled />
                </div>
                <div className="flex flex-wrap gap-3 pt-2">
                  <Button type="submit" variant="hero" disabled={saving}>
                    {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Save changes
                  </Button>
                  <Button asChild type="button" variant="outline">
                    <Link to="/forgot-password">Change password</Link>
                  </Button>
                  <Button type="button" variant="ghost" onClick={handleSignOut} className="ml-auto">
                    <LogOut className="h-4 w-4 mr-1" />Sign out
                  </Button>
                </div>
              </form>
            </>
          )}
        </Card>
      </div>
    </main>
  );
};

export default Profile;
