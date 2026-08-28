import { Award, Bell, Code2, Compass, FileText, LayoutDashboard, Menu, Search, User, Users, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthUser } from "@/hooks/useAuthUser";
import { supabase } from "@/integrations/supabase/client";

const publicLinks = [
  { label: "Discover", href: "/hackathons" },
  { label: "Trending", href: "/#trending" },
  { label: "World Map", href: "/#map" },
];

const authLinks = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "Discover Hackathons", to: "/hackathons", icon: Compass },
  { label: "My Participations", to: "/dashboard#participations", icon: Users },
  { label: "My Submissions", to: "/my-submissions", icon: FileText },
  { label: "My Badges", to: "/dashboard#badges", icon: Award },
  { label: "Profile", to: "/profile", icon: User },
];

export const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user } = useAuthUser();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.assign("/");
  };

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? "glass shadow-sm" : "bg-transparent"}`}>
      <div className="container flex items-center justify-between h-16 md:h-20">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="relative h-9 w-9 rounded-xl gradient-primary grid place-items-center glow-primary group-hover:scale-110 transition-transform">
            <Code2 className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-xl tracking-tight">
            hack<span className="gradient-text">verse</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {publicLinks.map(l => (
            <a key={l.label} href={l.href} className="px-4 py-2 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              {l.label}
            </a>
          ))}
          {user && (
            <Link to="/dashboard" className="px-4 py-2 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              Dashboard
            </Link>
          )}
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

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
                  <User className="h-4 w-4 mr-1" />Account
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-popover">
                <DropdownMenuLabel className="truncate">{user.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {authLinks.map(l => (
                  <DropdownMenuItem key={l.label} asChild>
                    <Link to={l.to}><l.icon className="h-4 w-4 mr-2" />{l.label}</Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut}>Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link to="/auth"><User className="h-4 w-4 mr-1" />Sign in</Link>
            </Button>
          )}

          <Button asChild variant="hero" size="sm" className="hidden md:inline-flex"><Link to="/submit">Submit Event</Link></Button>
          <Button variant="ghost" size="icon" aria-label="Menu" className="lg:hidden" onClick={() => setOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-80 max-w-[85%] bg-background shadow-2xl p-6 overflow-y-auto animate-slide-up">
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
              {publicLinks.map(l => (
                <a key={l.label} href={l.href} onClick={() => setOpen(false)} className="px-4 py-3 rounded-xl hover:bg-muted font-medium">
                  {l.label}
                </a>
              ))}
              {user ? (
                <>
                  <div className="h-px bg-border my-2" />
                  {authLinks.map(l => (
                    <Link key={l.label} to={l.to} onClick={() => setOpen(false)} className="px-4 py-3 rounded-xl hover:bg-muted font-medium flex items-center gap-2">
                      <l.icon className="h-4 w-4 text-muted-foreground" />{l.label}
                    </Link>
                  ))}
                  <button onClick={signOut} className="px-4 py-3 rounded-xl hover:bg-muted font-medium text-left">Sign out</button>
                </>
              ) : (
                <Link to="/auth" onClick={() => setOpen(false)} className="px-4 py-3 rounded-xl hover:bg-muted font-medium">Sign in</Link>
              )}
            </nav>
            <Button asChild variant="hero" className="w-full mt-6"><Link to="/submit" onClick={() => setOpen(false)}>Submit Event</Link></Button>
          </div>
        </div>
      )}
    </header>
  );
};
