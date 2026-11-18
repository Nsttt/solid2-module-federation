import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';
import { defineConfig } from '@rsbuild/core';
import { pluginSolid } from '@rsbuild/plugin-solid';
import { localCors, sharedSolid } from '../../mf.shared';

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
      shared: sharedSolid,
      dts: false,
    }),
  ],
  server: { port: 3001, strictPort: true, cors: localCors },
  // Resolve chunk URLs relative to wherever the manifest was served from, so
  // the shell loads this remote's chunks from :3001 rather than its own origin.
  dev: { assetPrefix: 'auto' },
  output: { assetPrefix: 'auto' },
  html: { title: 'places (remote)' },
});
