const APP_DOMAIN = "reawakened.app";

/** Returns true when the user is browsing on reawakened.one (the marketing / informational site) */
export function isMarketingSite(): boolean {
  const host = window.location.hostname;
  return host === "reawakened.one" || host === "www.reawakened.one";
}

/** Build an absolute URL on the app domain for a given path */
export function appUrl(path: string): string {
  if (!isMarketingSite()) return path;
  return `https://${APP_DOMAIN}${path}`;
}

/** Navigate to a path – uses window.location for cross-domain, wouter navigate for same-domain */
export function navigateToApp(path: string, navigate: (path: string) => void) {
  if (isMarketingSite()) {
    window.location.href = `https://${APP_DOMAIN}${path}`;
  } else {
    navigate(path);
  }
}
