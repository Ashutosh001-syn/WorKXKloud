const AUTH_STORAGE_KEY = 'workxkloud_auth'

export const STATIC_CREDENTIALS = {
  email: 'admin@gmail.com',
  password: 'admin@123',
}

export function isAuthenticated() {
  return sessionStorage.getItem(AUTH_STORAGE_KEY) === 'true'
}

export function signIn() {
  sessionStorage.setItem(AUTH_STORAGE_KEY, 'true')
}

export function signOut() {
  sessionStorage.removeItem(AUTH_STORAGE_KEY)
}
