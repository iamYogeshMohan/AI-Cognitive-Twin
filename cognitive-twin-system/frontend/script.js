/* ======================================================
   Cognitive Twin System — Shared Frontend Utilities
   ====================================================== */

const API = 'http://localhost:5050/api'

/* ── Token helpers ─────────────────────────────────────── */
const getToken  = ()        => localStorage.getItem('ct_token')
const setToken  = (t)       => localStorage.setItem('ct_token', t)
const getUser   = ()        => JSON.parse(localStorage.getItem('ct_user') || 'null')
const setUser   = (u)       => localStorage.setItem('ct_user', JSON.stringify(u))
const clearAuth = ()        => { localStorage.removeItem('ct_token'); localStorage.removeItem('ct_user') }

/* ── Route guards ──────────────────────────────────────── */
function requireAuth() {
  if (!getToken()) { window.location.href = '/'; return false }
  return true
}
function requireGuest() {
  if (getToken()) { window.location.href = 'http://localhost:5173'; return false }
  return true
}

/* ── API helper ────────────────────────────────────────── */
async function api(method, endpoint, body = null, auth = false) {
  const headers = { 'Content-Type': 'application/json' }
  if (auth) headers['Authorization'] = `Bearer ${getToken()}`
  const opts = { method, headers }
  if (body) opts.body = JSON.stringify(body)
  const res  = await fetch(API + endpoint, opts)
  const data = await res.json()
  return { ok: res.ok, status: res.status, data }
}

/* ── Alert helpers ─────────────────────────────────────── */
function showAlert(id, msg, type = 'error') {
  const el = document.getElementById(id)
  if (!el) return
  el.textContent = msg
  el.className = `alert alert-${type} show`
  setTimeout(() => el.classList.remove('show'), 5000)
}

/* ── Loading state ────────────────────────────────────── */
function setLoading(btnId, loading, text = 'Submit') {
  const btn = document.getElementById(btnId)
  if (!btn) return
  btn.disabled = loading
  btn.innerHTML = loading
    ? `<span class="spinner"></span> Please wait...`
    : text
}

/* ── Logout ────────────────────────────────────────────── */
function logout() {
  clearAuth()
  window.location.href = '/'
}

/* ── Populate user info in layout ──────────────────────── */
function populateUserInfo() {
  const u = getUser()
  if (!u) return
  const nameEls  = document.querySelectorAll('.js-user-name')
  const emailEls = document.querySelectorAll('.js-user-email')
  const initEls  = document.querySelectorAll('.js-user-init')
  nameEls .forEach(el => el.textContent = u.name)
  emailEls.forEach(el => el.textContent = u.email)
  initEls .forEach(el => el.textContent = (u.name || 'U')[0].toUpperCase())
}
