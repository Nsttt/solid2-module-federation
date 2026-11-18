import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';
import { defineConfig } from '@rsbuild/core';
import { pluginSolid } from '@rsbuild/plugin-solid';
import { withZephyr } from 'zephyr-rsbuild-plugin';

export default defineConfig(({ command }) => ({
  plugins: [
    pluginSolid(),
    pluginModuleFederation({
      name: 'forecast',
      exposes: {
        './Forecast': './src/Forecast.tsx',
      },
      // Must match the shell: one copy of Solid's runtime for every bundle.
      shared: {
        'solid-js': { singleton: true, requiredVersion: '^2.0.0' },
        '@solidjs/web': { singleton: true, requiredVersion: '^2.0.0' },
        '@solidjs/signals': { singleton: true, requiredVersion: '^2.0.0' },
      },
      dts: false,
    }),
    // Deploys to Zephyr Cloud on `rsbuild build`; dev stays local.
    command === 'build' && withZephyr(),
  ],
  server: {
    port: 3002,
    strictPort: true,
    // The shell loads this remote's manifest and chunks cross-origin.
    cors: { origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'] },
  },
  // Resolve chunk URLs relative to wherever the manifest was served from.
  dev: { assetPrefix: 'auto' },
  output: { assetPrefix: 'auto' },
  html: { title: 'forecast (remote)' },
}));
