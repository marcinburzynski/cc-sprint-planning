import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'

// https://vitejs.dev/config/
export default defineConfig({
  envDir: '..',
  envPrefix: 'TEST_ENV_',
  plugins: [react(), svgr()]
})
