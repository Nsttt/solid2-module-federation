import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';
import { defineConfig } from '@rsbuild/core';
import { pluginSolid } from '@rsbuild/plugin-solid';

const PLACES_URL = process.env.PLACES_URL ?? 'http://localhost:3001';
const FORECAST_URL = process.env.FORECAST_URL ?? 'http://localhost:3002';

export default defineConfig({
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
  ],
  server: {
    port: 3000,
    strictPort: true,
    cors: { origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'] },
  },
  html: { title: 'Solid 2.0 × Module Federation' },
});
