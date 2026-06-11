import { Search, SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const suggestions = ["AI Hackathon", "Web3 Berlin", "Cloud Native", "Student Hack", "GenAI Builders", "Cybersecurity CTF"];

export const FilterBar = ({
  query, setQuery, format, setFormat, domain, setDomain, audience, setAudience, region, setRegion,
}: any) => {
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);

  const Chip = ({ label, active, onClick }: any) => (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
        active ? "gradient-primary text-primary-foreground glow-primary" : "bg-muted text-muted-foreground hover:bg-muted/70"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-4">
      <div className="flex gap-3 items-stretch">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 200)}
            placeholder="Search by name, tech, city…"
            className="h-14 pl-12 pr-4 rounded-2xl text-base bg-card border-2 focus-visible:border-primary"
          />
          {focused && (
            <div className="absolute top-full mt-2 left-0 right-0 bg-card rounded-2xl shadow-xl border border-border p-2 z-30 animate-fade-in">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground px-3 py-2">Popular searches</div>
              {suggestions.map(s => (
                <button key={s} onMouseDown={() => setQuery(s)} className="w-full text-left px-3 py-2 rounded-xl hover:bg-muted text-sm flex items-center gap-2">
                  <Search className="h-3.5 w-3.5 text-muted-foreground" />{s}
                </button>
              ))}
            </div>
          )}
        </div>
        <Button variant="outline" size="lg" onClick={() => setOpen(!open)} className="h-14 rounded-2xl">
          <SlidersHorizontal className="h-5 w-5" />
          <span className="hidden sm:inline">Filters</span>
        </Button>
      </div>

      {open && (
        <div className="bg-card border border-border rounded-2xl p-6 space-y-5 animate-fade-in">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Format</div>
            <div className="flex flex-wrap gap-2">
              {["All", "Online", "In-Person", "Hybrid"].map(f => (
                <Chip key={f} label={f} active={format === f} onClick={() => setFormat(f)} />
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Tech Domain</div>
            <div className="flex flex-wrap gap-2">
              {["All", "AI", "GenAI", "Web3", "Cloud", "Cybersecurity", "Data Science", "FinTech", "Climate"].map(d => (
                <Chip key={d} label={d} active={domain === d} onClick={() => setDomain(d)} />
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Audience</div>
              <div className="flex flex-wrap gap-2">
                {["All", "Student", "Professional", "Open"].map(a => (
                  <Chip key={a} label={a} active={audience === a} onClick={() => setAudience(a)} />
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Region</div>
              <div className="flex flex-wrap gap-2">
                {["All", "North America", "Europe", "Asia", "Africa", "South America", "Oceania"].map(r => (
                  <Chip key={r} label={r} active={region === r} onClick={() => setRegion(r)} />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
