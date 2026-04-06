export const getApiUrl = (path) => {
  const base = import.meta.env.VITE_API_URL || 'http://localhost:4000'
  // if path already absolute, return as-is
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  // ensure leading /
  const p = path.startsWith('/') ? path : `/${path}`
  return `${base}${p}`
}

export const apiFetch = (path, opts = {}) => {
  const url = getApiUrl(path)
  const headers = opts.headers || {}
  // In dev, add bypass header so protected endpoints work without Clerk auth
  if (import.meta.env.DEV) {
    headers['x-dev-bypass'] = '1'
  }
  return fetch(url, { ...opts, headers })
}

// Helper to fetch with Clerk token + dev bypass
export const fetchWithAuth = async (path, opts = {}) => {
  // If caller already has Clerk token in Authorization header, add dev bypass
  const headers = opts.headers || {}
  if (import.meta.env.DEV) {
    headers['x-dev-bypass'] = '1'
  }
  return fetch(getApiUrl(path), { ...opts, headers })
}
