import { useCallback, useEffect, useState } from "react";
import {
  AUTH_CHANGED_EVENT,
  AUTH_OPEN_EVENT,
  bupApiFetch,
  clearSessionToken,
  getSessionToken,
} from "@/lib/bup-api";

export interface BupAuthUser {
  id: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  profileImageUrl?: string | null;
}

interface AuthState {
  user: BupAuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}

function normalizeUser(value: unknown): BupAuthUser | null {
  if (!value || typeof value !== "object") return null;
  const user = value as Record<string, unknown>;
  if (typeof user.id !== "string") return null;

  return {
    id: user.id,
    email: typeof user.email === "string" ? user.email : null,
    firstName: typeof user.firstName === "string"
      ? user.firstName
      : typeof user.first_name === "string"
        ? user.first_name
        : null,
    lastName: typeof user.lastName === "string"
      ? user.lastName
      : typeof user.last_name === "string"
        ? user.last_name
        : null,
    profileImageUrl: typeof user.profileImageUrl === "string"
      ? user.profileImageUrl
      : typeof user.profile_image_url === "string"
        ? user.profile_image_url
        : null,
  };
}

export function useBupAuth(): AuthState {
  const [user, setUser] = useState<BupAuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const token = getSessionToken();
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await bupApiFetch("/api/me");
      if (response.status === 401 || response.status === 403) {
        clearSessionToken(false);
        setUser(null);
        return;
      }
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json() as { user?: unknown };
      const nextUser = normalizeUser(data.user);
      if (!nextUser) clearSessionToken(false);
      setUser(nextUser);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshUser();
    const refresh = () => void refreshUser();
    window.addEventListener(AUTH_CHANGED_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [refreshUser]);

  const login = useCallback(() => {
    window.dispatchEvent(new Event(AUTH_OPEN_EVENT));
  }, []);

  const logout = useCallback(() => {
    clearSessionToken();
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
  };
}