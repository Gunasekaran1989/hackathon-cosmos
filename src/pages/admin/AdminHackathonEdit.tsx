import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import BannerUpload from "@/components/BannerUpload";
import { bannerUrl } from "@/lib/banner";

type Form = {
  title: string; slug: string; short_description: string; description: string;
  organizer: string; organizer_logo: string; banner_image: string;
  website_url: string; registration_url: string;
  country: string; city: string; location: string;
  mode: string; event_type: string;
  prize_pool: string;
  start_date: string; end_date: string; registration_deadline: string;
  participant_limit: string;
  tags: string;
  featured: boolean; status: string;
};

const empty: Form = {
  title: "", slug: "", short_description: "", description: "",
  organizer: "", organizer_logo: "", banner_image: "",
  website_url: "", registration_url: "",
  country: "", city: "", location: "",
  mode: "online", event_type: "",
  prize_pool: "",
  start_date: "", end_date: "", registration_deadline: "",
  participant_limit: "",
  tags: "",
  featured: false, status: "pending",
};

export default function AdminHackathonEdit() {
  const { id } = useParams();
  const nav = useNavigate();
  const [form, setForm] = useState<Form | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    document.title = "Edit hackathon — hackverse admin";
    if (!id) return;
    supabase.from("hackathons").select("*").eq("id", id).maybeSingle().then(({ data, error }) => {
      if (error || !data) { toast.error("Not found"); nav("/admin/hackathons"); return; }
      setForm({
        title: data.title ?? "", slug: (data as any).slug ?? "",
        short_description: (data as any).short_description ?? "",
        description: data.description ?? "",
        organizer: data.organizer ?? "",
        organizer_logo: (data as any).organizer_logo ?? "",
        banner_image: data.banner_image ?? "",
        website_url: data.website_url ?? "",
        registration_url: (data as any).registration_url ?? "",
        country: data.country ?? "", city: data.city ?? "",
        location: (data as any).location ?? "",
        mode: (data as any).mode ?? "online",
        event_type: (data as any).event_type ?? "",
        prize_pool: data.prize_pool != null ? String(data.prize_pool) : "",
        start_date: data.start_date ?? "",
        end_date: data.end_date ?? "",
        registration_deadline: (data as any).registration_deadline ?? "",
        participant_limit: (data as any).participant_limit != null ? String((data as any).participant_limit) : "",
        tags: (data.tags ?? []).join(", "),
        featured: (data as any).featured ?? false,
        status: (data as any).status ?? "pending",
      });
    });
  }, [id, nav]);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm(f => f ? { ...f, [k]: v } : f);

  const save = async () => {
    if (!form || !id) return;
    if (!form.title.trim() || !form.organizer.trim() || !form.start_date) {
      toast.error("Title, organizer, and start date are required");
      return;
    }
    setSaving(true);
    const payload = {
      title: form.title.trim(),
      slug: form.slug.trim() || null,
      short_description: form.short_description || null,
      description: form.description || null,
      organizer: form.organizer.trim(),
      organizer_logo: form.organizer_logo || null,
      banner_image: form.banner_image || null,
      website_url: form.website_url || null,
      registration_url: form.registration_url || null,
      country: form.country || null,
      city: form.city || null,
      location: form.location || null,
      mode: form.mode || null,
      event_type: form.event_type || null,
      prize_pool: form.prize_pool ? Number(form.prize_pool) : null,
      start_date: form.start_date,
      end_date: form.end_date || null,
      registration_deadline: form.registration_deadline || null,
      participant_limit: form.participant_limit ? Number(form.participant_limit) : null,
      tags: form.tags ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
      featured: form.featured,
      status: form.status,
    };
    const { error } = await supabase.from("hackathons").update(payload).eq("id", id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Hackathon updated");
    nav("/admin/hackathons");
  };

  if (!form) {
    return <AdminLayout><Skeleton className="h-96 w-full" /></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <Button variant="ghost" size="sm" asChild className="mb-2"><Link to="/admin/hackathons"><ArrowLeft className="h-4 w-4 mr-1" /> Back</Link></Button>
          <h1 className="text-2xl md:text-3xl font-black">Edit hackathon</h1>
        </div>
        <Button onClick={save} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save changes
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>Basics</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Field label="Title *"><Input value={form.title} onChange={e => set("title", e.target.value)} /></Field>
              <Field label="Slug"><Input value={form.slug} onChange={e => set("slug", e.target.value)} placeholder="my-hackathon-2026" /></Field>
              <Field label="Short description"><Textarea rows={2} value={form.short_description} onChange={e => set("short_description", e.target.value)} /></Field>
              <Field label="Full description"><Textarea rows={6} value={form.description} onChange={e => set("description", e.target.value)} /></Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Organizer & media</CardTitle></CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <Field label="Organizer *"><Input value={form.organizer} onChange={e => set("organizer", e.target.value)} /></Field>
              <Field label="Organizer logo URL"><Input value={form.organizer_logo} onChange={e => set("organizer_logo", e.target.value)} /></Field>
              <Field label="Banner image URL" className="md:col-span-2"><Input value={form.banner_image} onChange={e => set("banner_image", e.target.value)} /></Field>
              <Field label="Website URL"><Input value={form.website_url} onChange={e => set("website_url", e.target.value)} /></Field>
              <Field label="Registration URL"><Input value={form.registration_url} onChange={e => set("registration_url", e.target.value)} /></Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Location & format</CardTitle></CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <Field label="Country"><Input value={form.country} onChange={e => set("country", e.target.value)} /></Field>
              <Field label="City"><Input value={form.city} onChange={e => set("city", e.target.value)} /></Field>
              <Field label="Venue / location" className="md:col-span-2"><Input value={form.location} onChange={e => set("location", e.target.value)} /></Field>
              <Field label="Mode">
                <Select value={form.mode} onValueChange={v => set("mode", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-popover">
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="in-person">In-person</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Event type"><Input value={form.event_type} onChange={e => set("event_type", e.target.value)} placeholder="Student, Enterprise, AI…" /></Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Dates & capacity</CardTitle></CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <Field label="Start date *"><Input type="date" value={form.start_date} onChange={e => set("start_date", e.target.value)} /></Field>
              <Field label="End date"><Input type="date" value={form.end_date} onChange={e => set("end_date", e.target.value)} /></Field>
              <Field label="Registration deadline"><Input type="date" value={form.registration_deadline} onChange={e => set("registration_deadline", e.target.value)} /></Field>
              <Field label="Participant limit"><Input type="number" value={form.participant_limit} onChange={e => set("participant_limit", e.target.value)} /></Field>
              <Field label="Prize pool (USD)"><Input type="number" value={form.prize_pool} onChange={e => set("prize_pool", e.target.value)} /></Field>
              <Field label="Tags (comma-separated)"><Input value={form.tags} onChange={e => set("tags", e.target.value)} placeholder="AI, Web3, Cloud" /></Field>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Publishing</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Field label="Status">
                <Select value={form.status} onValueChange={v => set("status", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-popover">
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div>
                  <Label>Featured</Label>
                  <p className="text-xs text-muted-foreground">Highlight on the homepage.</p>
                </div>
                <Switch checked={form.featured} onCheckedChange={v => set("featured", v)} />
              </div>
              {form.banner_image && (
                <div>
                  <Label className="text-xs">Banner preview</Label>
                  <img src={form.banner_image} alt="" className="w-full rounded-lg mt-2 aspect-video object-cover" />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <Label className="text-xs mb-1 block">{label}</Label>
      {children}
    </div>
  );
}
