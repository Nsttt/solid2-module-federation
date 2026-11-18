import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';
import { defineConfig } from '@rsbuild/core';
import { pluginSolid } from '@rsbuild/plugin-solid';
import { localCors, sharedSolid, unshared } from '../../mf.shared';

if (unshared) {
  console.warn('[forecast] MF_UNSHARED=1: bundling a private copy of Solid. This is the broken setup.');
}

export default defineConfig({
  plugins: [
    pluginSolid(),
    pluginModuleFederation({
      name: 'forecast',
      exposes: {
        './Forecast': './src/Forecast.tsx',
      },
      shared: unshared ? {} : sharedSolid,
      dts: false,
    }),
  ],
  server: { port: 3002, strictPort: true, cors: localCors },
  // Resolve chunk URLs relative to wherever the manifest was served from.
  dev: { assetPrefix: 'auto' },
  output: { assetPrefix: 'auto' },
  html: { title: 'forecast (remote)' },
});
