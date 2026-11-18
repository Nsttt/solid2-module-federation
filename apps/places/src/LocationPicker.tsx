import { For, isPending, useContext } from 'solid-js';
import { LocationContext } from './location';
import { bundleHost } from './origin';
import './LocationPicker.css';

export default function LocationPicker() {
  const location = useContext(LocationContext);

  return (
    <section
      class={['window', 'places-window', { holding: isPending(location.cities) }]}
      aria-labelledby="places-title"
    >
      <header class="window-bar">
        <span class="window-close" aria-hidden="true" />
        <h2 id="places-title" class="window-title">
          places — remote
        </h2>
      </header>
      <div class="window-info">
        <span>
          Exposes <code>./LocationPicker</code>
        </span>
        <span class="host">{bundleHost()}</span>
      </div>

      <div class="window-body">
        <label class="field">
          State
          <select class="select" onChange={(e) => location.setState(e.currentTarget.value)}>
            <For each={location.states()}>
              {(state) => <option selected={state === location.selectedState()}>{state}</option>}
            </For>
          </select>
        </label>

        <label class="field">
          City
          <select
            class="select"
            disabled={isPending(location.cities)}
            onChange={(e) => location.setCity(e.currentTarget.value)}
          >
            <For each={location.cities()}>
              {(city) => <option selected={city === location.selectedCity()}>{city}</option>}
            </For>
          </select>
        </label>
      </div>

      <footer class="window-status">
        <span class="tabular">{location.cities().length} places</span>
        <a href="https://countriesnow.space/">Data: CountriesNow</a>
      </footer>
    </section>
  );
}
