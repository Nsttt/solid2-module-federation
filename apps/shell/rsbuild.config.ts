import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';
import { defineConfig } from '@rsbuild/core';
import { pluginSolid } from '@rsbuild/plugin-solid';
import { localCors, sharedSolid } from '../../mf.shared';

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
      shared: sharedSolid,
      dts: false,
    }),
  ],
  server: { port: 3000, strictPort: true, cors: localCors },
  html: { title: 'Solid 2.0 × Module Federation' },
});
