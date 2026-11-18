import { createMemo, For, isPending } from 'solid-js';
import { fetchForecast } from './api';
import './Forecast.css';

/**
 * Receives a plain value from the host and turns it into async data.
 *
 * This component has no `<Loading>` of its own. While the first forecast is in
 * flight, the nearest boundary up the tree waits on it, and that boundary
 * lives in the shell, a different bundle built by a different compiler run.
 * After the first answer, a city change keeps the old forecast on screen
 * (the hold) and `isPending` marks it stale.
 */
export default function Forecast(props: { city: string }) {
  const forecast = createMemo(() => fetchForecast(props.city));

  return (
    <section class={['panel', 'forecast', { stale: isPending(forecast) }]}>
      <header class="panel-head">
        <h2>{forecast().city}</h2>
        <span class="origin">forecast · :3002</span>
      </header>

      <ol class="days">
        <For each={forecast().days}>
          {(day) => (
            <li>
              <span class="day">{day.label}</span>
              <span class="sky">{day.sky}</span>
              <span class="temp">
                {day.high}° <small>{day.low}°</small>
              </span>
            </li>
          )}
        </For>
      </ol>
    </section>
  );
}
