import { createSignal, onSettled, Show } from 'solid-js';

type Copies = { copies: number } | undefined;
type ShareRecord = Record<string, { default?: Record<string, Record<string, { from?: string; useIn?: string[] }>> }>;

/**
 * Development builds of Solid register every copy of `@solidjs/signals` they
 * evaluate on `globalThis.Solid$$copies`. Production builds strip it.
 */
function readCopies(): number | undefined {
  return (globalThis as { Solid$$copies?: Copies }).Solid$$copies?.copies;
}

/**
 * Module Federation's runtime keeps its own record of every shared module:
 * which container provided it and which ones use it. That record exists in
 * production too, so it is the proof a deployed page can show.
 */
function readShared(): { from: string; users: string[] } | undefined {
  const share = (globalThis as { __FEDERATION__?: { __SHARE__?: ShareRecord } }).__FEDERATION__?.__SHARE__;
  const shell = Object.entries(share ?? {}).find(([name]) => name.startsWith('shell:'))?.[1];
  const entry = Object.values(shell?.default?.['solid-js'] ?? {})[0];
  return entry?.from ? { from: entry.from, users: entry.useIn ?? [] } : undefined;
}

export function GraphStatus() {
  const [copies, setCopies] = createSignal(readCopies());
  const [shared, setShared] = createSignal(readShared());

  // Re-read after the page settles, which is after both remotes have loaded.
  onSettled(() => {
    setCopies(readCopies());
    setShared(readShared());
  });

  return (
    <Show
      when={copies() !== undefined}
      fallback={
        <Show when={shared()}>
          {(record) => (
            <span class="copies" title={`solid-js from ${record().from}, used by ${record().users.join(', ')}`}>
              Solid shared by {record().users.length} bundles
            </span>
          )}
        </Show>
      }
    >
      <span class={['copies', { bad: (copies() ?? 0) > 1 }]}>
        {copies()} {copies() === 1 ? 'copy' : 'copies'} of Solid
      </span>
    </Show>
  );
}
