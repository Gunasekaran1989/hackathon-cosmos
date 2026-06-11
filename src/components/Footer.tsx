import { Code2, Github, Linkedin, Twitter } from "lucide-react";

export const Footer = () => (
  <footer className="relative mt-24 border-t border-border">
    <div className="absolute inset-0 gradient-mesh opacity-50 pointer-events-none" />
    <div className="container relative py-16">
      <div className="grid md:grid-cols-4 gap-10 mb-12">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-9 w-9 rounded-xl gradient-primary grid place-items-center glow-primary">
              <Code2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">hack<span className="gradient-text">verse</span></span>
          </div>
          <p className="text-muted-foreground max-w-sm mb-6">
            The world's most active hackathon network. Discover, compete, and ship the future with builders everywhere.
          </p>
          <div className="flex gap-2">
            {[Twitter, Github, Linkedin].map((Icon, i) => (
              <a key={i} href="#" className="h-10 w-10 rounded-xl glass grid place-items-center hover:scale-110 transition-transform" aria-label="Social">
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
        {[
          { title: "Explore", items: ["Trending", "AI & GenAI", "Web3", "Student Hacks", "Enterprise"] },
          { title: "Company", items: ["About", "Organizers", "Sponsors", "Careers", "Contact"] },
        ].map(c => (
          <div key={c.title}>
            <div className="font-bold text-sm uppercase tracking-widest mb-4">{c.title}</div>
            <ul className="space-y-2">
              {c.items.map(i => <li key={i}><a href="#" className="text-muted-foreground hover:text-foreground text-sm">{i}</a></li>)}
            </ul>
          </div>
        ))}
      </div>
      <div className="pt-8 border-t border-border flex flex-col sm:flex-row justify-between gap-3 text-xs text-muted-foreground">
        <span>© 2026 Hackverse. Built by devs, for devs.</span>
        <div className="flex gap-4">
          <a href="#" className="hover:text-foreground">Privacy</a>
          <a href="#" className="hover:text-foreground">Terms</a>
          <a href="#" className="hover:text-foreground">Code of Conduct</a>
        </div>
      </div>
    </div>
  </footer>
);
