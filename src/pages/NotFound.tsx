import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
    document.title = "404 — Page Not Found | Hackverse";
    const desc = document.querySelector('meta[name="description"]');
    const prev = desc?.getAttribute("content") ?? "";
    desc?.setAttribute("content", "The page you're looking for doesn't exist on Hackverse. Head back to discover global hackathons in AI, Web3, and Cloud.");
    return () => {
      document.title = "Hackverse — Discover Global Hackathons in AI, Web3, Cloud";
      if (desc && prev) desc.setAttribute("content", prev);
    };
  }, [location.pathname]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">Oops! Page not found</p>
        <a href="/" className="text-primary underline hover:text-primary/90">
          Return to Home
        </a>
      </div>
    </main>
  );
};

export default NotFound;
