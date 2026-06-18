import { Link } from "react-router-dom";
import { Code2, ShieldCheck } from "lucide-react";

const Trust = () => (
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
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs font-semibold uppercase tracking-widest mb-4">
          <ShieldCheck className="h-3.5 w-3.5" /> Trust & Privacy
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">Trust, security &amp; privacy</h1>
        <p className="text-muted-foreground">
          This page is maintained by the Hackverse team to answer common security and privacy questions about Hackverse.
          It describes the controls and practices currently enabled in the app. It is editable project content, not an
          independent certification or third-party audit attestation.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-2xl font-bold">What Hackverse is</h2>
        <p className="text-muted-foreground">
          Hackverse is a public hackathon discovery directory. The current build is a read-only catalog of events; it does
          not collect user accounts, payments, or personal documents. Visitors can browse, search, and filter events
          without signing in.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-bold">Data we collect</h2>
        <ul className="list-disc pl-6 text-muted-foreground space-y-1">
          <li>No account, profile, or payment data is collected by the current Hackverse app.</li>
          <li>Hackathon listings shown on the site are static, app-owned content.</li>
          <li>Basic request logs may be recorded by the hosting platform for reliability and abuse prevention.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-bold">Cookies &amp; analytics</h2>
        <p className="text-muted-foreground">
          Hackverse does not set marketing or tracking cookies. If we add product analytics in the future, this page will
          be updated and a cookie notice will be shown where required.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-bold">Hosting &amp; platform</h2>
        <p className="text-muted-foreground">
          Hackverse is hosted on Lovable. Lovable provides TLS-terminated HTTPS for app traffic and managed infrastructure.
          These are platform capabilities, not Hackverse-issued certifications. Responsibility is shared: Lovable secures
          the underlying platform, the Hackverse team is responsible for application code and content, and visitors are
          responsible for safeguarding any credentials they use on third-party sites linked from Hackverse.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-bold">Third-party links</h2>
        <p className="text-muted-foreground">
          Hackathon listings link out to organizer websites and registration pages we do not operate. Those destinations
          have their own privacy and security practices; review them before sharing personal information.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-bold">Privacy requests</h2>
        <p className="text-muted-foreground">
          Because Hackverse does not maintain user accounts, there is typically no personal data to access or delete.
          If you believe a listing contains your personal information and would like it removed, contact us at{" "}
          <a className="underline hover:text-foreground" href="mailto:privacy@hackverse.app">privacy@hackverse.app</a>.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-bold">Reporting a security issue</h2>
        <p className="text-muted-foreground">
          If you discover a vulnerability, please email{" "}
          <a className="underline hover:text-foreground" href="mailto:security@hackverse.app">security@hackverse.app</a>{" "}
          with steps to reproduce. Please give us reasonable time to investigate before any public disclosure.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-bold">Compliance</h2>
        <p className="text-muted-foreground">
          Hackverse does not currently claim SOC 2, ISO 27001, GDPR, HIPAA, or PCI compliance. When that changes, this
          page will be updated with the specific scope and evidence.
        </p>
      </section>

      <p className="text-xs text-muted-foreground pt-8 border-t border-border">
        Last updated: 2026. This page is app-owned editable content and may be revised as Hackverse evolves.
      </p>
    </article>
  </main>
);

export default Trust;
