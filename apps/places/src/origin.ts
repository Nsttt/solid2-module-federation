declare const __webpack_public_path__: string;

/**
 * The host this bundle was actually served from: localhost in dev, the Zephyr
 * edge URL in production. Read from the bundle's own public path, which
 * `assetPrefix: 'auto'` resolves at runtime from where the bundle was loaded.
 */
export function bundleHost(): string {
  try {
    return new URL(__webpack_public_path__, window.location.href).host;
  } catch {
    return window.location.host;
  }
}
