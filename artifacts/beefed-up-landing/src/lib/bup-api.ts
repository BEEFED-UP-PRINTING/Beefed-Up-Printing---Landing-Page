const API_ORIGIN = "https://api.beefedupp.co.za";
const SESSION_TOKEN_KEY = "bup-api-session";

export const AUTH_OPEN_EVENT = "bup:auth-open";
export const AUTH_CHANGED_EVENT = "bup:auth-changed";

// Always talk to the Worker directly. It handles CORS for beefedupp.co.za and www.
// (A relative path only works if the host also serves /api, which this static site does not.)
export function bupApiUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_ORIGIN}${normalizedPath}`;
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
    throw new Error("This browser could not save the sign-in session. Check its privacy settings and try again.");
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

export function openAuthDialog(): void {
  window.dispatchEvent(new Event(AUTH_OPEN_EVENT));
}

export async function bupApiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  const token = getSessionToken();

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(bupApiUrl(path), {
    ...init,
    headers,
    credentials: "omit", // token travels in the Authorization header, not cookies
  });
}

export function getApiErrorMessage(data: unknown, fallback: string): string {
  if (!data || typeof data !== "object") return fallback;
  const error = (data as { error?: unknown }).error;
  return typeof error === "string" && error.trim() ? error : fallback;
}

export async function getApiError(response: Response, fallback: string): Promise<string> {
  try {
    return getApiErrorMessage(await response.json(), fallback);
  } catch {
    return fallback;
  }
}