import { useMemo, useState } from "react";
import { Brain, Building2, Flame, GraduationCap, Sparkles } from "lucide-react";
import { Hero } from "@/components/Hero";
import { Navbar } from "@/components/Navbar";
import { FilterBar } from "@/components/FilterBar";
import { HackathonCard } from "@/components/HackathonCard";
import { WorldMap } from "@/components/WorldMap";
import { Section } from "@/components/Section";
import { Footer } from "@/components/Footer";
import { hackathons } from "@/data/hackathons";
import { motion } from "framer-motion";

const Index = () => {
  const [query, setQuery] = useState("");
  const [format, setFormat] = useState("All");
  const [domain, setDomain] = useState("All");
  const [audience, setAudience] = useState("All");
  const [region, setRegion] = useState("All");
  const [activeId, setActiveId] = useState<string | null>(null);

  const filtered = useMemo(() => hackathons.filter(h => {
    if (query && !`${h.title} ${h.organizer} ${h.location} ${h.domain.join(" ")}`.toLowerCase().includes(query.toLowerCase())) return false;
    if (format !== "All" && h.format !== format) return false;
    if (domain !== "All" && !h.domain.includes(domain as any)) return false;
    if (audience !== "All" && h.audience !== audience) return false;
    if (region !== "All" && h.region !== region) return false;
    return true;
  }), [query, format, domain, audience, region]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <h1 className="sr-only">Hackverse — Global Hackathon Discovery Platform</h1>
        <Hero />

        {/* Discover */}
        <section id="discover" className="container py-16 sm:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-10"
          >
            <div className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-3">Discover</div>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">Find your next <span className="gradient-text">build sprint</span></h2>
            <p className="text-muted-foreground">Smart search across thousands of events. Filter by tech, region, format, and audience.</p>
          </motion.div>

          <FilterBar
            query={query} setQuery={setQuery}
            format={format} setFormat={setFormat}
            domain={domain} setDomain={setDomain}
            audience={audience} setAudience={setAudience}
            region={region} setRegion={setRegion}
          />

          <div className="mt-10">
            {filtered.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">No hackathons match your filters.</div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filtered.map((h, i) => (
                  <motion.div key={h.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: (i % 8) * 0.04 }}>
                    <HackathonCard h={h} onHover={setActiveId} active={activeId === h.id} />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* World map */}
        <section id="map" className="container py-16 sm:py-24">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <div className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-3">Live Map</div>
              <h2 className="text-3xl sm:text-5xl font-bold tracking-tight">Global hack pulse</h2>
              <p className="text-muted-foreground mt-2 max-w-lg">Real-time clustering of every active event. Hover a marker to spotlight it in the grid.</p>
            </div>
          </motion.div>
          <WorldMap activeId={activeId} onSelect={setActiveId} />
        </section>

        <Section id="trending"
          title="Trending Hackathons"
          subtitle="What everyone's joining"
          icon={<Flame className="h-4 w-4 text-accent" />}
          items={hackathons.filter(h => h.trending)}
          onHover={setActiveId} activeId={activeId} />

        <Section id="ai"
          title="AI & GenAI Challenges"
          subtitle="Build with frontier models"
          icon={<Brain className="h-4 w-4 text-primary" />}
          items={hackathons.filter(h => h.domain.includes("AI") || h.domain.includes("GenAI"))}
          onHover={setActiveId} activeId={activeId} />

        <Section id="recent"
          title="Recently Added"
          subtitle="Fresh on Hackverse"
          icon={<Sparkles className="h-4 w-4 text-secondary" />}
          items={hackathons.filter(h => h.tag === "New")}
          onHover={setActiveId} activeId={activeId} />

        <Section id="student"
          title="Student Competitions"
          subtitle="Campus to global stage"
          icon={<GraduationCap className="h-4 w-4 text-accent" />}
          items={hackathons.filter(h => h.audience === "Student")}
          onHover={setActiveId} activeId={activeId} />

        <Section id="enterprise"
          title="Enterprise Innovation"
          subtitle="Fortune 500 challenges"
          icon={<Building2 className="h-4 w-4 text-secondary" />}
          items={hackathons.filter(h => h.tag === "Enterprise" || h.audience === "Professional")}
          onHover={setActiveId} activeId={activeId} />

        {/* CTA */}
        <section className="container py-24">
          <div className="relative rounded-3xl overflow-hidden p-12 sm:p-20 text-center gradient-primary glow-primary">
            <div className="absolute inset-0 grid-pattern opacity-30" />
            <div className="relative">
              <h2 className="text-4xl sm:text-6xl font-bold text-primary-foreground mb-4 tracking-tight">
                Got an event? Reach 240k+ builders.
              </h2>
              <p className="text-primary-foreground/80 max-w-xl mx-auto mb-8 text-lg">
                Submit your hackathon in minutes. Get featured, attract elite talent, and build the next wave of products.
              </p>
              <button className="bg-background text-foreground rounded-full px-8 py-4 font-bold hover:scale-105 transition-transform">
                Submit your event →
              </button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
