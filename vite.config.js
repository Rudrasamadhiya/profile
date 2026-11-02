import { defineConfig } from 'vite';

// GitHub Pages serves this repo at https://rudrasamadhiya.github.io/profile/
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/profile/' : '/',
  build: {
    target: 'es2019', // older laptop browsers (Safari 13+, Chrome 80+) still parse the bundle
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: { manualChunks: { three: ['three'] } },
    },
  },
}));
