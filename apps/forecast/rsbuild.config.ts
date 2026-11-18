import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';
import { defineConfig } from '@rsbuild/core';
import { pluginSolid } from '@rsbuild/plugin-solid';
import { localCors, sharedSolid } from '../../mf.shared';

export default defineConfig({
  plugins: [
    pluginSolid(),
    pluginModuleFederation({
      name: 'forecast',
      exposes: {
        './Forecast': './src/Forecast.tsx',
      },
      shared: sharedSolid,
      dts: false,
    }),
  ],
  server: { port: 3002, strictPort: true, cors: localCors },
  // Resolve chunk URLs relative to wherever the manifest was served from.
  dev: { assetPrefix: 'auto' },
  output: { assetPrefix: 'auto' },
  html: { title: 'forecast (remote)' },
});
