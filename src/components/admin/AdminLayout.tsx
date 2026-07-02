import { ReactNode } from "react";
import { Navigate, Link, useLocation } from "react-router-dom";
import { useAdmin } from "@/hooks/useAdmin";
import { Loader2, LayoutDashboard, ListChecks, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { loading, isAdmin, userId } = useAdmin();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }
  if (!userId) return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-2xl font-bold">Admin access required</h1>
          <p className="text-muted-foreground">Your account does not have admin privileges.</p>
          <Button asChild variant="outline"><Link to="/">Back to site</Link></Button>
        </div>
      </div>
    );
  }

  const navItems = [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { to: "/admin/hackathons", label: "Hackathons", icon: ListChecks },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      <aside className="md:w-60 border-r border-border bg-card/50 backdrop-blur p-4 flex md:flex-col gap-2 md:gap-1">
        <div className="hidden md:block mb-4">
          <Link to="/" className="font-black text-lg tracking-tight">hackverse<span className="text-primary">.admin</span></Link>
        </div>
        {navItems.map((n) => {
          const active = location.pathname === n.to || (n.to !== "/admin" && location.pathname.startsWith(n.to));
          return (
            <Link
              key={n.to}
              to={n.to}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${active ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}
            >
              <n.icon className="h-4 w-4" /> {n.label}
            </Link>
          );
        })}
        <div className="md:mt-auto">
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2" onClick={() => supabase.auth.signOut()}>
            <LogOut className="h-4 w-4" /> Sign out
          </Button>
        </div>
      </aside>
      <main className="flex-1 p-4 md:p-8 overflow-x-hidden">{children}</main>
    </div>
  );
}
