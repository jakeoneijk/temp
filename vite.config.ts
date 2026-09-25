import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'anonymous-pages-classic-scripts',
      apply: 'build',
      // Anonymous Pages uses an opaque origin without CORS headers.
      // Load the IIFE bundle as a deferred classic script in production.
      transformIndexHtml: {
        order: 'post',
        handler(html) {
          return html
            .replace(/<script\b[^>]*\btype="module"[^>]*>/g, (tag) =>
              tag.replace(' type="module"', ' defer').replace(/ crossorigin(?:="[^"]*")?/g, ''),
            )
            .replace(/<link\b[^>]*\brel="stylesheet"[^>]*>/g, (tag) =>
              tag.replace(/ crossorigin(?:="[^"]*")?/g, ''),
            )
        },
      },
    },
  ],
  base: './',
  assetsInclude: ['**/*.wav'],
  build: {
    modulePreload: false,
    rollupOptions: {
      output: {
        format: 'iife',
        inlineDynamicImports: true,
      },
    },
  },
})
