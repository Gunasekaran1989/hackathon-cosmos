import { Link } from "react-router-dom";
import { Code2, Calendar, Trophy, Users, Lightbulb, Rocket } from "lucide-react";

const WhatIsAHackathon = () => (
  <main className="min-h-screen bg-background">
    <header className="border-b border-border">
      <div className="container flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl gradient-primary grid place-items-center glow-primary">
            <Code2 className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-xl">hack<span className="gradient-text">verse</span></span>
        </Link>
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← Back to home</Link>
      </div>
    </header>

    <article className="container max-w-3xl py-16 sm:py-24 space-y-10">
      <div>
        <nav className="text-xs text-muted-foreground mb-4" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <span className="mx-2">/</span>
          <span>Guides</span>
          <span className="mx-2">/</span>
          <span className="text-foreground">What is a hackathon?</span>
        </nav>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
          What is a <span className="gradient-text">hackathon</span>?
        </h1>
        <p className="text-lg text-muted-foreground">
          A hackathon is a time-boxed event — usually 24 to 72 hours — where developers, designers, and product
          builders form teams and ship a working prototype from scratch. Think of it as a sprint, a competition,
          and a community meetup rolled into one.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-2xl font-bold">The short definition</h2>
        <p className="text-muted-foreground">
          The word "hackathon" combines <em>hack</em> (creative, exploratory building) and <em>marathon</em>
          (an endurance event). Participants pick a theme or challenge, build something that didn't exist when
          the clock started, and present a demo to judges at the end. Winners take home prizes, recruiter
          attention, or simply the satisfaction of having shipped.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-bold">How a hackathon usually works</h2>
        <ol className="list-decimal pl-6 text-muted-foreground space-y-2">
          <li><strong>Kickoff.</strong> Organizers announce the theme, prize tracks, sponsors, and rules.</li>
          <li><strong>Team formation.</strong> Solo builders pitch ideas and find teammates — typically 2–5 people.</li>
          <li><strong>Build phase.</strong> The bulk of the event: design, code, test, iterate. Mentors and sponsors are usually on hand.</li>
          <li><strong>Submission.</strong> Teams freeze code, push to a repo, record a short demo video, and write up what they built.</li>
          <li><strong>Judging &amp; demos.</strong> Live presentations to a panel scoring on technical execution, design, originality, and impact.</li>
          <li><strong>Awards.</strong> Overall winners plus sponsor and category prizes (best AI hack, best use of X API, etc.).</li>
        </ol>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Types of hackathons</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { icon: Users, title: "Student", body: "Run by universities or campus clubs. Great first hackathons — friendly, learning-focused." },
            { icon: Rocket, title: "Open / community", body: "Anyone can join. Often themed around a technology (AI, Web3, climate) and run online." },
            { icon: Trophy, title: "Corporate / sponsor", body: "Hosted by a company to showcase an API or product. Prize pools tend to be larger." },
            { icon: Lightbulb, title: "Internal", body: "Run inside a company so employees can prototype new product ideas in a focused sprint." },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-2xl glass p-5">
              <div className="flex items-center gap-2 mb-2">
                <Icon className="h-4 w-4 text-primary" />
                <h3 className="font-bold">{title}</h3>
              </div>
              <p className="text-sm text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-bold">In-person vs. online</h2>
        <p className="text-muted-foreground">
          In-person hackathons happen at universities, coworking spaces, and conference venues, with free food,
          swag, and overnight hacking. Online hackathons run on Discord and stretch over a weekend or several
          weeks, making them accessible to anyone with a laptop. Hybrid formats — local meetups tied to a
          global event — are increasingly common.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-bold">Who joins hackathons?</h2>
        <ul className="list-disc pl-6 text-muted-foreground space-y-1">
          <li>Software engineers and developers of every level, including total beginners.</li>
          <li>Designers — product, UI, UX, and increasingly motion and 3D.</li>
          <li>Product managers, founders, and domain experts pitching problems worth solving.</li>
          <li>Students looking for portfolio projects, internships, or their first job offer.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-bold">Why people compete</h2>
        <ul className="list-disc pl-6 text-muted-foreground space-y-1">
          <li><strong>Learn fast.</strong> A weekend of focused building beats months of tutorials.</li>
          <li><strong>Ship a portfolio piece.</strong> A working demo is worth more than a resume bullet.</li>
          <li><strong>Meet collaborators.</strong> Many startups began as hackathon teams.</li>
          <li><strong>Win prizes.</strong> Cash, hardware, cloud credits, conference tickets, and job interviews.</li>
          <li><strong>Get recruited.</strong> Sponsors actively scout talent at and after the event.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-bold">How to prepare for your first hackathon</h2>
        <ol className="list-decimal pl-6 text-muted-foreground space-y-2">
          <li>Pick a format that fits — a 24-hour campus event is a gentler start than a month-long global online hack.</li>
          <li>Read the rules and prize tracks before the kickoff so your idea targets a real category.</li>
          <li>Bring a small starter kit: a repo template, your favorite UI library, and an auth/DB setup you trust.</li>
          <li>Scope ruthlessly. A polished demo of one feature beats a half-broken product with five.</li>
          <li>Plan time for the demo video and write-up — they're often weighted as heavily as the code.</li>
          <li>Sleep at least a little. Tired teams ship worse code and worse pitches.</li>
        </ol>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-bold">What gets judged</h2>
        <p className="text-muted-foreground">
          Criteria vary, but most hackathons score on four axes: <strong>technical difficulty</strong> (is the
          build impressive?), <strong>design &amp; UX</strong> (is it usable and polished?), <strong>originality</strong>
          (is the idea fresh?), and <strong>impact</strong> (does it solve a real problem for real users?).
          Sponsor prizes layer extra criteria on top — e.g. "best use of our API".
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-bold">Find your next hackathon</h2>
        <p className="text-muted-foreground">
          Hackverse indexes thousands of upcoming hackathons across every region, theme, and audience.
          Filter by AI, Web3, student, or enterprise tracks and join one that fits your weekend.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <Link
            to="/#discover"
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold gradient-primary text-primary-foreground glow-primary hover:scale-[1.03] transition-transform"
          >
            <Calendar className="h-4 w-4" /> Browse hackathons
          </Link>
          <Link
            to="/#map"
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold glass hover:bg-background/80 transition-colors"
          >
            See the live map
          </Link>
        </div>
      </section>

      <p className="text-xs text-muted-foreground pt-8 border-t border-border">
        Last updated: 2026. Part of the Hackverse guides series.
      </p>
    </article>
  </main>
);

export default WhatIsAHackathon;
