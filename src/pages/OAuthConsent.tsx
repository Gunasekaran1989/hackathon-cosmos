import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, ShieldCheck } from "lucide-react";

// Local typed wrapper for the beta supabase.auth.oauth namespace.
type OAuthResult = { data: any; error: { message: string } | null };
type OAuthApi = {
  getAuthorizationDetails: (id: string) => Promise<OAuthResult>;
  approveAuthorization: (id: string) => Promise<OAuthResult>;
  denyAuthorization: (id: string) => Promise<OAuthResult>;
};
const oauth = (supabase.auth as unknown as { oauth: OAuthApi }).oauth;

export default function OAuthConsent() {
  const [params] = useSearchParams();
  const authorizationId = params.get("authorization_id") ?? "";
  const [details, setDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    document.title = "Authorize connection — hackverse";
    let active = true;
    (async () => {
      if (!authorizationId) return setError("Missing authorization_id");
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        const next = window.location.pathname + window.location.search;
        window.location.href = "/auth?redirect=" + encodeURIComponent(next);
        return;
      }
      const { data, error } = await oauth.getAuthorizationDetails(authorizationId);
      if (!active) return;
      if (error) return setError(error.message);
      const immediate = data?.redirect_url ?? data?.redirect_to;
      if (immediate && !data?.client) {
        window.location.href = immediate;
        return;
      }
      setDetails(data);
    })();
    return () => {
      active = false;
    };
  }, [authorizationId]);

  async function decide(approve: boolean) {
    setBusy(true);
    const { data, error } = approve
      ? await oauth.approveAuthorization(authorizationId)
      : await oauth.denyAuthorization(authorizationId);
    if (error) {
      setBusy(false);
      return setError(error.message);
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      return setError("No redirect returned by the authorization server.");
    }
    window.location.href = target;
  }

  return (
    <main className="min-h-screen grid place-items-center px-4 py-16 bg-gradient-to-b from-background to-muted/30">
      <Card className="w-full max-w-md p-6 md:p-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-10 w-10 rounded-xl gradient-primary grid place-items-center glow-primary">
            <ShieldCheck className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold">Authorize connection</h1>
            <p className="text-xs text-muted-foreground">Hackverse account access</p>
          </div>
        </div>

        {error && (
          <p className="text-sm text-destructive">
            Could not load this authorization request: {error}
          </p>
        )}

        {!error && !details && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-8 justify-center">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </div>
        )}

        {details && (
          <>
            <p className="text-sm mb-3">
              Connect <strong>{details.client?.name ?? details.client?.client_name ?? "an app"}</strong>{" "}
              to your Hackverse account.
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              This lets it use Hackverse tools as you — browse hackathons, view your submissions, and
              submit new events on your behalf. Your existing permissions still apply.
            </p>
            <div className="rounded-md border p-3 text-xs text-muted-foreground mb-6 space-y-1">
              {details.client?.redirect_uris?.[0] && (
                <div>
                  <span className="font-medium text-foreground">Redirect:</span>{" "}
                  {details.client.redirect_uris[0]}
                </div>
              )}
              {details.scope && (
                <div>
                  <span className="font-medium text-foreground">Scope:</span> {details.scope}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                disabled={busy}
                onClick={() => decide(false)}
              >
                Cancel
              </Button>
              <Button variant="hero" className="flex-1" disabled={busy} onClick={() => decide(true)}>
                {busy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Approve
              </Button>
            </div>
          </>
        )}
      </Card>
    </main>
  );
}
