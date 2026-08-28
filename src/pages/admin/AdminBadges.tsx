import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge as UIBadge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

type Badge = Tables<"badges">;

export default function AdminBadges() {
  const { toast } = useToast();
  const [badges, setBadges] = useState<Badge[] | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, number>>({});

  const load = async () => {
    const [{ data: b, error }, { data: ub }] = await Promise.all([
      supabase.from("badges").select("*").order("category").order("criteria_value"),
      supabase.from("user_badges").select("badge_id"),
    ]);
    if (error) toast({ title: "Couldn't load badges", description: error.message, variant: "destructive" });
    setBadges(b ?? []);
    const c: Record<string, number> = {};
    (ub ?? []).forEach((r) => { c[r.badge_id] = (c[r.badge_id] ?? 0) + 1; });
    setCounts(c);
  };

  useEffect(() => {
    document.title = "Badges — hackverse admin";
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const update = async (id: string, patch: Partial<Badge>) => {
    setSavingId(id);
    const { error } = await supabase.from("badges").update(patch).eq("id", id);
    setSavingId(null);
    if (error) return toast({ title: "Update failed", description: error.message, variant: "destructive" });
    toast({ title: "Badge updated" });
    load();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Badges</h1>
          <p className="text-muted-foreground text-sm">Enable, disable and configure badge criteria. Awarding happens automatically in the database.</p>
        </div>

        {!badges ? (
          <div className="py-16 grid place-items-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {badges.map((b) => (
              <Card key={b.id} className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{b.name}</p>
                    <p className="text-xs text-muted-foreground">{b.slug} · {b.category}</p>
                  </div>
                  <Switch checked={b.active} disabled={savingId === b.id} onCheckedChange={(v) => update(b.id, { active: v })} />
                </div>
                <p className="text-sm text-muted-foreground">{b.description}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <UIBadge variant="secondary">{b.criteria_type}</UIBadge>
                  <Input
                    type="number" min={1} className="w-24 h-8"
                    value={drafts[b.id] ?? b.criteria_value}
                    onChange={(e) => setDrafts((d) => ({ ...d, [b.id]: Number(e.target.value) }))}
                  />
                  <Button
                    size="sm" variant="outline"
                    disabled={savingId === b.id || (drafts[b.id] ?? b.criteria_value) === b.criteria_value}
                    onClick={() => update(b.id, { criteria_value: Math.max(1, drafts[b.id] ?? b.criteria_value) })}
                  >
                    Save threshold
                  </Button>
                  <span className="text-xs text-muted-foreground ml-auto">{counts[b.id] ?? 0} earned</span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
