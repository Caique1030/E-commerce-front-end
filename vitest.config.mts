import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  // O Vite resolve os paths do tsconfig nativamente; o plugin vite-tsconfig-paths só avisava
  // que virou redundante.
  resolve: { tsconfigPaths: true },
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.{ts,tsx}'],
    setupFiles: ['tests/setup.ts'],
    css: false,
    clearMocks: true,
  },
});
