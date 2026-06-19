// Lightweight event tracking shim.
// Pushes to window.dataLayer (GA4 / GTM compatible) and dispatches a
// CustomEvent so any future analytics provider can subscribe without a rewrite.
export type AnalyticsEvent = {
  name: string;
  [key: string]: unknown;
};

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export const trackEvent = (name: string, params: Record<string, unknown> = {}) => {
  const payload = { event: name, ...params, timestamp: Date.now() };
  try {
    if (typeof window !== "undefined") {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(payload);
      window.dispatchEvent(new CustomEvent("hv:analytics", { detail: payload }));
    }
  } catch {
    // no-op: analytics must never break the UI
  }
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.debug("[analytics]", name, params);
  }
};
