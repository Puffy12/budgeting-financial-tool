// The browser keeps its sign-in token in script storage, which Safari clears after seven days of use
// without a visit. This cookie holds a copy that Safari keeps and that page scripts cannot read.
// In production the __Host- prefix makes the browser refuse a copy planted by a sibling subdomain.
const SECURE_NAME = '__Host-budget_session';
const LOCAL_NAME = 'budget_session';

function sessionCookieName(secure) {
  return secure ? SECURE_NAME : LOCAL_NAME;
}

/** Read the session token from a Cookie request header. Returns null when it is missing or garbled. */
function readSessionCookie(cookieHeader, secure) {
  if (typeof cookieHeader !== 'string') return null;
  const name = sessionCookieName(secure);
  for (const pair of cookieHeader.split(';')) {
    const separator = pair.indexOf('=');
    if (separator === -1 || pair.slice(0, separator).trim() !== name) continue;
    try {
      return decodeURIComponent(pair.slice(separator + 1).trim()) || null;
    } catch {
      return null;
    }
  }
  return null;
}

/** Cookie options. Pass the remaining token lifetime when setting the cookie and leave it out when clearing. */
function sessionCookieOptions(secure, lifetimeMs) {
  const options = { httpOnly: true, sameSite: 'strict', secure, path: '/' };
  return lifetimeMs === undefined ? options : { ...options, maxAge: lifetimeMs };
}

/** The time left before the token's own expiry, so the cookie never outlives the token. */
function tokenLifetimeMs(token, now) {
  const expiryMs = Number(String(token).split(':')[1]);
  return Number.isFinite(expiryMs) ? Math.max(0, expiryMs - now) : 0;
}

module.exports = { sessionCookieName, readSessionCookie, sessionCookieOptions, tokenLifetimeMs };
