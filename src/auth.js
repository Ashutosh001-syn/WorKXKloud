const AUTH_STORAGE_KEY = 'workxkloud_auth'

export const STATIC_CREDENTIALS = {
  email: 'admin@gmail.com',
  password: 'admin@123',
}

export function isAuthenticated() {
  return !!localStorage.getItem("token");
}

export function signIn() {
  localStorage.setItem("token", "admin_token");
}

export function signOut() {
  localStorage.removeItem("token");
}

