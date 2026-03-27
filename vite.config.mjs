import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    // Security headers applied to every dev-server response.
    // These mirror what a production reverse proxy (nginx/Caddy) should send.
    headers: {
      // Prevent MIME-type sniffing
      'X-Content-Type-Options': 'nosniff',
      // Deny framing to block clickjacking
      'X-Frame-Options': 'DENY',
      // Modern browsers: disable legacy XSS filter (can cause worse behaviour)
      'X-XSS-Protection': '0',
      // Limit referrer information sent to third parties
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      // Disable unused browser features
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      // Content Security Policy — restricts resource origins
      'Content-Security-Policy': [
        "default-src 'self'",
        // Vite serves modules from 'self'; no external scripts allowed
        "script-src 'self'",
        // Vue scoped styles are injected inline in dev mode
        "style-src 'self' 'unsafe-inline'",
        // Allow XHR/fetch to NOAA API and Vite HMR WebSocket
        "connect-src 'self' https://www.ncei.noaa.gov ws://localhost:5173 wss://localhost:5173",
        "img-src 'self' data:",
        "font-src 'self'",
        // Block plugins (Flash, etc.)
        "object-src 'none'",
        // Prevent this page from being embedded elsewhere
        "frame-ancestors 'none'",
        // Restrict <base> tag target
        "base-uri 'self'",
        // Restrict form submission targets
        "form-action 'self'",
      ].join('; '),
    },
  },
})
