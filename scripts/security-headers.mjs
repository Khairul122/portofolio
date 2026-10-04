// Single source of truth for the site's security and cache headers.
// Used by vite.config.js (meta CSP + `vite preview`) and by
// scripts/write-host-configs.mjs (public/_headers and vercel.json).

// Strict CSP: everything is same-origin (fonts are self-hosted), so there is no
// third-party script, style or font host to allow.
//  - 'wasm-unsafe-eval': three.js's meshopt decoder is WebAssembly.
//  - style-src 'unsafe-inline': framer-motion writes inline style attributes.
//  - blob:/data: : GLTF textures and the grain SVG are blob/data URLs.
export const cspDirectives = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'wasm-unsafe-eval'"],
  'style-src': ["'self'", "'unsafe-inline'"],
  'img-src': ["'self'", 'data:', 'blob:'],
  'font-src': ["'self'"],
  'connect-src': ["'self'", 'blob:', 'data:'],
  'worker-src': ["'self'", 'blob:'],
  'media-src': ["'self'"],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"],
}

const toPolicy = (directives) =>
  Object.entries(directives)
    .map(([name, values]) => `${name} ${values.join(' ')}`)
    .join('; ')

export const csp = toPolicy(cspDirectives)

// <meta> CSP ignores frame-ancestors, so the meta copy leaves it out.
const { 'frame-ancestors': _omit, ...metaDirectives } = cspDirectives
export const cspForMeta = toPolicy(metaDirectives)

export const securityHeaders = {
  'Content-Security-Policy': csp,
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin',
}

// Long caching means a flood of repeat requests is answered by the CDN edge
// instead of reaching the origin. Hashed files in /assets never change.
export const cacheRules = [
  ['/assets/*', 'public, max-age=31536000, immutable'],
  ['/models/*', 'public, max-age=2592000'],
  ['/images/*', 'public, max-age=2592000'],
  ['/cv.pdf', 'public, max-age=3600'],
  ['/index.html', 'no-cache'],
]
