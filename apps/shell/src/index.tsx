// The async boundary: by the time bootstrap evaluates, Module Federation has
// agreed on one copy of solid-js, @solidjs/web and @solidjs/signals, and the
// remote module `places/location` (imported statically by App) is loaded.
import('./bootstrap');
