import { Errored, For, isPending, lazy, Loading, Show, type Element as SolidElement, type ParentComponent } from 'solid-js';
import { Portal } from '@solidjs/web';
import { createLocation, LocationContext } from 'places/location';
import { createDesktop, FLOATING, type Desktop, type FloatingId, type WindowId } from './desktop';
import { GraphStatus } from './GraphStatus';
import { bundleHost } from './origin';
import { ALERT, APP, CHECK, DISK, DOCUMENT, FOLDER, HOURGLASS, MARK, PixelIcon } from './pixel';
import { PostContents, RELEASE_POST, REPO, RepoContents, ZephyrContents } from './windows';
import './App.css';

// Components from two other bundles, each fetched on first render.
const LocationPicker = lazy(() => import('places/LocationPicker'));
const Forecast = lazy(() => import('forecast/Forecast'));

const errorMessage = (error: unknown) => (error instanceof Error ? error.message : String(error));

/** Every window on the desktop, in the order its icon appears. */
const WINDOWS: { id: WindowId; label: string; icon: readonly string[] }[] = [
  { id: 'shell', label: 'shell', icon: APP },
  { id: 'places', label: 'places', icon: APP },
  { id: 'forecast', label: 'forecast', icon: APP },
  { id: 'repo', label: 'Repository', icon: FOLDER },
  { id: 'post', label: 'Solid 2.0 post', icon: DOCUMENT },
  { id: 'zephyr', label: 'Zephyr Cloud', icon: DISK },
];

/** The floating windows: their title and what goes inside. */
const FLOATING_WINDOWS: Record<FloatingId, { title: string; contents: () => SolidElement }> = {
  repo: { title: 'Repository', contents: () => <RepoContents /> },
  post: { title: 'Solid 2.0 post', contents: () => <PostContents /> },
  zephyr: { title: 'Zephyr Cloud', contents: () => <ZephyrContents /> },
};

export default function App() {
  // Reactive state whose code lives in the `places` remote, created here, in
  // the shell's owner tree, so the shell decides its lifetime.
  const location = createLocation();
  const holding = () => isPending(location.selectedCity);
  const desktop = createDesktop();

  // The menu bar's status area. Its contents render from inside the
  // <Loading> boundary below (through a portal), so they never hold the page.
  const statusSlot = document.createElement('span');
  statusSlot.className = 'menubar-status';
  statusSlot.setAttribute('aria-live', 'polite');

  return (
    <LocationContext value={location}>
      <header class="menubar">
        <span class="menubar-mark">
          <PixelIcon art={MARK} />
          <span class="menubar-name">Solid 2.0 × Module Federation</span>
          <span class="menubar-short" aria-hidden="true">
            Solid 2.0 × MF
          </span>
        </span>
        <span class="menubar-spacer" />
        {statusSlot}
        <button type="button" class="menubar-item menubar-wide" disabled={!desktop.moved()} onClick={desktop.cleanUp}>
          Clean Up
        </button>
        <a href={REPO}>Repository</a>
        <a href={RELEASE_POST} class="menubar-wide">
          Solid 2.0 post
        </a>
      </header>

      <main class="desk" onPointerDown={desktop.onPointerDown}>
        <div class="desk-windows">
          <Slot id="shell" desktop={desktop}>
            <section class="window shell-window" aria-labelledby="shell-title">
              <header class="window-bar">
                <span class="window-close" aria-hidden="true" />
                <h2 id="shell-title" class="window-title">
                  shell — host
                </h2>
              </header>
              <div class="window-info">
                <span>
                  Owns the only <code>&lt;Loading&gt;</code> boundary on the page
                </span>
                <span class="host">{bundleHost()}</span>
              </div>

              <div class="window-body shell-body">
                <h1 class="headline">One graph, three bundles</h1>
                <p class="lede">
                  The location picker and the forecast are separate apps, built and deployed on their own, loaded
                  into this one with Module Federation. Change the state and Solid updates both in a single
                  transition.
                </p>
                <p class="drag-hint">Drag any window by its title bar.</p>
              </div>
            </section>
          </Slot>

          {/* The data comes from public APIs; if one is down, say so and offer a retry. */}
          <Errored
            fallback={(error, reset) => (
              <div class="remotes">
                <section class="window alert-window" role="alert" aria-labelledby="alert-title">
                  <header class="window-bar">
                    <h2 id="alert-title" class="window-title">
                      Can't load the data
                    </h2>
                  </header>
                  <div class="window-body alert-body">
                    <PixelIcon art={ALERT} scale={3} />
                    <p>
                      A public API didn't answer ({errorMessage(error())}). Check your connection, then try again.
                    </p>
                    <button type="button" class="button" onClick={reset}>
                      Try again
                    </button>
                  </div>
                </section>
              </div>
            )}
          >
            {/*
              The only async boundary on the page. It covers the two lazy remote
              components, the async memos inside `places/location`, and the async
              memo inside `forecast/Forecast`. On first load it shows the
              skeleton until every one of them has an answer. After that it never
              shows the fallback again: changes are held instead.
            */}
            <Loading fallback={<Skeleton desktop={desktop} />}>
              <div class="remotes">
                <Slot id="places" desktop={desktop}>
                  <LocationPicker />
                </Slot>
                <Slot id="forecast" desktop={desktop}>
                  <Forecast city={location.selectedCity()} state={location.selectedState()} />
                </Slot>
              </div>

              {/* Inside the boundary so it settles after both remotes have evaluated. */}
              <Portal mount={statusSlot}>
                <>
                  <span class={['hold-state', { active: holding() }]}>
                    <PixelIcon art={holding() ? HOURGLASS : CHECK} />
                    <span class="hold-text">{holding() ? 'Holding for both remotes' : 'Settled'}</span>
                  </span>
                  <GraphStatus />
                </>
              </Portal>
            </Loading>
          </Errored>

          {/* Windows opened from the desktop icons; they unmount when closed. */}
          <For each={FLOATING as FloatingId[]}>
            {(id) => (
              <Show when={desktop.isOpen(id)}>
                <FloatingWindow id={id} desktop={desktop} />
              </Show>
            )}
          </For>
        </div>

        <nav class="desk-icons" aria-label="Desktop">
          {/* One icon per window: opens it, or brings it to the front. An open window's icon is dithered. */}
          <For each={WINDOWS}>
            {(win) => (
              <button
                type="button"
                class={['desk-icon', { 'is-open': desktop.isOpen(win.id) }]}
                aria-label={`Open the ${win.label} window`}
                onClick={() => desktop.open(win.id)}
              >
                <PixelIcon art={win.icon} scale={3} />
                <span>{win.label}</span>
              </button>
            )}
          </For>
        </nav>
      </main>

    </LocationContext>
  );
}

