import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { Github, Globe, Linkedin, Loader2, LogOut, MapPin, Upload, Award, Users, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge as UIBadge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useAuthUser } from "@/hooks/useAuthUser";
import BadgeCard from "@/components/BadgeCard";
import { loadDashboardData, profileCompletion, type DashboardData } from "@/lib/userData";
import { ALLOWED_AVATAR_TYPES, MAX_AVATAR_BYTES, resolveAvatarUrl, uploadAvatar } from "@/lib/avatar";

const optionalUrl = z
  .string()
  .trim()
  .max(300)
  .refine((v) => v === "" || /^https?:\/\/[^\s]+\.[^\s]+$/i.test(v), { message: "Enter a valid URL starting with http(s)://" });

const schema = z.object({
  full_name: z.string().trim().max(100),
  display_name: z.string().trim().max(100),
  username: z.string().trim().max(40).refine((v) => v === "" || /^[a-zA-Z0-9_.-]+$/.test(v), {
    message: "Letters, numbers, dots, dashes and underscores only",
  }),
  bio: z.string().trim().max(600),
  location: z.string().trim().max(120),
  country: z.string().trim().max(80),
  city: z.string().trim().max(80),
  company: z.string().trim().max(120),
  job_title: z.string().trim().max(120),
  website: optionalUrl,
  github_url: optionalUrl,
  linkedin_url: optionalUrl,
  skills: z.string().trim().max(300),
});

type FormState = z.infer<typeof schema>;

