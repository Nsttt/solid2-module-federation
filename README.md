# Solid 2.0 × Module Federation

Solid 2.0's async reactive graph running across three independently built Module Federation bundles.

![The shell rendering the picker from places and the forecast from forecast](docs/settled.png)

The demo is the cascading dropdown from the [Solid 2.0 announcement](https://www.solidjs.com/blog/solid-2-0-the-long-hold/), split across three Rsbuild apps wired together with Module Federation:

| App | Port | Role | What it owns |
| --- | --- | --- | --- |
| `shell` | 3000 | host | The page, the only `<Loading>` boundary, the context provider |
| `places` | 3001 | remote | `./location` (async memos, writable derived signals, a context) and `./LocationPicker` |
| `forecast` | 3002 | remote | `./Forecast`, which turns a plain `city` prop into an async memo |

Pick a new state and three things happen in three bundles: `places` refetches cities, the derived city resets, and `forecast` refetches the forecast. Solid treats all of it as one transition. The old screen stays up until every piece has an answer, then it all updates at once. `forecast` has no loading state of its own; the boundary that waits on it lives in the shell.

![Texas selected, the city select disabled, the previous forecast dimmed while the new one loads](docs/holding.png)

## Run it

```bash
pnpm install
pnpm dev          # shell on :3000, places on :3001, forecast on :3002
```

Open http://localhost:3000. Each remote also runs standalone on its own port.

```bash
pnpm build && pnpm preview   # same thing, production builds
pnpm typecheck
```

## The shared config

Each app's `rsbuild.config.ts` ([shell](apps/shell/rsbuild.config.ts), [places](apps/places/rsbuild.config.ts), [forecast](apps/forecast/rsbuild.config.ts)) declares the same `shared` block:

```ts
shared: {
  'solid-js': { singleton: true, requiredVersion: '^2.0.0' },
  '@solidjs/web': { singleton: true, requiredVersion: '^2.0.0' },
  '@solidjs/signals': { singleton: true, requiredVersion: '^2.0.0' },
},
```

Solid 2.0 keeps its scheduler, owner tree and transition state in `@solidjs/signals`, so every bundle has to share that one copy for async, context and transitions to work across them. List it by name: `solid-js/internal`, which `@solidjs/web` imports, isn't covered by the `'solid-js'` key and pulls in `@solidjs/signals` directly.

The footer of the shell reads Solid's development-only copy counter (`globalThis.Solid$$copies`) and shows "1 copy of Solid" when the config is right.

Two other details:

- The remotes set `output.assetPrefix: 'auto'` (and the same for `dev`). Without it their manifests say `publicPath: "/"`, and the shell requests the remotes' chunks from its own origin.
- Remote types are hand-written in [`apps/shell/src/remotes.d.ts`](apps/shell/src/remotes.d.ts) using type-only `import()`s. Don't swap these for tsconfig `paths`: Rsbuild honors `paths` as aliases, so the shell would quietly bundle the remotes' source instead of loading them through federation.

## Stack

`solid-js@2.0.0`, `@solidjs/web@2.0.0`, `@rsbuild/core@2.3`, `@rsbuild/plugin-solid@2.0.0`, `@module-federation/rsbuild-plugin@2.9`. Data comes from fake APIs with fixed delays (500ms states, 700ms cities, 900ms forecast) so the loading states are long enough to see.
