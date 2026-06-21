import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Upload } from "lucide-react";
import heroImg from "@/assets/hero-hackathon.jpg";
import { Button } from "@/components/ui/button";
import { Countdown } from "./Countdown";
import { Particles } from "./Particles";
import { featuredHero } from "@/data/hackathons";
import { Counter } from "./Counter";

export const Hero = () => {
  return (
    <section className="relative min-h-screen pt-24 pb-16 overflow-hidden">
      {/* Background image + overlays */}
      <div className="absolute inset-0 -z-10">
        <img src={heroImg} alt="" className="w-full h-full object-cover opacity-90" width={1920} height={1088} />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />
        <div className="absolute inset-0 grid-pattern opacity-40" />
      </div>
      <Particles count={50} />

      {/* Floating code symbols */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        {["</>", "{ }", "AI", "↗", "λ", "#", "0x"].map((s, i) => (
          <motion.span
            key={i}
            className="absolute font-mono font-bold text-2xl gradient-text opacity-50"
            initial={{ y: 0 }}
            animate={{ y: [0, -30, 0], rotate: [0, 8, 0] }}
            transition={{ duration: 6 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
            style={{ left: `${(i * 13 + 8) % 90}%`, top: `${(i * 17 + 20) % 70}%` }}
          >
            {s}
          </motion.span>
        ))}
      </div>

      <div className="container relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Copy */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-6">
              <Sparkles className="h-4 w-4 text-accent" />
              <span className="text-xs font-semibold uppercase tracking-widest">Live across 6 continents</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[0.95] mb-6">
              Where the world<br />
              builds, breaks &<br />
              <span className="gradient-text">ships the future.</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-xl mb-8">
              Discover thousands of hackathons across AI, Web3, Cloud, and Cybersecurity.
              Join a global movement of 200,000+ developers shipping at light speed.
            </p>

            <div className="flex flex-wrap gap-3 mb-12">
              <Button variant="hero" size="xl">
                Explore Hackathons <ArrowRight />
              </Button>
              <Button asChild variant="glass" size="xl">
                <a href="/submit"><Upload /> Submit Event</a>
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-4 sm:gap-8 max-w-md">
              {[
                { n: 2400, s: "+", l: "Hackathons" },
                { n: 240, s: "k", l: "Developers" },
                { n: 18, s: "M", l: "Prize Pool" },
              ].map(({ n, s, l }) => (
                <div key={l}>
                  <div className="text-2xl sm:text-3xl font-bold gradient-text">
                    <Counter end={n} suffix={s} />
                  </div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">{l}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Featured event card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute -inset-4 gradient-neon opacity-30 blur-3xl animate-pulse-glow rounded-3xl" />
            <div className="relative glass rounded-3xl overflow-hidden shadow-2xl">
              <div className="relative h-56 overflow-hidden">
                <img src={featuredHero.banner} alt={featuredHero.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
                <div className="absolute top-4 left-4 bg-accent text-accent-foreground rounded-full px-3 py-1 text-[10px] uppercase tracking-widest font-bold flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-current animate-pulse" /> Featured Live
                </div>
              </div>
              <div className="p-6">
                <div className="text-xs text-muted-foreground mb-2">{featuredHero.organizer} • {featuredHero.location}</div>
                <h2 className="text-2xl font-bold mb-4">{featuredHero.title}</h2>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Registration closes in</div>
                <Countdown to={featuredHero.startDate} />
                <div className="flex items-center justify-between mt-6 pt-6 border-t border-border">
                  <div>
                    <div className="text-2xl font-bold gradient-text">${(featuredHero.prizePool / 1000).toFixed(0)}k</div>
                    <div className="text-xs text-muted-foreground">Prize pool</div>
                  </div>
                  <Button variant="hero">Register <ArrowRight /></Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