const EMPTY: FormState = {
  full_name: "", display_name: "", username: "", bio: "", location: "", country: "", city: "",
  company: "", job_title: "", website: "", github_url: "", linkedin_url: "", skills: "",
};

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, userId, loading: authLoading } = useAuthUser();
  const [data, setData] = useState<DashboardData | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [avatarPath, setAvatarPath] = useState<string>("");
  const [avatarSrc, setAvatarSrc] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { document.title = "Your profile — hackverse"; }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!userId) { navigate("/auth?redirect=/profile", { replace: true }); return; }
    let mounted = true;
    (async () => {
      const d = await loadDashboardData(userId);
      if (!mounted) return;
      setData(d);
      const p = d.profile;
      if (!p) {
        // Guide the user through completion by seeding a profile row if the trigger missed it.
        await supabase.from("profiles").insert({ id: userId }).select().maybeSingle();
      }
      setForm({
        full_name: p?.full_name ?? "",
        display_name: p?.display_name ?? "",
        username: p?.username ?? "",
        bio: p?.bio ?? "",
        location: p?.location ?? "",
        country: p?.country ?? "",
        city: p?.city ?? "",
        company: p?.company ?? "",
        job_title: p?.job_title ?? "",
        website: p?.website ?? "",
        github_url: p?.github_url ?? "",
        linkedin_url: p?.linkedin_url ?? "",
        skills: (p?.skills ?? []).join(", "),
      });
      setAvatarPath(p?.avatar_url ?? "");
      setAvatarSrc(await resolveAvatarUrl(p?.avatar_url));
    })();
    return () => { mounted = false; };
  }, [userId, authLoading, navigate]);

  const earnedMap = useMemo(() => {
    const m = new Map<string, string>();
    data?.earned.forEach((e) => m.set(e.badge_id, e.awarded_at));
    return m;
  }, [data]);

  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleAvatar = async (file: File) => {
    if (!userId) return;
    if (!ALLOWED_AVATAR_TYPES.includes(file.type)) return toast({ title: "Only JPEG, PNG or WebP images are allowed", variant: "destructive" });
    if (file.size > MAX_AVATAR_BYTES) return toast({ title: "Image must be 2 MB or smaller", variant: "destructive" });
    setUploading(true);
    try {
      const path = await uploadAvatar(file, userId);
      setAvatarPath(path);
      setAvatarSrc(URL.createObjectURL(file));
      toast({ title: "Avatar uploaded", description: "Remember to save your changes." });
    } catch (e: unknown) {
      toast({ title: "Upload failed", description: e instanceof Error ? e.message : "Try again", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const errs: Partial<Record<keyof FormState, string>> = {};
      parsed.error.issues.forEach((i) => { errs[i.path[0] as keyof FormState] = i.message; });
      setErrors(errs);
      return toast({ title: "Please fix the highlighted fields", variant: "destructive" });
    }
    setErrors({});
    setSaving(true);
    const v = parsed.data;
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: v.full_name || null,
        display_name: v.display_name || null,
        username: v.username || null,
        bio: v.bio || null,
        location: v.location || null,
        country: v.country || null,
        city: v.city || null,
        company: v.company || null,
        job_title: v.job_title || null,
        website: v.website || null,
        github_url: v.github_url || null,
        linkedin_url: v.linkedin_url || null,
        skills: v.skills ? v.skills.split(",").map((s) => s.trim()).filter(Boolean) : [],
        avatar_url: avatarPath || null,
      })
      .eq("id", userId);
    setSaving(false);
    if (error) {
      console.error("[profile] save error:", error.message);
      const msg = error.message.includes("profiles_username_key")
        ? "That username is already taken."
        : "Unable to save your profile right now. Please try again.";
      return toast({ title: "Couldn't save profile", description: msg, variant: "destructive" });
    }
    toast({ title: "Profile updated" });
    if (userId) setData(await loadDashboardData(userId));
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/", { replace: true });
  };

  const initials = (form.full_name || form.display_name || user?.email || "?").slice(0, 2).toUpperCase();
  const completion = profileCompletion(data?.profile ?? null);
  const stats = data?.stats;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container pt-24 pb-16 sm:pt-28">
        {authLoading || !data ? (
          <div className="space-y-4">
            <Skeleton className="h-40 rounded-2xl" />
            <Skeleton className="h-96 rounded-2xl" />
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Header + summary */}
            <div className="lg:col-span-3">
              <Card className="p-6 md:p-8 overflow-hidden relative">
                <div className="absolute inset-x-0 top-0 h-24 gradient-primary opacity-10" />
                <div className="relative flex flex-col sm:flex-row gap-6 items-start">
                  <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                    <AvatarImage src={avatarSrc} alt={form.full_name || "Avatar"} />
                    <AvatarFallback className="text-xl">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight truncate">
                      {form.full_name || form.display_name || "Your profile"}
                    </h1>
                    {form.username && <p className="text-sm text-muted-foreground">@{form.username}</p>}
                    {(form.job_title || form.company) && (
                      <p className="text-sm mt-1">
                        {[form.job_title, form.company].filter(Boolean).join(" · ")}
                      </p>
                    )}
                    {(form.location || form.city || form.country) && (
                      <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {form.location || [form.city, form.country].filter(Boolean).join(", ")}
                      </p>
                    )}
                    {form.bio && <p className="text-sm mt-3 max-w-2xl">{form.bio}</p>}

                    <div className="flex flex-wrap items-center gap-4 mt-4 text-sm">
                      <span className="flex items-center gap-1"><Users className="h-4 w-4 text-primary" />{stats?.participations ?? 0} participations</span>
                      <span className="flex items-center gap-1"><FileText className="h-4 w-4 text-primary" />{stats?.approved ?? 0} contributions</span>
                      <span className="flex items-center gap-1"><Award className="h-4 w-4 text-primary" />{stats?.badges ?? 0} badges</span>
                    </div>

                    {form.skills && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {form.skills.split(",").map((s) => s.trim()).filter(Boolean).map((s) => (
                          <UIBadge key={s} variant="secondary">{s}</UIBadge>
                        ))}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2 mt-5">
                      {form.github_url && (
                        <Button asChild variant="outline" size="sm">
                          <a href={form.github_url} target="_blank" rel="noopener noreferrer"><Github className="h-4 w-4 mr-1" />GitHub</a>
                        </Button>
                      )}
                      {form.linkedin_url && (
                        <Button asChild variant="outline" size="sm">
                          <a href={form.linkedin_url} target="_blank" rel="noopener noreferrer"><Linkedin className="h-4 w-4 mr-1" />LinkedIn</a>
                        </Button>
                      )}
                      {form.website && (
                        <Button asChild variant="outline" size="sm">
                          <a href={form.website} target="_blank" rel="noopener noreferrer"><Globe className="h-4 w-4 mr-1" />Website</a>
                        </Button>
                      )}
                      <Button asChild variant="ghost" size="sm"><Link to="/dashboard">Dashboard</Link></Button>
                      <Button type="button" variant="ghost" size="sm" onClick={handleSignOut}>
                        <LogOut className="h-4 w-4 mr-1" />Sign out
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Edit form */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="font-semibold">Profile completion</h2>
                  <span className="font-bold">{completion.pct}%</span>
                </div>
                <Progress value={completion.pct} className="h-2" />
                {completion.missing.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-2">Missing: {completion.missing.join(", ")}</p>
                )}
              </Card>

              <Card className="p-6 md:p-8">
                <h2 className="text-lg font-bold mb-6">Personal information</h2>
                <form onSubmit={handleSave} className="space-y-5">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-14 w-14">
                      <AvatarImage src={avatarSrc} alt="" />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={() => fileRef.current?.click()}>
                        {uploading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Upload className="h-4 w-4 mr-1" />}
                        Upload avatar
                      </Button>
                      <p className="text-xs text-muted-foreground mt-1">JPEG, PNG or WebP · up to 2 MB</p>
                    </div>
                    <input
                      ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) handleAvatar(f); e.target.value = ""; }}
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field id="full_name" label="Full name" value={form.full_name} onChange={set("full_name")} error={errors.full_name} />
                    <Field id="username" label="Username" value={form.username} onChange={set("username")} error={errors.username} placeholder="janedoe" />
                    <Field id="display_name" label="Display name" value={form.display_name} onChange={set("display_name")} error={errors.display_name} />
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" value={user?.email ?? ""} disabled />
                      <p className="text-xs text-muted-foreground">Managed by your account sign-in.</p>
                    </div>
                    <Field id="company" label="Company / organization" value={form.company} onChange={set("company")} error={errors.company} />
                    <Field id="job_title" label="Job title / role" value={form.job_title} onChange={set("job_title")} error={errors.job_title} />
                    <Field id="location" label="Location" value={form.location} onChange={set("location")} error={errors.location} placeholder="Chennai, India" />
                    <Field id="country" label="Country" value={form.country} onChange={set("country")} error={errors.country} />
                    <Field id="city" label="City" value={form.city} onChange={set("city")} error={errors.city} />
                    <Field id="website" label="Website" value={form.website} onChange={set("website")} error={errors.website} placeholder="https://…" />
                    <Field id="github_url" label="GitHub URL" value={form.github_url} onChange={set("github_url")} error={errors.github_url} placeholder="https://github.com/…" />
                    <Field id="linkedin_url" label="LinkedIn URL" value={form.linkedin_url} onChange={set("linkedin_url")} error={errors.linkedin_url} placeholder="https://linkedin.com/in/…" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="skills">Skills / interests</Label>
                    <Input id="skills" value={form.skills} onChange={set("skills")} placeholder="React, AI, Web3" />
                    <p className="text-xs text-muted-foreground">Comma separated.</p>
                    {errors.skills && <p className="text-xs text-destructive">{errors.skills}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio / about me</Label>
                    <Textarea id="bio" rows={4} value={form.bio} onChange={set("bio")} maxLength={600} />
                    {errors.bio && <p className="text-xs text-destructive">{errors.bio}</p>}
                  </div>

                  <div className="flex flex-wrap gap-3 pt-2">
                    <Button type="submit" variant="hero" disabled={saving}>
                      {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Save changes
                    </Button>
                    <Button asChild type="button" variant="outline"><Link to="/forgot-password">Change password</Link></Button>
                  </div>
                </form>
              </Card>
            </div>

            {/* Badges */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold">Badges</h2>
              {stats?.badges === 0 && (
                <p className="text-sm text-muted-foreground">Start participating and contributing to earn your first badge.</p>
              )}
              {data.badges.map((b) => (
                <BadgeCard key={b.id} badge={b} earnedAt={earnedMap.get(b.id)} stats={data.stats} />
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

function Field({
  id, label, value, onChange, error, placeholder,
}: {
  id: string; label: string; value: string; error?: string; placeholder?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} value={value} onChange={onChange} placeholder={placeholder} />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export default Profile;
