import { Bell, Code2, Menu, Search, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const links = [
  { label: "Discover", href: "#discover" },
  { label: "Trending", href: "#trending" },
  { label: "World Map", href: "#map" },
  { label: "Organizers", href: "#" },
];

export const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? "glass shadow-sm" : "bg-transparent"}`}>
      <div className="container flex items-center justify-between h-16 md:h-20">
        <a href="#" className="flex items-center gap-2 group">
          <div className="relative h-9 w-9 rounded-xl gradient-primary grid place-items-center glow-primary group-hover:scale-110 transition-transform">
            <Code2 className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-xl tracking-tight">
            hack<span className="gradient-text">verse</span>
          </span>
        </a>

        <nav className="hidden lg:flex items-center gap-1">
          {links.map(l => (
            <a key={l.label} href={l.href} className="px-4 py-2 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2 flex-1 max-w-sm mx-6">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search hackathons, cities, tech…" className="pl-9 rounded-full bg-muted/60 border-transparent focus-visible:bg-background" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" aria-label="Notifications" className="hidden sm:inline-flex relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-accent animate-pulse-glow" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Profile" className="hidden sm:inline-flex">
            <User className="h-5 w-5" />
          </Button>
          <Button asChild variant="hero" size="sm" className="hidden md:inline-flex"><a href="/submit">Submit Event</a></Button>
          <Button variant="ghost" size="icon" aria-label="Menu" className="lg:hidden" onClick={() => setOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-80 max-w-[85%] bg-background shadow-2xl p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-8">
              <span className="font-bold text-lg">Menu</span>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Close">
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search…" className="pl-9 rounded-full" />
            </div>
            <nav className="flex flex-col gap-1">
              {links.map(l => (
                <a key={l.label} href={l.href} onClick={() => setOpen(false)} className="px-4 py-3 rounded-xl hover:bg-muted font-medium">
                  {l.label}
                </a>
              ))}
            </nav>
            <Button asChild variant="hero" className="w-full mt-6"><a href="/submit" onClick={() => setOpen(false)}>Submit Event</a></Button>
          </div>
        </div>
      )}
    </header>
  );
};
