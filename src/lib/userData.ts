import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Profile = Tables<"profiles">;
export type Badge = Tables<"badges">;
export type UserBadge = Tables<"user_badges">;
export type Activity = Tables<"user_activity">;

export type ParticipationRow = {
  id: string;
  hackathon_id: string;
  participation_status: string;
  role: string | null;
  registered_at: string;
  completed_at: string | null;
  hackathons: {
    id: string;
    title: string;
    organizer: string;
    start_date: string;
    end_date: string | null;
    location: string | null;
    mode: string | null;
    banner_image: string | null;
  } | null;
};

export type SubmissionRow = {
  id: string;
  event_name: string;
  organizer: string;
  status: string;
  created_at: string;
  reviewed_at: string | null;
  rejection_reason: string | null;
  published_hackathon_id: string | null;
  reference_id: string | null;
  banner_image: string | null;
  location: string | null;
  start_date: string | null;
};

export type UserStats = {
  participations: number;
  completed: number;
  upcoming: number;
  submissions: number;
  approved: number;
  pending: number;
  rejected: number;
  badges: number;
};

export type DashboardData = {
  profile: Profile | null;
  participations: ParticipationRow[];
  submissions: SubmissionRow[];
  badges: Badge[];
  earned: UserBadge[];
  activity: Activity[];
  stats: UserStats;
};

const PARTICIPATION_SELECT =
  "id,hackathon_id,participation_status,role,registered_at,completed_at,hackathons(id,title,organizer,start_date,end_date,location,mode,banner_image)";

const SUBMISSION_SELECT =
  "id,event_name,organizer,status,created_at,reviewed_at,rejection_reason,published_hackathon_id,reference_id,banner_image,location,start_date";

/**
 * Loads everything the dashboard/profile needs in one parallel round-trip.
 * All queries rely on RLS — rows are scoped to the authenticated user server-side.
 */
export async function loadDashboardData(userId: string): Promise<DashboardData> {
  const [profileRes, partRes, subRes, badgeRes, earnedRes, actRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
    supabase
      .from("user_hackathon_participations")
      .select(PARTICIPATION_SELECT)
      .order("registered_at", { ascending: false }),
    supabase
      .from("hackathon_submissions")
      .select(SUBMISSION_SELECT)
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
    supabase.from("badges").select("*").eq("active", true).order("category").order("criteria_value"),
    supabase.from("user_badges").select("*"),
    supabase.from("user_activity").select("*").order("created_at", { ascending: false }).limit(20),
  ]);

  const participations = (partRes.data ?? []) as unknown as ParticipationRow[];
  const submissions = (subRes.data ?? []) as unknown as SubmissionRow[];
  const earned = earnedRes.data ?? [];
  const today = new Date().toISOString().slice(0, 10);

  const byStatus = (s: string) =>
    submissions.filter((x) => (x.status ?? "").toLowerCase() === s).length;

  return {
    profile: profileRes.data ?? null,
    participations,
    submissions,
    badges: badgeRes.data ?? [],
    earned,
    activity: actRes.data ?? [],
    stats: {
      participations: participations.filter((p) => p.participation_status !== "cancelled").length,
      completed: participations.filter((p) => p.participation_status === "completed").length,
      upcoming: participations.filter(
        (p) => p.hackathons?.start_date && p.hackathons.start_date >= today && p.participation_status !== "cancelled",
      ).length,
      submissions: submissions.length,
      approved: byStatus("approved"),
      pending: byStatus("pending"),
      rejected: byStatus("rejected"),
      badges: earned.length,
    },
  };
}

/** Current progress toward a badge, derived from database-backed criteria. */
export function badgeProgress(badge: Badge, stats: UserStats): { current: number; target: number; label: string } {
  const target = Math.max(1, badge.criteria_value);
  switch (badge.criteria_type) {
    case "participations":
      return { current: stats.participations, target, label: "hackathons" };
    case "submissions":
      return { current: stats.submissions, target, label: "submissions" };
    case "approved_submissions":
      return { current: stats.approved, target, label: "approved submissions" };
    case "rising_hacker":
      return {
        current: Math.min(stats.participations, target) * (stats.approved >= 1 ? 1 : 0),
        target,
        label: "hackathons with an approved contribution",
      };
    case "champion":
      return {
        current: Math.min(stats.participations, target) * (stats.approved >= 5 ? 1 : 0),
        target,
        label: "hackathons with 5 approved contributions",
      };
    default:
      return { current: 0, target, label: "criteria met" };
  }
}

export const PROFILE_FIELDS: { key: keyof Profile; label: string }[] = [
  { key: "full_name", label: "Full name" },
  { key: "username", label: "Username" },
  { key: "avatar_url", label: "Avatar" },
  { key: "bio", label: "Bio" },
  { key: "location", label: "Location" },
  { key: "country", label: "Country" },
  { key: "company", label: "Company" },
  { key: "job_title", label: "Job title" },
  { key: "website", label: "Website" },
  { key: "github_url", label: "GitHub" },
  { key: "linkedin_url", label: "LinkedIn" },
  { key: "skills", label: "Skills" },
];

export function profileCompletion(profile: Profile | null): { pct: number; missing: string[] } {
  if (!profile) return { pct: 0, missing: PROFILE_FIELDS.map((f) => f.label) };
  const missing = PROFILE_FIELDS.filter((f) => {
    const v = profile[f.key];
    if (Array.isArray(v)) return v.length === 0;
    return v == null || String(v).trim() === "";
  }).map((f) => f.label);
  const pct = Math.round(((PROFILE_FIELDS.length - missing.length) / PROFILE_FIELDS.length) * 100);
  return { pct, missing };
}

export const ACTIVITY_LABELS: Record<string, string> = {
  submission_created: "Submitted a hackathon",
  submission_approved: "Submission approved",
  submission_rejected: "Submission needs changes",
  hackathon_registered: "Registered for a hackathon",
  hackathon_completed: "Completed a hackathon",
  badge_earned: "Earned a badge",
};
