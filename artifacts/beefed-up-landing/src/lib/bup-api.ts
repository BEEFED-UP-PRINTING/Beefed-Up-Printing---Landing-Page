const API_URL = "https://api.beefedupp.co.za";
const SESSION_TOKEN_KEY = "bup-api-session";

export const AUTH_OPEN_EVENT = "bup:auth-open";
export const AUTH_CHANGED_EVENT = "bup:auth-changed";

/** Build absolute URL against the production Worker. */
export function bupApiUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_URL}${normalizedPath}`;
}

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
    // Session is still cleared in React state when storage is unavailable.
  }
  if (notify && typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
  }
}

export function getApiErrorMessage(data: unknown, fallback: string): string {
  if (data && typeof data === "object") {
    const d = data as Record<string, unknown>;
    if (typeof d.error === "string" && d.error.trim()) return d.error.trim();
    if (typeof d.message === "string" && d.message.trim()) return d.message.trim();
  }
  return fallback;
}

export async function getApiError(response: Response, fallback: string): Promise<string> {
  try {
    const data = await response.json();
    return getApiErrorMessage(data, fallback);
  } catch {
    return fallback;
  }
}

type BupApiFetchOptions = RequestInit & {
  /** Skip attaching the session token (e.g. login / signup). */
  skipAuth?: boolean;
};

/**
 * Fetch wrapper for the Beefed Up API Worker.
 * - Prefixes path with API origin
 * - Attaches Bearer token when present
 */
export async function bupApiFetch(
  path: string,
  options: BupApiFetchOptions = {}
): Promise<Response> {
  const { skipAuth = false, headers: initHeaders, ...rest } = options;
  const headers = new Headers(initHeaders);

  if (!skipAuth) {
    const token = getSessionToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  if (!headers.has("Content-Type") && rest.body && !(rest.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(bupApiUrl(path), {
    ...rest,
    headers,
  });
}
