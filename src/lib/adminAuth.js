const TOKEN_KEY = 'skynet-admin-token'

export function getAdminToken() {
  return sessionStorage.getItem(TOKEN_KEY)
}

export function setAdminToken(token) {
  sessionStorage.setItem(TOKEN_KEY, token)
}

export function clearAdminToken() {
  sessionStorage.removeItem(TOKEN_KEY)
}

export function isAdminAuthenticated() {
  return !!getAdminToken()
}
