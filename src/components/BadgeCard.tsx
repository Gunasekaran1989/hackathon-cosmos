import {
  Activity, Award, Compass, Library, Map, Shield, Sparkles, TrendingUp, Trophy, Upload, Users, Lock, Check,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { badgeProgress, type Badge, type UserStats } from "@/lib/userData";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  compass: Compass, activity: Activity, map: Map, shield: Shield, upload: Upload,
  users: Users, library: Library, sparkles: Sparkles, "trending-up": TrendingUp, trophy: Trophy,
};

type Props = { badge: Badge; earnedAt?: string | null; stats: UserStats };

export default function BadgeCard({ badge, earnedAt, stats }: Props) {
  const Icon = ICONS[badge.icon ?? ""] ?? Award;
  const earned = !!earnedAt;
  const { current, target, label } = badgeProgress(badge, stats);
  const pct = Math.min(100, Math.round((Math.min(current, target) / target) * 100));

  return (
    <Card className={`p-5 transition-all ${earned ? "border-primary/40 shadow-sm hover:shadow-md" : "opacity-80 hover:opacity-100"}`}>
      <div className="flex items-start gap-4">
        <div
          className={`h-12 w-12 shrink-0 rounded-xl grid place-items-center ${
            earned ? "gradient-primary glow-primary" : "bg-muted"
          }`}
        >
          <Icon className={`h-6 w-6 ${earned ? "text-primary-foreground" : "text-muted-foreground"}`} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold truncate">{badge.name}</h3>
            {earned ? (
              <span className="inline-flex items-center gap-1 text-xs text-primary font-medium">
                <Check className="h-3 w-3" /> Earned
              </span>
            ) : (
              <Lock className="h-3 w-3 text-muted-foreground" />
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">{badge.description}</p>

          {earned ? (
            <p className="text-xs text-muted-foreground mt-3">
              Earned {new Date(earnedAt as string).toLocaleDateString()}
            </p>
          ) : (
            <div className="mt-3 space-y-1">
              <Progress value={pct} className="h-1.5" />
              <p className="text-xs text-muted-foreground">
                {badge.criteria_type === "early_adopter"
                  ? "Awarded automatically to early HackGlobe members"
                  : `${Math.min(current, target)} / ${target} ${label} · ${pct}%`}
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
