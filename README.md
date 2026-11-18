# Solid 2.0 × Module Federation

Solid 2.0's async reactive graph running across three independently built bundles.

![The shell holding San Francisco's forecast while Texas loads](docs/holding.png)

The demo is the cascading dropdown from the [Solid 2.0 announcement](https://www.solidjs.com/blog/solid-2-0-the-long-hold/), split across three Rsbuild apps wired together with Module Federation:

| App | Port | Role | What it owns |
| --- | --- | --- | --- |
| `shell` | 3000 | host | The page, the only `<Loading>` boundary, the context provider |
| `places` | 3001 | remote | `./location` (async memos, writable derived signals, a context) and `./LocationPicker` |
| `forecast` | 3002 | remote | `./Forecast`, which turns a plain `city` prop into an async memo |

Pick a new state and three things happen in three bundles: `places` refetches cities, the derived city resets, and `forecast` refetches the forecast. Solid treats all of it as one transition. The old screen stays up (the select is disabled and the forecast is dimmed) until every piece has an answer, then it all commits together. Nothing in `forecast` has its own loading state. The boundary that waits on it lives in the shell.

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

## Break it on purpose

```bash
pnpm dev:unshared
```

This sets `MF_UNSHARED=1`, which drops the `shared` config from `forecast` so it bundles its own private copy of Solid. The page never leaves the skeleton:

```
You appear to have multiple instances of Solid: a signal or store from one copy was read
inside a computation of another, so the read is not tracked and will not update.
[PENDING_ASYNC_UNTRACKED_READ] Reading a pending async value directly in <Forecast>. …
[REACTIVITY_HALTED] An uncaught error halted the reactive system. No further updates will be processed.
```

The second diagnostic points at `<Forecast>`, but that component is fine. The memo it reads belongs to one copy of Solid and the JSX reading it is tracked by the other, so neither side sees a tracking scope. The fix is the federation config, not the component.

The footer of the shell shows how many copies of `@solidjs/signals` have registered on `globalThis.Solid$$copies`. That counter only exists in development builds.

## The config that matters

[`mf.shared.ts`](mf.shared.ts) is shared by all three apps:

```ts
const solid = { singleton: true, requiredVersion: '^2.0.0' } as const;

export const sharedSolid = {
  'solid-js': solid,
  '@solidjs/web': solid,
  '@solidjs/signals': solid,
};
```

`@solidjs/signals` is where Solid 2.0 keeps the scheduler, owner tree and transition state, so it's listed by name rather than left to come along with `solid-js`.

Two other details:

- The remotes set `output.assetPrefix: 'auto'` (and the same for `dev`). Without it their manifests say `publicPath: "/"`, and the shell requests the remotes' chunks from its own origin.
- Remote types are hand-written in [`apps/shell/src/remotes.d.ts`](apps/shell/src/remotes.d.ts) using type-only `import()`s. Don't swap these for tsconfig `paths`: Rsbuild honors `paths` as aliases, so the shell would quietly bundle the remotes' source instead of loading them through federation.

## Stack

`solid-js@2.0.0`, `@solidjs/web@2.0.0`, `@rsbuild/core@2.3`, `@rsbuild/plugin-solid@2.0.0`, `@module-federation/rsbuild-plugin@2.9`. Data comes from fake APIs with fixed delays (500ms states, 700ms cities, 900ms forecast) so the hold is long enough to see.

## Writing

[`POST.mdx`](POST.mdx) is a draft blog post about this repo.
