// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // optional: if you keep wavs under src/, you usually don't need this.
  // assets in /public are always served statically.
  base: './',
  assetsInclude: ['**/*.wav']
})
