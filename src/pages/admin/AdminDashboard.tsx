import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import { CheckCircle2, Clock, XCircle, Star, CalendarClock, Layers, Sparkles } from "lucide-react";

type H = {
  id: string; title: string; organizer: string; status: string; featured: boolean;
  start_date: string; created_at: string; country: string | null;
};

const STATUS_COLORS: Record<string, string> = {
  approved: "hsl(var(--primary))",
  pending: "#f59e0b",
  rejected: "#ef4444",
  archived: "#6b7280",
};

export default function AdminDashboard() {
  const [rows, setRows] = useState<H[] | null>(null);

  useEffect(() => {
    document.title = "Admin dashboard — hackverse";
    supabase.from("hackathons").select("id,title,organizer,status,featured,start_date,created_at,country")
      .order("created_at", { ascending: false })
      .then(({ data }) => setRows((data as H[]) ?? []));
  }, []);

  if (!rows) {
    return (
      <AdminLayout>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
      </AdminLayout>
    );
  }

  const total = rows.length;
  const pending = rows.filter(r => r.status === "pending").length;
  const approved = rows.filter(r => r.status === "approved").length;
  const rejected = rows.filter(r => r.status === "rejected").length;
  const featured = rows.filter(r => r.featured).length;
  const upcoming = rows.filter(r => new Date(r.start_date) > new Date()).length;
  const recent = rows.slice(0, 6);

  const statusData = [
    { name: "Approved", value: approved },
    { name: "Pending", value: pending },
    { name: "Rejected", value: rejected },
    { name: "Archived", value: rows.filter(r => r.status === "archived").length },
  ];

  const byCountry = Object.entries(
    rows.reduce<Record<string, number>>((acc, r) => {
      const k = r.country || "Unknown";
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 6);

  const stats = [
    { label: "Total", value: total, icon: Layers, color: "text-primary" },
    { label: "Pending", value: pending, icon: Clock, color: "text-amber-500" },
    { label: "Approved", value: approved, icon: CheckCircle2, color: "text-emerald-500" },
    { label: "Rejected", value: rejected, icon: XCircle, color: "text-red-500" },
    { label: "Featured", value: featured, icon: Star, color: "text-yellow-500" },
    { label: "Upcoming", value: upcoming, icon: CalendarClock, color: "text-purple-500" },
  ];

  return (
    <AdminLayout>
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
            <Sparkles className="h-7 w-7 text-primary" /> Dashboard
          </h1>
          <p className="text-muted-foreground text-sm">Overview of your hackathon platform.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {stats.map((s) => (
          <Card key={s.label} className="relative overflow-hidden group hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wide text-muted-foreground">{s.label}</span>
                <s.icon className={`h-4 w-4 ${s.color}`} />
              </div>
              <div className="text-3xl font-black mt-2">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader><CardTitle className="text-lg">Status breakdown</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80}>
                  {statusData.map((d) => <Cell key={d.name} fill={STATUS_COLORS[d.name.toLowerCase()]} />)}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-lg">Top countries</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byCountry}>
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle className="text-lg">Recent submissions</CardTitle>
          <Link to="/admin/hackathons" className="text-sm text-primary hover:underline">View all →</Link>
        </CardHeader>
        <CardContent className="space-y-2">
          {recent.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hackathons yet.</p>
          ) : recent.map((r) => (
            <Link key={r.id} to={`/admin/hackathons/${r.id}/edit`}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors">
              <div className="min-w-0">
                <div className="font-medium truncate">{r.title}</div>
                <div className="text-xs text-muted-foreground truncate">{r.organizer} · {new Date(r.created_at).toLocaleDateString()}</div>
              </div>
              <div className="flex items-center gap-2">
                {r.featured && <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600">Featured</Badge>}
                <Badge variant={r.status === "approved" ? "default" : r.status === "pending" ? "secondary" : "outline"}>
                  {r.status}
                </Badge>
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
