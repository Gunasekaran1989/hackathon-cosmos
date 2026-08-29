import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import BannerImage from "@/components/BannerImage";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Search, ChevronLeft, ChevronRight, ArrowUpDown, Eye, LayoutGrid, List } from "lucide-react";
import { toast } from "sonner";

type Sub = {
  id: string;
  event_name: string;
  organizer: string;
  email: string;
  location: string | null;
  prize_pool: string | null;
  banner_image: string | null;
  reference_id: string | null;
  status: string;
  user_id: string;
  created_at: string;
  start_date: string | null;
  end_date: string | null;
};

const PAGE_SIZE = 10;
const STATUSES = ["pending", "approved", "rejected", "all"];

export default function AdminSubmissions() {
  const [rows, setRows] = useState<Sub[] | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("pending");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<keyof Sub>("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [view, setView] = useState<"table" | "cards">("table");

  useEffect(() => {
    document.title = "Pending submissions — hackverse admin";
    load();
  }, []);

  const load = async () => {
    const { data, error } = await supabase
      .from("hackathon_submissions")
      .select("id,event_name,organizer,email,location,prize_pool,banner_image,reference_id,status,user_id,created_at,start_date,end_date")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setRows((data as Sub[]) ?? []);
  };

  const filtered = useMemo(() => {
    if (!rows) return [];
    const q = search.trim().toLowerCase();
    let out = rows.filter((r) => {
      if (status !== "all" && r.status !== status) return false;
      if (
        q &&
        !`${r.event_name} ${r.organizer} ${r.location ?? ""} ${r.reference_id ?? ""} ${r.email}`
          .toLowerCase()
          .includes(q)
      )
        return false;
      return true;
    });
    out = [...out].sort((a, b) => {
      const av = a[sortBy] as any, bv = b[sortBy] as any;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return out;
  }, [rows, search, status, sortBy, sortDir]);

  useEffect(() => setPage(1), [search, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleSort = (col: keyof Sub) => {
    if (sortBy === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortBy(col); setSortDir("asc"); }
  };

  const statusBadge = (s: string) => {
    const map: Record<string, string> = {
      approved: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
      pending: "bg-amber-500/10 text-amber-600 border-amber-500/30",
      rejected: "bg-red-500/10 text-red-600 border-red-500/30",
    };
    return <Badge variant="outline" className={`capitalize ${map[s] ?? ""}`}>{s}</Badge>;
  };

  return (
    <AdminLayout>
      <div className="mb-6 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Pending submissions</h1>
          <p className="text-muted-foreground text-sm">Review organizer submissions and approve or reject.</p>
        </div>
        <div className="flex gap-2">
          <Button variant={view === "table" ? "default" : "outline"} size="sm" onClick={() => setView("table")}>
            <List className="h-4 w-4 mr-1" /> Table
          </Button>
          <Button variant={view === "cards" ? "default" : "outline"} size="sm" onClick={() => setView("cards")}>
            <LayoutGrid className="h-4 w-4 mr-1" /> Cards
          </Button>
        </div>
      </div>

      <Card className="p-4 mb-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search event, organizer, reference ID, email, location…"
            className="pl-9"
          />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <div>
            <label className="text-xs text-muted-foreground">Status</label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent className="bg-popover">
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {view === "table" ? (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Banner</TableHead>
                  <SortableHead label="Event" col="event_name" sortBy={sortBy} sortDir={sortDir} onClick={toggleSort} />
                  <SortableHead label="Organizer" col="organizer" sortBy={sortBy} sortDir={sortDir} onClick={toggleSort} />
                  <TableHead>Location</TableHead>
                  <TableHead>Prize</TableHead>
                  <SortableHead label="Submitted" col="created_at" sortBy={sortBy} sortDir={sortDir} onClick={toggleSort} />
                  <TableHead>Reference</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows == null && Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}><TableCell colSpan={9}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                ))}
                {rows && paged.length === 0 && (
                  <TableRow><TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                    No submissions match your filters.
                  </TableCell></TableRow>
                )}
                {paged.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>
                      <BannerImage
                        path={r.banner_image}
                        className="h-10 w-16 object-cover rounded"
                        emptyState={<div className="h-10 w-16 rounded bg-muted" />}
                      />
                    </TableCell>
                    <TableCell className="font-medium max-w-[220px] truncate">{r.event_name}</TableCell>
                    <TableCell className="max-w-[160px] truncate">{r.organizer}</TableCell>
                    <TableCell className="max-w-[160px] truncate">{r.location ?? "—"}</TableCell>
                    <TableCell>{r.prize_pool ?? "—"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="font-mono text-xs">{r.reference_id ?? "—"}</TableCell>
                    <TableCell>{statusBadge(r.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button asChild size="sm" variant="outline">
                        <Link to={`/admin/submissions/${r.id}`}><Eye className="h-4 w-4 mr-1" /> Review</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <Pagination page={page} totalPages={totalPages} setPage={setPage} count={filtered.length} />
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rows == null && Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-64" />)}
            {rows && paged.length === 0 && (
              <div className="col-span-full text-center py-12 text-muted-foreground">No submissions match your filters.</div>
            )}
            {paged.map((r) => (
              <Card key={r.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                <div className="aspect-[16/9] bg-muted overflow-hidden">
                  <BannerImage
                    path={r.banner_image}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    emptyState={<div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No banner</div>}
                  />
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-bold truncate">{r.event_name}</h3>
                    {statusBadge(r.status)}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{r.organizer}</p>
                  <div className="text-xs text-muted-foreground grid grid-cols-2 gap-1 pt-2">
                    <span>📍 {r.location ?? "—"}</span>
                    <span>💰 {r.prize_pool ?? "—"}</span>
                    <span className="col-span-2 font-mono">{r.reference_id ?? "—"}</span>
                  </div>
                  <Button asChild size="sm" className="w-full mt-2">
                    <Link to={`/admin/submissions/${r.id}`}><Eye className="h-4 w-4 mr-1" /> Review</Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
          <div className="mt-4">
            <Pagination page={page} totalPages={totalPages} setPage={setPage} count={filtered.length} />
          </div>
        </>
      )}
    </AdminLayout>
  );
}

function Pagination({ page, totalPages, setPage, count }: { page: number; totalPages: number; setPage: (n: number | ((p: number) => number)) => void; count: number }) {
  return (
    <div className="flex items-center justify-between p-3 border-t border-border text-sm">
      <span className="text-muted-foreground">{count} result{count === 1 ? "" : "s"} · Page {page} of {totalPages}</span>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage((p: number) => p - 1)}>
          <ChevronLeft className="h-4 w-4" /> Prev
        </Button>
        <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage((p: number) => p + 1)}>
          Next <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function SortableHead({ label, col, sortBy, sortDir, onClick }: { label: string; col: keyof Sub; sortBy: keyof Sub; sortDir: "asc" | "desc"; onClick: (c: keyof Sub) => void }) {
  const active = sortBy === col;
  return (
    <TableHead>
      <button className="flex items-center gap-1 hover:text-foreground" onClick={() => onClick(col)}>
        {label} <ArrowUpDown className={`h-3 w-3 ${active ? "text-primary" : "opacity-50"}`} />
      </button>
    </TableHead>
  );
}