/**
 * Where a window sits on the desk. The slot carries position, stacking order
 * and the active state, so the windows inside (two of them rendered by other
 * bundles) never become stacking contexts themselves.
 */
const Slot: ParentComponent<{ id: WindowId; desktop: Desktop }> = (props) => (
  <div
    class={['slot', `slot-${props.id}`, { 'slot-floating': FLOATING.includes(props.id) }]}
    data-window={props.id}
    data-active={props.desktop.isActive(props.id) ? 'true' : undefined}
    // Closed windows hide rather than unmount, so their state and data live on.
    data-closed={props.desktop.isOpen(props.id) ? undefined : ''}
    style={{
      transform: `translate(${props.desktop.offset(props.id).x}px, ${props.desktop.offset(props.id).y}px)`,
      'z-index': props.desktop.zIndex(props.id),
    }}
  >
    {props.children}
    {/*
      The host's own close box, laid exactly over the window's drawn one. It
      works the same on every window, including the remotes' windows, which
      never know they can be closed.
    */}
    <button
      type="button"
      class="window-close host-close"
      aria-label={`Close the ${props.id} window`}
      onClick={() => props.desktop.close(props.id)}
    />
  </div>
);

/** A window opened from a desktop icon: shared chrome around its own contents. */
function FloatingWindow(props: { id: FloatingId; desktop: Desktop }) {
  const spec = () => FLOATING_WINDOWS[props.id];
  return (
    <Slot id={props.id} desktop={props.desktop}>
      <section class={['window', 'floating-window', `${props.id}-window`]} aria-labelledby={`${props.id}-title`}>
        <header class="window-bar">
          <span class="window-close" aria-hidden="true" />
          <h2 id={`${props.id}-title`} class="window-title">
            {spec().title}
          </h2>
        </header>
        {spec().contents()}
      </section>
    </Slot>
  );
}

/** First load only: both remote windows open with their contents on the way. */
function Skeleton(props: { desktop: Desktop }) {
  return (
    <div class="remotes" aria-busy="true">
      <Slot id="places" desktop={props.desktop}>
        <OpeningWindow name="places" />
      </Slot>
      <Slot id="forecast" desktop={props.desktop}>
        <OpeningWindow name="forecast" />
      </Slot>
    </div>
  );
}

function OpeningWindow(props: { name: string }) {
  return (
    <section class={['window', 'holding', `${props.name}-window`]}>
      <header class="window-bar">
        <span class="window-close" aria-hidden="true" />
        <h2 class="window-title">{props.name} — remote</h2>
      </header>
      <div class="window-body opening">
        <PixelIcon art={HOURGLASS} scale={3} />
        <span>Opening {props.name}…</span>
      </div>
    </section>
  );
}
