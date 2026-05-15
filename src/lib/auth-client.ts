"use client";

export type AuthMode = "customer" | "admin";
export type AuthProvider = "phone" | "google";

export type AuthSession = {
  provider: AuthProvider;
  mode: AuthMode;
  phone?: string;
  loggedInAt: string;
};

const SESSION_KEY = "selfCheckoutSession";
const SESSION_EVENT = "self-checkout-session-change";

export function saveAuthSession(session: AuthSession) {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  window.dispatchEvent(new Event(SESSION_EVENT));
}

export function getAuthSession(): AuthSession | null {
  try {
    const rawSession = window.localStorage.getItem(SESSION_KEY);
    if (!rawSession) return null;
    return JSON.parse(rawSession) as AuthSession;
  } catch {
    return null;
  }
}

export function clearAuthSession() {
  window.localStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new Event(SESSION_EVENT));
}

export function onAuthSessionChange(callback: () => void) {
  window.addEventListener(SESSION_EVENT, callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener(SESSION_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}
