import { defineConfig } from 'vite'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'

export default defineConfig({
  plugins: [cssInjectedByJsPlugin()],
  build: {
    // Output a single JS file (with CSS injected at runtime via a <style> tag)
    lib: {
      entry: 'src/main.ts',
      name: 'FoundationFinder',
      // Override default "main.iife.js" to just "main.js"
      fileName: () => 'main.js',
      formats: ['iife'],
    },
    rollupOptions: {
      // No external deps — everything bundled
      external: [],
      output: {
        // Inline CSS into the JS bundle so Webflow only needs one <script> tag
        assetFileNames: () => 'main.[ext]',
      },
    },
    // Target <50KB gzipped; no minification source maps in production
    sourcemap: false,
    minify: 'esbuild',
    cssCodeSplit: false,
  },
})
