import swc from 'unplugin-swc';
import tsConfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['**/*.load-spec.ts'],
    globals: true,
    root: './',
    setupFiles: ['./test/setup-load.ts'],
    testTimeout: 10000,
  },
  // resolve: {
  //   alias: [{ find: '@', replacement: resolve(__dirname, './src') }],
  // },
  plugins: [
    tsConfigPaths(),
    // This is required to build the test files with SWC
    swc.vite({
      // Explicitly set the module type to avoid inheriting this value from a `.swcrc` config file
      module: { type: 'es6' },
    }),
  ],
});
