import posthog from "posthog-js";

let initialized = false;

export function initPosthog() {
  if (initialized || typeof window === "undefined") return;
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return;
  posthog.init(key, {
    api_host: "https://app.posthog.com",
    capture_pageview: true,
  });
  initialized = true;
}

export function track(
  event: string,
  properties?: Record<string, string | number | boolean>
) {
  if (typeof window === "undefined") return;
  posthog.capture(event, properties);
}
