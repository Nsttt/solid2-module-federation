/**
 * The one piece of Module Federation config every app in this repo must agree on.
 *
 * Solid 2.0 keeps its scheduler, owner tree, context lookup and transition
 * bookkeeping in module state inside `@solidjs/signals`. If the shell and a
 * remote each evaluate their own copy, they each get their own reactive graph:
 * a `<Loading>` in one cannot see a pending memo in the other, context created
 * by one is invisible to the other, and a transition cannot span both.
 *
 * Sharing all three packages as singletons makes every bundle run on the same
 * graph. `@solidjs/signals` is listed explicitly because it is where the state
 * actually lives. It is a transitive dependency of `solid-js`; the plugin can
 * resolve it without help, but each app declares it directly anyway so the
 * version that ends up shared is a visible decision rather than an accident of
 * the lockfile.
 */
const solid = { singleton: true, requiredVersion: '^2.0.0' } as const;

export const sharedSolid = {
  'solid-js': solid,
  '@solidjs/web': solid,
  '@solidjs/signals': solid,
};

/**
 * The shell fetches each remote's manifest and chunks cross-origin. Allow the
 * three local origins explicitly instead of the plugin's wildcard default.
 */
export const localCors = {
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
};
