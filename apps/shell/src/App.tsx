import { isPending, lazy, Loading } from 'solid-js';
import { createLocation, LocationContext } from 'places/location';
import { GraphStatus } from './GraphStatus';

// Components from two other bundles, each fetched on first render.
const LocationPicker = lazy(() => import('places/LocationPicker'));
const Forecast = lazy(() => import('forecast/Forecast'));

export default function App() {
  // Reactive state whose code lives in the `places` remote, created here, in
  // the shell's owner tree, so the shell decides its lifetime.
  const location = createLocation();

  return (
    <LocationContext value={location}>
      <main class="shell">
        <header class="masthead">
          <p class="eyebrow">shell · :3000</p>
          <h1>One graph, three bundles</h1>
          <p class="lede">
            The picker comes from <code>places</code>, the forecast from <code>forecast</code>, and the
            boundary that waits on both of them lives here. Change the state and watch one transition
            run across all three.
          </p>
        </header>

        {/*
          The only async boundary on the page. It covers the two lazy remote
          components, the async memos inside `places/location`, and the async
          memo inside `forecast/Forecast`. On first load it shows the
          skeleton until every one of them has an answer. After that it never
          shows the fallback again: changes are held instead.
        */}
        <Loading fallback={<Skeleton />}>
          <div class="grid">
            <LocationPicker />
            <Forecast city={location.selectedCity()} />
          </div>
          <p class={['hold', { active: isPending(location.selectedCity) }]} aria-live="polite">
            {isPending(location.selectedCity) ? 'Holding the previous answer while the new one loads…' : 'Settled'}
          </p>

          {/* Inside the boundary so it settles after both remotes have evaluated. */}
          <GraphStatus />
        </Loading>
      </main>
    </LocationContext>
  );
}

function Skeleton() {
  return (
    <div class="grid" aria-busy="true">
      <div class="panel skeleton" />
      <div class="panel skeleton" />
    </div>
  );
}
