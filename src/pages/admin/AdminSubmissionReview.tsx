import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import BannerImage from "@/components/BannerImage";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  ArrowLeft, CheckCircle2, XCircle, Loader2, Calendar, MapPin, Trophy, Globe, Mail, User, Hash, Clock,
} from "lucide-react";

type Sub = {
  id: string;
  user_id: string;
  status: string;
  event_name: string;
  organizer: string;
  email: string;
  website: string | null;
  format: string | null;
  location: string | null;
  start_date: string | null;
  end_date: string | null;
  prize_pool: string | null;
  description: string | null;
  banner_image: string | null;
  reference_id: string | null;
  created_at: string;
  updated_at: string;
  rejection_reason: string | null;
  published_hackathon_id: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  admin_notes: string | null;
};

type ApproveResult = {
  success: boolean;
  hackathon_id: string;
  slug: string;
  submission_id: string;
};


export default function AdminSubmissionReview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [sub, setSub] = useState<Sub | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminNotes, setAdminNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [confirm, setConfirm] = useState<null | "approve" | "reject">(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    document.title = "Review submission — hackverse admin";
    if (!id) return;
    (async () => {
      const { data, error } = await supabase
        .from("hackathon_submissions")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) toast.error(error.message);
      const s = data as Sub | null;
      setSub(s);
      setAdminNotes(s?.admin_notes ?? "");
      setRejectionReason(s?.rejection_reason ?? "");
      setLoading(false);
    })();
  }, [id]);

  const saveNotes = async () => {
    if (!sub) return;
    const { error } = await supabase
      .from("hackathon_submissions")
      .update({ admin_notes: adminNotes })
      .eq("id", sub.id);
    if (error) return toast.error(error.message);
    toast.success("Notes saved");
  };

  const doApprove = async () => {
    if (!sub) return;
    setBusy(true);
    try {
      const { data, error } = await supabase.rpc("approve_hackathon_submission", {
        submission_id: sub.id,
        admin_notes_override: adminNotes || null,
      });
      if (error) throw error;
      const result = data as unknown as ApproveResult;
      toast.success("Submission approved and published");
      if (result?.hackathon_id) {
        setSub({ ...sub, status: "approved", published_hackathon_id: result.hackathon_id });
      }
      navigate("/admin/submissions");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to approve submission");
    } finally {
      setBusy(false);
      setConfirm(null);
    }
  };


  const doReject = async () => {
    if (!sub) return;
    if (!rejectionReason.trim()) {
      return toast.error("Rejection reason is required");
    }
    setBusy(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const adminId = userData.user?.id ?? null;
      const { error } = await supabase
        .from("hackathon_submissions")
        .update({
          status: "rejected",
          reviewed_at: new Date().toISOString(),
          reviewed_by: adminId,
          rejection_reason: rejectionReason.trim(),
          admin_notes: adminNotes || null,
        })
        .eq("id", sub.id);
      if (error) throw error;
      toast.success("Submission rejected");
      navigate("/admin/submissions");
    } catch (e: any) {
      toast.error(e.message ?? "Failed to reject");
    } finally {
      setBusy(false);
      setConfirm(null);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-64" />
          <Skeleton className="h-32" />
        </div>
      </AdminLayout>
    );
  }

  if (!sub) {
    return (
      <AdminLayout>
        <div className="text-center py-20 space-y-4">
          <h1 className="text-2xl font-bold">Submission not found</h1>
          <Button asChild variant="outline"><Link to="/admin/submissions">Back to submissions</Link></Button>
        </div>
      </AdminLayout>
    );
  }

  const statusColor: Record<string, string> = {
    approved: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
    pending: "bg-amber-500/10 text-amber-600 border-amber-500/30",
    rejected: "bg-red-500/10 text-red-600 border-red-500/30",
  };
  const isPending = sub.status === "pending";

  return (
    <AdminLayout>
      <div className="mb-4">
        <Button asChild variant="ghost" size="sm">
          <Link to="/admin/submissions"><ArrowLeft className="h-4 w-4 mr-1" /> Back to submissions</Link>
        </Button>
      </div>

      <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-black tracking-tight">{sub.event_name}</h1>
            <Badge variant="outline" className={`capitalize ${statusColor[sub.status] ?? ""}`}>{sub.status}</Badge>
          </div>
          <p className="text-muted-foreground text-sm mt-1">by {sub.organizer}</p>
        </div>
        {isPending && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setConfirm("reject")} disabled={busy}>
              <XCircle className="h-4 w-4 mr-1 text-red-500" /> Reject
            </Button>
            <Button onClick={() => setConfirm("approve")} disabled={busy}>
              {busy ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-1" />} Approve
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {sub.banner_image && (
            <Card className="overflow-hidden">
              <BannerImage path={sub.banner_image} loading="eager" className="w-full aspect-[16/9] object-cover" />
            </Card>
          )}

          <Card className="p-6 space-y-4">
            <h2 className="text-lg font-bold">Event details</h2>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <Field icon={User} label="Organizer" value={sub.organizer} />
              <Field icon={Mail} label="Contact email" value={sub.email} />
              <Field icon={Calendar} label="Start date" value={sub.start_date ? new Date(sub.start_date).toLocaleDateString() : "—"} />
              <Field icon={Calendar} label="End date" value={sub.end_date ? new Date(sub.end_date).toLocaleDateString() : "—"} />
              <Field icon={MapPin} label="Location" value={sub.location ?? "—"} />
              <Field icon={Globe} label="Format" value={sub.format ?? "—"} />
              <Field icon={Trophy} label="Prize pool" value={sub.prize_pool ?? "—"} />
              <Field icon={Globe} label="Website" value={sub.website ?? "—"} isLink={!!sub.website} />
            </div>
            {sub.description && (
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Description</div>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{sub.description}</p>
              </div>
            )}
          </Card>

          <Card className="p-6 space-y-3">
            <h2 className="text-lg font-bold">Admin notes</h2>
            <Textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Internal notes (visible to admins only)…"
              rows={4}
            />
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={saveNotes}>Save notes</Button>
            </div>
          </Card>

          {isPending && (
            <Card className="p-6 space-y-3">
              <h2 className="text-lg font-bold">Rejection reason <span className="text-xs text-muted-foreground font-normal">(required to reject)</span></h2>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain why this submission is being rejected. Shared with the organizer."
                rows={3}
              />
            </Card>
          )}

          {sub.status === "rejected" && sub.rejection_reason && (
            <Card className="p-6 border-red-500/30 bg-red-500/5">
              <h2 className="text-lg font-bold text-red-600 mb-2">Rejection reason</h2>
              <p className="text-sm whitespace-pre-wrap">{sub.rejection_reason}</p>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="p-6 space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Submission metadata</h2>
            <MetaRow icon={Hash} label="Reference" value={sub.reference_id ?? "—"} mono />
            <MetaRow icon={User} label="Submitted by" value={sub.user_id.slice(0, 8) + "…"} mono />
            <MetaRow icon={Clock} label="Submitted" value={new Date(sub.created_at).toLocaleString()} />
            <MetaRow icon={Clock} label="Updated" value={new Date(sub.updated_at).toLocaleString()} />
            {sub.reviewed_at && <MetaRow icon={Clock} label="Reviewed" value={new Date(sub.reviewed_at).toLocaleString()} />}
            {sub.reviewed_by && <MetaRow icon={User} label="Reviewer" value={sub.reviewed_by.slice(0, 8) + "…"} mono />}
          </Card>

          {sub.published_hackathon_id && (
            <Card className="p-6 space-y-3 border-emerald-500/30 bg-emerald-500/5">
              <h2 className="text-sm font-bold uppercase tracking-wide text-emerald-600">Published</h2>
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link to={`/hackathon/${sub.published_hackathon_id}`}>View public hackathon</Link>
              </Button>
              <Button asChild variant="ghost" size="sm" className="w-full">
                <Link to={`/admin/hackathons/${sub.published_hackathon_id}/edit`}>Edit in admin</Link>
              </Button>
            </Card>
          )}
        </div>
      </div>

      <AlertDialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirm === "approve" ? "Approve this submission?" : "Reject this submission?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirm === "approve"
                ? "A new hackathon record will be created and published. The organizer will be able to see it live."
                : "The organizer will see this submission as rejected along with the reason you provided."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={busy}
              className={confirm === "reject" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
              onClick={(e) => { e.preventDefault(); confirm === "approve" ? doApprove() : doReject(); }}
            >
              {busy ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : null}
              {confirm === "approve" ? "Approve & publish" : "Reject submission"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}

function Field({ icon: Icon, label, value, isLink }: { icon: any; label: string; value: string; isLink?: boolean }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-muted-foreground flex items-center gap-1 mb-1">
        <Icon className="h-3 w-3" /> {label}
      </div>
      {isLink && value !== "—" ? (
        <a href={value} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">{value}</a>
      ) : (
        <div className="break-words">{value}</div>
      )}
    </div>
  );
}

function MetaRow({ icon: Icon, label, value, mono }: { icon: any; label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-2 text-sm">
      <span className="text-muted-foreground flex items-center gap-1"><Icon className="h-3 w-3" /> {label}</span>
      <span className={`text-right ${mono ? "font-mono text-xs" : ""}`}>{value}</span>
    </div>
  );
}
