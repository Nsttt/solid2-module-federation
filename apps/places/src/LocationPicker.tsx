import { For, isPending, useContext } from 'solid-js';
import { LocationContext } from './location';
import './LocationPicker.css';

export default function LocationPicker() {
  const location = useContext(LocationContext);

  return (
    <section class="panel picker">
      <header class="panel-head">
        <h2>Location</h2>
        <span class="origin">places · :3001</span>
      </header>

      <label>
        State
        <select onChange={(e) => location.setState(e.currentTarget.value)}>
          <For each={location.states()}>
            {(state) => <option selected={state === location.selectedState()}>{state}</option>}
          </For>
        </select>
      </label>

      <label>
        City
        <select
          disabled={isPending(location.cities)}
          onChange={(e) => location.setCity(e.currentTarget.value)}
        >
          <For each={location.cities()}>
            {(city) => <option selected={city === location.selectedCity()}>{city}</option>}
          </For>
        </select>
      </label>
    </section>
  );
}
