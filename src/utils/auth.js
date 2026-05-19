const AUTH_STORAGE_KEY = 'XPM.ai_auth'

export function isAuthenticated() {
  return !!localStorage.getItem(AUTH_STORAGE_KEY);
}

export function signIn(payload) {
  localStorage.setItem(AUTH_STORAGE_KEY, payload?.token || "authenticated");
  localStorage.setItem("token", payload?.token || "authenticated");

  if (payload?.user) {
    localStorage.setItem("auth_user", JSON.stringify(payload.user));
  }
}

export function signOut() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem("token");
  localStorage.removeItem("auth_user");
}
