import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';
import { defineConfig } from '@rsbuild/core';
import { pluginSolid } from '@rsbuild/plugin-solid';

export default defineConfig({
  plugins: [
    pluginSolid(),
    pluginModuleFederation({
      name: 'places',
      exposes: {
        // The reactive model: signals, async memos and the context that carries them.
        './location': './src/location.ts',
        // The UI that reads that model from context.
        './LocationPicker': './src/LocationPicker.tsx',
      },
      // Must match the shell: one copy of Solid's runtime for every bundle.
      shared: {
        'solid-js': { singleton: true, requiredVersion: '^2.0.0' },
        '@solidjs/web': { singleton: true, requiredVersion: '^2.0.0' },
        '@solidjs/signals': { singleton: true, requiredVersion: '^2.0.0' },
      },
      dts: false,
    }),
  ],
  server: {
    port: 3001,
    strictPort: true,
    // The shell loads this remote's manifest and chunks cross-origin.
    cors: { origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'] },
  },
  // Resolve chunk URLs relative to wherever the manifest was served from, so
  // the shell loads this remote's chunks from :3001 rather than its own origin.
  dev: { assetPrefix: 'auto' },
  output: { assetPrefix: 'auto' },
  html: { title: 'places (remote)' },
});
