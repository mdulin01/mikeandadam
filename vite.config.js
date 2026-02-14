import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { execSync } from 'child_process'

const gitHash = execSync('git rev-parse --short HEAD').toString().trim()
const buildTime = new Date().toISOString()

export default defineConfig({
  plugins: [react()],
  define: {
    __BUILD_HASH__: JSON.stringify(gitHash),
    __BUILD_TIME__: JSON.stringify(buildTime),
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        fitness: resolve(__dirname, 'fitness.html'),
        travel: resolve(__dirname, 'travel.html'),
        events: resolve(__dirname, 'events.html'),
        memories: resolve(__dirname, 'memories.html'),
        indy: resolve(__dirname, 'indy.html'),
      },
    },
  },
})
