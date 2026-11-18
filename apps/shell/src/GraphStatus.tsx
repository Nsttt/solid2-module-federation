import { createSignal, onSettled, Show } from 'solid-js';

type Copies = { copies: number } | undefined;

/**
 * Solid's development build registers every copy of `@solidjs/signals` it
 * evaluates on `globalThis.Solid$$copies`, and warns in the console when it
 * counts more than one. With Module Federation sharing Solid correctly, three
 * bundles still add up to one copy. Production builds strip the counter.
 */
function readCopies(): number | undefined {
  return (globalThis as { Solid$$copies?: Copies }).Solid$$copies?.copies;
}

export function GraphStatus() {
  const [copies, setCopies] = createSignal(readCopies());

  // Re-read after the page settles, which is after both remotes have loaded.
  onSettled(() => {
    setCopies(readCopies());
  });

  return (
    <footer class="graph-status">
      <Show when={copies() !== undefined} fallback={<span>Copy counter is development-only.</span>}>
        <span class={['badge', { bad: (copies() ?? 0) > 1 }]}>
          {copies()} {copies() === 1 ? 'copy' : 'copies'} of Solid
        </span>
        <span>
          {copies() === 1
            ? 'Three bundles, one reactive graph.'
            : 'More than one graph is running. Check the shared config.'}
        </span>
      </Show>
    </footer>
  );
}
