import { Errored, isPending, lazy, Loading, Show, type ParentComponent } from 'solid-js';
import { Portal } from '@solidjs/web';
import { createLocation, LocationContext } from 'places/location';
import { createDesktop, type Desktop, type WindowId } from './desktop';
import { GraphStatus } from './GraphStatus';
import { bundleHost } from './origin';
import { ALERT, CHECK, DISK, DOCUMENT, FOLDER, HOURGLASS, MARK, PixelIcon } from './pixel';
import './App.css';

// Components from two other bundles, each fetched on first render.
const LocationPicker = lazy(() => import('places/LocationPicker'));
const Forecast = lazy(() => import('forecast/Forecast'));

const REPO = 'https://github.com/Nsttt/solid2-module-federation';
const RELEASE_POST = 'https://www.solidjs.com/blog/solid-2-0-the-long-hold/';

const errorMessage = (error: unknown) => (error instanceof Error ? error.message : String(error));

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
        </div>

        <nav class="desk-icons" aria-label="Links">
          <a class="desk-icon" href={REPO}>
            <PixelIcon art={FOLDER} scale={3} />
            <span>Repository</span>
          </a>
          <a class="desk-icon" href={RELEASE_POST}>
            <PixelIcon art={DOCUMENT} scale={3} />
            <span>Solid 2.0 post</span>
          </a>
          <a class="desk-icon" href="https://zephyr-cloud.io">
            <PixelIcon art={DISK} scale={3} />
            <span>Zephyr Cloud</span>
          </a>
        </nav>
      </main>

      {/* The drag outline: the window stays put while this follows the pointer. */}
      <Show when={desktop.outline()}>
        {(box) => (
          <div
            class="drag-outline"
            aria-hidden="true"
            style={{ left: `${box().x}px`, top: `${box().y}px`, width: `${box().w}px`, height: `${box().h}px` }}
          />
        )}
      </Show>
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
    class={['slot', `slot-${props.id}`]}
    data-window={props.id}
    data-active={props.desktop.isActive(props.id) ? 'true' : undefined}
    style={{
      transform: `translate(${props.desktop.offset(props.id).x}px, ${props.desktop.offset(props.id).y}px)`,
      'z-index': props.desktop.zIndex(props.id),
    }}
  >
    {props.children}
  </div>
);

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
