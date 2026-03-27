import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    // Allow host.docker.internal so OWASP ZAP (running in Docker) can reach the dev server.
    // NOTE: 'all' disables Vite's built-in DNS-rebinding protection.
    allowedHosts: true
  }
})