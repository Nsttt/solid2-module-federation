type FederationGlobal = {
  moduleInfo?: Record<string, { remotesInfo?: Record<string, { matchedVersion?: string }> }>;
  __INSTANCES__?: { options?: { remotes?: { name: string; entry?: string }[] } }[];
};

/**
 * Where a remote was actually loaded from: localhost in dev, its Zephyr host in
 * production (Zephyr rewrites the shell's remote URLs at deploy time). Read from
 * Module Federation's own runtime record, so it is always the same place the
 * federated modules came from.
 */
export function remoteBase(name: string): string | undefined {
  const federation = (globalThis as { __FEDERATION__?: FederationGlobal }).__FEDERATION__;
  const shell = Object.entries(federation?.moduleInfo ?? {}).find(([key]) => key === 'shell' || key.startsWith('shell:'))?.[1];
  const entry =
    shell?.remotesInfo?.[name]?.matchedVersion ??
    federation?.__INSTANCES__?.[0]?.options?.remotes?.find((remote) => remote.name === name)?.entry;
  if (!entry) return undefined;
  try {
    return new URL('.', entry).href;
  } catch {
    return undefined;
  }
}
