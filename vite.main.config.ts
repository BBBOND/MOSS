import { defineConfig } from 'vite';
import path from 'path';

// https://vitejs.dev/config
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    rollupOptions: {
      external: [
        'node-llama-cpp',
        '@node-llama-cpp/mac-arm64-metal',
        '@node-llama-cpp/mac-x64',
        '@node-llama-cpp/linux-x64',
        '@node-llama-cpp/win32-x64'
      ]
    }
  }
});
