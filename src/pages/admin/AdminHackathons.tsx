import { useEffect, useMemo, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { bannerUrl } from "@/lib/banner";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  MoreHorizontal, Eye, Pencil, CheckCircle2, XCircle, Star, StarOff, Archive, Trash2,
  Search, ChevronLeft, ChevronRight, ArrowUpDown,
} from "lucide-react";

type Row = {
  id: string; title: string; organizer: string; country: string | null; city: string | null;
  mode: string | null; prize_pool: number | null; registration_deadline: string | null;
  start_date: string; featured: boolean; status: string; created_at: string;
  banner_image: string | null; tags: string[] | null;
};

const PAGE_SIZE = 10;
const STATUSES = ["all", "pending", "approved", "rejected", "archived"];
const MODES = ["all", "online", "in-person", "hybrid"];
const FEATURED = ["all", "yes", "no"];

export default function AdminHackathons() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [country, setCountry] = useState("all");
  const [mode, setMode] = useState("all");
  const [featured, setFeatured] = useState("all");
  const [tech, setTech] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<keyof Row>("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [confirm, setConfirm] = useState<{ id: string; action: "delete" } | null>(null);

  useEffect(() => {
    document.title = "Manage hackathons — hackverse admin";
    load();
  }, []);

  const load = async () => {
    const { data, error } = await supabase.from("hackathons").select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setRows((data as Row[]) ?? []);
  };

  const countries = useMemo(() => {
    const s = new Set<string>();
    rows?.forEach(r => r.country && s.add(r.country));
    return ["all", ...Array.from(s).sort()];
  }, [rows]);

  const techs = useMemo(() => {
    const s = new Set<string>();
    rows?.forEach(r => r.tags?.forEach(t => s.add(t)));
    return ["all", ...Array.from(s).sort()];
  }, [rows]);

  const filtered = useMemo(() => {
    if (!rows) return [];
    const q = search.trim().toLowerCase();
    let out = rows.filter(r => {
      if (q && !`${r.title} ${r.organizer} ${r.country ?? ""} ${r.city ?? ""} ${(r.tags ?? []).join(" ")}`.toLowerCase().includes(q)) return false;
      if (status !== "all" && r.status !== status) return false;
      if (country !== "all" && r.country !== country) return false;
      if (mode !== "all" && r.mode !== mode) return false;
      if (featured !== "all" && (featured === "yes") !== r.featured) return false;
      if (tech !== "all" && !(r.tags ?? []).includes(tech)) return false;
      if (from && new Date(r.start_date) < new Date(from)) return false;
      if (to && new Date(r.start_date) > new Date(to)) return false;
      return true;
    });
    out = [...out].sort((a, b) => {
      const av = a[sortBy] as any, bv = b[sortBy] as any;
      if (av == null) return 1; if (bv == null) return -1;
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return out;
  }, [rows, search, status, country, mode, featured, tech, from, to, sortBy, sortDir]);

  useEffect(() => { setPage(1); }, [search, status, country, mode, featured, tech, from, to]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleSort = (col: keyof Row) => {
    if (sortBy === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortBy(col); setSortDir("asc"); }
  };

  const update = async (id: string, patch: Partial<Row>, msg: string) => {
    const { error } = await supabase.from("hackathons").update(patch as any).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(msg);
    load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("hackathons").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Hackathon deleted");
    load();
  };

  const statusBadge = (s: string) => {
    const map: Record<string, string> = {
      approved: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
      pending: "bg-amber-500/10 text-amber-600 border-amber-500/30",
      rejected: "bg-red-500/10 text-red-600 border-red-500/30",
      archived: "bg-gray-500/10 text-gray-600 border-gray-500/30",
    };
    return <Badge variant="outline" className={map[s] ?? ""}>{s}</Badge>;
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-black tracking-tight">Hackathons</h1>
        <p className="text-muted-foreground text-sm">Manage submissions, approvals, and featured events.</p>
      </div>

      <Card className="p-4 mb-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search title, organizer, country, city, tags…" className="pl-9" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
          <FilterSelect label="Status" value={status} onChange={setStatus} options={STATUSES} />
          <FilterSelect label="Country" value={country} onChange={setCountry} options={countries} />
          <FilterSelect label="Mode" value={mode} onChange={setMode} options={MODES} />
          <FilterSelect label="Featured" value={featured} onChange={setFeatured} options={FEATURED} />
          <FilterSelect label="Technology" value={tech} onChange={setTech} options={techs} />
          <div>
            <label className="text-xs text-muted-foreground">From</label>
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">To</label>
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Banner</TableHead>
                <SortableHead label="Title" col="title" sortBy={sortBy} sortDir={sortDir} onClick={toggleSort} />
                <SortableHead label="Organizer" col="organizer" sortBy={sortBy} sortDir={sortDir} onClick={toggleSort} />
                <TableHead>Country</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Mode</TableHead>
                <SortableHead label="Prize" col="prize_pool" sortBy={sortBy} sortDir={sortDir} onClick={toggleSort} />
                <SortableHead label="Reg. Deadline" col="registration_deadline" sortBy={sortBy} sortDir={sortDir} onClick={toggleSort} />
                <SortableHead label="Start" col="start_date" sortBy={sortBy} sortDir={sortDir} onClick={toggleSort} />
                <TableHead>Featured</TableHead>
                <TableHead>Status</TableHead>
                <SortableHead label="Created" col="created_at" sortBy={sortBy} sortDir={sortDir} onClick={toggleSort} />
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows == null && Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}><TableCell colSpan={13}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
              ))}
              {rows && paged.length === 0 && (
                <TableRow><TableCell colSpan={13} className="text-center py-12 text-muted-foreground">
                  No hackathons match your filters.
                </TableCell></TableRow>
              )}
              {paged.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    {r.banner_image ? (
                      <img src={bannerUrl(r.banner_image)} alt="" className="h-10 w-16 object-cover rounded" />
                    ) : <div className="h-10 w-16 rounded bg-muted" />}
                  </TableCell>
                  <TableCell className="font-medium max-w-[220px] truncate">{r.title}</TableCell>
                  <TableCell className="max-w-[160px] truncate">{r.organizer}</TableCell>
                  <TableCell>{r.country ?? "—"}</TableCell>
                  <TableCell>{r.city ?? "—"}</TableCell>
                  <TableCell><span className="capitalize">{r.mode ?? "—"}</span></TableCell>
                  <TableCell>{r.prize_pool ? `$${r.prize_pool.toLocaleString()}` : "—"}</TableCell>
                  <TableCell>{r.registration_deadline ? new Date(r.registration_deadline).toLocaleDateString() : "—"}</TableCell>
                  <TableCell>{new Date(r.start_date).toLocaleDateString()}</TableCell>
                  <TableCell>{r.featured ? <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" /> : <span className="text-muted-foreground">—</span>}</TableCell>
                  <TableCell>{statusBadge(r.status)}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44 bg-popover">
                        <DropdownMenuItem asChild><Link to={`/hackathon/${r.id}`}><Eye className="h-4 w-4 mr-2" /> View</Link></DropdownMenuItem>
                        <DropdownMenuItem asChild><Link to={`/admin/hackathons/${r.id}/edit`}><Pencil className="h-4 w-4 mr-2" /> Edit</Link></DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => update(r.id, { status: "approved" }, "Approved")}>
                          <CheckCircle2 className="h-4 w-4 mr-2 text-emerald-500" /> Approve
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => update(r.id, { status: "rejected" }, "Rejected")}>
                          <XCircle className="h-4 w-4 mr-2 text-red-500" /> Reject
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => update(r.id, { featured: !r.featured }, r.featured ? "Unfeatured" : "Featured")}>
                          {r.featured
                            ? (<><StarOff className="h-4 w-4 mr-2" /> Unfeature</>)
                            : (<><Star className="h-4 w-4 mr-2 text-yellow-500" /> Feature</>)}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => update(r.id, { status: "archived" }, "Archived")}>
                          <Archive className="h-4 w-4 mr-2" /> Archive
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setConfirm({ id: r.id, action: "delete" })}>
                          <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between p-3 border-t border-border text-sm">
          <span className="text-muted-foreground">
            {filtered.length} result{filtered.length === 1 ? "" : "s"} · Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft className="h-4 w-4" /> Prev
            </Button>
            <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      <AlertDialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete hackathon?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => { if (confirm) remove(confirm.id); setConfirm(null); }}
            >Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div>
      <label className="text-xs text-muted-foreground">{label}</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent className="bg-popover max-h-64">
          {options.map(o => <SelectItem key={o} value={o} className="capitalize">{o}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}

function SortableHead({ label, col, sortBy, sortDir, onClick }: { label: string; col: keyof Row; sortBy: keyof Row; sortDir: "asc" | "desc"; onClick: (c: keyof Row) => void }) {
  const active = sortBy === col;
  return (
    <TableHead>
      <button className="flex items-center gap-1 hover:text-foreground" onClick={() => onClick(col)}>
        {label} <ArrowUpDown className={`h-3 w-3 ${active ? "text-primary" : "opacity-50"}`} />
        {active && <span className="text-xs">{sortDir}</span>}
      </button>
    </TableHead>
  );
}
