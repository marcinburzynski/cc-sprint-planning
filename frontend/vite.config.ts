import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'
import fs from 'fs'

// https://vitejs.dev/config/
export default defineConfig({
  envDir: '..',
  envPrefix: 'VITE_ENV_',
  plugins: [react(), svgr()],
  server: {
    https: {
      key: fs.readFileSync('/ssl/privkey.pem'),
      cert: fs.readFileSync('/ssl/fullchain.pem'),
    }
  }
})
