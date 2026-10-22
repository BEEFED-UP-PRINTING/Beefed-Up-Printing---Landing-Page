const API_URL = "https://api.beefedupp.co.za";
const SESSION_TOKEN_KEY = "bup-api-session";

export const AUTH_OPEN_EVENT = "bup:auth-open";
export const AUTH_CHANGED_EVENT = "bup:auth-changed";

// Always talk to the Worker directly. It handles CORS for beefedupp.co.za and www.
// (A relative path only works if the host also serves /api, which this static site does not.)
export function bupApiUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_URL}${normalizedPath}`;
}

// localStorage so customers stay signed in across tabs and visits (token expires after 7 days on the server).
export function getSessionToken(): string | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage.getItem(SESSION_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setSessionToken(token: string): void {
  try {
    window.localStorage.setItem(SESSION_TOKEN_KEY, token);
  } catch {
    throw new Error(
      "This browser could not save the sign-in session. Check its privacy settings and try again."
    );
  }
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

export function clearSessionToken(notify = true): void {
  try {
    window.localStorage.removeItem(SESSION_TOKEN_KEY);
  } catch {
    // The session is still cleared in React state when storage is unavailable.
  }
  if (notify && typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
  }
}

/**
 * Pull a human-readable message from an API error body, with a safe fallback.
 */
export function getApiErrorMessage(data: unknown, fallback: string): string {
  if (data && typeof data === "object") {
    const d = data as Record<string, unknown>;
    if (typeof d.error === "string" && d.error.trim()) return d.error.trim();
    if (typeof d.message === "string" && d.message.trim()) return d.message.trim();
  }
  return fallback;
}

type BupApiFetchOptions = RequestInit & {
  /** Skip attaching the session token (e.g. for login/signup). */
  skipAuth?: boolean;
};

/**
 * Fetch wrapper for the Beefed Up API.
 * - Prefixes the path with the API origin
 * - Attaches the session token when present
 * - Throws a clear error on non-2xx responses
 */
export async function bupApiFetch(
  path: string,
  options: BupApiFetchOptions = {}
): Promise<Response> {
  const { skipAuth = false, headers: initHeaders, ...rest } = options;

  const headers = new Headers(initHeaders);

  if (!skipAuth) {
    const token = getSessionToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  if (!headers.has("Content-Type") && rest.body && !(rest.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(bupApiUrl(path), {
    ...rest,
    headers,
  });

  return res;
}
