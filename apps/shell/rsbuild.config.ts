import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';
import { defineConfig } from '@rsbuild/core';
import { pluginSolid } from '@rsbuild/plugin-solid';
import { withZephyr } from 'zephyr-rsbuild-plugin';

const PLACES_URL = process.env.PLACES_URL ?? 'http://localhost:3001';
const FORECAST_URL = process.env.FORECAST_URL ?? 'http://localhost:3002';

export default defineConfig(({ command }) => ({
  plugins: [
    pluginSolid(),
    pluginModuleFederation({
      name: 'shell',
      remotes: {
        places: `places@${PLACES_URL}/mf-manifest.json`,
        forecast: `forecast@${FORECAST_URL}/mf-manifest.json`,
      },
      // Every app must share the same three packages. Solid 2.0 keeps its
      // scheduler, owner tree and transition state in @solidjs/signals, so a
      // second copy means a second reactive graph.
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
    port: 3000,
    strictPort: true,
    cors: { origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'] },
  },
  html: { title: 'Solid 2.0 × Module Federation', favicon: './src/favicon.svg' },
}));
